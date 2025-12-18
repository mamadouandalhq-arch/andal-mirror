'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';
import { useRouter } from '@/i18n';
import {
  useAdminApproveReceipt,
  useAdminReceipt,
  useAdminRejectReceipt,
  useAdminFeedback,
} from '@/hooks/use-admin-receipts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { ReceiptViewer } from '@/components/receipt-viewer';
import { formatDate, formatPoints } from '@/lib/format-utils';
import { getStatusBadge } from '@/lib/receipt-utils';
import { Badge } from '@/components/ui/badge';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function AdminReceiptDetailPage() {
  const t = useTranslations('admin.receiptDetail');
  const tCommon = useTranslations('common');
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const receiptId = params.id as string;

  const { data, isLoading, error } = useAdminReceipt(receiptId);
  const approveMutation = useAdminApproveReceipt();
  const rejectMutation = useAdminRejectReceipt();

  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectComment, setRejectComment] = useState('');

  const isMutating = approveMutation.isPending || rejectMutation.isPending;
  const feedback = data?.feedbackResult;
  const statusBadge = data ? getStatusBadge(data.status) : null;

  const { data: feedbackDetail, isLoading: isLoadingFeedback } =
    useAdminFeedback(feedback?.id || '', locale);

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
            <Button
              onClick={() => router.push('/admin/receipts')}
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

  const handleApproveClick = () => {
    setShowApproveDialog(true);
  };

  const handleApproveConfirm = () => {
    approveMutation.mutate(data.id, {
      onSuccess: () => router.push('/admin/receipts'),
    });
  };

  const handleRejectClick = () => {
    setShowRejectDialog(true);
  };

  const handleRejectConfirm = () => {
    rejectMutation.mutate(
      {
        receiptId: data.id,
        comment: rejectComment.trim() || undefined,
      },
      {
        onSuccess: () => {
          setShowRejectDialog(false);
          setRejectComment('');
          router.push('/admin/receipts');
        },
      },
    );
  };

  return (
    <main className="min-h-full bg-gray-50 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <Button
          onClick={() => router.push('/admin/receipts')}
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
              {data.comment && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm font-medium text-destructive mb-1">
                    {t('rejectionComment')}:
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {data.comment}
                  </p>
                </div>
              )}
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
                  {feedback.status === 'completed' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Scroll to feedback section
                        document
                          .getElementById('feedback-detail')
                          ?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="w-full"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      {t('viewFeedback')}
                    </Button>
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
                onClick={handleApproveClick}
                disabled={isMutating || data.status !== 'pending'}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {t('approve')}
              </Button>
              <Button
                className="w-full"
                variant="destructive"
                onClick={handleRejectClick}
                disabled={isMutating || data.status !== 'pending'}
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

        {/* Feedback Detail Section */}
        {feedback?.status === 'completed' && (
          <Card id="feedback-detail">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                {t('feedbackDetails')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingFeedback ? (
                <div className="flex justify-center py-8">
                  <Spinner />
                </div>
              ) : feedbackDetail ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">
                        {t('points')}:
                      </p>
                      <p className="font-semibold text-primary">
                        {formatPoints(feedbackDetail.pointsValue)}{' '}
                        {tCommon('points')}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">
                        {t('completedAt')}:
                      </p>
                      <p>
                        {feedbackDetail.completedAt
                          ? formatDate(feedbackDetail.completedAt, {
                              includeTime: true,
                              monthFormat: 'long',
                            })
                          : '-'}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-sm font-medium">{t('answers')}:</p>
                    <div className="space-y-3">
                      {feedbackDetail.answers.map((answer, index) => (
                        <div
                          key={index}
                          className="p-3 bg-muted rounded-lg space-y-1"
                        >
                          <p className="text-sm font-medium">
                            {index + 1}. {answer.question}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {answer.answer}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">{t('noFeedbackData')}</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Approve Confirmation Dialog */}
        <AlertDialog
          open={showApproveDialog}
          onOpenChange={setShowApproveDialog}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('confirmApprove')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('confirmApproveDescription')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={handleApproveConfirm}>
                {t('approve')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Reject Confirmation Dialog */}
        <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('confirmReject')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('confirmRejectDescription')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="reject-comment">
                  {t('rejectionComment')} ({t('optional')})
                </Label>
                <Textarea
                  id="reject-comment"
                  placeholder={t('rejectionCommentPlaceholder')}
                  value={rejectComment}
                  onChange={(e) => setRejectComment(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  setRejectComment('');
                }}
              >
                {t('cancel')}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleRejectConfirm}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {t('reject')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </main>
  );
}
