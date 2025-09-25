import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  Users, 
  Briefcase, 
  MessageSquare, 
  Heart, 
  Trophy, 
  Clock,
  MoreHorizontal,
  Check,
  X,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

interface EnhancedNotificationCardProps {
  notification: any;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onAction?: (action: string, data: any) => void;
  compact?: boolean;
}

export const EnhancedNotificationCard: React.FC<EnhancedNotificationCardProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
  onAction,
  compact = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const getNotificationIcon = (type: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'job_match': <Briefcase className="h-5 w-5 text-blue-600" />,
      'connection_request': <Users className="h-5 w-5 text-green-600" />,
      'message': <MessageSquare className="h-5 w-5 text-purple-600" />,
      'profile_view': <Heart className="h-5 w-5 text-pink-600" />,
      'achievement': <Trophy className="h-5 w-5 text-yellow-600" />,
      'reminder': <Clock className="h-5 w-5 text-orange-600" />,
      'system': <Bell className="h-5 w-5 text-gray-600" />
    };
    return iconMap[type] || <Bell className="h-5 w-5 text-gray-600" />;
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-gradient-to-r from-red-50 to-transparent';
      case 'medium':
        return 'border-l-blue-500 bg-gradient-to-r from-blue-50 to-transparent';
      case 'low':
        return 'border-l-gray-400 bg-gradient-to-r from-gray-50 to-transparent';
      default:
        return 'border-l-gray-400 bg-gradient-to-r from-gray-50 to-transparent';
    }
  };

  const getTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  const handleQuickAction = (action: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (onAction) {
      onAction(action, notification);
    }
  };

  const renderQuickActions = () => {
    const actions = [];
    
    switch (notification.type) {
      case 'connection_request':
        actions.push(
          <Button
            key="accept"
            size="sm"
            variant="default"
            className="h-7 px-3 text-xs"
            onClick={(e) => handleQuickAction('accept', e)}
          >
            Accept
          </Button>,
          <Button
            key="decline"
            size="sm"
            variant="outline"
            className="h-7 px-3 text-xs"
            onClick={(e) => handleQuickAction('decline', e)}
          >
            Decline
          </Button>
        );
        break;
      case 'job_match':
        actions.push(
          <Button
            key="view"
            size="sm"
            variant="default"
            className="h-7 px-3 text-xs gap-1"
            onClick={(e) => handleQuickAction('view_job', e)}
          >
            View Job
            <ExternalLink className="h-3 w-3" />
          </Button>,
          <Button
            key="save"
            size="sm"
            variant="outline"
            className="h-7 px-3 text-xs"
            onClick={(e) => handleQuickAction('save_job', e)}
          >
            Save
          </Button>
        );
        break;
      case 'profile_completion':
        actions.push(
          <Button
            key="complete"
            size="sm"
            variant="default"
            className="h-7 px-3 text-xs gap-1"
            onClick={(e) => handleQuickAction('complete_profile', e)}
          >
            Complete Now
            <ChevronRight className="h-3 w-3" />
          </Button>
        );
        break;
    }

    return actions;
  };

  const renderRichContent = () => {
    if (notification.type === 'job_match' && notification.data?.job) {
      const job = notification.data.job;
      return (
        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-blue-900">{job.title}</h4>
              <p className="text-sm text-blue-700">{job.company}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-blue-600">
                <span>{job.location}</span>
                <span>{job.salary}</span>
                <Badge variant="secondary" className="text-xs">
                  {job.match_score}% match
                </Badge>
              </div>
            </div>
            {job.logo && (
              <img 
                src={job.logo} 
                alt={job.company}
                className="w-10 h-10 rounded object-cover"
              />
            )}
          </div>
        </div>
      );
    }

    if (notification.type === 'connection_request' && notification.data?.user) {
      const user = notification.data.user;
      return (
        <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-3">
            <img 
              src={user.avatar || '/default-avatar.png'} 
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1">
              <h4 className="font-medium text-green-900">{user.name}</h4>
              <p className="text-sm text-green-700">{user.title}</p>
              <p className="text-xs text-green-600">{user.connections} mutual connections</p>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
        onClick={() => onMarkAsRead(notification.id)}
      >
        <div className="flex-shrink-0">
          {getNotificationIcon(notification.type)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{notification.title}</p>
          <p className="text-xs text-muted-foreground">{getTimeAgo(notification.created_at)}</p>
        </div>
        {!notification.is_read && (
          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group"
    >
      <Card 
        className={`
          border-l-4 cursor-pointer transition-all duration-200 
          ${getPriorityStyle(notification.priority)}
          ${!notification.is_read ? 'ring-2 ring-blue-200 shadow-lg' : 'hover:shadow-md'}
          ${isHovered ? 'scale-[1.02]' : ''}
        `}
        onClick={() => {
          if (!notification.is_read) {
            onMarkAsRead(notification.id);
          }
          setIsExpanded(!isExpanded);
        }}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="flex-shrink-0 mt-1">
              <div className="p-2 rounded-full bg-white shadow-sm border">
                {getNotificationIcon(notification.type)}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-foreground">
                      {notification.title}
                    </h4>
                    {!notification.is_read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2 leading-relaxed">
                    {notification.message}
                  </p>

                  {/* Rich Content */}
                  {renderRichContent()}

                  {/* Quick Actions */}
                  <motion.div 
                    className="flex items-center gap-2 mt-3"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ 
                      opacity: isHovered || isExpanded ? 1 : 0,
                      height: isHovered || isExpanded ? 'auto' : 0
                    }}
                  >
                    {renderQuickActions()}
                  </motion.div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ 
                      opacity: isHovered ? 1 : 0,
                      scale: isHovered ? 1 : 0.8
                    }}
                    className="flex items-center gap-1"
                  >
                    {!notification.is_read && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          onMarkAsRead(notification.id);
                        }}
                        title="Mark as read"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(notification.id);
                      }}
                      title="Delete"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{getTimeAgo(notification.created_at)}</span>
                  <Badge variant="outline" className="text-xs">
                    {notification.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                  {notification.module && (
                    <Badge variant="secondary" className="text-xs">
                      {notification.module}
                    </Badge>
                  )}
                </div>
                
                {notification.priority === 'high' && (
                  <Badge variant="destructive" className="text-xs">
                    High Priority
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};