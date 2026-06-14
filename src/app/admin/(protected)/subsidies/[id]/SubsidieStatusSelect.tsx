"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
type SubsidieStatus = "CONCEPT" | "IN_BEHANDELING" | "INGEDIEND" | "GOEDGEKEURD" | "AFGEWEZEN" | "UITBETAALD";

const labels: Record<SubsidieStatus, string> = {
  CONCEPT: "Concept",
  IN_BEHANDELING: "In behandeling",
  INGEDIEND: "Ingediend",
  GOEDGEKEURD: "Goedgekeurd",
  AFGEWEZEN: "Afgewezen",
  UITBETAALD: "Uitbetaald",
};

export default function SubsidieStatusSelect({
  aanvraagId,
  current,
}: {
  aanvraagId: string;
  current: SubsidieStatus;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<SubsidieStatus>(current);
  const [saving, setSaving] = useState(false);

  async function onChange(next: SubsidieStatus) {
    setStatus(next);
    setSaving(true);
    await fetch(`/api/admin/subsidies/${aanvraagId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <select
      value={status}
      disabled={saving}
      onChange={(e) => onChange(e.target.value as SubsidieStatus)}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-60"
    >
      {(Object.keys(labels) as SubsidieStatus[]).map((s) => (
        <option key={s} value={s}>{labels[s]}</option>
      ))}
    </select>
  );
}
