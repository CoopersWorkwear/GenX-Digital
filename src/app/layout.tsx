import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/lib/cart/CartContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SiteShell } from "@/components/SiteShell";

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
          <SiteShell header={<Header />} footer={<Footer />}>
            {children}
          </SiteShell>
        </CartProvider>
      </body>
    </html>
  );
}
