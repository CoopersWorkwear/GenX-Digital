"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart/CartContext";
import { createSupabaseBrowserClient, isSupabaseAuthConfigured } from "@/lib/supabase/browser";
import { CartIcon, UserIcon } from "@/components/icons";

const NAV = [
  { href: "/domains", label: "Domains" },
  { href: "/hosting", label: "Hosting" },
  { href: "/ssl", label: "SSL" },
  { href: "/email", label: "Email" },
  { href: "/website-builder", label: "Website Builder" },
];

export function Header() {
  const { count } = useCart();
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    if (!isSupabaseAuthConfigured()) return;
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => setSignedIn(Boolean(data.user)));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      setSignedIn(Boolean(session?.user)),
    );
    return () => sub.subscription.unsubscribe();
  }, []);

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

        <div className="flex items-center gap-2">
          <Link
            href={signedIn ? "/account" : "/login"}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:text-brand-600"
          >
            <UserIcon className="h-4 w-4" />
            <span className="hidden sm:inline">{signedIn ? "Account" : "Log in"}</span>
          </Link>
          <Link
            href="/cart"
            className="relative inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:border-brand-300 hover:text-brand-600"
          >
            <CartIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Cart</span>
            {count > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1.5 text-xs font-bold text-white">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
