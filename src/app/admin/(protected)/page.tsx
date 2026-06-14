import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

function formatEuro(cents: number) {
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(cents);
}

async function getStats() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [
    openOffertes,
    onbetaaldeFacturen,
    nieuweKlanten,
    recenteActiviteiten,
    omzetDezeMailand,
    openstaandBedrag,
    betaaldTotaal,
    verzondenTotaal,
    actiefOffertesBedrag,
    maandOmzet,
  ] = await Promise.all([
    prisma.quote.count({ where: { status: { in: ["NIEUW", "IN_BEHANDELING"] } } }),
    prisma.invoice.count({ where: { status: { in: ["VERZONDEN", "VERLOPEN"] } } }),
    prisma.customer.count({
      where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
    }),
    prisma.activity.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } } },
    }),
    // Omzet deze maand: BETAALD in huidige maand
    prisma.invoice.aggregate({
      _sum: { totalInclBtw: true },
      where: { status: "BETAALD", paidAt: { gte: startOfMonth } },
    }),
    // Openstaand bedrag: VERZONDEN facturen
    prisma.invoice.aggregate({
      _sum: { totalInclBtw: true },
      where: { status: "VERZONDEN" },
    }),
    // Betaalrate: totaal betaald facturen
    prisma.invoice.count({ where: { status: "BETAALD" } }),
    // Betaalrate: totaal verzonden + betaald facturen
    prisma.invoice.count({ where: { status: { in: ["VERZONDEN", "BETAALD", "VERLOPEN"] } } }),
    // Actieve offertes totaalwaarde
    prisma.quote.aggregate({
      _sum: { totalInclBtw: true },
      where: { status: { in: ["NIEUW", "IN_BEHANDELING", "VERSTUURD"] } },
    }),
    // Omzet per maand (laatste 6 maanden)
    prisma.invoice.findMany({
      where: { status: "BETAALD", paidAt: { gte: sixMonthsAgo } },
      select: { paidAt: true, totalInclBtw: true },
    }),
  ]);

  // Groepeer omzet per maand
  const maandData: Record<string, number> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    maandData[key] = 0;
  }
  for (const inv of maandOmzet) {
    if (!inv.paidAt) continue;
    const key = `${inv.paidAt.getFullYear()}-${String(inv.paidAt.getMonth() + 1).padStart(2, "0")}`;
    if (key in maandData) maandData[key] += inv.totalInclBtw;
  }

  const betaalrate = verzondenTotaal > 0 ? Math.round((betaaldTotaal / verzondenTotaal) * 100) : 0;

  return {
    openOffertes,
    onbetaaldeFacturen,
    nieuweKlanten,
    recenteActiviteiten,
    omzetDezeMaand: omzetDezeMailand._sum.totalInclBtw ?? 0,
    openstaandBedrag: openstaandBedrag._sum.totalInclBtw ?? 0,
    betaalrate,
    actiefOffertesBedrag: actiefOffertesBedrag._sum.totalInclBtw ?? 0,
    maandData,
  };
}

const actionLabels: Record<string, string> = {
  offerte_aangemaakt: "Nieuwe offerte aangemaakt",
  offerte_verstuurd: "Offerte verstuurd",
  offerte_gewonnen: "Offerte gewonnen",
  factuur_aangemaakt: "Factuur aangemaakt",
  factuur_verstuurd: "Factuur verstuurd",
  factuur_betaald: "Factuur betaald",
  klant_aangemaakt: "Nieuwe klant aangemaakt",
};

const MAANDEN = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];

