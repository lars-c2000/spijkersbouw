import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const BEDRIJF = {
  naam: "Spijkersbouw",
  adres: "Straatnaam 1",
  postcode: "5000 AA",
  stad: "Tilburg",
  telefoon: "06-00000000",
  email: "info@spijkersbouw.nl",
  kvk: "12345678",
  btw: "NL123456789B01",
};

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    paddingTop: 48,
    paddingBottom: 56,
    paddingHorizontal: 48,
    color: "#111827",
  },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 32 },
  logo: { fontSize: 20, fontFamily: "Helvetica-Bold", color: "#e65100" },
  bedrijfInfo: { fontSize: 8, color: "#6b7280", textAlign: "right", lineHeight: 1.5 },
  title: { fontSize: 16, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  subtitle: { fontSize: 9, color: "#6b7280", marginBottom: 24 },
  divider: { borderBottomWidth: 1, borderBottomColor: "#e5e7eb", marginVertical: 14 },
  sectionTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  row2col: { flexDirection: "row", gap: 24, marginBottom: 20 },
  col: { flex: 1 },
  label: { fontSize: 8, color: "#6b7280", marginBottom: 2 },
  value: { fontSize: 9, fontFamily: "Helvetica-Bold" },
  valueNormal: { fontSize: 9 },
  // Maatregel tabel
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f9fafb",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 2,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  bold: { fontFamily: "Helvetica-Bold" },
  colMaatregel: { flex: 3 },
  colM2: { flex: 1, textAlign: "right" },
  colSpec: { flex: 2 },
  colProduct: { flex: 2 },
  // Subsidiebox
  subsidieBox: {
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#86efac",
    borderRadius: 4,
    padding: 12,
    marginTop: 12,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  subsidieLabel: { fontSize: 9, color: "#15803d" },
  subsidieBedrag: { fontSize: 14, fontFamily: "Helvetica-Bold", color: "#15803d" },
  // Verklaring
  verklaringBox: {
    backgroundColor: "#f9fafb",
    borderRadius: 4,
    padding: 12,
    marginBottom: 20,
    lineHeight: 1.6,
  },
  // Handtekening
  signatureRow: { flexDirection: "row", gap: 24, marginTop: 8 },
  signatureCol: { flex: 1 },
  signatureLine: { borderBottomWidth: 1, borderBottomColor: "#374151", marginTop: 24, marginBottom: 4 },
  footer: {
    position: "absolute",
    bottom: 28,
    left: 48,
    right: 48,
    fontSize: 7,
    color: "#9ca3af",
    textAlign: "center",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 6,
  },
});

