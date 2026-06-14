import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { renderToBuffer } from "@react-pdf/renderer";
import { AannemersverklaringDocument } from "@/lib/aannemersverklaringPdf";
import { MAATREGEL_LABELS } from "@/lib/subsidieRules";
import React from "react";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const aanvraag = await prisma.subsidieAanvraag.findUnique({
    where: { id },
    include: {
      customer: { select: { name: true, address: true, postcode: true, city: true } },
      maatregelen: true,
    },
  });

  if (!aanvraag) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });

  const data = {
    aanvraagNummer: aanvraag.number,
    meldcode: aanvraag.meldcode,
    uitvoeringsDatum: aanvraag.updatedAt,
    combinatieBonus: aanvraag.combinatieBonus,
    totaalSubsidie: aanvraag.totaalSubsidie,
    customer: aanvraag.customer,
    projectAdres: aanvraag.projectAdres,
    maatregelen: aanvraag.maatregelen.map((m) => ({
      label: MAATREGEL_LABELS[m.type],
      oppervlakte: m.oppervlakte,
      uWaarde: m.uWaarde,
      rdWaarde: m.rdWaarde,
      productMerk: m.productMerk,
      productModel: m.productModel,
      tarief: m.tarief,
      subsidie: m.subsidie,
    })),
  };

  const buffer = await renderToBuffer(
    React.createElement(AannemersverklaringDocument, { data }) as never
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="aannemersverklaring-${aanvraag.number}.pdf"`,
    },
  });
}
