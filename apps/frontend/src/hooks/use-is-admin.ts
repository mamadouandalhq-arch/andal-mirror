import { useAuth } from '@/contexts/auth-context';

export function useIsAdmin() {
  const { user } = useAuth();
  return user?.role === 'admin';
}
