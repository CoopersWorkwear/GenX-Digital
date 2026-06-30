"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart/CartContext";

const NAV = [
  { href: "/domains", label: "Domains" },
  { href: "/hosting", label: "Hosting" },
  { href: "/ssl", label: "SSL" },
  { href: "/email", label: "Email" },
  { href: "/website-builder", label: "Website Builder" },
];

export function Header() {
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" aria-label="GenX Digital home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="GenX Digital" className="h-8 w-auto" />
        </Link>

        <nav className="hidden gap-6 text-sm font-medium text-slate-600 md:flex">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-brand-600">
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/cart"
          className="relative inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-brand-300 hover:text-brand-600"
        >
          Cart
          {count > 0 && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1.5 text-xs font-bold text-white">
              {count}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
