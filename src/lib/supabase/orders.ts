import "server-only";
import { getSupabaseAdminConfig } from "./config";

export interface OrderRow {
  id: string;
  email: string;
  status: string;
  subtotal?: number;
  tax?: number;
  total: number;
  payment_ref?: string | null;
  created_at: string;
}

export interface OrderItemRow {
  id: string;
  order_id: string;
  product_type: string;
  product_ref: string | null;
  description: string | null;
  unit_price: number;
}

export interface OrderWithItems extends OrderRow {
  items: OrderItemRow[];
}

/**
 * Fetch a customer's orders (with items) by email, via the Supabase REST API
 * using the service-role key (server-side, bypasses RLS). Returns [] when the
 * database isn't configured.
 */
export async function getOrdersByEmail(email: string): Promise<OrderWithItems[]> {
  const config = getSupabaseAdminConfig();
  if (!config) return [];

  const headers = {
    apikey: config.serviceRoleKey,
    Authorization: `Bearer ${config.serviceRoleKey}`,
  };

  const ordersRes = await fetch(
    `${config.url}/rest/v1/orders?email=eq.${encodeURIComponent(email)}&order=created_at.desc`,
    { headers, cache: "no-store" },
  );
  if (!ordersRes.ok) return [];
  const orders = (await ordersRes.json()) as OrderRow[];
  if (orders.length === 0) return [];

  const ids = orders.map((o) => o.id);
  const itemsRes = await fetch(
    `${config.url}/rest/v1/order_items?order_id=in.(${ids.join(",")})`,
    { headers, cache: "no-store" },
  );
  const items = itemsRes.ok ? ((await itemsRes.json()) as OrderItemRow[]) : [];

  return orders.map((o) => ({
    ...o,
    items: items.filter((it) => it.order_id === o.id),
  }));
}

/**
 * Fetch a single order (with items) by id, scoped to the owner's email so a
 * customer can only ever load their own invoice. Returns null otherwise.
 */
export async function getOrderByIdForEmail(
  orderId: string,
  email: string,
): Promise<OrderWithItems | null> {
  const config = getSupabaseAdminConfig();
  if (!config) return null;

  const headers = {
    apikey: config.serviceRoleKey,
    Authorization: `Bearer ${config.serviceRoleKey}`,
  };

  const orderRes = await fetch(
    `${config.url}/rest/v1/orders?id=eq.${encodeURIComponent(orderId)}&email=eq.${encodeURIComponent(email)}`,
    { headers, cache: "no-store" },
  );
  if (!orderRes.ok) return null;
  const orders = (await orderRes.json()) as OrderRow[];
  const order = orders[0];
  if (!order) return null;

  const itemsRes = await fetch(
    `${config.url}/rest/v1/order_items?order_id=eq.${encodeURIComponent(order.id)}`,
    { headers, cache: "no-store" },
  );
  const items = itemsRes.ok ? ((await itemsRes.json()) as OrderItemRow[]) : [];
  return { ...order, items };
}

/** Fetch the most recent orders across all customers (admin view). */
export async function getRecentOrders(limit = 100): Promise<OrderWithItems[]> {
  const config = getSupabaseAdminConfig();
  if (!config) return [];

  const headers = {
    apikey: config.serviceRoleKey,
    Authorization: `Bearer ${config.serviceRoleKey}`,
  };

  const ordersRes = await fetch(
    `${config.url}/rest/v1/orders?order=created_at.desc&limit=${limit}`,
    { headers, cache: "no-store" },
  );
  if (!ordersRes.ok) return [];
  const orders = (await ordersRes.json()) as OrderRow[];
  if (orders.length === 0) return [];

  const ids = orders.map((o) => o.id);
  const itemsRes = await fetch(
    `${config.url}/rest/v1/order_items?order_id=in.(${ids.join(",")})`,
    { headers, cache: "no-store" },
  );
  const items = itemsRes.ok ? ((await itemsRes.json()) as OrderItemRow[]) : [];

  return orders.map((o) => ({
    ...o,
    items: items.filter((it) => it.order_id === o.id),
  }));
}
