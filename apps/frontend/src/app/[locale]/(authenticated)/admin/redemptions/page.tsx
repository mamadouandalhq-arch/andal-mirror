'use client';

import { useTranslations } from 'next-intl';

export default function RedemptionsPage() {
  const t = useTranslations('admin');

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <div className="flex flex-col gap-2 mb-6">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
          Redemptions
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground">
          Manage user redemptions and rewards
        </p>
      </div>
    </div>
  );
}
