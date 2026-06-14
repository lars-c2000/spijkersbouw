import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, "Slug mag alleen kleine letters, cijfers en koppeltekens bevatten"),
  excerpt: z.string().optional(),
  content: z.string().min(1),
  category: z.string().default("Nieuws"),
  published: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const data = parsed.data;

  const existing = await prisma.blogPost.findUnique({ where: { slug: data.slug } });
  if (existing) return NextResponse.json({ error: "Deze slug is al in gebruik." }, { status: 409 });

  const post = await prisma.blogPost.create({
    data: {
      ...data,
      publishedAt: data.published ? new Date() : null,
    },
  });

  return NextResponse.json({ id: post.id }, { status: 201 });
}
