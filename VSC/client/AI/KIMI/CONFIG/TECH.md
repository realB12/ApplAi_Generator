# TECH.md :: TechStack Applai_Generator for KIMI.com vibecoding

> **Supabase migration pass (2026-08-17):** This revision replaces the GIST-backed MasterResume load/save flow with Supabase Auth (user login) and Supabase Storage (bucket "Applai", folder "SuperCV") for master/generated CV files. See inline "UPDATED 2026-08-17 (Supabase migration)" callouts for each specific change.

* -> this document is based on [TECH template](../../../../../../../../../WORK/ENTITY/AI/PROVIDER/K/Kimi/CONFIG/TEMPLATES/TECH_template.md)

## Architectural Overview
```
┌─────────────────┐        supabase-js        ┌─────────────────────────────┐
│   Vite + TS     │ ◄────────────────────────► │ Supabase                    │
│   (SPA)         │                            │ • Auth (email + password)   │
│                 │                            │ • Storage bucket: Applai    │
│ • Tree View     │                            │   folder: SuperCV           │
│ • Node Edit     │                            │ • JWT-scoped Storage RLS    │
│ • Selection     │                            └─────────────────────────────┘
└─────────────────┘
```

> **UPDATED 2026-08-17 (Supabase migration):** OLD — the SPA called an ASP.NET Core 9 Minimal API that held a GitHub PAT and proxied Gist operations. NEW — the SPA calls Supabase Auth and Storage directly through `@supabase/supabase-js`; no backend is required for the current RLS-scoped MVP (ADR-017).

## 1. TECH Stack

| Layer | Technology | Version | Rationale |
| ----- | ---------- | ------- | --------- |
| Framework | React | 19.x | Concurrent features, Server Components opt-in |
| Language | TypeScript | 5.7.x | Strict type safety |
| Build Tool | Vite | 6.x | Fast HMR, modern esbuild |
| Styling | Tailwind CSS | 4.x | Utility-first, minimal CSS bundle |
| UI Components | shadcn/ui | latest | Accessible, customizable primitives |
| State (Server) | TanStack Query | 5.x | Caching, background updates, deduping |
| State (Client) | Zustand | 5.x | Lightweight, no boilerplate |
| Routing | React Router | 7.x | Declarative, data APIs |
| Forms | React Hook Form | 7.x | Performance, minimal re-renders |
| Validation | Zod | 3.x | TypeScript-first schema validation |
| Tree Virtualization | @tanstack/react-virtual | 3.x | Virtualized lists for large trees (TVC01) |
| Testing (Unit) | Vitest | 2.x | Fast, Vite-native |
| Testing (Component) | React Testing Library | 16.x | User-centric testing |
| Testing (E2E) | Playwright | 1.49+ | Cross-browser, reliable |
| Icons | Lucide React | latest | Consistent, tree-shakeable |
| Date Handling | date-fns | 4.x | Modular, immutable |
| HTTP Client | Fetch API | native | No extra dependency |
| Supabase Client | @supabase/supabase-js | latest | Auth + Storage client SDK — replaces custom auth/Gist backend, see ADR-017 |
| CAPTCHA | hCaptcha / Turnstile | optional | Supabase Auth project-level CAPTCHA integration; pass `captchaToken` when enabled |

> **Note:** TVC01 (TreeView Component) is a **custom feature component** built with `@tanstack/react-virtual` for performance and shadcn/ui primitives for UI. No external TreeView library is used.

## 2. Project Structure

The following project structure is already given / mandatory on `https://github.com/realB12/ApplAi_Generator/tree/main`. You can add more folders and files but never delete/change the mentioned below!

