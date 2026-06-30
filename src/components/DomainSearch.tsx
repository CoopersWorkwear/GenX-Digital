"use client";

import { useState } from "react";

interface DomainResult {
  domainName: string;
  available: boolean;
  priceFormatted: string;
}

interface ApiResponse {
  configured?: boolean;
  results?: DomainResult[];
  message?: string;
  error?: string;
}

export function DomainSearch() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<DomainResult[] | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;

    setLoading(true);
    setNotice(null);
    setResults(null);

    try {
      const res = await fetch(
        `/api/domains/availability?query=${encodeURIComponent(q)}`,
      );
      const data: ApiResponse = await res.json();

      if (!res.ok) {
        setNotice(data.error ?? "Something went wrong. Please try again.");
      } else if (data.configured === false) {
        setNotice(
          data.message ??
            "Domain lookups aren't connected yet — add your Dreamscape API key.",
        );
      } else {
        setResults(data.results ?? []);
      }
    } catch {
      setNotice("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-2xl">
      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Find your domain — e.g. yourbusiness"
          aria-label="Search for a domain"
          className="flex-1 rounded-lg border border-slate-300 px-4 py-3 text-base outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-brand-600 px-6 py-3 font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
        >
          {loading ? "Searching…" : "Search"}
        </button>
      </form>

      {notice && (
        <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {notice}
        </p>
      )}

      {results && results.length === 0 && (
        <p className="mt-4 text-sm text-slate-600">No results for that search.</p>
      )}

      {results && results.length > 0 && (
        <ul className="mt-6 divide-y divide-slate-100 rounded-xl border border-slate-200">
          {results.map((r) => (
            <li
              key={r.domainName}
              className="flex items-center justify-between gap-4 px-4 py-3"
            >
              <span className="font-medium">{r.domainName}</span>
              <span className="flex items-center gap-3">
                {r.available ? (
                  <>
                    <span className="text-sm text-slate-600">
                      {r.priceFormatted}
                    </span>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      Available
                    </span>
                  </>
                ) : (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                    Taken
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
