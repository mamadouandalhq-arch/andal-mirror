'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Quote } from 'lucide-react';

const testimonials = [
  'testimonial1',
  'testimonial2',
  'testimonial3',
] as const;

export function TestimonialsSection() {
  const t = useTranslations('home.testimonials');

  return (
    <section className="w-full py-20 md:py-24 lg:py-32 bg-muted/50">
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
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonialKey) => (
              <Card key={testimonialKey} className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Quote className="h-5 w-5 text-primary" />
                  </div>
                  <CardDescription className="text-base leading-relaxed">
                    "{t(`${testimonialKey}.text`)}"
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mt-4">
                    <p className="font-semibold text-foreground">
                      {t(`${testimonialKey}.name`)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t(`${testimonialKey}.role`)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

