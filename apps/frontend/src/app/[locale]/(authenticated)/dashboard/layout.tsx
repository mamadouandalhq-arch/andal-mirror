'use client';

import { useEffect } from 'react';
import { useRouter } from '@/i18n';
import { useIsAdmin } from '@/hooks/use-is-admin';
import { useAuth } from '@/contexts/auth-context';
import { AuthenticatedHeader } from '../_components/authenticated-header';
import { Spinner } from '@/components/ui/spinner';
import { isProfileIncomplete } from '@/lib/profile-utils';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading, user } = useAuth();
  const isAdmin = useIsAdmin();
  const router = useRouter();

  useEffect(() => {
    // Redirect admins to admin panel
    if (!isLoading && isAdmin) {
      router.push('/admin');
      return;
    }

    // Redirect users with incomplete profiles to complete-profile page
    if (!isLoading && user && !isAdmin) {
      if (isProfileIncomplete(user)) {
        router.push('/complete-profile');
      }
    }
  }, [isLoading, isAdmin, user, router]);

  // Show spinner while loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  // Show spinner while redirecting (admin or incomplete profile)
  // This prevents flash of dashboard content
  if (isAdmin || (user && !isAdmin && isProfileIncomplete(user))) {
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
