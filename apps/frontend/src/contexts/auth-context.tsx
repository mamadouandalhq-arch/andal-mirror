'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  startTransition,
  useState,
  useSyncExternalStore,
} from 'react';
import { useQuery } from '@tanstack/react-query';
import { authStorage } from '@/lib/auth-storage';
import { apiClient } from '@/lib/api-client';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  address?: string | null;
  avatarUrl?: string | null;
  role: string;
  pointsBalance?: number;
  createdAt?: string;
  googleId?: string | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
});

/* ---------------- JWT helpers ---------------- */

function decodeJWT(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(jsonPayload) as {
      sub: string;
      email: string;
      role: string;
      exp?: number;
    };
  } catch {
    return null;
  }
}

function isTokenExpired(token: string | null, bufferSeconds = 0) {
  if (!token) return true;
  const decoded = decodeJWT(token);
  if (!decoded?.exp) return true;

  const now = Math.floor(Date.now() / 1000);
  return decoded.exp <= now + bufferSeconds;
}

function createTokenStore() {
  const listeners = new Set<() => void>();

  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot: () => authStorage.getAccessToken(),
    notify: () => {
      listeners.forEach((listener) => listener());
    },
  };
}

const tokenStore = createTokenStore();

/* ---------------- Auth Provider ---------------- */

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // sync token across renders & tabs
  const accessToken = useSyncExternalStore(
    tokenStore.subscribe,
    tokenStore.getSnapshot,
    () => null,
  );

  /* ---------------- Decode user from token (safe & minimal) ---------------- */
  const userFromToken = useMemo(() => {
    if (!accessToken) return null;

    const data = decodeJWT(accessToken);
    if (!data) return null;

    return {
      id: data.sub,
      email: data.email,
      role: data.role,
    } satisfies User;
  }, [accessToken]);

  /* ---------------- Fetch user from API ---------------- */
  const {
    data: userFromApi,
    error: userError,
    isLoading: isLoadingUser,
  } = useQuery({
    queryKey: ['user'],
    queryFn: () => apiClient.get<User>('/user/me'),
    enabled: !!accessToken,
    retry: false,
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: false,
  });

  /* ---------------- Token refresh on mount ---------------- */
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasCheckedToken, setHasCheckedToken] = useState(false);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const token = authStorage.getAccessToken();
    const expired = isTokenExpired(token);

    startTransition(() => {
      setHasCheckedToken(true);
    });

    // Only attempt refresh if we have a token (even if expired)
    // This prevents unnecessary refresh attempts on login/register pages
    if (!token || !expired) return;

    startTransition(() => {
      setIsRefreshing(true);
    });

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
    fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })
      .then(async (res) => {
        // 401 is expected when there's no refresh token (user not logged in)
        if (res.status === 401) {
          // Clear invalid access token
          authStorage.clearAccessToken();
          tokenStore.notify();
          return;
        }

        if (!res.ok) {
          // Only throw for unexpected errors
          throw new Error('Failed to refresh');
        }

        const data = await res.json();
        authStorage.setAccessToken(data.accessToken);
        tokenStore.notify();
      })
      .catch((error) => {
        // Silently handle refresh failures - they're expected when not logged in
        // Only log unexpected errors
        if (error.message !== 'Failed to refresh') {
          console.error('Unexpected error during token refresh:', error);
        }
        // Clear invalid token on any error
        authStorage.clearAccessToken();
        tokenStore.notify();
      })
      .finally(() => {
        setIsRefreshing(false);
      });
  }, []);

  /* ---------------- Sync tokens across tabs ---------------- */
  useEffect(() => {
    const handler = () => tokenStore.notify();
    window.addEventListener('auth-storage-change', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('auth-storage-change', handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  /* ---------------- Handle userError safely ---------------- */
  useEffect(() => {
    if (!userError || !accessToken) return;

    // Only clear token for real auth errors
    const status = (userError as { response?: { status: number } })?.response
      ?.status;
    if (status === 401 || status === 404) {
      authStorage.clearAccessToken();
      tokenStore.notify();
    }
  }, [userError, accessToken]);

  /* ---------------- final derived auth state ---------------- */

  const user = userError ? null : userFromApi ?? userFromToken;

  const isAuthenticated = useMemo(() => {
    if (!accessToken) return false;

    // If token is expired (with small buffer), not authenticated
    // Small buffer prevents premature "not authenticated" before API client refreshes
    if (isTokenExpired(accessToken, 5)) return false;

    // While refreshing, optimistic auth
    if (isRefreshing) return true;

    // If API call is loading, optimistic auth (token is valid)
    if (isLoadingUser) return true;

    // If API call failed, not authenticated
    if (userError) return false;

    // Otherwise, authenticated if we have user data
    return !!user;
  }, [accessToken, isRefreshing, isLoadingUser, userError, user]);

  const isLoading = useMemo(() => {
    if (!hasCheckedToken) return true;
    if (isRefreshing) return true;
    if (accessToken && isLoadingUser) return true;
    return false;
  }, [hasCheckedToken, isRefreshing, accessToken, isLoadingUser]);

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
