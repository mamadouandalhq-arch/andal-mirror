'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n';
import { ArrowRight } from 'lucide-react';

export function HeroSection() {
  const t = useTranslations('home.hero');

  return (
    <section className="relative w-full py-20 md:py-32 lg:py-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            {t('headline')}
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground sm:text-xl md:text-2xl">
            {t('subheadline')}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 ">
            <Button size="lg" asChild className="text-base sm:text-lg group">
              <Link href="/register">
                {t('cta')}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="text-base sm:text-lg"
            >
              <Link href="#how-it-works">{t('learnMore')}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
