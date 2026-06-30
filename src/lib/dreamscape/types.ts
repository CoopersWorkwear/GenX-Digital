/**
 * Types modelling the Dreamscape Reseller API responses we consume.
 *
 * NOTE: Exact field names should be confirmed against the sandbox once we have
 * an API key (the public docs block automated scraping). These shapes are
 * defensive — parsing in the resource modules tolerates missing fields — and
 * are intentionally easy to adjust in one place when we see real payloads.
 */

export interface DomainAvailability {
  domainName: string;
  available: boolean;
  /** Wholesale/cost price from Dreamscape, if returned, in AUD. */
  costPrice?: number;
  /** Wholesale renewal price from Dreamscape, if returned, in AUD. */
  renewCostPrice?: number;
  currency?: string;
  /** Raw payload for the individual domain, for debugging/iteration. */
  raw?: unknown;
}

export interface TldPrice {
  tld: string; // e.g. "com.au"
  register?: number;
  renew?: number;
  transfer?: number;
  currency: string;
}

export type ProductCategory = "hosting" | "ssl" | "email" | "other";

export interface ProductPlan {
  id: string;
  name: string;
  category: ProductCategory;
  /** Wholesale/cost price from Dreamscape in AUD. */
  costPrice?: number;
  currency: string;
  billingCycle?: string; // e.g. "monthly", "annually"
  description?: string;
  features?: string[];
  raw?: unknown;
}
