'use client';

import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { RiskLevel } from '@/hooks/use-admin-users';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface RiskBadgeProps {
  level: RiskLevel;
  className?: string;
  showTooltip?: boolean;
}

export function RiskBadge({
  level,
  className,
  showTooltip = true,
}: RiskBadgeProps) {
  const t = useTranslations('admin.users.detail.riskBadgeTooltip');

  const getBadgeStyles = () => {
    switch (level) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200 hover:text-red-900';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200 hover:text-yellow-900';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200 hover:text-green-900';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200 hover:text-gray-900';
    }
  };

  const getLabel = () => {
    switch (level) {
      case 'high':
        return 'High Risk';
      case 'medium':
        return 'Medium Risk';
      case 'low':
        return 'Low Risk';
      default:
        return 'Unknown';
    }
  };

  const getTooltipContent = () => {
    switch (level) {
      case 'high':
        return {
          title: t('high.title'),
          description: t('high.description'),
          method: t('high.method'),
        };
      case 'medium':
        return {
          title: t('medium.title'),
          description: t('medium.description'),
          method: t('medium.method'),
        };
      case 'low':
        return {
          title: t('low.title'),
          description: t('low.description'),
          method: t('low.method'),
        };
      default:
        return {
          title: 'Unknown',
          description: '',
          method: '',
        };
    }
  };

  const badge = (
    <Badge
      variant="outline"
      className={cn(getBadgeStyles(), className)}
    >
      {getLabel()}
    </Badge>
  );

  if (!showTooltip) {
    return badge;
  }

  const tooltipContent = getTooltipContent();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="font-medium mb-1">{tooltipContent.title}</p>
          <p className="text-xs text-muted-foreground">
            {tooltipContent.description}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {tooltipContent.method}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

