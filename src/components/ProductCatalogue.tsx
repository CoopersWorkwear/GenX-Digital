"use client";

import { useEffect, useState } from "react";
import { useCart, type CartItemType } from "@/lib/cart/CartContext";

interface Plan {
  id: string;
  name: string;
  description: string | null;
  features: string[];
  billingCycle: string;
  price: number | null;
  priceFormatted: string;
}

interface Props {
  category: "hosting" | "ssl" | "email";
  cartType: CartItemType;
}

export function ProductCatalogue({ category, cartType }: Props) {
  const [plans, setPlans] = useState<Plan[] | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "empty" | "error">(
    "loading",
  );
  const { add, has } = useCart();

  useEffect(() => {
    let active = true;
    fetch(`/api/products/${category}`)
      .then((r) => r.json())
      .then((data) => {
        if (!active) return;
        if (data.configured === false || (data.plans?.length ?? 0) === 0) {
          setState("empty");
          setPlans([]);
        } else {
          setPlans(data.plans);
          setState("ready");
        }
      })
      .catch(() => active && setState("error"));
    return () => {
      active = false;
    };
  }, [category]);

  if (state === "loading") {
    return <p className="text-slate-500">Loading plans…</p>;
  }

  if (state === "empty" || state === "error") {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
        <p className="font-medium text-slate-700">
          Plans for this product are coming soon.
        </p>
        <p className="mt-2 text-sm text-slate-500">
          We&apos;re finalising live pricing from our supplier. In the meantime,{" "}
          <a href="/contact" className="font-semibold text-brand-600">
            get in touch
          </a>{" "}
          and we&apos;ll sort you out.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {plans!.map((plan) => {
        const id = `${cartType}:${plan.id}`;
        const inCart = has(id);
        return (
          <div
            key={plan.id}
            className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6"
          >
            <h3 className="text-lg font-semibold">{plan.name}</h3>
            {plan.description && (
              <p className="mt-2 text-sm text-slate-600">{plan.description}</p>
            )}
            {plan.features.length > 0 && (
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-brand-600">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-6 flex items-end justify-between border-t border-slate-100 pt-4">
              <span className="text-xl font-bold">
                {plan.priceFormatted}
                <span className="text-sm font-normal text-slate-500">
                  /{plan.billingCycle === "monthly" ? "mo" : "yr"}
                </span>
              </span>
            </div>
            <button
              disabled={inCart || plan.price === null}
              onClick={() =>
                plan.price !== null &&
                add({
                  id,
                  type: cartType,
                  name: plan.name,
                  description: plan.description ?? undefined,
                  price: plan.price,
                  billingCycle: plan.billingCycle,
                })
              }
              className="mt-4 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:bg-slate-300"
            >
              {inCart ? "In cart" : "Add to cart"}
            </button>
          </div>
        );
      })}
    </div>
  );
}
