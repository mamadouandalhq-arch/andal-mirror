'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname } from '@/i18n/routing';
import { Link } from '@/i18n';
import { cn } from '@/lib/utils';
import {
  ClipboardList,
  Receipt,
  Gift,
  CreditCard,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const menuItems = [
  {
    href: '/admin/survey-management',
    icon: ClipboardList,
    translationKey: 'surveyManagement',
  },
  {
    href: '/admin/receipts',
    icon: Receipt,
    translationKey: 'receipts',
  },
  {
    href: '/admin/redemptions',
    icon: CreditCard,
    translationKey: 'redemptions',
  },
  {
    href: '/admin/gift-cards',
    icon: Gift,
    translationKey: 'giftCards',
  },
];

const SIDEBAR_COLLAPSED_KEY = 'admin-sidebar-collapsed';

export function AdminSidebar({
  isMobileOpen,
  onMobileClose,
}: {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}) {
  const t = useTranslations('admin.sidebar');
  const pathname = usePathname();

  // Initialize state from localStorage using lazy initialization
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
      return saved === 'true';
    }
    return false;
  });

  // Save collapsed state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(isCollapsed));
  }, [isCollapsed]);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleLinkClick = () => {
    // Close mobile sidebar when link is clicked
    if (onMobileClose) {
      onMobileClose();
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:sticky top-0 h-screen border-r bg-background z-50 transition-all duration-300',
          'flex flex-col',
          isCollapsed ? 'w-16' : 'w-64',
          // Mobile: slide in/out from left
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleLinkClick}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm',
                  'hover:bg-accent hover:text-accent-foreground',
                  isActive
                    ? 'bg-primary/10 text-primary hover:bg-primary/20'
                    : 'text-muted-foreground',
                  isCollapsed && 'justify-center px-2',
                )}
                title={isCollapsed ? t(item.translationKey) : undefined}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!isCollapsed && (
                  <span className="font-medium whitespace-nowrap">
                    {t(item.translationKey)}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle button - only on desktop */}
        <div className="hidden lg:block p-4 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleCollapse}
            className="w-full justify-center"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </aside>
    </>
  );
}
