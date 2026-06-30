"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart/CartContext";
import { formatAud } from "@/lib/pricing";

/**
 * Checkout — collects contact details and the order. Payment capture (Stripe)
 * and provisioning via Dreamscape are wired in a later phase; for now this
 * records an enquiry/order request so nothing is lost.
 */
export default function CheckoutPage() {
  const { items, total, clear } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          phone: form.get("phone"),
          items,
          total,
        }),
      });
      if (!res.ok) throw new Error();
      setDone(true);
      clear();
    } catch {
      setError("Something went wrong. Please try again or contact us.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-20 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Thank you!</h1>
        <p className="mt-4 text-slate-600">
          We&apos;ve received your order request and will be in touch shortly to
          confirm and arrange payment.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Back to home
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>

      {items.length === 0 ? (
        <p className="mt-6 text-slate-600">
          Your cart is empty.{" "}
          <Link href="/domains" className="font-semibold text-brand-600">
            Find a domain
          </Link>
          .
        </p>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <form onSubmit={onSubmit} className="space-y-4 lg:col-span-2">
            <Field name="name" label="Full name" type="text" required />
            <Field name="email" label="Email" type="email" required />
            <Field name="phone" label="Phone" type="tel" />

            <p className="rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-700">
              Online card payment is being set up. Submit your order and we&apos;ll
              confirm and arrange secure payment with you directly.
            </p>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {submitting ? "Submitting…" : "Place order request"}
            </button>
          </form>

          <aside className="h-fit rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold">Order</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {items.map((item) => (
                <li key={item.id} className="flex justify-between gap-3">
                  <span className="text-slate-600">{item.name}</span>
                  <span>{formatAud(item.price)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-between border-t border-slate-100 pt-4 font-semibold">
              <span>Total</span>
              <span>{formatAud(total)}</span>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}

function Field({
  name,
  label,
  type,
  required,
}: {
  name: string;
  label: string;
  type: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-brand-600"> *</span>}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      />
    </label>
  );
}
