'use client';

import { useLogout } from '@/hooks/use-auth';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from '@/components/language-switcher';
import { Button } from '@/components/ui/button';

export function AuthenticatedHeader() {
  const logout = useLogout();
  const t = useTranslations('dashboard');
  const tAuth = useTranslations('auth');

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Button
              variant="destructive"
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
            >
              {logout.isPending ? t('loading') : tAuth('logout')}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
