"use client";

import { useState } from "react";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useCart, type CartItem } from "@/lib/cart/CartContext";
import { formatAud, gstComponent } from "@/lib/pricing";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

type Step = "details" | "pay" | "done";

interface Contact {
  name: string;
  email: string;
  phone: string;
}

export default function CheckoutPage() {
  const { items, total, clear } = useCart();
  const [step, setStep] = useState<Step>("details");
  const [paid, setPaid] = useState(false);
  const [contact, setContact] = useState<Contact | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function placeOrder(c: Contact, paymentRef?: string) {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...c, items, total, paymentRef: paymentRef ?? null }),
    });
    if (!res.ok) throw new Error();
  }

  async function onDetails(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const c: Contact = {
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? ""),
    };
    setContact(c);

    try {
      // Try to start a card payment.
      const res = await fetch("/api/payments/checkout-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: c.email, items }),
      });
      const data = await res.json();

      if (data.configured && data.clientSecret && stripePromise) {
        setClientSecret(data.clientSecret);
        setPaymentIntentId(data.paymentIntentId);
        setStep("pay");
      } else {
        // Payments not connected — record an order request.
        await placeOrder(c);
        setPaid(false);
        clear();
        setStep("done");
      }
    } catch {
      setError("Something went wrong. Please try again or contact us.");
    } finally {
      setSubmitting(false);
    }
  }

  async function onPaid() {
    if (contact) {
      try {
        await placeOrder(contact, paymentIntentId ?? undefined);
      } catch {
        /* payment succeeded; order log will be reconciled */
      }
    }
    setPaid(true);
    clear();
    setStep("done");
  }

  if (step === "done") {
    return (
      <main className="mx-auto max-w-2xl px-6 py-20 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Thank you!</h1>
        <p className="mt-4 text-slate-600">
          {paid
            ? "Your payment was successful and your order is confirmed. A receipt is on its way to your email."
            : "We've received your order request and will be in touch shortly to confirm and arrange payment."}
        </p>
        <Link
          href="/account"
          className="mt-8 inline-block rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          View my account
        </Link>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
        <p className="mt-6 text-slate-600">
          Your cart is empty.{" "}
          <Link href="/domains" className="font-semibold text-brand-600">
            Find a domain
          </Link>
          .
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {step === "details" && (
            <form onSubmit={onDetails} className="space-y-4">
              <Field name="name" label="Full name" type="text" required />
              <Field name="email" label="Email" type="email" required />
              <Field name="phone" label="Phone" type="tel" />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
              >
                {submitting ? "Please wait…" : "Continue to payment"}
              </button>
            </form>
          )}

          {step === "pay" && clientSecret && stripePromise && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <PayForm total={total} onPaid={onPaid} />
            </Elements>
          )}
        </div>

        <OrderSummary items={items} total={total} />
      </div>
    </main>
  );
}

function PayForm({ total, onPaid }: { total: number; onPaid: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError(null);
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.href },
      redirect: "if_required",
    });
    if (error) {
      setError(error.message ?? "Payment failed. Please try another card.");
      setSubmitting(false);
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      onPaid();
    } else {
      setError("Payment could not be completed. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <PaymentElement />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={submitting || !stripe}
        className="rounded-lg bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {submitting ? "Processing…" : `Pay ${formatAud(total)}`}
      </button>
    </form>
  );
}

function OrderSummary({ items, total }: { items: CartItem[]; total: number }) {
  return (
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
      <p className="mt-1 text-xs text-slate-400">
        Includes GST {formatAud(gstComponent(total))}
      </p>
    </aside>
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
