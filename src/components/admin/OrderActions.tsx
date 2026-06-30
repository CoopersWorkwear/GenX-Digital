"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/** Admin controls to advance or cancel an order. */
export function OrderActions({
  orderId,
  status,
}: {
  orderId: string;
  status: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function setStatus(next: string) {
    setBusy(true);
    try {
      await fetch("/api/admin/order-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: next }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  if (status === "completed" || status === "cancelled") {
    return <span className="text-xs text-slate-400">—</span>;
  }

  return (
    <span className="flex gap-2">
      <button
        disabled={busy}
        onClick={() => setStatus("completed")}
        className="rounded-md bg-brand-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
      >
        Mark fulfilled
      </button>
      <button
        disabled={busy}
        onClick={() => setStatus("cancelled")}
        className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-500 hover:text-red-500 disabled:opacity-50"
      >
        Cancel
      </button>
    </span>
  );
}
