// P02 — API Client with Interceptor (PATTERNS.md), extended per TECH.md §8
// with AbortController-based request cancellation (DECISIONS.md ADR-012).
import { useAuthStore } from '@/app/store';

const API_BASE = import.meta.env.VITE_API_URL;

interface ApiRequestOptions extends RequestInit {
  signal?: AbortSignal;
}

export async function apiClient<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
  const { accessToken } = useAuthStore.getState();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    ...((options.headers as Record<string, string>) || {}),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include', // httpOnly cookies
  });

  if (response.status === 401) {
    const refreshed = await refreshAccessToken();
    if (!refreshed) {
      useAuthStore.getState().clearAuth();
      window.location.href = '/';
      throw new Error('Session expired');
    }
    return apiClient(endpoint, options);
  }

  if (!response.ok) {
    let body: unknown;
    try {
      body = await response.json();
    } catch {
      body = { error: { message: `Request failed with status ${response.status}`, code: 'UNKNOWN' } };
    }
    throw body;
  }

  if (response.status === 204) return undefined as T;
  return response.json();
}

async function refreshAccessToken(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/auth/validate`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) return false;
    const data = await res.json();
    useAuthStore.getState().setAuth(data.user, data.accessToken);
    return true;
  } catch {
    return false;
  }
}

// --- Request cancellation (TECH.md §8 / DECISIONS.md ADR-012) -------------
// EXIT, LOGOUT, and CANCEL call abortAllRequests() before executing their
// primary action. Callers that want a cancellable request obtain a signal
// via createRequestSignal() and pass it through `options.signal`.
const abortControllers = new Set<AbortController>();

export function createRequestSignal(): AbortSignal {
  const controller = new AbortController();
  abortControllers.add(controller);
  return controller.signal;
}

export function abortAllRequests(): void {
  abortControllers.forEach((c) => c.abort());
  abortControllers.clear();
}
