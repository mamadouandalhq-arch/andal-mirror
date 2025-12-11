'use client';

import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/auth-context';
import { StatsCards } from './_components/stats-cards';
import { QuickActions } from './_components/quick-actions';
import { ReceiptList } from './_components/receipt-list';
import { PendingReceiptFeedbackStatus } from './_components/pending-receipt-feedback-status';
import { useDashboardStats } from '@/hooks/use-dashboard-stats';

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const { user } = useAuth();
  const { stats } = useDashboardStats();

  return (
    <main className="min-h-full bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
            {t('welcomeMessage', { name: user?.firstName || 'User' })}
          </h1>
          <p className="mt-2 text-base sm:text-lg text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>

        {/* Stats Cards Grid */}
        <div className="mb-6 sm:mb-8">
          <StatsCards />
        </div>

        {/* Quick Actions */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900">
            {t('quickActions.title')}
          </h2>
          <QuickActions />
        </div>

        {/* Pending Receipt Feedback Status */}
        {stats?.hasPendingReceipt && (
          <div className="mb-6 sm:mb-8">
            <PendingReceiptFeedbackStatus />
          </div>
        )}

        {/* Recent Receipts List */}
        <div>
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900">
            {t('recentReceipts')}
          </h2>
          <ReceiptList />
        </div>
      </div>
    </main>
  );
}
