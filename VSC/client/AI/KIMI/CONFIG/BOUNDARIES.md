# BOUNDARIES.md :: SPECificiation TEMPLATE for KIMI AI

## 1. Technology Boundaries
### ✅ Allowed Dependencies
These may be used freely (already in package.json):

* React, React DOM, React Router
* TanStack Query, Zustand
* Tailwind CSS, shadcn/ui components
* Zod, React Hook Form
* Lucide React, date-fns
* Vitest, Testing Library, Playwright

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
Axios — Use native Fetch API.
Class components — Use functional components + hooks only.
CSS-in-JS (Styled Components, Emotion) — Use Tailwind + CSS Modules for edge cases.

---

## 2. Code Quality Boundaries

### TypeScript
* ✅ strict: true is mandatory. No exceptions.
* ✅ Explicit return types on all exported functions.
* ❌ NO any type. Use unknown with type guards if necessary.
* ❌ NO @ts-ignore. Use @ts-expect-error with a justification comment.
* ❌ NO as assertions unless absolutely unavoidable (document why).

### React
* ❌ NO useEffect for data fetching. Use TanStack Query.
* ❌ NO prop drilling > 2 levels. Use context or Zustand.
* ❌ NO inline styles except for dynamic values (use Tailwind).
* ❌ NO dangerouslySetInnerHTML. Use a sanitizer if absolutely needed.
* ❌ NO mixing sync and async state. Keep async logic in TanStack Query.

### Architecture
* ❌ NO business logic in components. Move to hooks or services.
* ❌ NO API calls in components. Use feature api/ modules only.
* ❌ NO importing between sibling features. Use shared lib/, types/, hooks/.
* ❌ NO global CSS except for index.css (Tailwind directives + CSS variables).


---

## 3. Performance Boundaries
```plaintext
| Constraint            | Limit                     | Enforcement                         |
| --------------------- | ------------------------- | ----------------------------------- |
| Bundle size per route | < 100 KB gzipped          | `vite-bundle-analyzer`              |
| Component re-renders  | No unnecessary re-renders | React DevTools Profiler             |
| Image size            | Max 200 KB per image      | Build-time check                    |
| API response timeout  | 10 seconds                | TanStack Query `queryClient` config |
| Debounce delay        | 300ms for search inputs   | Standardized hook                   |
```

## 4. Security Boundaries
* ❌ NO secrets in client code. API keys, tokens — everything server-side.
* ❌ NO eval() or new Function(). Ever.
* ❌ NO user input rendered as HTML without DOMPurify.
* ❌ NO storing passwords in any client storage.
* ✅ CSP headers must be configured in production.
* ✅ All forms must have CSRF protection (if not using JWT-only).


## 5. UX / UI Boundaries
* ❌ NO custom scrollbars unless specified in design.
* ❌ NO custom cursors unless specified in design.
* ❌ NO auto-playing audio/video.
* ❌ NO layout shifts — always reserve space for async content.
* ✅ All interactive elements must have :focus-visible styles.
* ✅ All forms must show loading state during submission.
* ✅ All destructive actions must have confirmation (modal or undo).


## 5. Browser and Device Support
```plaintext
| Platform                         | Support Level     |
| -------------------------------- | ----------------- |
| Chrome / Edge (last 2 versions)  | Full support      |
| Firefox (last 2 versions)        | Full support      |
| Safari (last 2 versions)         | Full support      |
| Mobile Safari (iOS 16+)          | Full support      |
| Chrome Android (last 2 versions) | Full support      |
| Internet Explorer                | **NOT SUPPORTED** |
| Opera / Brave / Arc              | Best effort       |
```

## 6. Git and Workflow Boundaries
```plaintext
| Rule           | Constraint                                                           |
| -------------- | -------------------------------------------------------------------- |
| Branch naming  | `feature/F-01-short-name`, `fix/bug-description`, `chore/task`       |
| Commit format  | Conventional Commits: `feat:`, `fix:`, `refactor:`, `test:`, `docs:` |
| PR size        | Max 400 lines changed per PR                                         |
| Merge strategy | Squash and merge to `main`                                           |
| Pre-commit     | Lint + Type check must pass                                          |
```

## 9. AI-Assisted Coding Boundaries
When using AI assistance (vibecoding):
* ✅ AI may generate code following all patterns in PATTERNS.md.
* ✅ AI may suggest refactors that improve readability.
* ❌ AI may NOT add new dependencies without explicit approval.
* ❌ AI may NOT change TECH.md or BOUNDARIES.md without explicit approval.
* ❌ AI may NOT remove tests without replacing them.
* ❌ AI may NOT implement features beyond the current SPEC.md scope.
* ✅ AI MUST update SESSION.md and CHANGELOG.md after each session.
