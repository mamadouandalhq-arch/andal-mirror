'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n';
import { ArrowLeft } from 'lucide-react';
import {
  useAdminUser,
  useAdminUserSurveyResults,
} from '@/hooks/use-admin-users';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { RiskBadge } from '@/components/admin/risk-badge';
import { SurveyResultsChart } from '@/components/admin/survey-results-chart';
import { formatDate, formatPoints } from '@/lib/format-utils';
import { getStatusBadge } from '@/lib/receipt-utils';

function getRedemptionStatusBadge(status: string) {
  switch (status) {
    case 'pending':
      return {
        badgeClass:
          'bg-yellow-100 text-yellow-800 border-yellow-200 hover:!bg-yellow-200',
      };
    case 'approved':
      return {
        badgeClass:
          'bg-blue-100 text-blue-800 border-blue-200 hover:!bg-blue-200',
      };
    case 'completed':
      return {
        badgeClass:
          'bg-green-100 text-green-800 border-green-200 hover:!bg-green-200',
      };
    case 'rejected':
      return {
        badgeClass: 'bg-red-100 text-red-800 border-red-200 hover:!bg-red-200',
      };
    default:
      return {
        badgeClass:
          'bg-gray-100 text-gray-800 border-gray-200 hover:!bg-gray-200',
      };
  }
}

