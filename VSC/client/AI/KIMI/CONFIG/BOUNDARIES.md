# BOUNDARIES.md :: SPECificiation TEMPLATE for KIMI AI

> **Supabase migration pass (2026-08-17):** This revision replaces the GIST-backed MasterResume load/save flow with Supabase Auth (user login) and Supabase Storage (bucket "Applai", folder "SuperCV") for master/generated CV files. See inline "UPDATED 2026-08-17 (Supabase migration)" callouts for each specific change.

## 1. Technology Boundaries
### ✅ Allowed Dependencies
These may be used freely (already in package.json or approved as core runtime dependencies):

* React, React DOM, React Router
* TanStack Query, Zustand
* Tailwind CSS, shadcn/ui components
* Zod, React Hook Form
* Lucide React, date-fns
* Vitest, Testing Library, Playwright
* `@supabase/supabase-js` — required Auth + Storage client SDK for direct browser access under RLS

> **UPDATED 2026-08-17 (Supabase migration):** OLD — the client depended on a custom API for authentication and GIST operations. NEW — `@supabase/supabase-js` is an approved core dependency for Supabase Auth and `Applai/SuperCV` Storage operations.

### ⚠️ Dependencies Requiring Approval
Before adding ANY of these, update TECH.md and get explicit confirmation:

* State management libraries (Redux, MobX, Jotai)
* UI component libraries (MUI, Chakra, Ant Design)
* Animation libraries (Framer Motion, GSAP — use sparingly)
* Charting libraries (Recharts, D3, Chart.js)
* Form libraries (Formik — React Hook Form is preferred)
* Date libraries (Moment.js — use date-fns instead)
* Utility libraries (Lodash — prefer native or es-toolkit)

### ❌ Forbidden Dependencies
jQuery — Never. Use native DOM or React refs.
Moment.js — Use date-fns instead.
Bootstrap — Use Tailwind + shadcn/ui.
Axios — Use native Fetch API where a direct SDK call is not available.
Class components — Use functional components + hooks only.
CSS-in-JS (Styled Components, Emotion) — Use Tailwind + CSS Modules for edge cases.

---

## 2. Code Quality Boundaries

### TypeScript
* ✅ `strict: true` is mandatory. No exceptions.
* ✅ Explicit return types on all exported functions.
* ❌ NO `any` type. Use `unknown` with type guards if necessary.
* ❌ NO `@ts-ignore`. Use `@ts-expect-error` with a justification comment.
* ❌ NO `as` assertions unless absolutely unavoidable (document why).

### React
* ❌ NO `useEffect` for data fetching. Use TanStack Query.
* ❌ NO prop drilling > 2 levels. Use context or Zustand.
* ❌ NO inline styles except for dynamic values (use Tailwind).
* ❌ NO `dangerouslySetInnerHTML`. Use a sanitizer if absolutely needed.
* ❌ NO mixing sync and async state. Keep async logic in TanStack Query.

### Architecture
* ❌ NO business logic in components. Move to hooks or services.
* ❌ NO API calls in components. Use feature `api/` modules only.
* ❌ NO importing between sibling features. Use shared `lib/`, `types/`, `hooks/`.
* ❌ NO global CSS except for `index.css` (Tailwind directives + CSS variables).

---

## 3. Performance Boundaries
```plaintext
| Constraint | Limit | Enforcement |
| --------------------- | ------------------------- | ----------------------------------- |
| Bundle size per route | < 100 KB gzipped | `vite-bundle-analyzer` |
| Component re-renders | No unnecessary re-renders | React DevTools Profiler |
| Image size | Max 200 KB per image | Build-time check |
| API/Storage response timeout | 10 seconds | TanStack Query `queryClient` config |
| Debounce delay | 300ms for search inputs | Standardized hook |
```

## 4. Security Boundaries
* ❌ NO secrets in client code. API keys, tokens — everything server-side unless explicitly classified as a publishable Supabase client credential below.
* ❌ **NO Supabase service role key in client code, ever.** It is a server-only secret and may only be used by a future minimal serverless function when an explicitly approved feature needs privileged access.
* ✅ **Supabase anon key is safe client-side by design.** It may be supplied through `VITE_SUPABASE_ANON_KEY`; access control is enforced by Supabase Auth JWTs and Storage/Table RLS policies, not secrecy of the anon key.
* ✅ `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are required client configuration. Storage policies for bucket `Applai` must scope `SuperCV` objects to the authenticated user (or explicitly approved shared access).
* ❌ NO GitHub PAT, custom password hash, or private Storage credential in client code. Supabase Auth delegates password hashing, JWT issuance/rotation, and auth rate limiting server-side.
* ❌ NO `eval()` or `new Function()`. Ever.
* ❌ NO user input rendered as HTML without DOMPurify.
* ❌ NO storing passwords in any client storage.
* ✅ CSP headers must be configured in production, allowing the configured Supabase project in `connect-src` (and `img-src` if Storage images are rendered).
* ✅ All forms must have CSRF protection when using cookie-based flows; direct Supabase bearer-token calls use the Supabase session/RLS model.

> **UPDATED 2026-08-17 (Supabase migration):** OLD — all API keys and tokens were assumed to require a custom backend because a GitHub PAT was secret. NEW — only the Supabase anon key is client-visible, while the service role key remains forbidden and RLS enforces Storage access.

## 5. UX / UI Boundaries
* ❌ NO custom scrollbars unless specified in design.
* ❌ NO custom cursors unless specified in design.
* ❌ NO auto-playing audio/video.
* ❌ NO layout shifts — always reserve space for async content.
* ✅ All interactive elements must have `:focus-visible` styles.
* ✅ All forms must show loading state during submission.
* ✅ All destructive actions must have confirmation (modal or undo).

## 6. Browser and Device Support
```plaintext
| Platform | Support Level |
| -------------------------------- | ----------------- |
| Chrome / Edge (last 2 versions) | Full support |
| Firefox (last 2 versions) | Full support |
| Safari (last 2 versions) | Full support |
| Mobile Safari (iOS 16+) | Full support |
| Chrome Android (last 2 versions) | Full support |
| Internet Explorer | **NOT SUPPORTED** |
| Opera / Brave / Arc | Best effort |
```

## 7. Git and Workflow Boundaries
```plaintext
| Rule | Constraint |
| -------------- | -------------------------------------------------------------------- |
| Branch naming | `feature/F-01-short-name`, `fix/bug-description`, `chore/task` |
| Commit format | Conventional Commits: `feat:`, `fix:`, `refactor:`, `test:`, `docs:` |
| PR size | Max 400 lines changed per PR |
| Merge strategy | Squash and merge to `main` |
| Pre-commit | Lint + Type check must pass |
```

## 8. AI-Assisted Coding Boundaries
When using AI assistance (vibecoding):
* ✅ AI may generate code following all patterns in PATTERNS.md.
* ✅ AI may suggest refactors that improve readability.
* ❌ AI may NOT add new dependencies without explicit approval.
* ❌ AI may NOT change TECH.md or BOUNDARIES.md without explicit approval.
* ❌ AI may NOT remove tests without replacing them.
* ❌ AI may NOT implement features beyond the current SPEC.md scope, including in-app upload of new SuperCV master files.
* ✅ AI MUST update SESSION.md and CHANGELOG.md after each session.
