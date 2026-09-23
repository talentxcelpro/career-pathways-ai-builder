/**
 * FresherBadge Component
 * Displays an emerald badge for freshers/entry-level jobs with tooltip.
 */

import React from 'react';
import { GraduationCap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface FresherBadgeProps {
  className?: string;
  reasons?: string[];
  size?: 'sm' | 'md';
}

export const FresherBadge: React.FC<FresherBadgeProps> = ({
  className,
  reasons = ['No prior experience required', 'College graduates eligible'],
  size = 'md',
}) => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <Badge
            className={cn(
              'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 cursor-help transition-colors',
              size === 'sm' ? 'text-[10px] h-4 px-1.5' : 'text-xs h-5 px-2 font-medium',
              className
            )}
          >
            <GraduationCap className={cn('mr-1', size === 'sm' ? 'h-2.5 w-2.5' : 'h-3 w-3')} />
            Fresher Friendly
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-xs space-y-1 p-2.5">
          <p className="font-semibold text-emerald-600 dark:text-emerald-400">Fresher / Entry-Level Qualified</p>
          <ul className="list-disc pl-4 space-y-0.5 text-muted-foreground">
            {reasons.slice(0, 3).map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default FresherBadge;
