import type { BuilderBrief } from "./types";
import { safeScheme } from "./schemes";

/**
 * Encode/decode a (text-only) build brief into a URL-safe string for the
 * stateless preview fallback used when Supabase Storage isn't available.
 * Works in both the browser and the Node server runtime.
 */

export function encodeBrief(brief: BuilderBrief): string {
  // Don't carry file URLs through the URL fallback — keep it small.
  const slim: BuilderBrief = {
    businessName: brief.businessName,
    domain: brief.domain,
    description: brief.description,
    scheme: brief.scheme,
    wantsLogo: brief.wantsLogo,
    wantsImages: brief.wantsImages,
    wantsColourHelp: brief.wantsColourHelp,
  };
  return btoa(encodeURIComponent(JSON.stringify(slim)));
}

export function decodeBrief(encoded: string): BuilderBrief | null {
  try {
    const parsed = JSON.parse(decodeURIComponent(atob(encoded)));
    if (
      parsed &&
      typeof parsed.businessName === "string" &&
      typeof parsed.description === "string"
    ) {
      return {
        businessName: parsed.businessName,
        domain: typeof parsed.domain === "string" ? parsed.domain : undefined,
        description: parsed.description,
        scheme: safeScheme(parsed.scheme),
        wantsLogo: Boolean(parsed.wantsLogo),
        wantsImages: Boolean(parsed.wantsImages),
        wantsColourHelp: Boolean(parsed.wantsColourHelp),
      };
    }
    return null;
  } catch {
    return null;
  }
}
