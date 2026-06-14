// Plain const enum — safe for both client and server bundles.
// Must match the Prisma schema MaatregelType enum values exactly.
export const MaatregelType = {
  TRIPLE_GLAS:       "TRIPLE_GLAS",
  HR_PLUS_PLUS_GLAS: "HR_PLUS_PLUS_GLAS",
  SPOUWMUURISOLATIE: "SPOUWMUURISOLATIE",
  DAKISOLATIE:       "DAKISOLATIE",
  VLOERISOLATIE:     "VLOERISOLATIE",
  GEVELISOLATIE:     "GEVELISOLATIE",
} as const;

export type MaatregelType = typeof MaatregelType[keyof typeof MaatregelType];

// ─── Tarieven ─────────────────────────────────────────────────────────────────

export const TARIEF_NORMAAL: Record<MaatregelType, number> = {
  TRIPLE_GLAS:       111.00,
  HR_PLUS_PLUS_GLAS:  25.00,
  SPOUWMUURISOLATIE:   5.20,
  DAKISOLATIE:        16.25,
  VLOERISOLATIE:       5.50,
  GEVELISOLATIE:      20.50,
};

// Bij 2+ maatregelen verdubbelen alle tarieven
export const TARIEF_COMBINATIE: Record<MaatregelType, number> = {
  TRIPLE_GLAS:       222.00,
  HR_PLUS_PLUS_GLAS:  50.00,
  SPOUWMUURISOLATIE:  10.40,
  DAKISOLATIE:        32.50,
  VLOERISOLATIE:      11.00,
  GEVELISOLATIE:      41.00,
};

export const MAATREGEL_LABELS: Record<MaatregelType, string> = {
  TRIPLE_GLAS:       "Triple glas (Uw ≤ 0,7)",
  HR_PLUS_PLUS_GLAS: "HR++ glas (Uw ≤ 1,2)",
  SPOUWMUURISOLATIE: "Spouwmuurisolatie",
  DAKISOLATIE:       "Dakisolatie",
  VLOERISOLATIE:     "Vloerisolatie",
  GEVELISOLATIE:     "Gevelisolatie",
};

export const MAATREGEL_EENHEID: Record<MaatregelType, string> = {
  TRIPLE_GLAS:       "m² glas",
  HR_PLUS_PLUS_GLAS: "m² glas",
  SPOUWMUURISOLATIE: "m² spouwmuur",
  DAKISOLATIE:       "m² dak",
  VLOERISOLATIE:     "m² vloer",
  GEVELISOLATIE:     "m² gevel",
};

// ─── Technische eisen ─────────────────────────────────────────────────────────

export interface TechEisen {
  uWaardeMax?: number;
  rdWaardeMin?: number;
  minOppervlakte?: number;
  maxOppervlakte?: number;
}

export const TECH_EISEN: Record<MaatregelType, TechEisen> = {
  TRIPLE_GLAS:       { uWaardeMax: 0.7,  minOppervlakte: 3, maxOppervlakte: 45 },
  HR_PLUS_PLUS_GLAS: { uWaardeMax: 1.2,  minOppervlakte: 3 },
  SPOUWMUURISOLATIE: { rdWaardeMin: 1.1 },
  DAKISOLATIE:       { rdWaardeMin: 3.5 },
  VLOERISOLATIE:     { rdWaardeMin: 3.5 },
  GEVELISOLATIE:     { rdWaardeMin: 3.5 },
};

// ─── Berekening ───────────────────────────────────────────────────────────────

export interface MaatregelInput {
  type: MaatregelType;
  oppervlakte: number;
}

export interface BerekeningMaatregel {
  type: MaatregelType;
  oppervlakte: number;
  tarief: number;
  subsidie: number;
}

export interface BerekeningResultaat {
  combinatieBonus: boolean;
  maatregelen: BerekeningMaatregel[];
  totaalSubsidie: number;
}

export function berekenSubsidie(inputs: MaatregelInput[]): BerekeningResultaat {
  const combinatieBonus = inputs.length >= 2;
  const tarieven = combinatieBonus ? TARIEF_COMBINATIE : TARIEF_NORMAAL;

  const maatregelen = inputs.map((m) => {
    const tarief = tarieven[m.type];
    const subsidie = Math.round(tarief * m.oppervlakte * 100) / 100;
    return { type: m.type, oppervlakte: m.oppervlakte, tarief, subsidie };
  });

  const totaalSubsidie = Math.round(maatregelen.reduce((s, m) => s + m.subsidie, 0) * 100) / 100;

  return { combinatieBonus, maatregelen, totaalSubsidie };
}

// ─── Document checklist ───────────────────────────────────────────────────────

export interface DocumentItem {
  id: string;
  label: string;
  required: boolean;
  toelichting?: string;
}

