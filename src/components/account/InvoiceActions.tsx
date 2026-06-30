"use client";

import Link from "next/link";

/** Print/back controls shown above an invoice — hidden when printing. */
export function InvoiceActions({ invoiceNumber }: { invoiceNumber: string }) {
  return (
    <div className="mb-4 flex items-center justify-between print:hidden">
      <Link
        href="/account"
        className="text-sm font-semibold text-slate-500 hover:text-brand-600"
      >
        ← Back to account
      </Link>
      <div className="flex items-center gap-3">
        <span className="hidden text-sm text-slate-400 sm:inline">{invoiceNumber}</span>
        <button
          onClick={() => window.print()}
          className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Download PDF
        </button>
      </div>
    </div>
  );
}
