'use client';

import { useState, useEffect, startTransition } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAnswerQuestion, useReturnBack } from '@/hooks/use-feedback';
import { FeedbackQuestionDto } from '@shared/feedback';
import { Loader2, CheckCircle2, ChevronLeft, SkipForward } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeedbackQuestionFormProps {
  question: FeedbackQuestionDto;
  answeredQuestions: number;
  totalQuestions: number;
  onAnswerSubmitted: () => void;
}

export function FeedbackQuestionForm({
  question,
  answeredQuestions,
  totalQuestions,
  onAnswerSubmitted,
}: FeedbackQuestionFormProps) {
  const t = useTranslations('feedback');
  const locale = useLocale();
  const answerMutation = useAnswerQuestion(locale);
  const returnBackMutation = useReturnBack(locale);

  // Initialize with answer from backend if available
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>(
    question.currentAnswer || [],
  );

  // Update selected answers when question changes (e.g., when navigating back)
  useEffect(() => {
    startTransition(() => {
      setSelectedAnswers(question.currentAnswer || []);
    });
  }, [question.id, question.currentAnswer]);

  const isSingleChoice = question.type === 'single';
  const progress = totalQuestions > 0 ? answeredQuestions / totalQuestions : 0;
  const isFirstQuestion = question.serialNumber === 1;
  const isLastQuestion = question.serialNumber === totalQuestions;
  const isLoading = answerMutation.isPending || returnBackMutation.isPending;

  const handleOptionToggle = (option: string) => {
    if (isSingleChoice) {
      setSelectedAnswers([option]);
    } else {
      setSelectedAnswers((prev) =>
        prev.includes(option)
          ? prev.filter((a) => a !== option)
          : [...prev, option],
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAnswers.length === 0) return;

    try {
      await answerMutation.mutateAsync({ answers: selectedAnswers });
      // Don't clear selectedAnswers here - let the backend response update it
      onAnswerSubmitted();
    } catch (error) {
      console.error('Failed to submit answer:', error);
    }
  };

  const handleSkip = async () => {
    try {
      await answerMutation.mutateAsync({});
      // Don't clear selectedAnswers - backend will preserve existing answer
      onAnswerSubmitted();
    } catch (error) {
      console.error('Failed to skip question:', error);
    }
  };

  const handlePrevious = async () => {
    if (isFirstQuestion) return;

    try {
      await returnBackMutation.mutateAsync();
      // Don't clear selectedAnswers - backend will return the answer for previous question
      onAnswerSubmitted();
    } catch (error) {
      console.error('Failed to go back:', error);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-xl sm:text-2xl">
            {t('question')} {question.serialNumber} / {totalQuestions}
          </CardTitle>
        </div>
        <CardDescription className="text-base sm:text-lg">
          {question.text}
        </CardDescription>
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>{t('progress')}</span>
            <span>
              {answeredQuestions} / {totalQuestions}
            </span>
          </div>
          <Progress value={progress * 100} className="h-2" />
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswers.includes(option);
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleOptionToggle(option)}
                  disabled={isLoading}
                  className={cn(
                    'w-full text-left p-4 rounded-lg border-2 transition-all min-h-[44px]',
                    'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                    isSelected
                      ? 'border-primary bg-primary/10'
                      : 'border-input bg-background hover:bg-accent',
                    isLoading && 'opacity-50 cursor-not-allowed',
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center',
                        isSelected
                          ? 'border-primary bg-primary'
                          : 'border-muted-foreground',
                      )}
                    >
                      {isSelected && (
                        <CheckCircle2 className="h-3 w-3 text-primary-foreground" />
                      )}
                    </div>
                    <span className="text-sm sm:text-base">{option}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-3">
            <Button
              type="submit"
              disabled={selectedAnswers.length === 0 || isLoading}
              className="w-full min-h-[44px]"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {t('submitting')}
                </>
              ) : (
                t('submitAnswer')
              )}
            </Button>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={isFirstQuestion || isLoading}
                className="flex-1"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                {t('previous')}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleSkip}
                disabled={isLastQuestion || isLoading}
                className="flex-1"
              >
                <SkipForward className="h-4 w-4 mr-2" />
                {t('skip')}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
