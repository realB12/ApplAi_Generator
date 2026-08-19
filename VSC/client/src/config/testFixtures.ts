// TestMode-only fixtures (DEV_GUIDES/Architecture/TestMode-Concept.md, Design
// Rule 3). Never import this file statically from a production code path —
// always `await import('@/config/testFixtures')` behind a `test.enabled` check
// so bundlers can tree-shake it out of the production bundle.
//
// UPDATED 2026-08-19 (CR003): No more hardcoded credentials. VITE_TEST_USER_MAIL
// and VITE_TEST_USER_PW are read straight from .env.local. This project
// authenticates through Supabase Auth (lib/supabase.ts), so signing in still
// requires a REAL user matching these values to exist in your Supabase
// project. config/testmode.ts's Layer 0 gate already guarantees `test.enabled`
// is false whenever either variable is missing/empty, so this module is only
// ever imported when both are present — no fallback handling needed here.
export interface AuthPrefill {
  email: string;
  password: string;
}

export const authPrefill: AuthPrefill = {
  email: import.meta.env.VITE_TEST_USER_MAIL,
  password: import.meta.env.VITE_TEST_USER_PW,
};
