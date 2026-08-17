// S002 — Main Screen (SPEC.md §3.3, §3.6).
// UPDATED 2026-08-17 (Supabase migration + Reactive Resume schema mapping):
// OLD — "Load from GIST" loaded a generic `MasterCVNode[]` tree. NEW —
// "Load from SuperCV" (`s002-load-supercv`) opens the fixed Applai/SuperCV
// picker (S002D2) and TVC01 renders the real `SuperCVDocument` directly.
import { useEffect, useState } from 'react';
import { ScreenBadge } from '@/components/common/ScreenBadge';
import { Button } from '@/components/ui/button';
import { MessagePopup } from '@/components/common/MessagePopup';
import { useResumeStore } from '../stores/resumeStore';
import { useUIStore } from '@/app/store';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { TreeView } from './TreeView';
import { ExportDialog } from './ExportDialog';
import { ImportDialog } from './ImportDialog';
import { SettingsPanel } from './SettingsPanel';
import { CancelButton } from './CancelButton';
import { ExitButton } from '@/features/auth/components/ExitButton';
import { LogoutButton } from '@/features/auth/components/LogoutButton';

export function MainScreen() {
  const superCV = useResumeStore((s) => s.superCV);
  const displayAll = useResumeStore((s) => s.displayAll);
  const setDisplayAll = useResumeStore((s) => s.setDisplayAll);

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

  // SPEC.md §3.5.6: auto-open Import Dialog on mount if no SuperCV master
  // file is loaded yet, after a 500ms delay to let the screen render first.
  useEffect(() => {
    if (!isAuthenticated) return;
    if (superCV !== null) return;
    const timer = setTimeout(() => setImportOpen(true), 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const handleLoadFromSuperCV = () => {
    if (superCV) {
      setConfirmReplaceOpen(true);
      return;
    }
    setImportOpen(true);
  };

  const handleImportOpenChange = (open: boolean) => {
    setImportOpen(open);
    if (!open && superCV === null) setShowEmptyInfo(true);
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
        <Button id="s002-load-supercv" type="button" variant="secondary" onClick={handleLoadFromSuperCV}>
          Load from SuperCV
        </Button>

        <Button
          id="s002-display-all"
          type="button"
          variant={displayAll ? 'default' : 'secondary'}
          onClick={() => setDisplayAll(!displayAll)}
        >
          Display All: {displayAll ? 'ON' : 'OFF'}
        </Button>

        <Button id="s002-export" type="button" onClick={() => setExportOpen(true)} disabled={!superCV}>
          Export
        </Button>

        <Button id="s002-settings" type="button" variant="secondary" onClick={() => setSettingsOpen(true)}>
          Settings
        </Button>
      </div>

      <div className="px-6 pb-8">
        {superCV ? (
          <TreeView displayAll={displayAll} />
        ) : (
          <div
            id="s002-tvc01-container"
            className="flex h-[300px] items-center justify-center rounded-lg border border-dashed border-border text-text-secondary"
          >
            No SuperCV master file loaded. Click &ldquo;Load from SuperCV&rdquo; to import.
          </div>
        )}
      </div>

      <ExportDialog open={isExportOpen} onOpenChange={setExportOpen} />
      <ImportDialog open={isImportOpen} onOpenChange={handleImportOpenChange} />
      <SettingsPanel open={isSettingsOpen} onOpenChange={setSettingsOpen} />

      <MessagePopup
        type="warning"
        title="Replace current data?"
        message="Loading a new SuperCV master file will replace current data. Continue?"
        actionLabel="Continue"
        onAction={() => setImportOpen(true)}
        persistent
        open={confirmReplaceOpen}
        onOpenChange={setConfirmReplaceOpen}
      />

      <MessagePopup
        type="info"
        message="No SuperCV master file loaded. Click 'Load from SuperCV' to import."
        persistent
        open={showEmptyInfo && superCV === null}
        onOpenChange={setShowEmptyInfo}
      />
    </div>
  );
}
