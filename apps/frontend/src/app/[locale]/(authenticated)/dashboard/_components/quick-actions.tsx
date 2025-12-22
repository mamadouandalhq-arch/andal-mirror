'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { useReceiptUpload, useReceipts } from '@/hooks/use-receipts';
import { useDashboardStats } from '@/hooks/use-dashboard-stats';
import { Upload, Loader2 } from 'lucide-react';
import { useRef, useState } from 'react';

export function QuickActions() {
  const t = useTranslations('dashboard.quickActions');
  const { stats } = useDashboardStats();
  const { data: receipts } = useReceipts();
  const uploadMutation = useReceiptUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const hasPendingReceipt = stats?.hasPendingReceipt ?? false;
  const isDisabled = hasPendingReceipt || uploadMutation.isPending;

  // Determine which status the active receipt has
  const activeReceipt = receipts?.find(
    (r) => r.status === 'awaitingFeedback' || r.status === 'pending',
  );
  const activeReceiptStatus = activeReceipt?.status;

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

  const handleUploadClick = () => {
    if (!isDisabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploadError(null);

    // Validate file before upload
    const validationError = validateFile(file);
    if (validationError) {
      setUploadError(validationError);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

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

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await handleFileUpload(file);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDisabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set isDragging to false if we're leaving the drop zone
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (isDisabled) return;

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    await handleFileUpload(file);
  };

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        className="hidden"
        onChange={handleFileChange}
        disabled={isDisabled}
      />
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-6 transition-all
          ${
            isDragging
              ? 'border-primary bg-primary/5 scale-[1.02]'
              : 'border-border hover:border-primary/50'
          }
          ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          {uploadMutation.isPending ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm font-medium">{t('uploading')}</p>
            </>
          ) : (
            <>
              <div
                className={`
                  p-3 rounded-full transition-colors
                  ${
                    isDragging
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }
                `}
              >
                <Upload
                  className={`h-6 w-6 ${
                    isDragging ? 'text-primary-foreground' : ''
                  }`}
                />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  {isDragging ? t('dropFileHere') : t('dragAndDropOrClick')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('supportedFormats')}
                </p>
              </div>
              <Button
                onClick={handleUploadClick}
                disabled={isDisabled}
                variant={isDragging ? 'default' : 'outline'}
                size="sm"
                className="mt-2"
              >
                {t('selectFile')}
              </Button>
            </>
          )}
        </div>
      </div>
      {hasPendingReceipt && (
        <p className="text-sm text-muted-foreground">
          {activeReceiptStatus === 'awaitingFeedback'
            ? t('awaitingFeedbackWarning')
            : t('pendingReceiptWarning')}
        </p>
      )}
      {uploadError && <p className="text-sm text-destructive">{uploadError}</p>}
    </div>
  );
}
