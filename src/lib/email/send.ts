import "server-only";

/**
 * Minimal transactional email via Resend. Gated on RESEND_API_KEY + EMAIL_FROM
 * so it no-ops cleanly until an email provider is configured. Returns whether
 * the email was sent.
 */

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

interface EmailInput {
  to: string | string[];
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailInput): Promise<boolean> {
  if (!isEmailConfigured()) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: process.env.EMAIL_FROM, to, subject, html }),
    });
    if (!res.ok) console.error("[email] send failed", res.status);
    return res.ok;
  } catch (err) {
    console.error("[email] send error", (err as Error).message);
    return false;
  }
}

export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** A simple branded HTML wrapper for transactional emails. */
export function emailLayout(title: string, body: string): string {
  return `<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#15172b">
    <h2 style="color:#ec008c">GenX Digital</h2>
    <h3>${title}</h3>
    ${body}
    <hr style="border:none;border-top:1px solid #eee;margin:24px 0" />
    <p style="font-size:12px;color:#94a3b8">GenX Digital · genxdigital.com.au</p>
  </div>`;
}
