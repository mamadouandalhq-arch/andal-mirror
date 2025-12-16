'use client';

import { useTranslations, useMessages } from 'next-intl';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  TrendingDown,
  Star,
  AlertTriangle,
  DollarSign,
  Calendar,
  Home,
  MessageSquare,
  BarChart3,
  Heart,
} from 'lucide-react';

const scenarios = [
  {
    key: 'keepTenants',
    icon: Users,
    features: [
      { key: 'monthlyEngagement', icon: DollarSign },
      { key: 'churnPrediction', icon: AlertTriangle },
      { key: 'interventionTools', icon: BarChart3 },
    ],
  },
  {
    key: 'smoothExits',
    icon: TrendingDown,
    features: [
      { key: 'earlyNotice', icon: Calendar },
      { key: 'smoothExit', icon: Home },
      { key: 'concurrentPlacement', icon: Users },
    ],
  },
  {
    key: 'reputationManagement',
    icon: Star,
    features: [
      { key: 'happyTenants', icon: Heart },
      { key: 'privateFeedback', icon: MessageSquare },
    ],
  },
] as const;

export function LandlordsSection() {
  const t = useTranslations('landlords');
  const messages = useMessages();

  return (
    <section id="landlords" className="w-full py-20 md:py-24 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <Badge variant="outline" className="mb-4">
            {t('comingSoon')}
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-6xl">
            {t('title')}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">{t('subtitle')}</p>
        </div>

        <div className="mx-auto max-w-7xl space-y-12">
          {scenarios.map((scenario) => {
            const ScenarioIcon = scenario.icon;
            return (
              <Card
                key={scenario.key}
                className="border-2 hover:border-primary/50 transition-colors"
              >
                <CardHeader>
                  <div className="flex flex-col sm:flex-row items-start gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                      <ScenarioIcon className="h-8 w-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-2">
                        {t(`${scenario.key}.title`)}
                      </CardTitle>
                      <CardDescription className="text-base">
                        {t(`${scenario.key}.description`)}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {scenario.features.map((feature) => {
                      const FeatureIcon = feature.icon;
                      return (
                        <div
                          key={feature.key}
                          className="flex items-start gap-3 p-4 rounded-lg bg-muted/50"
                        >
                          <FeatureIcon className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                          <div>
                            <p className="font-medium text-sm mb-1">
                              {t(
                                `${scenario.key}.features.${feature.key}.title`,
                              )}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {t(
                                `${scenario.key}.features.${feature.key}.description`,
                              )}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-6 p-6 rounded-lg bg-primary/10 border-2 border-primary/20">
                    <p className="text-lg font-semibold text-foreground mb-2">
                      {t(`${scenario.key}.result.title`)}
                    </p>
                    <p className="text-base text-muted-foreground mb-4">
                      {t(`${scenario.key}.result.description`)}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {(
                        (messages.landlords?.[scenario.key]?.result
                          ?.savings as string[]) || []
                      ).map((saving, index) => (
                        <span
                          key={index}
                          className="text-lg font-bold text-primary"
                        >
                          {saving}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
