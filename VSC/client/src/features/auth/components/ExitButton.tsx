// P13 — EXIT Button Pattern (PATTERNS.md). Hard termination — no cleanup,
// no server call, no waiting for pending transactions (TECH.md §7).
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessagePopup } from '@/components/common/MessagePopup';
import { abortAllRequests } from '@/lib/api';

export function ExitButton({ id }: { id: string }) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleConfirm = () => {
    setConfirmOpen(false);
    abortAllRequests();
    if (typeof window.close === 'function') {
      window.close();
    }
    window.location.href = 'about:blank';
  };

  return (
    <>
      <Button id={id} type="button" variant="secondary" onClick={() => setConfirmOpen(true)}>
        EXIT
      </Button>
      <MessagePopup
        type="warning"
        title="Confirm Exit"
        message="Are you sure you want to exit the application? Any unsaved changes will be lost."
        actionLabel="Exit"
        onAction={handleConfirm}
        persistent
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
      />
    </>
  );
}
