import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export type ReceiptStatus = 'pending' | 'approved' | 'rejected';

export interface Receipt {
  id: string;
  receiptUrl: string;
  status: ReceiptStatus;
  createdAt: string;
  approvedAt: string | null;
  userId: string;
  // Note: pointsValue is not in receipt - it comes from FeedbackResult.pointsValue
}

export function useReceipts() {
  return useQuery({
    queryKey: ['receipts'],
    queryFn: () => apiClient.get<Receipt[]>('/receipt/list'),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useReceipt(receiptId: string) {
  return useQuery({
    queryKey: ['receipts', receiptId],
    queryFn: () => apiClient.get<Receipt>(`/receipt/${receiptId}`),
    enabled: !!receiptId,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

interface UploadReceiptResponse {
  url: string;
}

export function useReceiptUpload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      return apiClient.post<UploadReceiptResponse>('/receipt/upload', formData);
    },
    onSuccess: () => {
      // Invalidate receipts query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['receipts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}
