import React, { memo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Wifi, WifiOff, Circle } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";

interface EnhancedPresenceIndicatorProps {
  userId: string;
  showStatus?: boolean;
  showActivity?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

interface UserPresence {
  isOnline: boolean;
  lastSeen?: string;
  activity?: 'typing' | 'viewing' | 'idle';
  activityText?: string;
}

export const EnhancedPresenceIndicator = memo<EnhancedPresenceIndicatorProps>(({
  userId,
  showStatus = true,
  showActivity = false,
  size = 'md'
}) => {
  const [presence, setPresence] = useState<UserPresence>({
    isOnline: false
  });

  const sizeClasses = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  // Subscribe to user presence
  useEffect(() => {
    const channel = supabase
      .channel(`presence-${userId}`)
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const userPresence = presenceState[userId];
        
        if (userPresence && userPresence.length > 0) {
          setPresence({
            isOnline: true,
            lastSeen: new Date().toISOString(),
            activity: 'viewing'
          });
        } else {
          setPresence(prev => ({ ...prev, isOnline: false }));
        }
      })
      .on('presence', { event: 'join' }, ({ key }) => {
        if (key === userId) {
          setPresence({
            isOnline: true,
            lastSeen: new Date().toISOString(),
            activity: 'viewing'
          });
        }
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        if (key === userId) {
          setPresence(prev => ({ ...prev, isOnline: false }));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const getActivityColor = () => {
    if (!presence.isOnline) return 'bg-red-500';
    
    switch (presence.activity) {
      case 'typing':
        return 'bg-blue-500';
      case 'viewing':
        return 'bg-yellow-500';
      case 'idle':
        return 'bg-orange-500';
      default:
        return 'bg-green-500';
    }
  };

  const getActivityText = () => {
    if (!presence.isOnline) {
      if (presence.lastSeen) {
        const lastSeenDate = new Date(presence.lastSeen);
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - lastSeenDate.getTime()) / 60000);
        
        if (diffInMinutes < 5) return 'Just left';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        return 'Offline';
      }
      return 'Offline';
    }

    if (presence.activityText) return presence.activityText;

    switch (presence.activity) {
      case 'typing':
        return 'Typing...';
      case 'viewing':
        return 'Viewing';
      case 'idle':
        return 'Away';
      default:
        return 'Online';
    }
  };

  const getStatusIcon = () => {
    if (presence.isOnline) {
      return <Wifi className={`${sizeClasses[size]} text-green-500`} />;
    }
    return <WifiOff className={`${sizeClasses[size]} text-red-500`} />;
  };

  return (
    <div className="flex items-center gap-2">
      {/* Presence Dot with Animation */}
      <div className="relative flex items-center">
        <motion.div
          animate={{
            scale: presence.isOnline ? [1, 1.2, 1] : 1,
          }}
          transition={{
            repeat: presence.isOnline ? Infinity : 0,
            duration: 2,
            ease: "easeInOut"
          }}
          className={`rounded-full ${sizeClasses[size]} ${getActivityColor()}`}
        />
        
        {/* Activity pulse for active users */}
        {presence.isOnline && presence.activity === 'typing' && (
          <motion.div
            className={`absolute rounded-full ${sizeClasses[size]} ${getActivityColor()} opacity-75`}
            animate={{
              scale: [1, 1.8, 1],
              opacity: [0.75, 0, 0.75]
            }}
            transition={{
              repeat: Infinity,
              duration: 1.5
            }}
          />
        )}
      </div>

      {/* Status Text */}
      {showStatus && (
        <span className={`${textSizeClasses[size]} text-muted-foreground`}>
          {getActivityText()}
        </span>
      )}

      {/* Activity Details */}
      {showActivity && presence.activity && presence.isOnline && (
        <div className="flex items-center gap-1">
          {size !== 'sm' && getStatusIcon()}
          <span className={`${textSizeClasses[size]} text-muted-foreground italic`}>
            {presence.activityText || 'Active'}
          </span>
        </div>
      )}
    </div>
  );
});

EnhancedPresenceIndicator.displayName = 'EnhancedPresenceIndicator';