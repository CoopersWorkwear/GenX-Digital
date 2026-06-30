"use client";

import { useState } from "react";

/**
 * AI Website Builder intake. The customer enters their domain and a few
 * details; we queue a build request. The actual generation (via the Lovable
 * integration) and the "here's your site" email are added once those
 * connectors are authorised — this page captures everything needed to kick
 * that off.
 */
export default function WebsiteBuilderPage() {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/website-builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: form.get("domain"),
          email: form.get("email"),
          businessName: form.get("businessName"),
          description: form.get("description"),
        }),
      });
      if (!res.ok) throw new Error();
      setDone(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
        AI Website Builder
      </span>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">
        Enter your domain. Get a website.
      </h1>
      <p className="mt-3 text-slate-600">
        Tell us about your business and our AI builds you a fresh, ready-to-go
        website. We&apos;ll email you a link to preview it.
      </p>

      {done ? (
        <div className="mt-10 rounded-2xl border border-brand-100 bg-brand-50 p-8">
          <h2 className="text-xl font-semibold text-brand-700">
            You&apos;re in the queue! 🎉
          </h2>
          <p className="mt-2 text-slate-700">
            We&apos;ve got your details. As soon as your site is built, we&apos;ll
            email you a link to preview it.
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-10 space-y-5">
          <Field name="domain" label="Your domain" placeholder="yourbusiness.com.au" required />
          <Field name="email" label="Email" type="email" placeholder="you@example.com" required />
          <Field name="businessName" label="Business name" placeholder="Your Business Pty Ltd" required />
          <label className="block">
            <span className="text-sm font-medium text-slate-700">
              What does your business do? <span className="text-brand-600">*</span>
            </span>
            <textarea
              name="description"
              required
              rows={5}
              placeholder="Tell us about your business, your customers, and the style you like…"
              className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-brand-600 px-6 py-3 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {submitting ? "Submitting…" : "Build my website"}
          </button>
        </form>
      )}
    </main>
  );
}

function Field({
  name,
  label,
  type = "text",
  placeholder,
  required,
}: {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
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
        placeholder={placeholder}
        required={required}
        className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      />
    </label>
  );
}
