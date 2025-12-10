'use client';

import { useTranslations } from 'next-intl';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Upload, Clock, MessageSquare, Gift } from 'lucide-react';

const steps = [
  {
    key: 'step1',
    icon: UserPlus,
  },
  {
    key: 'step2',
    icon: Upload,
  },
  {
    key: 'step3',
    icon: Clock,
  },
  {
    key: 'step4',
    icon: MessageSquare,
  },
  {
    key: 'step5',
    icon: Gift,
  },
] as const;

export function HowItWorksSection() {
  const t = useTranslations('home.howItWorks');

  return (
    <section id="how-it-works" className="w-full py-20 md:py-24 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            {t('title')}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">{t('subtitle')}</p>
        </div>
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.key} className="relative">
                  <Card className="h-full border-2 hover:border-primary/50 transition-colors">
                    <CardHeader className="text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                        <Icon className="h-8 w-8 text-primary" />
                      </div>
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Badge
                          variant="secondary"
                          className="text-sm font-semibold"
                        >
                          Step {index + 1}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl">
                        {t(`${step.key}.title`)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-center text-base">
                        {t(`${step.key}.description`)}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
