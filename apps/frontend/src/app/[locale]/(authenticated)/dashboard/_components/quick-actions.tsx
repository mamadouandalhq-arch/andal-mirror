'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { useReceiptUpload } from '@/hooks/use-receipts';
import { useDashboardStats } from '@/hooks/use-dashboard-stats';
import { Upload, Loader2 } from 'lucide-react';
import { useRef, useState } from 'react';

export function QuickActions() {
  const t = useTranslations('dashboard.quickActions');
  const { stats } = useDashboardStats();
  const uploadMutation = useReceiptUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const hasPendingReceipt = stats?.hasPendingReceipt ?? false;

  const handleUploadClick = () => {
    if (!hasPendingReceipt && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    try {
      await uploadMutation.mutateAsync(file);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t('uploadError');
      setUploadError(errorMessage);
    }
  };

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={handleFileChange}
        disabled={hasPendingReceipt || uploadMutation.isPending}
      />
      <Button
        onClick={handleUploadClick}
        disabled={hasPendingReceipt || uploadMutation.isPending}
        className="w-full sm:w-auto min-h-[44px]"
        size="lg"
      >
        {uploadMutation.isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {t('uploading')}
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" />
            {t('uploadReceipt')}
          </>
        )}
      </Button>
      {hasPendingReceipt && (
        <p className="text-sm text-muted-foreground">
          {t('pendingReceiptWarning')}
        </p>
      )}
      {uploadError && <p className="text-sm text-destructive">{uploadError}</p>}
    </div>
  );
}
