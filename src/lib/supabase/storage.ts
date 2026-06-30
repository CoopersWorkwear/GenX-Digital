import "server-only";
import { getSupabaseAdminConfig } from "./config";

/**
 * Minimal Supabase Storage helpers using the REST API + service-role key.
 * Used by the website builder to store uploaded logos/images and the build
 * brief. Returns null when Supabase isn't configured so callers can degrade.
 */

const BUCKET = "builder";

function authHeaders(key: string) {
  return { apikey: key, Authorization: `Bearer ${key}` };
}

/** Ensure the public bucket exists (idempotent). */
async function ensureBucket(url: string, key: string): Promise<void> {
  await fetch(`${url}/storage/v1/bucket`, {
    method: "POST",
    headers: { ...authHeaders(key), "Content-Type": "application/json" },
    body: JSON.stringify({ id: BUCKET, name: BUCKET, public: true }),
  }); // 200 created or 409 already-exists — both fine.
}

export interface UploadedFile {
  blob: Blob;
  path: string;
  contentType: string;
}

/** Upload a set of objects; returns their public URLs in the same order. */
export async function uploadBuilderObjects(
  files: UploadedFile[],
): Promise<string[] | null> {
  const config = getSupabaseAdminConfig();
  if (!config) return null;
  const { url, serviceRoleKey } = config;

  await ensureBucket(url, serviceRoleKey);

  const urls: string[] = [];
  for (const f of files) {
    const res = await fetch(`${url}/storage/v1/object/${BUCKET}/${f.path}`, {
      method: "POST",
      headers: {
        ...authHeaders(serviceRoleKey),
        "Content-Type": f.contentType,
        "x-upsert": "true",
      },
      body: Buffer.from(await f.blob.arrayBuffer()),
    });
    if (!res.ok) {
      throw new Error(`storage upload failed (${res.status}) for ${f.path}`);
    }
    urls.push(`${url}/storage/v1/object/public/${BUCKET}/${f.path}`);
  }
  return urls;
}

export function publicUrl(path: string): string | null {
  const config = getSupabaseAdminConfig();
  if (!config) return null;
  return `${config.url}/storage/v1/object/public/${BUCKET}/${path}`;
}
