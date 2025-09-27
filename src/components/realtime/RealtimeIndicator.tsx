import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useRealtimeContext } from '@/contexts/RealtimeContext';
import { Wifi, WifiOff, Activity } from 'lucide-react';

export const RealtimeIndicator: React.FC = () => {
  const { isConnected, lastUpdate, connectionStatus } = useRealtimeContext();

  const getStatusColor = () => {
    if (!isConnected) return 'destructive';
    
    const connectedChannels = Object.values(connectionStatus).filter(
      status => status === 'SUBSCRIBED'
    ).length;
    
    if (connectedChannels === 0) return 'destructive';
    if (connectedChannels < Object.keys(connectionStatus).length) return 'secondary';
    return 'default';
  };

  const getStatusText = () => {
    if (!isConnected) return 'Disconnected';
    
    const connectedChannels = Object.values(connectionStatus).filter(
      status => status === 'SUBSCRIBED'
    ).length;
    const totalChannels = Object.keys(connectionStatus).length;
    
    return `${connectedChannels}/${totalChannels} channels`;
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-2">
          <Badge variant={getStatusColor()} className="flex items-center gap-1">
            {isConnected ? (
              <Wifi className="h-3 w-3" />
            ) : (
              <WifiOff className="h-3 w-3" />
            )}
            <span className="text-xs">Real-time</span>
          </Badge>
          
          {lastUpdate && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Activity className="h-3 w-3 text-green-500" />
              <span className="text-xs capitalize">{lastUpdate.table}</span>
            </Badge>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <div className="space-y-2">
          <div className="font-medium">TalentXcel Real-time Status</div>
          <div className="text-sm text-muted-foreground">
            Status: {getStatusText()}
          </div>
          {lastUpdate && (
            <div className="text-sm text-muted-foreground">
              Last update: {lastUpdate.table} ({lastUpdate.payload.eventType})
            </div>
          )}
          {Object.keys(connectionStatus).length > 0 && (
            <div className="space-y-1">
              <div className="text-xs font-medium">Channel Status:</div>
              {Object.entries(connectionStatus).map(([channel, status]) => (
                <div key={channel} className="text-xs flex justify-between">
                  <span>{channel.replace('realtime:', '')}</span>
                  <span className={status === 'SUBSCRIBED' ? 'text-green-500' : 'text-red-500'}>
                    {status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
};