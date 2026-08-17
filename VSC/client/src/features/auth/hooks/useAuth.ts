// P02 — Auth Hooks (PATTERNS.md), LOGOUT fixed per ADR-014.
// UPDATED 2026-08-17 (Supabase migration): OLD — `useHealthCheck()` polled a
// custom `/health` REST endpoint with retry backoff, and `useValidateSession()`
// posted to `/auth/validate`. NEW — a single `useValidateSession()` call
// serves both purposes (SPEC.md §3.1.3): it calls `getCurrentSession()`
// through a 5s reachability guard, and `onAuthStateChange()` keeps the
// Zustand store synchronized afterward.
import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { clearLocalSupabaseSession, getSupabaseClient } from '@/lib/supabase';
import { abortAllRequests } from '@/lib/api';
import { authKeys, getCurrentSession, login } from '../api/authApi';
import { useAuthStore } from '../stores/authStore';

// SPEC.md §3.1.3: "call supabase.auth.getSession() with a 5s UI
// timeout/reachability guard" — if Supabase does not respond within 5s,
// treat it the same as a reachability failure (SMSG error + Retry).
function withReachabilityTimeout<T>(promise: Promise<T>, ms = 5000): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Authentication service is unavailable.')), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

// Serves both S000 concerns at once (SPEC.md §3.1.3):
// 1. Reachability check — isPending -> spinner, isError -> SMSG + Retry.
// 2. Returning-user check — isSuccess with a session -> isAuthenticated,
//    consumed by WelcomeScreen/RootLayout to redirect straight to S002.
export function useValidateSession() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const setLoading = useAuthStore((state) => state.setLoading);

  const query = useQuery({
    queryKey: authKeys.session,
    queryFn: () => withReachabilityTimeout(getCurrentSession()),
    retry: false,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (query.isSuccess) {
      if (query.data) setAuth(query.data.user, query.data.accessToken);
      else clearAuth();
    }
    if (query.isError) {
      clearAuth();
      setLoading(false);
    }
  }, [query.isSuccess, query.isError, query.data, setAuth, clearAuth, setLoading]);

  useEffect(() => {
    const {
      data: { subscription },
    } = getSupabaseClient().auth.onAuthStateChange((_event, session) => {
      if (session) setAuth(session.user, session.access_token);
      else clearAuth();
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return query;
}

export function useLogin() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
      queryClient.invalidateQueries({ queryKey: authKeys.session });
    },
  });
}

// LOGOUT is client-side-only per SPEC.md §3.6.4 / TECH.md §7 / DECISIONS.md
// ADR-014: no server call, no waiting for pending transactions. It is a
// plain callback, NOT a TanStack Query mutation — there is nothing to await.
// Do NOT call supabase.auth.signOut() here (see authApi.ts's
// signOutEverywhere() for that separate, unused-by-LOGOUT revocation path).
export function useLogout() {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const queryClient = useQueryClient();

  return function performLogout() {
    abortAllRequests(); // TECH.md §8 — no pending transactions are waited for
    clearLocalSupabaseSession();
    clearAuth();
    queryClient.clear();
    window.location.href = '/'; // hard redirect to S000
  };
}
