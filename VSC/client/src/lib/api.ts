// UPDATED 2026-08-17 (Supabase migration): OLD — `apiClient()` posted to a
// custom backend and refreshed custom cookies. NEW — Supabase Auth/Storage
// SDK calls are made directly (lib/supabase.ts, features/*/api/*); this file
// now only holds the shared AbortController cancellation utilities
// (TECH.md §8, DECISIONS.md ADR-012).
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

// Supabase SDK Storage methods do not universally accept an external
// AbortSignal. Race the UI result so CANCEL/EXIT/LOGOUT can return
// immediately, then ignore a late SDK result; this does not guarantee the
// underlying network request stops.
export function raceWithAbort<T>(operation: Promise<T>, signal: AbortSignal): Promise<T> {
  return Promise.race([
    operation,
    new Promise<T>((_, reject) => {
      signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true });
    }),
  ]);
}
