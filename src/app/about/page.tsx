import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "About GenX Digital.",
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight">About GenX Digital</h1>
      <div className="mt-6 space-y-4 text-slate-600">
        <p>
          GenX Digital helps Australian businesses get online and stay online —
          domains, web hosting, SSL certificates and professional email, all in
          one place.
        </p>
        <p>
          We make it simple: search a domain, add the hosting and security you
          need, and let our AI website builder get you a site up fast. No
          jargon, no fuss — just everything you need to run your business online.
        </p>
      </div>
    </main>
  );
}
