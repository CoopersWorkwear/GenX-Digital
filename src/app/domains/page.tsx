import type { Metadata } from "next";
import { DomainSearch } from "@/components/DomainSearch";
import { getTldPricing } from "@/lib/dreamscape/domains";
import { isDreamscapeConfigured } from "@/lib/dreamscape/config";
import { retailPrice, formatAud } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Domain Names",
  description: "Search and register domain names across 590+ extensions.",
};

export const dynamic = "force-dynamic";

// A curated subset to feature at the top of the pricing table.
const FEATURED = ["com.au", "au", "com", "net.au", "org.au", "net", "org", "io", "co", "nz"];

async function loadPricing() {
  if (!isDreamscapeConfigured()) return null;
  try {
    const all = await getTldPricing();
    const byTld = new Map(all.map((t) => [t.tld, t]));
    const featured = FEATURED.map((tld) => byTld.get(tld)).filter(
      (t): t is NonNullable<typeof t> => Boolean(t),
    );
    const rest = all
      .filter((t) => !FEATURED.includes(t.tld))
      .sort((a, b) => a.tld.localeCompare(b.tld));
    return [...featured, ...rest];
  } catch {
    return null;
  }
}

export default async function DomainsPage() {
  const pricing = await loadPricing();

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Find your domain</h1>
      <p className="mt-3 max-w-2xl text-slate-600">
        Search availability and register in minutes. Prices shown include our
        margin; renewals are billed at the same rate.
      </p>

      <div className="mt-8">
        <DomainSearch />
      </div>

      <section className="mt-16">
        <h2 className="text-xl font-semibold">Domain pricing</h2>
        {!pricing ? (
          <p className="mt-4 text-sm text-slate-500">
            Live pricing is temporarily unavailable. Use the search above to
            check a specific domain.
          </p>
        ) : (
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Extension</th>
                  <th className="px-4 py-3 font-medium">Register</th>
                  <th className="px-4 py-3 font-medium">Renew</th>
                  <th className="px-4 py-3 font-medium">Transfer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pricing.slice(0, 60).map((t) => (
                  <tr key={t.tld}>
                    <td className="px-4 py-3 font-medium">.{t.tld}</td>
                    <td className="px-4 py-3">{formatAud(retailPrice(t.register))}</td>
                    <td className="px-4 py-3">{formatAud(retailPrice(t.renew))}</td>
                    <td className="px-4 py-3">{formatAud(retailPrice(t.transfer))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
