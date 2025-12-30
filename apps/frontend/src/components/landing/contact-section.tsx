'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Phone, Clock } from 'lucide-react';

export function ContactSection() {
  const t = useTranslations('home.contact');

  return (
    <section
      id="contact"
      className="w-full py-20 md:py-24 lg:py-32  bg-muted/50"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            {t('title')}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">{t('subtitle')}</p>
        </div>
        <div className="mx-auto max-w-3xl">
          <Card className="border-2">
            <CardContent className="p-8 md:p-12">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 font-semibold text-lg">{t('email')}</h3>
                  <a
                    href="mailto:mamadou@andalhq.com"
                    className="text-muted-foreground hover:text-primary transition-colors break-all"
                  >
                    mamadou@andalhq.com
                  </a>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 font-semibold text-lg">{t('phone')}</h3>
                  <a
                    href="tel:+14385253145"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    +1 (438) 525-3145
                  </a>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 font-semibold text-lg">
                    {t('responseTime')}
                  </h3>
                  <p className="text-muted-foreground">
                    {t('responseTimeValue')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
