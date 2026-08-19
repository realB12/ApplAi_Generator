// TestMode-only fixtures (DEV_GUIDES/Architecture/TestMode-Concept.md, Design
// Rule 3). Never import this file statically from a production code path —
// always `await import('@/config/testFixtures')` behind a `test.enabled` check
// so bundlers can tree-shake it out of the production bundle.
//
// Placeholder credentials only. This project authenticates through Supabase
// Auth (lib/supabase.ts), so signing in with these still requires a REAL user
// to exist in your Supabase project — create one with this exact email and
// password (or edit the values below to match a test account you already
// have). The password is 13 characters to satisfy LoginPopup's 12-character
// Zod minimum.
export interface AuthPrefill {
  email: string;
  password: string;
}

export const authPrefill: AuthPrefill = {
  email: 'tester@example.com',
  password: 'Test1234567!',
};
