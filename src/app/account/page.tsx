import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/auth/admin";
import { getOrdersByEmail } from "@/lib/supabase/orders";
import { getServicesForUser } from "@/lib/supabase/services";
import { AccountDashboard } from "@/components/account/AccountDashboard";

export const metadata: Metadata = { title: "My account" };
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const email = user.email ?? "";
  const name = (user.user_metadata?.full_name as string) || email;

  // Fetch services (synced from paid orders) and order history in parallel.
  const [services, orders] = await Promise.all([
    getServicesForUser(email, user.id),
    getOrdersByEmail(email),
  ]);

  return (
    <AccountDashboard
      name={name}
      email={email}
      isAdmin={isAdminEmail(email)}
      services={services.map((s) => ({
        id: s.id,
        type: s.type,
        name: s.name,
        status: s.status,
        auto_renew: s.auto_renew,
        registered_at: s.registered_at,
        expires_at: s.expires_at,
      }))}
      orders={orders.map((o) => ({
        id: o.id,
        created_at: o.created_at,
        status: o.status,
        total: Number(o.total),
        items: o.items.map((it) => ({
          id: it.id,
          description: it.description,
          product_ref: it.product_ref,
          product_type: it.product_type,
          unit_price: Number(it.unit_price),
        })),
      }))}
    />
  );
}
