import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/payments/webhook — Stripe event receiver (reconciliation backup).
 *
 * Verifies the signature and logs payment outcomes. Orders are already marked
 * paid on the client after a successful PaymentIntent; this provides a reliable
 * server-side record. Configure the endpoint in Stripe and set
 * STRIPE_WEBHOOK_SECRET to enable verification.
 */
export async function POST(request: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json({ ok: true, configured: false });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  const raw = await request.text();
  let event;
  try {
    event = stripe.webhooks.constructEvent(raw, signature, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  switch (event.type) {
    case "payment_intent.succeeded":
      console.log("[stripe] payment succeeded", (event.data.object as { id: string }).id);
      break;
    case "payment_intent.payment_failed":
      console.warn("[stripe] payment failed", (event.data.object as { id: string }).id);
      break;
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
