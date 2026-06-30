import type { Metadata } from "next";
import { ProductCatalogue } from "@/components/ProductCatalogue";

export const metadata: Metadata = {
  title: "Business Email",
  description: "Professional email hosting on your own domain.",
};

export default function EmailPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Business Email</h1>
      <p className="mt-3 max-w-2xl text-slate-600">
        Look professional with email on your own domain — calendars, contacts
        and generous mailbox storage included.
      </p>
      <div className="mt-10">
        <ProductCatalogue category="email" cartType="email" />
      </div>
    </main>
  );
}
