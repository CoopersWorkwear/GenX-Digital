import "server-only";
import type Stripe from "stripe";
import type { User } from "@supabase/supabase-js";
import { getSupabaseAdminConfig } from "@/lib/supabase/config";

/**
 * Resolve (or create) the Stripe customer for a signed-in user, storing the
 * customer id in the user's Supabase auth metadata so cards persist across
 * sessions. No new database table required.
 */
export async function getOrCreateStripeCustomer(
  stripe: Stripe,
  user: User,
): Promise<string> {
  const existing = (user.user_metadata?.stripe_customer_id as string) || null;
  if (existing) return existing;

  const customer = await stripe.customers.create({
    email: user.email ?? undefined,
    metadata: { supabase_user_id: user.id },
  });

  await saveCustomerId(user.id, customer.id);
  return customer.id;
}

/** Persist the Stripe customer id to the auth user's metadata (admin REST). */
async function saveCustomerId(userId: string, customerId: string): Promise<void> {
  const config = getSupabaseAdminConfig();
  if (!config) return;
  await fetch(`${config.url}/auth/v1/admin/users/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      apikey: config.serviceRoleKey,
      Authorization: `Bearer ${config.serviceRoleKey}`,
    },
    body: JSON.stringify({ user_metadata: { stripe_customer_id: customerId } }),
  });
}
