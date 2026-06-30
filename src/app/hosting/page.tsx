import type { Metadata } from "next";
import { ProductCatalogue } from "@/components/ProductCatalogue";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Web Hosting",
  description: "Fast, reliable web hosting plans for Australian businesses.",
};

export default function HostingPage() {
  return (
    <main>
      <PageHero
        title="Web Hosting"
        subtitle="Fast, reliable hosting backed by Australian infrastructure. Pick a plan and add it to your cart alongside your domain."
      />
      <div className="mx-auto max-w-6xl px-6 py-16">
        <ProductCatalogue category="hosting" cartType="hosting" />
      </div>
    </main>
  );
}
