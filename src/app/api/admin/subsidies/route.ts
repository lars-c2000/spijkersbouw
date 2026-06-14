import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { berekenSubsidie, MaatregelType } from "@/lib/subsidieRules";

const maatregelSchema = z.object({
  type: z.enum(Object.values(MaatregelType) as [string, ...string[]]),
  oppervlakte: z.number().positive(),
  uWaarde: z.number().nullable().optional(),
  rdWaarde: z.number().nullable().optional(),
  productMerk: z.string().optional(),
  productModel: z.string().optional(),
});

const schema = z.object({
  customerId: z.string().min(1),
  quoteId: z.string().nullable().optional(),
  projectAdres: z.string().optional(),
  meldcode: z.string().optional(),
  notes: z.string().optional(),
  maatregelen: z.array(maatregelSchema).min(1),
});

async function generateNumber() {
  const year = new Date().getFullYear();
  const count = await prisma.subsidieAanvraag.count({
    where: { number: { startsWith: `SUB-${year}-` } },
  });
  return `SUB-${year}-${String(count + 1).padStart(3, "0")}`;
}

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const aanvragen = await prisma.subsidieAanvraag.findMany({
    orderBy: { createdAt: "desc" },
    include: { customer: { select: { name: true } } },
  });

  return NextResponse.json(aanvragen);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const data = schema.parse(body);

  const berekening = berekenSubsidie(
    data.maatregelen.map((m) => ({ type: m.type as MaatregelType, oppervlakte: m.oppervlakte }))
  );

  const number = await generateNumber();

  const aanvraag = await prisma.$transaction(async (tx) => {
    const a = await tx.subsidieAanvraag.create({
      data: {
        number,
        customerId: data.customerId,
        quoteId: data.quoteId ?? null,
        projectAdres: data.projectAdres || null,
        meldcode: data.meldcode || null,
        notes: data.notes || null,
        totaalSubsidie: berekening.totaalSubsidie,
        combinatieBonus: berekening.combinatieBonus,
        status: "CONCEPT",
      },
    });

    await tx.subsidieMaatregel.createMany({
      data: berekening.maatregelen.map((m, i) => ({
        aanvraagId: a.id,
        type: m.type,
        oppervlakte: m.oppervlakte,
        tarief: m.tarief,
        subsidie: m.subsidie,
        uWaarde: data.maatregelen[i].uWaarde ?? null,
        rdWaarde: data.maatregelen[i].rdWaarde ?? null,
        productMerk: data.maatregelen[i].productMerk || null,
        productModel: data.maatregelen[i].productModel || null,
      })),
    });

    return a;
  });

  await prisma.activity.create({
    data: {
      userId: session.user?.id,
      action: "subsidie_aangemaakt",
      entity: "SubsidieAanvraag",
      entityId: aanvraag.id,
    },
  });

  return NextResponse.json({ id: aanvraag.id }, { status: 201 });
}
