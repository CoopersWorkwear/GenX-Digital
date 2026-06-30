import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/lib/cart/CartContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ScrollProgress } from "@/components/ux/ScrollProgress";
import { BackToTop } from "@/components/ux/BackToTop";
import { CookieConsent } from "@/components/ux/CookieConsent";

export const metadata: Metadata = {
  title: {
    default: "GenX Digital — Domains, Hosting, SSL & Email",
    template: "%s · GenX Digital",
  },
  description:
    "Register domains, host your site, secure it with SSL, and get business email — all from GenX Digital.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-AU">
      <body className="flex min-h-screen flex-col antialiased">
        <CartProvider>
          <ScrollProgress />
          <Header />
          <div className="flex-1">{children}</div>
          <Footer />
          <BackToTop />
          <CookieConsent />
        </CartProvider>
      </body>
    </html>
  );
}
