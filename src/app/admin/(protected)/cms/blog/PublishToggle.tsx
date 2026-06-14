"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PublishToggle({
  id,
  published,
  entity,
}: {
  id: string;
  published: boolean;
  entity: "blog" | "projecten";
}) {
  const router = useRouter();
  const [active, setActive] = useState(published);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    const newVal = !active;
    setActive(newVal);
    await fetch(`/api/admin/${entity}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: newVal }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-60 ${
        active ? "bg-green-500" : "bg-gray-300"
      }`}
    >
      <span
        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
          active ? "translate-x-5" : "translate-x-1"
        }`}
      />
    </button>
  );
}
