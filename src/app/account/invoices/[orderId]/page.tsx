import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/supabase/server";
import { getOrderByIdForEmail } from "@/lib/supabase/orders";
import { companyInfo } from "@/lib/company";
import { invoiceNumber, invoiceTotals } from "@/lib/invoice";
import { formatAud } from "@/lib/pricing";
import { InvoiceActions } from "@/components/account/InvoiceActions";

export const metadata: Metadata = { title: "Tax invoice" };
export const dynamic = "force-dynamic";

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { orderId } = await params;
  const order = await getOrderByIdForEmail(orderId, user.email ?? "");
  if (!order) notFound();

  const co = companyInfo();
  const number = invoiceNumber(order.id, order.created_at);
  const totals = invoiceTotals(Number(order.total));
  const date = new Date(order.created_at).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const customerName = (user.user_metadata?.full_name as string) || (user.email ?? "");
  const paid = order.status === "paid" || order.status === "completed";

  return (
    <div className="min-h-screen bg-slate-100 py-10 print:bg-white print:py-0">
      <div className="mx-auto max-w-3xl px-4 print:max-w-none print:px-0">
        <InvoiceActions invoiceNumber={number} />

        <article className="rounded-2xl bg-white p-10 shadow-sm ring-1 ring-slate-200 print:rounded-none print:p-8 print:shadow-none print:ring-0">
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-6 border-b border-slate-200 pb-8">
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.svg" alt={co.tradingName} className="h-8 w-auto" />
              <p className="mt-3 text-sm font-semibold text-slate-900">{co.legalName}</p>
              {co.abn && <p className="text-sm text-slate-500">ABN {co.abn}</p>}
              {co.acn && <p className="text-sm text-slate-500">ACN {co.acn}</p>}
              {co.address && <p className="mt-1 max-w-xs text-sm text-slate-500">{co.address}</p>}
              <p className="text-sm text-slate-500">{co.email}</p>
              {co.phone && <p className="text-sm text-slate-500">{co.phone}</p>}
            </div>
            <div className="text-right">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Tax Invoice</h1>
              <dl className="mt-3 space-y-1 text-sm">
                <Row label="Invoice no." value={number} />
                <Row label="Date" value={date} />
                <Row
                  label="Status"
                  value={
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        paid ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {paid ? "Paid" : "Unpaid"}
                    </span>
                  }
                />
              </dl>
            </div>
          </div>

          {/* Bill to */}
          <div className="grid gap-6 py-8 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Billed to</p>
              <p className="mt-1 font-medium text-slate-900">{customerName}</p>
              {user.email && customerName !== user.email && (
                <p className="text-sm text-slate-500">{user.email}</p>
              )}
            </div>
            {order.payment_ref && (
              <div className="sm:text-right">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Payment reference
                </p>
                <p className="mt-1 break-all text-sm text-slate-600">{order.payment_ref}</p>
              </div>
            )}
          </div>

          {/* Line items */}
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="py-3 font-semibold">Description</th>
                <th className="py-3 text-right font-semibold">Amount (incl. GST)</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((it) => (
                <tr key={it.id} className="border-b border-slate-100">
                  <td className="py-3 pr-4 text-slate-700">
                    {it.description ?? it.product_ref ?? it.product_type}
                  </td>
                  <td className="py-3 text-right tabular-nums text-slate-700">
                    {formatAud(Number(it.unit_price))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="mt-6 flex justify-end">
            <dl className="w-full max-w-xs space-y-2 text-sm">
              <div className="flex justify-between text-slate-500">
                <dt>Subtotal (ex. GST)</dt>
                <dd className="tabular-nums">{formatAud(totals.exGst)}</dd>
              </div>
              <div className="flex justify-between text-slate-500">
                <dt>GST (10%)</dt>
                <dd className="tabular-nums">{formatAud(totals.gst)}</dd>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-bold text-slate-900">
                <dt>Total (incl. GST)</dt>
                <dd className="tabular-nums">{formatAud(totals.total)}</dd>
              </div>
            </dl>
          </div>

          {/* Footer note */}
          <p className="mt-10 border-t border-slate-200 pt-6 text-center text-xs text-slate-400">
            {paid ? "Thank you for your business." : "Please remit payment at your earliest convenience."}{" "}
            All amounts in AUD and inclusive of GST where applicable. {co.tradingName} · {co.website}
          </p>
        </article>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-end gap-3">
      <dt className="text-slate-400">{label}</dt>
      <dd className="font-medium text-slate-900">{value}</dd>
    </div>
  );
}
