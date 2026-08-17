// P02 — Supabase Client Singleton (PATTERNS.md, TECH.md §7).
// UPDATED 2026-08-17 (Supabase migration): replaces the custom REST
// auth/GIST backend entirely — Supabase Auth + Storage are called directly.
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Memory-only by default. `supabase-js` defaults to localStorage, which would
// contradict ADR-009. "Remember me" (SPEC.md §3.2.2) does NOT extend Supabase's
// refresh-token TTL — that is a project-wide GoTrue setting, not a per-login
// parameter. Instead it selects the adapter: sessionStorage when checked
// (survives reload, cleared at tab/window close), memory-only when unchecked
// (cleared on any reload). See ADR-009 Amendment 2 (2026-08-17).
interface MemoryStorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const memoryValues = new Map<string, string>();
const memoryStorage: MemoryStorageAdapter = {
  getItem: (key) => memoryValues.get(key) ?? null,
  setItem: (key, value) => {
    memoryValues.set(key, value);
  },
  removeItem: (key) => {
    memoryValues.delete(key);
  },
};

const STORAGE_KEY = 'applai-supabase-auth';

// ADR-014 local-only logout must clear whichever adapter is active, otherwise
// getSession() would restore the still-resident session after the redirect.
export function clearLocalSupabaseSession(): void {
  memoryValues.clear();
  window.sessionStorage.removeItem(STORAGE_KEY);
}

let client: SupabaseClient | undefined;
let clientRememberMe: boolean | undefined;

// Call with the S001 "Remember me" value at login time; calling again with a
// DIFFERENT value recreates the client against the other adapter. Calling with
// no argument (e.g. the S000 session-restore check) reuses the existing client
// without changing its adapter.
export function getSupabaseClient(rememberMe?: boolean): SupabaseClient {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase client configuration.');
  }
  const wantsRememberMe = rememberMe ?? clientRememberMe ?? false;
  if (!client || (rememberMe !== undefined && rememberMe !== clientRememberMe)) {
    clientRememberMe = wantsRememberMe;
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: wantsRememberMe ? window.sessionStorage : memoryStorage,
        storageKey: STORAGE_KEY,
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return client;
}
