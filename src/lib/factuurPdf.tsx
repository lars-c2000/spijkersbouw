import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Bedrijfsgegevens — pas aan in .env of hier direct
const BEDRIJF = {
  naam: "Spijkersbouw",
  adres: "Straatnaam 1",
  postcode: "5000 AA",
  stad: "Tilburg",
  telefoon: "06-00000000",
  email: "info@spijkersbouw.nl",
  kvk: "12345678",
  btw: "NL123456789B01",
  iban: "NL00 BANK 0000 0000 00",
};

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    paddingTop: 48,
    paddingBottom: 48,
    paddingHorizontal: 48,
    color: "#111827",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  logo: { fontSize: 20, fontFamily: "Helvetica-Bold", color: "#e65100" },
  bedrijfInfo: { fontSize: 8, color: "#6b7280", textAlign: "right", lineHeight: 1.5 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 8, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 3 },
  bold: { fontFamily: "Helvetica-Bold" },
  divider: { borderBottomWidth: 1, borderBottomColor: "#e5e7eb", marginVertical: 12 },
  // Tabel
  tableHeader: { flexDirection: "row", backgroundColor: "#f9fafb", paddingVertical: 6, paddingHorizontal: 8, borderRadius: 2 },
  tableRow: { flexDirection: "row", paddingVertical: 5, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  colDesc: { flex: 4 },
  colNum: { flex: 1, textAlign: "right" },
  colPrice: { flex: 1.5, textAlign: "right" },
  colBtw: { flex: 1, textAlign: "right" },
  colTotal: { flex: 1.5, textAlign: "right" },
  // Totalen
  totalsBox: { backgroundColor: "#f9fafb", padding: 12, borderRadius: 4, marginTop: 8 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 3 },
  grandTotal: { flexDirection: "row", justifyContent: "space-between", marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: "#d1d5db" },
  footer: { position: "absolute", bottom: 32, left: 48, right: 48, fontSize: 7, color: "#9ca3af", textAlign: "center" },
});

type LineItem = {
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  btwRate: number;
};

type FactuurData = {
  number: string;
  invoiceDate: Date;
  dueDate: Date;
  totalExclBtw: number;
  btwAmount: number;
  totalInclBtw: number;
  lineItems: LineItem[];
  notes: string | null;
  customer: {
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    postcode: string | null;
    city: string | null;
    kvk: string | null;
    btwNummer: string | null;
  };
};

function fmt(amount: number) {
  return `€ ${amount.toFixed(2).replace(".", ",")}`;
}

function fmtDate(d: Date) {
  return d.toLocaleDateString("nl-NL", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function FactuurDocument({ data }: { data: FactuurData }) {
  const btwGroups = data.lineItems.reduce<Record<number, number>>((acc, item) => {
    const base = item.quantity * item.unitPrice;
    acc[item.btwRate] = (acc[item.btwRate] ?? 0) + base * (item.btwRate / 100);
    return acc;
  }, {});

  return (
    <Document title={`Factuur ${data.number}`}>
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
              BTW: {BEDRIJF.btw}{"\n"}
              IBAN: {BEDRIJF.iban}
            </Text>
          </View>
        </View>

        {/* Factuurkop */}
        <View style={[styles.row, { marginBottom: 24 }]}>
          <View>
            <Text style={[styles.bold, { fontSize: 16, marginBottom: 8 }]}>FACTUUR</Text>
            <Text style={{ color: "#6b7280", marginBottom: 2 }}>Nummer: <Text style={styles.bold}>{data.number}</Text></Text>
            <Text style={{ color: "#6b7280", marginBottom: 2 }}>Datum: {fmtDate(data.invoiceDate)}</Text>
            <Text style={{ color: data.dueDate < new Date() ? "#dc2626" : "#6b7280" }}>
              Vervaldatum: {fmtDate(data.dueDate)}
            </Text>
          </View>
          <View style={{ textAlign: "right" }}>
            <Text style={[styles.sectionTitle, { textAlign: "right" }]}>Factuur aan</Text>
            <Text style={[styles.bold, { marginBottom: 2 }]}>{data.customer.name}</Text>
            {data.customer.address && <Text style={{ color: "#6b7280" }}>{data.customer.address}</Text>}
            {data.customer.city && (
              <Text style={{ color: "#6b7280" }}>{data.customer.postcode} {data.customer.city}</Text>
            )}
            {data.customer.email && <Text style={{ color: "#6b7280" }}>{data.customer.email}</Text>}
            {data.customer.kvk && <Text style={{ color: "#6b7280" }}>KvK: {data.customer.kvk}</Text>}
            {data.customer.btwNummer && <Text style={{ color: "#6b7280" }}>BTW: {data.customer.btwNummer}</Text>}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Regelitems tabel */}
        <View style={styles.section}>
          <View style={styles.tableHeader}>
            <Text style={[styles.colDesc, styles.bold]}>Omschrijving</Text>
            <Text style={[styles.colNum, styles.bold]}>Aantal</Text>
            <Text style={[styles.colPrice, styles.bold]}>Stukprijs</Text>
            <Text style={[styles.colBtw, styles.bold]}>BTW%</Text>
            <Text style={[styles.colTotal, styles.bold]}>Bedrag</Text>
          </View>
          {data.lineItems.map((item, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.colDesc}>{item.description}</Text>
              <Text style={styles.colNum}>{item.quantity} {item.unit}</Text>
              <Text style={styles.colPrice}>{fmt(item.unitPrice)}</Text>
              <Text style={styles.colBtw}>{item.btwRate}%</Text>
              <Text style={styles.colTotal}>{fmt(item.quantity * item.unitPrice)}</Text>
            </View>
          ))}
        </View>

        {/* Totalen */}
        <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
          <View style={[styles.totalsBox, { width: 240 }]}>
            <View style={styles.totalRow}>
              <Text style={{ color: "#6b7280" }}>Subtotaal excl. BTW</Text>
              <Text>{fmt(data.totalExclBtw)}</Text>
            </View>
            {Object.entries(btwGroups).map(([rate, amount]) => (
              <View key={rate} style={styles.totalRow}>
                <Text style={{ color: "#6b7280" }}>BTW {rate}%</Text>
                <Text>{fmt(amount)}</Text>
              </View>
            ))}
            <View style={styles.grandTotal}>
              <Text style={styles.bold}>Totaal incl. BTW</Text>
              <Text style={[styles.bold, { fontSize: 11 }]}>{fmt(data.totalInclBtw)}</Text>
            </View>
          </View>
        </View>

        {/* Betaalmethode */}
        <View style={[styles.section, { marginTop: 24 }]}>
          <Text style={styles.sectionTitle}>Betaling</Text>
          <Text>Gelieve het bedrag van <Text style={styles.bold}>{fmt(data.totalInclBtw)}</Text> vóór{" "}
            <Text style={styles.bold}>{fmtDate(data.dueDate)}</Text> over te maken naar:</Text>
          <Text style={[styles.bold, { marginTop: 4 }]}>IBAN: {BEDRIJF.iban}</Text>
          <Text style={{ color: "#6b7280" }}>Ten name van: {BEDRIJF.naam}</Text>
          <Text style={{ color: "#6b7280" }}>Onder vermelding van: {data.number}</Text>
        </View>

        {/* Notities */}
        {data.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Opmerkingen</Text>
            <Text style={{ color: "#6b7280" }}>{data.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          {BEDRIJF.naam} · {BEDRIJF.adres}, {BEDRIJF.postcode} {BEDRIJF.stad} · KvK {BEDRIJF.kvk} · BTW {BEDRIJF.btw}
        </Text>
      </Page>
    </Document>
  );
}
