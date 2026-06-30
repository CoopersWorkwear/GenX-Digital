"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { SavedCards } from "@/components/SavedCards";
import {
  GridIcon,
  ServerIcon,
  GlobeIcon,
  ShieldIcon,
  MailIcon,
  CartIcon,
  CardIcon,
  SettingsIcon,
  LockIcon,
  RefreshIcon,
  SparklesIcon,
  CheckIcon,
} from "@/components/icons";

export interface Service {
  id: string;
  type: string;
  name: string;
  status: string;
  auto_renew: boolean;
  registered_at: string;
  expires_at: string | null;
}

export interface OrderItem {
  id: string;
  description: string | null;
  product_ref: string | null;
  product_type: string;
  unit_price: number;
}

export interface Order {
  id: string;
  created_at: string;
  status: string;
  total: number;
  items: OrderItem[];
}

type TabId = "overview" | "services" | "orders" | "settings" | "security" | "billing";

const TABS: { id: TabId; label: string; Icon: typeof GridIcon }[] = [
  { id: "overview", label: "Overview", Icon: GridIcon },
  { id: "services", label: "My services", Icon: ServerIcon },
  { id: "orders", label: "Order history", Icon: CartIcon },
  { id: "settings", label: "Account settings", Icon: SettingsIcon },
  { id: "security", label: "Login & security", Icon: LockIcon },
  { id: "billing", label: "Payment methods", Icon: CardIcon },
];

const TYPE_META: Record<string, { label: string; Icon: typeof GlobeIcon }> = {
  domain: { label: "Domain", Icon: GlobeIcon },
  hosting: { label: "Web hosting", Icon: ServerIcon },
  ssl: { label: "SSL certificate", Icon: ShieldIcon },
  email: { label: "Business email", Icon: MailIcon },
  website_build: { label: "Website build", Icon: SparklesIcon },
};

function aud(n: number): string {
  return new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(n);
}

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
}

function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  return Math.ceil((+new Date(iso) - Date.now()) / 86_400_000);
}

export function AccountDashboard({
  name,
  email,
  isAdmin,
  services: initialServices,
  orders,
}: {
  name: string;
  email: string;
  isAdmin: boolean;
  services: Service[];
  orders: Order[];
}) {
  const [tab, setTab] = useState<TabId>("overview");
  const [services, setServices] = useState(initialServices);

  const activeCount = services.filter((s) => s.status === "active").length;
  const nextRenewal = useMemo(() => {
    const upcoming = services
      .filter((s) => s.auto_renew && s.expires_at)
      .map((s) => s.expires_at as string)
      .sort((a, b) => +new Date(a) - +new Date(b))[0];
    return upcoming ?? null;
  }, [services]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My account</h1>
          <p className="mt-1 text-slate-600">Welcome back, {name}.</p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Link
              href="/admin"
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:border-brand-300 hover:text-brand-600"
            >
              Admin
            </Link>
          )}
          <form action="/auth/signout" method="post">
            <button className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:border-brand-300 hover:text-brand-600">
              Sign out
            </button>
          </form>
        </div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[220px_1fr]">
        {/* Sidebar nav */}
        <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:gap-1">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex shrink-0 items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-semibold transition ${
                tab === id
                  ? "bg-brand-600 text-white shadow-sm shadow-brand-200"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="whitespace-nowrap">{label}</span>
            </button>
          ))}
        </nav>

        {/* Panel */}
        <div className="min-w-0">
          {tab === "overview" && (
            <Overview
              name={name}
              email={email}
              activeCount={activeCount}
              orderCount={orders.length}
              nextRenewal={nextRenewal}
              services={services}
              onManage={() => setTab("services")}
            />
          )}
          {tab === "services" && (
            <Services services={services} setServices={setServices} />
          )}
          {tab === "orders" && <Orders orders={orders} />}
          {tab === "settings" && <Settings name={name} email={email} />}
          {tab === "security" && <Security email={email} />}
          {tab === "billing" && (
            <Panel title="Payment methods">
              <p className="mb-4 text-sm text-slate-500">
                Cards are stored securely by our payment provider (Stripe) — never on our servers.
              </p>
              <SavedCards />
            </Panel>
          )}
        </div>
      </div>
    </main>
  );
}

/* ---------- Overview ---------- */

