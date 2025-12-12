'use client';

import { useTranslations } from 'next-intl';

export default function AdminPage() {
  const t = useTranslations('admin');

  return (
    <main className="min-h-full bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
          {t('title')}
        </h1>
        <p className="mt-2 text-base sm:text-lg text-muted-foreground">
          {t('description')}
        </p>
      </div>
    </main>
  );
}
