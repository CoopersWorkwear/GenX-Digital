import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/server";
import { getOrCreateStripeCustomer } from "@/lib/stripe/customer";
import { getCurrentUser } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/payments/setup-intent — start saving a card for the signed-in user.
 * Returns a SetupIntent client secret for Stripe Elements to confirm. The card
 * is stored in Stripe; we never see the raw number.
 */
export async function POST() {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ configured: false }, { status: 200 });
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const customerId = await getOrCreateStripeCustomer(stripe, user);
  const intent = await stripe.setupIntents.create({
    customer: customerId,
    payment_method_types: ["card"],
  });

  return NextResponse.json({ configured: true, clientSecret: intent.client_secret });
}
