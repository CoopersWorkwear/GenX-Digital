/** Admin allowlist. Defaults to the business owner; override via ADMIN_EMAILS. */

export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || "info@coopersworkwear.com.au")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email?: string | null): boolean {
  return Boolean(email && adminEmails().includes(email.toLowerCase()));
}
