'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useVerifyResetToken } from '@/hooks/use-auth';
import { ResetPasswordForm } from './_components/reset-password-form';
import { Spinner } from '@/components/ui/spinner';
import { Link } from '@/i18n';

export default function ResetPasswordPage() {
  const t = useTranslations('auth');
  const searchParams = useSearchParams();
  const verifyToken = useVerifyResetToken();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasVerified, setHasVerified] = useState(false);

  const token = searchParams.get('token');
  const tokenId = searchParams.get('tokenId');

  useEffect(() => {
    // Only verify once
    if (hasVerified) return;

    const verifyResetToken = async () => {
      // Check if token and tokenId are present
      if (!token || !tokenId) {
        setIsVerifying(false);
        setIsValid(false);
        setError(t('invalidOrExpiredToken'));
        setHasVerified(true);
        return;
      }

      try {
        setIsVerifying(true);
        const result = await verifyToken.mutateAsync({ token, tokenId });
        setIsValid(result.success);
        if (!result.success) {
          setError(t('invalidOrExpiredToken'));
        }
      } catch (err) {
        setIsValid(false);
        const errorMessage =
          err instanceof Error ? err.message : 'An error occurred';
        // Map backend error messages to localized translations
        if (errorMessage.toLowerCase().includes('invalid or expired')) {
          setError(t('invalidOrExpiredToken'));
        } else {
          // For other errors, use the translation key or fallback
          setError(t('invalidOrExpiredToken'));
        }
      } finally {
        setIsVerifying(false);
        setHasVerified(true);
      }
    };

    void verifyResetToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, tokenId]);

  // Redirect to forgot-password if token/tokenId missing
  if (!token || !tokenId) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">
              {t('resetPassword')}
            </h2>
          </div>
          <div className="space-y-6">
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">
                {t('invalidOrExpiredToken')}
              </p>
            </div>
            <div className="text-center">
              <Link
                href="/forgot-password"
                className="font-medium text-primary hover:text-primary/80"
              >
                {t('requestNewResetLink')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state while verifying
  if (isVerifying) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">
              {t('resetPassword')}
            </h2>
          </div>
          <div className="space-y-6 text-center">
            <Spinner size="lg" className="mx-auto" />
            <p className="text-muted-foreground">{t('verifyingToken')}</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error if token is invalid
  if (!isValid) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">
              {t('resetPassword')}
            </h2>
          </div>
          <div className="space-y-6">
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">
                {error || t('invalidOrExpiredToken')}
              </p>
            </div>
            <div className="text-center space-y-4">
              <Link
                href="/forgot-password"
                className="font-medium text-primary hover:text-primary/80 block"
              >
                {t('requestNewResetLink')}
              </Link>
              <Link
                href="/login"
                className="font-medium text-primary hover:text-primary/80 block"
              >
                {t('backToLogin')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show reset form if token is valid
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">
            {t('resetPassword')}
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            {t('tokenVerified')}
          </p>
        </div>
        <ResetPasswordForm token={token} tokenId={tokenId} />
      </div>
    </div>
  );
}
