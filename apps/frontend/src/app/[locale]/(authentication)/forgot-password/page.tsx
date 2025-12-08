'use client';

import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { Link } from '@/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForgotPassword } from '@/hooks/use-auth';
import { useState } from 'react';

interface ForgotPasswordFormData {
  email: string;
}

export default function ForgotPasswordPage() {
  const t = useTranslations('auth');
  const forgotPassword = useForgotPassword();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>();

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setError(null);
    setSuccess(false);
    try {
      await forgotPassword.mutateAsync(data);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md space-y-8">
          <div className="rounded-md bg-green-50 p-4">
            <p className="text-sm text-green-800">{t('resetLinkSent')}</p>
          </div>
          <div className="text-center">
            <Link
              href="/login"
              className="font-medium text-primary hover:text-primary/80"
            >
              {t('backToLogin')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">
            {t('forgotPassword')}
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            {t('enterEmailForReset')}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <Label htmlFor="email">{t('email')}</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
              className="mt-1"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div>
            <Button
              type="submit"
              className="w-full"
              disabled={forgotPassword.isPending}
            >
              {forgotPassword.isPending ? 'Loading...' : t('sendResetLink')}
            </Button>
          </div>

          <div className="text-center text-sm">
            <Link
              href="/login"
              className="font-medium text-primary hover:text-primary/80"
            >
              {t('backToLogin')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
