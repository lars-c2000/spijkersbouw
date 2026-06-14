import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const lineItemSchema = z.object({
  description: z.string(),
  quantity: z.number(),
  unit: z.string(),
  unitPrice: z.number(),
  btwRate: z.number(),
});

const schema = z.object({
  customerId: z.string().min(1),
  quoteId: z.string().nullable().optional(),
  dueDate: z.string(),
  notes: z.string().optional(),
  lineItems: z.array(lineItemSchema),
  exclBtw: z.number(),
  btw: z.number(),
  inclBtw: z.number(),
});

async function generateNumber() {
  const year = new Date().getFullYear();
  const count = await prisma.invoice.count({
    where: { number: { startsWith: `FAC-${year}-` } },
  });
  return `FAC-${year}-${String(count + 1).padStart(3, "0")}`;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const data = schema.parse(body);

  const number = await generateNumber();

  const invoice = await prisma.invoice.create({
    data: {
      number,
      customerId: data.customerId,
      quoteId: data.quoteId ?? null,
      dueDate: new Date(data.dueDate),
      notes: data.notes || null,
      lineItems: data.lineItems,
      totalExclBtw: data.exclBtw,
      btwAmount: data.btw,
      totalInclBtw: data.inclBtw,
      status: "CONCEPT",
    },
  });

  await prisma.activity.create({
    data: { userId: session.user?.id, action: "factuur_aangemaakt", entity: "Invoice", entityId: invoice.id },
  });

  return NextResponse.json({ id: invoice.id }, { status: 201 });
}
