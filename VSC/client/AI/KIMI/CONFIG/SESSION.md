# SESSION.md

> **Purpose:** The working memory of the project. Updated after every coding session.
> **Update frequency:** After every session — this is your continuity lifeline.
> **Supabase migration pass (2026-08-17):** This revision replaces the GIST-backed MasterResume load/save flow with Supabase Auth (user login) and Supabase Storage (bucket "Applai", folder "SuperCV") for master/generated CV files. See inline "UPDATED 2026-08-17 (Supabase migration)" callouts for each specific change.
>
> **Reactive Resume schema-mapping pass (2026-08-17):** TECH.md, SPEC.md, and PATTERNS.md were updated to replace the generic `MasterCVNode` tree with the real Reactive Resume `SuperCVDocument` schema (DECISIONS.md ADR-018) confirmed against `VSC/data/SuperCV/supercv.json`. `src/` still needs to be migrated to match (see Next Steps).

---

## Current Session

**Date:** 2026-08-17
**Branch:** `feature/F-01-client-scaffold`
**Focus:** Migrated context docs (VISION/SPEC/TECH/BOUNDARIES/DECISIONS/PATTERNS) from GIST-backed storage + custom Argon2id/JWT auth to Supabase Auth + Supabase Storage (bucket `Applai`, folder `SuperCV`) per ADR-017. This documentation pass does not modify `src/` implementation.

> **UPDATED 2026-08-17 (Supabase migration):** OLD — the context docs directed the client to a custom ASP.NET Core API and GIST proxy. NEW — they direct the SPA to Supabase Auth and direct `supabase-js` Storage calls under RLS.

---

## What Was Done Last Session

- [x] Fixed a real cross-platform bug: the scaffold's `vite.config.ts`/`tsconfig.json`/`tailwind.config.js`/`components.json`/`index.html` referenced a lowercase `./src` path that only resolved on case-insensitive filesystems (Windows), while the actual folder on disk was `SRC/` (uppercase, and the project root itself — not a subfolder within one). All path references were corrected to be root-relative. **Later resolved permanently** (see below): the folder itself was renamed to lowercase `src/`, so this class of bug can no longer recur.
- [x] Added missing shadcn/ui primitives (`button`, `input`, `label`, `checkbox`, `dialog`).
- [x] Added missing semantic Tailwind color tokens (`border`, `background`, `ring`, etc.) mapped to CSS variables in `styles/index.css`.
- [x] Implemented `lib/api.ts` (P02) with AbortController wiring (`createRequestSignal`/`abortAllRequests`) required by TECH.md §8.
- [x] Implemented the global SMSG message system (`hooks/useMessage.ts` as a Zustand store, rendered once in `app/RootLayout.tsx`).
- [x] Implemented Auth feature: `authApi.ts`, `useAuth.ts`, `WelcomeScreen.tsx` (S000), `LoginPopup.tsx` (S001), `PasswordToggle.tsx`, `ExitButton.tsx`, `LogoutButton.tsx`, and `ProtectedRoute.tsx`.
- [x] Implemented Resume feature: `gistApi.ts`/`settingsApi.ts`, `useGist.ts`/`useSettings.ts`, `TreeView.tsx` (TVC01), `MainScreen.tsx` (S002), `ExportDialog.tsx` (S002D1), `ImportDialog.tsx` (S002D2), `SettingsPanel.tsx` (S002S1), and `CancelButton.tsx`.
- [x] Extended `app/store.ts` with a `resume` slice and an `isTransactionRunning` flag.
- [x] Added route-level code splitting and a working `.eslintrc.cjs`; `npm run typecheck` and `npm run build` passed at that point.
- [x] Migrated all seven CONFIG context documents to Supabase Auth + Supabase Storage (`Applai/SuperCV`) and added ADR-017. Actual source-code migration remains outstanding.

> **UPDATED 2026-08-17 (Supabase migration):** OLD — the implemented scaffold is documented as calling a GIST/custom-auth backend. NEW — the architectural context now specifies Supabase; existing `src/` must be updated to match before end-to-end testing.

**Last Commit:** *(pending — see PR for this branch)*

---

## Current State

| Area | Status | Notes |
|------|--------|-------|
| Auth (S000/S001) | 🟡 In progress | UI + existing client logic are complete; must be changed from custom API calls to Supabase Auth SDK calls per ADR-017. |
| Resume (S002/TVC01/dialogs) | 🟡 In progress | UI + existing client logic are complete; import/export must be changed from GIST calls to `Applai/SuperCV` Storage list/download/upload calls. |
| Backend (ASP.NET Core 9) | 🔲 Removed / not needed | No backend is required for current MVP auth and RLS-scoped Storage access; see ADR-017. A minimal serverless function remains a future option only for service-role-key features. |
| Dashboard | — | N/A — no such screen in this app. |
| API Integration | 🟡 In progress | AbortController utilities remain useful; custom `apiClient` auth/GIST wrapper must be removed or retired in favor of `supabase-js`. |
| Tests | 🔲 Not started | Add unit/component/E2E tests after the Supabase source migration (TECH.md §10). |
| Styling | 🟡 In progress | Tailwind + shadcn/ui are wired to SPEC.md §2 design tokens; not yet pixel-audited against every SPEC layout. |

