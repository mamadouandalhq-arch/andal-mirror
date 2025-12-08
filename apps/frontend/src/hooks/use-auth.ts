import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@/i18n';
import { apiClient } from '@/lib/api-client';
import { authStorage } from '@/lib/auth-storage';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
}

export interface ForgotPasswordCredentials {
  email: string;
}

export interface AuthResponse {
  accessToken: string;
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      router.push('/dashboard');
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

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        await apiClient.post('/auth/logout', {});
      } catch (error) {
        // Even if logout API fails, we should still clear local auth state
        console.error('Logout API error:', error);
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
