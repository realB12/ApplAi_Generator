// S002S1 — Settings Panel PopUp (PATTERNS.md P16, SPEC.md §3.8).
// UPDATED 2026-08-17 (Supabase migration): OLD — persisted a configurable
// `gistUrl` with URL validation. NEW — the Storage path is fixed to
// `Applai/SuperCV` (shown as a read-only note); settings retain only
// `masterResumeFile`/`preferredCvName`.
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ScreenBadge } from '@/components/common/ScreenBadge';
import { MessagePopup } from '@/components/common/MessagePopup';
import { useUserSettings, useSaveSettings } from '../hooks/useSettings';
import { useMessage } from '@/hooks/useMessage';

const settingsSchema = z.object({
  masterResumeFile: z
    .string()
    .max(60, 'Filename must be at most 60 characters. Only letters, numbers, dots, hyphens, and underscores allowed.')
    .regex(
      /^[a-zA-Z0-9_.-]*$/,
      'Filename must be at most 60 characters. Only letters, numbers, dots, hyphens, and underscores allowed.'
    )
    .optional()
    .or(z.literal('')),
  preferredCvName: z
    .string()
    .max(23, 'Name must be 3\u201323 characters. Only letters, numbers, hyphens, and underscores allowed.')
    .regex(
      /^([a-zA-Z0-9_-]{3,23})?$/,
      'Name must be 3\u201323 characters. Only letters, numbers, hyphens, and underscores allowed.'
    )
    .optional()
    .or(z.literal('')),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

interface SettingsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsPanel({ open, onOpenChange }: SettingsPanelProps) {
  const { data: settings } = useUserSettings();
  const saveMutation = useSaveSettings();
  const { showSuccess, showError } = useMessage();
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: { masterResumeFile: '', preferredCvName: '' },
  });

  useEffect(() => {
    if (open && settings) {
      reset({
        masterResumeFile: settings.masterResumeFile ?? '',
        preferredCvName: settings.preferredCvName ?? '',
      });
    }
  }, [open, settings, reset]);

  const closeOrConfirm = () => {
    if (isDirty) {
      setConfirmDiscardOpen(true);
      return;
    }
    onOpenChange(false);
  };

  const onSubmit = async (data: SettingsFormData) => {
    try {
      await saveMutation.mutateAsync(data);
      onOpenChange(false);
      showSuccess('Settings saved successfully.');
    } catch {
      showError('Failed to save settings. Please try again.');
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={closeOrConfirm}>
        <DialogContent className="sm:max-w-[420px]">
          <ScreenBadge screenId="S002S1" />
          <DialogHeader>
            <DialogTitle id="s002s1-title">User Settings</DialogTitle>
          </DialogHeader>
          <p id="s002s1-storage-path" className="text-xs text-text-secondary">
            Supabase Storage: Applai/SuperCV
          </p>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="s002s1-masterresume">Preferred SuperCV File</Label>
                <Input
                  id="s002s1-masterresume"
                  placeholder="SuperCV.json"
                  aria-invalid={errors.masterResumeFile ? 'true' : 'false'}
                  aria-describedby={errors.masterResumeFile ? 's002s1-masterresume-error' : undefined}
                  {...register('masterResumeFile')}
                />
                {errors.masterResumeFile && (
                  <span id="s002s1-masterresume-error" className="text-sm text-error">
                    {errors.masterResumeFile.message}
                  </span>
                )}
              </div>
              <div>
                <Label htmlFor="s002s1-cvname">Preferred CV Export Name</Label>
                <Input
                  id="s002s1-cvname"
                  placeholder="GeneratedCV"
                  aria-invalid={errors.preferredCvName ? 'true' : 'false'}
                  aria-describedby={errors.preferredCvName ? 's002s1-cvname-error' : undefined}
                  {...register('preferredCvName')}
                />
                {errors.preferredCvName && (
                  <span id="s002s1-cvname-error" className="text-sm text-error">
                    {errors.preferredCvName.message}
                  </span>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button id="s002s1-cancel" type="button" variant="secondary" onClick={closeOrConfirm}>
                Cancel
              </Button>
              <Button id="s002s1-save" type="submit" disabled={!isDirty || saveMutation.isPending}>
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <MessagePopup
        type="warning"
        title="Unsaved Changes"
        message="You have unsaved changes. Discard them?"
        actionLabel="Discard"
        onAction={() => {
          setConfirmDiscardOpen(false);
          onOpenChange(false);
        }}
        persistent
        open={confirmDiscardOpen}
        onOpenChange={setConfirmDiscardOpen}
      />
    </>
  );
}
