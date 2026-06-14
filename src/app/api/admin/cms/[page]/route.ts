import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CMS_PAGES } from "@/lib/cmsFields";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ page: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { page } = await params;
  if (!CMS_PAGES[page]) return NextResponse.json({ error: "Onbekende pagina" }, { status: 404 });

  const { fields } = await req.json() as { fields: Record<string, string> };

  // Upsert elk veld
  await Promise.all(
    Object.entries(fields).map(([key, value]) =>
      prisma.cmsBlock.upsert({
        where: { page_key: { page, key } },
        update: { value },
        create: { page, key, value, type: "text" },
      })
    )
  );

  return NextResponse.json({ ok: true });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ page: string }> }
) {
  const { page } = await params;
  const blocks = await prisma.cmsBlock.findMany({ where: { page } });
  return NextResponse.json(Object.fromEntries(blocks.map((b) => [b.key, b.value])));
}
