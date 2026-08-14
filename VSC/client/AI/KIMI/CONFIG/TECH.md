# TECH.md :: TechStack Applai_Generator for KIMI.com vibecoding

* -> this document is based on [TECH template](../../../../../../../../../WORK/ENTITY/AI/PROVIDER/K/Kimi/CONFIG/TEMPLATES/TECH_template.md)

## Architectural Overview
```
┌─────────────────┐      HTTP/REST      ┌──────────────────┐
│   Vite + TS     │ ◄─────────────────► │ ASP.NET Core 9   │
│   (SPA)         │                     │ Minimal API      │
│                 │                     │                  │
│ • Tree View     │                     │ • Gist Reader    │
│ • Node Edit     │                     │ • Gist Writer    │
│ • Selection     │                     │ • GitHub PAT     │
└─────────────────┘                     └──────────────────┘
```

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
| IDE | VS Code | latest | Development environment |
| CAPTCHA | hCaptcha | v2 invisible | Rate-limit protection after 3 failed logins |

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
|   |   ├─ SRC/                        # The sourcecode that finally makes the product
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
|   |   |   |   └── resume/            # RESUME Feature — S002, TVC01, S002D1
|   |   |   |       ├── api/           # GIST API calls
|   |   |   |       ├── components/    # S002, TVC01, S002D1 components
|   |   |   |       ├── hooks/         # useGist, useTreeView
|   |   |   |       ├── stores/        # Resume Zustand slice
|   |   |   |       ├── types/         # MasterCV JSON types
|   |   |   |       └── utils/         # Tree helpers, export helpers
|   |   |   ├── hooks/                 # Global shared hooks
|   |   |   ├── lib/                   # Utilities, helpers
|   |   |   │   ├── api.ts             # API client setup (Fetch + interceptors)
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

1. **/SRC**: All vibecoded **SourceCode** goes into `https://github.com/realB12/ApplAi_Generator/tree/main/VSC/client/SRC`

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
| SMSG — Message PopUp | `features/auth/` | any | `features/auth/components/MessagePopup.tsx` |

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

interface MasterCVNode {
  id: string;
  label: string;
  selected: boolean;
  expanded: boolean;
  info?: string;
  children?: MasterCVNode[];
}

interface GistFile {
  filename: string;
  content: string;
  raw_url?: string;
}
```

## 6. API Contract

### Authentication Endpoints

| Endpoint | Method | Request | Response | Auth |
| -------- | ------ | ------- | -------- | ---- |
| `/api/health` | GET | — | `{ status: "ok" }` | No |
| `/api/auth/login` | POST | `{ email, password, captchaToken?: string }` | `{ user, accessToken }` + httpOnly refresh cookie | No |
| `/api/auth/validate` | POST | — (refresh token from httpOnly cookie) | `{ user, accessToken }` | No |
| `/api/auth/logout` | POST | — | `204` | Yes |
| `/api/auth/me` | GET | — | `User` | Yes |

### GIST Endpoints

| Endpoint | Method | Request | Response | Auth |
| -------- | ------ | ------- | -------- | ---- |
| `/api/gist/files` | GET | — | `GistFile[]` | Yes |
| `/api/gist/load` | GET | `?filename=MasterCV.JSON` | `MasterCVNode[]` | Yes |
| `/api/gist/export` | POST | `{ filename, content: MasterCVNode[] }` | `{ filename, url }` | Yes |
| `/api/gist/check` | GET | `?prefix=GeneratedCV` | `{ exists: boolean, nextSuffix?: number }` | Yes |

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
| Token Storage | **Access token:** In-memory only (React context / Zustand). **Refresh token:** httpOnly, Secure, SameSite=Strict cookie (7 days TTL, 30 days if "Remember me" checked). |
| Token TTL | Access token: 15 minutes. Refresh token: 7 days (default) / 30 days (remember me). |
| Token Refresh | Automatic via Fetch interceptor, 5 minutes before expiry. |
| Password Hashing | Server-side: Argon2id. Client-side: min 12 chars, 1 upper, 1 lower, 1 digit, 1 special. |
| Rate Limiting | 5 attempts / 15 min / IP. After 3 failures: hCaptcha v2 invisible required. After 5 failures: 15-min lockout. |
| Route Guards | `ProtectedRoute` wrapper — redirect to `/` (S000) if unauthenticated. |
| Role-based UI | `usePermission()` hook — hide elements, not just disable. |
| API Errors | 401 → clear auth state → redirect to `/`. |
| Logout | `POST /api/auth/logout` + clear in-memory token + redirect to S000. **Requires confirmation modal (destructive action).** |

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
* `auth`: `{ user, accessToken, isAuthenticated, login(), logout(), setToken() }`
* `ui`: `{ theme, sidebarOpen, activeModal, toastQueue }`
* `resume`: `{ masterCV: MasterCVNode[] | null, displayAll: boolean, selectedNodes: Set<string> }`

### Form State
* **Tool:** React Hook Form + Zod
* All forms validated via Zod schemas before submission.
* Error messages displayed inline per field + SMSG for server errors.

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
| Integration | RTL + Vitest | Key flows | Auth flow (S000 → S001 → S002), GIST load → export |
| E2E | Playwright | Happy paths + critical errors | Full user journeys: login → load GIST → select nodes → export |

### Testing Rules:
* Test behavior, not implementation
* Mock API calls at msw (Mock Service Worker) level
* Never test third-party libraries
* Each feature module contains its own `__tests__` directory

### Test Mapping to SPEC Screens:

| Screen | Test Type | Critical Path |
|--------|-----------|---------------|
| S000 | E2E | Health check → spinner → S001 mount |
| S001 | Component + E2E | Form validation, CAPTCHA trigger, login success/failure |
| S002 | E2E | Session validation, TVC01 render, logout confirmation |
| TVC01 | Component + Unit | Node selection, collapse/expand, displayAll toggle |
| S002D1 | Component | Filename validation, collision handling, cancel behavior |
| SMSG | Component | All 4 message types render correctly, auto-dismiss, focus trap |

## 11. Deployment

| Environment | Platform | URL | Auto-deploy |
| ----------- | -------- | --- | ----------- |
| Preview | Vercel | `[branch]-project.vercel.app` | Every PR |
| Staging | Vercel | `staging.project.com` | `develop` branch |
| Production | Vercel | `project.com` | `main` branch (manual approval) |

## 12. Environment Variables

| Variable | Required | Description | Example |
| -------- | -------- | ----------- | ------- |
| `VITE_API_URL` | Yes | Backend API base URL | `https://api.example.com/v1` |
| `VITE_APP_NAME` | No | Display name | `"Applai Resume Generator"` |
| `VITE_SENTRY_DSN` | No | Error tracking | `https://...@sentry.io/...` |
| `VITE_HCAPTCHA_SITEKEY` | Yes | hCaptcha site key | `10000000-ffff-ffff-ffff-000000000001` |

**Rule**: Never commit `.env.local`. Use `.env.example` as template.

## 13. Security Configuration

### CSP Headers (Production)
```
default-src 'self';
script-src 'self';
style-src 'self';
connect-src 'self' /api https://api.hcaptcha.com https://hcaptcha.com;
img-src 'self' data:;
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
