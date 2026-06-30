import type { Metadata } from "next";
import { ProductCatalogue } from "@/components/ProductCatalogue";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "SSL Certificates",
  description: "Secure your website with trusted SSL certificates.",
};

export default function SslPage() {
  return (
    <main>
      <PageHero
        title="SSL Certificates"
        subtitle="Protect your visitors and earn their trust with HTTPS. Encrypt traffic and show the padlock in every browser."
      />
      <div className="mx-auto max-w-6xl px-6 py-16">
        <ProductCatalogue category="ssl" cartType="ssl" />
      </div>
    </main>
  );
}
