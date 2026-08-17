import { create } from 'zustand';
import { User, UserSettings, MasterCVNode } from '@/types';

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
  // SPEC.md §3.6.5 Case A: CANCEL needs to know if ANY transaction (import,
  // export, settings save, health check) is currently in flight. Dialogs
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

// --- Resume slice (P05/P14, TECH.md §8) -----------------------------------
// NOTE: Co-located here (not features/resume/stores/resumeStore.ts) to match
// this project's already-scaffolded convention (see AI/KIMI/SCAFFOLD's
// "Hybrid: AI adds slices, but Zustand setup is template" rule for app/store.ts).
interface ResumeState {
  masterCV: MasterCVNode[] | null;
  displayAll: boolean;
  isDirty: boolean; // true once any node is deselected or any info text edited
  gistUrl: string | null; // last successfully loaded GIST URL (session cache)
  masterResumeFile: string | null;
  setMasterCV: (nodes: MasterCVNode[]) => void;
  setGistSource: (gistUrl: string, filename: string) => void;
  toggleNodeSelect: (id: string) => void;
  toggleNodeExpand: (id: string) => void;
  updateNodeInfo: (id: string, info: string) => void;
  setDisplayAll: (value: boolean) => void;
  getSelectedSubset: () => MasterCVNode[];
  resetAllToSelected: () => void;
}

function updateNodeInTree(
  nodes: MasterCVNode[],
  id: string,
  updater: (node: MasterCVNode) => MasterCVNode
): MasterCVNode[] {
  return nodes.map((node) => {
    if (node.id === id) return updater(node);
    if (node.children) {
      return { ...node, children: updateNodeInTree(node.children, id, updater) };
    }
    return node;
  });
}

function filterSelected(nodes: MasterCVNode[]): MasterCVNode[] {
  return nodes
    .filter((n) => n.selected)
    .map((n) => ({
      ...n,
      children: n.children ? filterSelected(n.children) : undefined,
    }));
}

function setAllSelected(nodes: MasterCVNode[]): MasterCVNode[] {
  return nodes.map((n) => ({
    ...n,
    selected: true,
    children: n.children ? setAllSelected(n.children) : undefined,
  }));
}

export const useResumeStore = create<ResumeState>((set, get) => ({
  masterCV: null,
  displayAll: false,
  isDirty: false,
  gistUrl: null,
  masterResumeFile: null,
  setMasterCV: (nodes) => set({ masterCV: nodes, isDirty: false }),
  setGistSource: (gistUrl, masterResumeFile) => set({ gistUrl, masterResumeFile }),
  toggleNodeSelect: (id) =>
    set((state) => ({
      masterCV: state.masterCV
        ? updateNodeInTree(state.masterCV, id, (n) => ({ ...n, selected: !n.selected }))
        : null,
      isDirty: true,
    })),
  toggleNodeExpand: (id) =>
    set((state) => ({
      masterCV: state.masterCV
        ? updateNodeInTree(state.masterCV, id, (n) => ({ ...n, expanded: !n.expanded }))
        : null,
    })),
  updateNodeInfo: (id, info) =>
    set((state) => ({
      masterCV: state.masterCV ? updateNodeInTree(state.masterCV, id, (n) => ({ ...n, info })) : null,
      isDirty: true,
    })),
  setDisplayAll: (displayAll) => set({ displayAll }),
  getSelectedSubset: () => {
    const { masterCV } = get();
    return masterCV ? filterSelected(masterCV) : [];
  },
  resetAllToSelected: () =>
    set((state) => ({
      masterCV: state.masterCV ? setAllSelected(state.masterCV) : null,
      isDirty: false,
    })),
}));