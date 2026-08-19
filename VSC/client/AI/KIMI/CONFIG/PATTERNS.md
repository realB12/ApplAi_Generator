# PATTERNS.md :: Reusable Code Patterns for Applai Resume Generator

> **Supabase migration pass (2026-08-17):** This revision replaces the GIST-backed MasterResume load/save flow with Supabase Auth (user login) and Supabase Storage (bucket "Applai", folder "SuperCV") for master/generated CV files. See inline "UPDATED 2026-08-17 (Supabase migration)" callouts for each specific change.
>
> **Reactive Resume schema-mapping pass (2026-08-17):** This revision replaces P05's generic `TreeNode[]`/`selected` model with the real `SuperCVDocument` schema and its native `hidden` field (TECH.md §5/§5a, DECISIONS.md ADR-018), and updates P06/P07/P14/P15 to match. See inline "UPDATED 2026-08-17 (Reactive Resume schema mapping)" callouts.

* -> Use these patterns when implementing any feature from SPEC.md.
* -> Never deviate from these patterns without updating this file.

> **Compliance pass (2026-08-17):** Reconciled against SPEC.md v1.0.3 and TECH.md v1.0.3. Fixes applied:
> 1. **P02/P09 LOGOUT bug removed** — the old `useLogout()`/`LogoutButton` pattern called `POST /api/auth/logout`, contradicting TECH.md §7 and SPEC.md §3.6.4 ("LOGOUT does NOT call the server") and DECISIONS.md ADR-014. Fixed to be client-side-only.
> 2. **AbortController wiring added** to `lib/api.ts` per TECH.md §8 (`createRequestSignal`/`abortAllRequests`), referenced by DECISIONS.md ADR-012.
> 3. **P06 GIST API fixed (historical)** — `listGistFiles()` and `loadGistFile()` were missing the required `gistUrl` query parameter mandated by TECH.md §6's API contract. *(This note describes the pre-Supabase GIST-era fix and is kept for history; P06 itself was fully replaced by the Supabase Storage API Pattern in the 2026-08-17 Supabase migration pass below.)*
> 4. **New patterns added**: P13 EXIT Button, P14 CANCEL Button, P15 S002D2 Import Dialog, P16 S002S1 Settings Panel + `useSettings` hook — these screens/behaviors were fully specified in SPEC.md but had no corresponding pattern, leaving vibecoding without guidance.
> 5. **P03 LoginForm extended** with the EXIT button, failed-attempt counter, hCaptcha trigger (after 3 fails), and 15-min lockout (after 5 fails) required by SPEC.md §3.2.3 and §1.

---

## P01 — Screen Component Pattern

Every screen (S000, S001, S002, SMSG, S002D1) follows this structure:

```typescript
// features/[feature]/components/[ScreenName].tsx
import { ScreenBadge } from '@/components/common/ScreenBadge';

interface ScreenNameProps {
  // Props if any
}

export function ScreenName({}: ScreenNameProps) {
  return (
    <div id="sXXX-container" className="relative min-h-screen">
      <ScreenBadge screenId="SXXX" />
      {/* Screen content */}
    </div>
  );
}
```

### ScreenBadge Component

```typescript
// components/common/ScreenBadge.tsx
export function ScreenBadge({ screenId }: { screenId: string }) {
  return (
    <div
      id={`${screenId.toLowerCase()}-badge`}
      className="fixed top-2 left-2 z-[9999] rounded-full bg-black/60 px-1.5 py-0.5 text-[10px] font-mono text-white pointer-events-none select-none"
      aria-hidden="true"
    >
      {screenId}
    </div>
  );
}
```

---

## P02 — Authentication Flow Pattern

> **UPDATED 2026-08-17 (Supabase migration):** OLD — `apiClient` posted to a custom auth API, refreshed custom cookies, and exposed custom login/validate/logout functions. NEW — a `supabase-js` singleton performs Auth directly; Supabase owns credential handling and session refresh while a Remember-Me-selected adapter preserves ADR-009's XSS-resistance intent.

### Supabase Client and Auth Zustand Store

```typescript
// lib/supabase.ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Memory-only by default. `supabase-js` defaults to localStorage, which would
// contradict ADR-009. "Remember me" (SPEC.md §3.2.2) does NOT extend Supabase's
// refresh-token TTL — that is a project-wide GoTrue setting, not a per-login
// parameter. Instead it selects the adapter: sessionStorage when checked
// (survives reload, cleared at tab/window close), memory-only when unchecked
// (cleared on any reload). See ADR-009 Amendment 2 (2026-08-17).
interface MemoryStorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const memoryValues = new Map<string, string>();
const memoryStorage: MemoryStorageAdapter = {
  getItem: (key) => memoryValues.get(key) ?? null,
  setItem: (key, value) => { memoryValues.set(key, value); },
  removeItem: (key) => { memoryValues.delete(key); },
};

const STORAGE_KEY = 'applai-supabase-auth';

// ADR-014 local-only logout must clear whichever adapter is active, otherwise
// getSession() would restore the still-resident session after the redirect.
export function clearLocalSupabaseSession(): void {
  memoryValues.clear();
  window.sessionStorage.removeItem(STORAGE_KEY);
}

let client: SupabaseClient | undefined;
let clientRememberMe: boolean | undefined;

// Call with the S001 "Remember me" value at login time; calling again with a
// DIFFERENT value recreates the client against the other adapter. Calling with
// no argument (e.g. the S000 session-restore check) reuses the existing client
// without changing its adapter.
export function getSupabaseClient(rememberMe?: boolean): SupabaseClient {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error('Missing Supabase client configuration.');
  const wantsRememberMe = rememberMe ?? clientRememberMe ?? false;
  if (!client || (rememberMe !== undefined && rememberMe !== clientRememberMe)) {
    clientRememberMe = wantsRememberMe;
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: wantsRememberMe ? window.sessionStorage : memoryStorage,
        storageKey: STORAGE_KEY,
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return client;
}

// features/auth/stores/authStore.ts
import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, accessToken: string) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null, accessToken: null, isAuthenticated: false, isLoading: true,
  setAuth: (user, accessToken) => set({ user, accessToken, isAuthenticated: true, isLoading: false }),
  clearAuth: () => set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
}));
```

### Auth Functions and Hooks

