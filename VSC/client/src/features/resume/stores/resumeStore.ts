// P05 — Resume Zustand Store (PATTERNS.md, TECH.md §8).
// UPDATED 2026-08-17 (Reactive Resume schema mapping): OLD — held a generic
// `masterCV: MasterCVNode[]` copy with `selected`/`expanded` flags, plus
// `isDirty`/`gistUrl`/`resetAllToSelected()`. NEW — `superCV` holds the real
// parsed SuperCVDocument; selection IS the document's own `hidden` fields
// (DECISIONS.md ADR-018), `isDirty()` compares against a `pristineSuperCV`
// snapshot, and `resetToPristine()` replaces `resetAllToSelected()`. Moved
// out of app/store.ts into features/resume/stores/ per TECH.md §2's
// mandatory project structure.
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
  toggleHidden: (path: string) => void; // the ONLY selection mechanism — no separate selected flag
  updateField: (path: string, field: string, value: unknown) => void; // TVC01 field-detail editing (SPEC.md §3.3.3)
  toggleExpanded: (path: string) => void; // client-side only; never written into superCV
  setDisplayAll: (value: boolean) => void;
  resetToPristine: () => void; // CANCEL Case B — revert hidden flags + edits, keep expandedPaths
  isDirty: () => boolean;
}

// Generic path resolver — works for "sections.experience", "sections.experience.items.2",
// and "customSections.0" alike, so no per-section-type code is needed here.
function getAtPath(doc: SuperCVDocument, path: string): Record<string, unknown> {
  return path
    .split('.')
    .reduce<Record<string, unknown>>((node, key) => node[key] as Record<string, unknown>, doc as unknown as Record<string, unknown>);
}

function forceAllHiddenFalse(doc: SuperCVDocument): SuperCVDocument {
  const clone = structuredClone(doc);
  Object.values(clone.sections).forEach((section) => {
    if (!section) return;
    section.hidden = false;
    section.items.forEach((item) => {
      item.hidden = false;
    });
  });
  clone.customSections.forEach((section) => {
    section.hidden = false;
    section.items.forEach((item) => {
      item.hidden = false;
    });
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
  updateField: (path, field, value) =>
    set((state) => {
      if (!state.superCV) return state;
      const clone = structuredClone(state.superCV);
      const node = getAtPath(clone, path);
      node[field] = value;
      return { superCV: clone };
    }),
  toggleExpanded: (path) =>
    set((state) => {
      const next = new Set(state.expandedPaths);
      if (next.has(path)) next.delete(path);
      else next.add(path);
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
