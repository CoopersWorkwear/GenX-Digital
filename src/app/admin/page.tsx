import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/auth/admin";
import { getRecentOrders } from "@/lib/supabase/orders";
import { formatAud } from "@/lib/pricing";
import { OrderActions } from "@/components/admin/OrderActions";

export const metadata: Metadata = { title: "Admin" };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!isAdminEmail(user.email)) redirect("/account");

  const orders = await getRecentOrders(100);
  const revenue = orders
    .filter((o) => o.status === "paid")
    .reduce((sum, o) => sum + Number(o.total), 0);

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Admin</h1>
      <p className="mt-1 text-slate-600">Recent orders across all customers.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat label="Orders" value={String(orders.length)} />
        <Stat label="Paid orders" value={String(orders.filter((o) => o.status === "paid").length)} />
        <Stat label="Revenue (paid)" value={formatAud(revenue)} />
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Items</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                  No orders yet.
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id}>
                  <td className="px-4 py-3">
                    {new Date(o.created_at).toLocaleDateString("en-AU")}
                  </td>
                  <td className="px-4 py-3">{o.email}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {o.items.map((it) => it.description ?? it.product_ref).join(", ") || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize text-slate-600">
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium">{formatAud(Number(o.total))}</td>
                  <td className="px-4 py-3">
                    <OrderActions orderId={o.id} status={o.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-5">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}
