'use client';

import { useTranslations } from 'next-intl';
import { Accordion, AccordionItem } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Shield, Users, Info, Rocket } from 'lucide-react';

const faqCategoryKeys = [
  {
    key: 'paymentMoney',
    icon: DollarSign,
    questionKeys: ['payThroughAndal', 'whyProof', 'whatProof', 'handleMoney'],
  },
  {
    key: 'privacyData',
    icon: Shield,
    questionKeys: ['landlordSees', 'whatData', 'sellData'],
  },
  {
    key: 'participationFairness',
    icon: Users,
    questionKeys: ['affectLease', 'stopParticipating', 'missMonth'],
  },
  {
    key: 'aboutProgram',
    icon: Info,
    questionKeys: ['finishedProduct', 'issuesConcerns'],
  },
  {
    key: 'gettingStarted',
    icon: Rocket,
    questionKeys: ['costToJoin', 'landlordNotUsing'],
  },
] as const;

export function FAQSection() {
  const t = useTranslations('home.faq');

  return (
    <section id="faq" className="w-full py-20 md:py-24 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            {t('title')}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">{t('subtitle')}</p>
        </div>
        <div className="mx-auto max-w-4xl">
          <div className="space-y-8">
            {faqCategoryKeys.map((category) => {
              const Icon = category.icon;
              const categoryTitle = t(`categories.${category.key}.title`);
              return (
                <Card key={category.key} className="border-2">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-xl sm:text-2xl">
                        {categoryTitle}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Accordion>
                      {category.questionKeys.map((questionKey) => {
                        const question = t(
                          `categories.${category.key}.questions.${questionKey}.question`,
                        );
                        const answer = t(
                          `categories.${category.key}.questions.${questionKey}.answer`,
                        );
                        return (
                          <AccordionItem
                            key={questionKey}
                            question={question}
                            answer={answer}
                          />
                        );
                      })}
                    </Accordion>
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
