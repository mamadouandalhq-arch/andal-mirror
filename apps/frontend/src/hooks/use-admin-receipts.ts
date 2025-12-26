'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export type AdminReceiptStatus = 'pending' | 'approved' | 'rejected';

export interface AdminReceiptUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  avatarUrl?: string | null;
}

export interface AdminReceiptListItem {
  id: string;
  status: AdminReceiptStatus;
  createdAt: string;
  approvedAt: string | null;
  user: AdminReceiptUser;
  feedbackResult: {
    id: string;
    status: 'inProgress' | 'completed';
    pointsValue: number;
    completedAt?: string | null;
  } | null;
}

export interface AdminFeedbackResult {
  id: string;
  status: 'inProgress' | 'completed';
  totalQuestions: number;
  answeredQuestions: number;
  pointsValue: number;
  comment?: string | null;
  completedAt?: string | null;
  createdAt: string;
}

export interface AdminReceiptDetail extends AdminReceiptListItem {
  receiptUrl: string;
  comment?: string | null;
  feedbackResult: AdminFeedbackResult | null;
}

export interface AdminFeedbackDetail {
  id: string;
  status: 'inProgress' | 'completed';
  pointsValue: number;
  createdAt: string;
  completedAt?: string | null;
  answers: Array<{
    question: string;
    answer: string;
  }>;
}

export function useAdminReceipts() {
  // Only receipts with submitted feedback (completed)
  return useQuery({
    queryKey: ['admin-receipts', 'completed-feedback'],
    queryFn: () =>
      apiClient.get<AdminReceiptListItem[]>(
        '/admin/receipts?feedbackStatus=completed',
      ),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useAdminReceipt(receiptId: string) {
  return useQuery({
    queryKey: ['admin-receipt', receiptId],
    queryFn: () =>
      apiClient.get<AdminReceiptDetail>(`/admin/receipts/${receiptId}`),
    enabled: !!receiptId,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useAdminApproveReceipt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (receiptId: string) =>
      apiClient.patch<{ id: string; status: 'approved' }>(
        '/admin/receipts/review',
        {
          receiptId,
          status: 'approved',
        },
      ),
    onSuccess: (_data, receiptId) => {
      queryClient.invalidateQueries({ queryKey: ['admin-receipts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-receipt', receiptId] });
    },
  });
}

export function useAdminRejectReceipt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { receiptId: string; comment?: string }) =>
      apiClient.patch<{ id: string; status: 'rejected' }>(
        '/admin/receipts/review',
        {
          receiptId: data.receiptId,
          status: 'rejected',
          comment: data.comment,
        },
      ),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-receipts'] });
      queryClient.invalidateQueries({
        queryKey: ['admin-receipt', variables.receiptId],
      });
    },
  });
}

export function useAdminFeedback(feedbackId: string, language: string) {
  return useQuery({
    queryKey: ['admin-feedback', feedbackId, language],
    queryFn: () =>
      apiClient.get<AdminFeedbackDetail>(
        `/admin/feedback/${feedbackId}?language=${language}`,
      ),
    enabled: !!feedbackId && !!language,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}
