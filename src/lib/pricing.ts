/**
 * Retail pricing = Dreamscape cost price + your margin.
 *
 * Phase 1 uses a single default markup from DEFAULT_MARKUP_PERCENT. Later
 * phases will read per-TLD / per-product overrides from the database, but the
 * call sites here stay the same.
 */

function defaultMarkupPercent(): number {
  const raw = Number(process.env.DEFAULT_MARKUP_PERCENT ?? "25");
  return Number.isFinite(raw) && raw >= 0 ? raw : 25;
}

/** Round to a tidy retail price (2 decimals). */
function roundPrice(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Apply markup to a wholesale cost. Returns undefined if cost is unknown so
 * the UI can render "Contact us" / "—" rather than a misleading $0.00.
 */
export function retailPrice(
  costPrice: number | undefined,
  markupPercent: number = defaultMarkupPercent(),
): number | undefined {
  if (costPrice === undefined || !Number.isFinite(costPrice)) return undefined;
  return roundPrice(costPrice * (1 + markupPercent / 100));
}

export function formatAud(value: number | undefined): string {
  if (value === undefined) return "—";
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(value);
}
