'use client';

import { useEffect } from 'react';
import { useRouter } from '@/i18n';
import { useIsAdmin } from '@/hooks/use-is-admin';
import { useAuth } from '@/contexts/auth-context';
import { AuthenticatedHeader } from '../_components/authenticated-header';
import { Spinner } from '@/components/ui/spinner';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading } = useAuth();
  const isAdmin = useIsAdmin();
  const router = useRouter();

  useEffect(() => {
    // Redirect admins to admin panel
    if (!isLoading && isAdmin) {
      router.push('/admin');
    }
  }, [isLoading, isAdmin, router]);

  // Show spinner while loading or if admin (will redirect)
  if (isLoading || isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AuthenticatedHeader />
      {children}
    </div>
  );
}
