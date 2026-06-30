/**
 * Retail pricing = Dreamscape cost price + your margin, shown GST-inclusive.
 *
 * Assumption: Dreamscape wholesale prices are GST-exclusive, so the customer
 * price is  cost × (1 + markup) × (1 + GST).  If wholesale turns out to be
 * GST-inclusive already, set GST_RATE handling accordingly — it's centralised
 * here so there's a single place to change it.
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
 * Ex-GST retail price (wholesale cost + margin). Returns undefined if the cost
 * is unknown so the UI can render "—" rather than a misleading $0.00.
 */
export function retailPriceExGst(
  costPrice: number | undefined,
  markupPercent: number = defaultMarkupPercent(),
): number | undefined {
  if (costPrice === undefined || !Number.isFinite(costPrice)) return undefined;
  return roundPrice(costPrice * (1 + markupPercent / 100));
}

/**
 * GST-inclusive retail price — this is the number shown to customers.
 */
export function retailPrice(
  costPrice: number | undefined,
  markupPercent: number = defaultMarkupPercent(),
): number | undefined {
  const ex = retailPriceExGst(costPrice, markupPercent);
  if (ex === undefined) return undefined;
  return roundPrice(ex * (1 + GST_RATE));
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