export function getDocumentChecklist(types: MaatregelType[]): DocumentItem[] {
  const docs: DocumentItem[] = [
    {
      id: "factuur",
      label: "Factuur van de aannemer",
      required: true,
      toelichting: "Factuur moet de meldcode van RVO bevatten. Vraag de meldcode aan vóór aanvang werkzaamheden.",
    },
    {
      id: "aannemersverklaring",
      label: "Aannemersverklaring (ingevuld en ondertekend)",
      required: true,
      toelichting: "Te genereren via het admin-systeem. Spijkersbouw vult in en ondertekent.",
    },
    {
      id: "fotos_voor",
      label: "Foto's vóór uitvoering",
      required: true,
    },
    {
      id: "fotos_na",
      label: "Foto's ná uitvoering",
      required: true,
    },
    {
      id: "oppervlakteberekening",
      label: "Oppervlakteberekening (m² per maatregel)",
      required: true,
      toelichting: "Volgt uit de offerte/factuur, gesplitst per maatregel.",
    },
    {
      id: "betaalbewijs",
      label: "Betaalbewijs (bankafschrift)",
      required: true,
    },
  ];

  const heeftGlas = types.some((t) => t === "TRIPLE_GLAS" || t === "HR_PLUS_PLUS_GLAS");
  if (heeftGlas) {
    docs.push({
      id: "productblad_glas",
      label: "Productblad glas (met U-waarde ≤ drempelwaarde)",
      required: true,
      toelichting: "CE-markering en datasheet waarop U-waarde is vermeld.",
    });
  }

  const heeftIsolatie = types.some((t) =>
    ["SPOUWMUURISOLATIE", "DAKISOLATIE", "VLOERISOLATIE", "GEVELISOLATIE"].includes(t)
  );
  if (heeftIsolatie) {
    docs.push({
      id: "productblad_isolatie",
      label: "Productblad isolatiemateriaal (met Rd-waarde)",
      required: true,
      toelichting: "Technisch datasheet waarop Rd-waarde is vermeld.",
    });
  }

  if (types.includes("SPOUWMUURISOLATIE")) {
    docs.push({
      id: "boorgatrapport",
      label: "Boorgatrapport spouwmuurisolatie",
      required: false,
      toelichting: "Aanbevolen als bewijs van correcte uitvoering.",
    });
  }

  return docs;
}

// ─── Validatie ────────────────────────────────────────────────────────────────

export interface ValidatieResultaat {
  geldig: boolean;
  fouten: string[];
}

export function validateTechSpecs(
  type: MaatregelType,
  oppervlakte: number,
  uWaarde?: number | null,
  rdWaarde?: number | null
): ValidatieResultaat {
  const eisen = TECH_EISEN[type];
  const fouten: string[] = [];
  const label = MAATREGEL_LABELS[type];

  if (eisen.minOppervlakte !== undefined && oppervlakte < eisen.minOppervlakte) {
    fouten.push(`Minimale oppervlakte voor ${label} is ${eisen.minOppervlakte} m²`);
  }
  if (eisen.maxOppervlakte !== undefined && oppervlakte > eisen.maxOppervlakte) {
    fouten.push(`Maximale oppervlakte voor ${label} is ${eisen.maxOppervlakte} m²`);
  }
  if (eisen.uWaardeMax !== undefined) {
    if (uWaarde == null) {
      fouten.push(`U-waarde verplicht voor ${label}`);
    } else if (uWaarde > eisen.uWaardeMax) {
      fouten.push(`U-waarde ${uWaarde} overschrijdt maximum van ${eisen.uWaardeMax} W/m²K voor ${label}`);
    }
  }
  if (eisen.rdWaardeMin !== undefined) {
    if (rdWaarde == null) {
      fouten.push(`Rd-waarde verplicht voor ${label}`);
    } else if (rdWaarde < eisen.rdWaardeMin) {
      fouten.push(`Rd-waarde ${rdWaarde} lager dan minimum van ${eisen.rdWaardeMin} m²K/W voor ${label}`);
    }
  }

  return { geldig: fouten.length === 0, fouten };
}

// ─── Optimalisatietips ────────────────────────────────────────────────────────

export interface SubsidieHint {
  type: MaatregelType;
  label: string;
  extraSubsidie: number;
  toelichting: string;
}

export function getOptimalisatieHints(
  bestaandeTypes: MaatregelType[],
  kandidaatM2: Partial<Record<MaatregelType, number>>
): SubsidieHint[] {
  const alTypes = Object.values(MaatregelType) as MaatregelType[];
  const ontbrekend = alTypes.filter((t) => !bestaandeTypes.includes(t) && kandidaatM2[t]);

  const huidigResultaat = berekenSubsidie(
    bestaandeTypes.map((t) => ({ type: t, oppervlakte: kandidaatM2[t] ?? 20 }))
  );

  return ontbrekend
    .map((t) => {
      const m2 = kandidaatM2[t]!;
      const metExtra = berekenSubsidie([
        ...bestaandeTypes.map((bt) => ({ type: bt, oppervlakte: kandidaatM2[bt] ?? 20 })),
        { type: t, oppervlakte: m2 },
      ]);
      const extra = Math.round((metExtra.totaalSubsidie - huidigResultaat.totaalSubsidie) * 100) / 100;
      const wordtCombi = !huidigResultaat.combinatieBonus && metExtra.combinatieBonus;

      return {
        type: t,
        label: MAATREGEL_LABELS[t],
        extraSubsidie: extra,
        toelichting: wordtCombi
          ? `Combinatiebonus actief: alle tarieven verdubbelen (+€${extra.toFixed(0)} totaal)`
          : `+€${extra.toFixed(0)} extra subsidie`,
      };
    })
    .filter((h) => h.extraSubsidie > 0)
    .sort((a, b) => b.extraSubsidie - a.extraSubsidie);
}

// ─── Formatting helpers ───────────────────────────────────────────────────────

export function fmtSubsidie(bedrag: number): string {
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(bedrag);
}
