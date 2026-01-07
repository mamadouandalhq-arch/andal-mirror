'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n';
import { useParams } from 'next/navigation';
import { useReceipt, useReceiptUpdate } from '@/hooks/use-receipts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { ArrowLeft, ExternalLink, Info, Upload, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ReceiptViewer } from '@/components/receipt-viewer';
import { getStatusBadge } from '@/lib/receipt-utils';
import { formatDate, formatPoints } from '@/lib/format-utils';
import { useRef, useState } from 'react';

export default function ReceiptDetailsPage() {
  const t = useTranslations('dashboard.receipts.details');
  const tCommon = useTranslations('common');
  const params = useParams();
  const router = useRouter();
  const receiptId = params.id as string;
  const { data: receipt, isLoading, error } = useReceipt(receiptId);
  const updateMutation = useReceiptUpdate(receiptId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Supported MIME types matching backend validation
  const supportedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
  ];
  const maxFileSize = 5 * 1024 * 1024; // 5MB

  const validateFile = (file: File): string | null => {
    // Validate file type
    if (!supportedMimeTypes.includes(file.type)) {
      return t('invalidFileType');
    }

    // Validate file size
    if (file.size > maxFileSize) {
      return t('fileTooLarge');
    }

    return null;
  };

  const handleChangePhotoClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUpdateError(null);
    setUpdateSuccess(false);

    // Validate file before upload
    const validationError = validateFile(file);
    if (validationError) {
      setUpdateError(validationError);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    try {
      await updateMutation.mutateAsync(file);
      setUpdateSuccess(true);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      // Clear success message after 3 seconds
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t('updateError');
      setUpdateError(errorMessage);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-full bg-gray-50 flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Spinner size="lg" />
            <p className="mt-4 text-muted-foreground">{t('loading')}</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (error || !receipt) {
    return (
      <main className="min-h-full bg-gray-50 flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
            <p className="text-destructive">{t('error')}</p>
            <Button onClick={() => router.push('/dashboard')} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('backToDashboard')}
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  const statusBadge = getStatusBadge(receipt.status);
  const StatusIcon = statusBadge.icon;

  return (
    <main className="min-h-full bg-gray-50 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <div className="max-w-4xl mx-auto">
        <Button
          onClick={() => router.push('/dashboard')}
          variant="ghost"
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('backToDashboard')}
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
                  <StatusIcon className={cn('h-6 w-6', statusBadge.color)} />
                  {t('receipt')} #{receipt.id.slice(0, 8)}
                </CardTitle>
                <CardDescription className="mt-2">
                  {t('uploadedOn')}:{' '}
                  {formatDate(receipt.createdAt, {
                    includeTime: true,
                    monthFormat: 'long',
                  })}
                </CardDescription>
                {receipt.approvedAt && (
                  <CardDescription>
                    {t('approvedOn')}:{' '}
                    {formatDate(receipt.approvedAt, {
                      includeTime: true,
                      monthFormat: 'long',
                    })}
                  </CardDescription>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Receipt Viewer - handles both images and PDFs */}
            <div className="space-y-2">
              <ReceiptViewer
                receiptUrl={receipt.receiptUrl}
                alt={`Receipt ${receipt.id}`}
                height={300}
                showDownload={true}
              />
              {/* Change Photo Button - only for awaitingFeedback status */}
              {receipt.status === 'awaitingFeedback' && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={updateMutation.isPending}
                  />
                  <Button
                    variant="outline"
                    onClick={handleChangePhotoClick}
                    disabled={updateMutation.isPending}
                    className="w-full"
                  >
                    {updateMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {t('uploadingNewPhoto')}
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        {t('changePhoto')}
                      </>
                    )}
                  </Button>
                </>
              )}
              {updateSuccess && (
                <p className="text-sm text-green-600">{t('photoUpdated')}</p>
              )}
              {updateError && (
                <p className="text-sm text-destructive">{updateError}</p>
              )}
            </div>

            {/* Receipt Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  {t('receiptId')}
                </p>
                <p className="text-sm font-mono">{receipt.id}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  {t('statusLabel')}
                </p>
                <Badge
                  variant={statusBadge.variant}
                  className={statusBadge.badgeClass}
                >
                  {tCommon(`status.${receipt.status}`)}
                </Badge>
              </div>
            </div>

            {/* Info message for awaiting feedback receipts */}
            {receipt.status === 'awaitingFeedback' && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-900">
                    {t('awaitingFeedbackInfo')}
                  </p>
                </div>
              </div>
            )}

            {/* Points earned from feedback - only for approved receipts */}
            {receipt.status === 'approved' &&
              receipt.feedbackResult?.status === 'completed' &&
              receipt.feedbackResult?.pointsValue !== undefined &&
              receipt.feedbackResult.pointsValue > 0 && (
                <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {t('pointsEarned')}
                  </p>
                  <p className="text-lg font-semibold text-primary">
                    {formatPoints(receipt.feedbackResult.pointsValue)}{' '}
                    {tCommon('points')}
                  </p>
                </div>
              )}

            {/* Admin Comment (if rejected) */}
            {receipt.status === 'rejected' && receipt.comment && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm font-medium text-destructive mb-2">
                  {t('rejectionComment')}
                </p>
                <p className="text-sm text-muted-foreground">
                  {receipt.comment}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => window.open(receipt.receiptUrl, '_blank')}
                className="w-full sm:w-auto"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                {t('openInNewTab')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
