'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDashboardStats } from '@/hooks/use-dashboard-stats';
import {
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: number | string;
  description: string;
  icon: LucideIcon;
  iconClassName?: string;
  cardClassName?: string;
  formatValue?: (value: number) => string;
}

function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  iconClassName,
  cardClassName,
  formatValue,
}: StatsCardProps) {
  const displayValue =
    typeof value === 'number' && formatValue ? formatValue(value) : value;

  return (
    <Card className={cn(cardClassName)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-2 sm:p-6">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={cn('h-4 w-4', iconClassName)} />
      </CardHeader>
      <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
        <div className="text-2xl font-bold">{displayValue}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}

export function StatsCards() {
  const t = useTranslations('dashboard.stats');
  const { stats, isLoading, error } = useDashboardStats();

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        <p>{t('error')}</p>
      </div>
    );
  }

  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="p-3 pb-2 sm:p-6">
              <div className="h-4 bg-muted rounded w-24" />
            </CardHeader>
            <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
              <div className="h-8 bg-muted rounded w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard
        title={t('pointsBalance')}
        value={stats.pointsBalance}
        description={t('pointsBalanceDesc')}
        icon={TrendingUp}
        iconClassName="text-primary"
        cardClassName="lg:col-span-1 border-primary/20 bg-primary/5"
        formatValue={(val) => val.toLocaleString()}
      />

      <StatsCard
        title={t('pending')}
        value={stats.pendingCount}
        description={t('pendingDesc')}
        icon={Clock}
        iconClassName="text-yellow-600"
      />

      <StatsCard
        title={t('approved')}
        value={stats.approvedCount}
        description={t('approvedDesc')}
        icon={CheckCircle2}
        iconClassName="text-green-600"
      />

      <StatsCard
        title={t('rejected')}
        value={stats.rejectedCount}
        description={t('rejectedDesc')}
        icon={XCircle}
        iconClassName="text-destructive"
      />
    </div>
  );
}
