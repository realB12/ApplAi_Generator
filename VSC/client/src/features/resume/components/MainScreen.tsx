// S002 — Main Screen (SPEC.md §3.3, §3.6)
import { useEffect, useState } from 'react';
import { ScreenBadge } from '@/components/common/ScreenBadge';
import { Button } from '@/components/ui/button';
import { MessagePopup } from '@/components/common/MessagePopup';
import { useResumeStore, useUIStore, useAuthStore } from '@/app/store';
import { TreeView } from './TreeView';
import { ExportDialog } from './ExportDialog';
import { ImportDialog } from './ImportDialog';
import { SettingsPanel } from './SettingsPanel';
import { CancelButton } from './CancelButton';
import { ExitButton } from '@/features/auth/components/ExitButton';
import { LogoutButton } from '@/features/auth/components/LogoutButton';

export function MainScreen() {
  const masterCV = useResumeStore((s) => s.masterCV);
  const displayAll = useResumeStore((s) => s.displayAll);
  const setDisplayAll = useResumeStore((s) => s.setDisplayAll);
  const toggleNodeSelect = useResumeStore((s) => s.toggleNodeSelect);
  const toggleNodeExpand = useResumeStore((s) => s.toggleNodeExpand);
  const updateNodeInfo = useResumeStore((s) => s.updateNodeInfo);

  const isExportOpen = useUIStore((s) => s.isExportOpen);
  const setExportOpen = useUIStore((s) => s.setExportOpen);
  const isImportOpen = useUIStore((s) => s.isImportOpen);
  const setImportOpen = useUIStore((s) => s.setImportOpen);
  const isSettingsOpen = useUIStore((s) => s.isSettingsOpen);
  const setSettingsOpen = useUIStore((s) => s.setSettingsOpen);
  const isTransactionRunning = useUIStore((s) => s.isTransactionRunning);

  const [confirmReplaceOpen, setConfirmReplaceOpen] = useState(false);
  const [showEmptyInfo, setShowEmptyInfo] = useState(false);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // SPEC.md §3.5.6: auto-open Import Dialog on mount if no MasterResume is
  // loaded yet, after a 500ms delay to let the screen render first.
  useEffect(() => {
    if (!isAuthenticated) return;
    if (masterCV !== null) return;
    const timer = setTimeout(() => setImportOpen(true), 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const handleLoadFromGist = () => {
    if (masterCV && masterCV.length > 0) {
      setConfirmReplaceOpen(true);
      return;
    }
    setImportOpen(true);
  };

  const handleImportOpenChange = (open: boolean) => {
    setImportOpen(open);
    if (!open && masterCV === null) setShowEmptyInfo(true);
  };

  return (
    <div id="s002-container" className="min-h-screen bg-bg">
      <ScreenBadge screenId="S002" />

      <header className="flex items-center justify-between border-b border-border bg-surface px-6 py-4">
        <span id="s002-header-title" className="text-lg font-semibold text-primary">
          Applai Resume Generator
        </span>
        <div className="flex gap-2">
          <ExitButton id="s002-exit" />
          <LogoutButton id="s002-logout" />
          <CancelButton isTransactionRunning={isTransactionRunning} />
        </div>
      </header>

      <div className="flex items-center gap-3 px-6 py-4">
        <Button id="s002-load-gist" type="button" variant="secondary" onClick={handleLoadFromGist}>
          Load from GIST
        </Button>

        <Button
          id="s002-display-all"
          type="button"
          variant={displayAll ? 'default' : 'secondary'}
          onClick={() => setDisplayAll(!displayAll)}
        >
          Display All: {displayAll ? 'ON' : 'OFF'}
        </Button>

        <Button
          id="s002-export"
          type="button"
          onClick={() => setExportOpen(true)}
          disabled={!masterCV || masterCV.length === 0}
        >
          Export
        </Button>

        <Button id="s002-settings" type="button" variant="secondary" onClick={() => setSettingsOpen(true)}>
          Settings
        </Button>
      </div>

      <div className="px-6 pb-8">
        {masterCV && masterCV.length > 0 ? (
          <TreeView
            nodes={masterCV}
            displayAll={displayAll}
            onToggleSelect={toggleNodeSelect}
            onToggleExpand={toggleNodeExpand}
            onUpdateInfo={updateNodeInfo}
          />
        ) : (
          <div
            id="s002-tvc01-container"
            className="flex h-[300px] items-center justify-center rounded-lg border border-dashed border-border text-text-secondary"
          >
            No MasterResume loaded. Click &ldquo;Load from GIST&rdquo; to import.
          </div>
        )}
      </div>

      <ExportDialog open={isExportOpen} onOpenChange={setExportOpen} />
      <ImportDialog open={isImportOpen} onOpenChange={handleImportOpenChange} />
      <SettingsPanel open={isSettingsOpen} onOpenChange={setSettingsOpen} />

      <MessagePopup
        type="warning"
        title="Replace current data?"
        message="Loading a new MasterResume will replace current data. Continue?"
        actionLabel="Continue"
        onAction={() => setImportOpen(true)}
        persistent
        open={confirmReplaceOpen}
        onOpenChange={setConfirmReplaceOpen}
      />

      <MessagePopup
        type="info"
        message="No MasterResume loaded. Click 'Load from GIST' to import."
        persistent
        open={showEmptyInfo && masterCV === null}
        onOpenChange={setShowEmptyInfo}
      />
    </div>
  );
}
