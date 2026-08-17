// S002D2 — SuperCV Master File IMPORT Dialogue PopUp (PATTERNS.md P15, SPEC.md §3.5).
// UPDATED 2026-08-17 (Supabase migration): OLD — the dialog had a `gistUrl`
// schema field and URL prefill cascade. NEW — it is a fixed `Applai/SuperCV`
// file picker populated from P06; there is no URL input, URL validation, or
// `gistUrl` state.
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ScreenBadge } from '@/components/common/ScreenBadge';
import { useSuperCVFiles } from '../hooks/useSuperCVStorage';
import { loadSuperCVFile } from '../api/supercvStorageApi';
import { useResumeStore } from '../stores/resumeStore';
import { useUIStore } from '@/app/store';
import { useMessage } from '@/hooks/useMessage';

const importSchema = z.object({
  filename: z
    .string()
    .min(3, 'Select a valid file from the SuperCV folder.')
    .max(60, 'Select a valid file from the SuperCV folder.')
    .regex(/^[a-zA-Z0-9_.-]+$/, 'Select a valid file from the SuperCV folder.'),
});

type ImportFormData = z.infer<typeof importSchema>;

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportDialog({ open, onOpenChange }: ImportDialogProps) {
  const settings = useUIStore((s) => s.settings);
  const defaultFilename = settings?.masterResumeFile || '';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<ImportFormData>({
    resolver: zodResolver(importSchema),
    defaultValues: { filename: defaultFilename },
    mode: 'onBlur',
  });

  const filesQuery = useSuperCVFiles();
  const jsonFiles = (filesQuery.data ?? []).filter((f) => f.name.toLowerCase().endsWith('.json'));

  // SPEC.md §3.5.3: preselect the user's masterResumeFile setting when it
  // exists in the listing; otherwise preselect the first JSON file.
  useEffect(() => {
    if (!open || filesQuery.isLoading) return;
    const names = jsonFiles.map((f) => f.name);
    reset({ filename: names.includes(defaultFilename) ? defaultFilename : names[0] ?? '' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, filesQuery.isLoading]);

  const setSuperCV = useResumeStore((s) => s.setSuperCV);
  const setStorageFilename = useResumeStore((s) => s.setStorageFilename);
  const { showSuccess, showError } = useMessage();
  const setTransactionRunning = useUIStore((s) => s.setTransactionRunning);

  const handleCancel = () => onOpenChange(false); // no side effects (SPEC §3.5.3)

  const onSubmit = async ({ filename }: ImportFormData) => {
    setTransactionRunning(true);
    try {
      const doc = await loadSuperCVFile(filename);
      setSuperCV(doc);
      setStorageFilename(filename);
      onOpenChange(false);
      showSuccess(`SuperCV file loaded: ${filename}`);
    } catch {
      showError('SuperCV folder or selected file is not accessible. Please try another file.');
    } finally {
      setTransactionRunning(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[420px]">
        <ScreenBadge screenId="S002D2" />
        <DialogHeader>
          <DialogTitle id="s002d2-title">Import Master CV</DialogTitle>
          <DialogDescription id="s002d2-prompt">
            Choose a file from Applai/SuperCV for import.
          </DialogDescription>
        </DialogHeader>
        <p id="s002d2-storage-path" className="text-xs text-text-secondary">
          Supabase Storage: Applai/SuperCV
        </p>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="s002d2-filename">SuperCV File Name</Label>
              <select
                id="s002d2-filename"
                aria-invalid={errors.filename ? 'true' : 'false'}
                aria-describedby={errors.filename ? 's002d2-filename-error' : undefined}
                disabled={filesQuery.isLoading}
                className="flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:ring-1 focus:ring-accent"
                {...register('filename')}
              >
                <option value="">Select a JSON file</option>
                {jsonFiles.map((f) => (
                  <option key={f.path} value={f.name}>
                    {f.name}
                  </option>
                ))}
              </select>
              {errors.filename && (
                <span id="s002d2-filename-error" className="text-sm text-error">
                  {errors.filename.message}
                </span>
              )}
              {!filesQuery.isLoading && jsonFiles.length === 0 && (
                <span className="mt-1 block text-sm text-info">
                  No SuperCV JSON files are available. Upload a master file to Applai/SuperCV outside the app, then
                  try again.
                </span>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button id="s002d2-cancel" type="button" variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
            <Button id="s002d2-import" type="submit" disabled={!isValid || isSubmitting || filesQuery.isLoading}>
              Import
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
