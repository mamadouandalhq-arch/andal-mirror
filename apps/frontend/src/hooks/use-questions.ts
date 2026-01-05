'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { FeedbackQuestionDto } from '@shared/feedback';

export interface FeedbackQuestionTranslation {
  language: string;
  text: string;
}

export interface FeedbackOptionTranslation {
  language: string;
  label: string;
}

export interface FeedbackOption {
  id: string;
  key: string;
  order: number;
  score: number | null;
  translations: FeedbackOptionTranslation[];
}

export interface FeedbackQuestion {
  id: string;
  type: 'single' | 'multiple' | 'text';
  createdAt: string;
  translations: FeedbackQuestionTranslation[];
  options: FeedbackOption[];
}

export interface CreateFeedbackQuestionData {
  type: 'single' | 'multiple' | 'text';
  translations: FeedbackQuestionTranslation[];
  options: Array<{
    key: string;
    order: number;
    score?: number | null;
    translations: FeedbackOptionTranslation[];
  }>;
}

export function useQuestions() {
  return useQuery({
    queryKey: ['admin', 'questions'],
    queryFn: () => apiClient.get<FeedbackQuestion[]>('/admin/questions'),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useQuestion(questionId: string) {
  return useQuery({
    queryKey: ['admin', 'question', questionId],
    queryFn: () =>
      apiClient.get<FeedbackQuestion>(`/admin/questions/${questionId}`),
    enabled: !!questionId,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useCreateQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFeedbackQuestionData) =>
      apiClient.post<FeedbackQuestion>('/admin/questions', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'questions'] });
    },
  });
}