function fmtDate(d: Date) {
  return d.toLocaleDateString("nl-NL", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export type AannemersverklaringData = {
  aanvraagNummer: string;
  meldcode: string | null;
  uitvoeringsDatum: Date;
  combinatieBonus: boolean;
  totaalSubsidie: number;
  customer: {
    name: string;
    address: string | null;
    postcode: string | null;
    city: string | null;
  };
  projectAdres: string | null;
  maatregelen: {
    label: string;
    oppervlakte: number;
    uWaarde?: number | null;
    rdWaarde?: number | null;
    productMerk?: string | null;
    productModel?: string | null;
    tarief: number;
    subsidie: number;
  }[];
};

function fmt(n: number) {
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(n);
}

export function AannemersverklaringDocument({ data }: { data: AannemersverklaringData }) {
  return (
    <Document title={`Aannemersverklaring ${data.aanvraagNummer}`}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>{BEDRIJF.naam}</Text>
            <Text style={{ fontSize: 8, color: "#6b7280", marginTop: 4, lineHeight: 1.5 }}>
              {BEDRIJF.adres}{"\n"}
              {BEDRIJF.postcode} {BEDRIJF.stad}{"\n"}
              {BEDRIJF.email}
            </Text>
          </View>
          <View>
            <Text style={styles.bedrijfInfo}>
              KvK: {BEDRIJF.kvk}{"\n"}
              BTW: {BEDRIJF.btw}
            </Text>
          </View>
        </View>

        {/* Titel */}
        <Text style={styles.title}>AANNEMERSVERKLARING ISDE</Text>
        <Text style={styles.subtitle}>
          Investeringssubsidie Duurzame Energie en Energiebesparing (ISDE) — RVO.nl
        </Text>
        <View style={styles.divider} />

        {/* Referentie + Aanvrager */}
        <View style={styles.row2col}>
          <View style={styles.col}>
            <Text style={styles.sectionTitle}>Dossiernummer</Text>
            <Text style={styles.value}>{data.aanvraagNummer}</Text>
            {data.meldcode && (
              <>
                <Text style={[styles.label, { marginTop: 8 }]}>Meldcode RVO</Text>
                <Text style={styles.value}>{data.meldcode}</Text>
              </>
            )}
          </View>
          <View style={styles.col}>
            <Text style={styles.sectionTitle}>Aanvrager / Opdrachtgever</Text>
            <Text style={styles.value}>{data.customer.name}</Text>
            {data.customer.address && <Text style={styles.valueNormal}>{data.customer.address}</Text>}
            {data.customer.city && (
              <Text style={styles.valueNormal}>{data.customer.postcode} {data.customer.city}</Text>
            )}
          </View>
          <View style={styles.col}>
            <Text style={styles.sectionTitle}>Projectadres</Text>
            <Text style={styles.valueNormal}>
              {data.projectAdres || `${data.customer.address ?? ""}\n${data.customer.postcode ?? ""} ${data.customer.city ?? ""}`}
            </Text>
            <Text style={[styles.label, { marginTop: 8 }]}>Uitvoeringsdatum</Text>
            <Text style={styles.valueNormal}>{fmtDate(data.uitvoeringsDatum)}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Maatregelen tabel */}
        <Text style={[styles.sectionTitle, { marginBottom: 8 }]}>Uitgevoerde maatregelen</Text>
        <View style={styles.tableHeader}>
          <Text style={[styles.colMaatregel, styles.bold]}>Maatregel</Text>
          <Text style={[styles.colM2, styles.bold]}>m²</Text>
          <Text style={[styles.colSpec, styles.bold]}>Technische waarde</Text>
          <Text style={[styles.colProduct, styles.bold]}>Product / merk</Text>
          <Text style={[styles.colM2, styles.bold, { textAlign: "right" }]}>Subsidie</Text>
        </View>
        {data.maatregelen.map((m, i) => {
          const spec = m.uWaarde != null
            ? `Uw = ${m.uWaarde} W/m²K`
            : m.rdWaarde != null
            ? `Rd = ${m.rdWaarde} m²K/W`
            : "—";
          const product = [m.productMerk, m.productModel].filter(Boolean).join(" ") || "—";
          return (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.colMaatregel}>{m.label}</Text>
              <Text style={styles.colM2}>{m.oppervlakte}</Text>
              <Text style={styles.colSpec}>{spec}</Text>
              <Text style={styles.colProduct}>{product}</Text>
              <Text style={[styles.colM2, { textAlign: "right" }]}>{fmt(m.subsidie)}</Text>
            </View>
          );
        })}

        {/* Subsidiebox */}
        <View style={styles.subsidieBox}>
          <View>
            <Text style={styles.subsidieLabel}>Berekend subsidiebedrag (ISDE 2026)</Text>
            {data.combinatieBonus && (
              <Text style={[styles.subsidieLabel, { fontSize: 8 }]}>
                Combinatiebonus actief — tarieven verdubbeld
              </Text>
            )}
          </View>
          <Text style={styles.subsidieBedrag}>{fmt(data.totaalSubsidie)}</Text>
        </View>

        <View style={styles.divider} />

        {/* Verklaring tekst */}
        <Text style={[styles.sectionTitle, { marginBottom: 6 }]}>Verklaring aannemer</Text>
        <View style={styles.verklaringBox}>
          <Text style={{ lineHeight: 1.6 }}>
            Ondergetekende, handelend namens {BEDRIJF.naam} (KvK {BEDRIJF.kvk}), verklaart hierbij dat:{"\n\n"}
            1. De hierboven vermelde energiebesparende maatregelen zijn uitgevoerd op het opgegeven projectadres;{"\n"}
            2. De werkzaamheden zijn uitgevoerd conform de technische eisen van de ISDE-regeling (2026);{"\n"}
            3. De opgegeven technische specificaties (U-waarden / Rd-waarden) overeenkomen met de daadwerkelijk geplaatste producten;{"\n"}
            4. De maatregelen zijn aangebracht door of onder directe verantwoordelijkheid van een erkend aannemer/installateur;{"\n"}
            5. De op de factuur vermelde meldcode is voorafgaand aan de werkzaamheden aangevraagd bij RVO.nl.{"\n\n"}
            Deze verklaring is opgemaakt in overeenstemming met de vereisten van RVO.nl voor de ISDE-subsidieaanvraag.
          </Text>
        </View>

        {/* Handtekening */}
        <View style={styles.signatureRow}>
          <View style={styles.signatureCol}>
            <Text style={styles.label}>Naam aannemer</Text>
            <Text style={styles.valueNormal}>{BEDRIJF.naam}</Text>
            <Text style={[styles.label, { marginTop: 6 }]}>Datum</Text>
            <Text style={styles.valueNormal}>{fmtDate(data.uitvoeringsDatum)}</Text>
          </View>
          <View style={[styles.signatureCol, { flex: 2 }]}>
            <Text style={styles.label}>Handtekening</Text>
            <View style={styles.signatureLine} />
            <Text style={{ fontSize: 8, color: "#6b7280" }}>Naam + stempel aannemer</Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          {BEDRIJF.naam} · {BEDRIJF.adres}, {BEDRIJF.postcode} {BEDRIJF.stad} · KvK {BEDRIJF.kvk} · BTW {BEDRIJF.btw}
        </Text>
      </Page>
    </Document>
  );
}
