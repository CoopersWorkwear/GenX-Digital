"use client";

import { useState } from "react";

export function NewsletterForm() {
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    try {
      await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email") }),
      });
      setDone(true);
    } catch {
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return <p className="text-sm text-brand-200">Thanks — you&apos;re on the list! 🎉</p>;
  }

  return (
    <form onSubmit={onSubmit} className="flex max-w-md gap-2">
      <input
        name="email"
        type="email"
        required
        placeholder="you@example.com"
        className="flex-1 rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/50 outline-none focus:border-white/40"
      />
      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-50 disabled:opacity-60"
      >
        {submitting ? "…" : "Subscribe"}
      </button>
    </form>
  );
}
