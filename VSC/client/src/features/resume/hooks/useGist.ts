// P06 — GIST API hooks (PATTERNS.md)
import { useMutation, useQuery } from '@tanstack/react-query';
import { gistKeys, listGistFiles, loadGistFile, checkFilenameExists, exportGistFile } from '../api/gistApi';
import { MasterCVNode } from '@/types';

export function useGistFiles(gistUrl: string) {
  return useQuery({
    queryKey: gistKeys.files(gistUrl),
    queryFn: () => listGistFiles(gistUrl),
    enabled: !!gistUrl,
    retry: false,
  });
}

export function useLoadGist(gistUrl: string, filename: string) {
  return useQuery({
    queryKey: gistKeys.load(gistUrl, filename),
    queryFn: () => loadGistFile(gistUrl, filename),
    enabled: false, // triggered manually via refetch() on Import click (SPEC §3.5.3)
    retry: false,
  });
}

export function useExportGist() {
  return useMutation({
    mutationFn: ({ filename, content }: { filename: string; content: MasterCVNode[] }) =>
      exportGistFile(filename, content),
  });
}

export function useCheckFilename() {
  return useMutation({ mutationFn: checkFilenameExists });
}
