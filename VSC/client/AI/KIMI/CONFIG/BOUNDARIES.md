# BOUNDARIES.md :: SPECificiation TEMPLATE for KIMI AI

## Metadata
---
AI: Do not use this "MetaData"-section for AI generation! It is is for human, internal use only. Start reading the document at the "1. Product Vision"-section!

---
### Purpose
The BOUNDARIES.md file **tells the AI what NOT TO INCLUDE or USE** when generating stuff. It provided explicit constraints, guardrails, and anti-patterns. When in doubt, check this file.

### How to GENERATE this file
This file is seldem created manually. Its a much better way to ask the KI to draft a version for the Application you have already specified with your [VISION](VISION_template.md), [SPEC ](SPEC_template.md) and [TECH](TECH.md)-files. 

Creating this file manually is not only the beyond the horizon of a non-system-architect but might unnecessarily cause the AI to ignore the best solution for your problem. 

So its better to get it generate from what the AI has found best for your solution (selecting the most up to date methodology, libraries, tools, processings and technologies you might not even be aware of).

Then go through it and replace the things you do not want or you will need an alternative for a well specified reason (gutt feeling and sticking with old plumbing is not a good advice). 

### Authoring Information
**Doc-Owner**: rene.baron@baronsolutions.ch
**Last Doc update**: August 13th, 2026
**Version**: 0.1
**Next review scheduled**: - 

---

### Context
* This template is **based on the [SPEC template](../../../../../../../../../../WORK/ENTITY/AI/PROVIDER/K/Kimi/CONFIG/TEMPLATES/SPEC_template.md)** of the [KIMI Project Configuration File TEMPLATE Collection](../../../../../../../../../../WORK/ENTITY/AI/PROVIDER/K/Kimi/CONFIG/KIMI%20Project%20Configuration%20Files.md)

### Links
* [KIMI Project Configuration Files: an **Overview**](../KIMI%20Project%20Configuration%20Files.md)

### Purpose and how this document shall be used
The **Purpose** of the BOUNDARIES.md is to limit the AI to something you know and you can control, or at least someting you may look up before using and where you have to make sure, that you can maintain it as well. Further this file must reflect your organisation's technology best practices and guidelines. When you are for instance a Microsoft Shop, you are a Microsoft Shop and not Apple, Google or Unix through the Backdoor Garage ;-)

The BOUNDARIES.md should be stable not only for this projects but for all projects to come, so that your organisation's tech stack remains somehow manageable. 

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
