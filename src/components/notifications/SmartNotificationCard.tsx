import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Clock,
  ExternalLink,
  Trash2,
  Star,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Eye,
  MessageSquare
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface SmartNotificationCardProps {
  notification: any;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  showActions?: boolean;
}

const PRIORITY_CONFIG = {
  high: {
    icon: AlertTriangle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-l-red-500',
    badge: 'destructive' as const
  },
  medium: {
    icon: Star,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-l-yellow-500',
    badge: 'default' as const
  },
  low: {
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-l-green-500',
    badge: 'secondary' as const
  }
};

const MODULE_CONFIG = {
  network: { color: 'text-blue-600', bgColor: 'bg-blue-100' },
  jobs: { color: 'text-green-600', bgColor: 'bg-green-100' },
  companies: { color: 'text-purple-600', bgColor: 'bg-purple-100' },
  resume: { color: 'text-orange-600', bgColor: 'bg-orange-100' },
  tools: { color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  learning: { color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
  colleges: { color: 'text-pink-600', bgColor: 'bg-pink-100' },
  career_feed: { color: 'text-teal-600', bgColor: 'bg-teal-100' },
  discover: { color: 'text-rose-600', bgColor: 'bg-rose-100' },
  system: { color: 'text-gray-600', bgColor: 'bg-gray-100' },
  employer: { color: 'text-red-600', bgColor: 'bg-red-100' }
};

export const SmartNotificationCard: React.FC<SmartNotificationCardProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
  showActions = true
}) => {
  const priorityConfig = PRIORITY_CONFIG[notification.priority] || PRIORITY_CONFIG.medium;
  const moduleConfig = MODULE_CONFIG[notification.module] || MODULE_CONFIG.system;
  const PriorityIcon = priorityConfig.icon;

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return diffInDays === 1 ? '1 day ago' : `${diffInDays} days ago`;
    }
  };

  const isUnread = !notification.is_read;
  const isHighPriority = notification.priority === 'high';

  return (
    <Card 
      className={`
        transition-all duration-300 hover:shadow-lg group
        ${isUnread ? 'ring-2 ring-primary/20 shadow-md' : 'hover:shadow-md'}
        ${priorityConfig.borderColor} border-l-4
        ${isHighPriority ? 'animate-pulse' : ''}
      `}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Avatar/Icon */}
          <div className="flex-shrink-0">
            <div className={`
              relative p-3 rounded-full transition-colors
              ${moduleConfig.bgColor}
            `}>
              <PriorityIcon className={`h-5 w-5 ${priorityConfig.color}`} />
              {isUnread && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse" />
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className={`
                  font-semibold line-clamp-2 transition-colors
                  ${isUnread ? 'text-foreground' : 'text-muted-foreground'}
                `}>
                  {notification.title}
                </h4>
                {isUnread && (
                  <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                    New
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-1 flex-shrink-0">
                {isHighPriority && (
                  <Badge variant={priorityConfig.badge} className="text-xs animate-pulse">
                    High Priority
                  </Badge>
                )}
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${moduleConfig.color} bg-background`}
                >
                  {notification.module.replace('_', ' ')}
                </Badge>
              </div>
            </div>

            {/* Message */}
            {notification.message && (
              <p className={`
                text-sm line-clamp-3 transition-colors
                ${isUnread ? 'text-foreground/80' : 'text-muted-foreground'}
              `}>
                {notification.message}
              </p>
            )}

            {/* AI Insights */}
            {notification.ai_insight && (
              <div className="p-3 rounded-lg bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
                <div className="flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-medium text-primary">
                    🧠 AI Insight: {notification.ai_insight}
                  </p>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{formatTimeAgo(notification.created_at)}</span>
                {notification.expires_at && (
                  <>
                    <span>•</span>
                    <span className="text-orange-600">Expires soon</span>
                  </>
                )}
              </div>

              {/* Actions */}
              {showActions && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {notification.link && (
                    <Link to={notification.link}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-primary hover:bg-primary/10"
                        onClick={() => !isUnread || onMarkAsRead(notification.id)}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </Link>
                  )}
                  
                  {isUnread && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onMarkAsRead(notification.id)}
                      className="h-8 px-2 text-green-600 hover:bg-green-100"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Read
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(notification.id)}
                    className="h-8 px-2 text-red-600 hover:bg-red-100"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};