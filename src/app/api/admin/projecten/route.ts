import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.string(),
  year: z.number().int().min(2000).max(2099),
  published: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const data = schema.parse(body);

  const project = await prisma.project.create({
    data: { ...data, description: data.description || null },
  });

  return NextResponse.json({ id: project.id }, { status: 201 });
}
