import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { QuoteStatus } from "@/generated/prisma/client";

const patchSchema = z.object({
  status: z.nativeEnum(QuoteStatus).optional(),
  notes: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const data = patchSchema.parse(body);

  const quote = await prisma.quote.update({
    where: { id },
    data: {
      ...data,
      ...(data.status === "VERSTUURD" ? { sentAt: new Date() } : {}),
    },
  });

  if (data.status) {
    await prisma.activity.create({
      data: {
        userId: session.user?.id,
        action: `offerte_${data.status.toLowerCase()}`,
        entity: "Quote",
        entityId: id,
      },
    });
  }

  return NextResponse.json(quote);
}
