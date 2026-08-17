// UPDATED 2026-08-17 (Supabase migration): OLD — a custom `User` interface
// (id/email/name/role/avatarUrl) modeled a bespoke backend user, and
// `GistFile` modeled a backend-proxied GIST listing. NEW — auth now uses
// `@supabase/supabase-js`'s own `User` type directly (see
// features/auth/stores/authStore.ts), so no app-level User type is needed
// here; `SupabaseStorageFile` replaces `GistFile` for Storage listings.
//
// UPDATED 2026-08-17 (Reactive Resume schema mapping): OLD — `MasterCVNode`
// was a generic, app-invented recursive tree. NEW — see types/superCV.ts for
// the real `SuperCVDocument` schema that replaces it (DECISIONS.md ADR-018).

export interface UserSettings {
  masterResumeFile?: string;
  preferredCvName?: string;
}

export interface SupabaseStorageFile {
  name: string;
  path: string;
  size?: number;
  updated_at?: string;
}
