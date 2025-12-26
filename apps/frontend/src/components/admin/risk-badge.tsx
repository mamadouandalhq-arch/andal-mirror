'use client';

import { Badge } from '@/components/ui/badge';
import { RiskLevel } from '@/hooks/use-admin-users';
import { cn } from '@/lib/utils';

interface RiskBadgeProps {
  level: RiskLevel;
  className?: string;
}

export function RiskBadge({ level, className }: RiskBadgeProps) {
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

  return (
    <Badge
      variant="outline"
      className={cn(getBadgeStyles(), className)}
    >
      {getLabel()}
    </Badge>
  );
}

