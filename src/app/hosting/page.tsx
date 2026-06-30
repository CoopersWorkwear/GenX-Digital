import type { Metadata } from "next";
import { ProductCatalogue } from "@/components/ProductCatalogue";

export const metadata: Metadata = {
  title: "Web Hosting",
  description: "Fast, reliable web hosting plans for Australian businesses.",
};

export default function HostingPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Web Hosting</h1>
      <p className="mt-3 max-w-2xl text-slate-600">
        Fast, reliable hosting backed by Australian infrastructure. Pick a plan
        and add it to your cart alongside your domain.
      </p>
      <div className="mt-10">
        <ProductCatalogue category="hosting" cartType="hosting" />
      </div>
    </main>
  );
}
