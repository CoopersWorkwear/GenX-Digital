/**
 * GenX Digital business details, used on invoices, the footer and the
 * "Company information" area. Driven by env so the ABN / address / contact can
 * be set in Vercel without code changes; sensible defaults keep the site
 * working before they're filled in.
 *
 * These are public business details (not secrets) — safe to expose to the
 * browser via NEXT_PUBLIC_* where needed.
 */

export interface CompanyInfo {
  legalName: string;
  tradingName: string;
  abn: string | null;
  acn: string | null;
  address: string | null;
  email: string;
  phone: string | null;
  website: string;
}

export function companyInfo(): CompanyInfo {
  return {
    legalName: process.env.NEXT_PUBLIC_COMPANY_LEGAL_NAME || "GenX Digital",
    tradingName: process.env.NEXT_PUBLIC_COMPANY_TRADING_NAME || "GenX Digital",
    abn: process.env.NEXT_PUBLIC_COMPANY_ABN || null,
    acn: process.env.NEXT_PUBLIC_COMPANY_ACN || null,
    address: process.env.NEXT_PUBLIC_COMPANY_ADDRESS || null,
    email: process.env.NEXT_PUBLIC_COMPANY_EMAIL || "info@coopersworkwear.com.au",
    phone: process.env.NEXT_PUBLIC_COMPANY_PHONE || null,
    website: process.env.NEXT_PUBLIC_COMPANY_WEBSITE || "genxdigital.com.au",
  };
}
