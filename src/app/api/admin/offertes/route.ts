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
  customerName: z.string().min(1),
  customerEmail: z.string().email().optional().or(z.literal("")),
  customerPhone: z.string().optional(),
  customerAddress: z.string().optional(),
  customerCity: z.string().optional(),
  customerPostcode: z.string().optional(),
  title: z.string().min(1),
  projectType: z.string().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
  validUntil: z.string().optional(),
  lineItems: z.array(lineItemSchema),
  exclBtw: z.number(),
  btw: z.number(),
  inclBtw: z.number(),
});

async function generateNumber() {
  const year = new Date().getFullYear();
  const count = await prisma.quote.count({
    where: { number: { startsWith: `OFF-${year}-` } },
  });
  return `OFF-${year}-${String(count + 1).padStart(3, "0")}`;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const data = schema.parse(body);

  // Klant zoeken of aanmaken
  let customer = data.customerEmail
    ? await prisma.customer.findFirst({ where: { email: data.customerEmail } })
    : null;

  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        name: data.customerName,
        email: data.customerEmail || null,
        phone: data.customerPhone || null,
        address: data.customerAddress || null,
        city: data.customerCity || null,
        postcode: data.customerPostcode || null,
      },
    });
    await prisma.activity.create({
      data: { userId: session.user?.id, action: "klant_aangemaakt", entity: "Customer", entityId: customer.id },
    });
  }

  const number = await generateNumber();

  const quote = await prisma.quote.create({
    data: {
      number,
      customerId: customer.id,
      title: data.title,
      projectType: data.projectType || null,
      description: data.description || null,
      notes: data.notes || null,
      validUntil: data.validUntil ? new Date(data.validUntil) : null,
      lineItems: data.lineItems,
      totalExclBtw: data.exclBtw,
      btwAmount: data.btw,
      totalInclBtw: data.inclBtw,
      status: "NIEUW",
    },
  });

  await prisma.activity.create({
    data: { userId: session.user?.id, action: "offerte_aangemaakt", entity: "Quote", entityId: quote.id },
  });

  return NextResponse.json({ id: quote.id }, { status: 201 });
}
