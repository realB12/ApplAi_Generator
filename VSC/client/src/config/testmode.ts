// TestMode — single source of truth (DEV_GUIDES/Architecture/TestMode-Concept.md).
// Implements CR002 (CHANGES/REQUESTS/CR000/CR002-Adding a TestMode Core Principle.md)
// and CR003 (CHANGES/REQUESTS/CR000/CR003-Adding_default_Login_Credentials_to_.env.local.md).
//
// Layer 0 (hard gate):   TestMode is structurally IMPOSSIBLE in production builds,
//                        AND requires VITE_TEST_USER_MAIL + VITE_TEST_USER_PW to be
//                        set in .env.local (CR003) — missing either forces TestMode
//                        fully off, as if VITE_TESTMODE=no.
// Layer 1 (default):     .env.local VITE_TEST* variables set the local-dev default.
// Layer 2 (override):    "?test=1" URL param, then localStorage("testmode"), win over Layer 1.
//
// Everyone imports `test` from here — never scatter `import.meta.env.VITE_TESTMODE`
// checks across the codebase (Concept "Design Rules" §1).
//
// This project is Vite-only (TECH.md §1), so the hard gate reads Vite's native
// `import.meta.env.DEV` directly rather than the multi-tool fallback shown in
// the Concept doc (which also supports CRA/Next.js — not applicable here).
const IS_DEV_BUILD: boolean = import.meta.env.DEV;

// CR003 hard gate: S001 login prefill must come from .env.local, never be
// hardcoded. If either credential is missing/empty, TestMode cannot be
// enabled at all (Layer 2 overrides like ?test=1 cannot bypass this).
const HAS_TEST_CREDENTIALS: boolean = Boolean(
  import.meta.env.VITE_TEST_USER_MAIL && import.meta.env.VITE_TEST_USER_PW,
);

function resolveTestMode(): boolean {
  if (!IS_DEV_BUILD || !HAS_TEST_CREDENTIALS) return false; // hard gate — prod, or missing CR003 credentials, can never enter test mode
  const url = new URLSearchParams(window.location.search);
  if (url.has('test')) return url.get('test') === '1'; // ?test=1
  const stored = window.localStorage.getItem('testmode'); // persists across reloads
  if (stored !== null) return stored === '1';
  return import.meta.env.VITE_TESTMODE === 'yes'; // .env.local fallback
}

// Granular sub-flag helper (Concept "Design Rules" §2): each flag defaults to
// `fallback` when unset, but is always forced to `false` outside dev builds.
function flag(envValue: string | undefined, fallback: boolean): boolean {
  if (!IS_DEV_BUILD) return false;
  if (envValue === undefined) return fallback;
  return envValue === 'yes';
}

export type TestLogLevel = 'debug' | 'info' | 'warn' | 'error';

function resolveLogLevel(): TestLogLevel {
  if (!IS_DEV_BUILD) return 'warn';
  const value = import.meta.env.VITE_TEST_LOG_LEVEL;
  return value === 'debug' || value === 'info' || value === 'warn' || value === 'error' ? value : 'info';
}

export interface TestModeConfig {
  /** Master switch — Layer 0 + Layer 1/2 resolution. */
  enabled: boolean;
  /** Prefill S001 LoginPopup with config/testFixtures.ts values. */
  authPrefill: boolean;
  /**
   * Reserved for the Debug Panel core principle (Concept "Design Rules" §5).
   * The flag exists now so consumers/config stay stable; the panel UI itself
   * is intentionally deferred to a follow-up CR — see change report.
   */
  debugPanel: boolean;
  /** Minimum level emitted by utils/logger.ts. */
  logLevel: TestLogLevel;
}

export const test: TestModeConfig = {
  enabled: resolveTestMode(),
  authPrefill: flag(import.meta.env.VITE_TEST_AUTH_PREFILL, true),
  debugPanel: flag(import.meta.env.VITE_TEST_DEBUG_PANEL, true),
  logLevel: resolveLogLevel(),
};
