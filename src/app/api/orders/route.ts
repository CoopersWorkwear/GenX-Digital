import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdminConfig } from "@/lib/supabase/config";
import { getCurrentUser } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const orderSchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(320),
  phone: z.string().trim().max(50).optional().nullable(),
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
  total: z.number().nonnegative(),
});

type Order = z.infer<typeof orderSchema>;

/**
 * POST /api/orders — record an order request.
 *
 * When Supabase is configured the order is persisted; otherwise it's logged
 * server-side and accepted, so the checkout flow works before the database is
 * connected. Payment capture + Dreamscape provisioning are added in a later
 * phase.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid order details." }, { status: 400 });
  }

  const order = parsed.data;
  // Link the order to the signed-in user, if any.
  const user = await getCurrentUser();
  const userId = user?.id ?? null;
  const supabase = getSupabaseAdminConfig();

  if (!supabase) {
    // Database not connected yet — don't lose the order.
    console.log("[orders] received (no DB configured):", {
      email: order.email,
      itemCount: order.items.length,
      total: order.total,
    });
    return NextResponse.json({ ok: true, persisted: false });
  }

  try {
    const orderId = await persistOrder(supabase, order, userId);
    return NextResponse.json({ ok: true, persisted: true, orderId });
  } catch (err) {
    console.error("[orders] persist failed", (err as Error).message);
    // Still acknowledge so the customer isn't blocked; we have the server log.
    return NextResponse.json({ ok: true, persisted: false });
  }
}

/** Insert order + items via the Supabase REST (PostgREST) API. */
async function persistOrder(
  supabase: { url: string; serviceRoleKey: string },
  order: Order,
  userId: string | null,
): Promise<string> {
  const headers = {
    "Content-Type": "application/json",
    apikey: supabase.serviceRoleKey,
    Authorization: `Bearer ${supabase.serviceRoleKey}`,
    Prefer: "return=representation",
  };

  const orderRes = await fetch(`${supabase.url}/rest/v1/orders`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      email: order.email,
      user_id: userId,
      status: "pending",
      subtotal: order.total,
      total: order.total,
    }),
  });
  if (!orderRes.ok) throw new Error(`orders insert ${orderRes.status}`);
  const [row] = (await orderRes.json()) as Array<{ id: string }>;

  const items = order.items.map((item) => ({
    order_id: row.id,
    product_type: item.type,
    product_ref: item.id,
    description: item.name,
    unit_price: item.price,
    quantity: 1,
  }));
  await fetch(`${supabase.url}/rest/v1/order_items`, {
    method: "POST",
    headers,
    body: JSON.stringify(items),
  });

  return row.id;
}
