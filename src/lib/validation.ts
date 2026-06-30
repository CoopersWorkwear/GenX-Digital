import { z } from "zod";

/**
 * A loose-but-safe domain label/name validator. We accept a bare domain
 * ("example") or a full name ("example.com.au"); the search layer expands a
 * bare term across popular TLDs.
 */
const DOMAIN_RE = /^(?=.{1,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)(\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i;

export const domainSearchSchema = z.object({
  query: z
    .string()
    .trim()
    .min(1, "Enter a domain to search")
    .max(253, "That domain is too long")
    .transform((s) => s.toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "")),
});

export function isValidDomainName(name: string): boolean {
  return DOMAIN_RE.test(name);
}

/** Popular AU + global TLDs to expand a bare search term across. */
export const POPULAR_TLDS = [
  "com.au",
  "au",
  "com",
  "net.au",
  "org.au",
  "net",
  "org",
  "io",
  "co",
] as const;

/**
 * Turn a user query into the list of full domain names to check.
 * - "example"            -> example.com.au, example.au, example.com, ...
 * - "example.com.au"     -> [example.com.au]
 */
export function expandQueryToDomains(query: string): string[] {
  const cleaned = query.toLowerCase().trim();
  if (cleaned.includes(".")) {
    return isValidDomainName(cleaned) ? [cleaned] : [];
  }
  const label = cleaned.replace(/[^a-z0-9-]/g, "");
  if (!label) return [];
  return POPULAR_TLDS.map((tld) => `${label}.${tld}`).filter(isValidDomainName);
}
