import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GenX Digital — Domains, Hosting, SSL & Email",
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
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
