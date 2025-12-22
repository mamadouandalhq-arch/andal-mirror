import { useMemo } from 'react';
import { useReceipts } from './use-receipts';
import { useAuth } from '@/contexts/auth-context';

export interface DashboardStats {
  pointsBalance: number;
  totalReceipts: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  totalPointsEarned: number;
  hasPendingReceipt: boolean;
}

export function useDashboardStats(): {
  stats: DashboardStats | null;
  isLoading: boolean;
  error: Error | null;
} {
  const { user } = useAuth();
  const {
    data: receipts,
    isLoading: isLoadingReceipts,
    error: receiptsError,
  } = useReceipts();

  const stats = useMemo<DashboardStats | null>(() => {
    if (!receipts || !user) return null;

    const awaitingFeedbackReceipts = receipts.filter((r) => r.status === 'awaitingFeedback');
    const pendingReceipts = receipts.filter((r) => r.status === 'pending');
    const approvedReceipts = receipts.filter((r) => r.status === 'approved');
    const rejectedReceipts = receipts.filter((r) => r.status === 'rejected');

    // Points come from FeedbackResult.pointsValue, not from receipts
    // User's pointsBalance already reflects all earned points from completed feedback
    // So totalPointsEarned equals the user's current points balance
    const totalPointsEarned = user.pointsBalance || 0;

    return {
      pointsBalance: user.pointsBalance || 0,
      totalReceipts: receipts.length,
      pendingCount: pendingReceipts.length,
      approvedCount: approvedReceipts.length,
      rejectedCount: rejectedReceipts.length,
      totalPointsEarned,
      hasPendingReceipt: awaitingFeedbackReceipts.length > 0 || pendingReceipts.length > 0,
    };
  }, [receipts, user]);

  const isLoading = isLoadingReceipts || !user;
  const error = receiptsError as Error | null;

  return { stats, isLoading, error };
}
