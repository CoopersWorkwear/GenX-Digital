"use client";

import { useState } from "react";

const FAQS = [
  {
    q: "How fast can I get my domain?",
    a: "Most domains register instantly. Some extensions like .au may ask for eligibility details such as an ABN, which only takes a moment.",
  },
  {
    q: "Can I transfer a domain I already own?",
    a: "Yes — search your domain and choose transfer. You'll need the EPP/transfer code from your current provider, and we handle the rest.",
  },
  {
    q: "Do your prices include GST?",
    a: "Yes. All prices are shown in Australian dollars and include GST, with the GST amount broken out at checkout.",
  },
  {
    q: "How does the AI website builder work?",
    a: "Enter your business details (and optionally a logo), and our AI builds a starter site matched to your colours, then emails you a preview link.",
  },
  {
    q: "Is my payment information secure?",
    a: "Absolutely. Card payments are handled by Stripe and your card details are stored in Stripe's secure vault — never on our servers.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="mx-auto max-w-3xl divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
      {FAQS.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={i}>
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
              aria-expanded={isOpen}
            >
              <span className="font-semibold">{f.q}</span>
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-200 text-brand-600 transition-transform ${
                  isOpen ? "rotate-45" : ""
                }`}
              >
                +
              </span>
            </button>
            <div
              className="grid overflow-hidden px-6 transition-all duration-300"
              style={{
                gridTemplateRows: isOpen ? "1fr" : "0fr",
                paddingBottom: isOpen ? "1.25rem" : 0,
              }}
            >
              <p className="overflow-hidden text-sm text-slate-600">{f.a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
