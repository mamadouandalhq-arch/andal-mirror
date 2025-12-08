'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from 'react';
import { useQuery } from '@tanstack/react-query';
import { authStorage } from '@/lib/auth-storage';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
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

  // Determine authentication status synchronously based on token presence
  // This is stable and doesn't depend on async queries
  const isAuthenticated = useMemo(() => {
    return !!accessToken;
  }, [accessToken]);

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
      } as User;
    }

    return null;
  }, [accessToken]);

  // Use React Query only for fetching additional user data (when backend endpoint is ready)
  // For now, we use token data, but keep the structure for future API calls
  const { data: userFromApi, isLoading: isLoadingUser } = useQuery({
    queryKey: ['user', accessToken],
    queryFn: async () => {
      // TODO: Replace with actual API call when /user/me endpoint is ready
      // return await apiClient.get<User>('/user/me');
      return null;
    },
    enabled: isAuthenticated && false, // Disabled until API endpoint is ready
    retry: false,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Use API user data if available, otherwise fall back to token data
  const user = userFromApi ?? userFromToken;

  // Notify store when token changes (e.g., after login/logout)
  useEffect(() => {
    const handleStorageChange = () => {
      // Force re-read of token and notify listeners
      tokenStore.notify();
    };

    // Listen to custom events from authStorage
    if (typeof window !== 'undefined') {
      window.addEventListener('auth-storage-change', handleStorageChange);

      // Also listen to storage events (for cross-tab synchronization)
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
        isLoading: false, // No loading state needed since we decode token synchronously
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
