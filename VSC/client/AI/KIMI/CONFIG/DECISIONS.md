# DECISIONS.md

> **Purpose:** Architectural Decision Records (ADRs). Why we chose X over Y. Prevents re-litigating decisions.
> **Update frequency:** Per significant architectural decision.
> **Compliance pass (2026-08-17):** This revision reconciles DECISIONS.md with TECH.md v1.0.3 / SPEC.md v1.0.3. All "[FILL IN]" placeholders removed. ADR-007 ("No Custom Backend in MVP") contradicted TECH.md's ASP.NET Core 9 backend and has been marked **Superseded by ADR-011**. Nine ADRs (ADR-008 – ADR-016) were added to cover decisions that existed only in TECH.md §14's Decision Log and had no corresponding ADR. See BOUNDARIES.md §8 — this file may not be changed by AI without explicit approval going forward.
>
> **Supabase migration pass (2026-08-17):** This revision replaces the GIST-backed MasterResume load/save flow with Supabase Auth (user login) and Supabase Storage (bucket "Applai", folder "SuperCV") for master/generated CV files. ADR-017 supersedes ADR-011 while preserving its historical record; see inline "UPDATED 2026-08-17 (Supabase migration)" callouts for each specific change.

---

## ADR-017: Supabase BaaS Replaces Custom Backend for Auth + Storage

**Status:** Accepted
**Date:** 2026-08-17
**Context:** The MVP needs email/password authentication plus authenticated read/write of SuperCV JSON files in fixed Supabase Storage path `Applai/SuperCV`. The former custom ASP.NET Core backend existed to keep a GitHub PAT out of the browser and to implement Argon2id hashing, JWT issuance, CAPTCHA, and rate limiting. Supabase Auth now manages passwords, access/refresh JWT issuance and rotation, and auth endpoint protections; Supabase Storage RLS authorizes the authenticated user's direct browser Storage calls. No GitHub PAT or similar secret is involved.

**Decision:** Use `@supabase/supabase-js` directly from the React SPA for `supabase.auth.signInWithPassword`, `getSession`, `onAuthStateChange`, `getUser`, and fixed-folder Storage `list`, `download`, and `upload` calls. Configure Storage RLS policies around the authenticated user's JWT. For the current MVP, do not deploy a custom ASP.NET Core API or any backend merely to proxy Auth/Storage calls.

**Consequences:**
- ✅ Removes the GitHub PAT security boundary and the custom Argon2id/JWT/rate-limit implementation that justified ADR-011.
- ✅ Lets the SPA list, download, and upload only authorized `Applai/SuperCV` objects through Storage RLS.
- ✅ Reduces deployment and operational surface to the SPA plus Supabase project configuration.
- ⚠️ Supabase's browser client defaults to localStorage; ADR-009 is amended to require a custom in-memory storage adapter (or an explicitly approved sessionStorage alternative).
- ⚠️ ADR-014 remains: the LOGOUT button clears local application state and does **not** call `supabase.auth.signOut()` in the button flow. This preserves the existing immediate/no-round-trip behavior but leaves a Supabase refresh session valid until expiry; a future explicit revocation flow may make a different decision.
- ❌ Requires careful Supabase project/RLS configuration and tests; the anon key is publishable but the service role key must never enter client code.

**Alternatives considered:**
- Retain ASP.NET Core 9 API as a GIST proxy: rejected — no GitHub PAT/GIST proxy exists after this migration, and Supabase RLS is the appropriate boundary for the current MVP.
- Use a Supabase service role key in the SPA: rejected — it bypasses RLS and is a privileged secret.
- Add a minimal serverless function now: deferred. A future serverless function is permitted **only** if a feature genuinely needs the Supabase service role key or another server-only secret; it must never expose that key to the browser.

> **UPDATED 2026-08-17 (Supabase migration):** OLD — ADR-011 selected an ASP.NET Core backend for custom auth and GIST proxying. NEW — Supabase Auth plus Storage RLS lets the SPA call `supabase-js` directly for the current MVP.

---

## ADR-016: S002S1 Settings Panel for Persisted User Preferences

**Status:** Accepted
**Date:** 2026-08-15 (amended 2026-08-17)
**Context:** Users repeatedly choose a SuperCV filename and preferred export name across sessions (S002D1, S002D2). The Supabase Storage location is fixed at `Applai/SuperCV`, so users must not configure a storage URL.

