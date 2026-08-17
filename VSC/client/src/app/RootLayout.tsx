// App Shell (Phase 2): renders the single global SMSG MessagePopup instance
// and triggers the silent session-restore check on every app mount,
// regardless of which route the user lands on directly.
import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { MessagePopup } from '@/components/common/MessagePopup';
import { useMessageStore } from '@/hooks/useMessage';
import { useAuthStore } from '@/app/store';
import { useValidateSession } from '@/features/auth/hooks/useAuth';

export function RootLayout() {
  const msg = useMessageStore((s) => s.msg);
  const hide = useMessageStore((s) => s.hide);

  const setLoading = useAuthStore((s) => s.setLoading);
  const validate = useValidateSession();

  useEffect(() => {
    if (validate.isFetched) setLoading(false);
  }, [validate.isFetched, setLoading]);

  return (
    <>
      <Outlet />
      <MessagePopup
        type={msg.type}
        title={msg.title}
        message={msg.message}
        actionLabel={msg.actionLabel}
        onAction={msg.onAction}
        persistent={msg.persistent}
        open={msg.open}
        onOpenChange={hide}
      />
    </>
  );
}
