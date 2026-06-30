import { NextResponse } from "next/server";
import { getSupabaseAdminConfig } from "@/lib/supabase/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * TEMPORARY diagnostic for the Supabase connection. Reports which env vars are
 * present (never their values) and attempts a test insert into `orders` with
 * two auth-header styles, returning the status + error so we can pinpoint why
 * persistence isn't working. Remove once orders are saving.
 */
export async function GET() {
  const env = {
    hasUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    hasServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    hasAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    // Helps spot a swapped key: which key "type" is in the service-role slot.
    serviceKeyPrefix: (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").slice(0, 10),
    urlHost: safeHost(process.env.NEXT_PUBLIC_SUPABASE_URL),
  };

  const config = getSupabaseAdminConfig();
  if (!config) {
    return NextResponse.json({ env, configured: false });
  }

  const body = JSON.stringify({
    email: "diagnostic@genxdigital.test",
    status: "pending",
    subtotal: 0,
    total: 0,
  });

  // Style A: apikey + Authorization Bearer (current orders route).
  const a = await tryInsert(config, body, {
    apikey: config.serviceRoleKey,
    Authorization: `Bearer ${config.serviceRoleKey}`,
  });
  // Style B: apikey only.
  const b = await tryInsert(config, body, { apikey: config.serviceRoleKey });

  return NextResponse.json({ env, configured: true, attemptA: a, attemptB: b });
}

async function tryInsert(
  config: { url: string; serviceRoleKey: string },
  body: string,
  authHeaders: Record<string, string>,
) {
  try {
    const res = await fetch(`${config.url}/rest/v1/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Prefer: "return=minimal", ...authHeaders },
      body,
    });
    const text = await res.text();
    return { status: res.status, ok: res.ok, body: text.slice(0, 300) };
  } catch (err) {
    return { status: 0, ok: false, body: (err as Error).message };
  }
}

function safeHost(url?: string): string | null {
  if (!url) return null;
  try {
    return new URL(url).host;
  } catch {
    return "invalid-url";
  }
}
