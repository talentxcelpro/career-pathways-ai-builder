import React from 'react';
import { useRealtimeContext } from '@/components/realtime/RealtimeProvider';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';

export function RealtimeStatus() {
  const { isConnected, connectionStatus, usePollingFallback } = useRealtimeContext();

  const getStatusIcon = () => {
    if (!isConnected) {
      return <WifiOff className="h-4 w-4 text-red-500" />;
    }
    
    const connectedChannels = Object.values(connectionStatus).filter(
      status => status === 'SUBSCRIBED'
    ).length;
    
    if (connectedChannels > 0) {
      return <Wifi className="h-4 w-4 text-green-500" />;
    } else {
      return <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />;
    }
  };

  const getStatusText = () => {
    if (usePollingFallback) return 'Polling';
    if (!isConnected) return 'Offline';
    
    const connectedChannels = Object.values(connectionStatus).filter(
      status => status === 'SUBSCRIBED'
    ).length;
    const totalChannels = Object.keys(connectionStatus).length;
    
    if (connectedChannels === 0) return 'Connecting';
    if (connectedChannels === totalChannels) return 'Live';
    return `${connectedChannels}/${totalChannels}`;
  };

  const getVariant = () => {
    if (usePollingFallback) return 'outline'; // Different style for polling mode
    if (!isConnected) return 'destructive';
    
    const connectedChannels = Object.values(connectionStatus).filter(
      status => status === 'SUBSCRIBED'
    ).length;
    
    if (connectedChannels === 0) return 'secondary';
    return 'default';
  };

  return (
    <Badge variant={getVariant()} className="flex items-center gap-1 text-xs">
      {getStatusIcon()}
      {getStatusText()}
    </Badge>
  );
}