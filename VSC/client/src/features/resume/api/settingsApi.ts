// P16 — S002S1 Settings Panel Pattern: API layer (PATTERNS.md, SPEC.md §3.8)
import { apiClient, createRequestSignal } from '@/lib/api';
import { UserSettings } from '@/types';

export const settingsKeys = { settings: ['user', 'settings'] as const };

export async function getUserSettings() {
  return apiClient<UserSettings>('/user/settings', { signal: createRequestSignal() });
}

export async function patchUserSettings(patch: Partial<UserSettings>) {
  return apiClient<UserSettings>('/user/settings', {
    method: 'PATCH',
    body: JSON.stringify(patch),
    signal: createRequestSignal(),
  });
}
