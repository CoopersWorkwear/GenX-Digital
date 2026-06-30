import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/supabase/server";
import { getOrdersByEmail } from "@/lib/supabase/orders";
import { SavedCards } from "@/components/SavedCards";
import { formatAud } from "@/lib/pricing";
import { UserIcon, CartIcon, CardIcon } from "@/components/icons";

export const metadata: Metadata = { title: "My account" };
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const email = user.email ?? "";
  const name = (user.user_metadata?.full_name as string) || email;
  const orders = await getOrdersByEmail(email);

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My account</h1>
          <p className="mt-1 text-slate-600">Welcome back, {name}.</p>
        </div>
        <form action="/auth/signout" method="post">
          <button className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:border-brand-300 hover:text-brand-600">
            Sign out
          </button>
        </form>
      </div>

      {/* Profile */}
      <Section icon={<UserIcon className="h-5 w-5" />} title="Profile">
        <dl className="grid gap-3 sm:grid-cols-2">
          <Detail label="Name" value={name} />
          <Detail label="Email" value={email} />
        </dl>
      </Section>

      {/* Orders */}
      <Section icon={<CartIcon className="h-5 w-5" />} title="Order history">
        {orders.length === 0 ? (
          <p className="text-sm text-slate-500">You haven&apos;t placed any orders yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {orders.map((o) => (
              <li key={o.id} className="py-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {new Date(o.created_at).toLocaleDateString("en-AU")}
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-600">
                      {o.status}
                    </span>
                    <span className="font-semibold">{formatAud(Number(o.total))}</span>
                  </span>
                </div>
                <ul className="mt-2 space-y-1">
                  {o.items.map((it) => (
                    <li key={it.id} className="flex justify-between text-sm text-slate-500">
                      <span>{it.description ?? it.product_ref ?? it.product_type}</span>
                      <span>{formatAud(Number(it.unit_price))}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* Saved cards */}
      <Section icon={<CardIcon className="h-5 w-5" />} title="Payment methods">
        <SavedCards />
      </Section>
    </main>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8 rounded-2xl border border-slate-200 p-6">
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        <span className="text-brand-600">{icon}</span>
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
    </div>
  );
}
