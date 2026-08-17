// P09 — Logout Confirmation Pattern (PATTERNS.md), fixed 2026-08-17: no
// longer calls the server logout endpoint (see useLogout in hooks/useAuth.ts).
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLogout } from '../hooks/useAuth';
import { MessagePopup } from '@/components/common/MessagePopup';

export function LogoutButton({ id = 's002-logout' }: { id?: string }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const performLogout = useLogout();

  const handleConfirm = () => {
    setConfirmOpen(false);
    performLogout();
  };

  return (
    <>
      <Button id={id} type="button" variant="secondary" onClick={() => setConfirmOpen(true)}>
        LOGOUT
      </Button>
      <MessagePopup
        type="warning"
        title="Confirm Logout"
        message="Are you sure you want to logout? Any unsaved changes will be lost."
        actionLabel="Logout"
        onAction={handleConfirm}
        persistent
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
      />
    </>
  );
}
