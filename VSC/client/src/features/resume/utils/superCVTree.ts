// P05 — Schema-aware flatten function for TVC01 (PATTERNS.md, SPEC.md §3.3.3).
import type { SuperCVDocument, SuperCVSection, SuperCVSectionItem, SectionKey, SectionRegistryEntry } from '@/types/superCV';
import { SECTION_REGISTRY, SECTION_REGISTRY_FALLBACK } from '@/types/superCV';

export type RowKind = 'topic' | 'item';

export interface FlatRow {
  path: string; // e.g. "sections.experience" or "sections.experience.items.2" or "customSections.0"
  depth: 0 | 1; // Topic = 0, Item = 1 — this is the app's max selectable depth (DECISIONS.md ADR-018)
  kind: RowKind;
  label: string; // derived from Section Registry titleFields, or the item's first string field as fallback
  hidden: boolean; // bound directly to the underlying section/item's own `hidden` field
  hasChildren: boolean;
  registry: SectionRegistryEntry;
  data: SuperCVSection | SuperCVSectionItem;
}

export function registryFor(key: string): SectionRegistryEntry {
  return (SECTION_REGISTRY as Record<string, SectionRegistryEntry>)[key] ?? { displayName: titleCase(key), ...SECTION_REGISTRY_FALLBACK };
}

function titleCase(key: string): string {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());
}

export function itemLabel(item: SuperCVSectionItem, registry: SectionRegistryEntry): string {
  const parts = registry.titleFields
    .map((field) => item[field])
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0);
  if (parts.length) return parts.join(' \u00b7 ');
  // Generic fallback (customSections / unknown keys): first non-empty string field, excluding id/hidden.
  const fallback = Object.entries(item).find(
    ([key, value]) => key !== 'id' && key !== 'hidden' && typeof value === 'string' && value.trim().length > 0
  );
  return fallback ? String(fallback[1]) : '(untitled)';
}

// Builds the flat, virtualization-ready row list. `displayAll` and `expandedPaths`
// are the ONLY two things that affect visibility beyond the document's own `hidden`
// flags — there is no separate selection state to fall out of sync with.
export function flattenSuperCV(doc: SuperCVDocument | null, expandedPaths: Set<string>, displayAll: boolean): FlatRow[] {
  if (!doc) return [];
  const rows: FlatRow[] = [];

  const pushTopic = (key: string, section: SuperCVSection, path: string) => {
    if (!displayAll && section.hidden) return;
    const registry = registryFor(key);
    rows.push({
      path,
      depth: 0,
      kind: 'topic',
      label: registry.displayName,
      hidden: section.hidden,
      hasChildren: section.items.length > 0,
      registry,
      data: section,
    });
    if (!expandedPaths.has(path)) return;
    section.items.forEach((item, i) => {
      if (!displayAll && item.hidden) return;
      const itemPath = `${path}.items.${i}`;
      rows.push({
        path: itemPath,
        depth: 1,
        kind: 'item',
        label: itemLabel(item, registry),
        hidden: item.hidden,
        hasChildren: false,
        registry,
        data: item,
      });
    });
  };

  (Object.entries(doc.sections) as [SectionKey, SuperCVSection | undefined][]).forEach(([key, section]) => {
    if (section) pushTopic(key, section, `sections.${key}`);
  });
  doc.customSections.forEach((section, i) => pushTopic(section.name ?? `custom${i}`, section, `customSections.${i}`));

  return rows;
}
