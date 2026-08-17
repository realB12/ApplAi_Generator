// TVC01 — TreeView Component (PATTERNS.md P05, SPEC.md §3.3.3).
// UPDATED 2026-08-17 (Reactive Resume schema mapping): OLD — rendered a
// generic `TreeNode[]` with its own `selected`/`expanded` flags. NEW —
// renders the real `SuperCVDocument` (TECH.md §5) directly; the checkbox
// toggles that document's own `hidden` field (Topic and Item rows only, per
// DECISIONS.md ADR-018), and expanding an Item row reveals its own content
// fields as editable inputs bound directly to that item's path in the live
// document (SPEC.md §3.3.3 "Editing").
import { useCallback, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { DETAIL_FIELD_DENYLIST } from '@/types/superCV';
import { flattenSuperCV, type FlatRow } from '../utils/superCVTree';
import { useResumeStore } from '../stores/resumeStore';

interface TreeViewProps {
  displayAll: boolean;
}

// The generic field-detail view (SPEC.md §3.3.3 "Editing", TECH.md §5a): every
// item field except the denylist, shown as an editable input. Array-valued
// fields (e.g. skills.keywords) are edited as a comma-separated string and
// split back into an array on change.
function ItemFieldDetail({ row }: { row: FlatRow }) {
  const updateField = useResumeStore((s) => s.updateField);
  const item = row.data as Record<string, unknown>;

  const fields = Object.keys(item).filter((key) => !DETAIL_FIELD_DENYLIST.includes(key));
  if (fields.length === 0) return null;

  return (
    <div
      className="flex flex-col gap-2 border-b border-border/60 bg-bg/60 py-2"
      style={{ paddingLeft: `${row.depth * 24 + 48}px`, paddingRight: '12px' }}
    >
      {fields.map((field) => {
        const value = item[field];
        const isArray = Array.isArray(value);
        const displayValue = isArray ? (value as unknown[]).join(', ') : typeof value === 'string' ? value : '';
        return (
          <label key={field} className="flex flex-col gap-0.5 text-xs text-text-secondary">
            <span className="font-medium capitalize">{field}</span>
            <input
              type="text"
              value={displayValue}
              onChange={(e) => {
                const next = isArray
                  ? e.target.value
                      .split(',')
                      .map((v) => v.trim())
                      .filter(Boolean)
                  : e.target.value;
                updateField(row.path, field, next);
              }}
              aria-label={`${field} for ${row.label}`}
              className="rounded border border-border bg-surface px-2 py-1 text-sm text-text-primary outline-none focus:ring-1 focus:ring-accent"
            />
          </label>
        );
      })}
    </div>
  );
}

export function TreeView({ displayAll }: TreeViewProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const superCV = useResumeStore((s) => s.superCV);
  const expandedPaths = useResumeStore((s) => s.expandedPaths);
  const toggleHidden = useResumeStore((s) => s.toggleHidden);
  const toggleExpanded = useResumeStore((s) => s.toggleExpanded);

  const flattenRows = useCallback(
    () => flattenSuperCV(superCV, expandedPaths, displayAll),
    [superCV, expandedPaths, displayAll]
  );
  const rows = flattenRows();

  // Item rows whose detail panel is open take up an extra virtual slot right
  // after them; expand the estimate list accordingly so the virtualizer sizes
  // each entry correctly.
  const virtualRows: Array<{ row: FlatRow; isDetail: boolean }> = [];
  rows.forEach((row) => {
    virtualRows.push({ row, isDetail: false });
    if (row.kind === 'item' && expandedPaths.has(row.path)) {
      virtualRows.push({ row, isDetail: true });
    }
  });

  const virtualizer = useVirtualizer({
    count: virtualRows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => (virtualRows[index].isDetail ? 120 : 40),
    overscan: 5,
  });

  return (
    <div
      id="s002-tvc01-container"
      ref={parentRef}
      className="h-[600px] overflow-auto rounded-lg border border-border"
    >
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const { row, isDetail } = virtualRows[virtualItem.index];

          if (isDetail) {
            return (
              <div
                key={`${row.path}-detail`}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <ItemFieldDetail row={row} />
              </div>
            );
          }

          return (
            <div
              key={row.path}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
                paddingLeft: `${row.depth * 24 + 12}px`,
              }}
              className="flex items-center gap-2 border-b border-border/60 pr-3 hover:bg-bg"
              onDoubleClick={() => toggleExpanded(row.path)}
            >
              {row.hasChildren || row.kind === 'item' ? (
                <button
                  type="button"
                  onClick={() => toggleExpanded(row.path)}
                  className="rounded p-1 hover:bg-secondary"
                  aria-label={expandedPaths.has(row.path) ? 'Collapse' : 'Expand'}
                >
                  {expandedPaths.has(row.path) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
              ) : (
                <span className="w-6" />
              )}

              {/* Checked = hidden:false, unchecked = hidden:true — the checkbox
                  toggles the document's own field (DECISIONS.md ADR-018). No
                  field-level checkbox exists — the schema has no per-field
                  hidden flag. */}
              <Checkbox checked={!row.hidden} onCheckedChange={() => toggleHidden(row.path)} aria-label={`Select ${row.label}`} />

              <span className="truncate text-sm font-medium text-text-primary">{row.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
