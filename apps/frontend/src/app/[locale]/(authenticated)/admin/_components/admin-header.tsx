'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n';
import { LanguageSwitcher } from '@/components/language-switcher';
import { UserMenu } from '@/components/user-menu';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

export function AdminHeader({ onMenuClick }: { onMenuClick?: () => void }) {
  const t = useTranslations('common');

  return (
    <header className="w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={onMenuClick}
              aria-label="Toggle menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Link href="/admin" className="flex flex-col items-center">
              <span className="text-xl font-bold text-primary">
                {t('appName')}
              </span>
              <span className="text-sm text-muted-foreground">admin</span>
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
