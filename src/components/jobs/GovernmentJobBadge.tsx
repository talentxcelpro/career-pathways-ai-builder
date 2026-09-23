/**
 * GovernmentJobBadge Component
 * Distinguishes Federal, State, and PSU vacancies with official emblems.
 */

import React from 'react';
import { Shield, Building, Landmark } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface GovernmentJobBadgeProps {
  level?: 'FEDERAL' | 'STATE' | 'REGIONAL' | 'MUNICIPAL' | 'PUBLIC_SECTOR';
  countryCode?: string;
  className?: string;
}

export const GovernmentJobBadge: React.FC<GovernmentJobBadgeProps> = ({
  level = 'FEDERAL',
  countryCode = 'IN',
  className,
}) => {
  const isPsu = level === 'PUBLIC_SECTOR';
  const isState = level === 'STATE';

  const label = isPsu
    ? 'Public Sector / PSU'
    : isState
    ? 'State Government'
    : countryCode === 'US'
    ? 'U.S. Federal Government'
    : countryCode === 'GB'
    ? 'UK Civil Service'
    : 'Central / Govt. of India';

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-medium text-[11px] gap-1 px-2 py-0.5 border shadow-2xs',
        isPsu
          ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30'
          : isState
          ? 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30'
          : 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
        className
      )}
    >
      {isPsu ? (
        <Building className="h-3 w-3" />
      ) : isState ? (
        <Landmark className="h-3 w-3" />
      ) : (
        <Shield className="h-3 w-3" />
      )}
      <span>{label}</span>
    </Badge>
  );
};

export default GovernmentJobBadge;
