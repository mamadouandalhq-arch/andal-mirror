'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export type RiskLevel = 'high' | 'medium' | 'low';

export interface AdminUserListItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  pointsBalance: number;
  createdAt: string;
  receiptsCount: number;
  redemptionsCount: number;
  riskLevel: RiskLevel;
  riskAssessment: {
    averagePercentage: number;
    completedSurveys: number;
  };
}

export interface AdminUserDetail extends AdminUserListItem {
  city: string | null;
  street: string | null;
  building: string | null;
  apartment: string | null;
  avatarUrl: string | null;
  riskAssessment: {
    level: RiskLevel;
    averagePercentage: number;
    totalScore: number;
    maxPossibleScore: number;
    completedSurveys: number;
  };
  receipts: Array<{
    id: string;
    status: string;
    createdAt: string;
    receiptUrl: string;
  }>;
  redemptions: Array<{
    id: string;
    status: string;
    pointsAmount: number;
    dollarAmount: number;
    createdAt: string;
  }>;
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: () => apiClient.get<AdminUserListItem[]>('/admin/users'),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useAdminUser(userId: string) {
  return useQuery({
    queryKey: ['admin-user', userId],
    queryFn: () => apiClient.get<AdminUserDetail>(`/admin/users/${userId}`),
    enabled: !!userId,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

