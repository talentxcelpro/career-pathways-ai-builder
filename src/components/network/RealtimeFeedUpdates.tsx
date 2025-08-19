import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRealtimeFeed } from '@/hooks/useRealtimeFeed';
import { useAuth } from '@/contexts/AuthContext';
import { Heart, MessageCircle, Share2, Users, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RealtimeFeedUpdatesProps {
  onRefreshFeed: () => void;
  className?: string;
}

export const RealtimeFeedUpdates: React.FC<RealtimeFeedUpdatesProps> = ({
  onRefreshFeed,
  className
}) => {
  const { user } = useAuth();
  const { feedItems, unreadCount, isConnected, markAsSeen } = useRealtimeFeed();
  const [showUpdates, setShowUpdates] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Auto-refresh feed when new items arrive (if enabled)
  useEffect(() => {
    if (autoRefresh && unreadCount > 0) {
      const timer = setTimeout(() => {
        onRefreshFeed();
        const visibleItemIds = feedItems.slice(0, 5).map(item => item.id);
        markAsSeen(visibleItemIds);
      }, 2000); // 2 second delay for smooth UX

      return () => clearTimeout(timer);
    }
  }, [unreadCount, autoRefresh, onRefreshFeed, feedItems, markAsSeen]);

  const getUpdateIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'comment':
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'share':
        return <Share2 className="h-4 w-4 text-green-500" />;
      case 'connection':
        return <Users className="h-4 w-4 text-purple-500" />;
      default:
        return <RefreshCw className="h-4 w-4 text-primary" />;
    }
  };

  const getUpdateText = (item: any) => {
    switch (item.type) {
      case 'post':
        return 'New post shared';
      case 'like':
        return 'Someone liked a post';
      case 'comment':
        return 'New comment added';
      case 'share':
        return 'Post was shared';
      case 'connection':
        return 'New connection made';
      default:
        return 'New activity';
    }
  };

  if (!isConnected) {
    return null; // Hide disconnection status completely
  }

  return (
    <div className={cn("relative", className)}>
      {/* Only show updates when there are unread items */}
      {unreadCount > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex items-center justify-end mb-4"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onRefreshFeed();
              const visibleItemIds = feedItems.slice(0, 5).map(item => item.id);
              markAsSeen(visibleItemIds);
            }}
            className="gap-1"
          >
            <RefreshCw className="h-3 w-3" />
            {unreadCount} new update{unreadCount !== 1 ? 's' : ''}
          </Button>
        </motion.div>
      )}

      {/* Live Updates Notification */}
      <AnimatePresence>
        {unreadCount > 0 && !autoRefresh && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              <span className="text-sm font-medium">
                {unreadCount} new update{unreadCount !== 1 ? 's' : ''} available
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  onRefreshFeed();
                  const visibleItemIds = feedItems.slice(0, 5).map(item => item.id);
                  markAsSeen(visibleItemIds);
                }}
                className="ml-2"
              >
                View
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recent Activity Preview */}
      {showUpdates && feedItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-card border rounded-lg p-4 mb-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium">Recent Activity</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowUpdates(false)}
            >
              Hide
            </Button>
          </div>
          
          <div className="space-y-2">
            {feedItems.slice(0, 3).map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors"
              >
                {getUpdateIcon(item.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground truncate">
                    {getUpdateText(item)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </p>
                </div>
                {!item.seen && (
                  <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Hidden controls - functionality only */}
      <div className="hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowUpdates(!showUpdates)}
          className="h-auto p-1 text-xs"
        >
          {showUpdates ? 'Hide' : 'Show'} Activity
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setAutoRefresh(!autoRefresh)}
          className="h-auto p-1 text-xs"
        >
          Auto-refresh: {autoRefresh ? 'On' : 'Off'}
        </Button>
      </div>
    </div>
  );
};