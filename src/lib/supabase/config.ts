/**
 * Supabase configuration helper. Returns null until the project is connected,
 * so callers can degrade gracefully instead of crashing.
 */

export interface SupabaseConfig {
  url: string;
  serviceRoleKey: string;
}

export function getSupabaseAdminConfig(): SupabaseConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  // Strip any stray whitespace/newlines that can sneak in when the key is
  // pasted into a dashboard field — they make the HTTP header value invalid.
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.replace(/\s+/g, "");
  if (!url || !serviceRoleKey) return null;
  return { url, serviceRoleKey };
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}
