'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n';
import { useParams } from 'next/navigation';
import { useReceipt } from '@/hooks/use-receipts';
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
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ReceiptViewer } from '@/components/receipt-viewer';
import { getStatusBadge } from '@/lib/receipt-utils';
import { formatDate } from '@/lib/format-utils';

export default function ReceiptDetailsPage() {
  const t = useTranslations('dashboard.receipts.details');
  const tCommon = useTranslations('common');
  const params = useParams();
  const router = useRouter();
  const receiptId = params.id as string;
  const { data: receipt, isLoading, error } = useReceipt(receiptId);

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
                  {t('uploadedOn')}: {formatDate(receipt.createdAt, { includeTime: true, monthFormat: 'long' })}
                </CardDescription>
                {receipt.approvedAt && (
                  <CardDescription>
                    {t('approvedOn')}: {formatDate(receipt.approvedAt, { includeTime: true, monthFormat: 'long' })}
                  </CardDescription>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Receipt Viewer - handles both images and PDFs */}
            <ReceiptViewer
              receiptUrl={receipt.receiptUrl}
              alt={`Receipt ${receipt.id}`}
              height={300}
              showDownload={true}
            />

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
              {/* Note: Points come from FeedbackResult.pointsValue, not from receipt */}
            </div>

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
