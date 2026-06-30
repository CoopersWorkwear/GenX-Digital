import { NextResponse } from "next/server";
import { dreamscapeRequest } from "@/lib/dreamscape/client";
import { getDreamscapeConfig, isDreamscapeConfigured } from "@/lib/dreamscape/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * TEMPORARY diagnostic endpoint.
 *
 * Returns the RAW Dreamscape responses so we can map the real field names for
 * availability + pricing (the public docs block automated scraping, so the
 * exact shapes are confirmed here against the sandbox).
 *
 * Safety: disabled entirely when DREAMSCAPE_ENV is "production", so it can
 * never leak real cost prices. Remove this route once pricing is wired.
 */

// Candidate endpoints for TLD/domain pricing — we probe each and report which
// one the sandbox actually serves.
const PRICING_CANDIDATES = [
  "/handbooks/tlds",
  "/handbooks/tld",
  "/domains/tlds",
  "/domains/prices",
  "/domains/pricing",
  "/tlds",
  "/products/domains",
  "/products/domain/prices",
];

async function probe(path: string, query?: Record<string, unknown>) {
  try {
    const data = await dreamscapeRequest(path, {
      query: query as never,
      timeoutMs: 8000,
    });
    return { path, ok: true, data };
  } catch (err) {
    const e = err as { status?: number; message?: string };
    return { path, ok: false, status: e.status ?? null, error: e.message };
  }
}

export async function GET(request: Request) {
  if (!isDreamscapeConfigured()) {
    return NextResponse.json(
      { error: "DREAMSCAPE_API_KEY not configured." },
      { status: 200 },
    );
  }

  const { env } = getDreamscapeConfig();
  if (env === "production") {
    return NextResponse.json({ error: "Disabled in production." }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("query") || "coopersworkwear").toLowerCase();
  const domain = query.includes(".") ? query : `${query}.com.au`;

  const availability = await probe("/domains/availability", {
    domain_names: [domain],
  });

  const pricing = [];
  for (const path of PRICING_CANDIDATES) {
    pricing.push(await probe(path));
  }

  return NextResponse.json(
    { env, testedDomain: domain, availability, pricing },
    { status: 200 },
  );
}
