import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from '@/components/language-switcher';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n';
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
          <Button variant="default">
            <Link href="/login">{t('getStarted')}</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
