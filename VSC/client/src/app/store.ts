// UPDATED 2026-08-17 (Supabase migration + Reactive Resume schema mapping):
// OLD — this file co-located `auth`, `ui`, and `resume` Zustand slices as a
// scaffold shortcut. NEW — `auth` moved to features/auth/stores/authStore.ts
// and `resume` moved to features/resume/stores/resumeStore.ts, per TECH.md
// §2's mandatory project structure and PATTERNS.md's updated file-location
// comments (P02/P05). Only the shared, feature-agnostic `ui` slice remains
// here (TECH.md §8: "Global store slices").
import { create } from 'zustand';
import { UserSettings } from '@/types';

interface UIState {
  theme: 'light' | 'dark';
  settings: UserSettings | null;
  isExportOpen: boolean;
  isImportOpen: boolean;
  isSettingsOpen: boolean;
  // SPEC.md §3.6.5 Case A: CANCEL needs to know if ANY transaction (import,
  // export, settings save, session check) is currently in flight. Dialogs
  // sync their own pending state into this shared flag via useEffect.
  isTransactionRunning: boolean;
  setSettings: (settings: UserSettings) => void;
  setExportOpen: (open: boolean) => void;
  setImportOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  setTransactionRunning: (running: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  theme: 'light',
  settings: null,
  isExportOpen: false,
  isImportOpen: false,
  isSettingsOpen: false,
  isTransactionRunning: false,
  setSettings: (settings) => set({ settings }),
  setExportOpen: (isExportOpen) => set({ isExportOpen }),
  setImportOpen: (isImportOpen) => set({ isImportOpen }),
  setSettingsOpen: (isSettingsOpen) => set({ isSettingsOpen }),
  setTransactionRunning: (isTransactionRunning) => set({ isTransactionRunning }),
}));
