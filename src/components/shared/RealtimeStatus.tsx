import React from 'react';
import { useRealtimeContext } from '@/contexts/RealtimeContext';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';

export function RealtimeStatus() {
  const { isConnected, connectionStatus } = useRealtimeContext();

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Wifi className="h-4 w-4 text-green-500" />;
      case 'connecting':
        return <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />;
      case 'disconnected':
      case 'error':
        return <WifiOff className="h-4 w-4 text-red-500" />;
      default:
        return <WifiOff className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Live';
      case 'connecting':
        return 'Connecting';
      case 'disconnected':
        return 'Offline';
      case 'error':
        return 'Error';
      case 'auth_required':
        return 'Auth Required';
      default:
        return 'Unknown';
    }
  };

  const getVariant = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'default';
      case 'connecting':
        return 'secondary';
      case 'auth_required':
        return 'outline';
      case 'disconnected':
      case 'error':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Badge variant={getVariant()} className="flex items-center gap-1 text-xs">
      {getStatusIcon()}
      {getStatusText()}
    </Badge>
  );
}