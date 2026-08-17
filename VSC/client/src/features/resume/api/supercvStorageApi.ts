// P06 — Supabase Storage API Pattern (PATTERNS.md).
// UPDATED 2026-08-17 (Supabase migration): OLD — `gistApi.ts` called
// `/api/gist/files`, `/load`, `/export`, and `/check` through a backend.
// NEW — calls the fixed Supabase Storage bucket "Applai", folder "SuperCV"
// directly, and derives filename collisions from a listing.
import { getSupabaseClient } from '@/lib/supabase';
import type { SuperCVDocument } from '@/types/superCV';
import type { SupabaseStorageFile } from '@/types';

const BUCKET = 'Applai';
const FOLDER = 'SuperCV';
const objectPath = (filename: string) => `${FOLDER}/${filename}`;

export const superCVKeys = {
  files: ['supabase-storage', BUCKET, FOLDER] as const,
  load: (filename: string) => ['supabase-storage', BUCKET, FOLDER, filename] as const,
};

export async function listSuperCVFiles(): Promise<SupabaseStorageFile[]> {
  const { data, error } = await getSupabaseClient().storage.from(BUCKET).list(FOLDER);
  if (error) throw error;
  return (data ?? []).map((file) => ({
    name: file.name,
    path: objectPath(file.name),
    size: file.metadata?.size,
    updated_at: file.updated_at ?? undefined,
  }));
}

// UPDATED 2026-08-17 (Reactive Resume schema mapping): OLD returned
// MasterCVNode[]. NEW returns the SuperCVDocument as-is — no transform to/from
// a generic tree.
export async function loadSuperCVFile(filename: string): Promise<SuperCVDocument> {
  const { data, error } = await getSupabaseClient().storage.from(BUCKET).download(objectPath(filename));
  if (error) throw error;
  return JSON.parse(await data.text()) as SuperCVDocument; // TODO: validate with Zod before storing in production
}

export async function getAvailableExportFilename(baseName: string): Promise<string> {
  const names = new Set((await listSuperCVFiles()).map((file) => file.name.toLowerCase()));
  const initial = `${baseName}.JSON`;
  if (!names.has(initial.toLowerCase())) return initial;
  for (let suffix = 1; suffix <= 99; suffix += 1) {
    const candidate = `${baseName}${String(suffix).padStart(2, '0')}.JSON`;
    if (!names.has(candidate.toLowerCase())) return candidate;
  }
  throw new Error('Export failed: too many files with this name. Please choose a different name.');
}

// `content` here is already the PRUNED document produced by buildExportDocument()
// (P07) — this function only uploads; it does not know about `hidden` at all.
export async function uploadSuperCVFile(filename: string, content: SuperCVDocument): Promise<void> {
  const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
  const { error } = await getSupabaseClient().storage.from(BUCKET).upload(objectPath(filename), blob, { upsert: false });
  if (error) throw error;
}
