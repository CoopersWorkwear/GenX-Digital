import { NextResponse } from "next/server";
import { checkAvailability } from "@/lib/dreamscape/domains";
import { DreamscapeApiError } from "@/lib/dreamscape/client";
import { isDreamscapeConfigured } from "@/lib/dreamscape/config";
import { retailPrice, formatAud } from "@/lib/pricing";
import {
  domainSearchSchema,
  expandQueryToDomains,
} from "@/lib/validation";

export const runtime = "nodejs"; // crypto signing needs the Node runtime
export const dynamic = "force-dynamic";

/**
 * GET /api/domains/availability?query=example
 *
 * Returns availability + retail pricing for the expanded domain list. The
 * Dreamscape secret never leaves the server — the browser only talks to this
 * route.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = domainSearchSchema.safeParse({
    query: searchParams.get("query") ?? "",
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid query" },
      { status: 400 },
    );
  }

  const domains = expandQueryToDomains(parsed.data.query);
  if (domains.length === 0) {
    return NextResponse.json(
      { error: "That doesn't look like a valid domain." },
      { status: 400 },
    );
  }

  // Without credentials we can't talk to Dreamscape. Return a clear, typed
  // signal so the UI can show a "connect your API key" state in development.
  if (!isDreamscapeConfigured()) {
    return NextResponse.json(
      {
        configured: false,
        query: parsed.data.query,
        results: [],
        message:
          "Dreamscape API key not configured. Add DREAMSCAPE_API_KEY to .env.local.",
      },
      { status: 200 },
    );
  }

  try {
    const availability = await checkAvailability(domains);
    const results = availability.map((row) => {
      const price = retailPrice(row.costPrice);
      const renewPrice = retailPrice(row.renewCostPrice);
      return {
        domainName: row.domainName,
        available: row.available,
        price: price ?? null,
        priceFormatted: formatAud(price),
        renewPrice: renewPrice ?? null,
        renewPriceFormatted: formatAud(renewPrice),
      };
    });

    return NextResponse.json({ configured: true, query: parsed.data.query, results });
  } catch (err) {
    if (err instanceof DreamscapeApiError) {
      // Don't leak internal details; log server-side, return a generic message.
      console.error("[dreamscape] availability error", {
        status: err.status,
        message: err.message,
      });
      return NextResponse.json(
        { error: "We couldn't check that domain right now. Please try again." },
        { status: 502 },
      );
    }
    throw err;
  }
}
