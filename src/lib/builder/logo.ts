/**
 * Generate a clean monogram logo as an SVG string — used when a customer asks
 * us to "create a logo" but no image-generation provider is configured. Free,
 * instant, and themed to their colours, so every site gets a real logo.
 */
export function monogramSvg(name: string, primary: string, accent: string): string {
  const initials =
    name
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .filter((ch) => /[a-z0-9]/i.test(ch ?? ""))
      .join("")
      .slice(0, 2)
      .toUpperCase() || "GX";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" role="img" aria-label="${escapeAttr(name)} logo">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${primary}"/>
      <stop offset="1" stop-color="${accent}"/>
    </linearGradient>
  </defs>
  <rect width="120" height="120" rx="28" fill="url(#g)"/>
  <text x="60" y="60" dy="0.35em" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="52" font-weight="700" fill="#ffffff">${initials}</text>
</svg>`;
}

function escapeAttr(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}
