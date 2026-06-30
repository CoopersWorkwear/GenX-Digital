import { NextResponse } from "next/server";
import { dreamscapeRequest } from "@/lib/dreamscape/client";
import { getDreamscapeConfig, isDreamscapeConfigured } from "@/lib/dreamscape/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * TEMPORARY, read-only discovery for the full Dreamscape REST surface. Probes
 * GET endpoints only (no mutations) so we can map the exact paths/shapes for
 * DNS, nameservers, contacts, EPP, balance, orders, hosting and email before
 * building those features. Sandbox-only; disabled in production. Remove once
 * the integrations are wired.
 *
 * Visit /api/debug/dreamscape and paste the JSON back so the endpoints can be
 * locked down.
 */

// Account-level resources (no domain needed).
const ACCOUNT_PATHS = [
  "/balance",
  "/account/balance",
  "/reseller/balance",
  "/currencies",
  "/account",
  "/customers",
  "/domains",
  "/orders",
  "/products/plans",
  "/products",
  "/services",
  "/hosting",
  "/hosting/plans",
  "/email",
  "/email/plans",
  "/ssl",
];

// Domain-scoped sub-resources. {d} is replaced with a real domain name from the
// account (and {id} with its id, if present).
const DOMAIN_PATH_TEMPLATES = [
  "/domains/{d}",
  "/domains/{d}/info",
  "/domains/{d}/dns",
  "/domains/{d}/dns/records",
  "/domains/{d}/records",
  "/domains/{d}/nameservers",
  "/domains/{d}/ns",
  "/domains/{d}/contacts",
  "/domains/{d}/contact",
  "/domains/{d}/whois",
  "/domains/{d}/eppcode",
  "/domains/{d}/auth-code",
  "/domains/{d}/lock",
  "/domains/{d}/status",
  "/dns/{d}",
  "/domains/{id}",
  "/domains/{id}/dns",
  "/domains/{id}/nameservers",
  "/domains/{id}/contacts",
];

async function probe(path: string) {
  try {
    const data = await dreamscapeRequest(path, { timeoutMs: 9000 });
    return { path, ok: true, sample: clip(data) };
  } catch (err) {
    const e = err as { status?: number; message?: string };
    return { path, ok: false, status: e.status ?? null, error: clipStr(e.message ?? "") };
  }
}

function clip(data: unknown): string {
  return clipStr(JSON.stringify(data));
}
function clipStr(s: string): string {
  return s.length > 700 ? s.slice(0, 700) + "…" : s;
}

/** Pull a usable domain name + id out of the /domains list response. */
function firstDomain(payload: unknown): { name?: string; id?: string } {
  const rows = Array.isArray(payload)
    ? payload
    : payload && typeof payload === "object"
      ? ((payload as Record<string, unknown>).data as unknown[]) ??
        ((payload as Record<string, unknown>).domains as unknown[]) ??
        Object.values(payload as Record<string, unknown>)
      : [];
  for (const row of rows ?? []) {
    if (row && typeof row === "object") {
      const r = row as Record<string, unknown>;
      const name =
        (r.domain_name as string) ?? (r.domainName as string) ?? (r.domain as string) ?? (r.name as string);
      const id = (r.id as string) ?? (r.domain_id as string);
      if (name || id) return { name: name ?? undefined, id: id != null ? String(id) : undefined };
    }
  }
  return {};
}

export async function GET() {
  if (!isDreamscapeConfigured()) {
    return NextResponse.json({ error: "DREAMSCAPE_API_KEY not configured." });
  }
  if (getDreamscapeConfig().env === "production") {
    return NextResponse.json({ error: "Disabled in production (sandbox only)." }, { status: 404 });
  }

  const account = [];
  let domainsPayload: unknown = null;
  for (const path of ACCOUNT_PATHS) {
    const result = await probe(path);
    if (path === "/domains" && result.ok) {
      try {
        domainsPayload = await dreamscapeRequest("/domains", { timeoutMs: 9000 });
      } catch {
        /* ignore */
      }
    }
    account.push(result);
  }

  const sample = firstDomain(domainsPayload);
  const domain = [];
  if (sample.name || sample.id) {
    for (const tmpl of DOMAIN_PATH_TEMPLATES) {
      if (tmpl.includes("{d}") && !sample.name) continue;
      if (tmpl.includes("{id}") && !sample.id) continue;
      const path = tmpl
        .replace("{d}", encodeURIComponent(sample.name ?? ""))
        .replace("{id}", encodeURIComponent(sample.id ?? ""));
      domain.push(await probe(path));
    }
  }

  return NextResponse.json({
    sampleDomain: sample,
    hint: "Paste this whole response back. 'ok:true' paths exist; samples show the shape.",
    account,
    domain,
  });
}
