// P16 — S002S1 Settings Panel Pattern: API layer (PATTERNS.md, SPEC.md §3.8).
// UPDATED 2026-08-17 (Supabase migration): OLD — `UserSettings` and the
// settings API persisted `gistUrl` through `/user/settings`. NEW — settings
// contain only `masterResumeFile`/`preferredCvName`, persisted in an
// RLS-scoped Supabase table `user_settings`.
import { getSupabaseClient } from '@/lib/supabase';
import { UserSettings } from '@/types';

export const settingsKeys = { settings: ['user', 'settings'] as const };

export async function getUserSettings(): Promise<UserSettings> {
  const {
    data: { user },
  } = await getSupabaseClient().auth.getUser();
  if (!user) throw new Error('Unauthenticated');
  const { data, error } = await getSupabaseClient()
    .from('user_settings')
    .select('master_resume_file, preferred_cv_name')
    .eq('user_id', user.id)
    .maybeSingle();
  if (error) throw error;
  return {
    masterResumeFile: data?.master_resume_file ?? undefined,
    preferredCvName: data?.preferred_cv_name ?? undefined,
  };
}

export async function patchUserSettings(patch: Partial<UserSettings>): Promise<UserSettings> {
  const {
    data: { user },
  } = await getSupabaseClient().auth.getUser();
  if (!user) throw new Error('Unauthenticated');
  const { error } = await getSupabaseClient().from('user_settings').upsert({
    user_id: user.id,
    master_resume_file: patch.masterResumeFile ?? null,
    preferred_cv_name: patch.preferredCvName ?? null,
  });
  if (error) throw error;
  return patch;
}
