import Link from "next/link";
import { decodeBrief } from "@/lib/builder/encode";
import { publicUrl } from "@/lib/supabase/storage";
import { safeScheme } from "@/lib/builder/schemes";
import type { BuilderBrief } from "@/lib/builder/types";

export const metadata = { title: "Website preview" };
export const dynamic = "force-dynamic";

async function loadBrief(params: { id?: string; d?: string }): Promise<BuilderBrief | null> {
  if (params.id) {
    const url = publicUrl(`builds/${params.id}/brief.json`);
    if (url) {
      try {
        const res = await fetch(url, { cache: "no-store" });
        if (res.ok) {
          const raw = await res.json();
          return { ...raw, scheme: safeScheme(raw.scheme) } as BuilderBrief;
        }
      } catch {
        /* fall through */
      }
    }
  }
  if (params.d) return decodeBrief(params.d);
  return null;
}

export default async function PreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; d?: string }>;
}) {
  const brief = await loadBrief(await searchParams);

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

  const { primary, accent } = brief.scheme;
  const content = brief.content;
  const headline = content?.heroHeadline ?? brief.businessName;
  const subheadline = content?.heroSubheadline ?? firstSentence(brief.description);
  const ctaText = content?.ctaText ?? "Get in touch";
  const aboutTitle = content?.aboutTitle ?? "About us";
  const aboutBody = content?.aboutBody ?? brief.description;
  const services =
    content?.services ??
    deriveServices(brief.description).map((title) => ({ title, description: "" }));
  const images = brief.imageUrls ?? [];

  return (
    <div>
      <div className="px-6 py-2.5 text-center text-sm text-white" style={{ background: primary }}>
        Preview of your new website ·{" "}
        <Link href="/contact" className="font-semibold underline">
          Make it live with GenX Digital
        </Link>
      </div>

      <div className="bg-white text-slate-800">
        {/* Hero */}
        <section
          className="px-6 py-24 text-center text-white"
          style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}
        >
          {brief.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={brief.logoUrl} alt={brief.businessName} className="mx-auto mb-6 h-16 w-auto" />
          ) : (
            content && (
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/80">
                {brief.businessName}
              </p>
            )
          )}
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{headline}</h1>
          {subheadline && (
            <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90">{subheadline}</p>
          )}
          <span
            className="mt-8 inline-block rounded-lg bg-white px-6 py-3 font-semibold"
            style={{ color: primary }}
          >
            {ctaText}
          </span>
        </section>

        {/* About */}
        <section className="mx-auto max-w-3xl px-6 py-20">
          <h2 className="text-2xl font-bold" style={{ color: primary }}>{aboutTitle}</h2>
          <p className="mt-4 whitespace-pre-line text-slate-600">{aboutBody}</p>
        </section>

        {/* Image gallery */}
        {images.length > 0 && (
          <section className="bg-slate-50 px-6 py-16">
            <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {images.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={src} alt="" className="h-56 w-full rounded-xl object-cover" />
              ))}
            </div>
          </section>
        )}

        {/* Services */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-2xl font-bold" style={{ color: primary }}>
              What we offer
            </h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {services.map((s, i) => (
                <div key={i} className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
                  <div
                    className="mx-auto flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white"
                    style={{ background: accent }}
                  >
                    {i + 1}
                  </div>
                  <p className="mt-4 font-semibold">{s.title}</p>
                  {s.description && (
                    <p className="mt-2 text-sm text-slate-500">{s.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why choose us (AI-generated) */}
        {content?.whyPoints && content.whyPoints.length > 0 && (
          <section className="bg-slate-50 px-6 py-20">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-2xl font-bold" style={{ color: primary }}>
                {content.whyTitle}
              </h2>
              <ul className="mt-8 space-y-3 text-left">
                {content.whyPoints.map((point, i) => (
                  <li key={i} className="flex gap-3">
                    <span style={{ color: accent }}>✓</span>
                    <span className="text-slate-600">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Contact */}
        <section className="px-6 py-20 text-center">
          <h2 className="text-2xl font-bold" style={{ color: primary }}>
            Contact {brief.businessName}
          </h2>
          {brief.domain ? (
            <p className="mt-3 text-slate-600">{cleanDomain(brief.domain)}</p>
          ) : (
            <p className="mt-3 text-slate-500">
              Get your domain with{" "}
              <Link href="/domains" className="font-semibold" style={{ color: accent }}>
                GenX Digital
              </Link>
            </p>
          )}
        </section>

        <footer className="border-t border-slate-200 px-6 py-8 text-center text-sm text-slate-400">
          © {new Date().getFullYear()} {brief.businessName}
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
