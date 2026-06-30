import "server-only";
import Stripe from "stripe";

/**
 * Stripe client (server-side). Returns null until STRIPE_SECRET_KEY is set, so
 * card features degrade gracefully. Cards are stored in Stripe's vault — we
 * never hold raw card numbers, only a Stripe customer reference.
 */

let cached: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (cached) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  cached = new Stripe(key);
  return cached;
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
