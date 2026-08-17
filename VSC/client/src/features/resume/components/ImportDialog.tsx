// S002D2 — GIST MasterResume IMPORT Dialogue PopUp (PATTERNS.md P15, SPEC.md §3.5)
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
import { useGistFiles, useLoadGist } from '../hooks/useGist';
import { useResumeStore, useUIStore } from '@/app/store';
import { useMessage } from '@/hooks/useMessage';

const importSchema = z.object({
  gistUrl: z
    .string()
    .min(1, 'Please enter a valid HTTPS URL.')
    .max(500)
    .regex(/^https:\/\/[a-zA-Z0-9._~:/?#[\]@!$&'()*+,;=-]+$/, 'Please enter a valid HTTPS URL.'),
  filename: z
    .string()
    .min(3, 'Filename must be 3\u201360 characters.')
    .max(60, 'Filename must be 3\u201360 characters.')
    .regex(/^[a-zA-Z0-9_.-]+$/, 'Only letters, numbers, dots, hyphens, and underscores allowed.'),
});

type ImportFormData = z.infer<typeof importSchema>;

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportDialog({ open, onOpenChange }: ImportDialogProps) {
  const cachedGistUrl = useResumeStore((s) => s.gistUrl);
  const settings = useUIStore((s) => s.settings);
  // Pre-fill cascade (SPEC §3.5.3): session cache -> user settings -> env var
  const defaultGistUrl =
    cachedGistUrl || settings?.gistUrl || (import.meta.env.VITE_DEFAULT_GIST_URL as string) || '';
  const defaultFilename = settings?.masterResumeFile || '';

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isValid },
  } = useForm<ImportFormData>({
    resolver: zodResolver(importSchema),
    defaultValues: { gistUrl: defaultGistUrl, filename: defaultFilename },
    mode: 'onBlur',
  });

  useEffect(() => {
    if (open) {
      reset({ gistUrl: defaultGistUrl, filename: defaultFilename });
      setTimeout(() => {
        const input = document.getElementById('s002d2-url') as HTMLInputElement | null;
        input?.focus();
        input?.select();
      }, 50);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const gistUrl = watch('gistUrl');
  const filesQuery = useGistFiles(importSchema.shape.gistUrl.safeParse(gistUrl).success ? gistUrl : '');

  useEffect(() => {
    if (filesQuery.data?.length && !defaultFilename) {
      const firstJson = filesQuery.data.find((f) => f.filename.toLowerCase().endsWith('.json'));
      if (firstJson) setValue('filename', firstJson.filename);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filesQuery.data]);

  const setMasterCV = useResumeStore((s) => s.setMasterCV);
  const setGistSource = useResumeStore((s) => s.setGistSource);
  const { showSuccess, showError } = useMessage();
  const loadQuery = useLoadGist(gistUrl, watch('filename'));
  const setTransactionRunning = useUIStore((s) => s.setTransactionRunning);

  useEffect(() => {
    setTransactionRunning(loadQuery.isFetching);
  }, [loadQuery.isFetching, setTransactionRunning]);

  const handleCancel = () => onOpenChange(false); // no side effects (SPEC §3.5.3)

  const onSubmit = async (data: ImportFormData) => {
    try {
      const result = await loadQuery.refetch({ throwOnError: true });
      if (!result.data) throw new Error('EMPTY');
      setMasterCV(result.data);
      setGistSource(data.gistUrl, data.filename);
      onOpenChange(false);
      showSuccess(`MasterResume loaded: ${data.filename}`);
    } catch {
      showError('GIST not found or not accessible. Please check the URL and try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[420px]">
        <ScreenBadge screenId="S002D2" />
        <DialogHeader>
          <DialogTitle id="s002d2-title">Import Master CV</DialogTitle>
          <DialogDescription id="s002d2-prompt">
            Please enter the GIST URL and then choose a file for import.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="s002d2-url">GIST URL</Label>
              <Input
                id="s002d2-url"
                placeholder="https://gist.github.com/..."
                aria-invalid={errors.gistUrl ? 'true' : 'false'}
                aria-describedby={errors.gistUrl ? 's002d2-url-error' : undefined}
                {...register('gistUrl')}
              />
              {errors.gistUrl && (
                <span id="s002d2-url-error" className="text-sm text-error">
                  {errors.gistUrl.message}
                </span>
              )}
            </div>
            <div>
              <Label htmlFor="s002d2-filename">MasterResume File Name</Label>
              <Input
                id="s002d2-filename"
                placeholder="MasterResume.json"
                aria-invalid={errors.filename ? 'true' : 'false'}
                aria-describedby={errors.filename ? 's002d2-filename-error' : undefined}
                {...register('filename')}
              />
              {errors.filename && (
                <span id="s002d2-filename-error" className="text-sm text-error">
                  {errors.filename.message}
                </span>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button id="s002d2-cancel" type="button" variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
            <Button id="s002d2-import" type="submit" disabled={!isValid || loadQuery.isFetching}>
              Import
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
