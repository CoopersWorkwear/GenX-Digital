import Link from "next/link";
import { DomainSearch } from "@/components/DomainSearch";
import { BrowserMockup } from "@/components/BrowserMockup";
import { Reveal } from "@/components/motion/Reveal";
import { Parallax } from "@/components/motion/Parallax";
import { Counter } from "@/components/motion/Counter";
import { Faq } from "@/components/Faq";
import {
  GlobeIcon,
  ServerIcon,
  ShieldIcon,
  MailIcon,
  SparklesIcon,
  BoltIcon,
  HeadsetIcon,
  MapPinIcon,
  CheckIcon,
} from "@/components/icons";

const PRODUCTS = [
  { href: "/domains", title: "Domains", body: "Search and register .com.au, .au, .com and 590+ extensions.", Icon: GlobeIcon },
  { href: "/hosting", title: "Web Hosting", body: "Fast, reliable hosting plans for sites of every size.", Icon: ServerIcon },
  { href: "/ssl", title: "SSL Certificates", body: "Secure your site and build customer trust with HTTPS.", Icon: ShieldIcon },
  { href: "/email", title: "Business Email", body: "Professional email on your own domain.", Icon: MailIcon },
];

const STEPS = [
  { n: "1", title: "Search your domain", body: "Find the perfect name across hundreds of extensions in seconds." },
  { n: "2", title: "Add what you need", body: "Hosting, SSL and business email — bundled in one simple checkout." },
  { n: "3", title: "Go live", body: "We set you up fast, or let our AI build your website for you." },
];

const FEATURES = [
  { title: "Set up in minutes", body: "Search, buy and go live fast — no technical know-how needed.", Icon: BoltIcon },
  { title: "Australian support", body: "Real help from a team that knows local domains and hosting.", Icon: HeadsetIcon },
  { title: "Local & trusted", body: "Built for Australian businesses, with .au eligibility handled.", Icon: MapPinIcon },
  { title: "Secure by default", body: "SSL, secure checkout and your data handled responsibly.", Icon: ShieldIcon },
];

const TESTIMONIALS = [
  { quote: "Had our domain, email and site sorted in an afternoon. The AI builder gave us a real head start.", name: "Mia R.", role: "Cafe owner, Melbourne" },
  { quote: "Finally a local provider that just works. Support actually picks up the phone.", name: "James T.", role: "Tradie, Brisbane" },
  { quote: "Cheaper than where we were, and the dashboard makes renewals painless.", name: "Priya N.", role: "Consultant, Sydney" },
];

const TLDS = [".com.au", ".au", ".com", ".net.au", ".org.au", ".io", ".co", ".net", ".org", ".nz"];

