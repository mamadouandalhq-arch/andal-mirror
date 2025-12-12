'use client';

import { useEffect } from 'react';
import { useRouter } from '@/i18n';
import { useAuth } from '@/contexts/auth-context';
import { useIsAdmin } from '@/hooks/use-is-admin';
import { Spinner } from '@/components/ui/spinner';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const isAdmin = useIsAdmin();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if we're done loading
    if (!isLoading) {
      // If not authenticated, redirect to login
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }
      // If authenticated but not admin, redirect to dashboard
      if (!isAdmin) {
        router.push('/dashboard');
        return;
      }
    }
  }, [isAuthenticated, isLoading, isAdmin, router]);

  // Show spinner while loading or if not authenticated/admin
  if (isLoading || !isAuthenticated || !isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  return <>{children}</>;
}

