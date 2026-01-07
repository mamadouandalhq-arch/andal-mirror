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
import { isProfileIncomplete } from '@/lib/profile-utils';
import { useQueryClient } from '@tanstack/react-query';

export default function GoogleCallbackPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
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

        // Invalidate user query to ensure fresh data
        queryClient.invalidateQueries({ queryKey: ['user'] });

        // Wait for user data to be fetched, then check profile completeness
        try {
          // Fetch user data explicitly to ensure it's available
          const user = await queryClient.fetchQuery<{
            city?: string | null;
            street?: string | null;
            building?: string | null;
            apartment?: string | null;
          }>({
            queryKey: ['user'],
            queryFn: () => apiClient.get('/user/me'),
            staleTime: 0, // Force fresh fetch
          });

          // Check if profile is incomplete
          if (isProfileIncomplete(user)) {
            router.push('/complete-profile');
            return;
          }
        } catch (err) {
          // If fetching user fails, proceed with normal redirect
          // The dashboard layout will handle the redirect if needed
          console.error('Failed to fetch user data after Google login:', err);
        }

        const redirectPath = getRedirectPathForRole(accessToken);
        router.push(redirectPath);
      } catch (err) {
        setError(err instanceof Error ? err.message : t('googleSignInFailed'));
      }
    };

    void finalizeLogin();
  }, [router, searchParams, t, queryClient]);

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
