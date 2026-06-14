export type CmsFieldType = "text" | "textarea" | "html";

export type CmsField = {
  key: string;
  label: string;
  type: CmsFieldType;
  placeholder?: string;
};

export type CmsPageConfig = {
  title: string;
  description: string;
  fields: CmsField[];
};

export const CMS_PAGES: Record<string, CmsPageConfig> = {
  home: {
    title: "Homepagina",
    description: "Hero sectie, USPs en CTA teksten.",
    fields: [
      { key: "hero_title", label: "Hero titel", type: "text", placeholder: "Uw vakkundige timmerman in Tilburg" },
      { key: "hero_subtitle", label: "Hero subtitel", type: "textarea", placeholder: "Wij bouwen, renoveren en verbouwen..." },
      { key: "hero_cta_primary", label: "CTA knop (primair)", type: "text", placeholder: "Offerte aanvragen" },
      { key: "usp_1_title", label: "USP 1 — Titel", type: "text", placeholder: "30+ jaar ervaring" },
      { key: "usp_1_text", label: "USP 1 — Tekst", type: "textarea", placeholder: "Meer dan drie decennia..." },
      { key: "usp_2_title", label: "USP 2 — Titel", type: "text", placeholder: "Kwaliteitsgarantie" },
      { key: "usp_2_text", label: "USP 2 — Tekst", type: "textarea", placeholder: "Al ons werk wordt..." },
      { key: "usp_3_title", label: "USP 3 — Titel", type: "text", placeholder: "Persoonlijke aanpak" },
      { key: "usp_3_text", label: "USP 3 — Tekst", type: "textarea", placeholder: "Ieder project begint..." },
    ],
  },
  "over-ons": {
    title: "Over ons",
    description: "Bedrijfsverhaal, team en waarden.",
    fields: [
      { key: "intro_title", label: "Intro titel", type: "text", placeholder: "Wie zijn wij?" },
      { key: "intro_tekst", label: "Intro tekst", type: "textarea", placeholder: "Spijkersbouw is opgericht in..." },
      { key: "geschiedenis_tekst", label: "Onze geschiedenis", type: "textarea", placeholder: "Alles begon in..." },
      { key: "waarde_1_titel", label: "Waarde 1 — Titel", type: "text", placeholder: "Kwaliteit" },
      { key: "waarde_1_tekst", label: "Waarde 1 — Tekst", type: "textarea", placeholder: "Wij leveren..." },
      { key: "waarde_2_titel", label: "Waarde 2 — Titel", type: "text", placeholder: "Betrouwbaarheid" },
      { key: "waarde_2_tekst", label: "Waarde 2 — Tekst", type: "textarea", placeholder: "U kunt op ons rekenen..." },
      { key: "waarde_3_titel", label: "Waarde 3 — Titel", type: "text", placeholder: "Klantgericht" },
      { key: "waarde_3_tekst", label: "Waarde 3 — Tekst", type: "textarea", placeholder: "Uw wensen staan centraal..." },
      { key: "team_intro", label: "Team introductie", type: "textarea", placeholder: "Maak kennis met ons team..." },
      { key: "eigenaar_naam", label: "Eigenaar naam", type: "text", placeholder: "Lars" },
      { key: "eigenaar_functie", label: "Eigenaar functie", type: "text", placeholder: "Eigenaar & Timmerman" },
      { key: "eigenaar_bio", label: "Eigenaar bio", type: "textarea", placeholder: "Lars startte Spijkersbouw..." },
    ],
  },
  diensten: {
    title: "Diensten",
    description: "Omschrijvingen per dienst.",
    fields: [
      { key: "intro_tekst", label: "Pagina intro", type: "textarea", placeholder: "Wij bieden een breed scala..." },
      { key: "nieuwbouw_tekst", label: "Nieuwbouw — omschrijving", type: "textarea", placeholder: "Van fundering tot dak..." },
      { key: "renovatie_tekst", label: "Renovatie — omschrijving", type: "textarea", placeholder: "Wij geven uw woning..." },
      { key: "aanbouw_tekst", label: "Aanbouw — omschrijving", type: "textarea", placeholder: "Meer ruimte nodig?..." },
      { key: "timmerwerk_tekst", label: "Timmerwerk — omschrijving", type: "textarea", placeholder: "Vakkundig maatwerk..." },
      { key: "dakkapellen_tekst", label: "Dakkapellen — omschrijving", type: "textarea", placeholder: "Een dakkapel geeft..." },
      { key: "maatwerk_tekst", label: "Maatwerk meubels — omschrijving", type: "textarea", placeholder: "Uniek en op maat gemaakt..." },
    ],
  },
  contact: {
    title: "Contact",
    description: "Contactgegevens die op de website worden getoond.",
    fields: [
      { key: "adres", label: "Adres", type: "text", placeholder: "Straatnaam 1, 5000 AA Tilburg" },
      { key: "telefoon", label: "Telefoonnummer", type: "text", placeholder: "06-00000000" },
      { key: "email", label: "E-mailadres", type: "text", placeholder: "info@spijkersbouw.nl" },
      { key: "kvk", label: "KvK-nummer", type: "text", placeholder: "12345678" },
      { key: "btw", label: "BTW-nummer", type: "text", placeholder: "NL123456789B01" },
      { key: "openingstijden", label: "Openingstijden", type: "textarea", placeholder: "Ma–Vr: 08:00–17:00\nZa: Op afspraak\nZo: Gesloten" },
    ],
  },
};
