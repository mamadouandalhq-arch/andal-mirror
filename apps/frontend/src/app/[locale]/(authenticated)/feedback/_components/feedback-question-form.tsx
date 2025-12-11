'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAnswerQuestion } from '@/hooks/use-feedback';
import { FeedbackQuestionDto } from '@shared/feedback';
import { Loader2, CheckCircle2 } from 'lucide-react';
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
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);

  const isSingleChoice = question.type === 'single';
  const progress = totalQuestions > 0 ? answeredQuestions / totalQuestions : 0;

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
      setSelectedAnswers([]);
      onAnswerSubmitted();
    } catch (error) {
      console.error('Failed to submit answer:', error);
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
                  disabled={answerMutation.isPending}
                  className={cn(
                    'w-full text-left p-4 rounded-lg border-2 transition-all min-h-[44px]',
                    'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                    isSelected
                      ? 'border-primary bg-primary/10'
                      : 'border-input bg-background hover:bg-accent',
                    answerMutation.isPending && 'opacity-50 cursor-not-allowed',
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center',
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

          <Button
            type="submit"
            disabled={selectedAnswers.length === 0 || answerMutation.isPending}
            className="w-full min-h-[44px]"
            size="lg"
          >
            {answerMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {t('submitting')}
              </>
            ) : (
              t('submitAnswer')
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