```plaintext
https://github.com/realB12/ApplAi_Generator/tree/main
├─ DEV_GUIDES
├─ DEV_LOGs
├─ VSC                                 # whatever is visible within the VSC project
|   ├─ client                          # for the Applai_Generator's Client/FrontEnd
|   |   ├─ AI/KIMI/                    # Whatever was needed to vibecode with KIMI.com
|   |   │   ├─ CONFIG/                 # VISION, SPEC, TECH, PATTERNS, DECISIONS, SESSION,
|   |   |   ├─ PROMPTs/                # Prompt history/archive
|   |   |   └─ _Kimi.com.md/           # Notes how Komi.com was used along the process
|   |   ├─ DOCS/                       # Developer Manuals, Dev-Specs, Configuration hints
|   |   ├─ PRODUCT/                    # contains the compiled binaries for deployment
|   |   ├─ SCRIPTs/                    # all Scripts for build, debug and deploy
|   |   ├─ src/                        # The sourcecode that finally makes the product
|   |   |   ├─ app/                    # App-level setup
|   |   |   |   ├── providers.tsx      # Context providers composition
|   |   |   |   ├── router.tsx         # Route definitions
|   |   |   |   └── store.ts           # Zustand store configuration
|   |   |   ├─ components/
|   |   |   |   ├── ui/                # shadcn/ui components (auto-generated)
|   |   |   |   └── common/            # Shared components (ScreenBadge, MessagePopup, etc.)
|   |   |   ├── features/              # Feature-based modules
|   |   |   |   ├── auth/              # AUTH Feature — S000, S001, SMSG
|   |   |   |   |   ├── api/           # API calls (login, validate, logout)
|   |   |   |   |   ├── components/    # S000, S001, SMSG components
|   |   |   |   |   ├── hooks/         # useAuth, useSessionCheck
|   |   |   |   |   ├── stores/        # Auth Zustand slice
|   |   |   |   |   ├── types/         # Auth types
|   |   |   |   |   └── utils/         # Auth utilities
|   |   |   |   └── resume/            # RESUME Feature — S002, TVC01, S002D1, S002D2, S002S1
|   |   |   |       ├── api/           # Supabase Storage (Applai/SuperCV) API calls, User Settings API calls  <!-- UPDATED 2026-08-17 (Supabase migration): OLD "GIST API calls" -->
|   |   |   |       ├── components/    # S002, TVC01, S002D1, S002D2, S002S1 components
|   |   |   |       ├── hooks/         # useSuperCVFiles/useLoadSuperCV/useExportSuperCV, useTreeView, useSettings  <!-- UPDATED 2026-08-17 (Supabase migration): OLD "useGist" -->
|   |   |   |       ├── stores/        # Resume Zustand slice
|   |   |   |       ├── types/         # MasterCV JSON types, UserSettings types
|   |   |   |       └── utils/         # Tree helpers, export helpers
|   |   |   ├── hooks/                 # Global shared hooks
|   |   |   ├── lib/                   # Utilities, helpers
|   |   |   │   ├── api.ts             # API client setup (Fetch + interceptors + AbortController)
|   |   |   │   ├── utils.ts           # General utilities (cn, etc.)
|   |   |   │   └── constants.ts       # App constants
|   |   |   ├── types/                 # Global TypeScript types
|   |   |   ├── routes/                # Route components (pages)
|   |   |   └── styles/                # Global styles, Tailwind imports
|   |   ├─ TESTS/                      # Testing stuff - not part of the product
|   |   └─ xCODE/                      # Folder/File documentation
|   └─ server                          # for the Applai_Generator's Backend/Server
├─ .gitignore                          # exclude /PRODUCT
├─ LICENCE
└─ README.md
```

The only folders AI is allowed to touch are the following:

1. **/src**: All vibecoded **SourceCode** goes into `https://github.com/realB12/ApplAi_Generator/tree/main/VSC/client/src`

2. **/AI/KIMI/CONFIG**: **All AI Context** is found and must be loaded from `https://github.com/realB12/ApplAi_Generator/tree/main/VSC/client/AI/KIMI/CONFIG`

All other folders must not be touched by AI agents or other forms of generative processings!

## 3. Feature-to-Screen Mapping

| Screen | Feature Module | Route | Component File |
|--------|---------------|-------|----------------|
| S000 — Welcome Screen | `features/auth/` | `/` | `features/auth/components/WelcomeScreen.tsx` |
| S001 — Login Popup | `features/auth/` | `/` (modal over S000) | `features/auth/components/LoginPopup.tsx` |
| S002 — Main Screen | `features/resume/` | `/app` | `features/resume/components/MainScreen.tsx` |
| TVC01 — TreeView | `features/resume/` | `/app` | `features/resume/components/TreeView.tsx` |
| S002D1 — Export Dialogue | `features/resume/` | `/app` | `features/resume/components/ExportDialog.tsx` |
| S002D2 — Import Dialogue | `features/resume/` | `/app` | `features/resume/components/ImportDialog.tsx` |
| S002S1 — Settings Panel | `features/resume/` | `/app` | `features/resume/components/SettingsPanel.tsx` |
| SMSG — Message PopUp | `features/auth/` | any | `features/auth/components/MessagePopup.tsx` |

