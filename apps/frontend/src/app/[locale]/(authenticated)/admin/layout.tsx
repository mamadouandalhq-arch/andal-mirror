'use client';

import { useEffect, useState } from 'react';
import { useRouter } from '@/i18n';
import { useAuth } from '@/contexts/auth-context';
import { useIsAdmin } from '@/hooks/use-is-admin';
import { Spinner } from '@/components/ui/spinner';
import { AdminHeader } from './_components/admin-header';
import { AdminSidebar } from './_components/admin-sidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const isAdmin = useIsAdmin();
  const router = useRouter();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <AdminHeader
          onMenuClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />
        <main className="flex-1 overflow-auto bg-gray-50">{children}</main>
      </div>
    </div>
  );
}
