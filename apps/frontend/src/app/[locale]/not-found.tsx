'use client';

import { useTranslations } from 'next-intl';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const t = useTranslations('notFound');

  const handleGoBack = () => {
    if (typeof window !== 'undefined') {
      window.history.back();
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 items-center justify-center px-4">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-8">
            <h1 className="text-9xl font-bold text-primary/20">404</h1>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              {t('title')}
            </h2>
            <p className="mt-6 text-lg text-muted-foreground">
              {t('description')}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                {t('goHome')}
              </Link>
            </Button>
            <Button size="lg" variant="outline" onClick={handleGoBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('goBack')}
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