export default function Home() {
  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <Parallax speed={-0.15} className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-brand-50 via-white to-white" />
          <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-brand-200/50 blur-3xl animate-blob" />
          <div className="absolute right-0 top-24 h-80 w-80 rounded-full bg-violet-200/50 blur-3xl animate-blob [animation-delay:-7s]" />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(#15172b 1px, transparent 1px), linear-gradient(90deg, #15172b 1px, transparent 1px)",
              backgroundSize: "44px 44px",
            }}
          />
        </Parallax>

        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-24 lg:grid-cols-2 lg:py-28">
          {/* Left: AI builder pitch */}
          <div className="text-center lg:text-left">
            <Reveal>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-100 bg-white/80 px-3 py-1 text-xs font-semibold text-brand-700 backdrop-blur">
                <SparklesIcon className="h-3.5 w-3.5" /> AI Website Builder · built by Claude
              </span>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-6xl">
                A complete website,{" "}
                <span className="text-gradient">built for you by AI.</span>
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="mx-auto mt-5 max-w-xl text-lg text-slate-600 lg:mx-0">
                Tell us about your business and our AI builds a finished,
                ready-to-launch website — copy, logo, images, FAQs and all.
                Then add the domain, hosting and email to match.
              </p>
            </Reveal>
            <Reveal delay={240}>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                <Link
                  href="/website-builder"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-violet-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-brand-200 transition hover:scale-105"
                >
                  <SparklesIcon className="h-5 w-5" /> Build my website free
                </Link>
                <Link
                  href="#domains"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 font-semibold text-slate-700 transition hover:border-brand-300"
                >
                  <GlobeIcon className="h-5 w-5 text-brand-600" /> Search a domain
                </Link>
              </div>
            </Reveal>
            <Reveal delay={320}>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-500 lg:justify-start">
                {["No design skills", "Ready in minutes", "Logo & images included", "Free preview"].map((t) => (
                  <span key={t} className="inline-flex items-center gap-1.5">
                    <CheckIcon className="h-4 w-4 text-brand-600" /> {t}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Right: live website mockup */}
          <Reveal delay={200} className="relative">
            <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-brand-200/40 to-violet-200/40 blur-2xl" />
            <Parallax speed={0.06}>
              <BrowserMockup primary="#ec008c" accent="#7c3aed" domain="yourbusiness.com.au" className="rotate-1" />
            </Parallax>
            <div className="absolute -bottom-5 -left-5 hidden rounded-2xl border border-slate-100 bg-white p-4 shadow-xl sm:flex sm:items-center sm:gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <SparklesIcon className="h-5 w-5" />
              </span>
              <div className="text-left">
                <p className="text-sm font-semibold">Generated in 30s</p>
                <p className="text-xs text-slate-500">copy · logo · images</p>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Domain search bar */}
        <div id="domains" className="mx-auto -mt-6 max-w-6xl px-6 pb-10">
          <Reveal className="flex w-full justify-center">
            <DomainSearch />
          </Reveal>
        </div>

        {/* TLD marquee */}
        <div className="relative overflow-hidden border-y border-slate-100 bg-white/60 py-4">
          <div className="flex w-max animate-marquee gap-10 px-6 text-sm font-semibold text-slate-400">
            {[...TLDS, ...TLDS].map((t, i) => (
              <span key={i} className="whitespace-nowrap">{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-ink py-16 text-white">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-6 text-center sm:grid-cols-4">
          {[
            { to: 590, suffix: "+", label: "Domain extensions" },
            { to: 99, suffix: ".9%", label: "Uptime target" },
            { to: 24, suffix: "/7", label: "Monitoring" },
            { to: 100, suffix: "%", label: "Australian owned" },
          ].map((s) => (
            <Reveal key={s.label}>
              <div className="text-4xl font-bold text-gradient">
                <Counter to={s.to} suffix={s.suffix} />
              </div>
              <p className="mt-2 text-sm text-white/60">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Products */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to get online
            </h2>
          </Reveal>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PRODUCTS.map(({ href, title, body, Icon }, i) => (
              <Reveal key={title} delay={i * 90}>
                <Link
                  href={href}
                  className="group block h-full rounded-2xl border border-slate-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-xl hover:shadow-brand-100/50"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition group-hover:scale-110">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold group-hover:text-brand-600">{title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{body}</p>
                  <span className="mt-4 inline-block text-sm font-semibold text-brand-600">
                    Explore →
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-slate-50 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
              Online in three simple steps
            </h2>
          </Reveal>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 120}>
                <div className="relative rounded-2xl bg-white p-8">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-violet-500 text-lg font-bold text-white">
                    {s.n}
                  </span>
                  <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ title, body, Icon }, i) => (
              <Reveal key={title} delay={i * 90}>
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white animate-float" style={{ animationDelay: `${i * 0.4}s` }}>
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="mt-1.5 text-sm text-slate-600">{body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-slate-50 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
              Loved by Australian businesses
            </h2>
          </Reveal>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} delay={i * 110}>
                <figure className="h-full rounded-2xl border border-slate-200 bg-white p-6">
                  <div className="text-brand-500">{"★★★★★"}</div>
                  <blockquote className="mt-3 text-slate-700">“{t.quote}”</blockquote>
                  <figcaption className="mt-4 text-sm font-semibold">
                    {t.name}{" "}
                    <span className="font-normal text-slate-400">· {t.role}</span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
              Questions, answered
            </h2>
          </Reveal>
          <Reveal delay={120} className="mt-12">
            <Faq />
          </Reveal>
        </div>
      </section>

      {/* AI builder CTA */}
      <section className="pb-24">
        <div className="mx-auto max-w-5xl px-6">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-violet-600 px-8 py-16 text-center text-white sm:px-16">
              <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl animate-blob" />
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                <SparklesIcon className="h-3.5 w-3.5" /> AI Website Builder
              </span>
              <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
                Enter your details. Get a website.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-white/90">
                Tell us about your business and our AI builds you a fresh,
                ready-to-go website — matched to your logo and colours.
              </p>
              <Link
                href="/website-builder"
                className="mt-8 inline-block rounded-lg bg-white px-6 py-3 font-semibold text-brand-700 transition hover:scale-105"
              >
                Build my website
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
