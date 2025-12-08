import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default function AboutPage() {
  const t = useTranslations('common');

  return (
    <div className="flex min-h-screen items-center justify-center font-sans">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 sm:items-start">
        <div className="w-full flex justify-between items-center mb-8">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-700 underline"
          >
            ← Back to Home
          </Link>
          <LanguageSwitcher />
        </div>
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">About {t('appName')}</h1>
          <p className="text-lg text-gray-600">
            This is an example page demonstrating i18n routing.
          </p>
        </div>
      </main>
    </div>
  );
}

