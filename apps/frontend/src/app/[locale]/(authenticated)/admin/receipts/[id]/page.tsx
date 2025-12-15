'use client';

import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowLeft, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';
import { useRouter } from '@/i18n';
import {
  useAdminApproveReceipt,
  useAdminReceipt,
  useAdminRejectReceipt,
} from '@/hooks/use-admin-receipts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { ReceiptViewer } from '@/components/receipt-viewer';
import { formatDate, formatPoints } from '@/lib/format-utils';
import { getStatusBadge } from '@/lib/receipt-utils';
import { Badge } from '@/components/ui/badge';

export default function AdminReceiptDetailPage() {
  const t = useTranslations('admin.receiptDetail');
  const tCommon = useTranslations('common');
  const params = useParams();
  const router = useRouter();
  const receiptId = params.id as string;

  const { data, isLoading, error } = useAdminReceipt(receiptId);
  const approveMutation = useAdminApproveReceipt();
  const rejectMutation = useAdminRejectReceipt();

  const isMutating = approveMutation.isPending || rejectMutation.isPending;
  const feedback = data?.feedbackResult;
  const statusBadge = data ? getStatusBadge(data.status) : null;

  const feedbackBadgeClass =
    feedback?.status === 'completed'
      ? 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200'
      : 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200';

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
            <Button onClick={() => router.push('/admin')} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('backToList')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleApprove = () => {
    approveMutation.mutate(data.id, {
      onSuccess: () => router.push('/admin'),
    });
  };

  const handleReject = () => {
    rejectMutation.mutate(data.id, {
      onSuccess: () => router.push('/admin'),
    });
  };

  return (
    <main className="min-h-full bg-gray-50 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <Button
          onClick={() => router.push('/admin')}
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
                {t('receipt')} #{data.id.slice(0, 8)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
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
                <span className="text-muted-foreground">{t('uploaded')}:</span>
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
                    {t('approvedOn')}:
                  </span>
                  <span>
                    {formatDate(data.approvedAt, {
                      includeTime: true,
                      monthFormat: 'long',
                    })}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{t('user')}:</span>
                <span>
                  {data.user?.firstName} {data.user?.lastName} ·{' '}
                  <span className="text-primary">{data.user?.email}</span>
                </span>
              </div>
              {feedback && (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">
                      {t('feedbackStatus')}:
                    </span>
                    <Badge className={feedbackBadgeClass}>
                      {feedback.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">
                      {t('points')}:
                    </span>
                    <span className="font-semibold text-primary">
                      {formatPoints(feedback.pointsValue)} {tCommon('points')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">
                      {t('questions')}:
                    </span>
                    <span>
                      {feedback.answeredQuestions}/{feedback.totalQuestions}
                    </span>
                  </div>
                  {feedback.completedAt && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">
                        {t('completedAt')}:
                      </span>
                      <span>
                        {formatDate(feedback.completedAt, {
                          includeTime: true,
                          monthFormat: 'long',
                        })}
                      </span>
                    </div>
                  )}
                  {feedback.comment && (
                    <div>
                      <p className="text-muted-foreground mb-1">
                        {t('comment')}:
                      </p>
                      <p className="text-sm">{feedback.comment}</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>{t('actions')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full"
                onClick={handleApprove}
                disabled={isMutating}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {t('approve')}
              </Button>
              <Button
                className="w-full"
                variant="destructive"
                onClick={handleReject}
                disabled={isMutating}
              >
                <XCircle className="h-4 w-4 mr-2" />
                {t('reject')}
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t('preview')}</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <a href={data.receiptUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                {t('open')}
              </a>
            </Button>
          </CardHeader>
          <CardContent>
            <ReceiptViewer
              receiptUrl={data.receiptUrl}
              alt={`Receipt ${data.id}`}
              height={420}
            />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
