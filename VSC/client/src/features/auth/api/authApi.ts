// P02 — TanStack Query Auth Hooks: API layer (PATTERNS.md, TECH.md §6)
import { apiClient, createRequestSignal } from '@/lib/api';
import { User } from '@/types';

export const authKeys = {
  health: ['health'] as const,
  validate: ['validate'] as const,
  user: ['user'] as const,
};

export async function checkHealth() {
  return apiClient<{ status: string }>('/health', { signal: createRequestSignal() });
}

export async function login(credentials: { email: string; password: string; captchaToken?: string }) {
  return apiClient<{ user: User; accessToken: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
    signal: createRequestSignal(),
  });
}

export async function validateSession() {
  return apiClient<{ user: User; accessToken: string }>('/auth/validate', {
    method: 'POST',
    signal: createRequestSignal(),
  });
}

// NOTE (DECISIONS.md ADR-014): Defined for API-contract completeness
// (TECH.md §6) and possible future use (e.g. refresh-token revocation), but
// it must NOT be called from the LOGOUT button flow — LOGOUT is client-side
// only. See features/auth/hooks/useAuth.ts's useLogout().
export async function logout() {
  return apiClient<void>('/auth/logout', { method: 'POST', signal: createRequestSignal() });
}
