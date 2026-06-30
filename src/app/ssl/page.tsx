import type { Metadata } from "next";
import { ProductCatalogue } from "@/components/ProductCatalogue";

export const metadata: Metadata = {
  title: "SSL Certificates",
  description: "Secure your website with trusted SSL certificates.",
};

export default function SslPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight">SSL Certificates</h1>
      <p className="mt-3 max-w-2xl text-slate-600">
        Protect your visitors and earn their trust with HTTPS. Encrypt traffic
        and show the padlock in every browser.
      </p>
      <div className="mt-10">
        <ProductCatalogue category="ssl" cartType="ssl" />
      </div>
    </main>
  );
}
