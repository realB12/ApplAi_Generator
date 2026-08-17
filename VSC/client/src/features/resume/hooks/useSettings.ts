// P16 — useSettings hook (PATTERNS.md, SPEC.md §3.8)
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { settingsKeys, getUserSettings, patchUserSettings } from '../api/settingsApi';
import { UserSettings } from '@/types';
import { useUIStore } from '@/app/store';

export function useUserSettings() {
  const setSettings = useUIStore((s) => s.setSettings);
  return useQuery({
    queryKey: settingsKeys.settings,
    queryFn: async () => {
      const data = await getUserSettings();
      setSettings(data);
      return data;
    },
  });
}

export function useSaveSettings() {
  const queryClient = useQueryClient();
  const setSettings = useUIStore((s) => s.setSettings);
  return useMutation({
    mutationFn: (patch: Partial<UserSettings>) => patchUserSettings(patch),
    onSuccess: (data) => {
      queryClient.setQueryData(settingsKeys.settings, data);
      setSettings(data);
    },
  });
}
