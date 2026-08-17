// P01 — Screen Component Pattern (PATTERNS.md)
export function ScreenBadge({ screenId }: { screenId: string }) {
  return (
    <div
      id={`${screenId.toLowerCase()}-badge`}
      className="fixed top-2 left-2 z-[9999] rounded-full bg-black/60 px-1.5 py-0.5 text-[10px] font-mono text-white pointer-events-none select-none"
      aria-hidden="true"
    >
      {screenId}
    </div>
  );
}
