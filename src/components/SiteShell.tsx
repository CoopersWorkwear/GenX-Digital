"use client";

import { usePathname } from "next/navigation";
import { ScrollProgress } from "@/components/ux/ScrollProgress";
import { BackToTop } from "@/components/ux/BackToTop";
import { CookieConsent } from "@/components/ux/CookieConsent";

/**
 * Renders the GenX site chrome (header/footer/etc) around the page — except on
 * /preview, which is shown bare so generated customer sites look standalone.
 * `header` and `footer` are passed in as elements from the server layout.
 */
export function SiteShell({
  header,
  footer,
  children,
}: {
  header: React.ReactNode;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // Bare pages: generated customer sites and printable invoices.
  if (pathname?.startsWith("/preview") || pathname?.startsWith("/account/invoices/")) {
    return <>{children}</>;
  }
  return (
    <>
      <ScrollProgress />
      {header}
      <div className="flex-1">{children}</div>
      {footer}
      <BackToTop />
      <CookieConsent />
    </>
  );
}