export default async function DashboardPage() {
  const session = await auth();
  const {
    openOffertes,
    onbetaaldeFacturen,
    nieuweKlanten,
    recenteActiviteiten,
    omzetDezeMaand,
    openstaandBedrag,
    betaalrate,
    actiefOffertesBedrag,
    maandData,
  } = await getStats();

  const maandEntries = Object.entries(maandData);
  const maxOmzet = Math.max(...maandEntries.map(([, v]) => v), 1);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Goedendag, {session?.user?.name?.split(" ")[0]}
        </h1>
        <p className="text-gray-500 mt-1">Hier is een overzicht van vandaag.</p>
      </div>

      {/* Financiële KPI rij */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Omzet deze maand</p>
          <p className="text-2xl font-bold text-gray-900">{formatEuro(omzetDezeMaand)}</p>
          <p className="text-xs text-gray-400 mt-1">Betaalde facturen</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Openstaand</p>
          <p className="text-2xl font-bold text-orange-600">{formatEuro(openstaandBedrag)}</p>
          <p className="text-xs text-gray-400 mt-1">Verzonden facturen</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Betaalrate</p>
          <p className="text-2xl font-bold text-gray-900">{betaalrate}%</p>
          <p className="text-xs text-gray-400 mt-1">Van verstuurde facturen</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Actieve offertes</p>
          <p className="text-2xl font-bold text-blue-600">{formatEuro(actiefOffertesBedrag)}</p>
          <p className="text-xs text-gray-400 mt-1">Totaalwaarde pipeline</p>
        </div>
      </div>

      {/* Operationele KPI rij */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Open offertes", value: openOffertes, color: "bg-blue-500", href: "/admin/offertes",
            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /> },
          { label: "Onbetaalde facturen", value: onbetaaldeFacturen, color: "bg-red-500", href: "/admin/facturen",
            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /> },
          { label: "Nieuwe klanten (30d)", value: nieuweKlanten, color: "bg-green-500", href: "/admin/klanten",
            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /> },
        ].map((kpi) => (
          <a key={kpi.label} href={kpi.href} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4 hover:shadow-sm transition-shadow">
            <div className={`${kpi.color} text-white rounded-xl p-3 flex-shrink-0`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">{kpi.icon}</svg>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{kpi.value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{kpi.label}</p>
            </div>
          </a>
        ))}
      </div>

      {/* Omzet grafiek + Activiteit + Snelkoppelingen */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Omzet per maand */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-6">Omzet laatste 6 maanden</h2>
          <div className="flex items-end gap-3 h-32">
            {maandEntries.map(([key, val]) => {
              const maandNr = parseInt(key.split("-")[1]) - 1;
              const hoogte = Math.round((val / maxOmzet) * 100);
              const isHuidig = key === `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
              return (
                <div key={key} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-gray-500">{val > 0 ? formatEuro(val).replace("€\u00a0", "€") : ""}</span>
                  <div className="w-full flex items-end" style={{ height: "80px" }}>
                    <div
                      className={`w-full rounded-t-md ${isHuidig ? "bg-orange-500" : "bg-orange-200"} transition-all`}
                      style={{ height: `${Math.max(hoogte, val > 0 ? 4 : 1)}%` }}
                    />
                  </div>
                  <span className={`text-xs font-medium ${isHuidig ? "text-orange-600" : "text-gray-400"}`}>
                    {MAANDEN[maandNr]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recente activiteit */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Recente activiteit</h2>
          {recenteActiviteiten.length === 0 ? (
            <p className="text-sm text-gray-400">Nog geen activiteit geregistreerd.</p>
          ) : (
            <ul className="space-y-3">
              {recenteActiviteiten.map((a) => (
                <li key={a.id} className="flex items-start gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0 mt-1.5" />
                  <span className="text-gray-700 flex-1 leading-snug">
                    {actionLabels[a.action] ?? a.action}
                  </span>
                  <span className="text-gray-400 text-xs whitespace-nowrap mt-0.5">
                    {a.createdAt.toLocaleDateString("nl-NL")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Snelkoppelingen */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mt-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Snelkoppelingen</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Nieuwe offerte", href: "/admin/offertes/nieuw", color: "bg-orange-50 text-orange-700 hover:bg-orange-100" },
            { label: "Nieuwe klant", href: "/admin/klanten/nieuw", color: "bg-blue-50 text-blue-700 hover:bg-blue-100" },
            { label: "Nieuwe factuur", href: "/admin/facturen/nieuw", color: "bg-green-50 text-green-700 hover:bg-green-100" },
            { label: "Blog bewerken", href: "/admin/cms/blog", color: "bg-purple-50 text-purple-700 hover:bg-purple-100" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`${item.color} rounded-lg px-4 py-3 text-sm font-medium transition-colors text-center`}
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
