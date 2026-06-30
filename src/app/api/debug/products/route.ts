import { NextResponse } from "next/server";
import { dreamscapeRequest } from "@/lib/dreamscape/client";
import { getDreamscapeConfig, isDreamscapeConfigured } from "@/lib/dreamscape/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * TEMPORARY diagnostic: probe candidate product endpoints (hosting, SSL, email)
 * so the real shapes can be mapped — mirrors what we did for domain pricing.
 * Disabled in production. Remove once the product catalogue is wired.
 */
const CANDIDATES = [
  "/products",
  "/products/hosting",
  "/products/hosting/plans",
  "/products/web-hosting",
  "/products/ssl",
  "/products/ssl/plans",
  "/products/email",
  "/products/email/plans",
  "/product-plans",
  "/hosting/plans",
  "/ssl/plans",
];

async function probe(path: string) {
  try {
    const data = await dreamscapeRequest(path, { timeoutMs: 8000 });
    return { path, ok: true, data };
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
