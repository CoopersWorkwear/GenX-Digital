import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const requestSchema = z.object({
  domain: z.string().trim().min(1).max(253),
  email: z.string().trim().email().max(320),
  businessName: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(2000),
});

/**
 * POST /api/website-builder — queue an AI website build request.
 *
 * Generation (via the Lovable integration) and the notification email are
 * added once those connectors are authorised. For now we capture and log the
 * request so nothing is lost and the customer gets a confirmation.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please complete all fields." }, { status: 400 });
  }

  // TODO(phase: AI builder): once Lovable + an email provider are connected,
  // kick off the build and email the preview link from here.
  console.log("[website-builder] request queued:", {
    domain: parsed.data.domain,
    email: parsed.data.email,
    businessName: parsed.data.businessName,
  });

  return NextResponse.json({ ok: true, queued: true });
}
