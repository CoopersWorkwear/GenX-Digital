import type { ColorScheme } from "./types";

export interface PresetScheme {
  id: string;
  name: string;
  scheme: ColorScheme;
}

export const PRESET_SCHEMES: PresetScheme[] = [
  { id: "ocean", name: "Ocean", scheme: { primary: "#0369a1", accent: "#0ea5e9" } },
  { id: "forest", name: "Forest", scheme: { primary: "#15803d", accent: "#22c55e" } },
  { id: "sunset", name: "Sunset", scheme: { primary: "#c2410c", accent: "#fb923c" } },
  { id: "berry", name: "Berry", scheme: { primary: "#a21caf", accent: "#e879f9" } },
  { id: "royal", name: "Royal", scheme: { primary: "#5b21b6", accent: "#8b5cf6" } },
  { id: "charcoal", name: "Charcoal", scheme: { primary: "#1f2937", accent: "#6b7280" } },
];

export const DEFAULT_SCHEME: ColorScheme = PRESET_SCHEMES[0].scheme;

const HEX = /^#[0-9a-fA-F]{6}$/;

/** Validate/normalise a scheme from untrusted input, falling back to default. */
export function safeScheme(input: Partial<ColorScheme> | undefined): ColorScheme {
  const primary = input?.primary && HEX.test(input.primary) ? input.primary : DEFAULT_SCHEME.primary;
  const accent = input?.accent && HEX.test(input.accent) ? input.accent : DEFAULT_SCHEME.accent;
  return { primary, accent };
}
