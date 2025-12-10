'use client';

import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from '@/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form-field';
import { FormError } from '@/components/ui/form-error';
import { Spinner } from '@/components/ui/spinner';
import { useForgotPassword } from '@/hooks/use-auth';
import { useState } from 'react';
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from '@/lib/validations/auth';

export function ForgotPasswordForm() {
  const t = useTranslations('auth');
  const forgotPassword = useForgotPassword();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setError(null);
    setSuccess(false);
    try {
      await forgotPassword.mutateAsync(data);
      // Always show success message to prevent user enumeration
      // Backend always returns success regardless of whether user exists
      setSuccess(true);
    } catch (err) {
      // Only show error for actual network/server errors, not for user not found
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    }
  };

  if (success) {
    return (
      <div className="space-y-8">
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
    );
  }

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <FormField
        label={t('email')}
        htmlFor="email"
        error={errors.email?.message}
        t={t}
      >
        <Input
          id="email"
          type="email"
          autoComplete="email"
          {...register('email')}
          className="mt-1"
        />
      </FormField>

      <FormError message={error || ''} t={t} />

      <div>
        <Button
          type="submit"
          className="w-full"
          disabled={forgotPassword.isPending}
        >
          {forgotPassword.isPending ? (
            <>
              <Spinner size="sm" className="mr-2" />
              {t('sending')}
            </>
          ) : (
            t('sendResetLink')
          )}
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
  );
}
