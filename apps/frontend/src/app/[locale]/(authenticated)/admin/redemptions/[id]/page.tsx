'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react';
import {
  useAdminRedemption,
  useApproveRedemption,
  useCompleteRedemption,
  useRejectRedemption,
} from '@/hooks/use-redemptions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/format-utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function getStatusBadge(status: string) {
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

export default function AdminRedemptionDetailPage() {
  const t = useTranslations('admin.redemptions.detail');
  const params = useParams();
  const router = useRouter();
  const redemptionId = params.id as string;

  const { data, isLoading, error } = useAdminRedemption(redemptionId);
  const approveMutation = useApproveRedemption();
  const completeMutation = useCompleteRedemption();
  const rejectMutation = useRejectRedemption();

  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const isMutating =
    approveMutation.isPending ||
    completeMutation.isPending ||
    rejectMutation.isPending;

  const statusBadge = data ? getStatusBadge(data.status) : null;

  const canApprove = data?.status === 'pending';
  const canComplete = data?.status === 'approved';
  const canReject =
    data?.status === 'pending' || data?.status === 'approved';

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
              onClick={() => router.push('/admin/redemptions')}
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

  const handleApprove = async () => {
    try {
      await approveMutation.mutateAsync(data.id);
      setShowApproveDialog(false);
    } catch (error) {
      // Error handling is done by the mutation
    }
  };

  const handleComplete = async () => {
    try {
      await completeMutation.mutateAsync(data.id);
      setShowCompleteDialog(false);
    } catch (error) {
      // Error handling is done by the mutation
    }
  };

  const handleReject = async () => {
    try {
      await rejectMutation.mutateAsync({
        redemptionId: data.id,
        rejectionReason: rejectReason || undefined,
      });
      setShowRejectDialog(false);
      setRejectReason('');
    } catch (error) {
      // Error handling is done by the mutation
    }
  };

  return (
    <main className="min-h-full bg-gray-50 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <Button
          onClick={() => router.push('/admin/redemptions')}
          variant="ghost"
          className="w-fit"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('backToList')}
        </Button>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>
                {t('redemption')} #{data.id.slice(0, 8)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{t('status')}:</span>
                {statusBadge ? (
                  <Badge className={statusBadge.badgeClass}>
                    {data.status}
                  </Badge>
                ) : (
                  <Badge variant="secondary">{data.status}</Badge>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{t('user')}:</span>
                <span>
                  {data.user.firstName} {data.user.lastName}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{t('email')}:</span>
                <span className="text-primary">{data.user.email}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{t('points')}:</span>
                <span className="font-semibold">
                  {data.pointsAmount.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{t('amount')}:</span>
                <span className="font-semibold text-primary">
                  ${Number(data.dollarAmount).toFixed(2)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">
                  {t('paypalEmail')}:
                </span>
                <span>{data.paypalEmail}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">
                  {t('createdAt')}:
                </span>
                <span>
                  {formatDate(data.createdAt, {
                    includeTime: true,
                    monthFormat: 'long',
                  })}
                </span>
              </div>

              {data.approvedAt && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">
                    {t('approvedAt')}:
                  </span>
                  <span>
                    {formatDate(data.approvedAt, {
                      includeTime: true,
                      monthFormat: 'long',
                    })}
                  </span>
                </div>
              )}

              {data.completedAt && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">
                    {t('completedAt')}:
                  </span>
                  <span>
                    {formatDate(data.completedAt, {
                      includeTime: true,
                      monthFormat: 'long',
                    })}
                  </span>
                </div>
              )}

              {data.rejectedAt && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">
                    {t('rejectedAt')}:
                  </span>
                  <span>
                    {formatDate(data.rejectedAt, {
                      includeTime: true,
                      monthFormat: 'long',
                    })}
                  </span>
                </div>
              )}

              {data.rejectionReason && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm font-medium text-destructive mb-1">
                    {t('rejectionReason')}:
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {data.rejectionReason}
                  </p>
                </div>
              )}

              {data.adminComment && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-1">
                    {t('adminComment')}:
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {data.adminComment}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>{t('actions')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {canApprove && (
                <Button
                  className="w-full"
                  onClick={() => setShowApproveDialog(true)}
                  disabled={isMutating}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  {t('approve')}
                </Button>
              )}

              {canComplete && (
                <Button
                  className="w-full"
                  variant="default"
                  onClick={() => setShowCompleteDialog(true)}
                  disabled={isMutating}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  {t('complete')}
                </Button>
              )}

              {canReject && (
                <Button
                  className="w-full"
                  variant="destructive"
                  onClick={() => setShowRejectDialog(true)}
                  disabled={isMutating}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  {t('reject')}
                </Button>
              )}

              {!canApprove && !canComplete && !canReject && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {t('noActionsAvailable')}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Approve Dialog */}
        <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('dialogs.approve.title')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('dialogs.approve.description')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={handleApprove} disabled={isMutating}>
                {isMutating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('dialogs.approve.processing')}
                  </>
                ) : (
                  t('dialogs.approve.confirm')
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Complete Dialog */}
        <AlertDialog
          open={showCompleteDialog}
          onOpenChange={setShowCompleteDialog}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('dialogs.complete.title')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('dialogs.complete.description')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleComplete}
                disabled={isMutating}
              >
                {isMutating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('dialogs.complete.processing')}
                  </>
                ) : (
                  t('dialogs.complete.confirm')
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Reject Dialog */}
        <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('dialogs.reject.title')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('dialogs.reject.description')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <Label htmlFor="reject-reason">
                {t('dialogs.reject.reasonLabel')}
              </Label>
              <Input
                id="reject-reason"
                placeholder={t('dialogs.reject.reasonPlaceholder')}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                disabled={isMutating}
                className="mt-2"
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  setRejectReason('');
                }}
              >
                {t('cancel')}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleReject}
                disabled={isMutating}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isMutating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('dialogs.reject.processing')}
                  </>
                ) : (
                  t('dialogs.reject.confirm')
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </main>
  );
}