**Decision:** Keep S002S1 as a Settings Panel that persists `{ masterResumeFile?, preferredCvName? }` through an RLS-scoped Supabase user-settings mechanism and caches it in the Zustand `ui` slice. `masterResumeFile` can auto-select a matching file from the current `Applai/SuperCV` listing; `preferredCvName` pre-fills S002D1. Do not include a `gistUrl` or any other storage-URL field.

**Consequences:**
- ✅ S002D1 and S002D2 pre-fill meaningful filename preferences, reducing repetitive data entry.
- ✅ Fixed Storage path prevents a preference from bypassing the intended Storage/RLS scope.
- ✅ A Supabase table protected by RLS can keep settings synchronized across devices.
- ❌ Settings persistence needs a small RLS-scoped table or an explicitly temporary local-preference fallback.
- ❌ Requires dirty-check confirmation UX on Cancel/Escape/Overlay-click to avoid silent data loss.

**Alternatives considered:**
- Scattered defaults only: rejected — error-prone, poor UX, not per-user.
- User-configurable storage URLs: rejected — conflicts with the fixed `Applai/SuperCV` MVP Storage boundary.
- localStorage-only settings: rejected as the long-term solution — settings would not follow the user across devices/browsers.

> **UPDATED 2026-08-17 (Supabase migration):** OLD — settings persisted a GIST URL alongside filenames through `/api/user/settings`. NEW — the fixed Storage location removes `gistUrl`; only preferred master/export filenames remain under RLS-scoped persistence.

---

## ADR-015: S002D2 Import Dialogue for Explicit GIST Selection

**Status:** Superseded by ADR-017
**Date:** 2026-08-15
**Context:** VISION.md requires the user to be asked for the GIST URL rather than have the app silently auto-load a resume from an implicit source.

**Decision:** Introduce S002D2 as a required modal step (auto-opened on first S002 mount with no cached MasterResume, or manually via "Load from GIST") that collects GIST URL + filename, with a pre-fill cascade: session cache → user settings (ADR-016) → `VITE_DEFAULT_GIST_URL`.

**Consequences:**
- ✅ Matches VISION.md's explicit "user asked for the URL" requirement
- ✅ Auto-fetch of the GIST's file list on URL blur reduces manual filename entry
- ❌ Adds one extra confirmation step vs. silent auto-load (acceptable trade-off per VISION.md)

**Alternatives considered:**
- Auto-load without user confirmation: rejected — error-prone, violates VISION.md's explicit-URL requirement (§3, Journey C)

**Why it was superseded:** ADR-017 fixes the Storage location as `Applai/SuperCV`, eliminating the URL-entry requirement. S002D2 remains required, but now selects a listed SuperCV filename from the fixed folder.

> **UPDATED 2026-08-17 (Supabase migration):** OLD — S002D2 explicitly collected a GIST URL. NEW — S002D2 remains the explicit user-confirmed import step but is a Supabase Storage file picker with no URL field.

---

## ADR-014: Client-Side-Only LOGOUT (No Server Call)

**Status:** Accepted
**Date:** 2026-08-15
**Context:** With stateless JWT (15-min TTL, ADR-009) and no server-side session table, a server logout endpoint adds latency without a corresponding security benefit — the access token expires on its own, and the httpOnly refresh cookie can simply be discarded client-side.

**Decision:** `LOGOUT` clears the in-memory JWT from Zustand, calls `abortAllRequests()` (ADR-012), and hard-redirects to S000. It does **not** call `POST /api/auth/logout`. That endpoint remains defined in the API contract (TECH.md §6) for potential future use (e.g., refresh-token revocation lists) but must not be invoked from the LOGOUT button flow.

**Consequences:**
- ✅ Instant logout with no network round-trip or failure mode to handle
- ✅ Simpler UX — no spinner/error state needed for a destructive-but-safe action
- ❌ A stolen refresh-token cookie remains valid until its own TTL expires (7/30 days) since it is never explicitly revoked server-side
- ❌ **Implementation constraint:** `PATTERNS.md` P02/P09 must NOT wire the `LogoutButton` to a TanStack Query mutation that calls the `/api/auth/logout` endpoint — this was a contradiction found and fixed in the 2026-08-17 PATTERNS.md compliance pass.

**Alternatives considered:**
- Server-side logout (revoke refresh token server-side): rejected for MVP — adds latency and backend session-tracking complexity; JWT TTL is deemed sufficient for this scope

**Amendment (2026-08-17):** Under ADR-017, the local-only LOGOUT rule means the button must not call `supabase.auth.signOut()` either. It clears the in-memory adapter/Zustand state and redirects; the Supabase refresh session remains valid until provider-managed expiry. An explicit future revocation flow requires a new decision.

