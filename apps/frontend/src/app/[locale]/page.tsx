import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default function Home() {
  const t = useTranslations('home');

  return (
    <div className="flex min-h-screen items-center justify-center font-sans">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 sm:items-start">
        <div className="w-full flex justify-end mb-8">
          <LanguageSwitcher />
        </div>
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-lg text-gray-600">{t('description')}</p>
          <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            {t('getStarted')}
          </button>
        </div>
      </main>
    </div>
  );
}

