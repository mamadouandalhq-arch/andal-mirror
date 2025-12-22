import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { FeedbackStateResponse } from '@shared/feedback';

export interface AnswerQuestionDto {
  answerKeys?: string[];
  language: string;
}

export function useFeedbackState(locale: string) {
  return useQuery({
    queryKey: ['feedback', 'state', locale],
    queryFn: () => {
      // Pass locale as query parameter
      return apiClient.get<FeedbackStateResponse>(
        `/feedback/state?language=${locale}`,
      );
    },
    staleTime: 10 * 1000, // 10 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    retry: false, // Don't retry if unavailable
  });
}

export function useStartFeedback(locale: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      // Pass locale as query parameter
      return apiClient.post<FeedbackStateResponse>(`/feedback/start`, {
        language: locale,
      });
    },
    onSuccess: () => {
      // Invalidate feedback state to refetch
      queryClient.invalidateQueries({ queryKey: ['feedback', 'state'] });
    },
  });
}

export function useAnswerQuestion(locale: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: { answerKeys?: string[] }) => {
      const body: { answerKeys?: string[]; language: string } = {
        language: locale,
      };
      // Include answerKeys if it's explicitly provided (even if empty array)
      if (dto.answerKeys !== undefined) {
        body.answerKeys = dto.answerKeys;
      }
      return apiClient.post<FeedbackStateResponse>(
        '/feedback/answer-question',
        body,
      );
    },
    onSuccess: (data) => {
      // Invalidate feedback state to refetch
      queryClient.invalidateQueries({ queryKey: ['feedback', 'state'] });
      
      // If feedback is completed, invalidate receipts to update receipt status
      if (data.status === 'completed') {
        queryClient.invalidateQueries({ queryKey: ['receipts'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      }
    },
  });
}

export function useReturnBack(locale: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      return apiClient.post<FeedbackStateResponse>('/feedback/back', {
        language: locale,
      });
    },
    onSuccess: () => {
      // Invalidate feedback state to refetch
      queryClient.invalidateQueries({ queryKey: ['feedback', 'state'] });
    },
  });
}
