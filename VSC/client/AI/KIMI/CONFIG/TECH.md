# TECH.md :: TechStack Applai_Generator for KIMI.com vibecoding

* -> this document is based on [TECH template](../../../../../../../../../WORK/ENTITY/AI/PROVIDER/K/Kimi/CONFIG/TEMPLATES/TECH_template.md)

## 1. TECH Stack

| Layer               | Technology            | Version | Rationale                                     |
| ------------------- | --------------------- | ------- | --------------------------------------------- |
| Framework           | React                 | 19.x    | Concurrent features, Server Components opt-in |
| Language            | TypeScript            | 5.7.x   | Strict type safety                            |
| Build Tool          | Vite                  | 6.x     | Fast HMR, modern esbuild                      |
| Styling             | Tailwind CSS          | 4.x     | Utility-first, minimal CSS bundle             |
| UI Components       | shadcn/ui             | latest  | Accessible, customizable primitives           |
| State (Server)      | TanStack Query        | 5.x     | Caching, background updates, deduping         |
| State (Client)      | Zustand               | 5.x     | Lightweight, no boilerplate                   |
| Routing             | React Router          | 7.x     | Declarative, data APIs                        |
| Forms               | React Hook Form       | 7.x     | Performance, minimal re-renders               |
| Validation          | Zod                   | 3.x     | TypeScript-first schema validation            |
| Testing (Unit)      | Vitest                | 2.x     | Fast, Vite-native                             |
| Testing (Component) | React Testing Library | 16.x    | User-centric testing                          |
| Testing (E2E)       | Playwright            | 1.49+   | Cross-browser, reliable                       |
| Icons               | Lucide React          | latest  | Consistent, tree-shakeable                    |
| Date Handling       | date-fns              | 4.x     | Modular, immutable                            |
| HTTP Client         | Fetch API             | native  | No extra dependency   
|IDE         | Visual Studio Code (VSC)       | latest  | No extra dependency |

## 2. Project Structure
The following project structure is already given / mandatory on https://github.com/realB12/ApplAi_Generator/tree/main. You can add more folders and files but never delete/change the mentioned below!

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
|   |   |   |   └── common/            # Shared components (Button, Modal, etc.)
|   |   |   ├── features/              # Feature-based modules
|   |   |   |   ├── auth/              # AUTH Feature (1)
|   |   |   |   |   ├── api/           # API calls
|   |   |   |   |   ├── components/    # Feature-specific components
|   |   |   |   |   ├── hooks/         # Feature-specific hooks
|   |   |   |   |   ├── stores/        # Feature-specific state
|   |   |   |   |   ├── types/         # Feature-specific types
|   |   |   |   |   └── utils/         # Feature-specific utilities
|   |   |   |   └── [feature2]/        # FEATURE (2)
|   |   |   ├── hooks/                 # Global shared hooks
|   |   |   ├── lib/                   # Utilities, helpers
|   |   |   │   ├── api.ts             # API client setup
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

Special folders for You

All vibecoded SourceCode must go into the 



