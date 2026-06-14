import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().optional(),
  projectType: z.string().optional(),
  description: z.string().optional(),
});

async function generateQuoteNumber() {
  const year = new Date().getFullYear();
  const count = await prisma.quote.count({
    where: { number: { startsWith: `OFF-${year}-` } },
  });
  return `OFF-${year}-${String(count + 1).padStart(3, "0")}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    // Zoek bestaande klant op e-mail, anders aanmaken
    let customer = await prisma.customer.findFirst({
      where: { email: data.email },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          type: "PARTICULIER",
        },
      });

      await prisma.activity.create({
        data: { action: "klant_aangemaakt", entity: "Customer", entityId: customer.id },
      });
    }

    const number = await generateQuoteNumber();

    const quote = await prisma.quote.create({
      data: {
        number,
        customerId: customer.id,
        status: "NIEUW",
        title: data.projectType ?? "Offerte aanvraag website",
        description: data.description,
        projectType: data.projectType,
      },
    });

    await prisma.activity.create({
      data: { action: "offerte_aangemaakt", entity: "Quote", entityId: quote.id },
    });

    return NextResponse.json({ success: true, quoteId: quote.id }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Er is een fout opgetreden." }, { status: 500 });
  }
}
