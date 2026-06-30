import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/server";
import { getOrCreateStripeCustomer } from "@/lib/stripe/customer";
import { getCurrentUser } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/payments/methods — list the signed-in user's saved cards. */
export async function GET() {
  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ configured: false, cards: [] });

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const customerId = await getOrCreateStripeCustomer(stripe, user);
  const methods = await stripe.paymentMethods.list({ customer: customerId, type: "card" });

  const cards = methods.data.map((m) => ({
    id: m.id,
    brand: m.card?.brand ?? "card",
    last4: m.card?.last4 ?? "••••",
    expMonth: m.card?.exp_month ?? null,
    expYear: m.card?.exp_year ?? null,
  }));

  return NextResponse.json({ configured: true, cards });
}

/** DELETE /api/payments/methods?id=pm_xxx — remove a saved card. */
export async function DELETE(request: Request) {
  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ error: "Not configured." }, { status: 400 });

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id." }, { status: 400 });

  // Ensure the card belongs to this user's customer before detaching.
  const customerId = await getOrCreateStripeCustomer(stripe, user);
  const method = await stripe.paymentMethods.retrieve(id);
  if (method.customer !== customerId) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  await stripe.paymentMethods.detach(id);
  return NextResponse.json({ ok: true });
}
