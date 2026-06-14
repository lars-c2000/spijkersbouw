import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const putSchema = z.object({
  name: z.string().min(1),
  role: z.enum(["ADMIN", "MEDEWERKER"]),
});

const patchSchema = z.object({
  password: z.string().min(8),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const data = putSchema.parse(await req.json());

  // Voorkom dat een admin zijn eigen rol verlaagt
  if (id === session.user?.id && data.role !== "ADMIN") {
    return NextResponse.json({ error: "Je kunt je eigen rol niet verlagen." }, { status: 403 });
  }

  await prisma.user.update({ where: { id }, data });
  return NextResponse.json({ ok: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { password } = patchSchema.parse(await req.json());

  const hashed = await bcrypt.hash(password, 12);
  await prisma.user.update({ where: { id }, data: { password: hashed } });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // Voorkom verwijderen van jezelf
  if (id === session.user?.id) {
    return NextResponse.json({ error: "Je kunt jezelf niet verwijderen." }, { status: 403 });
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
