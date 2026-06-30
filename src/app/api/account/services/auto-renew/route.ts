import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/supabase/server";
import { setServiceAutoRenew } from "@/lib/supabase/services";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  serviceId: z.string().uuid(),
  autoRenew: z.boolean(),
});

/** POST /api/account/services/auto-renew — toggle auto-renew for one service. */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user?.email) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const ok = await setServiceAutoRenew(parsed.data.serviceId, user.email, parsed.data.autoRenew);
  if (!ok) {
    return NextResponse.json({ error: "Could not update this service." }, { status: 400 });
  }
  return NextResponse.json({ ok: true, autoRenew: parsed.data.autoRenew });
}
