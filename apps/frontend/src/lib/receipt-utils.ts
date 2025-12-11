import { Clock, CheckCircle2, XCircle } from 'lucide-react';
import { ReceiptStatus } from '@/hooks/use-receipts';

export interface StatusBadgeConfig {
  variant: 'default' | 'secondary' | 'destructive';
  icon: typeof Clock;
  color: string;
  badgeClass: string;
}

export function getStatusBadge(status: ReceiptStatus | string): StatusBadgeConfig {
  switch (status) {
    case 'pending':
      return {
        variant: 'secondary' as const,
        icon: Clock,
        color: 'text-amber-600',
        badgeClass:
          'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200',
      };
    case 'approved':
      return {
        variant: 'default' as const,
        icon: CheckCircle2,
        color: 'text-green-600',
        badgeClass:
          'bg-green-100 text-green-800 border-green-300 hover:bg-green-200',
      };
    case 'rejected':
      return {
        variant: 'destructive' as const,
        icon: XCircle,
        color: 'text-red-600',
        badgeClass: 'bg-red-100 text-red-800 border-red-300 hover:bg-red-200',
      };
    default:
      return {
        variant: 'secondary' as const,
        icon: Clock,
        color: 'text-muted-foreground',
        badgeClass:
          'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200',
      };
  }
}

