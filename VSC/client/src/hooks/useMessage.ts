// P08 — Error Handling Pattern (PATTERNS.md), fixed 2026-08-17 to be a GLOBAL
// Zustand-backed store instead of local per-component useState. SPEC.md §3.7.4
// requires "only one SMSG visible at a time" app-wide — that is only possible
// with shared state, not a state hook re-instantiated inside every component
// that wants to show a message. The single <MessagePopup /> instance is
// rendered once at the app root (see app/RootLayout.tsx) and reads this store.
import { create } from 'zustand';
import type { MessageType } from '@/components/common/MessagePopup';

interface MessageState {
  open: boolean;
  type: MessageType;
  title?: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  persistent?: boolean;
}

interface MessageOptions {
  title?: string;
  actionLabel?: string;
  onAction?: () => void;
  persistent?: boolean;
}

interface MessageStore {
  msg: MessageState;
  show: (type: MessageType, message: string, options?: MessageOptions) => void;
  hide: () => void;
}

export const useMessageStore = create<MessageStore>((set) => ({
  msg: { open: false, type: 'info', message: '' },
  show: (type, message, options) =>
    set({ msg: { open: true, type, message, ...options } }),
  hide: () => set((state) => ({ msg: { ...state.msg, open: false } })),
}));

// Convenience hook mirroring the original P08 API surface.
export function useMessage() {
  const show = useMessageStore((s) => s.show);
  const hide = useMessageStore((s) => s.hide);

  return {
    hide,
    showError: (message: string, opts?: MessageOptions) => show('error', message, opts),
    showWarning: (message: string, opts?: MessageOptions) => show('warning', message, opts),
    showSuccess: (message: string, opts?: MessageOptions) => show('success', message, opts),
    showInfo: (message: string, opts?: MessageOptions) => show('info', message, opts),
  };
}
