import { useAuth } from '@/contexts/auth-context';
import { getHomePathForRole } from '@/lib/jwt-utils';

/**
 * Hook to get the home path based on user role
 * @returns '/admin' for admin users, '/dashboard' for others
 */
export function useHomePath() {
  const { user } = useAuth();
  return getHomePathForRole(user?.role);
}

