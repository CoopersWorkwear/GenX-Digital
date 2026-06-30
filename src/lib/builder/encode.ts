/**
 * Encode/decode the website-builder brief into a URL-safe string so a preview
 * can be generated and shared statelessly (no database needed for the simple
 * template). Works in both the browser and the Node server runtime.
 */

export interface BuilderBrief {
  businessName: string;
  description: string;
  domain: string;
}

export function encodeBrief(brief: BuilderBrief): string {
  return btoa(encodeURIComponent(JSON.stringify(brief)));
}

export function decodeBrief(encoded: string): BuilderBrief | null {
  try {
    const parsed = JSON.parse(decodeURIComponent(atob(encoded)));
    if (
      parsed &&
      typeof parsed.businessName === "string" &&
      typeof parsed.description === "string" &&
      typeof parsed.domain === "string"
    ) {
      return parsed as BuilderBrief;
    }
    return null;
  } catch {
    return null;
  }
}
