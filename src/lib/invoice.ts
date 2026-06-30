import { gstComponent } from "@/lib/pricing";

/**
 * A stable, human-friendly invoice number derived from the order id + date,
 * e.g. INV-2026-3F9A2C. No separate counter needed and it never collides for a
 * given order.
 */
export function invoiceNumber(orderId: string, createdAt: string): string {
  const year = new Date(createdAt).getFullYear();
  const suffix = orderId.replace(/-/g, "").slice(0, 6).toUpperCase();
  return `INV-${year}-${suffix}`;
}

/** GST breakdown for a GST-inclusive total. */
export function invoiceTotals(total: number): {
  gst: number;
  exGst: number;
  total: number;
} {
  const gst = gstComponent(total);
  return { gst, exGst: Math.round((total - gst) * 100) / 100, total };
}