```typescript
// features/auth/api/authApi.ts
import type { User } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/lib/supabase';

export const authKeys = { session: ['supabase', 'session'] as const, user: ['supabase', 'user'] as const };
export type LoginInput = { email: string; password: string; captchaToken?: string; rememberMe: boolean };

// rememberMe selects the client storage adapter BEFORE authenticating (SPEC.md
// §3.2.2 / ADR-009 Amendment 2) — it never touches Supabase's own refresh-token
// TTL, which is a project-wide GoTrue setting, not a per-login parameter.
export async function login(input: LoginInput): Promise<{ user: User; accessToken: string }> {
  const { data, error } = await getSupabaseClient(input.rememberMe).auth.signInWithPassword({
    email: input.email,
    password: input.password,
    options: input.captchaToken ? { captchaToken: input.captchaToken } : undefined,
  });
  if (error || !data.user || !data.session) throw error ?? new Error('No Supabase session returned.');
  return { user: data.user, accessToken: data.session.access_token };
}

export async function getCurrentSession(): Promise<{ user: User; accessToken: string } | null> {
  const { data, error } = await getSupabaseClient().auth.getSession();
  if (error) throw error;
  return data.session ? { user: data.session.user, accessToken: data.session.access_token } : null;
}
```

```typescript
// features/auth/hooks/useAuth.ts
import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { clearLocalSupabaseSession, getSupabaseClient } from '@/lib/supabase';
import { abortAllRequests } from '@/lib/api';
import { authKeys, getCurrentSession, login } from '../api/authApi';
import { useAuthStore } from '../stores/authStore';

export function useValidateSession() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const setLoading = useAuthStore((state) => state.setLoading);
  const query = useQuery({ queryKey: authKeys.session, queryFn: getCurrentSession, retry: false, staleTime: Infinity });
  useEffect(() => {
    if (query.isSuccess) query.data ? setAuth(query.data.user, query.data.accessToken) : clearAuth();
    if (query.isError) { clearAuth(); setLoading(false); }
  }, [query.isSuccess, query.isError, query.data, setAuth, clearAuth, setLoading]);
  useEffect(() => {
    const { data: subscription } = getSupabaseClient().auth.onAuthStateChange((_event, session) => {
      session ? setAuth(session.user, session.access_token) : clearAuth();
    });
    return () => subscription.subscription.unsubscribe();
  }, [setAuth, clearAuth]);
  return query;
}

export function useLogin() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: login, onSuccess: (data) => {
    setAuth(data.user, data.accessToken); queryClient.invalidateQueries({ queryKey: authKeys.session });
  }});
}

// ADR-014 remains intentional: LOGOUT is a local session clear. Do NOT call
// supabase.auth.signOut() here. That call remains available only for a future
// explicit revocation flow; this tension is recorded by ADR-017.
export function useLogout() {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const queryClient = useQueryClient();
  return () => { abortAllRequests(); clearLocalSupabaseSession(); clearAuth(); queryClient.clear(); window.location.href = '/'; };
}
```

### Cancellation Utilities

```typescript
// lib/api.ts
const abortControllers = new Set<AbortController>();
export function createRequestSignal(): AbortSignal {
  const controller = new AbortController(); abortControllers.add(controller); return controller.signal;
}
export function abortAllRequests(): void { abortControllers.forEach((c) => c.abort()); abortControllers.clear(); }

// Supabase SDK Storage methods do not universally accept an external AbortSignal.
// Race the UI result so CANCEL/EXIT/LOGOUT can return immediately, then ignore a
// late SDK result; this does not guarantee the underlying network request stops.
export function raceWithAbort<T>(operation: Promise<T>, signal: AbortSignal): Promise<T> {
  return Promise.race([operation, new Promise<T>((_, reject) =>
    signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true })
  )]);
}
```

> **UPDATED 2026-08-17 (Supabase migration):** OLD — AbortController cancelled `fetch` requests through `apiClient`. NEW — the utility remains for plain fetch and best-effort UI cancellation of Supabase SDK operations; do not claim unsupported hard network abort semantics.

### ProtectedRoute Guard

```typescript
// features/auth/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  if (isLoading) return <div className="flex h-screen items-center justify-center"><Spinner /></div>;
  return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
}
```

---

## P03 — Form Pattern (React Hook Form + Zod)

> **Extended 2026-08-17:** The login form keeps its email/password/CAPTCHA/lockout structure; `useLogin()` now delegates its underlying request to Supabase Auth (P02). Supabase enforces rate limiting/CAPTCHA server-side; retain the 3-failure/5-failure UI only when project configuration matches.

```typescript
// features/auth/components/LoginForm.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import HCaptcha from '@hcaptcha/react-hcaptcha'; // approval required per BOUNDARIES.md §1 before adding
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ExitButton } from './ExitButton'; // P13

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address').max(254),
  password: z.string().min(12, 'Password must be at least 12 characters').max(128),
  rememberMe: z.boolean().default(false),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const {
    register,
    handleSubmit,
    setFocus,
    resetField,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { rememberMe: false },
  });

  // Supabase Auth enforces rate limiting/CAPTCHA. Keep matching UX thresholds only when configured in the Supabase project.
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [captchaToken, setCaptchaToken] = useState<string | undefined>();
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const captchaRequired = failedAttempts >= 3;
  const isLocked = lockedUntil !== null && Date.now() < lockedUntil;

  const loginMutation = useLogin();

  const onSubmit = (data: LoginFormData) => {
    if (isLocked) return;
    if (captchaRequired && !captchaToken) return; // hCaptcha must resolve first
    loginMutation.mutate(
      { ...data, captchaToken },
      {
        onError: (err: unknown) => {
          const status = typeof err === 'object' && err !== null && 'status' in err ? Number(err.status) : undefined;
          if (status === 429) {
            setLockedUntil(Date.now() + 15 * 60 * 1000);
            return;
          }
          setFailedAttempts((n) => n + 1);
          resetField('password');
          setFocus('password');
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="space-y-4">
        <div>
          <Label htmlFor="s001-email">Email address</Label>
          <Input
            id="s001-email"
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            aria-invalid={errors.email ? 'true' : 'false'}
            aria-describedby={errors.email ? 's001-email-error' : undefined}
            {...register('email')}
          />
          {errors.email && (
            <span id="s001-email-error" className="text-sm text-red-500">
              {errors.email.message}
            </span>
          )}
        </div>

        <div>
          <Label htmlFor="s001-password">Password</Label>
          <div className="relative">
            <Input
              id="s001-password"
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              aria-invalid={errors.password ? 'true' : 'false'}
              aria-describedby={errors.password ? 's001-password-error' : undefined}
              {...register('password')}
            />
            <PasswordToggle inputId="s001-password" />
          </div>
          {errors.password && (
            <span id="s001-password-error" className="text-sm text-red-500">
              {errors.password.message}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox id="s001-remember" {...register('rememberMe')} />
          <Label htmlFor="s001-remember">Remember me on this device</Label>
        </div>

        {captchaRequired && (
          <div id="s001-captcha">
            <HCaptcha
              sitekey={import.meta.env.VITE_HCAPTCHA_SITEKEY}
              size="invisible"
              onVerify={(token) => setCaptchaToken(token)}
            />
          </div>
        )}

        {isLocked && (
          <p className="text-sm text-amber-600">
            Too many attempts. Please try again in 15 minutes.
          </p>
        )}

        <Button
          id="s001-submit"
          type="submit"
          disabled={isSubmitting || loginMutation.isPending || isLocked || (captchaRequired && !captchaToken)}
        >
          {loginMutation.isPending ? <Spinner className="mr-2" /> : null}
          Sign In
        </Button>

        <ExitButton id="s001-exit" />
      </div>
    </form>
  );
}
```

