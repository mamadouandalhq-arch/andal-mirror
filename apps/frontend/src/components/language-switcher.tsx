'use client';

import { useParams } from 'next/navigation';
import { useTransition } from 'react';
import { Locale, localeNames } from '@/i18n/config';
import { useRouter, usePathname } from '@/i18n/routing';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LanguageSwitcher() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();
  const params = useParams();

  const currentLocale = (params?.locale as Locale) || 'en';

  function onValueChange(nextLocale: Locale) {
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  }

  return (
    <Select
      value={currentLocale}
      onValueChange={onValueChange}
      disabled={isPending}
    >
      <SelectTrigger
        className={cn(
          'h-9 gap-2 border-border/50 hover:border-border',
          'w-9 px-2 sm:w-[140px] sm:px-3',
        )}
      >
        <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />
        <SelectValue className="hidden sm:inline" />
      </SelectTrigger>
      <SelectContent
        onCloseAutoFocus={(e) => {
          // Prevent focus from returning to trigger after closing
          e.preventDefault();
        }}
      >
        {Object.entries(localeNames).map(([locale, name]) => (
          <SelectItem key={locale} value={locale}>
            <span className="hidden sm:inline">{name}</span>
            <span className="sm:hidden uppercase">{locale}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
