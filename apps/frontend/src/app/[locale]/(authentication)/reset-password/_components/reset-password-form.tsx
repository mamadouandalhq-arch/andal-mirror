'use client';

import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useRouter } from '@/i18n';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/ui/password-input';
import { FormField } from '@/components/ui/form-field';
import { FormError } from '@/components/ui/form-error';
import { Spinner } from '@/components/ui/spinner';
import { useResetPassword } from '@/hooks/use-auth';
import { useState, useEffect } from 'react';
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from '@/lib/validations/auth';

interface ResetPasswordFormProps {
  token: string;
  tokenId: string;
}

export function ResetPasswordForm({ token, tokenId }: ResetPasswordFormProps) {
  const t = useTranslations('auth');
  const router = useRouter();
  const resetPassword = useResetPassword();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onBlur',
  });

  // Redirect to login after showing success message for 2 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        router.push('/login');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [success, router]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    setError(null);
    setSuccess(false);
    try {
      const result = await resetPassword.mutateAsync({
        password: data.password,
        token,
        tokenId,
      });
      // Check if the result indicates failure
      if (result && typeof result === 'object' && 'success' in result) {
        if (!result.success) {
          setError(t('invalidOrExpiredToken'));
          return;
        }
      }
      setSuccess(true);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred';
      // Map backend error messages to localized translations
      if (
        errorMessage.toLowerCase().includes('invalid token') ||
        errorMessage.toLowerCase().includes('invalid or expired') ||
        errorMessage.toLowerCase().includes('token not found') ||
        errorMessage.toLowerCase().includes('forgot password token not found')
      ) {
        setError(t('invalidOrExpiredToken'));
      } else {
        setError(errorMessage);
      }
    }
  };

  if (success) {
    return (
      <div className="space-y-8">
        <div className="rounded-md bg-green-50 p-4">
          <p className="text-sm text-green-800">{t('passwordResetSuccess')}</p>
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
      <div className="space-y-4">
        <FormField
          label={t('newPassword')}
          htmlFor="password"
          error={errors.password?.message}
          t={t}
        >
          <PasswordInput
            id="password"
            autoComplete="new-password"
            {...register('password')}
            className="mt-1"
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
          />
        </FormField>

        <FormField
          label={t('confirmNewPassword')}
          htmlFor="confirmPassword"
          error={errors.confirmPassword?.message}
          t={t}
        >
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            {...register('confirmPassword')}
            className="mt-1"
            showPassword={showConfirmPassword}
            onTogglePassword={() =>
              setShowConfirmPassword(!showConfirmPassword)
            }
          />
        </FormField>
      </div>

      <FormError message={error || ''} t={t} />

      <div>
        <Button
          type="submit"
          className="w-full"
          disabled={resetPassword.isPending}
        >
          {resetPassword.isPending ? (
            <>
              <Spinner size="sm" className="mr-2" />
              {t('resettingPassword')}
            </>
          ) : (
            t('resetPassword')
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
