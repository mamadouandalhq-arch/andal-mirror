'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { ActiveSurveyDto, CreateActiveSurveyDto } from '@shared/survey';

export function useActiveSurvey() {
  return useQuery({
    queryKey: ['admin', 'active-survey'],
    queryFn: () => apiClient.get<ActiveSurveyDto>('/admin/active-survey'),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useCreateActiveSurvey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateActiveSurveyDto) =>
      apiClient.post<ActiveSurveyDto>('/admin/active-survey', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'active-survey'] });
    },
  });
}
