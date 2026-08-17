// TVC01 — TreeView Component (PATTERNS.md P05, SPEC.md §3.3.3)
// Fixed 2026-08-17: wired up the editable info-field (SPEC §3.3.3 "Editing")
// that PATTERNS.md P05 declared via `onUpdateInfo` but never rendered.
import { useCallback, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { MasterCVNode } from '@/types';

interface TreeViewProps {
  nodes: MasterCVNode[];
  displayAll: boolean;
  onToggleSelect: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onUpdateInfo: (id: string, info: string) => void;
}

function hasSelectedDescendant(node: MasterCVNode): boolean {
  if (!node.children) return false;
  return node.children.some((child) => child.selected || hasSelectedDescendant(child));
}

export function TreeView({ nodes, displayAll, onToggleSelect, onToggleExpand, onUpdateInfo }: TreeViewProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const flattenNodes = useCallback(
    (nodeList: MasterCVNode[], depth = 0): Array<{ node: MasterCVNode; depth: number }> => {
      const result: Array<{ node: MasterCVNode; depth: number }> = [];
      for (const node of nodeList) {
        // SPEC §3.3.4: OFF -> hide deselected nodes UNLESS they have a
        // selected descendant (needed so the tree structure to a selected
        // child remains visible).
        const isVisible = displayAll || node.selected || hasSelectedDescendant(node);
        if (!isVisible) continue;

        result.push({ node, depth });
        if (node.expanded && node.children) {
          result.push(...flattenNodes(node.children, depth + 1));
        }
      }
      return result;
    },
    [displayAll]
  );

  const flatNodes = flattenNodes(nodes);

  const virtualizer = useVirtualizer({
    count: flatNodes.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 44,
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
          const { node, depth } = flatNodes[virtualItem.index];
          const hasChildren = !!node.children?.length;

          return (
            <div
              key={node.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
                paddingLeft: `${depth * 24 + 12}px`,
              }}
              className="flex items-center gap-2 border-b border-border/60 pr-3 hover:bg-bg"
              onDoubleClick={() => hasChildren && onToggleExpand(node.id)}
            >
              {hasChildren ? (
                <button
                  type="button"
                  onClick={() => onToggleExpand(node.id)}
                  className="rounded p-1 hover:bg-secondary"
                  aria-label={node.expanded ? 'Collapse' : 'Expand'}
                >
                  {node.expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
              ) : (
                <span className="w-6" />
              )}

              <Checkbox
                checked={node.selected}
                onCheckedChange={() => onToggleSelect(node.id)}
                aria-label={`Select ${node.label}`}
              />

              <span className="shrink-0 text-sm font-medium text-text-primary">{node.label}</span>

              <input
                type="text"
                value={node.info ?? ''}
                onChange={(e) => onUpdateInfo(node.id, e.target.value)}
                placeholder="Add detail..."
                aria-label={`Details for ${node.label}`}
                className="min-w-0 flex-1 truncate rounded border-none bg-transparent px-2 py-1 text-xs text-text-secondary outline-none focus:bg-surface focus:ring-1 focus:ring-accent"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
