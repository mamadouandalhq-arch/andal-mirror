'use client';

import { useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n';
import { useFeedbackState, useStartFeedback } from '@/hooks/use-feedback';
import { FeedbackQuestionForm } from './_components/feedback-question-form';
import { FeedbackCompleted } from './_components/feedback-completed';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export default function FeedbackPage() {
  const t = useTranslations('feedback');
  const locale = useLocale();
  const router = useRouter();
  const { data: feedbackState, isLoading, refetch } = useFeedbackState(locale);
  const startFeedbackMutation = useStartFeedback(locale);

  // Auto-start feedback if not started
  useEffect(() => {
    if (
      feedbackState?.status === 'notStarted' &&
      !startFeedbackMutation.isPending
    ) {
      startFeedbackMutation.mutate();
    }
  }, [feedbackState?.status, startFeedbackMutation]);

  if (isLoading || startFeedbackMutation.isPending) {
    return (
      <main className="min-h-full bg-gray-50 flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Spinner size="lg" />
            <p className="mt-4 text-muted-foreground">{t('loading')}</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  // Handle unavailable state
  if (!feedbackState || feedbackState.status === 'unavailable') {
    return (
      <main className="min-h-full bg-gray-50 flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
            <AlertCircle className="h-12 w-12 text-muted-foreground" />
            <h2 className="text-xl font-semibold">{t('unavailable.title')}</h2>
            <p className="text-center text-muted-foreground">
              {t('unavailable.message')}
            </p>
            <Button onClick={() => router.push('/dashboard')} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('unavailable.backToDashboard')}
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  // Handle completed state
  if (
    feedbackState.status === 'completed' &&
    feedbackState.pointsValue !== undefined
  ) {
    return (
      <main className="min-h-full bg-gray-50 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <div className="max-w-7xl mx-auto">
          <Button
            onClick={() => router.push('/dashboard')}
            variant="ghost"
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('backToDashboard')}
          </Button>
          <FeedbackCompleted points={feedbackState.pointsValue} />
        </div>
      </main>
    );
  }

  // Handle in progress state
  if (
    feedbackState.status === 'inProgress' &&
    feedbackState.currentQuestion &&
    feedbackState.totalQuestions !== undefined &&
    feedbackState.answeredQuestions !== undefined
  ) {
    return (
      <main className="min-h-full bg-gray-50 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <div className="max-w-7xl mx-auto">
          <Button
            onClick={() => router.push('/dashboard')}
            variant="ghost"
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('backToDashboard')}
          </Button>
          <FeedbackQuestionForm
            question={feedbackState.currentQuestion}
            answeredQuestions={feedbackState.answeredQuestions}
            totalQuestions={feedbackState.totalQuestions}
            onAnswerSubmitted={() => {
              // Refetch to get next question or completion state
              refetch();
            }}
          />
        </div>
      </main>
    );
  }

  // Fallback loading state
  return (
    <main className="min-h-full bg-gray-50 flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Spinner size="lg" />
          <p className="mt-4 text-muted-foreground">{t('loading')}</p>
        </CardContent>
      </Card>
    </main>
  );
}
