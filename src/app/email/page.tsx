import type { Metadata } from "next";
import { ProductCatalogue } from "@/components/ProductCatalogue";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Business Email",
  description: "Professional email hosting on your own domain.",
};

export default function EmailPage() {
  return (
    <main>
      <PageHero
        title="Business Email"
        subtitle="Look professional with email on your own domain — calendars, contacts and generous mailbox storage included."
      />
      <div className="mx-auto max-w-6xl px-6 py-16">
        <ProductCatalogue category="email" cartType="email" />
      </div>
    </main>
  );
}
