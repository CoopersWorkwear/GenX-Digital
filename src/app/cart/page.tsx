"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart/CartContext";
import { formatAud, gstComponent } from "@/lib/pricing";

export default function CartPage() {
  const { items, total, remove } = useCart();

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Your cart</h1>

      {items.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-10 text-center">
          <p className="text-slate-600">Your cart is empty.</p>
          <Link
            href="/domains"
            className="mt-4 inline-block rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Find a domain
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 lg:col-span-2">
            {items.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    {item.type.replace("_", " ")}
                    {item.billingCycle ? ` · ${item.billingCycle}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold">{formatAud(item.price)}</span>
                  <button
                    onClick={() => remove(item.id)}
                    className="text-sm text-slate-400 hover:text-red-500"
                    aria-label={`Remove ${item.name}`}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <aside className="h-fit rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold">Summary</h2>
            <div className="mt-4 flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatAud(total)}</span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Includes GST {formatAud(gstComponent(total))}
            </p>
            <Link
              href="/checkout"
              className="mt-6 block rounded-lg bg-brand-600 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-brand-700"
            >
              Checkout
            </Link>
          </aside>
        </div>
      )}
    </main>
  );
}
