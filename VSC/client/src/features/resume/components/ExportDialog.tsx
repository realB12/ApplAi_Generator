// S002D1 — Export Dialogue PopUp (PATTERNS.md P04/P07, SPEC.md §3.3.5, §3.4).
// UPDATED 2026-08-17 (Reactive Resume schema mapping + Supabase migration):
// OLD — read `getSelectedSubset()` from a generic tree and exported through
// GIST mutations with a separate collision-check call. NEW — prunes the live
// SuperCVDocument via `buildExportDocument()` and resolves a collision-free
// filename directly from the `Applai/SuperCV` Storage listing.
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ScreenBadge } from '@/components/common/ScreenBadge';
import { useResumeStore } from '../stores/resumeStore';
import { useUIStore } from '@/app/store';
import { useExportSuperCV, useAvailableExportFilename } from '../hooks/useSuperCVStorage';
import { buildExportDocument, hasAnySelectedContent } from '../utils/buildExportDocument';
import { useMessage } from '@/hooks/useMessage';

const exportSchema = z.object({
  filename: z
    .string()
    .min(3, 'Name must be 3\u201323 characters. Only letters, numbers, hyphens, and underscores allowed.')
    .max(23, 'Name must be 3\u201323 characters. Only letters, numbers, hyphens, and underscores allowed.')
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'Name must be 3\u201323 characters. Only letters, numbers, hyphens, and underscores allowed.'
    ),
});

type ExportFormData = z.infer<typeof exportSchema>;

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExportDialog({ open, onOpenChange }: ExportDialogProps) {
  const settings = useUIStore((s) => s.settings);
  const defaultName = settings?.preferredCvName || 'GeneratedCV';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<ExportFormData>({
    resolver: zodResolver(exportSchema),
    defaultValues: { filename: defaultName },
    mode: 'onBlur',
  });

  useEffect(() => {
    if (open) {
      reset({ filename: defaultName });
      setTimeout(() => {
        const input = document.getElementById('s002d1-name') as HTMLInputElement | null;
        input?.focus();
        input?.select();
      }, 50);
    }
  }, [open, defaultName, reset]);

  const superCV = useResumeStore((s) => s.superCV);
  const exportMutation = useExportSuperCV();
  const filenameMutation = useAvailableExportFilename();
  const { showSuccess, showError } = useMessage();
  const setTransactionRunning = useUIStore((s) => s.setTransactionRunning);

  useEffect(() => {
    setTransactionRunning(exportMutation.isPending || filenameMutation.isPending);
  }, [exportMutation.isPending, filenameMutation.isPending, setTransactionRunning]);

  const handleCancel = () => onOpenChange(false);

  const onSubmit = async (data: ExportFormData) => {
    if (!superCV || !hasAnySelectedContent(superCV)) {
      showError('No nodes selected. Please select at least one node to export.');
      return;
    }

    try {
      const filename = await filenameMutation.mutateAsync(data.filename);
      await exportMutation.mutateAsync({ filename, content: buildExportDocument(superCV) });
      onOpenChange(false);
      showSuccess(`CV exported successfully as ${filename}`);
    } catch {
      showError('Export failed. Please try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[400px]">
        <ScreenBadge screenId="S002D1" />
        <DialogHeader>
          <DialogTitle id="s002d1-title">Export Your CV</DialogTitle>
          <DialogDescription id="s002d1-prompt">
            Please enter a qualified name for your exported CV.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="s002d1-name">CV Name</Label>
              <Input
                id="s002d1-name"
                placeholder="GeneratedCV"
                aria-invalid={errors.filename ? 'true' : 'false'}
                aria-describedby={errors.filename ? 's002d1-name-error' : undefined}
                {...register('filename')}
              />
              {errors.filename && (
                <span id="s002d1-name-error" className="text-sm text-error">
                  {errors.filename.message}
                </span>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button id="s002d1-cancel" type="button" variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
            <Button id="s002d1-export" type="submit" disabled={!isValid || exportMutation.isPending || filenameMutation.isPending}>
              Export
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
