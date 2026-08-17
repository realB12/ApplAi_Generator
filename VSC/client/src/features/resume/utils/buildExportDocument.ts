// P07 — Export Flow Pattern: prune-and-clone (PATTERNS.md, SPEC.md §3.3.5).
// UPDATED 2026-08-17 (Reactive Resume schema mapping): OLD — P07 called
// `getSelectedSubset()`, which filtered a generic `TreeNode[]` by its
// `selected` flag. NEW — deep-clones the live SuperCVDocument and physically
// removes anything whose `hidden === true`, leaving `basics`/`picture`/
// `metadata` untouched (DECISIONS.md ADR-018).
import type { SuperCVDocument, SuperCVSection } from '@/types/superCV';

// Prunes hidden items out of a section's items[], and reports whether the
// section itself should be dropped (hidden itself, or left with no items).
function pruneSection<T extends SuperCVSection>(section: T): T | null {
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
