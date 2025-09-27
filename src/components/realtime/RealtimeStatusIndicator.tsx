import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useRealtimeContext } from '@/contexts/RealtimeContext';
import { useGlobalRealtimeStatus } from '@/hooks/useEnhancedRealtime';
import { Wifi, WifiOff, Activity } from 'lucide-react';

export function RealtimeStatusIndicator() {
  const { isConnected, connectionStatus } = useRealtimeContext();
  const globalStatus = useGlobalRealtimeStatus();

  const getStatusIcon = () => {
    if (isConnected && globalStatus.connected) {
      return <Activity className="h-3 w-3 animate-pulse" />;
    } else if (isConnected || globalStatus.connected) {
      return <Wifi className="h-3 w-3" />;
    } else {
      return <WifiOff className="h-3 w-3" />;
    }
  };

  const getStatusText = () => {
    if (isConnected && globalStatus.connected) {
      return 'Live';
    } else if (isConnected || globalStatus.connected) {
      return 'Partial';
    } else {
      return 'Offline';
    }
  };

  const getStatusVariant = () => {
    if (isConnected && globalStatus.connected) {
      return 'default';
    } else if (isConnected || globalStatus.connected) {
      return 'secondary';
    } else {
      return 'destructive';
    }
  };

  return (
    <Badge variant={getStatusVariant()} className="flex items-center gap-1 text-xs">
      {getStatusIcon()}
      {getStatusText()}
    </Badge>
  );
}