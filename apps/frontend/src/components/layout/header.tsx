'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n';
import { LanguageSwitcher } from '@/components/language-switcher';
import { Button } from '@/components/ui/button';

export function Header() {
  const t = useTranslations('common');
  const authT = useTranslations('auth');

  return (
    <header className="w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold text-primary">
                {t('appName')}
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <div className="hidden sm:flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link href="/login">{authT('login')}</Link>
              </Button>
              <Button asChild>
                <Link href="/register">{authT('register')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
