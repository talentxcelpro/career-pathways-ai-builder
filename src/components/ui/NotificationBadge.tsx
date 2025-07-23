import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface NotificationBadgeProps {
  count: number;
  className?: string;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  showZero?: boolean;
  maxCount?: number;
  animate?: boolean;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  className,
  variant = 'destructive',
  showZero = false,
  maxCount = 99,
  animate = true
}) => {
  if (count === 0 && !showZero) {
    return null;
  }

  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();

  return (
    <Badge 
      variant={variant}
      className={cn(
        'absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center',
        animate && count > 0 && 'animate-pulse',
        className
      )}
    >
      {displayCount}
    </Badge>
  );
};

// Real-time notification badge that automatically updates
export const RealtimeNotificationBadge: React.FC<Omit<NotificationBadgeProps, 'count'> & {
  module?: string;
}> = ({ module, ...props }) => {
  const { useEnhancedNotifications } = require('@/hooks/useEnhancedNotifications');
  const { stats } = useEnhancedNotifications(module ? { module } : {});
  
  return <NotificationBadge count={stats.unread} {...props} />;
};