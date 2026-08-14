# DECISIONS.md

> **Purpose:** Architectural Decision Records (ADRs). Why we chose X over Y. Prevents re-litigating decisions.
> **Update frequency:** Per significant architectural decision.

---

## ADR-001: React SPA over Next.js

**Status:** Accepted  
**Date:** [FILL IN]  
**Context:** We need a modern frontend framework for a dashboard-heavy application.

**Decision:** Use React 19 as a Single Page Application (SPA) with Vite, not Next.js.

**Consequences:**
- ✅ Faster build times and simpler configuration
- ✅ No vendor lock-in to Vercel deployment
- ✅ Full control over routing and bundling
- ❌ No built-in SSR/SSG (not needed for a dashboard app)
- ❌ Manual SEO handling (acceptable for authenticated app)

**Alternatives considered:**
- Next.js App Router: Overkill for a dashboard-only app; SSR not needed
- Remix: Excellent, but steeper learning curve; not necessary for this scope

---

## ADR-002: Zustand over Redux / Context

**Status:** Accepted  
**Date:** [FILL IN]  
**Context:** We need client-side state management for UI state and auth.

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
- React Context: Performance issues with frequent updates

---

## ADR-003: TanStack Query for Server State

**Status:** Accepted  
**Date:** [FILL IN]  
**Context:** We need to fetch, cache, and update server data.

**Decision:** Use TanStack Query (React Query) as the single source of truth for all server state.

**Consequences:**
- ✅ Automatic caching and background refetching
- ✅ Eliminates useEffect data fetching anti-pattern
- ✅ Built-in loading/error states
- ✅ Optimistic updates support
- ❌ Additional library to learn
- ❌ Query key management discipline required

**Alternatives considered:**
- SWR: Similar, but TanStack Query has better TypeScript and devtools
- Apollo Client: Only if using GraphQL (we use REST)
- Manual fetch + useState: Too error-prone at scale

---

## ADR-004: Tailwind CSS over CSS Modules / Styled Components

**Status:** Accepted  
**Date:** [FILL IN]  
**Context:** We need a maintainable styling solution that scales.

**Decision:** Use Tailwind CSS v4 with shadcn/ui components.

**Consequences:**
- ✅ Rapid UI development without context-switching to CSS files
- ✅ Consistent design system via configuration
- ✅ Tiny production bundle (purged unused styles)
- ✅ shadcn/ui provides accessible, customizable primitives
- ❌ HTML can become verbose (mitigated by component extraction)
- ❌ Learning curve for utility-first approach

**Alternatives considered:**
- CSS Modules: Good isolation, but slower development velocity
- Styled Components: Runtime overhead, no built-in design system
- MUI/Chakra: Opinionated, harder to customize deeply

---

## ADR-005: Feature-Based Folder Structure

**Status:** Accepted  
**Date:** [FILL IN]  
**Context:** We need a scalable folder structure as the app grows.

**Decision:** Use feature-based co-location (not type-based).

**Structure:**
```
features/
  auth/
    api/
    components/
    hooks/
    stores/
    types/
    utils/
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

## ADR-006: Zod for Runtime Validation

**Status:** Accepted  
**Date:** [FILL IN]  
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

## ADR-007: No Custom Backend in MVP

**Status:** Accepted  
**Date:** [FILL IN]  
**Context:** [FILL IN: Why are we not building a backend?]

**Decision:** [FILL IN: Use Supabase / Firebase / Mock API / etc.]

**Consequences:**
- [FILL IN]

---

*Add new ADRs at the top. Never delete old ADRs — mark as `Superseded` if replaced.*

*Last updated: [DATE]*
