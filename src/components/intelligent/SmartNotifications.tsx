import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { useCrossModuleNotifications } from '@/hooks/useCrossModuleNotifications';
import { useAdvancedFeedAlgorithm } from '@/hooks/useAdvancedFeedAlgorithm';
import { cn } from '@/lib/utils';
import {
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  Briefcase,
  TrendingUp,
  Clock,
  X,
  CheckCircle,
  AlertCircle,
  Star,
  Play
} from 'lucide-react';

interface SmartNotification {
  id: string;
  type: 'engagement' | 'connection' | 'job_match' | 'trending' | 'recommendation';
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
  metadata?: {
    contentId?: string;
    userId?: string;
    relevanceScore?: number;
    module?: string;
  };
}

interface SmartNotificationsProps {
  className?: string;
  maxItems?: number;
}

export const SmartNotifications: React.FC<SmartNotificationsProps> = ({
  className,
  maxItems = 10
}) => {
  const { notifications: crossModuleNotifications, markAsRead } = useCrossModuleNotifications();
  const { personalizedFeed } = useAdvancedFeedAlgorithm('network');
  const [smartNotifications, setSmartNotifications] = useState<SmartNotification[]>([]);

  // Generate smart notifications based on user behavior and content
  useEffect(() => {
    const generateSmartNotifications = () => {
      const notifications: SmartNotification[] = [];

      // Convert cross-module notifications
      crossModuleNotifications.forEach(notification => {
        notifications.push({
          id: notification.id,
          type: notification.type as any,
          title: notification.title,
          message: notification.message,
          priority: notification.priority as any,
          timestamp: notification.created_at,
          isRead: notification.is_read,
          actionUrl: notification.action_url,
          metadata: notification.metadata
        });
      });

      // Generate AI-powered content recommendations
      if (personalizedFeed.length > 0) {
        const topRecommendation = personalizedFeed[0];
        if (topRecommendation.relevanceScore > 0.8) {
          notifications.push({
            id: `rec-${topRecommendation.id}`,
            type: 'recommendation',
            title: '🎯 Perfect Match Found!',
            message: `Content from ${topRecommendation.author.name} matches your interests perfectly`,
            priority: 'high',
            timestamp: new Date().toISOString(),
            isRead: false,
            actionUrl: `/mobile/${topRecommendation.metadata.module}?id=${topRecommendation.id}`,
            metadata: {
              contentId: topRecommendation.id,
              userId: topRecommendation.author.id,
              relevanceScore: topRecommendation.relevanceScore,
              module: topRecommendation.metadata.module
            }
          });
        }
      }

      // Generate trending notifications
      const trendingContent = personalizedFeed.filter(item => 
        item.engagement.likes > 100 || item.engagement.views > 1000
      );

      if (trendingContent.length > 0) {
        const trending = trendingContent[0];
        notifications.push({
          id: `trending-${trending.id}`,
          type: 'trending',
          title: '🔥 Trending Now',
          message: `Popular content in ${trending.metadata.module} you might like`,
          priority: 'medium',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 min ago
          isRead: false,
          actionUrl: `/mobile/${trending.metadata.module}?id=${trending.id}`,
          metadata: {
            contentId: trending.id,
            module: trending.metadata.module
          }
        });
      }

      // Smart timing notifications (peak activity hours)
      const currentHour = new Date().getHours();
      if ([9, 12, 18, 20].includes(currentHour)) {
        notifications.push({
          id: `timing-${Date.now()}`,
          type: 'recommendation',
          title: '⏰ Perfect Timing!',
          message: 'Your network is most active now - perfect time to engage!',
          priority: 'low',
          timestamp: new Date().toISOString(),
          isRead: false,
          actionUrl: '/network'
        });
      }

      // Sort by priority and timestamp
      const sortedNotifications = notifications
        .sort((a, b) => {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
            return priorityOrder[b.priority] - priorityOrder[a.priority];
          }
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        })
        .slice(0, maxItems);

      setSmartNotifications(sortedNotifications);
    };

    generateSmartNotifications();
    
    // Refresh every 5 minutes
    const interval = setInterval(generateSmartNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [crossModuleNotifications, personalizedFeed, maxItems]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'engagement':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'connection':
        return <UserPlus className="h-4 w-4 text-blue-500" />;
      case 'job_match':
        return <Briefcase className="h-4 w-4 text-green-500" />;
      case 'trending':
        return <TrendingUp className="h-4 w-4 text-orange-500" />;
      case 'recommendation':
        return <Star className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950';
      case 'low':
        return 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950';
      default:
        return 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const handleNotificationClick = (notification: SmartNotification) => {
    // Mark as read
    if (!notification.isRead) {
      markAsRead(notification.id);
      setSmartNotifications(prev => 
        prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
      );
    }

    // Navigate to action URL
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  const handleDismiss = (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSmartNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  if (smartNotifications.length === 0) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">All caught up!</p>
            <p className="text-xs">We'll notify you of relevant updates</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="p-0">
        <ScrollArea className="h-96">
          <div className="space-y-1 p-2">
            {smartNotifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md group",
                  getPriorityColor(notification.priority),
                  notification.isRead ? 'opacity-70' : ''
                )}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className={cn(
                        "font-medium text-sm leading-tight",
                        notification.isRead ? 'text-muted-foreground' : 'text-foreground'
                      )}>
                        {notification.title}
                      </h4>
                      
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!notification.isRead && (
                          <div className="h-2 w-2 bg-blue-500 rounded-full" />
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => handleDismiss(notification.id, e)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(notification.timestamp)}
                        </span>
                      </div>
                      
                      {notification.metadata?.relevanceScore && (
                        <Badge variant="secondary" className="text-xs">
                          {Math.round(notification.metadata.relevanceScore * 100)}% match
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};