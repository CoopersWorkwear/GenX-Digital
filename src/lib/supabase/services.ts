import "server-only";
import { getSupabaseAdminConfig } from "./config";
import { getOrdersByEmail } from "./orders";

export type ServiceType = "domain" | "hosting" | "ssl" | "email" | "website_build";

export interface ServiceRow {
  id: string;
  user_id: string | null;
  email: string;
  type: ServiceType;
  name: string;
  status: "active" | "pending" | "expired" | "cancelled";
  auto_renew: boolean;
  order_id: string | null;
  order_item_id: string | null;
  provider_ref: string | null;
  registered_at: string;
  expires_at: string | null;
  created_at: string;
}

function adminHeaders(key: string) {
  return {
    "Content-Type": "application/json",
    apikey: key,
    Authorization: `Bearer ${key}`,
  };
}

/** One year after the given date, ISO string — a sensible default term until
 * real expiry dates arrive from Dreamscape provisioning. */
function plusOneYear(iso: string): string {
  const d = new Date(iso);
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString();
}

/**
 * Ensure a `services` row exists for every item in the customer's paid orders,
 * then return the full list. Idempotent: keyed on order_item_id, so re-running
 * never duplicates. Returns [] when the database isn't configured.
 */
export async function getServicesForUser(
  email: string,
  userId: string | null,
): Promise<ServiceRow[]> {
  const config = getSupabaseAdminConfig();
  if (!config) return [];
  const headers = adminHeaders(config.serviceRoleKey);

  // Existing services for this customer.
  const existingRes = await fetch(
    `${config.url}/rest/v1/services?email=eq.${encodeURIComponent(email)}&order=registered_at.desc`,
    { headers, cache: "no-store" },
  );
  const existing = existingRes.ok ? ((await existingRes.json()) as ServiceRow[]) : [];
  const known = new Set(existing.map((s) => s.order_item_id).filter(Boolean));

  // Derive any missing services from paid orders.
  const orders = await getOrdersByEmail(email);
  const toInsert: Array<Record<string, unknown>> = [];
  for (const order of orders) {
    if (order.status !== "paid" && order.status !== "completed" && order.status !== "provisioning") {
      continue;
    }
    for (const item of order.items) {
      if (item.product_type === "website_build") continue; // not a renewable service
      if (known.has(item.id)) continue;
      const registered = order.created_at;
      toInsert.push({
        user_id: userId,
        email,
        type: item.product_type,
        name: item.description ?? item.product_ref ?? item.product_type,
        status: "active",
        auto_renew: true,
        order_id: order.id,
        order_item_id: item.id,
        registered_at: registered,
        expires_at: plusOneYear(registered),
      });
    }
  }

  if (toInsert.length > 0) {
    const insertRes = await fetch(`${config.url}/rest/v1/services`, {
      method: "POST",
      headers: { ...headers, Prefer: "return=representation" },
      body: JSON.stringify(toInsert),
    });
    if (insertRes.ok) {
      const inserted = (await insertRes.json()) as ServiceRow[];
      return [...inserted, ...existing].sort(
        (a, b) => +new Date(b.registered_at) - +new Date(a.registered_at),
      );
    }
  }

  // Backfill user_id on any rows created before sign-in linked the account.
  if (userId) {
    const orphan = existing.filter((s) => !s.user_id);
    if (orphan.length > 0) {
      await fetch(
        `${config.url}/rest/v1/services?email=eq.${encodeURIComponent(email)}&user_id=is.null`,
        { method: "PATCH", headers, body: JSON.stringify({ user_id: userId }) },
      ).catch(() => {});
    }
  }

  return existing;
}

/**
 * Toggle auto-renew for one of a customer's services. Scoped by email so a
 * customer can only change their own services. Returns true on success.
 */
export async function setServiceAutoRenew(
  serviceId: string,
  email: string,
  autoRenew: boolean,
): Promise<boolean> {
  const config = getSupabaseAdminConfig();
  if (!config) return false;
  const res = await fetch(
    `${config.url}/rest/v1/services?id=eq.${encodeURIComponent(serviceId)}&email=eq.${encodeURIComponent(email)}`,
    {
      method: "PATCH",
      headers: { ...adminHeaders(config.serviceRoleKey), Prefer: "return=representation" },
      body: JSON.stringify({ auto_renew: autoRenew }),
    },
  );
  if (!res.ok) return false;
  const rows = (await res.json()) as ServiceRow[];
  return rows.length > 0;
}

/** Record a domain transfer-in request. Returns true on success. */
export async function createTransferRequest(input: {
  email: string;
  userId: string | null;
  domain: string;
  authCode?: string | null;
}): Promise<boolean> {
  const config = getSupabaseAdminConfig();
  if (!config) return false;
  const res = await fetch(`${config.url}/rest/v1/transfer_requests`, {
    method: "POST",
    headers: adminHeaders(config.serviceRoleKey),
    body: JSON.stringify({
      email: input.email,
      user_id: input.userId,
      domain: input.domain,
      auth_code: input.authCode ?? null,
    }),
  });
  return res.ok;
}
