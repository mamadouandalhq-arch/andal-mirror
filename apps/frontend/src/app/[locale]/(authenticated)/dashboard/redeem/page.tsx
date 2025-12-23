'use client';

import { useState, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { useCreateRedemption, useRedemptions } from '@/hooks/use-redemptions';
import { useAuth } from '@/contexts/auth-context';
import { formatPoints, formatDate } from '@/lib/format-utils';

const POINTS_PER_DOLLAR = 100;
const MIN_POINTS = 100;

function getStatusBadge(status: string, t: ReturnType<typeof useTranslations>) {
  switch (status) {
    case 'pending':
      return {
        badgeClass: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        label: t('status.pending'),
      };
    case 'approved':
      return {
        badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
        label: t('status.approved'),
      };
    case 'completed':
      return {
        badgeClass: 'bg-green-100 text-green-800 border-green-200',
        label: t('status.completed'),
      };
    case 'rejected':
      return {
        badgeClass: 'bg-red-100 text-red-800 border-red-200',
        label: t('status.rejected'),
      };
    default:
      return {
        badgeClass: 'bg-gray-100 text-gray-800 border-gray-200',
        label: status,
      };
  }
}

export default function RedeemPage() {
  const t = useTranslations('dashboard.redeem');
  const locale = useLocale();
  const router = useRouter();
  const { user } = useAuth();
  const { data: redemptions, isLoading: isLoadingRedemptions } =
    useRedemptions();
  const createRedemption = useCreateRedemption();

  const [pointsAmount, setPointsAmount] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');
  const [errors, setErrors] = useState<{
    pointsAmount?: string;
    paypalEmail?: string;
  }>({});

  const availablePoints = user?.pointsBalance || 0;
  const pointsValue = parseInt(pointsAmount) || 0;
  const dollarAmount = pointsValue / POINTS_PER_DOLLAR;

  // Calculate balance statistics
  const balanceStats = useMemo(() => {
    if (!redemptions) {
      return {
        totalEarned: availablePoints,
        available: availablePoints,
        pendingApproval: 0,
        awaitingPayment: 0,
        redeemed: 0,
      };
    }

    const pendingApproval = redemptions
      .filter((r) => r.status === 'pending')
      .reduce((sum, r) => sum + r.pointsAmount, 0);

    const awaitingPayment = redemptions
      .filter((r) => r.status === 'approved')
      .reduce((sum, r) => sum + r.pointsAmount, 0);

    const redeemed = redemptions
      .filter((r) => r.status === 'completed')
      .reduce((sum, r) => sum + r.pointsAmount, 0);

    // Total includes all points ever earned (available + locked in pending/approved + redeemed)
    const totalEarned =
      availablePoints + pendingApproval + awaitingPayment + redeemed;

    return {
      totalEarned,
      available: availablePoints,
      pendingApproval,
      awaitingPayment,
      redeemed,
    };
  }, [redemptions, availablePoints]);

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!pointsAmount || pointsValue < MIN_POINTS) {
      newErrors.pointsAmount = t('minPoints', { min: MIN_POINTS });
    } else if (pointsValue > availablePoints) {
      newErrors.pointsAmount = t('insufficientPoints');
    }

    if (!paypalEmail) {
      newErrors.paypalEmail = t('paypalEmailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(paypalEmail)) {
      newErrors.paypalEmail = t('invalidEmail');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      await createRedemption.mutateAsync({
        pointsAmount: pointsValue,
        paypalEmail,
      });
      setPointsAmount('');
      setPaypalEmail('');
      setErrors({});
    } catch (error) {
      // Error handling is done by the mutation
    }
  };

  return (
    <main className="min-h-full bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <Button
          onClick={() => router.push('/dashboard')}
          variant="ghost"
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('backToDashboard')}
        </Button>

        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
            {t('pageTitle')}
          </h1>
          <p className="mt-2 text-base sm:text-lg text-muted-foreground">
            {t('pageDescription')}
          </p>
        </div>

        {/* Balance Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardHeader className="p-3">{t('balance.available')}</CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="text-lg font-semibold text-primary">
                {formatPoints(balanceStats.available, locale)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-3">
              {t('balance.pendingApproval')}
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="text-lg font-semibold text-yellow-600">
                {formatPoints(balanceStats.pendingApproval, locale)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-3">
              {t('balance.awaitingPayment')}
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="text-lg font-semibold text-blue-600">
                {formatPoints(balanceStats.awaitingPayment, locale)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-3">{t('balance.redeemed')}</CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="text-lg font-semibold text-green-600">
                {formatPoints(balanceStats.redeemed, locale)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-3">{t('balance.totalEarned')}</CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="text-lg font-semibold">
                {formatPoints(balanceStats.totalEarned, locale)}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 items-start">
          {/* Redemption Form */}
          <Card>
            <CardHeader>
              <CardTitle>{t('formTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pointsAmount">{t('pointsAmount')}</Label>
                  <Input
                    id="pointsAmount"
                    type="number"
                    min={MIN_POINTS}
                    max={availablePoints}
                    step={100}
                    value={pointsAmount}
                    onChange={(e) => {
                      setPointsAmount(e.target.value);
                      if (errors.pointsAmount) {
                        setErrors((prev) => ({
                          ...prev,
                          pointsAmount: undefined,
                        }));
                      }
                    }}
                    placeholder={t('pointsAmountPlaceholder')}
                    disabled={createRedemption.isPending}
                  />
                  {errors.pointsAmount && (
                    <p className="text-sm text-destructive">
                      {errors.pointsAmount}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {t('availablePoints', { points: availablePoints })}
                  </p>
                  {pointsValue >= MIN_POINTS && (
                    <p className="text-sm font-medium text-primary">
                      {t('dollarAmount', { amount: dollarAmount.toFixed(2) })}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paypalEmail">{t('paypalEmail')}</Label>
                  <Input
                    id="paypalEmail"
                    type="email"
                    value={paypalEmail}
                    onChange={(e) => {
                      setPaypalEmail(e.target.value);
                      if (errors.paypalEmail) {
                        setErrors((prev) => ({
                          ...prev,
                          paypalEmail: undefined,
                        }));
                      }
                    }}
                    placeholder={t('paypalEmailPlaceholder')}
                    disabled={createRedemption.isPending}
                  />
                  {errors.paypalEmail && (
                    <p className="text-sm text-destructive">
                      {errors.paypalEmail}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={
                    createRedemption.isPending || availablePoints < MIN_POINTS
                  }
                >
                  {createRedemption.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('submitting')}
                    </>
                  ) : (
                    t('submit')
                  )}
                </Button>

                {availablePoints < MIN_POINTS && (
                  <p className="text-sm text-muted-foreground text-center">
                    {t('minPointsRequired', { min: MIN_POINTS })}
                  </p>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Redemptions List */}
          <Card>
            <CardHeader>
              <CardTitle>{t('redemptionsList')}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingRedemptions ? (
                <div className="flex justify-center py-8">
                  <Spinner />
                </div>
              ) : !redemptions || redemptions.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  {t('noRedemptions')}
                </p>
              ) : (
                <div className="space-y-4">
                  {redemptions.map((redemption) => {
                    const statusBadge = getStatusBadge(redemption.status, t);
                    return (
                      <div
                        key={redemption.id}
                        className="p-4 border rounded-lg space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge className={statusBadge.badgeClass}>
                              {statusBadge.label}
                            </Badge>
                            <span className="text-sm font-semibold">
                              {formatPoints(redemption.pointsAmount, locale)}
                            </span>
                          </div>
                          <span className="text-sm font-semibold text-primary">
                            ${Number(redemption.dollarAmount).toFixed(2)}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          <p>
                            {t('paypalEmail')}: {redemption.paypalEmail}
                          </p>
                          <p>
                            {t('createdAt')}:{' '}
                            {formatDate(redemption.createdAt, {
                              includeTime: true,
                              monthFormat: 'short',
                            })}
                          </p>
                          {redemption.rejectionReason && (
                            <p className="text-destructive mt-1">
                              {t('rejectionReason')}:{' '}
                              {redemption.rejectionReason}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
