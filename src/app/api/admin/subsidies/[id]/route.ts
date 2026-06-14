import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { berekenSubsidie, MaatregelType } from "@/lib/subsidieRules";

const patchStatusSchema = z.object({
  status: z.enum(["CONCEPT", "IN_BEHANDELING", "INGEDIEND", "GOEDGEKEURD", "AFGEWEZEN", "UITBETAALD"]),
  meldcode: z.string().optional(),
  indieningsDatum: z.string().nullable().optional(),
  beschikkingsDatum: z.string().nullable().optional(),
  notes: z.string().optional(),
});

const maatregelSchema = z.object({
  type: z.enum(Object.values(MaatregelType) as [string, ...string[]]),
  oppervlakte: z.number().positive(),
  uWaarde: z.number().nullable().optional(),
  rdWaarde: z.number().nullable().optional(),
  productMerk: z.string().optional(),
  productModel: z.string().optional(),
});

const putSchema = z.object({
  projectAdres: z.string().optional(),
  meldcode: z.string().optional(),
  notes: z.string().optional(),
  maatregelen: z.array(maatregelSchema).min(1),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  // Check of het een status update of een maatregel-update is
  if ("status" in body) {
    const data = patchStatusSchema.parse(body);
    await prisma.subsidieAanvraag.update({
      where: { id },
      data: {
        status: data.status,
        meldcode: data.meldcode,
        indieningsDatum: data.indieningsDatum ? new Date(data.indieningsDatum) : undefined,
        beschikkingsDatum: data.beschikkingsDatum ? new Date(data.beschikkingsDatum) : undefined,
        notes: data.notes,
      },
    });
    return NextResponse.json({ ok: true });
  }

  // Maatregelen update
  const data = putSchema.parse(body);
  const berekening = berekenSubsidie(
    data.maatregelen.map((m) => ({ type: m.type as MaatregelType, oppervlakte: m.oppervlakte }))
  );

  await prisma.$transaction([
    prisma.subsidieAanvraag.update({
      where: { id },
      data: {
        projectAdres: data.projectAdres || null,
        meldcode: data.meldcode || null,
        notes: data.notes || null,
        totaalSubsidie: berekening.totaalSubsidie,
        combinatieBonus: berekening.combinatieBonus,
      },
    }),
    prisma.subsidieMaatregel.deleteMany({ where: { aanvraagId: id } }),
    prisma.subsidieMaatregel.createMany({
      data: berekening.maatregelen.map((m, i) => ({
        aanvraagId: id,
        type: m.type,
        oppervlakte: m.oppervlakte,
        tarief: m.tarief,
        subsidie: m.subsidie,
        uWaarde: data.maatregelen[i].uWaarde ?? null,
        rdWaarde: data.maatregelen[i].rdWaarde ?? null,
        productMerk: data.maatregelen[i].productMerk || null,
        productModel: data.maatregelen[i].productModel || null,
      })),
    }),
  ]);

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.subsidieAanvraag.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
