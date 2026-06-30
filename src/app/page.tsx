import Link from "next/link";
import { DomainSearch } from "@/components/DomainSearch";

const PRODUCTS = [
  {
    href: "/domains",
    title: "Domains",
    body: "Search and register .com.au, .au, .com and 590+ extensions.",
  },
  {
    href: "/hosting",
    title: "Web Hosting",
    body: "Fast, reliable hosting plans for sites of every size.",
  },
  {
    href: "/ssl",
    title: "SSL Certificates",
    body: "Secure your site and build customer trust with HTTPS.",
  },
  {
    href: "/email",
    title: "Business Email",
    body: "Professional email on your own domain.",
  },
];

export default function Home() {
  return (
    <main>
      {/* Hero + domain search */}
      <section className="mx-auto flex max-w-6xl flex-col items-center px-6 py-20 text-center">
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
          Your business online, start to finish.
        </h1>
        <p className="mt-4 max-w-xl text-lg text-slate-600">
          Find the perfect domain, then add hosting, SSL and email — all in one
          place.
        </p>
        <div className="mt-10 flex w-full justify-center">
          <DomainSearch />
        </div>
      </section>

      {/* Products */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PRODUCTS.map((p) => (
              <Link
                key={p.title}
                href={p.href}
                className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-brand-300 hover:shadow-sm"
              >
                <h3 className="text-lg font-semibold group-hover:text-brand-600">
                  {p.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600">{p.body}</p>
                <span className="mt-4 inline-block text-sm font-semibold text-brand-600">
                  Explore →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* AI website builder teaser */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
            New
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight">
            Enter your domain. Get a website.
          </h2>
          <p className="mt-4 text-slate-600">
            Register a domain with us and our AI builds you a fresh, ready-to-go
            website — then emails you the link. No design skills needed.
          </p>
          <Link
            href="/website-builder"
            className="mt-8 inline-block rounded-lg bg-brand-600 px-6 py-3 font-semibold text-white transition hover:bg-brand-700"
          >
            Try the website builder
          </Link>
        </div>
      </section>
    </main>
  );
}
