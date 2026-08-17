# PATTERNS.md :: Reusable Code Patterns for Applai Resume Generator

* -> Use these patterns when implementing any feature from SPEC.md.
* -> Never deviate from these patterns without updating this file.

> **Compliance pass (2026-08-17):** Reconciled against SPEC.md v1.0.3 and TECH.md v1.0.3. Fixes applied:
> 1. **P02/P09 LOGOUT bug removed** — the old `useLogout()`/`LogoutButton` pattern called `POST /api/auth/logout`, contradicting TECH.md §7 and SPEC.md §3.6.4 ("LOGOUT does NOT call the server") and DECISIONS.md ADR-014. Fixed to be client-side-only.
> 2. **AbortController wiring added** to `lib/api.ts` per TECH.md §8 (`createRequestSignal`/`abortAllRequests`), referenced by DECISIONS.md ADR-012.
> 3. **P06 GIST API fixed** — `listGistFiles()` and `loadGistFile()` were missing the required `gistUrl` query parameter mandated by TECH.md §6's API contract.
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

### Auth Zustand Store

```typescript
// features/auth/stores/authStore.ts
import { create } from 'zustand';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,
  setAuth: (user, accessToken) => set({ user, accessToken, isAuthenticated: true, isLoading: false }),
  clearAuth: () => set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
}));
```

### API Client with Interceptor

```typescript
// lib/api.ts
import { useAuthStore } from '@/features/auth/stores/authStore';

const API_BASE = import.meta.env.VITE_API_URL;

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const { accessToken } = useAuthStore.getState();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    ...((options.headers as Record<string, string>) || {}),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include', // httpOnly cookies
  });

  if (response.status === 401) {
    // Try refresh
    const refreshed = await refreshAccessToken();
    if (!refreshed) {
      useAuthStore.getState().clearAuth();
      window.location.href = '/';
      throw new Error('Session expired');
    }
    // Retry original request
    return apiClient(endpoint, options);
  }

  if (!response.ok) {
    const error = await response.json();
    throw error;
  }

  return response.json();
}

async function refreshAccessToken(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/validate`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) return false;
    const data = await res.json();
    useAuthStore.getState().setAuth(data.user, data.accessToken);
    return true;
  } catch {
    return false;
  }
}

// --- Request cancellation (TECH.md §8) ---------------------------------
// EXIT, LOGOUT, and CANCEL call abortAllRequests() before executing their
// primary action. Every caller of apiClient() that wants to be cancellable
// must obtain a signal via createRequestSignal() and pass it through options.
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

### TanStack Query Auth Hooks

```typescript
// features/auth/api/authApi.ts
import { apiClient } from '@/lib/api';
import { useAuthStore } from '../stores/authStore';

export const authKeys = {
  health: ['health'] as const,
  validate: ['validate'] as const,
  user: ['user'] as const,
};

export async function checkHealth() {
  return apiClient<{ status: string }>('/api/health');
}

export async function login(credentials: { email: string; password: string; captchaToken?: string }) {
  return apiClient<{ user: User; accessToken: string }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

export async function validateSession() {
  return apiClient<{ user: User; accessToken: string }>('/api/auth/validate', {
    method: 'POST',
  });
}

// NOTE (DECISIONS.md ADR-014): This function is defined for API-contract
// completeness (TECH.md §6) and possible future use (e.g., refresh-token
// revocation), but it must NOT be called from the LOGOUT button flow.
// LOGOUT is client-side-only — see useLogout() below.
export async function logout() {
  return apiClient<void>('/api/auth/logout', { method: 'POST' });
}
```

