'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n';
import { useTranslations } from 'next-intl';
import { authStorage } from '@/lib/auth-storage';
import { apiClient } from '@/lib/api-client';
import type { AuthResponse } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { getRedirectPathForRole } from '@/lib/jwt-utils';

export default function GoogleCallbackPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const finalizeLogin = async () => {
      try {
        const tokenFromQuery = searchParams.get('accessToken');
        let accessToken: string;

        if (tokenFromQuery) {
          accessToken = tokenFromQuery;
          authStorage.setAccessToken(accessToken);
        } else {
          // If accessToken is not present (e.g., blocked by browser),
          // try to exchange the refresh token cookie for a new access token.
          const refreshed = await apiClient.post<AuthResponse>(
            '/auth/refresh',
            {},
          );
          accessToken = refreshed.accessToken;
          authStorage.setAccessToken(accessToken);
        }

        const redirectPath = getRedirectPathForRole(accessToken);
        router.push(redirectPath);
      } catch (err) {
        setError(err instanceof Error ? err.message : t('googleSignInFailed'));
      }
    };

    void finalizeLogin();
  }, [router, searchParams, t]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <h1 className="text-2xl font-semibold">{t('signInWithGoogle')}</h1>
        {!error ? (
          <p className="text-muted-foreground">{t('googleSigningIn')}</p>
        ) : (
          <div className="space-y-4">
            <p className="text-destructive">{error}</p>
            <Button
              variant="outline"
              onClick={() => router.push('/login')}
              className="w-full"
            >
              {t('backToLogin')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
