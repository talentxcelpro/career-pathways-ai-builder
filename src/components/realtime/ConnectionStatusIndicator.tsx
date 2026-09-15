import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { Wifi, WifiOff, RefreshCw, Signal } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ConnectionStatusIndicator() {
  const { status, latency, isHealthy, forceReconnect } = useConnectionStatus();

  const getStatusConfig = () => {
    switch (status) {
      case 'online':
        return {
          icon: Wifi,
          label: 'Online',
          variant: 'default' as const,
          color: 'text-green-500',
        };
      case 'offline':
        return {
          icon: WifiOff,
          label: 'Offline',
          variant: 'destructive' as const,
          color: 'text-red-500',
        };
      case 'slow':
        return {
          icon: Signal,
          label: 'Slow',
          variant: 'secondary' as const,
          color: 'text-yellow-500',
        };
      case 'reconnecting':
        return {
          icon: RefreshCw,
          label: 'Reconnecting',
          variant: 'secondary' as const,
          color: 'text-blue-500',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  // Only show indicator if there's an issue
  if (status === 'online' && latency < 500) {
    return null;
  }

  return (
    <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-top-2">
      <Badge variant={config.variant} className="gap-2 py-2 px-3">
        <Icon className={cn('w-4 h-4', config.color, status === 'reconnecting' && 'animate-spin')} />
        <span>{config.label}</span>
        {latency > 0 && status === 'slow' && (
          <span className="text-xs opacity-70">{latency}ms</span>
        )}
        {status === 'offline' && (
          <Button
            variant="ghost"
            size="sm"
            className="h-5 px-2"
            onClick={forceReconnect}
          >
            Retry
          </Button>
        )}
      </Badge>
    </div>
  );
}
