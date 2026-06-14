import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postcode: z.string().optional(),
  type: z.enum(["PARTICULIER", "ZAKELIJK"]).default("PARTICULIER"),
  kvk: z.string().optional(),
  btwNummer: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const data = schema.parse(body);

  const customer = await prisma.customer.create({
    data: {
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address || null,
      city: data.city || null,
      postcode: data.postcode || null,
      type: data.type,
      kvk: data.kvk || null,
      btwNummer: data.btwNummer || null,
      notes: data.notes || null,
    },
  });

  await prisma.activity.create({
    data: { userId: session.user?.id, action: "klant_aangemaakt", entity: "Customer", entityId: customer.id },
  });

  return NextResponse.json({ id: customer.id }, { status: 201 });
}
