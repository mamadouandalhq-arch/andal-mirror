'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n';
import { LanguageSwitcher } from '@/components/language-switcher';
import { UserMenu } from '@/components/user-menu';

export function AuthenticatedHeader() {
  const t = useTranslations('common');

  return (
    <header className="w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link
              href="/dashboard"
              className="flex flex-col items-center space-x-2"
            >
              <span className="text-xl font-bold text-primary">
                {t('appName')}
              </span>
              <span className="text-sm text-muted-foreground">dashboard</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