> **Note:** All S002 dialogs (S002D1, S002D2, S002S1) are rendered as inline modals/overlays within the `/app` route. No separate routes are defined for them. They are controlled by Zustand `ui` state flags (e.g., `isExportOpen`, `isImportOpen`, `isSettingsOpen`).

## 4. Route Definitions

```typescript
// app/router.tsx
const routes = [
  { path: '/', element: <WelcomeScreen />, children: [
    { path: 'login', element: <LoginPopup /> } // S001 rendered as modal/overlay
  ]},
  { path: '/app', element: <ProtectedRoute><MainScreen /></ProtectedRoute> },
  { path: '*', element: <Navigate to="/" replace /> }
];
```

> **Note:** S002D1, S002D2, S002S1 are NOT separate routes. They are conditional renders inside `MainScreen.tsx` controlled by local state or Zustand `ui` flags.

## 5. Data Model

### Core Entities

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface UserSettings {
  masterResumeFile?: string;
  preferredCvName?: string;
}

interface MasterCVNode {
  id: string;
  label: string;
  selected: boolean;
  expanded: boolean;
  info?: string;
  children?: MasterCVNode[];
}

interface SupabaseStorageFile {
  name: string;
  path: string;
  size?: number;
  updated_at?: string;
}
```

> **Note:** `SupabaseStorageFile` maps the metadata returned by `supabase.storage.from('Applai').list('SuperCV')`. Download a selected object, call `.text()`, then `JSON.parse` and validate it into `MasterCVNode[]`.

> **UPDATED 2026-08-17 (Supabase migration):** OLD — `GistFile` represented a backend-proxied GIST listing. NEW — `SupabaseStorageFile` represents fixed-folder Supabase Storage metadata.

## 6. API Contract

### Supabase Auth Calls (No Custom REST Endpoints)

| SDK call | Input | Result / use | Authentication |
| -------- | ----- | ------------ | -------------- |
| `supabase.auth.signInWithPassword()` | `{ email, password, options?: { captchaToken } }` | `{ data: { user, session }, error }`; map `AuthApiError.status`/`message` to S001 feedback | No existing session required |
| `supabase.auth.getSession()` | — | restores current in-memory session when available | Client session |
| `supabase.auth.onAuthStateChange()` | listener | keeps Zustand auth state synchronized with Supabase events | Client session |
| `supabase.auth.getUser()` | — | authenticated Supabase user | Client session |
| `supabase.auth.signOut()` | — | available for an explicit future revocation flow, but not invoked by LOGOUT per ADR-014 | Client session |

### Supabase Storage Calls (No Custom REST Endpoints)

| SDK call | Input | Result / use | Authentication |
| -------- | ----- | ------------ | -------------- |
| `supabase.storage.from('Applai').list('SuperCV')` | optional list options | `SupabaseStorageFile[]`; list master/exported files and derive collision checks | Supabase Auth JWT + Storage RLS |
| `supabase.storage.from('Applai').download('SuperCV/<filename>')` | object path | `Blob`; call `.text()` then `JSON.parse` to load MasterCV data | Supabase Auth JWT + Storage RLS |
| `supabase.storage.from('Applai').upload('SuperCV/<filename>', blob, { upsert: false })` | object path and JSON Blob | creates generated CV object; client lists names first for auto-suffixing | Supabase Auth JWT + Storage RLS |

> **UPDATED 2026-08-17 (Supabase migration):** OLD — `/api/auth/*` and `/api/gist/*` REST endpoints were served by a custom backend. NEW — the SPA uses Supabase Auth and direct Storage SDK calls; no separate collision-check endpoint exists.

### User Settings Persistence

| Operation | Data | Authorization |
| --------- | ---- | ------------- |
| Read settings | `UserSettings` (`masterResumeFile`, `preferredCvName`) | Recommended Supabase table with RLS, or client-local preferences until table migration is implemented |
| Update settings | partial `UserSettings` | Same RLS-scoped persistence mechanism |

> **UPDATED 2026-08-17 (Supabase migration):** OLD — settings included `gistUrl` and used `/api/user/settings`. NEW — there is no URL setting; settings retain only preferred filenames and should be persisted without the removed custom backend.

### Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "User-friendly message",
    "details": [{ "field": "email", "message": "Invalid email format" }]
  }
}
```

## 7. Authentication & Authorization

| Concern | Implementation |
| ------- | -------------- |
| Token Storage | Supabase access + refresh tokens are managed by `supabase-js`. To preserve ADR-009 intent, configure a custom in-memory `Storage` adapter (or explicitly approved `sessionStorage`) rather than accepting default `localStorage`; use `createClient(url, key, { auth: { persistSession: true, storage: memoryStorage } })`. |
| Token TTL / Refresh | Delegated to Supabase Auth (access + refresh issuance and rotation). App observes `getSession()` and `onAuthStateChange()` rather than implementing a Fetch refresh interceptor. |
| Password Hashing | Delegated to Supabase Auth. The app never receives, stores, or hashes passwords beyond passing credentials to `signInWithPassword`; client format guidance remains a UX validation only. |
| Rate Limiting / CAPTCHA | Delegated to Supabase Auth auth-endpoint controls. If project CAPTCHA is enabled, obtain hCaptcha/Turnstile token and pass it as `captchaToken`; UI can retain 3-failure CAPTCHA and 5-failure/15-min messages when project settings match. |
| Route Guards | `ProtectedRoute` wrapper — redirect to `/` (S000) if the Supabase session is absent. |
| Role-based UI | `usePermission()` hook — hide elements, not just disable. (Minimal implementation: claims/role mapping from Supabase user metadata.) |
| Auth Errors | Map `AuthApiError` status/message. Invalid credentials → clear password/focus input; rate-limited → show the existing 15-minute user-facing message when configured. |
| Storage Authorization | Storage bucket `Applai`, prefix `SuperCV`, is protected by RLS policies scoped to the authenticated user's JWT (or specifically approved shared access). |
| **EXIT** | Client-side only. Show confirmation SMSG → `window.close()` or `about:blank`. **No server call. No cleanup. No pending transactions waited for.** Abort tracked requests best-effort. |
| **LOGOUT** | Client-side only. Show confirmation SMSG → clear Zustand auth/session adapter → abort requests → hard redirect to S000. **Do not call `supabase.auth.signOut()` in the LOGOUT button flow** per ADR-014; ADR-017 records this deliberate tension. |
| **CANCEL** | Abort tracked signals → stop spinners. Supabase SDK calls may not accept external `AbortSignal`; treat cancellation as best-effort/race the UI result. If no transaction runs: reset TVC01 nodes and revert edits. |

> **UPDATED 2026-08-17 (Supabase migration):** OLD — a custom server hashed passwords with Argon2id, issued JWTs, used an httpOnly refresh cookie, and enforced rate limits/CAPTCHA. NEW — Supabase Auth owns those server-side controls, while a custom session adapter avoids default localStorage token persistence.

## 8. State Management Strategy

### Server State
* **Tool:** TanStack Query
* **Caching strategy:** Stale-while-revalidate, 5min cache time
* **Background refetch:** On window focus, on network reconnect
* **Optimistic updates:** Only for low-risk actions (toggle selection)
* **Pagination:** Cursor-based preferred, offset as fallback
* **Rule:** Server state never goes into Zustand. Use TanStack Query for all API data.

### Client State (Zustand)

**Global store slices:**
* `auth`: `{ user, accessToken, isAuthenticated, isLoading, setAuth(), clearAuth(), setLoading() }`
* `ui`: `{ theme, sidebarOpen, activeModal, toastQueue, settings: UserSettings | null, isExportOpen, isImportOpen, isSettingsOpen }`
* `resume`: `{ masterCV: MasterCVNode[] | null, displayAll: boolean }`

> **Note:** `selectedNodes` is NOT a separate Set. Selection state is a property of each `MasterCVNode` (`selected: boolean`). Derive selected subsets by traversing `masterCV` tree. Cache derived selections in `localStorage` (key: `applai_selection_{userId}`) for session persistence.

### Form State
* **Tool:** React Hook Form + Zod
* All forms validated via Zod schemas before submission.
* Error messages displayed inline per field + SMSG for server errors.

### Request Cancellation (AbortController)

All `fetch` calls in `lib/api.ts` must accept an optional `signal?: AbortSignal` parameter and pass it to `fetch()`. The API client exposes:

```typescript
// lib/api.ts
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
```

**Usage:** EXIT, LOGOUT, and CANCEL buttons call `abortAllRequests()` before executing their primary action.

## 9. Performance Budget

| Metric | Target | Maximum |
| ------ | ------ | ------- |
| First Contentful Paint (FCP) | < 1.0s | < 1.5s |
| Largest Contentful Paint (LCP) | < 2.0s | < 2.5s |
| Time to Interactive (TTI) | < 3.0s | < 4.0s |
| Total Bundle Size (initial) | < 500 KB | < 800 KB |
| Lighthouse Performance | > 90 | > 80 |

### Enforcement:
* Dynamic imports for routes (React.lazy)
* Dynamic imports for heavy components (TVC01 with >100 nodes uses `@tanstack/react-virtual`)
* Image optimization via CDN or vite-plugin-image-optimizer

### Per-Screen Performance Notes:
* **S000:** Must render < 1.0s FCP. Health check fires immediately; no blocking resources.
* **S001:** Modal rendered over S000; no separate route load.
* **S002:** TVC01 must virtualize lists > 100 nodes. Tree collapse/expand must be O(1) per node.

## 10. Testing Strategy

| Type | Tool | Coverage Target | What to test |
| ---- | ---- | --------------- | ------------ |
| Unit | Vitest | 70% | Pure functions, utilities, store logic, Zod schemas |
| Component | RTL + Vitest | Critical paths | S001 form validation, SMSG rendering, TVC01 node toggling |
| Integration | RTL + Vitest | Key flows | Auth flow (S000 → S001 → S002), Supabase Storage load → export |
| E2E | Playwright | Happy paths + critical errors | Full user journeys: login → load SuperCV → select nodes → Storage export |

### Testing Rules:
* Test behavior, not implementation
* Mock API calls at msw (Mock Service Worker) level
* Never test third-party libraries
* Each feature module contains its own `__tests__` directory

### Test Mapping to SPEC Screens:

| Screen / Component | Test Type | Critical Path |
|--------------------|-----------|---------------|
| S000 | E2E | Health check → spinner → S001 mount |
| S001 | Component + E2E | Form validation, CAPTCHA trigger, login success/failure, EXIT confirmation |
| S002 | E2E | Session validation, TVC01 render, EXIT/LOGOUT/CANCEL confirmations |
| TVC01 | Component + Unit | Node selection, collapse/expand, displayAll toggle, text editing |
| S002D1 | Component | Filename validation, collision handling, cancel behavior, settings pre-fill |
| S002D2 | Component + E2E | Storage file-list loading, filename selection, import success/failure, cancel behavior |
| S002S1 | Component | Settings validation, dirty-check confirmation, save/cancel flows, preferred-filename pre-fill |
| SMSG | Component | All 4 message types render correctly, auto-dismiss, focus trap, persistent confirmations |
| EXIT button | E2E | Confirmation dialog, app termination, no cleanup, abort in-flight requests |
| LOGOUT button | E2E | Confirmation dialog, JWT clear, redirect to S000, no server call |
| CANCEL button | Component + E2E | Transaction abort (stop spinner), node reset to selected, modification discard |

## 11. Deployment

| Environment | Platform | URL | Auto-deploy |
| ----------- | -------- | --- | ----------- |
| Preview | Vercel | `[branch]-project.vercel.app` | Every PR |
| Staging | Vercel | `staging.project.com` | `develop` branch |
| Production | Vercel | `project.com` | `main` branch (manual approval) |

> **UPDATED 2026-08-17 (Supabase migration):** OLD — deployment implicitly required a second ASP.NET Core backend target. NEW — current MVP deployment is the Vite SPA plus Supabase project configuration; add a serverless deployment only for a future service-role-only feature.

## 12. Environment Variables

| Variable | Required | Description | Example |
| -------- | -------- | ----------- | ------- |
| `VITE_APP_NAME` | No | Display name | `"Applai Resume Generator"` |
| `VITE_SUPABASE_URL` | Yes | Supabase project URL | `https://<your-project>.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Yes | Publishable Supabase anon key; safe in client when RLS is configured | `<anon-key>` |
| `VITE_HCAPTCHA_SITEKEY` | Optional | hCaptcha site key only when Supabase CAPTCHA integration uses hCaptcha | `10000000-ffff-ffff-ffff-000000000001` |
| `VITE_SENTRY_DSN` | No | Error tracking (optional) | `https://...@sentry.io/...` |

**Rule**: Never commit `.env.local`. Use `.env.example` as template. The Supabase **service role** key must never be a `VITE_` variable or otherwise shipped to the client.

> **UPDATED 2026-08-17 (Supabase migration):** OLD — `VITE_API_URL` and `VITE_DEFAULT_GIST_URL` configured a custom backend and user-configurable GIST. NEW — required `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` configure direct Auth/Storage access to fixed `Applai/SuperCV`.

> **Note:** `VITE_SENTRY_DSN` is optional. If used, add `@sentry/react` to dependencies per BOUNDARIES.md approval process.

## 13. Security Configuration

### CSP Headers (Production)
```
default-src 'self';
script-src 'self';
style-src 'self';
connect-src 'self' https://*.supabase.co https://api.hcaptcha.com https://hcaptcha.com;
img-src 'self' data: https://*.supabase.co;
font-src 'self';
frame-src https://newassets.hcaptcha.com;
```

> **Note:** Tailwind CSS compiles to a static CSS file. No `'unsafe-inline'` is required for `style-src`.

### Required HTTP Headers
* `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
* `X-Content-Type-Options: nosniff`
* `X-Frame-Options: DENY`
* `Referrer-Policy: strict-origin-when-cross-origin`

## 14. Decision Log

| Date | Decision | Why | Alternatives Rejected |
| ---- | -------- | --- | --------------------- |
| 2026-08-14 | Zustand over Redux | Simplicity | Redux: too much boilerplate for this scope |
| 2026-08-14 | No SSR / SPA only | Simplicity | Next.js: overkill for dashboard-only app |
| 2026-08-14 | Vite over Blazor | Dev-speed | Blazor WASM AOT: slower compile times, less DOM control |
| 2026-08-14 | Custom TreeView over react-arborist | Dependency minimalism | react-arborist: extra dependency; `@tanstack/react-virtual` already in stack |
| 2026-08-14 | Memory-only JWT + httpOnly refresh cookie | Security (XSS protection) | localStorage: vulnerable to XSS theft |
| 2026-08-14 | hCaptcha over reCAPTCHA | Privacy (GDPR-friendly) | reCAPTCHA: heavier tracking footprint |
| 2026-08-15 | EXIT / LOGOUT / CANCEL instead of single Logout button | Clear separation of concerns: terminate app vs clear session vs reset state | Single Logout button: ambiguous behavior, violates BOUNDARIES.md destructive action clarity |
| 2026-08-15 | S002S1 Settings Panel | Centralized filename preferences | Scattered defaults: error-prone, poor UX |
| 2026-08-17 | Supabase BaaS for Auth + Storage | Direct Auth/Storage SDK calls under RLS remove the custom backend and GIST proxy requirement (ADR-017) | Custom ASP.NET backend: unnecessary for current MVP; service-role function only if a future privileged feature requires it |
| 2026-08-15 / 2026-08-17 | S002D2 Import Dialog | Explicit SuperCV file selection from fixed `Applai/SuperCV` vs implicit auto-load | Auto-load without user confirmation: error-prone; URL entry removed by ADR-017 |
| 2026-08-15 / 2026-08-17 | Client-side LOGOUT only (no provider call) | Simplicity + speed. Supabase session expiry is provider-managed; `signOut()` is reserved for an explicit future revocation decision. | Provider logout: adds latency and changes ADR-014's local-clear model |
| 2026-08-15 | AbortController for all requests | Enables instant cancellation for EXIT/LOGOUT/CANCEL without waiting for pending transactions | Axios cancel tokens: requires extra dependency (Axios is forbidden by BOUNDARIES.md) |

---

**End of TECH.md**
