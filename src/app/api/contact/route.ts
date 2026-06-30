import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const contactSchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(320),
  message: z.string().trim().min(1).max(4000),
});

/**
 * POST /api/contact — record a contact enquiry. Email delivery is wired once an
 * email provider is connected; for now the enquiry is logged server-side.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please complete all fields." }, { status: 400 });
  }

  console.log("[contact] enquiry:", {
    name: parsed.data.name,
    email: parsed.data.email,
  });

  return NextResponse.json({ ok: true });
}
