'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export type RedemptionStatus = 'pending' | 'approved' | 'completed' | 'rejected';

export interface Redemption {
  id: string;
  userId: string;
  pointsAmount: number;
  dollarAmount: number;
  paymentMethod: 'email' | 'phone';
  paymentEmail: string | null;
  paymentPhone: string | null;
  status: RedemptionStatus;
  createdAt: string;
  approvedAt: string | null;
  completedAt: string | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
  adminComment: string | null;
}

export interface AdminRedemption extends Redemption {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  };
}

export function useRedemptions() {
  return useQuery({
    queryKey: ['redemptions'],
    queryFn: () => apiClient.get<Redemption[]>('/redemption'),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useCreateRedemption() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      pointsAmount: number;
      paymentMethod: 'email' | 'phone';
      paymentEmail?: string;
      paymentPhone?: string;
    }) => apiClient.post<Redemption>('/redemption', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['redemptions'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useAdminRedemptions(status?: RedemptionStatus) {
  const queryParams = status ? `?status=${status}` : '';
  return useQuery({
    queryKey: ['admin-redemptions', status],
    queryFn: () =>
      apiClient.get<AdminRedemption[]>(`/admin/redemptions${queryParams}`),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useAdminRedemption(redemptionId: string) {
  return useQuery({
    queryKey: ['admin-redemption', redemptionId],
    queryFn: () =>
      apiClient.get<AdminRedemption>(`/admin/redemptions/${redemptionId}`),
    enabled: !!redemptionId,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useApproveRedemption() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (redemptionId: string) =>
      apiClient.patch<Redemption>(
        `/admin/redemptions/${redemptionId}/approve`,
        {},
      ),
    onSuccess: (_data, redemptionId) => {
      queryClient.invalidateQueries({ queryKey: ['admin-redemptions'] });
      queryClient.invalidateQueries({
        queryKey: ['admin-redemption', redemptionId],
      });
    },
  });
}

export function useCompleteRedemption() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (redemptionId: string) =>
      apiClient.patch<Redemption>(
        `/admin/redemptions/${redemptionId}/complete`,
        {},
      ),
    onSuccess: (_data, redemptionId) => {
      queryClient.invalidateQueries({ queryKey: ['admin-redemptions'] });
      queryClient.invalidateQueries({
        queryKey: ['admin-redemption', redemptionId],
      });
    },
  });
}

export function useRejectRedemption() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      redemptionId: string;
      rejectionReason?: string;
    }) =>
      apiClient.patch<Redemption>(
        `/admin/redemptions/${data.redemptionId}/reject`,
        {
          rejectionReason: data.rejectionReason,
        },
      ),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-redemptions'] });
      queryClient.invalidateQueries({
        queryKey: ['admin-redemption', variables.redemptionId],
      });
    },
  });
}

