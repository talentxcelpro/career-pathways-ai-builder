import React from 'react';
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface AutoRefreshIndicatorProps {
  isConnected: boolean;
  lastRefresh?: Date;
  className?: string;
}

export function AutoRefreshIndicator({ isConnected, lastRefresh, className }: AutoRefreshIndicatorProps) {
  const formatLastRefresh = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else {
      return date.toLocaleTimeString();
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Badge 
        variant={isConnected ? "default" : "secondary"} 
        className="flex items-center gap-1 text-xs"
      >
        {isConnected ? (
          <Wifi className="h-3 w-3" />
        ) : (
          <WifiOff className="h-3 w-3" />
        )}
        {isConnected ? 'Live' : 'Offline'}
      </Badge>
      
      {lastRefresh && (
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <RefreshCw className="h-3 w-3" />
          {formatLastRefresh(lastRefresh)}
        </span>
      )}
    </div>
  );
}