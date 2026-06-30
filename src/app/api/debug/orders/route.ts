import { NextResponse } from "next/server";
import { dreamscapeRequest } from "@/lib/dreamscape/client";
import { getDreamscapeConfig, isDreamscapeConfigured } from "@/lib/dreamscape/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * TEMPORARY, read-only discovery for the Dreamscape order/customer/provisioning
 * API. Probes GET endpoints only (no mutations) so we can map the resources
 * needed to auto-register domains/products after payment. Disabled in
 * production. Remove once provisioning is wired.
 */
const CANDIDATES = [
  "/customers",
  "/orders",
  "/domains",
  "/balance",
  "/account",
  "/account/balance",
  "/reseller/balance",
  "/invoices",
  "/services",
  "/products/orders",
  "/domains/list",
];

async function probe(path: string) {
  try {
    const data = await dreamscapeRequest(path, { timeoutMs: 8000 });
    const json = JSON.stringify(data);
    return { path, ok: true, sample: json.slice(0, 600) };
  } catch (err) {
    const e = err as { status?: number; message?: string };
    return { path, ok: false, status: e.status ?? null, error: e.message };
  }
}

export async function GET() {
  if (!isDreamscapeConfigured()) {
    return NextResponse.json({ error: "DREAMSCAPE_API_KEY not configured." });
  }
  if (getDreamscapeConfig().env === "production") {
    return NextResponse.json({ error: "Disabled in production." }, { status: 404 });
  }

  const results = [];
  for (const path of CANDIDATES) results.push(await probe(path));
  return NextResponse.json({ results });
}
