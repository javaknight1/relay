import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@relay/shared";

let _supabase: SupabaseClient<Database> | null = null;

/** Client-side Supabase client (uses anon key, subject to RLS). */
export function getSupabase() {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anonKey) {
      throw new Error(
        "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY",
      );
    }
    _supabase = createClient<Database>(url, anonKey);
  }
  return _supabase;
}

/** Server-side Supabase client (uses service role key, bypasses RLS). */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
    );
  }
  return createClient<Database>(url, serviceRoleKey);
}
