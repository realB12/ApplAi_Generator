# SESSION.md

> **Purpose:** The working memory of the project. Updated after every coding session.
> **Update frequency:** After every session — this is your continuity lifeline.
> **Supabase migration pass (2026-08-17):** This revision replaces the GIST-backed MasterResume load/save flow with Supabase Auth (user login) and Supabase Storage (bucket "Applai", folder "SuperCV") for master/generated CV files. See inline "UPDATED 2026-08-17 (Supabase migration)" callouts for each specific change.
>
> **Reactive Resume schema-mapping pass (2026-08-17):** TECH.md, SPEC.md, and PATTERNS.md were updated to replace the generic `MasterCVNode` tree with the real Reactive Resume `SuperCVDocument` schema (DECISIONS.md ADR-018) confirmed against `VSC/data/SuperCV/supercv.json`.
>
> **Source migration pass (2026-08-17, later same day):** `src/` has now been updated to match both passes above — Supabase Auth/Storage AND `SuperCVDocument`. See "What Was Done Last Session" below for the file-by-file change list.
>
> **TestMode pass (2026-08-19):** Implemented CR002 (`CHANGES/REQUESTS/CR000/CR002-Adding a TestMode Core Principle.md`) per `DEV_GUIDES/Architecture/TestMode-Concept.md`. See "Current Session" below.

---

## Current Session

**Date:** 2026-08-19
**Branch:** `feature/CR002-testmode`
**Focus:** Implemented CR002's TestMode core principle: a central `config/testmode.ts` flag module (Layer 0 prod hard-gate + Layer 1 `.env.local` default + Layer 2 `?test=1`/localStorage override), `config/testFixtures.ts` (dynamic-imported auth-prefill placeholder), and `utils/logger.ts` (leveled logger). Wired auth-prefill into `LoginPopup.tsx` and verbose debug logging into `apiErrorHandler.ts`. The Debug Panel UI (Concept Design Rule 5) was explicitly deferred per user decision — `test.debugPanel` exists as a flag only, no component yet. `npx tsc --noEmit` and `npx eslint` both pass with 0 errors on the touched files.

> **UPDATED 2026-08-19 (TestMode):** OLD — the app had no concept of TestMode; all auth/logging behavior was identical between dev and prod. NEW — `config/testmode.ts` is the single source of truth consumed by `LoginPopup.tsx` (auth-prefill) and `apiErrorHandler.ts` (verbose logging); `PATTERNS.md` P18 documents the pattern.

---

## Previous Session

**Date:** 2026-08-17
**Branch:** `feature/F-01-client-scaffold`
**Focus:** Migrated the actual `src/` implementation (not just the CONFIG docs) to Supabase Auth + Supabase Storage (bucket `Applai`, folder `SuperCV`) per ADR-017, and to the real `SuperCVDocument` schema per ADR-018. `npm run typecheck` and `npm run lint` both pass against the new code.

> **UPDATED 2026-08-17 (Supabase migration + Reactive Resume schema mapping):** OLD — `src/` still called a custom ASP.NET Core API / GIST proxy and rendered a generic `MasterCVNode` tree. NEW — `src/` calls Supabase Auth and direct `supabase-js` Storage calls under RLS, and TVC01 renders the real `SuperCVDocument` directly.

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
- [x] Migrated all seven CONFIG context documents to Supabase Auth + Supabase Storage (`Applai/SuperCV`) and added ADR-017.
- [x] **Migrated the actual `src/` implementation** to match both the Supabase (ADR-017) and `SuperCVDocument` (ADR-018) CONFIG passes:
  - Added `lib/supabase.ts` (Remember-Me-aware `getSupabaseClient()`/`clearLocalSupabaseSession()`), `types/superCV.ts` (`SuperCVDocument`, `SECTION_REGISTRY`, `DETAIL_FIELD_DENYLIST`).
  - Moved `auth`/`resume` Zustand slices out of `app/store.ts` into `features/auth/stores/authStore.ts` and `features/resume/stores/resumeStore.ts` (now typed `User` from `@supabase/supabase-js` and `superCV`/`pristineSuperCV`/`expandedPaths` respectively); `app/store.ts` keeps only the shared `ui` slice.
  - Rewrote `authApi.ts`/`useAuth.ts` around `signInWithPassword`/`getSession`/`onAuthStateChange`; `useValidateSession()` now also serves S000's 5s reachability guard (replaces the removed `useHealthCheck()`/`/health` endpoint).
  - Removed `gistApi.ts`/`useGist.ts`; added `supercvStorageApi.ts`/`useSuperCVStorage.ts` (Storage `list`/`download`/`upload` against fixed `Applai/SuperCV`), `superCVTree.ts` (`flattenSuperCV()`), `buildExportDocument.ts` (prune-and-clone export).
  - Rewrote `TreeView.tsx` to render `SuperCVDocument` rows directly (checkbox = `hidden` field) and added the item field-detail edit panel (SPEC.md §3.3.3 "Editing") for non-denylisted fields.
  - Rewrote `MainScreen.tsx`, `ImportDialog.tsx` (fixed-folder file picker, no URL field), `ExportDialog.tsx` (Storage collision-free filename + prune-and-clone export), `CancelButton.tsx` (`isDirty()`/`resetToPristine()`), `SettingsPanel.tsx` (dropped `gistUrl`, added the fixed storage-path note).
  - Removed the custom `User`/`MasterCVNode`/`GistFile` types from `types/index.ts` (kept `UserSettings`/`SupabaseStorageFile`); rewrote `settingsApi.ts` against a Supabase `user_settings` table; simplified `lib/api.ts` to just the AbortController utilities (+ `raceWithAbort`).
  - Updated `.env.example`/`package.json` (`VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY`, added `@supabase/supabase-js`).
  - Verified with `npm install && npx tsc --noEmit` (0 errors) and `npx eslint . --ext ts,tsx` (0 errors, 2 pre-existing warnings unrelated to this change).

