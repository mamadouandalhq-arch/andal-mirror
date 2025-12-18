'use client';

import { useTranslations, useLocale } from 'next-intl';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useReceipts } from '@/hooks/use-receipts';
import { useFeedbackState, useStartFeedback } from '@/hooks/use-feedback';
import { MessageSquare, ArrowRight, Play, CheckCircle } from 'lucide-react';
import { useRouter } from '@/i18n';
import { cn } from '@/lib/utils';
import { ReceiptViewer } from '@/components/receipt-viewer';
import { getStatusBadge } from '@/lib/receipt-utils';
import { formatDate, formatPoints } from '@/lib/format-utils';

export function ReceiptList() {
  const t = useTranslations('dashboard.receipts');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const { data: receipts, isLoading } = useReceipts();
  const { data: feedbackState } = useFeedbackState(locale);
  const startFeedbackMutation = useStartFeedback(locale);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="p-3 sm:p-6">
              <div className="h-4 bg-muted rounded w-32" />
            </CardHeader>
            <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
              <div className="h-48 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!receipts || receipts.length === 0) {
    return (
      <Card>
        <CardContent className="p-3 sm:p-6 flex flex-col items-center justify-center py-6 ">
          <p className="text-muted-foreground">{t('empty')}</p>
        </CardContent>
      </Card>
    );
  }

  // Sort receipts by createdAt in descending order (most recent first)
  const sortedReceipts = [...receipts].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateB - dateA; // Descending order (newest first)
  });

  const pendingReceipt = sortedReceipts.find((r) => r.status === 'pending');
  const isPendingReceipt = (receiptId: string) =>
    receiptId === pendingReceipt?.id;

  const handleStartFeedback = async (receiptId: string) => {
    if (isPendingReceipt(receiptId)) {
      try {
        if (feedbackState?.status === 'notStarted') {
          await startFeedbackMutation.mutateAsync();
        }
        router.push('/dashboard/feedback');
      } catch (error) {
        console.error('Failed to start feedback:', error);
      }
    }
  };

  const getFeedbackStatusText = (status: string) => {
    const statusTexts = {
      completed: t('feedbackCompleted'),
      inProgress: t('feedbackInProgress'),
      notStarted: t('feedbackNotStarted'),
    };
    return (
      statusTexts[status as keyof typeof statusTexts] || statusTexts.notStarted
    );
  };

  const getFeedbackButtonContent = (status: string) => {
    const configs = {
      completed: {
        icon: CheckCircle,
        text: t('viewFeedback'),
        iconPosition: 'left' as const,
      },
      inProgress: {
        icon: ArrowRight,
        text: t('continueFeedback'),
        iconPosition: 'right' as const,
      },
      notStarted: {
        icon: Play,
        text: t('startFeedback'),
        iconPosition: 'left' as const,
      },
    };

    const config =
      configs[status as keyof typeof configs] || configs.notStarted;
    const Icon = config.icon;

    return config.iconPosition === 'left' ? (
      <>
        <Icon className="h-4 w-4 mr-2" />
        {config.text}
      </>
    ) : (
      <>
        {config.text}
        <Icon className="h-4 w-4 ml-2" />
      </>
    );
  };

  return (
    <div className="space-y-4">
      {sortedReceipts.map((receipt) => {
        const statusBadge = getStatusBadge(receipt.status);
        const StatusIcon = statusBadge.icon;
        const isPending = receipt.status === 'pending';
        const showFeedback =
          isPending && feedbackState && feedbackState.status !== 'unavailable';

        return (
          <Card
            key={receipt.id}
            className={cn('transition-all', isPending && 'border-primary/50 ')}
          >
            <CardHeader className="p-3 sm:p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <StatusIcon className={cn('h-5 w-5', statusBadge.color)} />
                    {t('receipt')} #{receipt.id.slice(0, 8)}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {formatDate(receipt.createdAt)}
                  </CardDescription>
                </div>
                <Badge
                  variant={statusBadge.variant}
                  className={statusBadge.badgeClass}
                >
                  {tCommon(`status.${receipt.status}`)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0 space-y-4">
              {/* Receipt Viewer - handles both images and PDFs */}
              <ReceiptViewer
                receiptUrl={receipt.receiptUrl}
                alt={`Receipt ${receipt.id}`}
                height={230}
                showDownload={false}
              />

              {/* Feedback Status for Pending Receipt */}
              {showFeedback && (
                <div className="p-3 bg-muted rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">
                      {t('feedbackStatus')}
                    </span>
                    <Badge
                      variant="secondary"
                      className={cn(
                        'ml-auto',
                        feedbackState.status === 'completed' &&
                          'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200',
                        feedbackState.status === 'inProgress' &&
                          'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200',
                        feedbackState.status === 'notStarted' &&
                          'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200',
                      )}
                    >
                      {getFeedbackStatusText(feedbackState.status)}
                    </Badge>
                  </div>
                  {feedbackState.status === 'inProgress' &&
                    feedbackState.totalQuestions && (
                      <p className="text-xs text-muted-foreground">
                        {feedbackState.answeredQuestions} /{' '}
                        {feedbackState.totalQuestions} {t('questionsAnswered')}
                      </p>
                    )}
                </div>
              )}
              {/* Points for approved receipts with completed feedback */}
              {receipt.status === 'approved' &&
                receipt.feedbackResult?.status === 'completed' &&
                receipt.feedbackResult?.pointsValue !== undefined &&
                receipt.feedbackResult.pointsValue > 0 && (
                  <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">
                      {t('pointsEarned')}
                    </p>
                    <p className="text-sm font-semibold text-primary">
                      {formatPoints(receipt.feedbackResult.pointsValue, locale)}{' '}
                      {tCommon('points')}
                    </p>
                  </div>
                )}
            </CardContent>
            <CardFooter className="p-3 pt-0 sm:p-6 sm:pt-0 flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => router.push(`/dashboard/receipts/${receipt.id}`)}
              >
                {t('viewDetails')}
              </Button>
              {showFeedback && (
                <Button
                  onClick={() => handleStartFeedback(receipt.id)}
                  className="w-full sm:w-auto"
                  disabled={startFeedbackMutation.isPending}
                >
                  {getFeedbackButtonContent(feedbackState.status)}
                </Button>
              )}
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