export default function AdminUserDetailPage() {
  const t = useTranslations('admin.users.detail');
  const tCommon = useTranslations('common');
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const { data, isLoading, error } = useAdminUser(userId);
  const {
    data: surveyResults,
    isLoading: isLoadingSurveyResults,
    error: surveyResultsError,
  } = useAdminUserSurveyResults(userId);

  const [showAllReceipts, setShowAllReceipts] = useState(false);
  const [showAllRedemptions, setShowAllRedemptions] = useState(false);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="py-10 space-y-4">
            <p className="text-destructive">{t('error')}</p>
            <Button
              onClick={() => router.push('/admin/users')}
              variant="outline"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('backToList')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <main className="min-h-full bg-gray-50 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <Button
          onClick={() => router.push('/admin/users')}
          variant="ghost"
          className="w-fit"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('backToList')}
        </Button>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t('basicInfo')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground mb-1">{t('name')}:</p>
                <p className="font-medium">
                  {data.firstName} {data.lastName}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">{t('email')}:</p>
                <p className="text-primary">{data.email}</p>
              </div>
              {data.city && (
                <div>
                  <p className="text-muted-foreground mb-1">{t('city')}:</p>
                  <p>{data.city}</p>
                </div>
              )}
              {data.street && (
                <div>
                  <p className="text-muted-foreground mb-1">{t('street')}:</p>
                  <p>{data.street}</p>
                </div>
              )}
              {data.building && (
                <div>
                  <p className="text-muted-foreground mb-1">{t('building')}:</p>
                  <p>{data.building}</p>
                </div>
              )}
              {data.apartment && (
                <div>
                  <p className="text-muted-foreground mb-1">
                    {t('apartment')}:
                  </p>
                  <p>{data.apartment}</p>
                </div>
              )}
              <div>
                <p className="text-muted-foreground mb-1">
                  {t('pointsBalance')}:
                </p>
                <p className="font-semibold text-primary">
                  {formatPoints(data.pointsBalance)} {tCommon('points')}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">{t('createdAt')}:</p>
                <p>
                  {formatDate(data.createdAt, {
                    includeTime: true,
                    monthFormat: 'long',
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risk Assessment */}
        <Card>
          <CardHeader>
            <CardTitle>{t('riskAssessment')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">{t('riskLevel')}:</span>
              <RiskBadge level={data.riskAssessment.level} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground mb-1">
                  {t('averagePercentage')}:
                </p>
                <p className="font-semibold">
                  {data.riskAssessment.averagePercentage.toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">
                  {t('completedSurveys')}:
                </p>
                <p className="font-semibold">
                  {data.riskAssessment.completedSurveys}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">{t('totalScore')}:</p>
                <p className="font-semibold">
                  {data.riskAssessment.totalScore}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">
                  {t('maxPossibleScore')}:
                </p>
                <p className="font-semibold">
                  {data.riskAssessment.maxPossibleScore}
                </p>
              </div>
            </div>
            {!surveyResultsError && (
              <div className="mt-6">
                {surveyResults && surveyResults.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-muted-foreground mb-3">
                      {t('lastNSurveys')}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-muted-foreground mb-1">
                          {t('totalAnsweredQuestions')}:
                        </p>
                        <p className="font-semibold">
                          {surveyResults.reduce(
                            (sum, s) => sum + s.answeredQuestions,
                            0,
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">
                          {t('totalQuestions')}:
                        </p>
                        <p className="font-semibold">
                          {surveyResults.reduce(
                            (sum, s) => sum + s.totalQuestions,
                            0,
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-sm font-semibold">
                    {t('surveyResultsTrend')}
                  </h3>
                </div>
                {isLoadingSurveyResults ? (
                  <div className="flex h-64 items-center justify-center">
                    <Spinner />
                  </div>
                ) : surveyResults && surveyResults.length > 0 ? (
                  <SurveyResultsChart data={surveyResults} />
                ) : (
                  <div className="flex h-64 items-center justify-center text-muted-foreground text-sm">
                    No survey data available
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Receipts */}
        <Card>
          <CardHeader>
            <CardTitle>
              {t('receipts')} ({data.receipts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.receipts.length === 0 ? (
              <p className="text-muted-foreground">{t('noReceipts')}</p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3">{t('columns.id')}</th>
                        <th className="px-4 py-3">{t('columns.status')}</th>
                        <th className="px-4 py-3">{t('columns.createdAt')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {(showAllReceipts
                        ? data.receipts
                        : data.receipts.slice(-5)
                      ).map((receipt) => {
                        const statusBadge = getStatusBadge(receipt.status);
                        return (
                          <tr
                            key={receipt.id}
                            onClick={() =>
                              router.push(`/admin/receipts/${receipt.id}`)
                            }
                            className="cursor-pointer hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-4 py-3 font-mono text-xs">
                              {receipt.id.slice(0, 8)}
                            </td>
                            <td className="px-4 py-3">
                              <Badge className={statusBadge.badgeClass}>
                                {receipt.status}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              {formatDate(receipt.createdAt, {
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
                {data.receipts.length > 5 && (
                  <div className="mt-4 flex justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAllReceipts(!showAllReceipts)}
                    >
                      {showAllReceipts ? 'Сховати' : 'Показати всі'}
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Redemptions */}
        <Card>
          <CardHeader>
            <CardTitle>
              {t('redemptions')} ({data.redemptions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.redemptions.length === 0 ? (
              <p className="text-muted-foreground">{t('noRedemptions')}</p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3">{t('columns.id')}</th>
                        <th className="px-4 py-3">{t('columns.status')}</th>
                        <th className="px-4 py-3">{t('columns.points')}</th>
                        <th className="px-4 py-3">{t('columns.amount')}</th>
                        <th className="px-4 py-3">{t('columns.createdAt')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {(showAllRedemptions
                        ? data.redemptions
                        : data.redemptions.slice(-5)
                      ).map((redemption) => {
                        const statusBadge = getRedemptionStatusBadge(
                          redemption.status,
                        );
                        return (
                          <tr
                            key={redemption.id}
                            onClick={() =>
                              router.push(`/admin/redemptions/${redemption.id}`)
                            }
                            className="cursor-pointer hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-4 py-3 font-mono text-xs">
                              {redemption.id.slice(0, 8)}
                            </td>
                            <td className="px-4 py-3">
                              <Badge className={statusBadge.badgeClass}>
                                {redemption.status}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 font-semibold">
                              {redemption.pointsAmount.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 font-semibold text-primary">
                              ${Number(redemption.dollarAmount).toFixed(2)}
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
                {data.redemptions.length > 5 && (
                  <div className="mt-4 flex justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAllRedemptions(!showAllRedemptions)}
                    >
                      {showAllRedemptions ? 'Сховати' : 'Показати всі'}
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
