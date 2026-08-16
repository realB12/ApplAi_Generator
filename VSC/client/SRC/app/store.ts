import { create } from 'zustand';
import { User, UserSettings } from '@/types';

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

interface UIState {
  theme: 'light' | 'dark';
  settings: UserSettings | null;
  isExportOpen: boolean;
  isImportOpen: boolean;
  isSettingsOpen: boolean;
  setSettings: (settings: UserSettings) => void;
  setExportOpen: (open: boolean) => void;
  setImportOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  theme: 'light',
  settings: null,
  isExportOpen: false,
  isImportOpen: false,
  isSettingsOpen: false,
  setSettings: (settings) => set({ settings }),
  setExportOpen: (isExportOpen) => set({ isExportOpen }),
  setImportOpen: (isImportOpen) => set({ isImportOpen }),
  setSettingsOpen: (isSettingsOpen) => set({ isSettingsOpen }),
}));