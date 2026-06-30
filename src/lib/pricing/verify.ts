import "server-only";
import { checkAvailability } from "@/lib/dreamscape/domains";
import { getProductPlans } from "@/lib/dreamscape/products";
import { isDreamscapeConfigured } from "@/lib/dreamscape/config";
import { retailPrice } from "@/lib/pricing";
import type { ProductCategory } from "@/lib/dreamscape/types";

interface CartItemInput {
  id: string;
  type: string;
  name: string;
  price: number;
}

const PRODUCT_TYPES: ProductCategory[] = ["hosting", "ssl", "email"];

/**
 * Re-derive the authoritative cart total server-side from Dreamscape, so the
 * charged amount can't be tampered with by the browser. Falls back to the
 * submitted price for any item that can't be re-verified (e.g. Dreamscape
 * unavailable) so checkout never hard-fails.
 */
export async function verifyCartTotal(items: CartItemInput[]): Promise<number> {
  if (!isDreamscapeConfigured()) {
    return round(items.reduce((sum, i) => sum + i.price, 0));
  }

  const verified = new Map<string, number>();

  // Domains: re-check availability pricing.
  const domains = items
    .filter((i) => i.type === "domain")
    .map((i) => i.id.replace(/^domain:/, ""));
  if (domains.length > 0) {
    try {
      for (const row of await checkAvailability(domains)) {
        const price = retailPrice(row.costPrice);
        if (price !== undefined) verified.set(`domain:${row.domainName}`, price);
      }
    } catch {
      /* fall back to submitted prices */
    }
  }

  // Products: re-fetch plans for each category present in the cart.
  const categories = new Set(
    items
      .filter((i) => PRODUCT_TYPES.includes(i.type as ProductCategory))
      .map((i) => i.type as ProductCategory),
  );
  for (const category of categories) {
    try {
      for (const plan of await getProductPlans(category)) {
        const price = retailPrice(plan.costPrice);
        if (price !== undefined) verified.set(`${category}:${plan.id}`, price);
      }
    } catch {
      /* fall back */
    }
  }

  const total = items.reduce(
    (sum, item) => sum + (verified.get(item.id) ?? item.price),
    0,
  );
  return round(total);
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
