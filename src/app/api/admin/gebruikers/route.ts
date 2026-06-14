import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["ADMIN", "MEDEWERKER"]).default("MEDEWERKER"),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const data = schema.parse(body);

  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) return NextResponse.json({ error: "Dit e-mailadres is al in gebruik." }, { status: 409 });

  const hashed = await bcrypt.hash(data.password, 12);

  const user = await prisma.user.create({
    data: { name: data.name, email: data.email, password: hashed, role: data.role },
  });

  return NextResponse.json({ id: user.id }, { status: 201 });
}
