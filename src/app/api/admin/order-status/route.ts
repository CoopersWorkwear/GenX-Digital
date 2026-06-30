import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/auth/admin";
import { getSupabaseAdminConfig } from "@/lib/supabase/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  orderId: z.string().uuid(),
  status: z.enum(["pending", "paid", "provisioning", "completed", "failed", "cancelled"]),
});

/** POST /api/admin/order-status — admin-only update of an order's status. */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!isAdminEmail(user?.email)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const config = getSupabaseAdminConfig();
  if (!config) return NextResponse.json({ error: "No database." }, { status: 500 });

  const res = await fetch(
    `${config.url}/rest/v1/orders?id=eq.${parsed.data.orderId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        apikey: config.serviceRoleKey,
        Authorization: `Bearer ${config.serviceRoleKey}`,
      },
      body: JSON.stringify({ status: parsed.data.status }),
    },
  );

  if (!res.ok) {
    return NextResponse.json({ error: "Update failed." }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
