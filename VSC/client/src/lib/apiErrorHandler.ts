// P08 — API Error Handler (PATTERNS.md).
// UPDATED 2026-08-17 (Supabase migration): the custom `{ error: { code,
// message } }` envelope is kept only as a legacy fallback shape. Supabase's
// `AuthApiError`/`StorageApiError` are plain `Error` subclasses with a
// `.message`, so they already fall through to the `error instanceof Error`
// branch below without any special-casing.
import { useMessageStore } from '@/hooks/useMessage';
import { test } from '@/config/testmode';
import { log } from '@/utils/logger';

interface ApiErrorShape {
  error: { message: string; code: string };
}

function isApiErrorShape(value: unknown): value is ApiErrorShape {
  return (
    typeof value === 'object' &&
    value !== null &&
    'error' in value &&
    typeof (value as ApiErrorShape).error?.message === 'string'
  );
}

export function handleApiError(error: unknown): void {
  // TestMode Need item 2 (DEV_GUIDES/Architecture/TestMode-Concept.md):
  // additional internal messaging/debug info, without changing show()'s
  // existing production message contract below.
  if (test.enabled) log.debug('[apiErrorHandler]', error);

  const { show } = useMessageStore.getState();

  if (isApiErrorShape(error)) {
    show('error', error.error.message, { persistent: error.error.code === 'VALIDATION_ERROR' });
  } else if (error instanceof Error) {
    show('error', error.message);
  } else {
    show('error', 'An unexpected error occurred. Please try again.');
  }
}
