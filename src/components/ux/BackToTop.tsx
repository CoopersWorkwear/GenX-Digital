"use client";

import { useEffect, useState } from "react";

/** Floating button that scrolls back to top, appearing after some scroll. */
export function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 700);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show) return null;
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      className="fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-brand-600 text-lg text-white shadow-lg shadow-brand-200 transition hover:scale-110 hover:bg-brand-700"
    >
      ↑
    </button>
  );
}
