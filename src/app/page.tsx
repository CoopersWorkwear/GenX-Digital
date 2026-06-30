import Link from "next/link";
import { DomainSearch } from "@/components/DomainSearch";
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

const FEATURES = [
  { title: "Set up in minutes", body: "Search, buy and go live fast — no technical know-how needed.", Icon: BoltIcon },
  { title: "Australian support", body: "Real help from a team that knows local domains and hosting.", Icon: HeadsetIcon },
  { title: "Local & trusted", body: "Built for Australian businesses, with .au eligibility handled.", Icon: MapPinIcon },
  { title: "Secure by default", body: "SSL, secure checkout and your data handled responsibly.", Icon: ShieldIcon },
];

export default function Home() {
  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-50 via-white to-white" />
        <div className="absolute -right-24 -top-24 -z-10 h-72 w-72 rounded-full bg-brand-100 blur-3xl" />
        <div className="mx-auto flex max-w-6xl flex-col items-center px-6 py-24 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-100 bg-white px-3 py-1 text-xs font-semibold text-brand-700">
            <SparklesIcon className="h-3.5 w-3.5" /> Domains, hosting & websites in one place
          </span>
          <h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            Your business online,{" "}
            <span className="text-brand-600">start to finish.</span>
          </h1>
          <p className="mt-4 max-w-xl text-lg text-slate-600">
            Find the perfect domain, then add hosting, SSL and email — all from
            one trusted Australian provider.
          </p>
          <div className="mt-10 flex w-full justify-center">
            <DomainSearch />
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-500">
            {["590+ domain extensions", "Free DNS", "Australian support"].map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5">
                <CheckIcon className="h-4 w-4 text-brand-600" /> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-bold tracking-tight">
            Everything you need to get online
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PRODUCTS.map(({ href, title, body, Icon }) => (
              <Link
                key={title}
                href={href}
                className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-lg font-semibold group-hover:text-brand-600">{title}</h3>
                <p className="mt-2 text-sm text-slate-600">{body}</p>
                <span className="mt-4 inline-block text-sm font-semibold text-brand-600">
                  Explore →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ title, body, Icon }) => (
              <div key={title}>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="mt-1.5 text-sm text-slate-600">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI website builder */}
      <section className="pb-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-brand-700 px-8 py-16 text-center text-white sm:px-16">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
              <SparklesIcon className="h-3.5 w-3.5" /> AI Website Builder
            </span>
            <h2 className="mt-5 text-3xl font-bold tracking-tight">
              Enter your details. Get a website.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-white/90">
              Tell us about your business and our AI builds you a fresh,
              ready-to-go website — matched to your logo and colours.
            </p>
            <Link
              href="/website-builder"
              className="mt-8 inline-block rounded-lg bg-white px-6 py-3 font-semibold text-brand-700 transition hover:bg-brand-50"
            >
              Build my website
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
