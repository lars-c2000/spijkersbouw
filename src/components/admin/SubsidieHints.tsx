import Link from "next/link";
import {
  MaatregelType,
  getOptimalisatieHints,
  fmtSubsidie,
  MAATREGEL_LABELS,
} from "@/lib/subsidieRules";
import { SubsidieStatus } from "@/generated/prisma/client";

type LineItem = {
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  btwRate: number;
};

type BestaandeAanvraag = {
  id: string;
  number: string;
  totaalSubsidie: number;
  status: SubsidieStatus;
} | null;

// Heuristische m²-extractie uit offerteregels
function extractM2FromLineItems(lineItems: LineItem[]): Partial<Record<MaatregelType, number>> {
  const result: Partial<Record<MaatregelType, number>> = {};

  const keywordMap: [RegExp, MaatregelType][] = [
    [/triple\s*glas|driedubbel\s*glas|hr\+\+\+/i, MaatregelType.TRIPLE_GLAS],
    [/hr\+\+\s*glas|dubbelglas|isolatieglas/i, MaatregelType.HR_PLUS_PLUS_GLAS],
    [/spouwmuur/i, MaatregelType.SPOUWMUURISOLATIE],
    [/dakisolat|dakvloer|plat\s*dak/i, MaatregelType.DAKISOLATIE],
    [/vloerisolat/i, MaatregelType.VLOERISOLATIE],
    [/gevelisolat|buiten\s*isolat/i, MaatregelType.GEVELISOLATIE],
  ];

  for (const item of lineItems) {
    if (item.unit !== "m²" && item.unit !== "m2") continue;
    for (const [regex, type] of keywordMap) {
      if (regex.test(item.description)) {
        result[type] = (result[type] ?? 0) + item.quantity;
      }
    }
  }

  return result;
}

const statusLabel: Record<SubsidieStatus, string> = {
  CONCEPT: "Concept",
  IN_BEHANDELING: "In behandeling",
  INGEDIEND: "Ingediend",
  GOEDGEKEURD: "Goedgekeurd",
  AFGEWEZEN: "Afgewezen",
  UITBETAALD: "Uitbetaald",
};

export default function SubsidieHints({
  quoteId,
  bestaandeAanvraag,
  lineItems,
}: {
  quoteId: string;
  bestaandeAanvraag: BestaandeAanvraag;
  lineItems: LineItem[];
}) {
  // Als er al een aanvraag is, toon die
  if (bestaandeAanvraag) {
    return (
      <div className="bg-white rounded-xl border border-green-200 p-6">
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="font-semibold text-gray-900">Subsidieaanvraag</h2>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Nummer</span>
            <span className="font-mono text-gray-700">{bestaandeAanvraag.number}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Status</span>
            <span className="text-gray-700">{statusLabel[bestaandeAanvraag.status]}</span>
          </div>
          <div className="flex justify-between border-t border-gray-100 pt-2">
            <span className="font-medium text-gray-700">Subsidie</span>
            <span className="font-bold text-green-700">{fmtSubsidie(bestaandeAanvraag.totaalSubsidie)}</span>
          </div>
        </div>
        <Link
          href={`/admin/subsidies/${bestaandeAanvraag.id}`}
          className="mt-4 block text-center text-sm text-orange-500 hover:underline font-medium"
        >
          Aanvraag bekijken →
        </Link>
      </div>
    );
  }

  // Analyseer offerteregels op subsidie-relevante m²
  const kandidaatM2 = extractM2FromLineItems(lineItems);

  // Voeg standaard hints toe als er geen m² gevonden zijn
  const heeftData = Object.keys(kandidaatM2).length > 0;
  const m2VoorHints = heeftData
    ? kandidaatM2
    : {
        [MaatregelType.DAKISOLATIE]: 50,
        [MaatregelType.VLOERISOLATIE]: 40,
        [MaatregelType.TRIPLE_GLAS]: 12,
        [MaatregelType.HR_PLUS_PLUS_GLAS]: 12,
        [MaatregelType.SPOUWMUURISOLATIE]: 60,
        [MaatregelType.GEVELISOLATIE]: 40,
      };

  const hints = getOptimalisatieHints([], m2VoorHints);

  return (
    <div className="bg-amber-50 rounded-xl border border-amber-200 p-6">
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="font-semibold text-gray-900">ISDE Subsidie mogelijk</h2>
      </div>

      {!heeftData && (
        <p className="text-xs text-gray-500 mb-3">
          Richtbedragen op basis van gemiddelde oppervlaktes.
        </p>
      )}

      <div className="space-y-2 mb-4">
        {hints.slice(0, 4).map((hint) => (
          <div key={hint.type} className="flex items-center justify-between text-sm">
            <span className="text-gray-700">{MAATREGEL_LABELS[hint.type]}</span>
            <span className="font-semibold text-green-700">{fmtSubsidie(hint.extraSubsidie)}</span>
          </div>
        ))}
      </div>

      <p className="text-xs text-amber-700 mb-4">
        Bij 2+ maatregelen verdubbelen alle tarieven (combinatiebonus).
      </p>

      <Link
        href={`/admin/subsidies/nieuw?quoteId=${quoteId}`}
        className="block text-center bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
      >
        Subsidieaanvraag aanmaken
      </Link>
    </div>
  );
}
