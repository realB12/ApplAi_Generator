// P14 — CANCEL Button Pattern (PATTERNS.md, SPEC.md §3.6.5)
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessagePopup } from '@/components/common/MessagePopup';
import { abortAllRequests } from '@/lib/api';
import { useResumeStore } from '@/app/store';
import { useMessage } from '@/hooks/useMessage';

interface CancelButtonProps {
  isTransactionRunning: boolean;
}

export function CancelButton({ isTransactionRunning }: CancelButtonProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const isDirty = useResumeStore((s) => s.isDirty);
  const resetAllToSelected = useResumeStore((s) => s.resetAllToSelected);
  const { showInfo } = useMessage();

  const handleClick = () => {
    // Case C — nothing to cancel
    if (!isTransactionRunning && !isDirty) {
      showInfo('Nothing to cancel.');
      return;
    }
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    setConfirmOpen(false);
    if (isTransactionRunning) {
      // Case A — abort in-flight requests, stop spinners
      abortAllRequests();
      return;
    }
    // Case B — discard modifications: reset every node to selected
    resetAllToSelected();
  };

  const message = isTransactionRunning
    ? 'Cancel running transactions? All pending operations will be aborted.'
    : 'Discard all modifications and reset all nodes to selected?';

  return (
    <>
      <Button id="s002-cancel" type="button" variant="secondary" onClick={handleClick}>
        CANCEL
      </Button>
      <MessagePopup
        type="warning"
        title="Confirm Cancel"
        message={message}
        actionLabel="Confirm"
        onAction={handleConfirm}
        persistent
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
      />
    </>
  );
}
