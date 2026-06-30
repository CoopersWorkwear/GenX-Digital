/**
 * Hosting / SSL / email product plans from the Dreamscape API.
 * SERVER-SIDE ONLY.
 *
 * The exact product endpoints still need confirming against the sandbox (the
 * domain endpoints were confirmed via the diagnostic route; products are next).
 * We try a small set of candidate endpoints per category and parse the common
 * `{ status, data: [...] }` envelope defensively, so the catalogue lights up
 * as soon as the right endpoint responds.
 */

import "server-only";
import { dreamscapeRequest } from "./client";
import type { ProductCategory, ProductPlan } from "./types";

const CANDIDATE_ENDPOINTS: Record<ProductCategory, string[]> = {
  hosting: ["/products/hosting/plans", "/products/web-hosting", "/hosting/plans", "/product-plans"],
  ssl: ["/products/ssl/plans", "/products/ssl", "/ssl/plans"],
  email: ["/products/email/plans", "/products/email-hosting", "/email/plans"],
  other: ["/products"],
};

export async function getProductPlans(
  category: ProductCategory,
): Promise<ProductPlan[]> {
  for (const path of CANDIDATE_ENDPOINTS[category]) {
    try {
      const payload = await dreamscapeRequest<unknown>(path, {
        query: { type: category },
        timeoutMs: 8000,
      });
      const plans = parsePlans(payload, category);
      if (plans.length > 0) return plans;
    } catch {
      // try the next candidate endpoint
    }
  }
  return [];
}

function parsePlans(payload: unknown, category: ProductCategory): ProductPlan[] {
  const rows = extractRows(payload);
  return rows.map((row, i) => {
    const r = row as Record<string, unknown>;
    const price = (r.price ?? {}) as Record<string, unknown>;
    return {
      id: str(r.id) ?? str(r.plan_id) ?? str(r.code) ?? `${category}-${i}`,
      name: str(r.name) ?? str(r.title) ?? str(r.plan_name) ?? "Plan",
      category,
      costPrice:
        num(r.price) ??
        num(price.register) ??
        num(price.monthly) ??
        num(r.monthly_price) ??
        num(r.cost),
      currency: str(r.currency) ?? "AUD",
      billingCycle: str(r.billing_cycle) ?? str(r.period) ?? "annually",
      description: str(r.description),
      features: parseFeatures(r.features),
      raw: row,
    };
  });
}

function parseFeatures(value: unknown): string[] | undefined {
  if (Array.isArray(value)) return value.map((v) => String(v));
  return undefined;
}

function extractRows(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    for (const key of ["data", "plans", "products", "results"]) {
      if (Array.isArray(obj[key])) return obj[key] as unknown[];
    }
  }
  return [];
}

function str(v: unknown): string | undefined {
  return typeof v === "string" && v.length > 0 ? v : undefined;
}

function num(v: unknown): number | undefined {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v)))
    return Number(v);
  return undefined;
}
