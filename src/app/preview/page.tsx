import Link from "next/link";
import { decodeBrief } from "@/lib/builder/encode";
import { publicUrl } from "@/lib/supabase/storage";
import { safeScheme } from "@/lib/builder/schemes";
import { fallbackContent } from "@/lib/builder/fallback";
import { Reveal } from "@/components/motion/Reveal";
import {
  BoltIcon,
  ShieldIcon,
  SparklesIcon,
  HeadsetIcon,
  GlobeIcon,
  CheckIcon,
  MailIcon,
  MapPinIcon,
} from "@/components/icons";
import type { BuilderBrief } from "@/lib/builder/types";

export const metadata = { title: "Website preview" };
export const dynamic = "force-dynamic";

const SERVICE_ICONS = [BoltIcon, ShieldIcon, SparklesIcon, HeadsetIcon, GlobeIcon, MapPinIcon];

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

function tint(hex: string, alpha: number): string {
  const n = hex.replace("#", "");
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
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
  const c = brief.content ?? fallbackContent(brief);
  const images = brief.imageUrls ?? [];
  const domain = brief.domain ? cleanDomain(brief.domain) : null;
  const heroImage = images[0];
  const aboutImage = images[1] ?? images[0];
  const galleryImages = images.length > 1 ? images : [];

  return (
    <div className="bg-white text-slate-800">
      {/* Preview banner */}
      <div className="px-4 py-2 text-center text-sm text-white" style={{ background: primary }}>
        ✨ A preview of your new website ·{" "}
        <Link href="/contact" className="font-semibold underline">
          Make it live with GenX Digital
        </Link>
      </div>

      {/* Sticky nav */}
      <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          {brief.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={brief.logoUrl} alt={brief.businessName} className="h-9 w-auto" />
          ) : (
            <span className="text-lg font-bold tracking-tight">{brief.businessName}</span>
          )}
          <nav className="hidden gap-6 text-sm font-medium text-slate-600 sm:flex">
            <a href="#about" className="hover:opacity-70">About</a>
            <a href="#services" className="hover:opacity-70">Services</a>
            <a href="#contact" className="hover:opacity-70">Contact</a>
          </nav>
          <a
            href="#contact"
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white"
            style={{ background: primary }}
          >
            {c.ctaText}
          </a>
        </div>
      </header>

      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}
      >
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-24 text-white lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-white/80">
              {c.tagline}
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              {c.heroHeadline}
            </h1>
            <p className="mt-5 max-w-lg text-lg text-white/90">{c.heroSubheadline}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#contact"
                className="rounded-lg bg-white px-6 py-3 font-semibold"
                style={{ color: primary }}
              >
                {c.ctaText}
              </a>
              <a
                href="#services"
                className="rounded-lg border border-white/40 px-6 py-3 font-semibold text-white"
              >
                Our services
              </a>
            </div>
          </div>
          {heroImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={heroImage}
              alt=""
              className="h-72 w-full rounded-2xl object-cover shadow-2xl lg:h-96"
            />
          )}
        </div>
      </section>

      {/* Stats */}
      {c.stats.length > 0 && (
        <section className="border-b border-slate-100 bg-white py-12">
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-6 text-center sm:grid-cols-3">
            {c.stats.slice(0, 3).map((s, i) => (
              <Reveal key={i}>
                <div className="text-4xl font-bold" style={{ color: primary }}>{s.value}</div>
                <p className="mt-1 text-sm text-slate-500">{s.label}</p>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* About */}
      <section id="about" className="py-24" style={{ background: tint(primary, 0.04) }}>
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-2">
          <Reveal>
            <h2 className="text-3xl font-bold tracking-tight" style={{ color: primary }}>
              {c.aboutTitle}
            </h2>
            <div className="mt-5 space-y-4 text-slate-600">
              {c.aboutBody.split(/\n\n+/).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </Reveal>
          {aboutImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={aboutImage} alt="" className="h-80 w-full rounded-2xl object-cover" />
          ) : (
            <div
              className="hidden h-80 rounded-2xl lg:block"
              style={{ background: `linear-gradient(135deg, ${tint(primary, 0.15)}, ${tint(accent, 0.15)})` }}
            />
          )}
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <h2 className="text-center text-3xl font-bold tracking-tight">What we offer</h2>
          </Reveal>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {c.services.map((s, i) => {
              const Icon = SERVICE_ICONS[i % SERVICE_ICONS.length];
              return (
                <Reveal key={i} delay={i * 80}>
                  <div className="h-full rounded-2xl border border-slate-200 p-6 transition hover:-translate-y-1 hover:shadow-lg">
                    <span
                      className="flex h-12 w-12 items-center justify-center rounded-xl"
                      style={{ background: tint(accent, 0.12), color: accent }}
                    >
                      <Icon className="h-6 w-6" />
                    </span>
                    <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
                    <p className="mt-2 text-sm text-slate-600">{s.description}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why choose us */}
      {c.features.length > 0 && (
        <section className="py-24" style={{ background: tint(accent, 0.05) }}>
          <div className="mx-auto max-w-5xl px-6 text-center">
            <Reveal>
              <h2 className="text-3xl font-bold tracking-tight" style={{ color: primary }}>
                {c.whyTitle}
              </h2>
            </Reveal>
            <div className="mx-auto mt-12 grid max-w-3xl gap-4 text-left sm:grid-cols-2">
              {c.features.map((f, i) => (
                <Reveal key={i} delay={i * 70}>
                  <div className="flex items-start gap-3 rounded-xl bg-white p-4">
                    <span style={{ color: accent }}>
                      <CheckIcon className="mt-0.5 h-5 w-5" />
                    </span>
                    <span className="text-slate-700">{f}</span>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Gallery */}
      {galleryImages.length > 0 && (
        <section className="py-24">
          <div className="mx-auto max-w-6xl px-6">
            <Reveal>
              <h2 className="text-center text-3xl font-bold tracking-tight">Gallery</h2>
            </Reveal>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {galleryImages.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={src} alt="" className="h-60 w-full rounded-xl object-cover" />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {c.testimonials.length > 0 && (
        <section className="py-24" style={{ background: tint(primary, 0.04) }}>
          <div className="mx-auto max-w-6xl px-6">
            <Reveal>
              <h2 className="text-center text-3xl font-bold tracking-tight">What our customers say</h2>
            </Reveal>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {c.testimonials.slice(0, 3).map((t, i) => (
                <Reveal key={i} delay={i * 90}>
                  <figure className="h-full rounded-2xl bg-white p-6 shadow-sm">
                    <div style={{ color: accent }}>★★★★★</div>
                    <blockquote className="mt-3 text-slate-700">“{t.quote}”</blockquote>
                    <figcaption className="mt-4 text-sm font-semibold">
                      {t.name} <span className="font-normal text-slate-400">· {t.role}</span>
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      {c.faqs.length > 0 && (
        <section className="py-24">
          <div className="mx-auto max-w-3xl px-6">
            <Reveal>
              <h2 className="text-center text-3xl font-bold tracking-tight">Frequently asked questions</h2>
            </Reveal>
            <div className="mt-10 space-y-4">
              {c.faqs.map((f, i) => (
                <Reveal key={i} delay={i * 60}>
                  <div className="rounded-xl border border-slate-200 p-5">
                    <h3 className="font-semibold">{f.question}</h3>
                    <p className="mt-2 text-sm text-slate-600">{f.answer}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section
        id="contact"
        className="py-24 text-center text-white"
        style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}
      >
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to get started?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/90">
            Get in touch with {brief.businessName} today.
          </p>
          {domain && (
            <a
              href={`mailto:hello@${domain}`}
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold"
              style={{ color: primary }}
            >
              <MailIcon className="h-5 w-5" /> hello@{domain}
            </a>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 px-6 py-10 text-center text-sm text-slate-400">
        <p className="font-semibold text-white">{brief.businessName}</p>
        {domain && <p className="mt-1">{domain}</p>}
        <p className="mt-3 text-xs">
          © {new Date().getFullYear()} {brief.businessName} ·{" "}
          <Link href="/" className="underline">
            Powered by GenX Digital
          </Link>
        </p>
      </footer>
    </div>
  );
}

function cleanDomain(domain: string): string {
  return domain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
}
