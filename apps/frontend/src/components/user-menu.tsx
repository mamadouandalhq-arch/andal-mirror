'use client';

import { useAuth } from '@/contexts/auth-context';
import { useLogout } from '@/hooks/use-auth';
import { useTranslations } from 'next-intl';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, getInitials } from '@/components/ui/avatar';
import { LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function UserMenu() {
  const { user } = useAuth();
  const logout = useLogout();
  const tAuth = useTranslations('auth');

  if (!user) return null;

  const initials = getInitials(user.firstName, user.lastName);
  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar
            src={user.avatarUrl}
            alt={displayName}
            fallback={initials}
            size="md"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56"
        align="end"
        forceMount
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
          aria-label={tAuth('logout')}
          className="text-destructive cursor-pointer focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>
            {logout.isPending ? tAuth('loggingOut') : tAuth('logout')}
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
