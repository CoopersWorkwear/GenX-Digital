import Link from "next/link";
import { NewsletterForm } from "@/components/NewsletterForm";

const COLUMNS = [
  {
    title: "Products",
    links: [
      { href: "/domains", label: "Domain Names" },
      { href: "/hosting", label: "Web Hosting" },
      { href: "/ssl", label: "SSL Certificates" },
      { href: "/email", label: "Business Email" },
      { href: "/website-builder", label: "AI Website Builder" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
      { href: "/support", label: "Support" },
      { href: "/account", label: "My account" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/terms", label: "Terms of Service" },
      { href: "/privacy", label: "Privacy Policy" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-slate-100">
      <div className="bg-gradient-to-br from-brand-600 to-violet-600 text-white">
        <div className="mx-auto max-w-6xl px-6 py-12 sm:flex sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-bold">Domain deals &amp; online-business tips</h3>
            <p className="mt-1 text-sm text-white/80">
              The occasional email with offers and helpful guides. No spam.
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <NewsletterForm />
          </div>
        </div>
      </div>
      <div className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="GenX Digital" className="h-7 w-auto" />
            <p className="mt-3 max-w-xs text-sm text-slate-500">
              Domains, hosting, SSL and business email for Australian
              businesses.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-slate-900">{col.title}</h4>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-500 hover:text-brand-600"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 border-t border-slate-200 pt-6 text-sm text-slate-400">
          © {new Date().getFullYear()} GenX Digital · genxdigital.com.au · All
          prices in AUD
        </div>
        </div>
      </div>
    </footer>
  );
}