> **UPDATED 2026-08-17 (Supabase migration):** OLD — ADR-014 named a custom `/api/auth/logout` endpoint. NEW — the same no-round-trip button rule applies to `supabase.auth.signOut()`.

---

## ADR-013: EXIT / LOGOUT / CANCEL as Three Distinct Actions

**Status:** Accepted
**Date:** 2026-08-15
**Context:** A single ambiguous "Logout"-style button conflates three different user intents (quit the app, end the session, undo in-progress work), which violates BOUNDARIES.md §5's requirement that destructive actions be unambiguous.

**Decision:** Expose three separate, always-visible global actions on S002 (and EXIT also on S001):
- **EXIT** — hard-terminates the app (`window.close()` / `about:blank`), no cleanup, no pending-transaction wait.
- **LOGOUT** — clears the session only, returns to S000 (see ADR-014).
- **CANCEL** — soft action; aborts running transactions, or if none are running, resets all TVC01 node selections and discards text edits. Never navigates away from S002.

**Consequences:**
- ✅ Unambiguous semantics per BOUNDARIES.md §5 destructive-action clarity requirement
- ✅ Each action maps to one `AppState` transition family in SPEC.md §5's state machine
- ❌ Three confirmation dialogs to design/test instead of one

**Alternatives considered:**
- Single "Logout" button: rejected — ambiguous behavior, violates BOUNDARIES.md destructive-action clarity

---

## ADR-012: AbortController for All Requests (Not Axios Cancel Tokens)

**Status:** Accepted
**Date:** 2026-08-15
**Context:** EXIT, LOGOUT, and CANCEL (ADR-013) must be able to instantly cancel in-flight requests without waiting for them to resolve.

**Decision:** `lib/api.ts` maintains a module-level `Set<AbortController>`. Every `apiClient()` call registers a controller via `createRequestSignal()`; `abortAllRequests()` aborts and clears the set. EXIT, LOGOUT, and CANCEL all call `abortAllRequests()` before executing their primary action.

**Consequences:**
- ✅ Native browser API, zero additional dependencies
- ✅ Works uniformly across all three destructive actions
- ❌ Callers must remember to pass the signal through to `fetch()` — a missed call silently fails to cancel

**Alternatives considered:**
- Axios cancel tokens: rejected — Axios itself is a forbidden dependency (BOUNDARIES.md §1); would require adding a forbidden library just for cancellation

---

## ADR-011: ASP.NET Core 9 Minimal API as Custom Backend

**Status:** Superseded by ADR-017 — **Supersedes ADR-007 (historical)**
**Date:** 2026-08-15
**Context:** The GitHub Personal Access Token (PAT) needed to read/write Gists must never be exposed to the client per BOUNDARIES.md §4 ("NO secrets in client code — API keys, tokens — everything server-side"). Authentication also requires server-side Argon2id password hashing, JWT issuance, rate limiting, and CAPTCHA verification — none of which can live in the SPA. This makes "no backend at all" (the original ADR-007 premise) untenable once BOUNDARIES.md's security rules and SPEC.md's auth requirements (§1, §7) are taken into account.

**Decision:** Build a thin ASP.NET Core 9 Minimal API backend exposing exactly the endpoints in TECH.md §6 (`/api/health`, `/api/auth/*`, `/api/gist/*`, `/api/user/settings`), acting as a security boundary and Gist proxy (Gist Reader/Writer) holding the GitHub PAT server-side. It performs no other business logic beyond what SPEC.md defines.

