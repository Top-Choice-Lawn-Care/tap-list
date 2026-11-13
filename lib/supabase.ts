import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";

/** True when both public Supabase env vars are set. The app stays local-only otherwise. */
export function isSupabaseConfigured(): boolean {
  return supabaseUrl.length > 0 && supabaseAnonKey.length > 0;
}

/**
 * Browser Supabase client. Returns null when env vars are missing so prerender
 * and local-only runs never call createBrowserClient (that throws without a URL
 * and key). Call this from a client effect, not during render.
 */
export function createClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  try {
    return createBrowserClient(supabaseUrl, supabaseAnonKey);
  } catch {
    return null;
  }
}
