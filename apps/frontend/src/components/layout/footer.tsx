'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n';
import { Separator } from '@/components/ui/separator';

export function Footer() {
  const t = useTranslations('common');
  const footerT = useTranslations('footer');

  return (
    <footer className="w-full border-t bg-muted/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('appName')}</h3>
            <p className="text-sm text-muted-foreground">
              {footerT('description')}
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">
              {footerT('product.title')}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/#how-it-works"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {footerT('product.howItWorks')}
                </Link>
              </li>
              <li>
                <Link
                  href="/#features"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {footerT('product.features')}
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">
              {footerT('company.title')}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {footerT('company.about')}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {footerT('company.contact')}
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">{footerT('legal.title')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/privacy"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {footerT('legal.privacy')}
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {footerT('legal.terms')}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <Separator />
        <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {footerT('copyright', {
              year: new Date().getFullYear(),
            })}
          </p>
        </div>
      </div>
    </footer>
  );
}