function Overview({
  name,
  email,
  activeCount,
  orderCount,
  nextRenewal,
  services,
  onManage,
}: {
  name: string;
  email: string;
  activeCount: number;
  orderCount: number;
  nextRenewal: string | null;
  services: Service[];
  onManage: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Active services" value={String(activeCount)} Icon={ServerIcon} />
        <Stat label="Next renewal" value={fmtDate(nextRenewal)} Icon={RefreshIcon} />
        <Stat label="Orders placed" value={String(orderCount)} Icon={CartIcon} />
      </div>

      <Panel title="Your details">
        <dl className="grid gap-4 sm:grid-cols-2">
          <Detail label="Name" value={name} />
          <Detail label="Email" value={email} />
        </dl>
      </Panel>

      <Panel
        title="Your services"
        action={
          <button onClick={onManage} className="text-sm font-semibold text-brand-600 hover:underline">
            Manage →
          </button>
        }
      >
        {services.length === 0 ? (
          <EmptyServices />
        ) : (
          <ul className="divide-y divide-slate-100">
            {services.slice(0, 4).map((s) => (
              <li key={s.id} className="flex items-center justify-between py-3">
                <ServiceLabel service={s} />
                <span className="text-sm text-slate-500">Renews {fmtDate(s.expires_at)}</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}

function Stat({ label, value, Icon }: { label: string; value: string; Icon: typeof GridIcon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-4 text-2xl font-bold tracking-tight">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}

/* ---------- Services ---------- */

function Services({
  services,
  setServices,
}: {
  services: Service[];
  setServices: React.Dispatch<React.SetStateAction<Service[]>>;
}) {
  return (
    <div className="space-y-6">
      <Panel title="My services">
        {services.length === 0 ? (
          <EmptyServices />
        ) : (
          <ul className="space-y-3">
            {services.map((s) => (
              <ServiceCard key={s.id} service={s} setServices={setServices} />
            ))}
          </ul>
        )}
      </Panel>
      <TransferForm />
    </div>
  );
}

function ServiceCard({
  service,
  setServices,
}: {
  service: Service;
  setServices: React.Dispatch<React.SetStateAction<Service[]>>;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const days = daysUntil(service.expires_at);
  const expiringSoon = days !== null && days <= 30 && days >= 0;

  async function toggle() {
    setBusy(true);
    setError(null);
    const next = !service.auto_renew;
    try {
      const res = await fetch("/api/account/services/auto-renew", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId: service.id, autoRenew: next }),
      });
      if (!res.ok) throw new Error();
      setServices((prev) =>
        prev.map((s) => (s.id === service.id ? { ...s, auto_renew: next } : s)),
      );
    } catch {
      setError("Couldn't update. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="rounded-2xl border border-slate-200 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <ServiceLabel service={service} />
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
            service.status === "active"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {service.status}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4">
        <div className="text-sm">
          <p className="text-slate-500">
            {service.auto_renew ? "Renews" : "Expires"} {fmtDate(service.expires_at)}
            {expiringSoon && (
              <span className="ml-2 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                {days === 0 ? "Today" : `${days}d`}
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {error && <span className="text-xs text-red-600">{error}</span>}
          <span className="text-sm font-medium text-slate-600">Auto-renew</span>
          <button
            role="switch"
            aria-checked={service.auto_renew}
            aria-label="Toggle auto-renew"
            disabled={busy}
            onClick={toggle}
            className={`relative h-6 w-11 rounded-full transition ${
              service.auto_renew ? "bg-brand-600" : "bg-slate-300"
            } ${busy ? "opacity-60" : ""}`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                service.auto_renew ? "left-[1.375rem]" : "left-0.5"
              }`}
            />
          </button>
        </div>
      </div>
    </li>
  );
}

function ServiceLabel({ service }: { service: Service }) {
  const meta = TYPE_META[service.type] ?? { label: service.type, Icon: GlobeIcon };
  const Icon = meta.Icon;
  return (
    <span className="flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
        <Icon className="h-5 w-5" />
      </span>
      <span>
        <span className="block font-semibold">{service.name}</span>
        <span className="block text-xs text-slate-500">{meta.label}</span>
      </span>
    </span>
  );
}

function EmptyServices() {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center">
      <p className="text-sm text-slate-500">
        You don&apos;t have any active services yet.
      </p>
      <Link
        href="/domains"
        className="mt-4 inline-block rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
      >
        Browse domains & hosting
      </Link>
    </div>
  );
}

function TransferForm() {
  const [domain, setDomain] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("saving");
    setError(null);
    try {
      const res = await fetch("/api/account/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, authCode: authCode || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Couldn't submit your request.");
        setState("idle");
        return;
      }
      setState("done");
      setDomain("");
      setAuthCode("");
    } catch {
      setError("Couldn't submit your request.");
      setState("idle");
    }
  }

  return (
    <Panel title="Transfer a domain to GenX Digital">
      {state === "done" ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800">
          <p className="font-semibold">Request received ✓</p>
          <p className="mt-1">
            We&apos;ll email you the next steps. Transfers usually complete within 5–7 days.
          </p>
          <button
            onClick={() => setState("idle")}
            className="mt-3 text-sm font-semibold text-emerald-700 underline"
          >
            Transfer another
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <p className="text-sm text-slate-500">
            Bring a domain you own elsewhere over to us. You&apos;ll need it unlocked at your
            current registrar, plus its authorisation (EPP) code.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Domain name
              </span>
              <input
                required
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="yourbusiness.com.au"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Auth / EPP code <span className="font-normal normal-case">(optional now)</span>
              </span>
              <input
                value={authCode}
                onChange={(e) => setAuthCode(e.target.value)}
                placeholder="e.g. A1b2C3…"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none"
              />
            </label>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={state === "saving"}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            <RefreshIcon className="h-4 w-4" />
            {state === "saving" ? "Submitting…" : "Start transfer"}
          </button>
        </form>
      )}
    </Panel>
  );
}

/* ---------- Orders ---------- */

function Orders({ orders }: { orders: Order[] }) {
  return (
    <Panel title="Order history">
      {orders.length === 0 ? (
        <p className="text-sm text-slate-500">You haven&apos;t placed any orders yet.</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {orders.map((o) => (
            <li key={o.id} className="py-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{fmtDate(o.created_at)}</span>
                <span className="flex items-center gap-3">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-600">
                    {o.status}
                  </span>
                  <span className="font-semibold">{aud(Number(o.total))}</span>
                </span>
              </div>
              <ul className="mt-2 space-y-1">
                {o.items.map((it) => (
                  <li key={it.id} className="flex justify-between text-sm text-slate-500">
                    <span>{it.description ?? it.product_ref ?? it.product_type}</span>
                    <span>{aud(Number(it.unit_price))}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

/* ---------- Settings (profile) ---------- */

function Settings({ name, email }: { name: string; email: string }) {
  const [fullName, setFullName] = useState(name === email ? "" : name);
  const [state, setState] = useState<"idle" | "saving" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setState("saving");
    setError(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.updateUser({ data: { full_name: fullName.trim() } });
      if (error) throw error;
      setState("done");
    } catch (err) {
      setError((err as Error).message || "Couldn't save your changes.");
      setState("idle");
    }
  }

  return (
    <Panel title="Account settings">
      <form onSubmit={save} className="max-w-md space-y-4">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Full name
          </span>
          <input
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              setState("idle");
            }}
            placeholder="Your name"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Email
          </span>
          <input
            value={email}
            disabled
            className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500"
          />
          <span className="mt-1 block text-xs text-slate-400">
            Change your email under Login &amp; security.
          </span>
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {state === "done" && (
          <p className="flex items-center gap-1.5 text-sm text-emerald-600">
            <CheckIcon className="h-4 w-4" /> Saved
          </p>
        )}
        <button
          type="submit"
          disabled={state === "saving"}
          className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {state === "saving" ? "Saving…" : "Save changes"}
        </button>
      </form>
    </Panel>
  );
}

/* ---------- Security (email + password) ---------- */

function Security({ email }: { email: string }) {
  return (
    <div className="space-y-6">
      <ChangeEmail email={email} />
      <ChangePassword />
    </div>
  );
}

function ChangeEmail({ email }: { email: string }) {
  const [newEmail, setNewEmail] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setState("saving");
    setError(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });
      if (error) throw error;
      setState("done");
      setNewEmail("");
    } catch (err) {
      setError((err as Error).message || "Couldn't update your email.");
      setState("idle");
    }
  }

  return (
    <Panel title="Email address">
      <form onSubmit={save} className="max-w-md space-y-4">
        <p className="text-sm text-slate-500">
          You&apos;re currently signed in as <strong>{email}</strong>. We&apos;ll send a
          confirmation link to the new address before it takes effect.
        </p>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            New email
          </span>
          <input
            type="email"
            required
            value={newEmail}
            onChange={(e) => {
              setNewEmail(e.target.value);
              setState("idle");
            }}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none"
          />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {state === "done" && (
          <p className="flex items-center gap-1.5 text-sm text-emerald-600">
            <CheckIcon className="h-4 w-4" /> Check your inbox to confirm.
          </p>
        )}
        <button
          type="submit"
          disabled={state === "saving"}
          className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {state === "saving" ? "Sending…" : "Update email"}
        </button>
      </form>
    </Panel>
  );
}

function ChangePassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setState("saving");
    setError(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setState("done");
      setPassword("");
      setConfirm("");
    } catch (err) {
      setError((err as Error).message || "Couldn't update your password.");
      setState("idle");
    }
  }

  return (
    <Panel title="Password">
      <form onSubmit={save} className="max-w-md space-y-4">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            New password
          </span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setState("idle");
            }}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Confirm password
          </span>
          <input
            type="password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none"
          />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {state === "done" && (
          <p className="flex items-center gap-1.5 text-sm text-emerald-600">
            <CheckIcon className="h-4 w-4" /> Password updated
          </p>
        )}
        <button
          type="submit"
          disabled={state === "saving"}
          className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {state === "saving" ? "Updating…" : "Update password"}
        </button>
      </form>
    </Panel>
  );
}

/* ---------- Shared layout bits ---------- */

function Panel({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        {action}
      </div>
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
