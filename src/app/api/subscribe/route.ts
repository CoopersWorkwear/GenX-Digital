import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({ email: z.string().trim().email().max(320) });

/**
 * POST /api/subscribe — capture a newsletter signup. Logged server-side; wire
 * to an email-marketing list (e.g. a Resend audience) when ready.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body." }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email." }, { status: 400 });
  }
  console.log("[subscribe]", parsed.data.email);
  return NextResponse.json({ ok: true });
}