---

## P04 — Modal / Dialog Pattern (SMSG + S002D1)

All modals use shadcn/ui `Dialog` primitives with consistent styling.

```typescript
// components/common/MessagePopup.tsx (SMSG)
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import { useEffect } from 'react';

export type MessageType = 'error' | 'warning' | 'success' | 'info';

interface MessagePopupProps {
  type: MessageType;
  title?: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  persistent?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const iconMap = {
  error: { Icon: AlertCircle, color: 'text-red-500', title: 'Error' },
  warning: { Icon: AlertTriangle, color: 'text-amber-500', title: 'Warning' },
  success: { Icon: CheckCircle, color: 'text-green-500', title: 'Success' },
  info: { Icon: Info, color: 'text-indigo-500', title: 'Information' },
};

export function MessagePopup({
  type,
  title,
  message,
  actionLabel = 'OK',
  onAction,
  persistent = false,
  open,
  onOpenChange,
}: MessagePopupProps) {
  const { Icon, color, title: defaultTitle } = iconMap[type];

  useEffect(() => {
    if (!open) return;
    if (persistent) return;
    if (type === 'error' || type === 'warning') return;

    const timer = setTimeout(() => onOpenChange(false), 5000);
    return () => clearTimeout(timer);
  }, [open, type, persistent, onOpenChange]);

  const handleAction = () => {
    onAction?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={persistent ? undefined : onOpenChange}>
      <DialogContent className="sm:max-w-[400px]" role="alertdialog" aria-modal="true">
        <ScreenBadge screenId="SMSG" />
        <DialogHeader className="flex flex-row items-start gap-3">
          <Icon className={`h-6 w-6 ${color} shrink-0`} aria-hidden="true" />
          <div>
            <DialogTitle id="smsg-title">{title || defaultTitle}</DialogTitle>
            <DialogDescription id="smsg-message" className="mt-1">
              {message}
            </DialogDescription>
          </div>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={handleAction}>{actionLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### S002D1 Export Dialog

```typescript
// features/resume/components/ExportDialog.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const exportSchema = z.object({
  filename: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(23, 'Name must be at most 23 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Only letters, numbers, hyphens, and underscores allowed'),
});

type ExportFormData = z.infer<typeof exportSchema>;

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (filename: string) => void;
}

