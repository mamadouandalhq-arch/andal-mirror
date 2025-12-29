import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useRouter } from '@/i18n';
import { apiClient } from '@/lib/api-client';
import { authStorage } from '@/lib/auth-storage';
import { locales, defaultLocale } from '@/i18n/config';
import { getRedirectPathForRole } from '@/lib/jwt-utils';
import { logger } from '@/lib/logger';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

export interface ForgotPasswordCredentials {
  email: string;
}

export interface VerifyResetTokenCredentials {
  token: string;
  tokenId: string;
}

export interface ResetPasswordCredentials {
  password: string;
  token: string;
  tokenId: string;
}

export interface AuthResponse {
  accessToken: string;
}

export function useGoogleLogin() {
  const [isLoading, setIsLoading] = useState(false);

  return {
    isLoading,
    start: () => {
      if (typeof window === 'undefined') return;
      setIsLoading(true);

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
      if (!API_BASE_URL) {
        logger.error('NEXT_PUBLIC_API_URL is not set');
        setIsLoading(false);
        return;
      }

      // Infer current locale from pathname
      // For default locale (en), there's no prefix: /login
      // For other locales: /fr/login
      const pathSegments = window.location.pathname.split('/').filter(Boolean);
      const firstSegment = pathSegments[0];
      // Check if first segment is a valid locale
      const locale =
        firstSegment && (locales as readonly string[]).includes(firstSegment)
          ? firstSegment
          : defaultLocale;

      // Build callback path with locale prefix only if not default locale
      // Use general /auth/google-callback path that works for both login and register
      const callbackPath =
        locale === defaultLocale
          ? '/auth/google-callback'
          : `/${locale}/auth/google-callback`;
      const callbackUrl = `${window.location.origin}${callbackPath}`;

      // Use the OAuth state param to tell the backend where to redirect after success
      const loginUrl = `${API_BASE_URL}/auth/google?state=${encodeURIComponent(
        callbackUrl,
      )}`;

      window.location.href = loginUrl;
    },
  };
}

export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await apiClient.post<AuthResponse>(
        '/auth/login',
        credentials,
      );
      // Store accessToken after successful login
      authStorage.setAccessToken(response.accessToken);
      return response;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      const redirectPath = getRedirectPathForRole(response.accessToken);
      router.push(redirectPath);
    },
  });
}

export function useRegister() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: RegisterCredentials) => {
      const response = await apiClient.post<AuthResponse>(
        '/auth/register',
        credentials,
      );
      // Store accessToken after successful registration
      authStorage.setAccessToken(response.accessToken);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      router.push('/dashboard');
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: async (credentials: ForgotPasswordCredentials) => {
      return apiClient.post<{ message: string }>(
        '/auth/forgot-password',
        credentials,
      );
    },
  });
}

export function useVerifyResetToken() {
  return useMutation({
    mutationFn: async (credentials: VerifyResetTokenCredentials) => {
      return apiClient.post<{ success: boolean }>(
        '/auth/forgot-password/verify-token',
        credentials,
      );
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: async (credentials: ResetPasswordCredentials) => {
      return apiClient.post<{ success: boolean }>(
        '/auth/change-password',
        credentials,
      );
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        await apiClient.post('/auth/logout', {});
      } catch (error) {
        // Even if logout API fails, we should still clear local auth state
        logger.error('Logout API error:', error);
      }
      // Always clear accessToken, regardless of API response
      authStorage.clearAccessToken();
    },
    onSettled: () => {
      // Clear all queries and redirect, regardless of success/failure
      queryClient.clear();
      router.push('/login');
    },
  });
}

export function useRefreshToken() {
  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post<AuthResponse>('/auth/refresh', {});
      authStorage.setAccessToken(response.accessToken);
      return response;
    },
  });
}
