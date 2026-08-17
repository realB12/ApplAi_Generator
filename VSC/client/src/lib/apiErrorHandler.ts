// P08 — API Error Handler (PATTERNS.md)
import { useMessageStore } from '@/hooks/useMessage';

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
  const { show } = useMessageStore.getState();

  if (isApiErrorShape(error)) {
    show('error', error.error.message, { persistent: error.error.code === 'VALIDATION_ERROR' });
  } else if (error instanceof Error) {
    show('error', error.message);
  } else {
    show('error', 'An unexpected error occurred. Please try again.');
  }
}
