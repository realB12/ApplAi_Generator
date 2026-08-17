// S001 — Login Screen (Popup). PATTERNS.md P03, extended per SPEC.md §3.2
// with the EXIT button, failed-attempt counter, hCaptcha (after 3 fails),
// and 15-min lockout (after 5 fails / HTTP 429).
// UPDATED 2026-08-17 (Supabase migration): OLD — `login()` posted to a custom
// `/auth/login` endpoint and returned a custom `{ status, error }` shape on
// failure. NEW — `login()` calls `supabase.auth.signInWithPassword()`;
// failures surface as a Supabase `AuthApiError` (`.status`/`.message`).
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Spinner } from '@/components/common/Spinner';
import { ScreenBadge } from '@/components/common/ScreenBadge';
import { PasswordToggle } from './PasswordToggle';
import { ExitButton } from './ExitButton';
import { useLogin } from '../hooks/useAuth';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address').max(254),
  password: z.string().min(12, 'Password must be at least 12 characters').max(128),
  rememberMe: z.boolean().default(false),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface AuthApiErrorLike {
  status?: number;
  message?: string;
}

export function LoginPopup() {
  const {
    register,
    handleSubmit,
    setFocus,
    resetField,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  // SPEC.md §1 / §3.2.3: CAPTCHA required after 3 failed attempts, 15-min lockout after 5.
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [captchaToken, setCaptchaToken] = useState<string | undefined>();
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const captchaRequired = failedAttempts >= 3;
  const isLocked = lockedUntil !== null && Date.now() < lockedUntil;

  const loginMutation = useLogin();
  const hcaptchaSitekey = import.meta.env.VITE_HCAPTCHA_SITEKEY as string | undefined;

  const onSubmit = (data: LoginFormData) => {
    if (isLocked) return;
    if (captchaRequired && !captchaToken) return; // hCaptcha must resolve first
    setServerError(null);

    loginMutation.mutate(
      { ...data, captchaToken },
      {
        onError: (err: unknown) => {
          const authErr = err as AuthApiErrorLike;
          if (authErr?.status === 429) {
            setLockedUntil(Date.now() + 15 * 60 * 1000);
            setServerError('Too many attempts. Please try again in 15 minutes.');
            return;
          }
          setFailedAttempts((n) => n + 1);
          setServerError(authErr?.message ?? 'Invalid email or password.');
          resetField('password');
          setFocus('password');
        },
      }
    );
  };

  return (
    <div
      id="s001-container"
      className="relative w-full max-w-[420px] rounded-xl border border-border bg-surface p-8 shadow-lg"
    >
      <ScreenBadge screenId="S001" />
      <h2 id="s001-title" className="mb-6 text-xl font-semibold text-primary">
        Sign in to your account
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-4">
          <div>
            <Label htmlFor="s001-email">Email address</Label>
            <Input
              id="s001-email"
              type="email"
              placeholder="you@company.com"
              autoComplete="email"
              aria-invalid={errors.email ? 'true' : 'false'}
              aria-describedby={errors.email ? 's001-email-error' : undefined}
              {...register('email')}
            />
            {errors.email && (
              <span id="s001-email-error" className="text-sm text-error">
                {errors.email.message}
              </span>
            )}
          </div>

          <div>
            <Label htmlFor="s001-password">Password</Label>
            <div className="relative">
              <Input
                id="s001-password"
                type="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                aria-invalid={errors.password ? 'true' : 'false'}
                aria-describedby={errors.password ? 's001-password-error' : undefined}
                {...register('password')}
              />
              <PasswordToggle inputId="s001-password" />
            </div>
            {errors.password && (
              <span id="s001-password-error" className="text-sm text-error">
                {errors.password.message}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="s001-remember" {...register('rememberMe')} />
            <Label htmlFor="s001-remember">Remember me for 7 days</Label>
          </div>

          {captchaRequired && hcaptchaSitekey && (
            <div id="s001-captcha">
              <HCaptcha sitekey={hcaptchaSitekey} size="invisible" onVerify={setCaptchaToken} />
            </div>
          )}

          {serverError && !isLocked && <p className="text-sm text-error">{serverError}</p>}
          {isLocked && (
            <p className="text-sm text-warning">Too many attempts. Please try again in 15 minutes.</p>
          )}

          <Button
            id="s001-submit"
            type="submit"
            className="w-full"
            disabled={isSubmitting || loginMutation.isPending || isLocked || (captchaRequired && !captchaToken)}
          >
            {loginMutation.isPending ? <Spinner size={16} className="mr-2" /> : null}
            Sign In
          </Button>

          <a href="#" id="s001-forgot" className="block text-center text-sm text-accent">
            Forgot password?
          </a>

          <ExitButton id="s001-exit" />
        </div>
      </form>
    </div>
  );
}
