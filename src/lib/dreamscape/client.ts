/**
 * Dreamscape Reseller REST API client.
 *
 * SERVER-SIDE ONLY. This module reads the secret API key and signs every
 * request. It must never be imported into a Client Component or shipped to
 * the browser.
 *
 * Authentication (per Dreamscape docs):
 *   - Api-Request-Id: a unique MD5 hash for each request (prevents replay).
 *   - Api-Signature:  MD5 hash of the concatenation of (Request-Id + API key).
 * Both are sent as HTTP headers on every request.
 */

import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { getDreamscapeConfig } from "./config";

export class DreamscapeApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body: unknown,
  ) {
    super(message);
    this.name = "DreamscapeApiError";
  }
}

function md5(input: string): string {
  return createHash("md5").update(input).digest("hex");
}

/** Each request needs a unique request id; derive a signature from it + key. */
function buildAuthHeaders(apiKey: string): Record<string, string> {
  const requestId = md5(`${randomBytes(16).toString("hex")}`);
  const signature = md5(`${requestId}${apiKey}`);
  return {
    "Api-Request-Id": requestId,
    "Api-Signature": signature,
  };
}

type Query = Record<
  string,
  string | number | boolean | Array<string | number> | undefined
>;

function buildQueryString(query?: Query): string {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      // Dreamscape expects PHP-style array params, e.g. domain_names[]=a.com
      for (const item of value) params.append(`${key}[]`, String(item));
    } else {
      params.append(key, String(value));
    }
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  query?: Query;
  body?: unknown;
  /** Per-call timeout in ms (default 15s). */
  timeoutMs?: number;
}

/**
 * Low-level request helper. Returns the parsed JSON payload, or throws a
 * DreamscapeApiError on a non-2xx response.
 */
export async function dreamscapeRequest<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { apiKey, baseUrl } = getDreamscapeConfig();
  const { method = "GET", query, body, timeoutMs = 15_000 } = options;

  const url = `${baseUrl}${path.startsWith("/") ? path : `/${path}`}${buildQueryString(query)}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method,
      headers: {
        Accept: "application/json",
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...buildAuthHeaders(apiKey),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
      // Never cache reseller API responses at the fetch layer; we control
      // caching explicitly at the route/data layer instead.
      cache: "no-store",
    });

    const text = await res.text();
    const payload = text ? safeJsonParse(text) : null;

    if (!res.ok) {
      throw new DreamscapeApiError(
        `Dreamscape API ${method} ${path} failed with ${res.status}`,
        res.status,
        payload ?? text,
      );
    }

    return payload as T;
  } catch (err) {
    if (err instanceof DreamscapeApiError) throw err;
    if (err instanceof Error && err.name === "AbortError") {
      throw new DreamscapeApiError(
        `Dreamscape API ${method} ${path} timed out after ${timeoutMs}ms`,
        408,
        null,
      );
    }
    throw new DreamscapeApiError(
      `Dreamscape API ${method} ${path} request error: ${(err as Error).message}`,
      0,
      null,
    );
  } finally {
    clearTimeout(timeout);
  }
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
