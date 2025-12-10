'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from 'react';
import { useQuery } from '@tanstack/react-query';
import { authStorage } from '@/lib/auth-storage';
import { apiClient } from '@/lib/api-client';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  address?: string | null;
  avatarUrl?: string | null;
  role: string;
  pointsBalance: number;
  createdAt: string;
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

// Helper function to decode JWT token (client-side only, for display purposes)
function decodeJWT(
  token: string,
): { sub: string; email: string; role: string } | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

// Create a store for accessToken that can be subscribed to
function createTokenStore() {
  const listeners = new Set<() => void>();

  const store = {
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot: () => {
      // Always get fresh token from storage
      return authStorage.getAccessToken();
    },
    notify: () => {
      // Notify all listeners about token change
      listeners.forEach((listener) => listener());
    },
  };

  return store;
}

const tokenStore = createTokenStore();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Use useSyncExternalStore for stable, synchronous token access
  // This ensures token state is always in sync and doesn't cause re-renders during locale changes
  const accessToken = useSyncExternalStore(
    tokenStore.subscribe,
    tokenStore.getSnapshot,
    () => null, // Server snapshot (not used in client component)
  );

  // Decode user info from token synchronously
  const userFromToken = useMemo(() => {
    if (!accessToken) {
      return null;
    }

    const tokenData = decodeJWT(accessToken);
    if (tokenData) {
      return {
        id: tokenData.sub,
        email: tokenData.email,
        firstName: '', // Will be populated when backend endpoint is added
        lastName: '', // Will be populated when backend endpoint is added
        role: tokenData.role,
        pointsBalance: 0,
        createdAt: new Date().toISOString(),
      } as User;
    }

    return null;
  }, [accessToken]);

  const {
    data: userFromApi,
    error: userError,
    isLoading: isLoadingUser,
  } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      return await apiClient.get<User>('/user/me');
    },
    enabled: !!accessToken, // Only fetch if token exists (not dependent on isAuthenticated to avoid circular dependency)
    retry: false,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Determine authentication status
  // Consider authenticated if:
  // 1. We have a token AND
  // 2. Either: API call succeeded OR API call is still loading (optimistic)
  // 3. NOT authenticated if: API call failed (user doesn't exist or token invalid)
  const isAuthenticated = useMemo(() => {
    // No token = not authenticated
    if (!accessToken) {
      return false;
    }

    // If API call failed (404, 401, etc.), user doesn't exist or token invalid
    if (userError) {
      return false;
    }

    // If we have token and either:
    // - API call succeeded (userFromApi exists), OR
    // - API call is still loading (optimistic - assume valid until proven otherwise)
    return !!userFromApi || isLoadingUser;
  }, [accessToken, userFromApi, userError, isLoadingUser]);

  // Clear token if API call failed (user doesn't exist)
  useEffect(() => {
    if (userError && accessToken) {
      // User doesn't exist in DB but has token - clear it
      authStorage.clearAccessToken();
      tokenStore.notify();
    }
  }, [userError, accessToken]);

  // Use API user data if available, otherwise fall back to token data
  // But only if API call hasn't failed
  const user = userError ? null : userFromApi ?? userFromToken;

  // Track if we've already attempted to refresh token on mount
  const hasAttemptedRefresh = useRef(false);

  // Automatically refresh accessToken on mount if it's missing but refreshToken exists in cookies
  useEffect(() => {
    // Only attempt once per mount
    if (hasAttemptedRefresh.current) return;
    if (typeof window === 'undefined') return;

    // If we already have an accessToken, no need to refresh
    if (accessToken) {
      hasAttemptedRefresh.current = true;
      return;
    }

    // Attempt to refresh token using refreshToken from httpOnly cookie
    // Use direct fetch to avoid circular dependency with apiClient
    hasAttemptedRefresh.current = true;
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
    fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include', // Important: sends refreshToken cookie
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Failed to refresh token');
        }
        const data = await response.json();
        // Successfully refreshed, token is now stored in sessionStorage
        authStorage.setAccessToken(data.accessToken);
        tokenStore.notify();
      })
      .catch(() => {
        // Refresh failed - refreshToken might be expired or invalid
        // User will need to login again, but we don't redirect here
        // as they might be on a public page
      });
  }, [accessToken]);

  // Notify store when token changes (e.g., after login/logout)
  useEffect(() => {
    const handleStorageChange = () => {
      // Force re-read of token and notify listeners
      tokenStore.notify();
    };

    // Listen to custom events from authStorage
    if (typeof window !== 'undefined') {
      window.addEventListener('auth-storage-change', handleStorageChange);

      // Also listen to storage events (for cross-tab synchronization with sessionStorage)
      window.addEventListener('storage', handleStorageChange);

      return () => {
        window.removeEventListener('auth-storage-change', handleStorageChange);
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: isLoadingUser && !!accessToken, // Loading only if we have token and checking user
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
