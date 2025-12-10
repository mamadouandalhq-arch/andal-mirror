'use client';

import { useEffect } from 'react';
import { useRouter } from '@/i18n';
import { useAuth } from '@/contexts/auth-context';
import { AuthenticatedHeader } from './_components/authenticated-header';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if we're done loading and user is not authenticated
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show nothing while loading or if not authenticated
  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AuthenticatedHeader />
      {children}
    </div>
  );
}
