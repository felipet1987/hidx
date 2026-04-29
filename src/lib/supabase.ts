import { type SupabaseClient, createClient } from '@supabase/supabase-js';

function requireEnv(key: string): string {
  const value = process.env[key] ?? import.meta.env?.[key];
  if (!value) {
    throw new Error(`Missing env var: ${key}`);
  }
  return value;
}

/**
 * Read-only client using the anon/publishable key.
 * Subject to RLS — only published articles are readable.
 * Safe to use in build context (no write access).
 */
export function createAnonClient(): SupabaseClient {
  return createClient(requireEnv('SUPABASE_URL'), requireEnv('SUPABASE_ANON_KEY'), {
    auth: { persistSession: false },
  });
}

/**
 * Privileged client using the service-role/secret key.
 * Bypasses RLS. NEVER expose this client in browser context or CI build.
 * Use only in CLI scripts run locally with `.env.local`.
 */
export function createServiceClient(): SupabaseClient {
  return createClient(requireEnv('SUPABASE_URL'), requireEnv('SUPABASE_SERVICE_ROLE'), {
    auth: { persistSession: false },
  });
}
