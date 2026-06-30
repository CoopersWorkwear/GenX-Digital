/**
 * Retail pricing = Dreamscape cost price + your margin.
 *
 * Dreamscape wholesale prices are GST-INCLUSIVE, so applying the margin keeps
 * the result GST-inclusive — no extra GST is added. `gstComponent()` breaks out
 * the GST portion already contained in a price (for invoices / the cart).
 *
 * Phase 1 uses a single default markup from DEFAULT_MARKUP_PERCENT. Later
 * phases can read per-TLD / per-product overrides; the call sites stay the same.
 */

/** Australian GST rate (10%). */
export const GST_RATE = 0.1;

function defaultMarkupPercent(): number {
  const raw = Number(process.env.DEFAULT_MARKUP_PERCENT ?? "25");
  return Number.isFinite(raw) && raw >= 0 ? raw : 25;
}

/** Round to a tidy price (2 decimals). */
function roundPrice(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * GST-inclusive retail price (wholesale cost + margin). Returns undefined if
 * the cost is unknown so the UI can render "—" rather than a misleading $0.00.
 */
export function retailPrice(
  costPrice: number | undefined,
  markupPercent: number = defaultMarkupPercent(),
): number | undefined {
  if (costPrice === undefined || !Number.isFinite(costPrice)) return undefined;
  return roundPrice(costPrice * (1 + markupPercent / 100));
}

/** The GST component contained within a GST-inclusive amount. */
export function gstComponent(inclusiveAmount: number): number {
  return roundPrice(inclusiveAmount - inclusiveAmount / (1 + GST_RATE));
}

export function formatAud(value: number | undefined): string {
  if (value === undefined) return "—";
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(value);
}
