import React, { useEffect, useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface OnlineStatusProps {
  userId: string;
  className?: string;
  showText?: boolean;
}

interface UserPresence {
  is_online: boolean;
  status: 'online' | 'away' | 'busy' | 'offline';
  last_seen: string;
}

export const OnlineStatus: React.FC<OnlineStatusProps> = ({ 
  userId, 
  className, 
  showText = false 
}) => {
  // Fetch user presence status
  const { data: presence } = useQuery({
    queryKey: ['user-presence', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_presence')
        .select('is_online, status, last_seen')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as UserPresence || { is_online: false, status: 'offline', last_seen: new Date().toISOString() };
    },
    refetchInterval: 60000, // Refetch every minute
  });

  // Subscribe to real-time presence updates
  useEffect(() => {
    const channel = supabase
      .channel('user-presence')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_presence',
        filter: `user_id=eq.${userId}`
      }, () => {
        // Invalidate and refetch presence data
        // Note: In a real implementation, you'd want to use React Query's mutation
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const getStatusColor = (status: string, isOnline: boolean) => {
    if (!isOnline) return 'bg-gray-400';
    
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      case 'busy':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string, isOnline: boolean) => {
    if (!isOnline) return 'Offline';
    
    switch (status) {
      case 'online':
        return 'Online';
      case 'away':
        return 'Away';
      case 'busy':
        return 'Busy';
      default:
        return 'Offline';
    }
  };

  const formatLastSeen = (lastSeen: string) => {
    const date = new Date(lastSeen);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (!presence) {
    return null;
  }

  const isOnline = presence.is_online;
  const status = presence.status;

  if (showText) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div 
          className={cn(
            "w-2 h-2 rounded-full", 
            getStatusColor(status, isOnline)
          )} 
        />
        <span className="text-xs text-muted-foreground">
          {isOnline ? getStatusText(status, isOnline) : formatLastSeen(presence.last_seen)}
        </span>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "w-3 h-3 rounded-full border-2 border-background", 
        getStatusColor(status, isOnline),
        className
      )}
      title={isOnline ? getStatusText(status, isOnline) : `Last seen ${formatLastSeen(presence.last_seen)}`}
    />
  );
};