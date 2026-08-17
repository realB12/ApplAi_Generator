// P04 — Modal / Dialog Pattern: SMSG (SPEC.md §3.7)
import { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { ScreenBadge } from './ScreenBadge';

export type MessageType = 'error' | 'warning' | 'success' | 'info';

export interface MessagePopupProps {
  type: MessageType;
  title?: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  persistent?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const iconMap = {
  error: { Icon: AlertCircle, color: 'text-error', title: 'Error' },
  warning: { Icon: AlertTriangle, color: 'text-warning', title: 'Warning' },
  success: { Icon: CheckCircle, color: 'text-success', title: 'Success' },
  info: { Icon: Info, color: 'text-info', title: 'Information' },
};

// SPEC.md §3.7.4: success/info auto-dismiss after 5s; error/warning require manual
// dismissal unless used as a confirmation (persistent).
export function MessagePopup({
  type,
  title,
  message,
  actionLabel = 'OK',
  onAction,
  persistent = false,
  open,
  onOpenChange,
}: MessagePopupProps) {
  const { Icon, color, title: defaultTitle } = iconMap[type];

  useEffect(() => {
    if (!open || persistent) return;
    if (type === 'error' || type === 'warning') return;
    const timer = setTimeout(() => onOpenChange(false), 5000);
    return () => clearTimeout(timer);
  }, [open, type, persistent, onOpenChange]);

  const handleAction = () => {
    onAction?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={persistent ? undefined : onOpenChange}>
      <DialogContent
        className="sm:max-w-[400px]"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="smsg-title"
        hideClose={persistent}
        onEscapeKeyDown={persistent ? (e) => e.preventDefault() : undefined}
        onInteractOutside={persistent ? (e) => e.preventDefault() : undefined}
      >
        <ScreenBadge screenId="SMSG" />
        <DialogHeader className="flex flex-row items-start gap-3">
          <Icon id="smsg-icon" className={`h-6 w-6 ${color} shrink-0`} aria-hidden="true" />
          <div>
            <DialogTitle id="smsg-title">{title || defaultTitle}</DialogTitle>
            <DialogDescription id="smsg-message" className="mt-1">
              {message}
            </DialogDescription>
          </div>
        </DialogHeader>
        <DialogFooter>
          <Button id="smsg-action" onClick={handleAction}>
            {actionLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
