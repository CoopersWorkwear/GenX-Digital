/**
 * Dreamscape Reseller API configuration.
 *
 * Resolved once, server-side only. Importing this module from a Client
 * Component will throw at build/runtime because the secrets are not exposed
 * with a NEXT_PUBLIC_ prefix — which is exactly what we want.
 */

export type DreamscapeEnv = "sandbox" | "production";

const BASE_URLS: Record<DreamscapeEnv, string> = {
  sandbox: "https://reseller-api.sandbox.ds.network",
  production: "https://reseller-api.ds.network",
};

export interface DreamscapeConfig {
  apiKey: string;
  baseUrl: string;
  env: DreamscapeEnv;
}

let cached: DreamscapeConfig | null = null;

export function getDreamscapeConfig(): DreamscapeConfig {
  if (cached) return cached;

  const env = (process.env.DREAMSCAPE_ENV ?? "sandbox") as DreamscapeEnv;
  if (env !== "sandbox" && env !== "production") {
    throw new Error(
      `Invalid DREAMSCAPE_ENV "${env}". Expected "sandbox" or "production".`,
    );
  }

  const apiKey = process.env.DREAMSCAPE_API_KEY;
  if (!apiKey) {
    throw new Error(
      "DREAMSCAPE_API_KEY is not set. Add it to .env.local (see .env.example).",
    );
  }

  const baseUrl = process.env.DREAMSCAPE_BASE_URL?.trim() || BASE_URLS[env];

  cached = { apiKey, baseUrl, env };
  return cached;
}

/** True when we have credentials configured. Used to show friendly UI in dev. */
export function isDreamscapeConfigured(): boolean {
  return Boolean(process.env.DREAMSCAPE_API_KEY);
}
