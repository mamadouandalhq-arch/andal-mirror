'use client';

import { useTranslations, useLocale } from 'next-intl';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Trophy } from 'lucide-react';
import { useRouter } from '@/i18n';
import { formatPoints } from '@/lib/format-utils';

interface FeedbackCompletedProps {
  points: number;
}

export function FeedbackCompleted({ points }: FeedbackCompletedProps) {
  const t = useTranslations('feedback');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();

  return (
    <Card className="w-full max-w-2xl mx-auto border-primary/20">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-primary/10 p-4">
            <Trophy className="h-12 w-12 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl sm:text-3xl">
          {t('completedState.title')}
        </CardTitle>
        <CardDescription className="text-base sm:text-lg">
          {t('completedState.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center p-6 bg-primary/5 rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">
            {t('completedState.earned')}
          </p>
          <p className="text-3xl sm:text-4xl font-bold text-primary">
            {formatPoints(points, locale)} {tCommon('points')}
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <span>{t('completedState.message')}</span>
        </div>

        <Button
          onClick={() => router.push('/dashboard')}
          className="w-full min-h-[44px]"
          size="lg"
        >
          {t('completedState.backToDashboard')}
        </Button>
      </CardContent>
    </Card>
  );
}