**Consequences:**
- ✅ GitHub PAT and Argon2id hashing stay server-side, satisfying BOUNDARIES.md §4
- ✅ Centralizes rate limiting, CAPTCHA verification, and CSRF handling in one place
- ✅ .NET is a stack the team already has expertise in (per user background)
- ❌ Introduces a second runtime/deployment target beyond the Vite SPA (see TECH.md §11 Deployment — the backend's own deployment target is not yet specified and should be added to TECH.md)
- ❌ Adds operational surface (a server to run, monitor, and secure) that a BaaS (Supabase/Firebase) would have avoided

**Alternatives considered:**
- No backend at all (original ADR-007 premise): rejected — cannot hold the GitHub PAT securely, cannot hash passwords server-side, violates BOUNDARIES.md §4
- Supabase/Firebase: rejected — GIST proxying and custom Argon2id/JWT flows don't map cleanly onto a BaaS; would still need a serverless function layer, at which point a Minimal API is simpler and keeps a single deployable
- Serverless functions (e.g., Vercel Functions) fronting the same logic: viable alternative, not chosen because ASP.NET Core 9 was preferred for team familiarity and Gist-proxy logic complexity (per user technology background: strong C#/.NET expertise)

**Why it was superseded:** Supabase Auth now provides the credential hashing, JWT issuance/rotation, auth rate limiting, and optional CAPTCHA controls that this ADR proposed to build. Supabase Storage RLS authorizes client-side access to the fixed `Applai/SuperCV` path, so the GitHub PAT secret-handling constraint no longer exists. ADR-017 is the accepted replacement; this historical ADR remains here because old ADRs are never deleted.

> **UPDATED 2026-08-17 (Supabase migration):** OLD — ADR-011 required a backend to protect a GitHub PAT and implement custom Argon2id/JWT flows. NEW — it is superseded by ADR-017 because Supabase Auth and Storage RLS provide the required boundary without a current-MVP backend.

---

## ADR-010: hCaptcha over reCAPTCHA

**Status:** Accepted
**Date:** 2026-08-14
**Context:** SPEC.md §1 requires CAPTCHA after 3 failed login attempts to slow credential-stuffing attacks.

**Decision:** Use hCaptcha v2 invisible, triggered only after the 3rd failed login attempt (SPEC.md §3.2.3, §1).

**Consequences:**
- ✅ GDPR-friendlier / lighter tracking footprint than reCAPTCHA (relevant given the app's EU-based target audience)
- ✅ "Invisible" variant avoids a UX interruption for legitimate users on their first 1–2 attempts
- ❌ Requires `VITE_HCAPTCHA_SITEKEY` env var and a corresponding `frame-src https://newassets.hcaptcha.com` CSP allowance (TECH.md §13)

**Alternatives considered:**
- reCAPTCHA: rejected — heavier tracking footprint, less GDPR-friendly

> **UPDATED 2026-08-17 (Supabase migration):** OLD — hCaptcha was verified by the custom backend after its own attempt counter. NEW — CAPTCHA is optional Supabase Auth project configuration; when enabled, the client passes `captchaToken` to `signInWithPassword` and Supabase enforces it.

---

## ADR-009: Memory-Only JWT + httpOnly Refresh Cookie

**Status:** Accepted
**Date:** 2026-08-14
**Context:** Access tokens must be protected from XSS-based theft while still surviving a page refresh long enough for a good UX.

**Decision:** Access token (15-min TTL) lives only in memory (Zustand, never persisted). Refresh token (7-day default / 30-day if "Remember me") is an httpOnly, Secure, SameSite=Strict cookie, refreshed automatically ~5 minutes before expiry (TECH.md §7).

**Consequences:**
- ✅ Access token is inaccessible to any injected script (not in `localStorage`/`sessionStorage`)
- ✅ Refresh cookie is inaccessible to JS entirely (`httpOnly`)
- ❌ Losing the in-memory token on a hard page reload requires the `/api/auth/validate` round-trip on every S000 mount (acceptable — already part of the S000 flow per SPEC.md §3.1.3)
- ❌ Requires CSRF protection (double-submit cookie pattern, SPEC.md §1) since a cookie is used for the refresh flow

**Alternatives considered:**
- `localStorage`/`sessionStorage` for JWT: rejected — vulnerable to XSS theft, violates SPEC.md §7 security checklist item "JWT stored in memory only"

**Amendment (2026-08-17):** Supabase's browser client persists access and refresh tokens in `localStorage` by default, which conflicts with this ADR's intent. Create the client with a custom memory-only `Storage`-shaped adapter: `createClient(url, key, { auth: { persistSession: true, storage: <custom in-memory adapter> } })`. Keep the status Accepted; ADR-017 changes the provider, not the XSS-resistance goal.

**Amendment 2 (2026-08-17):** Use the S001 "Remember me" checkbox (SPEC.md §3.2.2) to choose between the two available adapters at login time: `sessionStorage` when checked (persists the session until the browser tab/window closes), the memory-only adapter when unchecked (cleared on any page reload). This corrects an earlier SPEC.md draft that claimed "Remember me" extends Supabase's refresh-token TTL to 30 days — that TTL is a project-wide GoTrue setting, not a per-login parameter, so "Remember me" controls client-side session persistence only, never server-side token lifetime.

> **UPDATED 2026-08-17 (Supabase migration):** OLD — this ADR assumed an app-issued access JWT plus httpOnly refresh cookie. NEW — Supabase session tokens require an explicit custom browser storage adapter to preserve the memory-only intent.

---

## ADR-008: Custom TreeView (TVC01) over react-arborist

**Status:** Accepted
**Date:** 2026-08-14
**Context:** TVC01 must support checkbox selection, collapse/expand, inline text editing, and virtualization for large SuperCV trees (BOUNDARIES.md §3 performance limits; TECH.md §9 "TVC01 must virtualize lists > 100 nodes").

**Decision:** Build TVC01 as a custom feature component in `features/resume/components/TreeView.tsx`, using `@tanstack/react-virtual` (already an approved dependency, TECH.md §1) for virtualization and shadcn/ui `Checkbox` for selection. No external tree-view library is introduced.

**Consequences:**
- ✅ Zero new dependency approval needed (BOUNDARIES.md §1 already lists `@tanstack/react-virtual`)
- ✅ Full control over the exact selection/collapse/edit semantics in SPEC.md §3.3.3, which a generic library would not natively support (e.g., "hide deselected nodes unless Display All is on")
- ❌ More implementation and test surface than dropping in a library (mitigated by PATTERNS.md P05)

**Alternatives considered:**
- react-arborist: rejected — extra dependency requiring BOUNDARIES.md approval; `@tanstack/react-virtual` already covers the virtualization need without it

---

## ADR-007: No Custom Backend in MVP

**Status:** Superseded by ADR-011
**Date:** 2026-08-14
**Context (historical):** Early MVP scoping (VISION.md's "just load/edit/save a GIST file") suggested the app might not need a dedicated backend at all — a BaaS or purely client-side GitHub API call was considered sufficient for the core loop of loading and writing a Gist.

**Decision (historical, no longer in effect):** Avoid a custom backend; call the GitHub Gist REST API directly from the SPA, or use a BaaS (Supabase/Firebase) for auth if needed.

**Why it was superseded:** Once SPEC.md's full authentication requirements (Argon2id, JWT, rate limiting, CAPTCHA) and BOUNDARIES.md §4 ("NO secrets in client code") were finalized, keeping the GitHub PAT and password hashing out of the client became a hard constraint that a client-only or BaaS-only architecture could not satisfy cleanly. See ADR-011 for the accepted replacement decision.

**Consequences (historical):**
- ✅ Would have been faster to ship for the narrowest possible MVP
- ❌ Cannot hold the GitHub PAT securely client-side — violates BOUNDARIES.md §4
- ❌ Cannot hash passwords server-side without *some* server component

**Alternatives considered (historical):** Supabase, Firebase, a mock API — none resolved the PAT/secret-handling problem without effectively becoming "a backend" anyway.

---

## ADR-006: Zod for Runtime Validation

**Status:** Accepted
**Date:** 2026-08-14
**Context:** We need to validate API responses and form inputs with TypeScript integration.

**Decision:** Use Zod as the single validation library.

**Consequences:**
- ✅ Single source of truth for types and validation
- ✅ Excellent error messages
- ✅ Composable schemas
- ✅ Works with React Hook Form via resolver
- ❌ Slight runtime overhead (negligible for our use case)

**Alternatives considered:**
- Yup: Good, but less TypeScript-native
- Joi: Node-focused, heavier bundle
- io-ts: More functional, steeper learning curve
- Manual TypeScript interfaces: No runtime validation

---

## ADR-005: Feature-Based Folder Structure

**Status:** Accepted
**Date:** 2026-08-14
**Context:** We need a scalable folder structure as the app grows.

**Decision:** Use feature-based co-location (not type-based), matching TECH.md §2's two features: `auth` and `resume`.

**Structure:**
```
features/
  auth/
    api/          # login, validate, logout (defined but not called for LOGOUT — see ADR-014)
    components/   # S000, S001, SMSG
    hooks/        # useAuth, useSessionCheck
    stores/       # Auth Zustand slice
    types/
    utils/
  resume/
    api/          # Supabase Storage (Applai/SuperCV) API calls, User Settings API calls  <!-- UPDATED 2026-08-17 (Supabase migration): OLD "GIST API calls" -->
    components/   # S002, TVC01, S002D1, S002D2, S002S1
    hooks/        # useSuperCVFiles/useLoadSuperCV/useExportSuperCV, useTreeView, useSettings  <!-- UPDATED 2026-08-17 (Supabase migration): OLD "useGist" -->
    stores/       # Resume Zustand slice
    types/        # MasterCVNode, UserSettings
    utils/        # Tree helpers, export helpers
```

**Consequences:**
- ✅ Related code lives together — easy to find and modify
- ✅ Features can be understood in isolation
- ✅ Easy to identify and delete dead code
- ✅ Prevents circular dependencies between features
- ❌ Shared code location requires discipline

**Rules:**
- A feature may import from `components/ui/`, `hooks/`, `lib/`, `types/`
- A feature may NOT import from another feature (use shared abstractions)
- When two features share logic, extract to `lib/` or create a new shared feature

---

## ADR-004: Tailwind CSS over CSS Modules / Styled Components

**Status:** Accepted
**Date:** 2026-08-14
**Context:** We need a maintainable styling solution that scales.

**Decision:** Use Tailwind CSS v4 with shadcn/ui components.

**Consequences:**
- ✅ Rapid UI development without context-switching to CSS files
- ✅ Consistent design system via configuration (matches SPEC.md §2's color tokens/typography scale directly)
- ✅ Tiny production bundle (purged unused styles)
- ✅ shadcn/ui provides accessible, customizable primitives
- ❌ HTML can become verbose (mitigated by component extraction)
- ❌ Learning curve for utility-first approach

**Alternatives considered:**
- CSS Modules: Good isolation, but slower development velocity
- Styled Components: Runtime overhead, no built-in design system; also forbidden by BOUNDARIES.md §1
- MUI/Chakra: Opinionated, harder to customize deeply; also forbidden by BOUNDARIES.md §1

---

## ADR-003: TanStack Query for Server State

**Status:** Accepted
**Date:** 2026-08-14
**Context:** We need to fetch, cache, and update server data.

**Decision:** Use TanStack Query (React Query) as the single source of truth for all server state.

**Consequences:**
- ✅ Automatic caching and background refetching
- ✅ Eliminates useEffect data fetching anti-pattern (BOUNDARIES.md §2 explicitly forbids `useEffect` for data fetching)
- ✅ Built-in loading/error states
- ✅ Optimistic updates support
- ❌ Additional library to learn
- ❌ Query key management discipline required

**Alternatives considered:**
- SWR: Similar, but TanStack Query has better TypeScript and devtools
- Apollo Client: Only if using GraphQL (we use REST, TECH.md §6)
- Manual fetch + useState: Too error-prone at scale

---

## ADR-002: Zustand over Redux / Context

**Status:** Accepted
**Date:** 2026-08-14
**Context:** We need client-side state management for UI state, auth, and resume/tree state (three slices per TECH.md §8: `auth`, `ui`, `resume`).

**Decision:** Use Zustand for all client state.

**Consequences:**
- ✅ Minimal boilerplate compared to Redux
- ✅ No providers needed (unlike Context)
- ✅ Excellent TypeScript support
- ✅ Small bundle size (~1KB)
- ❌ Less devtools ecosystem than Redux
- ❌ Community patterns less standardized

**Alternatives considered:**
- Redux Toolkit: Too much boilerplate for our scope
- Jotai: Good, but Zustand has better documentation and simpler mental model
- React Context: Performance issues with frequent updates (would be a problem for high-frequency TVC01 selection toggles)

---

## ADR-001: React SPA over Next.js

**Status:** Accepted
**Date:** 2026-08-14
**Context:** We need a modern frontend framework for the Applai Resume Generator — an authenticated, single-workspace tool (S000 → S001 → S002) with no public/marketing pages and no SEO requirement (VISION.md §5 Non-Goals).

**Decision:** Use React 19 as a Single Page Application (SPA) with Vite, not Next.js.

**Consequences:**
- ✅ Faster build times and simpler configuration
- ✅ No vendor lock-in to Vercel deployment
- ✅ Full control over routing and bundling
- ❌ No built-in SSR/SSG (not needed — the app is fully behind auth per SPEC.md §1)
- ❌ Manual SEO handling (acceptable for an authenticated app with no public content)

**Alternatives considered:**
- Next.js App Router: Overkill for an authenticated single-workspace app; SSR not needed
- Remix: Excellent, but steeper learning curve; not necessary for this scope
- Blazor WASM (AOT): Rejected — slower compile times and less direct DOM control than Vite+React, despite the team's strong C#/.NET background (per TECH.md §14 Decision Log)

---

*Add new ADRs at the top. Never delete old ADRs — mark as `Superseded` if replaced.*

*Last updated: 2026-08-17*
