"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const KEY = "genx_cookie_ok";

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setShow(true);
    } catch {
      /* ignore */
    }
  }, []);

  function accept() {
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
    setShow(false);
  }

  if (!show) return null;
  return (
    <div className="fixed inset-x-4 bottom-4 z-40 mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur sm:flex sm:items-center sm:justify-between sm:gap-4">
      <p className="text-sm text-slate-600">
        We use cookies to keep the site working and improve your experience. See
        our{" "}
        <Link href="/privacy" className="font-semibold text-brand-600">
          privacy policy
        </Link>
        .
      </p>
      <button
        onClick={accept}
        className="mt-3 w-full rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 sm:mt-0 sm:w-auto"
      >
        Got it
      </button>
    </div>
  );
}