export function ExportDialog({ open, onOpenChange, onExport }: ExportDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<ExportFormData>({
    resolver: zodResolver(exportSchema),
    defaultValues: { filename: 'GeneratedCV' },
    mode: 'onBlur',
  });

  useEffect(() => {
    if (open) {
      reset({ filename: 'GeneratedCV' });
      // Focus and select all after a tick
      setTimeout(() => {
        const input = document.getElementById('s002d1-name') as HTMLInputElement;
        input?.focus();
        input?.select();
      }, 50);
    }
  }, [open, reset]);

  const handleCancel = () => {
    onOpenChange(false);
    // Abort any in-flight export request via AbortController if needed
  };

  const onSubmit = (data: ExportFormData) => {
    onExport(data.filename);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[400px]">
        <ScreenBadge screenId="S002D1" />
        <DialogHeader>
          <DialogTitle id="s002d1-title">Export Your CV</DialogTitle>
          <DialogDescription id="s002d1-prompt">
            Please enter a qualified name for your exported CV.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="s002d1-name">CV Name</Label>
              <Input
                id="s002d1-name"
                placeholder="GeneratedCV"
                aria-invalid={errors.filename ? 'true' : 'false'}
                aria-describedby={errors.filename ? 's002d1-name-error' : undefined}
                {...register('filename')}
              />
              {errors.filename && (
                <span id="s002d1-name-error" className="text-sm text-red-500">
                  {errors.filename.message}
                </span>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid}>
              Export
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

---

## P05 — TreeView Component Pattern (TVC01)

> **UPDATED 2026-08-17 (Reactive Resume schema mapping):** OLD — TVC01 rendered a generic `TreeNode[]` with its own `selected`/`expanded` flags, and the Zustand store held a `masterCV: TreeNode[]` copy. NEW — TVC01 renders the real `SuperCVDocument` (TECH.md §5) directly; the checkbox toggles that document's own `hidden` field (Topic and Item rows only, per DECISIONS.md ADR-018), and only `expandedPaths` is separate client-side UI state.

```typescript
// features/resume/utils/superCVTree.ts — the schema-aware flatten function
import type { SuperCVDocument, SuperCVSection, SuperCVSectionItem, SectionKey } from '@/types/superCV';
import { SECTION_REGISTRY, SECTION_REGISTRY_FALLBACK, type SectionRegistryEntry } from '@/types/superCV';

export type RowKind = 'topic' | 'item';

export interface FlatRow {
  path: string;          // e.g. "sections.experience" or "sections.experience.items.2" or "customSections.0"
  depth: 0 | 1;          // Topic = 0, Item = 1 — this is the app's max selectable depth (DECISIONS.md ADR-018)
  kind: RowKind;
  label: string;         // derived from Section Registry titleFields, or the item's first string field as fallback
  hidden: boolean;       // bound directly to the underlying section/item's own `hidden` field
  hasChildren: boolean;
  data: SuperCVSection | SuperCVSectionItem;
}

function registryFor(key: string): SectionRegistryEntry {
  return (SECTION_REGISTRY as Record<string, SectionRegistryEntry>)[key]
    ?? { displayName: titleCase(key), ...SECTION_REGISTRY_FALLBACK };
}

function titleCase(key: string): string {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());
}

function itemLabel(item: SuperCVSectionItem, registry: SectionRegistryEntry): string {
  const parts = registry.titleFields
    .map((field) => item[field])
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0);
  if (parts.length) return parts.join(' · ');
  // Generic fallback (customSections / unknown keys): first non-empty string field, excluding id/hidden.
  const fallback = Object.entries(item).find(
    ([key, value]) => key !== 'id' && key !== 'hidden' && typeof value === 'string' && value.trim().length > 0
  );
  return fallback ? String(fallback[1]) : '(untitled)';
}

// Builds the flat, virtualization-ready row list. `displayAll` and `expandedPaths`
// are the ONLY two things that affect visibility beyond the document's own `hidden`
// flags — there is no separate selection state to fall out of sync with.
export function flattenSuperCV(
  doc: SuperCVDocument | null,
  expandedPaths: Set<string>,
  displayAll: boolean
): FlatRow[] {
  if (!doc) return [];
  const rows: FlatRow[] = [];

  const pushTopic = (key: string, section: SuperCVSection, path: string) => {
    if (!displayAll && section.hidden) return;
    const registry = registryFor(key);
    rows.push({ path, depth: 0, kind: 'topic', label: registry.displayName, hidden: section.hidden, hasChildren: section.items.length > 0, data: section });
    if (!expandedPaths.has(path)) return;
    section.items.forEach((item, i) => {
      if (!displayAll && item.hidden) return;
      const itemPath = `${path}.items.${i}`;
      rows.push({ path: itemPath, depth: 1, kind: 'item', label: itemLabel(item, registry), hidden: item.hidden, hasChildren: false, data: item });
    });
  };

  (Object.entries(doc.sections) as [SectionKey, SuperCVSection | undefined][]).forEach(([key, section]) => {
    if (section) pushTopic(key, section, `sections.${key}`);
  });
  doc.customSections.forEach((section, i) => pushTopic(section.name ?? `custom${i}`, section, `customSections.${i}`));

  return rows;
}
```

```typescript
// features/resume/components/TreeView.tsx
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { flattenSuperCV, type FlatRow } from '../utils/superCVTree';
import { useResumeStore } from '../stores/resumeStore';

interface TreeViewProps {
  displayAll: boolean;
  onExpandItem: (row: FlatRow) => void; // opens the field-detail/edit panel (P05 continued below)
}

export function TreeView({ displayAll, onExpandItem }: TreeViewProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const { superCV, expandedPaths, toggleHidden, toggleExpanded } = useResumeStore();
  const rows = flattenSuperCV(superCV, expandedPaths, displayAll);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40,
    overscan: 5,
  });

  return (
    <div ref={parentRef} className="h-[600px] overflow-auto border rounded-lg">
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const row = rows[virtualItem.index];
          return (
            <div
              key={row.path}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: `${virtualItem.size}px`, transform: `translateY(${virtualItem.start}px)`, paddingLeft: `${row.depth * 24 + 12}px` }}
              className="flex items-center gap-2 hover:bg-slate-50 border-b border-slate-100"
              onDoubleClick={() => (row.hasChildren ? toggleExpanded(row.path) : onExpandItem(row))}
            >
              {row.hasChildren ? (
                <button onClick={() => toggleExpanded(row.path)} className="p-1 hover:bg-slate-200 rounded" aria-label={expandedPaths.has(row.path) ? 'Collapse' : 'Expand'}>
                  {expandedPaths.has(row.path) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
              ) : (
                <span className="w-6" />
              )}

              {/* Checked = hidden:false, unchecked = hidden:true — the checkbox toggles the document's own field (DECISIONS.md ADR-018). No field-level checkbox exists — the schema has no per-field hidden flag. */}
              <Checkbox checked={!row.hidden} onCheckedChange={() => toggleHidden(row.path)} aria-label={`Select ${row.label}`} />

              <span className="text-sm font-medium">{row.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

### TreeView State Management (Zustand)

```typescript
// features/resume/stores/resumeStore.ts
import { create } from 'zustand';
import type { SuperCVDocument } from '@/types/superCV';

interface ResumeState {
  superCV: SuperCVDocument | null;
  pristineSuperCV: SuperCVDocument | null; // last-loaded copy, used by CANCEL Case B (P14) to revert edits
  expandedPaths: Set<string>;
  displayAll: boolean;
  storageFilename: string | null;
  setSuperCV: (doc: SuperCVDocument) => void; // used on import; forces every hidden to false (SPEC.md §3.5.5)
  setStorageFilename: (filename: string) => void;
  toggleHidden: (path: string) => void;       // the ONLY selection mechanism — no separate selected flag
  toggleExpanded: (path: string) => void;     // client-side only; never written into superCV
  setDisplayAll: (value: boolean) => void;
  resetToPristine: () => void;                // CANCEL Case B — revert hidden flags + edits, keep expandedPaths
  isDirty: () => boolean;
}

// Generic path resolver — works for "sections.experience", "sections.experience.items.2",
// and "customSections.0" alike, so no per-section-type code is needed here.
function getAtPath(doc: SuperCVDocument, path: string): Record<string, unknown> {
  return path.split('.').reduce<any>((node, key) => node[key], doc);
}

function forceAllHiddenFalse(doc: SuperCVDocument): SuperCVDocument {
  const clone = structuredClone(doc);
  Object.values(clone.sections).forEach((section) => {
    if (!section) return;
    section.hidden = false;
    section.items.forEach((item) => { item.hidden = false; });
  });
  clone.customSections.forEach((section) => {
    section.hidden = false;
    section.items.forEach((item) => { item.hidden = false; });
  });
  return clone;
}

export const useResumeStore = create<ResumeState>((set, get) => ({
  superCV: null,
  pristineSuperCV: null,
  expandedPaths: new Set(),
  displayAll: false,
  storageFilename: null,
  setSuperCV: (doc) => {
    const forced = forceAllHiddenFalse(doc); // SPEC.md §3.5.5 — first-import default is everything selected
    set({ superCV: forced, pristineSuperCV: structuredClone(forced) });
  },
  setStorageFilename: (filename) => set({ storageFilename: filename }),
  toggleHidden: (path) =>
    set((state) => {
      if (!state.superCV) return state;
      const clone = structuredClone(state.superCV);
      const node = getAtPath(clone, path);
      node.hidden = !node.hidden;
      return { superCV: clone };
    }),
  toggleExpanded: (path) =>
    set((state) => {
      const next = new Set(state.expandedPaths);
      next.has(path) ? next.delete(path) : next.add(path);
      return { expandedPaths: next };
    }),
  setDisplayAll: (value) => set({ displayAll: value }),
  resetToPristine: () =>
    set((state) => ({ superCV: state.pristineSuperCV ? forceAllHiddenFalse(state.pristineSuperCV) : null })),
  isDirty: () => {
    const { superCV, pristineSuperCV } = get();
    return JSON.stringify(superCV) !== JSON.stringify(pristineSuperCV);
  },
}));
```

---

## P06 — Supabase Storage API Pattern

> **UPDATED 2026-08-17 (Supabase migration):** OLD — `gistApi.ts` called `/api/gist/files`, `/load`, `/export`, and `/check` through a backend. NEW — `supercvStorageApi.ts` calls the fixed Supabase Storage bucket `Applai`, folder `SuperCV` directly, and derives filename collisions from a listing.

```typescript
// features/resume/api/supercvStorageApi.ts
import { getSupabaseClient } from '@/lib/supabase';
import type { SuperCVDocument } from '@/types/superCV';

export interface SupabaseStorageFile { name: string; path: string; size?: number; updated_at?: string; }
const BUCKET = 'Applai';
const FOLDER = 'SuperCV';
const objectPath = (filename: string) => `${FOLDER}/${filename}`;

export const superCVKeys = {
  files: ['supabase-storage', BUCKET, FOLDER] as const,
  load: (filename: string) => ['supabase-storage', BUCKET, FOLDER, filename] as const,
};

export async function listSuperCVFiles(): Promise<SupabaseStorageFile[]> {
  const { data, error } = await getSupabaseClient().storage.from(BUCKET).list(FOLDER);
  if (error) throw error;
  return (data ?? []).map((file) => ({ name: file.name, path: objectPath(file.name), size: file.metadata?.size, updated_at: file.updated_at }));
}

// UPDATED 2026-08-17 (Reactive Resume schema mapping): OLD returned TreeNode[].
// NEW returns the SuperCVDocument as-is — no transform to/from a generic tree.
export async function loadSuperCVFile(filename: string): Promise<SuperCVDocument> {
  const { data, error } = await getSupabaseClient().storage.from(BUCKET).download(objectPath(filename));
  if (error) throw error;
  return JSON.parse(await data.text()) as SuperCVDocument; // validate with Zod before storing in production
}

export async function getAvailableExportFilename(baseName: string): Promise<string> {
  const names = new Set((await listSuperCVFiles()).map((file) => file.name.toLowerCase()));
  const initial = `${baseName}.JSON`;
  if (!names.has(initial.toLowerCase())) return initial;
  for (let suffix = 1; suffix <= 99; suffix += 1) {
    const candidate = `${baseName}${String(suffix).padStart(2, '0')}.JSON`;
    if (!names.has(candidate.toLowerCase())) return candidate;
  }
  throw new Error('Export failed: too many files with this name. Please choose a different name.');
}

// `content` here is already the PRUNED document produced by buildExportDocument()
// (P07) — this function only uploads; it does not know about `hidden` at all.
export async function uploadSuperCVFile(filename: string, content: SuperCVDocument): Promise<void> {
  const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
  const { error } = await getSupabaseClient().storage.from(BUCKET).upload(objectPath(filename), blob, { upsert: false });
  if (error) throw error;
}
```

```typescript
// features/resume/hooks/useSuperCVStorage.ts
import { useMutation, useQuery } from '@tanstack/react-query';
import type { SuperCVDocument } from '@/types/superCV';
import { superCVKeys, listSuperCVFiles, loadSuperCVFile, uploadSuperCVFile, getAvailableExportFilename } from '../api/supercvStorageApi';

export function useSuperCVFiles() { return useQuery({ queryKey: superCVKeys.files, queryFn: listSuperCVFiles }); }
export function useLoadSuperCV(filename: string) { return useQuery({ queryKey: superCVKeys.load(filename), queryFn: () => loadSuperCVFile(filename), enabled: Boolean(filename) }); }
export function useExportSuperCV() { return useMutation({ mutationFn: ({ filename, content }: { filename: string; content: SuperCVDocument }) => uploadSuperCVFile(filename, content) }); }
export function useAvailableExportFilename() { return useMutation({ mutationFn: getAvailableExportFilename }); }
```

---

## P07 — Export Flow Pattern

> **UPDATED 2026-08-17 (Reactive Resume schema mapping):** OLD — P07 called `getSelectedSubset()`, which filtered a generic `TreeNode[]` by its `selected` flag. NEW — `buildExportDocument()` deep-clones the live `SuperCVDocument` and physically removes anything whose `hidden === true`, leaving `basics`/`picture`/`metadata` untouched (SPEC.md §3.3.5, DECISIONS.md ADR-018).

```typescript
// features/resume/utils/buildExportDocument.ts
import type { SuperCVDocument, SuperCVSection } from '@/types/superCV';

// Prunes hidden items out of a section's items[], and reports whether the
// section itself should be dropped (hidden itself, or left with no items).
function pruneSection(section: SuperCVSection): SuperCVSection | null {
  if (section.hidden) return null;
  const items = section.items.filter((item) => !item.hidden);
  if (items.length === 0) return null;
  return { ...section, items };
}

// Deep-clones the loaded document and removes every hidden section/item.
// basics, picture, and metadata are copied through completely unchanged —
// they were never part of the selectable tree (SPEC.md §3.3.3).
export function buildExportDocument(doc: SuperCVDocument): SuperCVDocument {
  const clone = structuredClone(doc);
  const prunedSections: SuperCVDocument['sections'] = {};
  (Object.keys(clone.sections) as Array<keyof SuperCVDocument['sections']>).forEach((key) => {
    const section = clone.sections[key];
    if (!section) return;
    const pruned = pruneSection(section);
    if (pruned) prunedSections[key] = pruned;
  });
  const prunedCustomSections = clone.customSections
    .map(pruneSection)
    .filter((section): section is SuperCVDocument['customSections'][number] => section !== null);
  return { ...clone, sections: prunedSections, customSections: prunedCustomSections };
}

export function hasAnySelectedContent(doc: SuperCVDocument): boolean {
  const exported = buildExportDocument(doc);
  return Object.keys(exported.sections).length > 0 || exported.customSections.length > 0;
}
```

```typescript
// features/resume/components/MainScreen.tsx (export logic)
import { useState } from 'react';
import { useResumeStore } from '../stores/resumeStore';
import { useExportSuperCV, useAvailableExportFilename } from '../hooks/useSuperCVStorage';
import { buildExportDocument, hasAnySelectedContent } from '../utils/buildExportDocument';
import { ExportDialog } from './ExportDialog';
import { useMessage } from '@/hooks/useMessage';

export function MainScreen() {
  const [exportOpen, setExportOpen] = useState(false);
  const { superCV } = useResumeStore();
  const exportMutation = useExportSuperCV();
  const filenameMutation = useAvailableExportFilename();
  const { showSuccess, showError } = useMessage();
  const handleExport = async (baseName: string) => {
    if (!superCV || !hasAnySelectedContent(superCV)) return showError('No nodes selected. Please select at least one node to export.');
    try {
      const filename = await filenameMutation.mutateAsync(baseName);
      await exportMutation.mutateAsync({ filename, content: buildExportDocument(superCV) });
      showSuccess(`CV exported successfully as ${filename}`);
    } catch { showError('Export failed. Please try again.'); }
  };
  return <div id="s002-container"><ScreenBadge screenId="S002" />
    <Button id="s002-export" onClick={() => setExportOpen(true)}>Export</Button>
    <ExportDialog open={exportOpen} onOpenChange={setExportOpen} onExport={handleExport} />
  </div>;
}
```

> **UPDATED 2026-08-17 (Supabase migration):** OLD — P07 checked and exported through GIST mutations. NEW — it lists `Applai/SuperCV` to choose the collision-free name and uploads the JSON Blob to the same folder with `upsert: false`.

---

## P08 — Error Handling Pattern

```typescript
// hooks/useMessage.ts — SMSG wrapper for easy triggering
import { useState, useCallback } from 'react';
import { MessageType } from '@/components/common/MessagePopup';

interface MessageState {
  open: boolean;
  type: MessageType;
  title?: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  persistent?: boolean;
}

export function useMessage() {
  const [msg, setMsg] = useState<MessageState>({
    open: false,
    type: 'info',
    message: '',
  });

  const show = useCallback(
    (type: MessageType, message: string, options?: Omit<MessageState, 'open' | 'type' | 'message'>) => {
      setMsg({ open: true, type, message, ...options });
    },
    []
  );

  const hide = useCallback(() => setMsg((prev) => ({ ...prev, open: false })), []);

  return {
    msg,
    hide,
    showError: (message: string, opts?: Omit<MessageState, 'open' | 'type' | 'message'>) =>
      show('error', message, opts),
    showWarning: (message: string, opts?: Omit<MessageState, 'open' | 'type' | 'message'>) =>
      show('warning', message, opts),
    showSuccess: (message: string, opts?: Omit<MessageState, 'open' | 'type' | 'message'>) =>
      show('success', message, opts),
    showInfo: (message: string, opts?: Omit<MessageState, 'open' | 'type' | 'message'>) =>
      show('info', message, opts),
  };
}
```

### API Error Handler

> **UPDATED 2026-08-17 (Supabase migration):** OLD — API errors used the custom `{ error: { code, message } }` response envelope. NEW — auth handlers also recognize Supabase `AuthApiError` status/message and Storage errors; normalize them before invoking SMSG.

```typescript
// lib/apiErrorHandler.ts
import { useMessage } from '@/hooks/useMessage';

export function handleApiError(error: unknown) {
  const { showError } = useMessage();

  if (error && typeof error === 'object' && 'error' in error) {
    const apiError = error as { error: { message: string; code: string } };
    showError(apiError.error.message, { persistent: apiError.error.code === 'VALIDATION_ERROR' });
  } else if (error instanceof Error) {
    showError(error.message);
  } else {
    showError('An unexpected error occurred. Please try again.');
  }
}
```

---

## P09 — Logout Confirmation Pattern

> **Fixed 2026-08-17:** Previously called `logoutMutation.mutate()`, which invoked `POST /api/auth/logout` — contradicting SPEC.md §3.6.4 / TECH.md §7 / DECISIONS.md ADR-014 ("LOGOUT does NOT call the server"). `useLogout()` (P02) is now a plain callback, not a mutation.

```typescript
// features/auth/components/LogoutButton.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLogout } from '../hooks/useAuth';
import { MessagePopup } from '@/components/common/MessagePopup';

export function LogoutButton() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const performLogout = useLogout();

  const handleConfirm = () => {
    setConfirmOpen(false);
    performLogout(); // client-side only: abortAllRequests -> clearAuth -> redirect to S000
  };

  return (
    <>
      <Button
        id="s002-logout"
        variant="ghost"
        onClick={() => setConfirmOpen(true)}
      >
        LOGOUT
      </Button>
      <MessagePopup
        type="warning"
        title="Confirm Logout"
        message="Are you sure you want to logout? Any unsaved changes will be lost."
        actionLabel="Logout"
        onAction={handleConfirm}
        persistent
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
      />
    </>
  );
}
```

---

## P10 — Spinner / Loading Pattern

```typescript
// components/common/Spinner.tsx
import { cn } from '@/lib/utils';

interface SpinnerProps {
  size?: number;
  className?: string;
}

export function Spinner({ size = 32, className }: SpinnerProps) {
  return (
    <div
      className={cn('animate-spin rounded-full border-2 border-primary border-t-transparent', className)}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
```

---

## P11 — Password Toggle Pattern

```typescript
// features/auth/components/PasswordToggle.tsx
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PasswordToggleProps {
  inputId: string;
}

export function PasswordToggle({ inputId }: PasswordToggleProps) {
  const [visible, setVisible] = useState(false);

  const toggle = () => {
    const input = document.getElementById(inputId) as HTMLInputElement;
    if (input) {
      input.type = visible ? 'password' : 'text';
      setVisible(!visible);
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="absolute right-2 top-1/2 -translate-y-1/2"
      onClick={toggle}
      aria-label={visible ? 'Hide password' : 'Show password'}
    >
      {visible ? <EyeOff size={16} /> : <Eye size={16} />}
    </Button>
  );
}
```

---

## P13 — EXIT Button Pattern

> Added 2026-08-17 to close a gap: SPEC.md §3.2.3 / §3.6.3 fully specifies EXIT (on both S001 and S002) but PATTERNS.md had no corresponding pattern. EXIT is a hard termination — no cleanup, no server call, no waiting for pending transactions (TECH.md §7).

```typescript
// features/auth/components/ExitButton.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessagePopup } from '@/components/common/MessagePopup';
import { abortAllRequests } from '@/lib/api';

export function ExitButton({ id = 's002-exit' }: { id?: string }) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleConfirm = () => {
    setConfirmOpen(false);
    abortAllRequests(); // TECH.md §8 — no pending transactions are waited for
    if (typeof window.close === 'function') {
      window.close();
    }
    // Fallback if the browser blocks window.close() (e.g., tab not opened by script)
    window.location.href = 'about:blank';
  };

  return (
    <>
      <Button id={id} variant="secondary" onClick={() => setConfirmOpen(true)}>
        EXIT
      </Button>
      <MessagePopup
        type="warning"
        title="Confirm Exit"
        message="Are you sure you want to exit the application? Any unsaved changes will be lost."
        actionLabel="Exit"
        onAction={handleConfirm}
        persistent
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
      />
    </>
  );
}
```

**Usage:** Rendered as `s001-exit` on S001 (P03 LoginForm) and `s002-exit` on S002 (MainScreen), per TECH.md §3 Feature-to-Screen Mapping.

---

## P14 — CANCEL Button Pattern (Transaction Abort / Node Reset)

> Added 2026-08-17 to close a gap: SPEC.md §3.6.5 defines three distinct CANCEL cases (running transaction / dirty tree / nothing to cancel) with no prior pattern.
>
> **UPDATED 2026-08-17 (Reactive Resume schema mapping):** OLD — `isDirty`/`resetAllToSelected` were separate flags on the generic tree store, backed by a recursive `setAllSelected()` helper. NEW — P05's `useResumeStore` already provides `isDirty()` (compares `superCV` against `pristineSuperCV`) and `resetToPristine()` (re-applies `forceAllHiddenFalse` to the pristine copy) — no separate helper is needed here.

```typescript
// features/resume/components/CancelButton.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessagePopup } from '@/components/common/MessagePopup';
import { abortAllRequests } from '@/lib/api';
import { useResumeStore } from '../stores/resumeStore';
import { useMessage } from '@/hooks/useMessage';

interface CancelButtonProps {
  isTransactionRunning: boolean; // true if any import/export/settings-save/reachability call is in flight
}

export function CancelButton({ isTransactionRunning }: CancelButtonProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { isDirty, resetToPristine } = useResumeStore();
  const { showInfo } = useMessage();

  const handleClick = () => {
    // Case C — nothing to cancel: auto-dismiss info, no confirmation needed
    if (!isTransactionRunning && !isDirty()) {
      showInfo('Nothing to cancel.');
      return;
    }
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    setConfirmOpen(false);
    if (isTransactionRunning) {
      // Case A — abort in-flight requests, stop spinners, return to idle S002
      abortAllRequests();
      return;
    }
    // Case B — discard modifications: reset every section/item hidden flag to false, revert edits
    resetToPristine();
  };

  const message = isTransactionRunning
    ? 'Cancel running transactions? All pending operations will be aborted.'
    : 'Discard all modifications and reset all nodes to selected?';

  return (
    <>
      <Button id="s002-cancel" variant="secondary" onClick={handleClick}>
        CANCEL
      </Button>
      <MessagePopup
        type="warning"
        title="Confirm Cancel"
        message={message}
        actionLabel="Confirm"
        onAction={handleConfirm}
        persistent
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
      />
    </>
  );
}
```

**Rule (SPEC.md §3.6.5):** CANCEL never navigates away from S002 — it only aborts requests or resets tree state in place.

---

## P15 — S002D2 Import Dialogue Pattern

> **UPDATED 2026-08-17 (Supabase migration):** OLD — the dialog had a `gistUrl` schema field and URL prefill cascade. NEW — it is a fixed `Applai/SuperCV` file picker populated from P06; there is no URL input, URL validation, or `gistUrl` state.

```typescript
// features/resume/components/ImportDialog.tsx
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ScreenBadge } from '@/components/common/ScreenBadge';
import { useSuperCVFiles } from '../hooks/useSuperCVStorage';
import { loadSuperCVFile } from '../api/supercvStorageApi';
import { useResumeStore } from '../stores/resumeStore';
import { useMessage } from '@/hooks/useMessage';

const importSchema = z.object({ filename: z.string().min(3).max(60).regex(/^[a-zA-Z0-9_.-]+$/) });
type ImportFormData = z.infer<typeof importSchema>;
interface ImportDialogProps { open: boolean; onOpenChange: (open: boolean) => void; defaultFilename?: string; }

export function ImportDialog({ open, onOpenChange, defaultFilename = '' }: ImportDialogProps) {
  const { register, handleSubmit, reset, formState: { errors, isValid } } = useForm<ImportFormData>({ resolver: zodResolver(importSchema), defaultValues: { filename: defaultFilename }, mode: 'onBlur' });
  const filesQuery = useSuperCVFiles();
  const { setSuperCV, setStorageFilename } = useResumeStore();
  const { showSuccess, showError } = useMessage();
  useEffect(() => {
    if (!open || !filesQuery.data) return;
    const jsonNames = filesQuery.data.filter((f) => f.name.toLowerCase().endsWith('.json')).map((f) => f.name);
    reset({ filename: jsonNames.includes(defaultFilename) ? defaultFilename : jsonNames[0] ?? '' });
  }, [open, filesQuery.data, defaultFilename, reset]);
  const onSubmit = async ({ filename }: ImportFormData) => {
    try { const doc = await loadSuperCVFile(filename); setSuperCV(doc); setStorageFilename(filename); onOpenChange(false); showSuccess(`SuperCV file loaded: ${filename}`); }
    catch { showError('SuperCV folder or selected file is not accessible. Please try another file.'); }
  };
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="sm:max-w-[420px]">
    <ScreenBadge screenId="S002D2" /><DialogHeader><DialogTitle id="s002d2-title">Import Master CV</DialogTitle>
    <DialogDescription id="s002d2-prompt">Choose a file from Supabase Storage: Applai/SuperCV.</DialogDescription></DialogHeader>
    <form onSubmit={handleSubmit(onSubmit)} noValidate><Label htmlFor="s002d2-filename">SuperCV File Name</Label>
      <select id="s002d2-filename" {...register('filename')} aria-invalid={errors.filename ? 'true' : 'false'}>
        <option value="">Select a JSON file</option>{filesQuery.data?.filter((f) => f.name.toLowerCase().endsWith('.json')).map((f) => <option key={f.path} value={f.name}>{f.name}</option>)}
      </select>{errors.filename && <span id="s002d2-filename-error">Select a valid file from the SuperCV folder.</span>}
      <DialogFooter><Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit" disabled={!isValid || filesQuery.isLoading}>Import</Button></DialogFooter>
    </form></DialogContent></Dialog>;
}
```

**Auto-open on S002 mount (SPEC.md §3.5.6):** when `superCV === null` after the 500ms mount delay, set `isImportOpen = true`; on cancellation show *"No SuperCV master file loaded. Click 'Load from SuperCV' to import."*

> **UPDATED 2026-08-17 (Reactive Resume schema mapping):** OLD — `setMasterCV(nodes)` stored a generic `TreeNode[]`; the mount check was `masterCV === null`. NEW — `setSuperCV(doc)` stores the real document and forces every `hidden` to `false` (SPEC.md §3.5.5); the mount check is `superCV === null`.

---

## P16 — S002S1 Settings Panel Pattern

> **UPDATED 2026-08-17 (Supabase migration):** OLD — `UserSettings` and settings API persisted `gistUrl` and fetched GIST content. NEW — settings contain only `masterResumeFile` and `preferredCvName`; use an RLS-scoped Supabase settings table when persistence is implemented.

```typescript
// features/resume/api/settingsApi.ts
import { getSupabaseClient } from '@/lib/supabase';
export interface UserSettings { masterResumeFile?: string; preferredCvName?: string; }
export const settingsKeys = { settings: ['user', 'settings'] as const };

export async function getUserSettings(): Promise<UserSettings> {
  const { data: { user } } = await getSupabaseClient().auth.getUser();
  if (!user) throw new Error('Unauthenticated');
  const { data, error } = await getSupabaseClient().from('user_settings').select('master_resume_file, preferred_cv_name').eq('user_id', user.id).maybeSingle();
  if (error) throw error;
  return { masterResumeFile: data?.master_resume_file ?? undefined, preferredCvName: data?.preferred_cv_name ?? undefined };
}
export async function patchUserSettings(patch: Partial<UserSettings>): Promise<UserSettings> {
  const { data: { user } } = await getSupabaseClient().auth.getUser(); if (!user) throw new Error('Unauthenticated');
  const { error } = await getSupabaseClient().from('user_settings').upsert({ user_id: user.id, master_resume_file: patch.masterResumeFile ?? null, preferred_cv_name: patch.preferredCvName ?? null });
  if (error) throw error; return patch;
}
```

```typescript
// features/resume/hooks/useSettings.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { settingsKeys, getUserSettings, patchUserSettings, type UserSettings } from '../api/settingsApi';
export function useUserSettings() { return useQuery({ queryKey: settingsKeys.settings, queryFn: getUserSettings }); }
export function useSaveSettings() { const queryClient = useQueryClient(); return useMutation({ mutationFn: (patch: Partial<UserSettings>) => patchUserSettings(patch), onSuccess: (data) => queryClient.setQueryData(settingsKeys.settings, data) }); }
```

**Dirty-check:** `SettingsPanel.tsx` tracks `formState.isDirty` and routes Cancel/Escape/Overlay-click through the P04 `MessagePopup` confirmation. Never reintroduce a storage-URL setting: the folder stays `Applai/SuperCV`.

---

## P17 — File Naming Convention

| Type | Pattern | Example |
|------|---------|---------|
| Component | PascalCase.tsx | `LoginPopup.tsx`, `TreeView.tsx`, `ImportDialog.tsx`, `SettingsPanel.tsx`, `ExitButton.tsx`, `CancelButton.tsx` |
| Hook | use[camelCase].ts | `useAuth.ts`, `useSuperCVStorage.ts`, `useSettings.ts`, `useTreeView.ts` |
| Store | [feature]Store.ts | `authStore.ts`, `resumeStore.ts` |
| API | [feature]Api.ts | `authApi.ts`, `supercvStorageApi.ts`, `settingsApi.ts` |
| Type | [Name].ts or inline | `SuperCVDocument`, `SectionRegistryEntry`, `User`, `UserSettings` |
| Utility | camelCase.ts | `apiErrorHandler.ts`, `superCVTree.ts`, `buildExportDocument.ts` |
| Test | [Name].test.tsx | `LoginForm.test.tsx` |
| Route component | [Name]Screen.tsx | `WelcomeScreen.tsx`, `MainScreen.tsx` |

---

## P18 — TestMode Pattern

> Added 2026-08-19 to implement CR002 (`CHANGES/REQUESTS/CR000/CR002-Adding a TestMode Core Principle.md`), per the concept in `DEV_GUIDES/Architecture/TestMode-Concept.md`. The Debug Panel UI component described by the Concept's Design Rule 5 is intentionally **deferred** — only the central flag module, fixtures, and logger are implemented by this pass; `test.debugPanel` exists as a stable flag for that follow-up.

```typescript
// config/testmode.ts — single source of truth; never scatter
// `import.meta.env.VITE_TESTMODE` checks elsewhere in the codebase.
const IS_DEV_BUILD: boolean = import.meta.env.DEV; // Layer 0 hard gate

function resolveTestMode(): boolean {
  if (!IS_DEV_BUILD) return false;
  const url = new URLSearchParams(window.location.search);
  if (url.has('test')) return url.get('test') === '1';      // Layer 2: ?test=1
  const stored = window.localStorage.getItem('testmode');
  if (stored !== null) return stored === '1';                // Layer 2: localStorage
  return import.meta.env.VITE_TESTMODE === 'yes';            // Layer 1: .env.local
}

export const test: TestModeConfig = {
  enabled: resolveTestMode(),
  authPrefill: flag(import.meta.env.VITE_TEST_AUTH_PREFILL, true),
  debugPanel: flag(import.meta.env.VITE_TEST_DEBUG_PANEL, true), // flag only — panel UI deferred
  logLevel: resolveLogLevel(),
};
```

```typescript
// config/testFixtures.ts — dynamic-imported only, never statically, so
// bundlers tree-shake it out of production.
export const authPrefill = { email: 'tester@example.com', password: 'Test1234567!' };
```

```typescript
// features/auth/components/LoginPopup.tsx — applied via react-hook-form's
// reset(), not the Concept's illustrative form.fill().
useEffect(() => {
  if (!test.enabled || !test.authPrefill) return;
  let cancelled = false;
  void (async () => {
    const { authPrefill } = await import('@/config/testFixtures');
    if (!cancelled) reset({ email: authPrefill.email, password: authPrefill.password, rememberMe: false });
  })();
  return () => { cancelled = true; };
}, [reset]);
```

```typescript
// utils/logger.ts — leveled logger driven by test.logLevel; outside TestMode
// the threshold is forced to 'warn' regardless of any stray .env value.
const threshold = LEVELS[test.enabled ? test.logLevel : 'warn'];
export const log = {
  debug: (...args: unknown[]) => emit('debug', '[DBG]', args),
  info:  (...args: unknown[]) => emit('info', '[INF]', args),
  warn:  (...args: unknown[]) => emit('warn', '[WARN]', args),
  error: (...args: unknown[]) => emit('error', '[ERR]', args),
};
```

**Usage in `lib/apiErrorHandler.ts` (P08):** `if (test.enabled) log.debug('[apiErrorHandler]', error);` runs before the existing `show()` calls — additional diagnostics only, the production message contract is unchanged.

**Env vars (optional, dev-only):** `VITE_TESTMODE`, `VITE_TEST_LOG_LEVEL`, `VITE_TEST_AUTH_PREFILL`, `VITE_TEST_DEBUG_PANEL` — documented in `.env.example`; real values belong only in the user's own gitignored `.env.local`.

---

**End of Patterns**
