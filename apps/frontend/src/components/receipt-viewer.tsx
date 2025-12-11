'use client';

import { useState } from 'react';
import { FileText, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ReceiptViewerProps {
  receiptUrl: string;
  alt: string;
  height?: number;
  showDownload?: boolean;
  className?: string;
}

function checkUrlForPdf(url: string): boolean {
  if (!url) return false;
  const lowerUrl = url.toLowerCase();

  // Check for .pdf extension in URL
  if (lowerUrl.endsWith('.pdf') || lowerUrl.includes('.pdf?')) {
    return true;
  }

  // Check for PDF in the path
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname.toLowerCase();
    if (pathname.endsWith('.pdf')) {
      return true;
    }
  } catch {
    // If URL parsing fails, just check the string
    if (lowerUrl.includes('.pdf')) {
      return true;
    }
  }

  return false;
}

export function ReceiptViewer({
  receiptUrl,
  alt,
  height = 200,
  showDownload = false,
  className,
}: ReceiptViewerProps) {
  const [imageError, setImageError] = useState(false);

  // Check URL pattern - if no .pdf extension, assume it's an image
  // The image onError handler will catch PDFs that fail to load as images
  const isPdfFile = checkUrlForPdf(receiptUrl);

  // If we detect it's a PDF, show PDF viewer
  if (isPdfFile) {
    return (
      <div
        className={cn(
          'relative w-full rounded-lg overflow-hidden bg-muted border-2 border-dashed border-muted-foreground/20 flex flex-col items-center justify-center',
          className,
        )}
        style={{ height: `${height}px` }}
      >
        <div className="flex flex-col items-center justify-center p-6 space-y-4">
          <div className="rounded-lg bg-primary/10 p-4">
            <FileText className="h-12 w-12 text-primary" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-sm font-medium text-foreground">PDF Receipt</p>
            <p className="text-xs text-muted-foreground">
              Click to view or download
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(receiptUrl, '_blank')}
              className="min-h-[36px]"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View PDF
            </Button>
            {showDownload && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = receiptUrl;
                  link.download = alt;
                  link.target = '_blank';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="min-h-[36px]"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // For images, use regular img tag
  // If image fails to load, it might be a PDF, so show PDF viewer
  if (imageError) {
    return (
      <div
        className={cn(
          'relative w-full rounded-lg overflow-hidden bg-muted border-2 border-dashed border-muted-foreground/20 flex flex-col items-center justify-center',
          className,
        )}
        style={{ height: `${height}px` }}
      >
        <div className="flex flex-col items-center justify-center p-6 space-y-4">
          <div className="rounded-lg bg-primary/10 p-4">
            <FileText className="h-12 w-12 text-primary" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-sm font-medium text-foreground">PDF Receipt</p>
            <p className="text-xs text-muted-foreground">
              Click to view or download
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(receiptUrl, '_blank')}
              className="min-h-[36px]"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View PDF
            </Button>
            {showDownload && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = receiptUrl;
                  link.download = alt;
                  link.target = '_blank';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="min-h-[36px]"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative w-full rounded-lg overflow-hidden bg-muted',
        className,
      )}
      style={{ height: `${height}px` }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={receiptUrl}
        alt={alt}
        className="w-full h-full object-contain"
        style={{ height: `${height}px` }}
        onError={() => {
          // If image fails to load, it might be a PDF
          setImageError(true);
        }}
        onLoad={() => {
          // Reset error state if image loads successfully
          setImageError(false);
        }}
      />
    </div>
  );
}
