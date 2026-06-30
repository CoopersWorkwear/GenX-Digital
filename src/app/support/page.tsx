import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Support",
  description: "Get help with your GenX Digital products.",
};

const FAQS = [
  {
    q: "How long does domain registration take?",
    a: "Most domains are registered instantly. Some extensions (like .au) may require eligibility details such as an ABN.",
  },
  {
    q: "Can I transfer an existing domain to you?",
    a: "Yes — search your domain and choose transfer. You'll need the transfer/EPP code from your current provider.",
  },
  {
    q: "Do your prices include GST?",
    a: "GST is calculated at checkout. Listed prices are in Australian dollars.",
  },
  {
    q: "How does the AI website builder work?",
    a: "Enter your domain and a few details about your business, and we build you a starter website and email you a preview link.",
  },
];

export default function SupportPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Support</h1>
      <p className="mt-3 text-slate-600">
        Need a hand? Browse the common questions below or{" "}
        <Link href="/contact" className="font-semibold text-brand-600">
          contact us
        </Link>
        .
      </p>

      <div className="mt-10 space-y-6">
        {FAQS.map((f) => (
          <div key={f.q} className="rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold">{f.q}</h3>
            <p className="mt-2 text-sm text-slate-600">{f.a}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
