// P02 — Auth Zustand Store (PATTERNS.md).
// UPDATED 2026-08-17 (Supabase migration): OLD — `user` was a custom
// `{ id, email, name, role, avatarUrl, ... }` shape returned by a custom
// backend. NEW — `user` is `@supabase/supabase-js`'s own `User` type,
// returned directly by `signInWithPassword`/`getSession`. Moved out of
// app/store.ts into features/auth/stores/ per TECH.md §2's mandatory
// project structure and PATTERNS.md's updated file-location comments.
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
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,
  setAuth: (user, accessToken) => set({ user, accessToken, isAuthenticated: true, isLoading: false }),
  clearAuth: () => set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
}));