> **UPDATED 2026-08-17 (Supabase migration + Reactive Resume schema mapping):** OLD — the implemented scaffold called a GIST/custom-auth backend and rendered a generic `MasterCVNode` tree. NEW — `src/` now matches both CONFIG passes end-to-end; remaining work is Supabase project/RLS configuration (not app code) — see Blockers below.

**Last Commit:** *(pending — see PR for this branch)*

---

## Current State

| Area | Status | Notes |
|------|--------|-------|
| Auth (S000/S001) | 🟢 Code complete | `src/` now calls Supabase Auth SDK (`signInWithPassword`/`getSession`/`onAuthStateChange`) directly per ADR-017. Untested end-to-end pending Supabase project configuration (see Blockers). |
| Resume (S002/TVC01/dialogs) | 🟢 Code complete | TVC01 renders the real `SuperCVDocument` (ADR-018); import/export call `Applai/SuperCV` Storage `list`/`download`/`upload` directly. Untested end-to-end pending Supabase project configuration. |
| Backend (ASP.NET Core 9) | 🔲 Removed / not needed | No backend is required for current MVP auth and RLS-scoped Storage access; see ADR-017. A minimal serverless function remains a future option only for service-role-key features. |
| Dashboard | — | N/A — no such screen in this app. |
| API Integration | 🟢 Code complete | `lib/api.ts` retains only AbortController utilities (+ `raceWithAbort`); the custom `apiClient` auth/GIST wrapper has been fully removed in favor of `supabase-js`. |
| Tests | 🔲 Not started | Add unit/component/E2E tests now that the Supabase source migration is done (TECH.md §10). |
| Styling | 🟡 In progress | Tailwind + shadcn/ui are wired to SPEC.md §2 design tokens; not yet pixel-audited against every SPEC layout. |

> **UPDATED 2026-08-17 (Supabase migration + Reactive Resume schema mapping):** OLD — the Current State required building an ASP.NET Core backend and migrating `src/`. NEW — `src/` migration is done; remaining work is Supabase project configuration (Auth + Storage RLS + `user_settings` table), not application code.

---

## Blockers & Open Questions

1. **No Auth user account exists yet.** The app has no self-registration screen (S001 is login-only by design, SPEC.md §3.2), so the first account must be created out-of-band via the Supabase Dashboard (Authentication → Users → Add user) before S001 can be tested. `auth.users` is currently empty on the live project.
2. Verify Supabase Auth project settings (Dashboard → Authentication → Settings) match SPEC.md §3.2.2's client-side password rule (min 12 chars) and decide on email-confirmation requirements for a single-user personal app.
3. No `CHANGELOG.md` exists yet, though BOUNDARIES.md §8 references one.
4. Decide whether to enable hCaptcha/Turnstile in Supabase Auth settings and retain optional `VITE_HCAPTCHA_SITEKEY`.

**Resolved this session (source):** `src/` fully migrated to Supabase Auth/Storage + `SuperCVDocument` (see "What Was Done Last Session"); this closes the two source-migration blockers carried from the previous session.

**Resolved this session (infrastructure):** Live Supabase project `Applai Generator` (`tascuxigwgedjrztwemj`, region `eu-north-1`) configured via the Supabase MCP connector: created the `Applai` Storage bucket (private) with 4 RLS policies (select/insert/update/delete) scoped to authenticated users and the fixed `SuperCV/%` object-name prefix (SPEC.md §7 checklist's "approved shared policy" — this is a single-user personal app, not multi-tenant, so no per-user subfolder isolation was added); created `public.user_settings` (columns `user_id`, `master_resume_file`, `preferred_cv_name`, `updated_at`) with RLS scoping every row to `auth.uid() = user_id`. `get_advisors` (security) returned zero findings after both migrations. A pre-existing test bucket `Applai_Test01` was left untouched (not part of this app's config; flagged for the user to delete manually if unwanted). Project URL and anon/publishable key were retrieved and handed to the user for their local `.env.local` (never committed).

