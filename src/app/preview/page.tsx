import Link from "next/link";
import { decodeBrief } from "@/lib/builder/encode";

export const metadata = { title: "Website preview" };

/**
 * Renders a clean, templated one-page website from the customer's brief — the
 * "simple template" version of the AI website builder. The brief is passed in
 * the URL so a preview can be generated and shared without a database.
 */
export default async function PreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ d?: string }>;
}) {
  const { d } = await searchParams;
  const brief = d ? decodeBrief(d) : null;

  if (!brief) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="text-2xl font-bold">Preview unavailable</h1>
        <p className="mt-3 text-slate-600">
          This preview link looks invalid.{" "}
          <Link href="/website-builder" className="font-semibold text-brand-600">
            Build a new one
          </Link>
          .
        </p>
      </main>
    );
  }

  const tagline = firstSentence(brief.description);
  const services = deriveServices(brief.description);

  return (
    <div>
      {/* Preview banner */}
      <div className="bg-brand-600 px-6 py-2.5 text-center text-sm text-white">
        Preview of your new website ·{" "}
        <Link href="/contact" className="font-semibold underline">
          Make it live with GenX Digital
        </Link>
      </div>

      {/* The customer's templated site */}
      <div className="bg-white text-slate-800">
        {/* Hero */}
        <section className="bg-gradient-to-b from-slate-900 to-slate-700 px-6 py-24 text-center text-white">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            {brief.businessName}
          </h1>
          {tagline && (
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-200">
              {tagline}
            </p>
          )}
          <a
            href={`mailto:hello@${cleanDomain(brief.domain)}`}
            className="mt-8 inline-block rounded-lg bg-white px-6 py-3 font-semibold text-slate-900"
          >
            Get in touch
          </a>
        </section>

        {/* About */}
        <section className="mx-auto max-w-3xl px-6 py-20">
          <h2 className="text-2xl font-bold">About us</h2>
          <p className="mt-4 whitespace-pre-line text-slate-600">
            {brief.description}
          </p>
        </section>

        {/* Services */}
        <section className="bg-slate-50 px-6 py-20">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-2xl font-bold">What we offer</h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {services.map((s, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-200 bg-white p-6 text-center"
                >
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-lg font-bold text-white">
                    {i + 1}
                  </div>
                  <p className="mt-4 font-medium">{s}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="px-6 py-20 text-center">
          <h2 className="text-2xl font-bold">Contact {brief.businessName}</h2>
          <p className="mt-3 text-slate-600">
            {cleanDomain(brief.domain)}
          </p>
        </section>

        <footer className="border-t border-slate-200 px-6 py-8 text-center text-sm text-slate-400">
          © {new Date().getFullYear()} {brief.businessName} ·{" "}
          {cleanDomain(brief.domain)}
        </footer>
      </div>
    </div>
  );
}

function firstSentence(text: string): string {
  const match = text.match(/^[^.!?]+[.!?]?/);
  return (match?.[0] ?? text).trim();
}

function deriveServices(description: string): string[] {
  // Lightweight heuristic for the simple template — three generic value props
  // a business can edit later. The full AI version will tailor these.
  const generic = ["Quality you can trust", "Friendly local service", "Great value"];
  const words = description
    .split(/[,.\n]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 3 && s.length < 40);
  return [...words, ...generic].slice(0, 3);
}

function cleanDomain(domain: string): string {
  return domain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
}
