// Leveled logger (DEV_GUIDES/Architecture/TestMode-Concept.md, Design Rule 4).
// Replaces ad-hoc `console.log` sprinkled around; gated by TestMode's
// `logLevel` so production keeps only warn/error noise.
import { test } from '@/config/testmode';

const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 } as const;
type LogLevel = keyof typeof LEVELS;

// Outside TestMode this resolves to 'warn' regardless of any stray .env
// value, matching TestMode's own production hard gate (config/testmode.ts).
const threshold: number = LEVELS[test.enabled ? test.logLevel : 'warn'];

function emit(level: LogLevel, label: string, args: unknown[]): void {
  if (LEVELS[level] < threshold) return;
  // eslint-disable-next-line no-console -- this IS the leveled console sink
  console[level](label, ...args);
}

export const log = {
  debug: (...args: unknown[]): void => emit('debug', '[DBG]', args),
  info: (...args: unknown[]): void => emit('info', '[INF]', args),
  warn: (...args: unknown[]): void => emit('warn', '[WARN]', args),
  error: (...args: unknown[]): void => emit('error', '[ERR]', args),
};
