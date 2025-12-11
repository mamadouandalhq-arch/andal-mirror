'use client';

import { useTranslations, useLocale } from 'next-intl';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFeedbackState, useStartFeedback } from '@/hooks/use-feedback';
import { Progress } from '@/components/ui/progress';
import { MessageSquare, Play, ArrowRight } from 'lucide-react';
import { useRouter } from '@/i18n';

export function PendingReceiptFeedbackStatus() {
  const t = useTranslations('dashboard.feedback');
  const locale = useLocale();
  const router = useRouter();
  const { data: feedbackState, isLoading } = useFeedbackState(locale);
  const startFeedbackMutation = useStartFeedback(locale);

  // Don't show if loading or unavailable/not started
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            {t('title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
          <div className="h-20 bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  if (
    !feedbackState ||
    feedbackState.status === 'unavailable' ||
    feedbackState.status === 'notStarted'
  ) {
    return null;
  }

  const isInProgress = feedbackState.status === 'inProgress';
  const isCompleted = feedbackState.status === 'completed';
  const progress = feedbackState.totalQuestions
    ? (feedbackState.answeredQuestions || 0) / feedbackState.totalQuestions
    : 0;

  const handleStartFeedback = async () => {
    if (feedbackState.status === 'notStarted') {
      try {
        await startFeedbackMutation.mutateAsync();
        router.push('/feedback');
      } catch (error) {
        console.error('Failed to start feedback:', error);
      }
    } else if (isInProgress) {
      router.push('/feedback');
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="p-3 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <CardTitle>{t('title')}</CardTitle>
          </div>
          <Badge
            variant={isCompleted ? 'default' : 'secondary'}
            className={
              isCompleted
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                : 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200'
            }
          >
            {isCompleted ? t('completed') : t('inProgress')}
          </Badge>
        </div>
        <CardDescription>
          {isCompleted ? t('completedDescription') : t('inProgressDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0 space-y-4">
        {isInProgress && feedbackState.totalQuestions && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{t('progress')}</span>
              <span>
                {feedbackState.answeredQuestions} /{' '}
                {feedbackState.totalQuestions}
              </span>
            </div>
            <Progress value={progress * 100} className="h-2" />
          </div>
        )}

        {feedbackState.pointsValue !== undefined &&
          feedbackState.pointsValue > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">{t('earned')}:</span>
              <span className="font-semibold text-primary">
                {feedbackState.pointsValue.toLocaleString()}{' '}
                {t('points', { defaultValue: 'points' })}
              </span>
            </div>
          )}

        {isInProgress && feedbackState.currentQuestion && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-1">{t('currentQuestion')}</p>
            <p className="text-sm text-muted-foreground">
              {feedbackState.currentQuestion.text}
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-3 pt-0 sm:p-6 sm:pt-0">
        {isCompleted ? (
          <Button variant="outline" className="w-full" disabled>
            {t('completed')}
          </Button>
        ) : (
          <Button
            onClick={handleStartFeedback}
            className="w-full"
            disabled={startFeedbackMutation.isPending}
          >
            {isInProgress ? (
              <>
                {t('continue')}
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                {t('start')}
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
