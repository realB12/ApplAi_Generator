// P02 — Auth Functions (PATTERNS.md, TECH.md §6).
// UPDATED 2026-08-17 (Supabase migration): OLD — `login()`/`validateSession()`
// posted to a custom `/auth/login` and `/auth/validate` REST backend. NEW —
// they call `supabase.auth.signInWithPassword()` / `supabase.auth.getSession()`
// directly; there are no custom REST endpoints left to call.
import type { User } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/lib/supabase';

export const authKeys = {
  session: ['supabase', 'session'] as const,
  user: ['supabase', 'user'] as const,
};

export type LoginInput = { email: string; password: string; captchaToken?: string; rememberMe: boolean };

// rememberMe selects the client storage adapter BEFORE authenticating (SPEC.md
// §3.2.2 / ADR-009 Amendment 2) — it never touches Supabase's own refresh-token
// TTL, which is a project-wide GoTrue setting, not a per-login parameter.
export async function login(input: LoginInput): Promise<{ user: User; accessToken: string }> {
  const { data, error } = await getSupabaseClient(input.rememberMe).auth.signInWithPassword({
    email: input.email,
    password: input.password,
    options: input.captchaToken ? { captchaToken: input.captchaToken } : undefined,
  });
  if (error || !data.user || !data.session) throw error ?? new Error('No Supabase session returned.');
  return { user: data.user, accessToken: data.session.access_token };
}

export async function getCurrentSession(): Promise<{ user: User; accessToken: string } | null> {
  const { data, error } = await getSupabaseClient().auth.getSession();
  if (error) throw error;
  return data.session ? { user: data.session.user, accessToken: data.session.access_token } : null;
}

// NOTE (DECISIONS.md ADR-014/ADR-017): Defined for API-contract completeness
// (TECH.md §6) and a possible future explicit revocation flow, but it must
// NOT be called from the LOGOUT button flow — LOGOUT is client-side only. See
// features/auth/hooks/useAuth.ts's useLogout().
export async function signOutEverywhere(): Promise<void> {
  const { error } = await getSupabaseClient().auth.signOut();
  if (error) throw error;
}
