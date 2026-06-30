import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/supabase/server";
import { createTransferRequest } from "@/lib/supabase/services";
import { sendEmail, emailLayout, escapeHtml } from "@/lib/email/send";
import { adminEmails } from "@/lib/auth/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  domain: z
    .string()
    .trim()
    .toLowerCase()
    .min(3)
    .max(253)
    .regex(/^[a-z0-9.-]+\.[a-z.]{2,}$/i, "Enter a valid domain name."),
  authCode: z.string().trim().max(255).optional(),
});

/** POST /api/account/transfer — submit a domain transfer-in request. */
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
    const msg = parsed.error.issues[0]?.message ?? "Invalid request.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const { domain, authCode } = parsed.data;
  const stored = await createTransferRequest({
    email: user.email,
    userId: user.id,
    domain,
    authCode: authCode || null,
  });

  // Notify the team and the customer (best-effort).
  const owner = adminEmails()[0];
  if (owner) {
    await sendEmail({
      to: owner,
      subject: `Domain transfer request — ${domain}`,
      html: emailLayout(
        "New transfer request",
        `<p><strong>${escapeHtml(domain)}</strong></p>` +
          `<p>From: ${escapeHtml(user.email)}</p>` +
          (authCode ? `<p>Auth/EPP code provided.</p>` : `<p>No auth code yet.</p>`),
      ),
    });
  }
  await sendEmail({
    to: user.email,
    subject: `We've received your transfer request for ${domain}`,
    html: emailLayout(
      "Transfer request received",
      `<p>Thanks — we've received your request to transfer <strong>${escapeHtml(domain)}</strong> to GenX Digital.</p>` +
        `<p>We'll be in touch with the next steps. Transfers usually take 5–7 days once the current registrar releases the domain.</p>`,
    ),
  });

  return NextResponse.json({ ok: true, stored });
}