**Resolved previous session:** Repo cleanliness — `VSC/client/` had parallel copies of the scaffold; the obsolete copies were removed and the canonical source folder was renamed `SRC/` → `src/`. Build/typecheck were re-verified at that time.

---

## Next Steps (Priority Order)

1. [ ] Create the first Auth user account via Supabase Dashboard → Authentication → Users (no in-app sign-up screen exists by design).
2. [ ] Set `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` in a local `.env.local` (values already retrieved this session — see chat) and run the app end-to-end (login → import a real `SuperCV.json` uploaded to `Applai/SuperCV` → select/edit → export) to catch anything the code-only typecheck/lint pass couldn't.
3. [ ] Write unit/component tests for TVC01 selection/virtualization/field-editing and the Supabase login form (TECH.md §10).
4. [ ] Add `CHANGELOG.md` and start logging entries per BOUNDARIES.md §8.
5. [ ] Playwright E2E happy path (login → Storage import → select nodes → Storage export) now that a live Supabase project is configured.
6. [ ] Revisit the Resume Mapping topic the user flagged for a separate session (item field-detail editing UX, beyond the generic denylist-based inputs shipped this session).
7. [ ] Decide whether to delete the leftover `Applai_Test01` Storage bucket (unused by the app).

---

## Known Issues

- [ISSUE-1] `npm run lint` reports 2 pre-existing warnings (react-refresh notices in `router.tsx`/`button.tsx`) — cosmetic, non-blocking, not introduced or touched this session. The `WelcomeScreen.tsx` `exhaustive-deps` warning from the previous entry is now suppressed with an explicit `eslint-disable-next-line` comment (same pattern already used elsewhere in this codebase).
- [ISSUE-2] Production bundle size has not been re-measured since adding `@supabase/supabase-js`; re-check against TECH.md §9's budget (< 500 KB initial / < 800 KB max) and consider `manualChunks` if needed.
- [ISSUE-3] *(Resolved this session)* `gistApi.ts`/`useGist.ts` and all custom-endpoint calls have been removed; `src/` now only calls Supabase.
- [ISSUE-4] The generic item field-detail editor (TreeView.tsx's `ItemFieldDetail`) renders every non-denylisted field as a plain text input, with arrays edited as comma-separated strings. This satisfies SPEC.md §3.3.3's "editable in place" requirement but has no field-type-specific widgets (e.g. rich text, date pickers); the user flagged a deeper look at Resume Mapping/editing UX for a future session.

---

## Session History (Last 5)

| Date | Focus | Key Commits | Blockers Resolved |
|------|-------|--------------|--------------------|
| 2026-08-17 | Migrated `src/` implementation to Supabase Auth/Storage + `SuperCVDocument` | *(pending commit)* | Both source-migration blockers from the previous entry: custom API/GIST calls replaced with `supabase-js`; generic tree replaced with the real schema and its `hidden` fields. `npx tsc --noEmit` and `npx eslint` both pass. |
| 2026-08-17 | Mapped the real SuperCV schema (Reactive Resume) onto TVC01 | `90577e3`+ (documentation pass) | Replaced the generic `MasterCVNode` tree with `SuperCVDocument` + Section Registry in TECH/SPEC/PATTERNS; ADR-018 established; selection now reuses the schema's own `hidden` field. |
| 2026-08-17 | Migrated CONFIG docs to Supabase Auth + Storage | *(documentation pass; pending commit)* | Replaced obsolete GIST/custom-backend architecture in all seven context documents; ADR-017 established. |
| 2026-08-17 | Reconciled DECISIONS.md/PATTERNS.md with SPEC.md/TECH.md | `046593f` | ADR-007/backend contradiction, PATTERNS.md LOGOUT server-call bug, missing EXIT/CANCEL/Import/Settings patterns. |
| 2026-08-17 | Vibecoded Phases 1–5 on the existing scaffold | `ff3ce1a` | src/SRC case-sensitivity bug, missing shadcn/ui primitives, missing AbortController wiring, non-global SMSG, missing gistUrl param, no ESLint config. |
| 2026-08-17 | Removed duplicate scaffold copies | `a25ffe1` | Repo cleanliness — `VSC/client/` now matches TECH.md §2 exactly. |
| 2026-08-17 | Renamed `SRC/` → `src/` repo-wide and restored `.vscode` settings | `cedecd9` | Aligned with standard Vite/JS lowercase convention and restored VS Code debugging configuration. |

---

*Update this file before ending every session. Push to GitHub with the code.*
