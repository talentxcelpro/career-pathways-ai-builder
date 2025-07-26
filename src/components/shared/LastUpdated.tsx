import React from 'react';
import { Clock, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';

interface LastUpdatedProps {
  timestamp?: Date;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  showRefreshButton?: boolean;
}

export function LastUpdated({ 
  timestamp, 
  onRefresh, 
  isRefreshing = false,
  showRefreshButton = true 
}: LastUpdatedProps) {
  if (!timestamp && !showRefreshButton) return null;

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      {timestamp && (
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>Updated {formatDistanceToNow(timestamp, { addSuffix: true })}</span>
        </div>
      )}
      
      {showRefreshButton && onRefresh && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="h-6 px-2"
        >
          <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      )}
    </div>
  );
}