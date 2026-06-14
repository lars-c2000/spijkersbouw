import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { renderToBuffer } from "@react-pdf/renderer";
import { FactuurDocument } from "@/lib/factuurPdf";
import React from "react";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const factuur = await prisma.invoice.findUnique({
    where: { id },
    include: { customer: true },
  });

  if (!factuur) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });

  const lineItems = Array.isArray(factuur.lineItems)
    ? (factuur.lineItems as {
        description: string;
        quantity: number;
        unit: string;
        unitPrice: number;
        btwRate: number;
      }[])
    : [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = React.createElement(FactuurDocument as any, {
    data: {
      number: factuur.number,
      invoiceDate: factuur.invoiceDate,
      dueDate: factuur.dueDate,
      totalExclBtw: factuur.totalExclBtw,
      btwAmount: factuur.btwAmount,
      totalInclBtw: factuur.totalInclBtw,
      lineItems,
      notes: factuur.notes,
      customer: factuur.customer,
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buffer = await renderToBuffer(element as any);
  const uint8 = new Uint8Array(buffer);

  return new NextResponse(uint8, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${factuur.number}.pdf"`,
    },
  });
}
