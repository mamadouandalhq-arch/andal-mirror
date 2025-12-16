'use client';

import { useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type LandingType = 'tenants' | 'landlords';

const landingRoutes: Record<LandingType, string> = {
  tenants: '/',
  landlords: '/for-landlords',
};

export function LandingSwitcher() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();
  const t = useTranslations('common');

  // Determine current landing type based on pathname
  const isLandlordsPage = pathname?.includes('/for-landlords');
  const currentLanding: LandingType = isLandlordsPage ? 'landlords' : 'tenants';

  function onValueChange(nextLanding: LandingType) {
    const targetPath = landingRoutes[nextLanding];
    startTransition(() => {
      router.push(targetPath);
    });
  }

  return (
    <Select
      value={currentLanding}
      onValueChange={onValueChange}
      disabled={isPending}
    >
      <SelectTrigger
        className={cn(
          'h-9 gap-2 border-border/50 hover:border-border',
          'w-auto px-3',
        )}
      >
        <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent
        onCloseAutoFocus={(e) => {
          // Prevent focus from returning to trigger after closing
          e.preventDefault();
        }}
      >
        <SelectItem value="tenants">{t('forTenants')}</SelectItem>
        <SelectItem value="landlords">{t('forLandlords')}</SelectItem>
      </SelectContent>
    </Select>
  );
}