```typescript
// features/auth/hooks/useAuth.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authKeys, checkHealth, login, validateSession, logout } from '../api/authApi';
import { useAuthStore } from '../stores/authStore';
import { abortAllRequests } from '@/lib/api';

export function useHealthCheck() {
  return useQuery({
    queryKey: authKeys.health,
    queryFn: checkHealth,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 4000),
  });
}

export function useValidateSession() {
  const setAuth = useAuthStore((s) => s.setAuth);
  return useQuery({
    queryKey: authKeys.validate,
    queryFn: async () => {
      const data = await validateSession();
      setAuth(data.user, data.accessToken);
      return data;
    },
    retry: false,
    staleTime: Infinity,
  });
}

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
      queryClient.invalidateQueries({ queryKey: authKeys.validate });
    },
  });
}

// LOGOUT is client-side-only per SPEC.md §3.6.4 / TECH.md §7 / DECISIONS.md
// ADR-014: no server call, no waiting for pending transactions. It is a
// plain callback, NOT a TanStack Query mutation — there is nothing to await.
export function useLogout() {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const queryClient = useQueryClient();

  return function performLogout() {
    abortAllRequests(); // TECH.md §8 — abort in-flight requests first
    clearAuth();
    queryClient.clear();
    window.location.href = '/'; // hard redirect to S000
  };
}
```

### ProtectedRoute Guard

```typescript
// features/auth/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center"><Spinner /></div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
```

---

## P03 — Form Pattern (React Hook Form + Zod)

