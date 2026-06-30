import { DomainSearch } from "@/components/DomainSearch";

const PRODUCTS = [
  {
    title: "Domains",
    body: "Search and register .com.au, .au, .com and more at competitive prices.",
  },
  {
    title: "Web Hosting",
    body: "Fast, reliable hosting plans for sites of every size.",
  },
  {
    title: "SSL Certificates",
    body: "Secure your site and build customer trust with HTTPS.",
  },
  {
    title: "Business Email",
    body: "Professional email on your own domain.",
  },
];

export default function Home() {
  return (
    <main>
      {/* Header */}
      <header className="border-b border-slate-100">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <span className="text-xl font-bold tracking-tight">
            GenX<span className="text-brand-600">Digital</span>
          </span>
          <nav className="hidden gap-6 text-sm font-medium text-slate-600 sm:flex">
            <a href="#domains" className="hover:text-brand-600">Domains</a>
            <a href="#products" className="hover:text-brand-600">Hosting</a>
            <a href="#products" className="hover:text-brand-600">SSL</a>
            <a href="#builder" className="hover:text-brand-600">Website Builder</a>
          </nav>
        </div>
      </header>

      {/* Hero + domain search */}
      <section
        id="domains"
        className="mx-auto flex max-w-6xl flex-col items-center px-6 py-20 text-center"
      >
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
      <section id="products" className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PRODUCTS.map((p) => (
              <div
                key={p.title}
                className="rounded-2xl border border-slate-200 bg-white p-6"
              >
                <h3 className="text-lg font-semibold">{p.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI website builder teaser (flagship feature, built in a later phase) */}
      <section id="builder" className="py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
            Coming soon
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight">
            Enter your domain. Get a website.
          </h2>
          <p className="mt-4 text-slate-600">
            Register a domain with us and our AI builds you a fresh, ready-to-go
            website — then emails you the link. No design skills needed.
          </p>
        </div>
      </section>

      <footer className="border-t border-slate-100 py-10">
        <div className="mx-auto max-w-6xl px-6 text-sm text-slate-500">
          © {new Date().getFullYear()} GenX Digital · genxdigital.com.au
        </div>
      </footer>
    </main>
  );
}
