// P06 — GIST API Pattern (PATTERNS.md), fixed 2026-08-17: gistUrl is REQUIRED
// on /gist/files and /gist/load per TECH.md §6's API contract.
import { apiClient, createRequestSignal } from '@/lib/api';
import { MasterCVNode, GistFile } from '@/types';

export const gistKeys = {
  files: (gistUrl: string) => ['gist', 'files', gistUrl] as const,
  load: (gistUrl: string, filename: string) => ['gist', 'load', gistUrl, filename] as const,
};

export async function listGistFiles(gistUrl: string) {
  return apiClient<GistFile[]>(`/gist/files?gistUrl=${encodeURIComponent(gistUrl)}`, {
    signal: createRequestSignal(),
  });
}

export async function loadGistFile(gistUrl: string, filename: string) {
  return apiClient<MasterCVNode[]>(
    `/gist/load?gistUrl=${encodeURIComponent(gistUrl)}&filename=${encodeURIComponent(filename)}`,
    { signal: createRequestSignal() }
  );
}

export async function checkFilenameExists(prefix: string) {
  return apiClient<{ exists: boolean; nextSuffix?: number }>(
    `/gist/check?prefix=${encodeURIComponent(prefix)}`,
    { signal: createRequestSignal() }
  );
}

export async function exportGistFile(filename: string, content: MasterCVNode[]) {
  return apiClient<{ filename: string; url: string }>('/gist/export', {
    method: 'POST',
    body: JSON.stringify({ filename, content }),
    signal: createRequestSignal(),
  });
}
