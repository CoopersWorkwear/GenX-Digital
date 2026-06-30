/**
 * Domain-related Dreamscape API operations.
 * SERVER-SIDE ONLY (depends on the signed client).
 */

import "server-only";
import { dreamscapeRequest } from "./client";
import type { DomainAvailability, TldPrice } from "./types";

/**
 * Check availability for one or more domain names.
 * Endpoint: GET /domains/availability?domain_names[]=example.com
 */
export async function checkAvailability(
  domainNames: string[],
): Promise<DomainAvailability[]> {
  const names = domainNames.map((d) => d.trim().toLowerCase()).filter(Boolean);
  if (names.length === 0) return [];

  const payload = await dreamscapeRequest<unknown>("/domains/availability", {
    query: { domain_names: names },
  });

  return normaliseAvailability(payload, names);
}

/**
 * Normalise the availability payload into our shape. Tolerant of the exact
 * envelope Dreamscape uses (array vs { data: [...] } vs keyed object) so we can
 * lock it down once we see a real sandbox response.
 */
function normaliseAvailability(
  payload: unknown,
  requested: string[],
): DomainAvailability[] {
  const rows = extractRows(payload);

  if (rows.length > 0) {
    return rows.map((row) => {
      const r = row as Record<string, unknown>;
      const domainName =
        str(r.domain_name) ?? str(r.domainName) ?? str(r.domain) ?? "";
      return {
        domainName,
        available: parseAvailable(r),
        costPrice: num(r.price) ?? num(r.register) ?? num(r.cost),
        currency: str(r.currency) ?? "AUD",
        raw: row,
      };
    });
  }

  // Fallback: nothing parseable — surface the request as "unknown availability"
  // rather than throwing, so the UI degrades gracefully.
  return requested.map((domainName) => ({
    domainName,
    available: false,
    raw: payload,
  }));
}

/**
 * Fetch TLD pricing handbook.
 * Endpoint: GET /handbooks/tlds (exact path to confirm against sandbox).
 */
export async function getTldPricing(): Promise<TldPrice[]> {
  const payload = await dreamscapeRequest<unknown>("/handbooks/tlds");
  const rows = extractRows(payload);
  return rows.map((row) => {
    const r = row as Record<string, unknown>;
    return {
      tld: str(r.tld) ?? str(r.name) ?? "",
      register: num(r.register) ?? num(r.registration) ?? num(r.price),
      renew: num(r.renew) ?? num(r.renewal),
      transfer: num(r.transfer),
      currency: str(r.currency) ?? "AUD",
    };
  });
}

// --- small, shared parsing helpers -----------------------------------------

function extractRows(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    if (Array.isArray(obj.data)) return obj.data;
    if (Array.isArray(obj.domains)) return obj.domains;
    if (Array.isArray(obj.results)) return obj.results;
    // keyed object: { "example.com": {...} }
    const values = Object.values(obj);
    if (values.every((v) => v && typeof v === "object")) return values;
  }
  return [];
}

function parseAvailable(r: Record<string, unknown>): boolean {
  const v = r.available ?? r.is_available ?? r.status;
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v === 1;
  if (typeof v === "string")
    return ["1", "true", "available", "yes"].includes(v.toLowerCase());
  return false;
}

function str(v: unknown): string | undefined {
  return typeof v === "string" && v.length > 0 ? v : undefined;
}

function num(v: unknown): number | undefined {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v)))
    return Number(v);
  return undefined;
}
