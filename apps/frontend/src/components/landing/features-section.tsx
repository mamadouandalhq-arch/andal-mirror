'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Upload,
  MessageSquare,
  Clock,
  Gift,
  UserPlus,
  Shield,
} from 'lucide-react';

const features = [
  {
    key: 'receiptUpload',
    icon: Upload,
  },
  {
    key: 'feedbackRewards',
    icon: MessageSquare,
  },
  {
    key: 'onTimePayments',
    icon: Clock,
  },
  {
    key: 'flexibleRewards',
    icon: Gift,
  },
  {
    key: 'simpleRegistration',
    icon: UserPlus,
  },
  {
    key: 'securePlatform',
    icon: Shield,
  },
] as const;

export function FeaturesSection() {
  const t = useTranslations('home.features');

  return (
    <section id="features" className="w-full py-20 md:py-24 lg:py-32 bg-muted/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            {t('title')}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.key} className="border-2 hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>{t(`${feature.key}.title`)}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {t(`${feature.key}.description`)}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

