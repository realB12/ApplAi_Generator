// P02 — TanStack Query Auth Hooks (PATTERNS.md), LOGOUT fixed per ADR-014.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authKeys, checkHealth, login, validateSession } from '../api/authApi';
import { useAuthStore } from '@/app/store';
import { abortAllRequests } from '@/lib/api';

export function useHealthCheck() {
  return useQuery({
    queryKey: authKeys.health,
    queryFn: checkHealth,
    retry: 3,
    retryDelay: (attempt: number) => Math.min(1000 * 2 ** attempt, 4000),
  });
}

// SPEC.md §3.1.3: 401/403 on this call just means "no valid session" — it is
// expected, not an app-level error. The consumer (app/RootLayout.tsx) reads
// `isFetched`/`isError` to flip authStore.isLoading to false once settled.
export function useValidateSession() {
  const setAuth = useAuthStore((s) => s.setAuth);
  return useQuery({
    queryKey: authKeys.validate,
    queryFn: async () => {
      const data = await validateSession();
      setAuth(data.user, data.accessToken);
      return data;
    },
    retry: false,
    staleTime: Infinity,
  });
}

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
      queryClient.invalidateQueries({ queryKey: authKeys.validate });
    },
  });
}

// LOGOUT is client-side-only per SPEC.md §3.6.4 / TECH.md §7 / DECISIONS.md
// ADR-014: no server call, no waiting for pending transactions. It is a
// plain callback, NOT a TanStack Query mutation — there is nothing to await.
export function useLogout() {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const queryClient = useQueryClient();

  return function performLogout() {
    abortAllRequests(); // TECH.md §8 — no pending transactions are waited for
    clearAuth();
    queryClient.clear();
    window.location.href = '/'; // hard redirect to S000
  };
}
