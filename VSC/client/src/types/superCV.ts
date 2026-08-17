// SuperCVDocument — the actual Reactive Resume export schema (TECH.md §5/§5a,
// DECISIONS.md ADR-018). Replaces the earlier generic, app-invented
// MasterCVNode tree. See VSC/data/SuperCV/supercv.json for a real sample.

export type SectionKey =
  | 'profiles'
  | 'experience'
  | 'education'
  | 'projects'
  | 'skills'
  | 'languages'
  | 'interests'
  | 'awards'
  | 'certifications'
  | 'publications'
  | 'volunteer'
  | 'references';

// An item's OWN fields differ per SectionKey (e.g. experience has
// company/position/period/description/roles; skills has name/level/keywords)
// but every item, regardless of section, consistently carries id + hidden.
export interface SuperCVSectionItem {
  id: string;
  hidden: boolean;
  [field: string]: unknown;
}

export interface SuperCVSection {
  title: string;
  icon: string;
  columns: number;
  hidden: boolean;
  keepTogether: boolean;
  startOnNewPage: boolean;
  items: SuperCVSectionItem[];
}

export interface SuperCVCustomSection extends SuperCVSection {
  id: string;
  name: string; // shape unconfirmed by the sample data (customSections is empty there); handle generically
}

export interface SuperCVDocument {
  picture: Record<string, unknown>; // no `hidden` flag — never part of TVC01's selectable tree
  basics: Record<string, unknown>; // no `hidden` flag — never part of TVC01's selectable tree
  summary: {
    title: string;
    icon: string;
    columns: number;
    hidden: boolean;
    keepTogether: boolean;
    startOnNewPage: boolean;
    content: string;
  };
  sections: Partial<Record<SectionKey, SuperCVSection>>; // any key may be absent or have an empty items[]
  customSections: SuperCVCustomSection[];
  metadata: Record<string, unknown>; // template/layout/design/typography/stylesheet — presentation only, copied through unchanged on export
}

// --- Section Registry (Display Metadata Only — Never Structural) ---------
// Supplies presentation hints for the twelve known Reactive Resume section
// keys, plus one fallback entry used for customSections and any future or
// unrecognized key. It never changes what data exists or how selection/export
// works — removing an entry, or feeding it an unknown key, only degrades the
// *label*, never breaks the tree.
export interface SectionRegistryEntry {
  displayName: string;
  titleFields: string[]; // 1–3 fields concatenated for an item's collapsed-row label; missing fields are skipped, not errored
  detailField?: string; // the primary long/rich-text field shown when an item is expanded
}

export const SECTION_REGISTRY: Record<SectionKey, SectionRegistryEntry> = {
  profiles: { displayName: 'Profiles', titleFields: ['network', 'username'] },
  experience: {
    displayName: 'Experience',
    titleFields: ['position', 'company', 'period'],
    detailField: 'description',
  },
  education: {
    displayName: 'Education',
    titleFields: ['degree', 'school', 'period'],
    detailField: 'description',
  },
  projects: { displayName: 'Projects', titleFields: ['name', 'period'], detailField: 'description' },
  skills: { displayName: 'Skills', titleFields: ['name'], detailField: 'keywords' },
  languages: { displayName: 'Languages', titleFields: ['language', 'fluency'] },
  interests: { displayName: 'Interests', titleFields: ['name'], detailField: 'keywords' },
  awards: { displayName: 'Awards', titleFields: ['title', 'awarder', 'date'], detailField: 'description' },
  certifications: {
    displayName: 'Certifications',
    titleFields: ['title', 'issuer', 'date'],
    detailField: 'description',
  },
  publications: {
    displayName: 'Publications',
    titleFields: ['title', 'publisher', 'date'],
    detailField: 'description',
  },
  volunteer: { displayName: 'Volunteering', titleFields: ['organization', 'period'], detailField: 'description' },
  references: { displayName: 'References', titleFields: ['name'] },
};

// Fallback for customSections entries and any key not listed above: title-case
// the raw key for displayName, use the first string-valued field found on an
// item as its title, and the first long/HTML-looking string field as detail.
export const SECTION_REGISTRY_FALLBACK: Omit<SectionRegistryEntry, 'displayName'> = {
  titleFields: [], // resolved dynamically per item at render time
};

// Denylist for the generic field-detail view (SPEC.md §3.3.3 "Editing",
// TECH.md §5a): fields never shown as editable content, on any item,
// regardless of section — Reactive Resume presentation/styling metadata,
// not resume content, always carried through unchanged rather than surfaced
// for editing.
export const DETAIL_FIELD_DENYLIST: readonly string[] = [
  'id',
  'hidden',
  'iconColor',
  'borderRadius',
  'borderColor',
  'borderWidth',
  'shadowColor',
  'shadowWidth',
  'rotation',
  'aspectRatio',
];
