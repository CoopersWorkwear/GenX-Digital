/**
 * Hosting / SSL / email product plans from the Dreamscape API.
 * SERVER-SIDE ONLY.
 *
 * Confirmed endpoint: GET /products/plans — a single paginated list of all
 * products. Each product has a `type_id` (category) and a `periods` array,
 * each period carrying `price.wholesale` (our cost), `price.register` (RRP) and
 * `price.renew`. We base retail pricing on the wholesale cost + margin.
 */

import "server-only";
import { dreamscapeRequest } from "./client";
import type { ProductCategory, ProductPlan } from "./types";

/** Dreamscape product `type_id` -> our storefront category. */
const TYPE_CATEGORY: Record<number, ProductCategory> = {
  8: "hosting", // Linux Hosting
  38: "hosting", // Windows Hosting
  11: "ssl", // SSL Certificates
  9: "email", // Email Hosting
  16: "email", // Hosted Email Exchange
};

interface RawPeriod {
  period: number;
  is_free_trial?: boolean;
  price?: { wholesale?: string; register?: string; renew?: string };
}
interface RawProduct {
  id: number;
  type_id: number;
  name: string;
  periods?: RawPeriod[];
}

export async function getProductPlans(
  category: ProductCategory,
): Promise<ProductPlan[]> {
  const all = await fetchAllProducts();
  return all
    .filter((p) => TYPE_CATEGORY[p.type_id] === category)
    .map((p) => toPlan(p, category))
    .filter((p): p is ProductPlan => p !== null);
}

async function fetchAllProducts(): Promise<RawProduct[]> {
  const out: RawProduct[] = [];
  let page = 1;
  let totalPages = 1;
  do {
    const payload = await dreamscapeRequest<{
      data?: RawProduct[];
      pagination?: { total_pages?: number };
    }>("/products/plans", { query: { page, per_page: 100 } });
    if (Array.isArray(payload?.data)) out.push(...payload.data);
    totalPages = payload?.pagination?.total_pages ?? 1;
    page += 1;
  } while (page <= totalPages && page <= 10);
  return out;
}

function toPlan(p: RawProduct, category: ProductCategory): ProductPlan | null {
  const period = pickAnnualPeriod(p.periods);
  const wholesale = num(period?.price?.wholesale);
  if (wholesale === undefined) return null;
  return {
    id: String(p.id),
    name: p.name,
    category,
    costPrice: wholesale,
    currency: "AUD",
    billingCycle: period?.period === 12 ? "annually" : `${period?.period} months`,
  };
}

/** Prefer the 12-month (annual) paid period; fall back to the first paid one. */
function pickAnnualPeriod(periods?: RawPeriod[]): RawPeriod | undefined {
  if (!periods?.length) return undefined;
  const paid = periods.filter((p) => (num(p.price?.wholesale) ?? 0) > 0);
  return (
    paid.find((p) => p.period === 12) ??
    paid[0] ??
    periods.find((p) => p.period === 12) ??
    periods[0]
  );
}

function num(v: unknown): number | undefined {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v)))
    return Number(v);
  return undefined;
}
