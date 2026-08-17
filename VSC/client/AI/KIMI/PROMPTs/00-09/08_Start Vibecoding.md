# Start VibeCoding
Once all the Context-Files are without errors (-> [06_Making sure the generated code compiles, debugs and can be tested with VS Code](06_Making%20sure%20the%20generated%20code%20compiles,%20debugs%20and%20can%20be%20tested%20with%20VS%20Code.md) and [07_CHECK for VibeCoding readyness](07_CHECK%20for%20VibeCoding%20readyness.md)) you can start Vibecoding with the following prompt: 

vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv PROMPT vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv

# Vibecoding Prompt: ApplAi Resume Generator

## Context
You are building the **ApplAi Resume Generator** — a single-page React application that helps users generate tailored CVs from a master CV stored as a GitHub Gist.

## Mandatory Context Files
Before writing ANY code, read these files in this order:
1. VISION.md — Product vision and acceptance criteria
2. SPEC.md — Functional specification (screens, components, state, API)
3. TECH.md — Technical stack and architecture
4. BOUNDARIES.md — Scope constraints (IN/OUT)
5. DECISIONS.md — Architecture decisions and rationale
6. PATTERNS.md — Reusable code patterns (MUST follow exactly)
7. SESSION.md — Session workflow and phase rules

## Critical Rules
- **NEVER** deviate from PATTERNS.md without updating the file first.
- **NEVER** write code that contradicts DECISIONS.md.
- **ALWAYS** use the file naming convention from PATTERNS.md P12.
- **ALWAYS** use TypeScript strict mode.
- **ALWAYS** use Tailwind CSS utility classes (no custom CSS files).
- **ALWAYS** use shadcn/ui components where available.
- **ALWAYS** follow the Zustand + TanStack Query state management approach from TECH.md.
- **ALWAYS** use React Hook Form + Zod for forms (P03).
- **ALWAYS** use the API client pattern from P02 (with 401 refresh logic).
- **ALWAYS** use the Error Handling pattern from P08 (via useMessage hook).
- **ALWAYS** include ScreenBadge on every screen (P01).
- **ALWAYS** use the TreeView component pattern (P05) for the CV hierarchy.
- **ALWAYS** use the Export Flow pattern (P07) for Gist export.
- **ALWAYS** validate all user input with Zod schemas.
- **ALWAYS** handle loading states with Spinner (P10).
- **ALWAYS** handle errors via MessagePopup (SMSG) pattern (P04).

## Project Setup (Phase 1)
1. Initialize with: `npm create vite@latest client -- --template react-ts`
2. Install dependencies from TECH.md.
3. Install shadcn/ui components: `npx shadcn add dialog input button checkbox label`
4. Install additional packages: `zustand @tanstack/react-query @tanstack/react-virtual react-hook-form @hookform/resolvers zod lucide-react react-router-dom`
5. Configure `vite.config.ts` with `@/` path alias pointing to `./src`.
6. Configure `tsconfig.json` with `"paths": { "@/*": ["./src/*"] }`.
7. Create `.env` with `VITE_API_URL=http://localhost:3001/api` (or actual proxy URL).
8. Set up Tailwind with dark mode: `darkMode: 'class'` in `tailwind.config.js`.
9. Create `src/types/index.ts` with:
   ```typescript
   export interface User {
     id: string;
     email: string;
     name?: string;
   }
   export interface TreeNode {
     id: string;
     label: string;
     selected: boolean;
     expanded: boolean;
     info?: string;
     children?: TreeNode[];
   }
   ```

## App Shell (Phase 2 — CRITICAL)
Create src/main.tsx with:
* React 18 createRoot
* QueryClientProvider with new QueryClient()
* BrowserRouter
* StrictMode OPTIONAL (note: may cause double-mount in dev)

Create src/App.tsx with:
* Route / → WelcomeScreen (S000)
* Route /login → LoginScreen (S001)
* Route /main → ProtectedRoute → MainScreen (S002)
* Global MessagePopup (SMSG) rendered at app level
* useValidateSession hook called on app mount (call in App or a layout component)
* useMessage hook state passed to global MessagePopup

Create src/lib/utils.ts with the standard cn() helper:

```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

## Implementation Order (Follow SESSION.md Phases)
* Phase 1: Project scaffolding, config files, types, utils
* Phase 2: App shell, routing, providers, global layout
* Phase 3: Auth feature (LoginScreen, useAuth hooks, ProtectedRoute, LogoutButton)
* Phase 4: Resume feature (MainScreen, TreeView, resumeStore, Gist API hooks)
* Phase 5: Export dialog, polish, error handling, accessibility checks
* Phase 6: Final review, build verification, TypeScript strict check

## Code Quality Checklist for EVERY file
[ ] TypeScript compiles without errors (npm run build)
[ ] All imports are present and paths use @/ alias
[ ] All props are typed with interfaces
[ ] All form inputs have proper id, aria-invalid, aria-describedby
[ ] All buttons have type="button" or type="submit" explicitly
[ ] All async operations handle loading and error states
[ ] All Zustand stores follow the pattern from P02
[ ] All TanStack Query hooks follow the pattern from P02/P06
[ ] All API calls go through apiClient from lib/api.ts
[ ] All errors are handled via useMessage hook, not console.log
[ ] ScreenBadge is present on every screen component
[ ] Component matches its screen ID from SPEC.md

## Build Verification
Before declaring any phase complete, run:
```bash
npm run build
```

The build MUST succeed with zero TypeScript errors. Fix all errors before proceeding to the next phase.


## If You Encounter Ambiguity
If any requirement is unclear or contradictory:
Check PATTERNS.md first
Check DECISIONS.md second
Check SPEC.md third
If still unclear, ask for clarification — DO NOT guess   

^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ END Of PROMPT 
   
   