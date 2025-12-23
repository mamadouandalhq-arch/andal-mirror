'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n';
import {
  useAdminRedemptions,
  type RedemptionStatus,
} from '@/hooks/use-redemptions';
import { formatDate } from '@/lib/format-utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';

function getStatusBadge(status: RedemptionStatus) {
  switch (status) {
    case 'pending':
      return {
        badgeClass: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      };
    case 'approved':
      return {
        badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
      };
    case 'completed':
      return {
        badgeClass: 'bg-green-100 text-green-800 border-green-200',
      };
    case 'rejected':
      return {
        badgeClass: 'bg-red-100 text-red-800 border-red-200',
      };
    default:
      return {
        badgeClass: 'bg-gray-100 text-gray-800 border-gray-200',
      };
  }
}

export default function RedemptionsPage() {
  const t = useTranslations('admin.redemptions');
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<RedemptionStatus | 'all'>(
    'all',
  );

  const statusQuery =
    statusFilter === 'all' ? undefined : (statusFilter as RedemptionStatus);
  const { data, isLoading, error } = useAdminRedemptions(statusQuery);


  return (
    <div className="p-4 sm:p-8">
      <Card>
        <CardHeader>
          <CardTitle>{t('title')}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Spinner />
            </div>
          ) : error ? (
            <p className="text-destructive p-6">{t('error')}</p>
          ) : !data || data.length === 0 ? (
            <p className="text-muted-foreground p-6">{t('empty')}</p>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col gap-3 px-4 pt-4">
                <Select
                  value={statusFilter}
                  onValueChange={(val: RedemptionStatus | 'all') =>
                    setStatusFilter(val)
                  }
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder={t('filters.status')} />
                  </SelectTrigger>
                  <SelectContent
                    onCloseAutoFocus={(e) => {
                      e.preventDefault();
                    }}
                  >
                    <SelectItem value="all">{t('filters.allStatuses')}</SelectItem>
                    <SelectItem value="pending">pending</SelectItem>
                    <SelectItem value="approved">approved</SelectItem>
                    <SelectItem value="completed">completed</SelectItem>
                    <SelectItem value="rejected">rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">{t('columns.user')}</th>
                      <th className="px-4 py-3">{t('columns.points')}</th>
                      <th className="px-4 py-3">{t('columns.amount')}</th>
                      <th className="px-4 py-3">{t('columns.paypalEmail')}</th>
                      <th className="px-4 py-3">{t('columns.status')}</th>
                      <th className="px-4 py-3">{t('columns.createdAt')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.map((redemption) => {
                      const statusBadge = getStatusBadge(redemption.status);
                      return (
                        <tr
                          key={redemption.id}
                          className="cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() =>
                            router.push(`/admin/redemptions/${redemption.id}`)
                          }
                        >
                          <td className="px-4 py-3">
                            {redemption.user.firstName} {redemption.user.lastName}
                            <br />
                            <span className="text-xs text-muted-foreground">
                              {redemption.user.email}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-semibold">
                            {redemption.pointsAmount.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 font-semibold text-primary">
                            ${Number(redemption.dollarAmount).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {redemption.paypalEmail}
                          </td>
                          <td className="px-4 py-3">
                            <Badge className={statusBadge.badgeClass}>
                              {redemption.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            {formatDate(redemption.createdAt, {
                              includeTime: true,
                              monthFormat: 'short',
                            })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
