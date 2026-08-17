# SESSION.md

> **Purpose:** The working memory of the project. Updated after every coding session.
> **Update frequency:** After every session — this is your continuity lifeline.

---

## Current Session

**Date:** 2026-08-17
**Branch:** `feature/F-01-client-scaffold`
**Focus:** Vibecoding Phases 1–5 on top of the existing scaffold (`VSC/client/src`) — App shell, Auth feature, Resume feature, dialogs, and error handling. Later in the same day: renamed the source folder from `SRC/` to `src/` repo-wide (code + all context/prompt docs).

---

## What Was Done Last Session

- [x] Fixed a real cross-platform bug: the scaffold's `vite.config.ts`/`tsconfig.json`/`tailwind.config.js`/`components.json`/`index.html` referenced a lowercase `./src` path that only resolved on case-insensitive filesystems (Windows), while the actual folder on disk was `SRC/` (uppercase, and the project root itself — not a subfolder within one). All path references were corrected to be root-relative (no `src`/`SRC` segment at all). **Later resolved permanently** (see below): the folder itself was renamed to lowercase `src/`, so this class of bug can no longer recur.
- [x] Added the missing shadcn/ui primitives (`button`, `input`, `label`, `checkbox`, `dialog`) — `npx shadcn add` had never actually been run.
- [x] Added missing semantic Tailwind color tokens (`border`, `background`, `ring`, etc.) mapped to the CSS variables already defined in `styles/index.css`.
- [x] Implemented `lib/api.ts` (P02) with the AbortController wiring (`createRequestSignal`/`abortAllRequests`) required by TECH.md §8.
- [x] Implemented the global SMSG message system (`hooks/useMessage.ts` as a Zustand store, rendered once in the new `app/RootLayout.tsx`) — fixes a latent design gap in PATTERNS.md P08, which used local per-component state and could not actually satisfy SPEC.md §3.7.4's "only one SMSG visible at a time" rule.
- [x] Implemented Auth feature: `authApi.ts`, `useAuth.ts` (health check, session validation, login, **client-side-only logout per ADR-014**), `WelcomeScreen.tsx` (S000), `LoginPopup.tsx` (S001, with CAPTCHA-after-3-fails and lockout-after-5-fails), `PasswordToggle.tsx`, `ExitButton.tsx`, `LogoutButton.tsx`, real `ProtectedRoute.tsx`.
- [x] Implemented Resume feature: `gistApi.ts`/`settingsApi.ts` (fixed missing `gistUrl` param bug from PATTERNS.md P06), `useGist.ts`/`useSettings.ts`, `TreeView.tsx` (TVC01, with the editable info-field PATTERNS.md P05 declared but never wired up), `MainScreen.tsx` (S002), `ExportDialog.tsx` (S002D1), `ImportDialog.tsx` (S002D2), `SettingsPanel.tsx` (S002S1), `CancelButton.tsx`.
- [x] Extended `app/store.ts` with the `resume` slice (co-located here rather than `features/resume/stores/`, matching this project's already-established scaffold convention) and an `isTransactionRunning` flag so CANCEL can correctly detect in-flight requests across dialogs.
- [x] Added route-level code splitting (`React.lazy` + `Suspense`) per TECH.md §9's enforcement rule.
- [x] Added a working `.eslintrc.cjs` (the `lint` script had no config file at all).
- [x] `npm run typecheck` and `npm run build` both pass with zero errors. Smoke-tested with a headless browser: S000 renders, health-check retry/backoff works, and the global SMSG error popup correctly appears when the (not-yet-built) backend is unreachable.

**Last Commit:** *(pending — see PR for this branch)*

---

## Current State

| Area | Status | Notes |
|------|--------|-------|
| Auth (S000/S001) | 🟡 In progress | UI + client logic complete; untestable end-to-end without the ASP.NET Core backend (ADR-011), which does not exist yet |
| Resume (S002/TVC01/dialogs) | 🟡 In progress | UI + client logic complete; same backend dependency as above |
| Backend (ASP.NET Core 9) | 🔲 Not started | Out of scope for this session — `VITE_API_URL` currently points nowhere |
| Dashboard | — | N/A — no such screen in this app |
| API Integration | 🟡 In progress | Client-side `apiClient`/AbortController wiring done; no server to integrate against yet |
| Tests | 🔲 Not started | No unit/component/E2E tests written yet (TECH.md §10) |
| Styling | 🟡 In progress | Tailwind + shadcn/ui wired to SPEC.md §2's design tokens; not yet pixel-audited against every SPEC layout |

---

## Blockers & Open Questions

1. No backend exists yet (ADR-011: ASP.NET Core 9 Minimal API). Login, GIST import/export, and Settings cannot be exercised end-to-end until it's built.
2. No `CHANGELOG.md` exists yet, though BOUNDARIES.md §8 references one.

**Resolved this session:** Repo cleanliness — `VSC/client/` had three parallel copies of the scaffold (loose files directly under `VSC/client/`, `VSC/client/scaffold/`, and the canonical `VSC/client/SRC/`). Confirmed via diff that the two duplicates were strictly older/superseded with nothing unique, then removed both. `VSC/client/` now matches TECH.md §2's structure exactly.

**Also resolved this session:** Renamed `VSC/client/SRC/` → `VSC/client/src/` (lowercase) at the user's request, and updated every text reference to the path across TECH.md, this file, and the AI/KIMI prompt/scaffold docs. Since `vite.config.ts`/`tsconfig.json`/etc. already used root-relative paths (no hardcoded folder name, per the earlier fix above), the rename required no config changes — `npm run typecheck` and `npm run build` were re-verified to still pass afterward.

---

## Next Steps (Priority Order)

1. [ ] Build the ASP.NET Core 9 Minimal API backend per TECH.md §6's contract (ADR-011).
2. [ ] Write unit/component tests for TVC01 selection+virtualization and the login form (TECH.md §10).
3. [ ] Add `CHANGELOG.md` and start logging entries per BOUNDARIES.md §8.
4. [ ] Playwright E2E happy-path (login → import → select nodes → export) once the backend exists.

---

## Known Issues

- [ISSUE-1] `npm run lint` reports 3 warnings (react-refresh fast-refresh notices in `router.tsx`/`button.tsx`, one `react-hooks/exhaustive-deps` in `WelcomeScreen.tsx`) — cosmetic, non-blocking, not yet cleaned up.
- [ISSUE-2] Production bundle's vendor chunk (`index-*.js`) is ~404 KB / 129 KB gzip — within TECH.md §9's budget but worth revisiting with `manualChunks` if more routes are added.

---

## Session History (Last 5)

| Date | Focus | Key Commits | Blockers Resolved |
|------|-------|--------------|--------------------|
| 2026-08-17 | Reconciled DECISIONS.md/PATTERNS.md with SPEC.md/TECH.md | `046593f` | ADR-007/backend contradiction, PATTERNS.md LOGOUT server-call bug, missing EXIT/CANCEL/Import/Settings patterns |
| 2026-08-17 | Vibecoded Phases 1–5 on the existing scaffold | `ff3ce1a` | src/SRC case-sensitivity bug, missing shadcn/ui primitives, missing AbortController wiring, non-global SMSG, missing gistUrl param, no ESLint config |
| 2026-08-17 | Removed duplicate scaffold copies | `a25ffe1` | Repo cleanliness — `VSC/client/` now matches TECH.md §2 exactly |
| 2026-08-17 | Renamed `SRC/` → `src/` repo-wide | *(pending)* | Aligned with standard Vite/JS lowercase convention; permanently removes the src/SRC case-sensitivity risk |

---

*Update this file before ending every session. Push to GitHub with the code.*
