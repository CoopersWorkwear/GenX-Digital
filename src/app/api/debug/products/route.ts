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
  // hosting variants
  "/web-hosting",
  "/web-hosting/plans",
  "/web-hosting/products",
  "/webhosting",
  "/web_hosting",
  "/hosting",
  "/hosting/products",
  "/whm-hosting",
  // ssl variants
  "/ssl",
  "/ssl/products",
  "/ssl-certificates",
  "/ssl-certificate",
  "/ssl_certificate",
  "/ssl-certificates/plans",
  // email variants
  "/email",
  "/email-hosting",
  "/email_hosting",
  "/email-hosting/plans",
  // generic product/plan listings
  "/products/plans",
  "/product/plans",
  "/plans",
  "/product_plans",
  "/services",
  "/services/plans",
  "/handbooks/products",
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
