"use client";

import { useCallback, useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { CardIcon } from "@/components/icons";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

interface Card {
  id: string;
  brand: string;
  last4: string;
  expMonth: number | null;
  expYear: number | null;
}

export function SavedCards() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [configured, setConfigured] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/payments/methods");
      const data = await res.json();
      setConfigured(Boolean(data.configured) && Boolean(stripePromise));
      setCards(data.cards ?? []);
    } catch {
      setConfigured(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function startAddCard() {
    setError(null);
    try {
      const res = await fetch("/api/payments/setup-intent", { method: "POST" });
      const data = await res.json();
      if (!data.configured || !data.clientSecret) {
        setError("Card payments aren't connected yet.");
        return;
      }
      setClientSecret(data.clientSecret);
    } catch {
      setError("Couldn't start adding a card. Please try again.");
    }
  }

  async function removeCard(id: string) {
    await fetch(`/api/payments/methods?id=${id}`, { method: "DELETE" });
    load();
  }

  if (loading) return <p className="text-sm text-slate-500">Loading…</p>;

  if (!configured) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
        Saved cards will appear here once card payments are connected. Your card
        details are stored securely by our payment provider — never on our
        servers.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {cards.length === 0 && !clientSecret && (
        <p className="text-sm text-slate-500">No saved cards yet.</p>
      )}

      {cards.map((c) => (
        <div
          key={c.id}
          className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3"
        >
          <span className="flex items-center gap-3">
            <CardIcon className="h-5 w-5 text-slate-400" />
            <span className="font-medium capitalize">{c.brand}</span>
            <span className="text-slate-500">•••• {c.last4}</span>
            {c.expMonth && (
              <span className="text-xs text-slate-400">
                {String(c.expMonth).padStart(2, "0")}/{c.expYear}
              </span>
            )}
          </span>
          <button
            onClick={() => removeCard(c.id)}
            className="text-sm text-slate-400 hover:text-red-500"
          >
            Remove
          </button>
        </div>
      ))}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {clientSecret && stripePromise ? (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <AddCardForm
            onDone={() => {
              setClientSecret(null);
              load();
            }}
            onCancel={() => setClientSecret(null)}
          />
        </Elements>
      ) : (
        <button
          onClick={startAddCard}
          className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Add a card
        </button>
      )}
    </div>
  );
}

function AddCardForm({ onDone, onCancel }: { onDone: () => void; onCancel: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError(null);
    const { error } = await stripe.confirmSetup({
      elements,
      confirmParams: { return_url: window.location.href },
      redirect: "if_required",
    });
    if (error) {
      setError(error.message ?? "Couldn't save the card.");
      setSubmitting(false);
    } else {
      onDone();
    }
  }

  return (
    <form onSubmit={onSubmit} className="rounded-xl border border-slate-200 p-5">
      <PaymentElement />
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      <div className="mt-4 flex gap-3">
        <button
          type="submit"
          disabled={submitting || !stripe}
          className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {submitting ? "Saving…" : "Save card"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
