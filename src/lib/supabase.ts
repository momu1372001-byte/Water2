import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase browser client wrapper.
 *
 * Reads publishable (anon) key + URL from Vite env. NEVER import a service-role
 * key in browser code — it is not exposed here and is not in env.
 *
 * Validates that the URL host matches the expected project id, and falls back
 * gracefully (returns null) when Supabase is not configured — the app still
 * works fully as a guest with localStorage persistence.
 */

const EXPECTED_PROJECT_ID = 'xqzlvepwigeghuyerkkr';
const EXPECTED_HOST = `${EXPECTED_PROJECT_ID}.supabase.co`;

interface Env {
  url: string | null;
  key: string | null;
}

function readEnv(): Env {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;
  return {
    url: url && url.length > 0 ? url : null,
    key: key && key.length > 0 ? key : null,
  };
}

let client: SupabaseClient | null = null;
let initError: string | null = null;

export function getSupabase(): SupabaseClient | null {
  if (client) return client;
  if (initError) return null;

  const { url, key } = readEnv();

  if (!url || !key) {
    initError = 'Supabase not configured. Running in guest-only mode.';
    return null;
  }

  // Validate URL host matches the expected project id.
  let host = '';
  try {
    host = new URL(url).host;
  } catch {
    initError = `Invalid Supabase URL: ${url}`;
    return null;
  }
  if (host !== EXPECTED_HOST) {
    initError = `Supabase URL host "${host}" does not match expected project "${EXPECTED_HOST}". Refusing to connect to an unexpected project.`;
    return null;
  }

  client = createClient(url, key, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
  return client;
}

export function getSupabaseStatus(): { available: boolean; error: string | null } {
  return { available: getSupabase() !== null, error: initError };
}

export const SUPABASE_PROJECT_ID = EXPECTED_PROJECT_ID;
