// S000 — Welcome Screen / Landing Page (SPEC.md §3.1)
// UPDATED 2026-08-17 (Supabase migration): OLD — `useHealthCheck()` polled a
// custom `/health` endpoint. NEW — `useValidateSession()` both checks
// Supabase reachability (5s guard, SPEC.md §3.1.3 point 1) and the returning-
// user session (point 2) in a single Supabase call.
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenBadge } from '@/components/common/ScreenBadge';
import { Spinner } from '@/components/common/Spinner';
import { Button } from '@/components/ui/button';
import { useMessage } from '@/hooks/useMessage';
import { useAuthStore } from '../stores/authStore';
import { useValidateSession } from '../hooks/useAuth';
import { LoginPopup } from './LoginPopup';

// NOTE: session validation itself is triggered once, app-wide, in
// app/RootLayout.tsx (App Shell) — this screen only reacts to the resulting
// isAuthenticated flag so it works no matter which route mounted first.
export function WelcomeScreen() {
  const navigate = useNavigate();
  const { showError } = useMessage();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const session = useValidateSession();

  // SPEC.md §3.1.3: a valid restored session -> skip S001 entirely and go
  // straight to S002.
  useEffect(() => {
    if (isAuthenticated) navigate('/app', { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (session.isError) {
      showError('Authentication service is unavailable. Please try again later.', {
        actionLabel: 'Retry',
        onAction: () => session.refetch(),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.isError, session.refetch, showError]);

  return (
    <div
      id="s000-container"
      className="relative flex min-h-screen flex-col items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)' }}
    >
      <ScreenBadge screenId="S000" />

      <div className="flex w-full max-w-[480px] flex-col items-center px-4 text-center">
        <svg
          id="s000-logo"
          width={64}
          height={64}
          viewBox="0 0 64 64"
          fill="none"
          aria-label="Applai Resume Generator Logo"
          className="mb-6 text-primary"
        >
          <rect x="8" y="6" width="36" height="48" rx="4" stroke="currentColor" strokeWidth="3" />
          <line x1="16" y1="18" x2="36" y2="18" stroke="currentColor" strokeWidth="3" />
          <line x1="16" y1="28" x2="36" y2="28" stroke="currentColor" strokeWidth="3" />
          <line x1="16" y1="38" x2="28" y2="38" stroke="currentColor" strokeWidth="3" />
          <circle cx="46" cy="46" r="12" fill="#3B82F6" />
          <path d="M40 46l4 4 8-8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        <h1 id="s000-title" className="text-2xl font-semibold text-primary">
          Applai Resume Generator
        </h1>
        <p id="s000-welcome" className="mt-2 text-text-secondary">
          Create professional resumes powered by AI.
        </p>

        <div id="s000-login-container" className="mt-8 w-full">
          {session.isPending ? (
            <div id="s000-spinner" role="status" aria-live="polite" className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : session.isSuccess ? (
            <LoginPopup />
          ) : session.isError ? (
            <Button id="s000-retry" onClick={() => session.refetch()}>
              Retry
            </Button>
          ) : null}
        </div>
      </div>

      <footer id="s000-footer" className="absolute bottom-4 flex gap-4 text-xs text-text-secondary">
        <a href="#">Privacy Policy</a>
        <a href="#">Terms of Service</a>
        <a href="#">Contact Support</a>
      </footer>
    </div>
  );
}
