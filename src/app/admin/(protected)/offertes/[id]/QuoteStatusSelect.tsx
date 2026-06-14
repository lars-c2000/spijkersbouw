"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { QuoteStatus } from "@/generated/prisma/client";

const statusOptions: { value: QuoteStatus; label: string }[] = [
  { value: "NIEUW", label: "Nieuw" },
  { value: "IN_BEHANDELING", label: "In behandeling" },
  { value: "VERSTUURD", label: "Verstuurd" },
  { value: "GEWONNEN", label: "Gewonnen" },
  { value: "VERLOREN", label: "Verloren" },
];

export default function QuoteStatusSelect({
  quoteId,
  currentStatus,
}: {
  quoteId: string;
  currentStatus: QuoteStatus;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);

  async function updateStatus(newStatus: QuoteStatus) {
    setSaving(true);
    setStatus(newStatus);
    await fetch(`/api/admin/offertes/${quoteId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="space-y-2">
      <select
        value={status}
        onChange={(e) => updateStatus(e.target.value as QuoteStatus)}
        disabled={saving}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-60"
      >
        {statusOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {saving && <p className="text-xs text-gray-400">Opslaan...</p>}
    </div>
  );
}