> **UPDATED 2026-08-17 (Supabase migration):** OLD — the Current State required building an ASP.NET Core backend. NEW — the current MVP needs Supabase project configuration, RLS policies, and source migration rather than a custom backend.

---

## Blockers & Open Questions

1. `src/` still implements the old custom API/GIST contract; it must be migrated to `@supabase/supabase-js` before login, import, export, and settings can be tested end-to-end.
2. The Supabase project must define Storage RLS policies for authenticated users' `Applai/SuperCV` objects and supply `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY`.
3. Decide the authoritative persistence location for `UserSettings` now that the custom `/api/user/settings` backend is removed (a Supabase table under RLS is the recommended implementation).
4. No `CHANGELOG.md` exists yet, though BOUNDARIES.md §8 references one.
5. Decide whether to enable hCaptcha/Turnstile in Supabase Auth settings and retain optional `VITE_HCAPTCHA_SITEKEY`.

**Resolved this session:** Repo cleanliness — `VSC/client/` had parallel copies of the scaffold; the obsolete copies were removed and the canonical source folder was renamed `SRC/` → `src/`. Build/typecheck were re-verified at that time.

---

## Next Steps (Priority Order)

1. [ ] **Update remaining source code (`src/`) to match the new context docs:** replace custom auth/GIST APIs with the Supabase client, direct Storage operations in `Applai/SuperCV`, and the in-memory Supabase session adapter. This now also includes the `SuperCVDocument`/Section Registry data model (ADR-018) — there is no `MasterCVNode`/`TreeNode` to build against anymore.
2. [ ] Configure Supabase Auth, bucket `Applai`, folder/path `SuperCV`, and authenticated-user RLS policies; never use the service role key in the browser.
3. [ ] Decide and implement RLS-scoped user-settings persistence (recommended: Supabase table) for `masterResumeFile` and `preferredCvName`.
4. [ ] Write unit/component tests for TVC01 selection/virtualization and the Supabase login form (TECH.md §10).
5. [ ] Add `CHANGELOG.md` and start logging entries per BOUNDARIES.md §8.
6. [ ] Playwright E2E happy path (login → Storage import → select nodes → Storage export) after the source migration.

---

## Known Issues

- [ISSUE-1] `npm run lint` reports 3 warnings (react-refresh notices in `router.tsx`/`button.tsx`, one `react-hooks/exhaustive-deps` in `WelcomeScreen.tsx`) — cosmetic, non-blocking, not yet cleaned up.
- [ISSUE-2] Production bundle vendor chunk is about 404 KB / 129 KB gzip — within TECH.md §9 budget but worth revisiting with `manualChunks` if more routes are added.
- [ISSUE-3] The existing source still names `gistApi`/`useGist` and calls custom endpoints; this is expected until the priority source migration is completed.

---

## Session History (Last 5)

| Date | Focus | Key Commits | Blockers Resolved |
|------|-------|--------------|--------------------|
| 2026-08-17 | Mapped the real SuperCV schema (Reactive Resume) onto TVC01 | `90577e3`+ (documentation pass) | Replaced the generic `MasterCVNode` tree with `SuperCVDocument` + Section Registry in TECH/SPEC/PATTERNS; ADR-018 established; selection now reuses the schema's own `hidden` field. |
| 2026-08-17 | Migrated CONFIG docs to Supabase Auth + Storage | *(documentation pass; pending commit)* | Replaced obsolete GIST/custom-backend architecture in all seven context documents; ADR-017 established. |
| 2026-08-17 | Reconciled DECISIONS.md/PATTERNS.md with SPEC.md/TECH.md | `046593f` | ADR-007/backend contradiction, PATTERNS.md LOGOUT server-call bug, missing EXIT/CANCEL/Import/Settings patterns. |
| 2026-08-17 | Vibecoded Phases 1–5 on the existing scaffold | `ff3ce1a` | src/SRC case-sensitivity bug, missing shadcn/ui primitives, missing AbortController wiring, non-global SMSG, missing gistUrl param, no ESLint config. |
| 2026-08-17 | Removed duplicate scaffold copies | `a25ffe1` | Repo cleanliness — `VSC/client/` now matches TECH.md §2 exactly. |
| 2026-08-17 | Renamed `SRC/` → `src/` repo-wide and restored `.vscode` settings | `cedecd9` | Aligned with standard Vite/JS lowercase convention and restored VS Code debugging configuration. |

---

*Update this file before ending every session. Push to GitHub with the code.*
