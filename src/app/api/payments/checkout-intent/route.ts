import { NextResponse } from "next/server";
import { z } from "zod";
import { getStripe } from "@/lib/stripe/server";
import { getOrCreateStripeCustomer } from "@/lib/stripe/customer";
import { getCurrentUser } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  email: z.string().trim().email().max(320),
  items: z
    .array(
      z.object({
        id: z.string(),
        type: z.string(),
        name: z.string(),
        price: z.number().nonnegative(),
      }),
    )
    .min(1),
});

/**
 * POST /api/payments/checkout-intent — create a Stripe PaymentIntent for the
 * current cart and return its client secret for Stripe Elements to confirm.
 *
 * NOTE (pre go-live): the amount is derived from the submitted item prices.
 * Before taking real payments, re-verify each price server-side against the
 * Dreamscape API so totals can't be tampered with client-side.
 */
export async function POST(request: Request) {
  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ configured: false });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid cart." }, { status: 400 });
  }

  const { email, items } = parsed.data;
  const total = items.reduce((sum, i) => sum + i.price, 0);
  const amount = Math.round(total * 100); // AUD cents
  if (amount <= 0 || amount > 5_000_000) {
    return NextResponse.json({ error: "Invalid amount." }, { status: 400 });
  }

  const user = await getCurrentUser();
  const customer = user ? await getOrCreateStripeCustomer(stripe, user) : undefined;

  const intent = await stripe.paymentIntents.create({
    amount,
    currency: "aud",
    customer,
    receipt_email: email,
    automatic_payment_methods: { enabled: true },
    metadata: {
      item_count: String(items.length),
      user_id: user?.id ?? "",
    },
  });

  return NextResponse.json({
    configured: true,
    clientSecret: intent.client_secret,
    paymentIntentId: intent.id,
    amount,
  });
}