## 3. Data Model

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
```

## 4. API Contract
```plaintext
| Endpoint              | Method | Request               | Response               | Auth |
| --------------------- | ------ | --------------------- | ---------------------- | ---- |
| `/api/auth/login`     | POST   | `{ email, password }` | `{ user, token }`      | No   |
| `/api/auth/me`        | GET    | —                     | `User`                 | Yes  |
| `/api/[resource]`     | GET    | Query params          | `PaginatedResponse<T>` | Yes  |
| `/api/[resource]/:id` | GET    | —                     | `T`                    | Yes  |
| `/api/[resource]`     | POST   | `CreateDTO`           | `T`                    | Yes  |
| `/api/[resource]/:id` | PATCH  | `UpdateDTO`           | `T`                    | Yes  |
| `/api/[resource]/:id` | DELETE | —                     | `204`                  | Yes  |
```

### Error Response Format
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "User-friendly message",
    "details": [{ "field": "email", "message": "Invalid email format" }]
  }
}

## 4. State Management Strategy

** Server State
* Caching strategy: Stale-while-revalidate, 5min cache time
* Background refetch: On window focus, on network reconnect
* Optimistic updates: Only for low-risk actions (toggle, like)
* Pagination: Cursor-based preferred, offset as fallback


### Client State

**Global store slices:**
* auth: Current user, token, login/logout
* ui: Theme, sidebar state, active modals, toast notifications

Rule: Server state never goes into Zustand. Use TanStack Query for all API data.

## 5. Authentication & Authorization
```plaintext
| Concern       | Implementation                                                |
| ------------- | ------------------------------------------------------------- |
| Token Storage | httpOnly cookie (preferred) OR localStorage (if cross-domain) |
| Token Refresh | Automatic via interceptor, 5min before expiry                 |
| Route Guards  | `ProtectedRoute` wrapper — redirect to `/login`               |
| Role-based UI | `usePermission()` hook — hide elements, not just disable      |
| API Errors    | 401 → clear auth state → redirect to login                    |
```

## 6. Performance Budget
```plaintext
| Metric                         | Target   | Maximum  |
| ------------------------------ | -------- | -------- |
| First Contentful Paint (FCP)   | < 1.0s   | < 1.5s   |
| Largest Contentful Paint (LCP) | < 2.0s   | < 2.5s   |
| Time to Interactive (TTI)      | < 3.0s   | < 4.0s   |
| Total Bundle Size (initial)    | < 200 KB | < 300 KB |
| Lighthouse Performance         | > 90     | > 80     |
```
### Enforcement:
* Dynamic imports for routes (React.lazy)
* Dynamic imports for heavy components (charts, editors)
* Image optimization via CDN or vite-plugin-image-optimizer

## 7. Testing Strategy

```plaintext
| Type        | Tool         | Coverage Target               | What to test                           |
| ----------- | ------------ | ----------------------------- | -------------------------------------- |
| Unit        | Vitest       | 70%                           | Pure functions, utilities, store logic |
| Component   | RTL + Vitest | Critical paths                | Interactive components, forms          |
| Integration | RTL + Vitest | Key flows                     | Feature modules in combination         |
| E2E         | Playwright   | Happy paths + critical errors | Full user journeys                     |
```

### Testing Rules:
* Test behavior, not implementation
* Mock API calls at msw (Mock Service Worker) level
* Never test third-party libraries
* Each feature module contains its own __tests__ directory

## 8. Deployment
```plaintext
| Environment | Platform | URL                           | Auto-deploy                     |
| ----------- | -------- | ----------------------------- | ------------------------------- |
| Preview     | Vercel   | `[branch]-project.vercel.app` | Every PR                        |
| Staging     | Vercel   | `staging.project.com`         | `develop` branch                |
| Production  | Vercel   | `project.com`                 | `main` branch (manual approval) |
```

## 9. Environment Variables

| Variable          | Required | Description          | Example                      |
| ----------------- | -------- | -------------------- | ---------------------------- |
| `VITE_API_URL`    | Yes      | Backend API base URL | `https://api.example.com/v1` |
| `VITE_APP_NAME`   | No       | Display name         | `"MyApp"`                    |
| `VITE_SENTRY_DSN` | No       | Error tracking       | `https://...@sentry.io/...`  |

**Rule**: Never commit .env.local. Use .env.example as template.

## 10. Decision Log
```plaintext
| Date    | Decision                             | Context | Alternatives Rejected                         |
| ------- | ------------------------------------ | ------- | --------------------------------------------- |
| \[DATE] | \[FILL IN: e.g., Zustand over Redux] | \[Why?] | \[Redux: too much boilerplate for this scope] |
| \[DATE] | \[FILL IN: e.g., No SSR / SPA only]  | \[Why?] | \[Next.js: overkill for dashboard-only app]   |
```
