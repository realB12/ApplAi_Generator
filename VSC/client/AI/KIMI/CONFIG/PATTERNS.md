# PATTERNS.md :: Reusable Code Patterns for Applai Resume Generator

* -> Use these patterns when implementing any feature from SPEC.md.
* -> Never deviate from these patterns without updating this file.

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

export async function logout() {
  return apiClient<void>('/api/auth/logout', { method: 'POST' });
}
```

```typescript
// features/auth/hooks/useAuth.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authKeys, checkHealth, login, validateSession, logout } from '../api/authApi';
import { useAuthStore } from '../stores/authStore';

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

export function useLogout() {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
      window.location.href = '/';
    },
  });
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

```typescript
// features/auth/components/LoginForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

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
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { rememberMe: false },
  });

  const loginMutation = useLogin();

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
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

        <Button type="submit" disabled={isSubmitting || loginMutation.isPending}>
          {loginMutation.isPending ? <Spinner className="mr-2" /> : null}
          Sign In
        </Button>
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
import { apiClient } from '@/lib/api';
import { TreeNode } from '../components/TreeView';

export const gistKeys = {
  files: ['gist', 'files'] as const,
  load: (filename: string) => ['gist', 'load', filename] as const,
};

export async function listGistFiles() {
  return apiClient<Array<{ filename: string; raw_url: string }>>('/api/gist/files');
}

export async function loadGistFile(filename: string) {
  return apiClient<TreeNode[]>(`/api/gist/load?filename=${encodeURIComponent(filename)}`);
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

export function useGistFiles() {
  return useQuery({ queryKey: gistKeys.files, queryFn: listGistFiles });
}

export function useLoadGist(filename: string) {
  return useQuery({
    queryKey: gistKeys.load(filename),
    queryFn: () => loadGistFile(filename),
    enabled: !!filename,
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

```typescript
// features/auth/components/LogoutButton.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLogout } from '../hooks/useAuth';
import { MessagePopup } from '@/components/common/MessagePopup';

export function LogoutButton() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const logoutMutation = useLogout();

  const handleConfirm = () => {
    logoutMutation.mutate();
    setConfirmOpen(false);
  };

  return (
    <>
      <Button
        id="s002-logout"
        variant="ghost"
        onClick={() => setConfirmOpen(true)}
      >
        Logout
      </Button>
      <MessagePopup
        type="warning"
        title="Confirm Logout"
        message="Are you sure you want to log out? Unsaved changes will be lost."
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

## P12 — File Naming Convention

| Type | Pattern | Example |
|------|---------|---------|
| Component | PascalCase.tsx | `LoginPopup.tsx`, `TreeView.tsx` |
| Hook | use[camelCase].ts | `useAuth.ts`, `useGist.ts` |
| Store | [feature]Store.ts | `authStore.ts`, `resumeStore.ts` |
| API | [feature]Api.ts | `authApi.ts`, `gistApi.ts` |
| Type | [Name].ts or inline | `TreeNode`, `User` |
| Utility | camelCase.ts | `apiErrorHandler.ts` |
| Test | [Name].test.tsx | `LoginForm.test.tsx` |
| Route component | [Name]Screen.tsx | `WelcomeScreen.tsx`, `MainScreen.tsx` |

---

**End of Patterns**
