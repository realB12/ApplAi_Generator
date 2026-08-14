# PATTERNS.md

> **Purpose:** Reusable code patterns and conventions. Copy-paste these templates. Consistency beats cleverness.
> **Update frequency:** When new recurring patterns emerge.

---

## 1. API Client Pattern

All API calls must use this pattern. No exceptions.

```typescript
// features/auth/api/login.ts
import { z } from 'zod';

const LoginResponseSchema = z.object({
  user: UserSchema,
  token: z.string(),
});

type LoginResponse = z.infer<typeof LoginResponseSchema>;

export async function login(credentials: LoginInput): Promise<Result<LoginResponse>> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await parseApiError(response);
    return { success: false, error };
  }

  const data = await response.json();
  return { success: true, data: LoginResponseSchema.parse(data) };
}
```

**Rules:**
- Always validate response with Zod.
- Always return `Result<T>` — never throw for expected errors.
- Parse errors using `parseApiError()` utility.

---

## 2. Result Type Pattern

Standard return type for all operations that can fail.

```typescript
// types/result.ts
export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: ApiError };

// Usage in components
const result = await login(credentials);
if (!result.success) {
  // Handle error
  return;
}
// Use result.data
```

---

## 3. TanStack Query Hook Pattern

```typescript
// features/auth/hooks/useLogin.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useLogin() {
  const queryClient = useQueryClient();
  const { setUser } = useAuthStore();

  return useMutation({
    mutationFn: login,
    onSuccess: (result) => {
      if (result.success) {
        setUser(result.data.user);
        queryClient.invalidateQueries({ queryKey: ['user'] });
      }
    },
  });
}
```

**Rules:**
- Query keys must be typed and centralized: `['user']`, `['projects', { page, filter }]`
- Mutations handle Zustand updates in `onSuccess`.
- Never call `queryClient` directly from components — always via hooks.

---

## 4. Form Pattern (React Hook Form + Zod)

```typescript
// features/auth/components/LoginForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { mutate, isPending } = useLogin();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = (data: LoginFormData) => {
    mutate(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Fields */}
    </form>
  );
}
```

**Rules:**
- Schema and type are co-located with the form.
- Default values always provided.
- Loading state comes from mutation `isPending`.
- Error display uses `form.formState.errors`.

---

## 5. Zustand Store Pattern

```typescript
// features/auth/stores/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    { name: 'auth-storage' }
  )
);
```

**Rules:**
- One store per domain concern.
- Use `persist` middleware only for non-sensitive data.
- Never store tokens in Zustand — use httpOnly cookies.
- Selectors must be stable: `useAuthStore((state) => state.user)`.

---

## 6. Component Pattern

```typescript
// components/common/DataCard.tsx
import { cn } from '@/lib/utils';

interface DataCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  onAction?: () => void;
}

export function DataCard({ title, children, className, onAction }: DataCardProps) {
  return (
    <div className={cn('rounded-lg border bg-card p-6 shadow-sm', className)}>
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="mt-4">{children}</div>
      {onAction && (
        <button onClick={onAction} className="mt-4 text-primary hover:underline">
          Action
        </button>
      )}
    </div>
  );
}
```

**Rules:**
- Props interface always named `[ComponentName]Props`.
- Use `cn()` utility for conditional classes.
- Forward refs when needed using `React.forwardRef`.
- Export as named export, not default.

---

## 7. Error Handling Pattern

```typescript
// lib/error-handling.ts
export interface ApiError {
  code: string;
  message: string;
  details?: Array<{ field: string; message: string }>;
}

export async function parseApiError(response: Response): Promise<ApiError> {
  try {
    const body = await response.json();
    return body.error || { code: 'UNKNOWN_ERROR', message: 'An unexpected error occurred' };
  } catch {
    return { code: 'NETWORK_ERROR', message: 'Failed to connect to the server' };
  }
}

// Component usage
function ErrorDisplay({ error }: { error: ApiError }) {
  return (
    <div role="alert" className="rounded-md bg-destructive/15 p-4 text-destructive">
      <p className="font-medium">{error.message}</p>
      {error.details?.map((d) => (
        <p key={d.field} className="text-sm">{d.field}: {d.message}</p>
      ))}
    </div>
  );
}
```

---

## 8. Loading State Pattern

```typescript
// components/common/SkeletonCard.tsx
export function SkeletonCard() {
  return (
    <div className="rounded-lg border p-6 space-y-4">
      <div className="h-4 w-1/3 bg-muted animate-pulse rounded" />
      <div className="h-20 bg-muted animate-pulse rounded" />
    </div>
  );
}

// Page usage
export function DashboardPage() {
  const { data, isLoading } = useDashboardData();

  if (isLoading) return <SkeletonDashboard />;
  if (!data) return <EmptyState />;

  return <Dashboard data={data} />;
}
```

**Rules:**
- Skeletons match the shape of the final content.
- Never use `loading` text alone — always show skeleton or spinner.
- Error and empty states are mandatory, not optional.

---

## 9. Route Guard Pattern

```typescript
// components/common/ProtectedRoute.tsx
import { Navigate, useLocation } from 'react-router-dom';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

// Router usage
{
  path: '/dashboard',
  element: (
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  ),
}
```

---

## 10. Testing Pattern

```typescript
// features/auth/components/__tests__/LoginForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginForm } from '../LoginForm';

function renderWithProviders(ui: React.ReactNode) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

describe('LoginForm', () => {
  it('submits form with valid data', async () => {
    renderWithProviders(<LoginForm />);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/welcome/i)).toBeInTheDocument();
    });
  });
});
```

**Rules:**
- Always wrap renders in providers.
- Use `userEvent` over `fireEvent` for realistic interactions.
- Mock API calls at the fetch/msw level, not the component level.

---

*Last updated: [DATE]*