> **Extended 2026-08-17:** Added the `s001-exit` EXIT button, a failed-attempt counter, hCaptcha trigger after 3 failures, and 15-min lockout after 5 failures — all required by SPEC.md §3.2.3 / §1 but missing from the original pattern.

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

  // SPEC.md §1 / §3.2.3: CAPTCHA required after 3 failed attempts, 15-min lockout after 5.
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
        onError: (err: any) => {
          if (err?.status === 429) {
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
          <Label htmlFor="s001-remember">Remember me for 7 days</Label>
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

```typescript
// features/resume/components/TreeView.tsx
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef, useState, useCallback } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronRight, ChevronDown } from 'lucide-react';

export interface TreeNode {
  id: string;
  label: string;
  selected: boolean;
  expanded: boolean;
  info?: string;
  children?: TreeNode[];
}

interface TreeViewProps {
  nodes: TreeNode[];
  displayAll: boolean;
  onToggleSelect: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onUpdateInfo: (id: string, info: string) => void;
}

export function TreeView({
  nodes,
  displayAll,
  onToggleSelect,
  onToggleExpand,
  onUpdateInfo,
}: TreeViewProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  // Flatten visible nodes based on displayAll + expanded state
  const flattenNodes = useCallback((nodeList: TreeNode[], depth = 0): Array<{ node: TreeNode; depth: number }> => {
    const result: Array<{ node: TreeNode; depth: number }> = [];
    for (const node of nodeList) {
      const isVisible = displayAll || node.selected || hasSelectedDescendant(node);
      if (!isVisible) continue;

      result.push({ node, depth });
      if (node.expanded && node.children) {
        result.push(...flattenNodes(node.children, depth + 1));
      }
    }
    return result;
  }, [displayAll]);

  const flatNodes = flattenNodes(nodes);

  const virtualizer = useVirtualizer({
    count: flatNodes.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40,
    overscan: 5,
  });

  return (
    <div ref={parentRef} className="h-[600px] overflow-auto border rounded-lg">
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const { node, depth } = flatNodes[virtualItem.index];
          const hasChildren = node.children && node.children.length > 0;

          return (
            <div
              key={node.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
                paddingLeft: `${depth * 24 + 12}px`,
              }}
              className="flex items-center gap-2 hover:bg-slate-50 border-b border-slate-100"
              onDoubleClick={() => hasChildren && onToggleExpand(node.id)}
            >
              {hasChildren ? (
                <button
                  onClick={() => onToggleExpand(node.id)}
                  className="p-1 hover:bg-slate-200 rounded"
                  aria-label={node.expanded ? 'Collapse' : 'Expand'}
                >
                  {node.expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
              ) : (
                <span className="w-6" />
              )}

              <Checkbox
                checked={node.selected}
                onCheckedChange={() => onToggleSelect(node.id)}
                aria-label={`Select ${node.label}`}
              />

              <span className="text-sm font-medium">{node.label}</span>

              {node.info && (
                <span className="text-xs text-slate-500 ml-2">{node.info}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function hasSelectedDescendant(node: TreeNode): boolean {
  if (!node.children) return false;
  return node.children.some((child) => child.selected || hasSelectedDescendant(child));
}
```

### TreeView State Management (Zustand)

```typescript
// features/resume/stores/resumeStore.ts
import { create } from 'zustand';
import { TreeNode } from '../components/TreeView';

interface ResumeState {
  masterCV: TreeNode[] | null;
  displayAll: boolean;
  setMasterCV: (nodes: TreeNode[]) => void;
  toggleNodeSelect: (id: string) => void;
  toggleNodeExpand: (id: string) => void;
  setDisplayAll: (value: boolean) => void;
  getSelectedSubset: () => TreeNode[];
}

function toggleNodeInTree(nodes: TreeNode[], id: string, key: 'selected' | 'expanded'): TreeNode[] {
  return nodes.map((node) => {
    if (node.id === id) {
      return { ...node, [key]: !node[key] };
    }
    if (node.children) {
      return { ...node, children: toggleNodeInTree(node.children, id, key) };
    }
    return node;
  });
}

function filterSelected(nodes: TreeNode[]): TreeNode[] {
  return nodes
    .filter((n) => n.selected)
    .map((n) => ({
      ...n,
      children: n.children ? filterSelected(n.children) : undefined,
    }));
}

export const useResumeStore = create<ResumeState>((set, get) => ({
  masterCV: null,
  displayAll: false,
  setMasterCV: (nodes) => set({ masterCV: nodes }),
  toggleNodeSelect: (id) =>
    set((state) => ({
      masterCV: state.masterCV ? toggleNodeInTree(state.masterCV, id, 'selected') : null,
    })),
  toggleNodeExpand: (id) =>
    set((state) => ({
      masterCV: state.masterCV ? toggleNodeInTree(state.masterCV, id, 'expanded') : null,
    })),
  setDisplayAll: (value) => set({ displayAll: value }),
  getSelectedSubset: () => {
    const { masterCV } = get();
    return masterCV ? filterSelected(masterCV) : [];
  },
}));
```

---

## P06 — GIST API Pattern

```typescript
// features/resume/api/gistApi.ts
// NOTE: gistUrl is REQUIRED on /api/gist/files and /api/gist/load per
// TECH.md §6's API contract — there is no server-side "default" GIST.
import { apiClient } from '@/lib/api';
import { TreeNode } from '../components/TreeView';

export const gistKeys = {
  files: (gistUrl: string) => ['gist', 'files', gistUrl] as const,
  load: (gistUrl: string, filename: string) => ['gist', 'load', gistUrl, filename] as const,
};

export async function listGistFiles(gistUrl: string) {
  return apiClient<Array<{ filename: string; raw_url: string }>>(
    `/api/gist/files?gistUrl=${encodeURIComponent(gistUrl)}`
  );
}

export async function loadGistFile(gistUrl: string, filename: string) {
  return apiClient<TreeNode[]>(
    `/api/gist/load?gistUrl=${encodeURIComponent(gistUrl)}&filename=${encodeURIComponent(filename)}`
  );
}

export async function checkFilenameExists(prefix: string) {
  return apiClient<{ exists: boolean; nextSuffix?: number }>(
    `/api/gist/check?prefix=${encodeURIComponent(prefix)}`
  );
}

export async function exportGistFile(filename: string, content: TreeNode[]) {
  return apiClient<{ filename: string; url: string }>('/api/gist/export', {
    method: 'POST',
    body: JSON.stringify({ filename, content }),
  });
}
```

```typescript
// features/resume/hooks/useGist.ts
import { useMutation, useQuery } from '@tanstack/react-query';
import { gistKeys, listGistFiles, loadGistFile, checkFilenameExists, exportGistFile } from '../api/gistApi';

export function useGistFiles(gistUrl: string) {
  return useQuery({
    queryKey: gistKeys.files(gistUrl),
    queryFn: () => listGistFiles(gistUrl),
    enabled: !!gistUrl,
  });
}

export function useLoadGist(gistUrl: string, filename: string) {
  return useQuery({
    queryKey: gistKeys.load(gistUrl, filename),
    queryFn: () => loadGistFile(gistUrl, filename),
    enabled: !!gistUrl && !!filename,
  });
}

export function useExportGist() {
  return useMutation({
    mutationFn: ({ filename, content }: { filename: string; content: unknown[] }) =>
      exportGistFile(filename, content as TreeNode[]),
  });
}

export function useCheckFilename() {
  return useMutation({ mutationFn: checkFilenameExists });
}
```

---

## P07 — Export Flow Pattern

```typescript
// features/resume/components/MainScreen.tsx (export logic)
import { useState } from 'react';
import { useResumeStore } from '../stores/resumeStore';
import { useExportGist, useCheckFilename } from '../hooks/useGist';
import { ExportDialog } from './ExportDialog';
import { useMessage } from '@/hooks/useMessage'; // SMSG wrapper

export function MainScreen() {
  const [exportOpen, setExportOpen] = useState(false);
  const { getSelectedSubset } = useResumeStore();
  const exportMutation = useExportGist();
  const checkMutation = useCheckFilename();
  const { showSuccess, showError } = useMessage();

  const handleExport = async (baseName: string) => {
    const selectedNodes = getSelectedSubset();
    if (selectedNodes.length === 0) {
      showError('No nodes selected. Please select at least one node to export.');
      return;
    }

    try {
      // Check for filename collision
      const checkResult = await checkMutation.mutateAsync(baseName);
      let finalName = baseName;

      if (checkResult.exists && checkResult.nextSuffix !== undefined) {
        const suffix = checkResult.nextSuffix.toString().padStart(2, '0');
        finalName = `${baseName}${suffix}`;
      }

      await exportMutation.mutateAsync({
        filename: `${finalName}.JSON`,
        content: selectedNodes,
      });

      showSuccess(`CV exported successfully as ${finalName}.JSON`);
    } catch (err) {
      showError('Export failed. Please try again.');
    }
  };

  return (
    <div id="s002-container">
      <ScreenBadge screenId="S002" />
      {/* ... header, buttons, TVC01 ... */}
      <Button id="s002-export" onClick={() => setExportOpen(true)}>
        Export
      </Button>
      <ExportDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        onExport={handleExport}
      />
    </div>
  );
}
```

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

```typescript
// features/resume/components/CancelButton.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessagePopup } from '@/components/common/MessagePopup';
import { abortAllRequests } from '@/lib/api';
import { useResumeStore } from '../stores/resumeStore';
import { useMessage } from '@/hooks/useMessage';

interface CancelButtonProps {
  isTransactionRunning: boolean; // true if any import/export/settings-save/health call is in flight
}

export function CancelButton({ isTransactionRunning }: CancelButtonProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { isDirty, resetAllToSelected } = useResumeStore();
  const { showInfo } = useMessage();

  const handleClick = () => {
    // Case C — nothing to cancel: auto-dismiss info, no confirmation needed
    if (!isTransactionRunning && !isDirty) {
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
    // Case B — discard modifications: reset every node to selected, revert text edits
    resetAllToSelected();
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

**Required store additions** (`features/resume/stores/resumeStore.ts`, extending P05's `useResumeStore`):

```typescript
// Add to ResumeState in P05:
interface ResumeState {
  // ...existing fields from P05...
  isDirty: boolean; // true if any node was deselected or any info text edited since load
  resetAllToSelected: () => void;
}

function setAllSelected(nodes: TreeNode[]): TreeNode[] {
  return nodes.map((n) => ({
    ...n,
    selected: true,
    children: n.children ? setAllSelected(n.children) : undefined,
  }));
}

// Inside create<ResumeState>((set, get) => ({ ... })):
//   resetAllToSelected: () =>
//     set((state) => ({
//       masterCV: state.masterCV ? setAllSelected(state.masterCV) : null,
//       isDirty: false,
//     })),
```

**Rule (SPEC.md §3.6.5):** CANCEL never navigates away from S002 — it only aborts requests or resets tree state in place.

---

## P15 — S002D2 Import Dialogue Pattern

> Added 2026-08-17 to close a gap: SPEC.md §3.5 fully specifies S002D2 (GIST URL + filename entry, pre-fill cascade, auto-fetch file list, error handling) but no pattern existed for it, despite TECH.md §2 listing `ImportDialog.tsx` and `useGist`/`useSettings` as required files.

```typescript
// features/resume/components/ImportDialog.tsx
import { useEffect } from 'react';
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
import { ScreenBadge } from '@/components/common/ScreenBadge';
import { useGistFiles, useLoadGist } from '../hooks/useGist';
import { useResumeStore } from '../stores/resumeStore';
import { useMessage } from '@/hooks/useMessage';

const importSchema = z.object({
  gistUrl: z
    .string()
    .min(1, 'Please enter a valid HTTPS URL.')
    .max(500)
    .regex(/^https:\/\/[a-zA-Z0-9._~:/?#[\]@!$&'()*+,;=-]+$/, 'Please enter a valid HTTPS URL.'),
  filename: z
    .string()
    .min(3, 'Filename must be 3\u201360 characters.')
    .max(60, 'Filename must be 3\u201360 characters.')
    .regex(/^[a-zA-Z0-9_.-]+$/, 'Only letters, numbers, dots, hyphens, and underscores allowed.'),
});

type ImportFormData = z.infer<typeof importSchema>;

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultGistUrl?: string; // pre-fill cascade result: session cache -> user settings -> VITE_DEFAULT_GIST_URL
  defaultFilename?: string;
}

export function ImportDialog({ open, onOpenChange, defaultGistUrl = '', defaultFilename = '' }: ImportDialogProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isValid },
  } = useForm<ImportFormData>({
    resolver: zodResolver(importSchema),
    defaultValues: { gistUrl: defaultGistUrl, filename: defaultFilename },
    mode: 'onBlur',
  });

  const gistUrl = watch('gistUrl');
  const { setMasterCV, setGistSource } = useResumeStore();
  const { showSuccess, showError } = useMessage();

  // Auto-fetch file list on valid URL; populate filename with first *.JSON file found
  const filesQuery = useGistFiles(gistUrl && importSchema.shape.gistUrl.safeParse(gistUrl).success ? gistUrl : '');
  useEffect(() => {
    if (filesQuery.data?.length && !defaultFilename) {
      const firstJson = filesQuery.data.find((f) => f.filename.toLowerCase().endsWith('.json'));
      if (firstJson) setValue('filename', firstJson.filename);
    }
  }, [filesQuery.data, defaultFilename, setValue]);

  useEffect(() => {
    if (open) reset({ gistUrl: defaultGistUrl, filename: defaultFilename });
  }, [open, defaultGistUrl, defaultFilename, reset]);

  const loadMutation = useLoadGist(gistUrl, watch('filename'));

  const handleCancel = () => onOpenChange(false); // no side effects (SPEC §3.5.3)

  const onSubmit = async (data: ImportFormData) => {
    try {
      // GET /api/gist/load?gistUrl={url}&filename={name} — see P06/P15
      const nodes = await loadMutation.refetch();
      if (!nodes.data) throw new Error('EMPTY');
      setMasterCV(nodes.data); // all nodes default selected = true (SPEC §3.5.5)
      setGistSource(data.gistUrl, data.filename); // cache for future pre-fill
      onOpenChange(false);
      showSuccess(`MasterResume loaded: ${data.filename}`);
    } catch {
      showError('GIST not found or not accessible. Please check the URL and try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[420px]">
        <ScreenBadge screenId="S002D2" />
        <DialogHeader>
          <DialogTitle id="s002d2-title">Import Master CV</DialogTitle>
          <DialogDescription id="s002d2-prompt">
            Please enter the GIST URL and then choose a file for import.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="s002d2-url">GIST URL</Label>
              <Input
                id="s002d2-url"
                placeholder="https://gist.github.com/..."
                aria-invalid={errors.gistUrl ? 'true' : 'false'}
                aria-describedby={errors.gistUrl ? 's002d2-url-error' : undefined}
                {...register('gistUrl')}
              />
              {errors.gistUrl && (
                <span id="s002d2-url-error" className="text-sm text-red-500">
                  {errors.gistUrl.message}
                </span>
              )}
            </div>
            <div>
              <Label htmlFor="s002d2-filename">MasterResume File Name</Label>
              <Input
                id="s002d2-filename"
                placeholder="MasterResume.json"
                aria-invalid={errors.filename ? 'true' : 'false'}
                aria-describedby={errors.filename ? 's002d2-filename-error' : undefined}
                {...register('filename')}
              />
              {errors.filename && (
                <span id="s002d2-filename-error" className="text-sm text-red-500">
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
              Import
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

**Auto-open on S002 mount (SPEC.md §3.5.6):** In `MainScreen.tsx`, when `masterCV === null` after the 500ms mount delay, set `isImportOpen = true` in the Zustand `ui` slice (TECH.md §8). If the user cancels without importing, show a persistent `SMSG type: info` — *"No MasterResume loaded. Click 'Load from GIST' to import."*

---

## P16 — S002S1 Settings Panel Pattern

> Added 2026-08-17 to close a gap: SPEC.md §3.8 fully specifies S002S1 but TECH.md §2's `useSettings` hook and `SettingsPanel.tsx` had no pattern.

```typescript
// features/resume/api/settingsApi.ts
import { apiClient } from '@/lib/api';

export interface UserSettings {
  gistUrl?: string;
  masterResumeFile?: string;
  preferredCvName?: string;
}

export const settingsKeys = { settings: ['user', 'settings'] as const };

export async function getUserSettings() {
  return apiClient<UserSettings>('/api/user/settings');
}

export async function patchUserSettings(patch: Partial<UserSettings>) {
  return apiClient<UserSettings>('/api/user/settings', {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
}
```

```typescript
// features/resume/hooks/useSettings.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { settingsKeys, getUserSettings, patchUserSettings, UserSettings } from '../api/settingsApi';

export function useUserSettings() {
  return useQuery({ queryKey: settingsKeys.settings, queryFn: getUserSettings });
}

export function useSaveSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<UserSettings>) => patchUserSettings(patch),
    onSuccess: (data) => {
      queryClient.setQueryData(settingsKeys.settings, data);
    },
  });
}
```

**Dirty-check on Cancel/Escape/Overlay-click (SPEC.md §3.8.3):** `SettingsPanel.tsx` must track React Hook Form's `formState.isDirty` and, if dirty, route Cancel/Escape/Overlay-click through a confirmation `MessagePopup` ("You have unsaved changes. Discard them?") before closing — reuse the P04 `MessagePopup` pattern rather than closing immediately (unlike P04's `ExportDialog`, which has no dirty state to guard).

---

## P17 — File Naming Convention

| Type | Pattern | Example |
|------|---------|---------|
| Component | PascalCase.tsx | `LoginPopup.tsx`, `TreeView.tsx`, `ImportDialog.tsx`, `SettingsPanel.tsx`, `ExitButton.tsx`, `CancelButton.tsx` |
| Hook | use[camelCase].ts | `useAuth.ts`, `useGist.ts`, `useSettings.ts`, `useTreeView.ts` |
| Store | [feature]Store.ts | `authStore.ts`, `resumeStore.ts` |
| API | [feature]Api.ts | `authApi.ts`, `gistApi.ts`, `settingsApi.ts` |
| Type | [Name].ts or inline | `TreeNode`, `User`, `UserSettings` |
| Utility | camelCase.ts | `apiErrorHandler.ts` |
| Test | [Name].test.tsx | `LoginForm.test.tsx` |
| Route component | [Name]Screen.tsx | `WelcomeScreen.tsx`, `MainScreen.tsx` |

---

**End of Patterns**
