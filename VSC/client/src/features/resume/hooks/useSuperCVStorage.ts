// P06 — Supabase Storage hooks (PATTERNS.md). Replaces features/resume/hooks/useGist.ts.
import { useMutation, useQuery } from '@tanstack/react-query';
import type { SuperCVDocument } from '@/types/superCV';
import {
  superCVKeys,
  listSuperCVFiles,
  loadSuperCVFile,
  uploadSuperCVFile,
  getAvailableExportFilename,
} from '../api/supercvStorageApi';

export function useSuperCVFiles() {
  return useQuery({ queryKey: superCVKeys.files, queryFn: listSuperCVFiles });
}

export function useLoadSuperCV(filename: string) {
  return useQuery({
    queryKey: superCVKeys.load(filename),
    queryFn: () => loadSuperCVFile(filename),
    enabled: Boolean(filename),
  });
}

export function useExportSuperCV() {
  return useMutation({
    mutationFn: ({ filename, content }: { filename: string; content: SuperCVDocument }) =>
      uploadSuperCVFile(filename, content),
  });
}

export function useAvailableExportFilename() {
  return useMutation({ mutationFn: getAvailableExportFilename });
}
