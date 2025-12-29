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
import {
  MessageSquare,
  Play,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';
import { useRouter } from '@/i18n';
import { formatPoints } from '@/lib/format-utils';
import { logger } from '@/lib/logger';

export function PendingReceiptFeedbackStatus() {
  const t = useTranslations('feedback');
  const tCommon = useTranslations('common');
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

  // Calculate remaining questions and potential points
  const remainingQuestions = feedbackState.totalQuestions
    ? feedbackState.totalQuestions - (feedbackState.answeredQuestions || 0)
    : 0;

  const currentPoints = feedbackState.pointsValue || 0;

  const handleStartFeedback = async () => {
    if (feedbackState.status === 'notStarted') {
      try {
        await startFeedbackMutation.mutateAsync();
        router.push('/dashboard/feedback');
      } catch (error) {
        logger.error('Failed to start feedback:', error);
      }
    } else if (isInProgress) {
      router.push('/dashboard/feedback');
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
          {isCompleted
            ? t('completedDescription')
            : isInProgress && remainingQuestions > 0
            ? remainingQuestions === 1
              ? t('oneQuestionLeft')
              : t('questionsLeft', { count: remainingQuestions.toString() })
            : t('inProgressDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0 space-y-4">
        {isInProgress && feedbackState.totalQuestions && (
          <>
            <div className="space-y-2">
              <div className="flex justify-between text-sm items-center">
                <span className="font-medium">{t('progress')}</span>
                <span className="text-muted-foreground">
                  {feedbackState.answeredQuestions} /{' '}
                  {feedbackState.totalQuestions}{' '}
                  {t('questionsAnswered', { defaultValue: 'questions' })}
                </span>
              </div>
              <Progress value={progress * 100} className="h-3" />
            </div>

            {/* Points earned section with motivation */}
            {currentPoints > 0 && (
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">
                      {t('earned')}
                    </span>
                  </div>
                  <span className="text-lg font-bold text-primary">
                    {formatPoints(currentPoints, locale)} {tCommon('points')}
                  </span>
                </div>
                {remainingQuestions > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {remainingQuestions === 1
                      ? t('earnMorePointsOne', {
                          defaultValue:
                            'Complete 1 more question to earn more points!',
                        })
                      : t('earnMorePoints', {
                          remaining: remainingQuestions.toString(),
                        })}
                  </p>
                )}
              </div>
            )}
          </>
        )}

        {isCompleted && currentPoints > 0 && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-900">
                  {t('totalEarned', { defaultValue: 'Total Earned' })}
                </span>
              </div>
              <span className="text-xl font-bold text-emerald-700">
                {formatPoints(currentPoints, locale)} {tCommon('points')}
              </span>
            </div>
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
