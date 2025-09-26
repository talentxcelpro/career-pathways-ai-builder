import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Bell, 
  Users, 
  Briefcase, 
  FileText, 
  Zap, 
  Building, 
  BookOpen, 
  Target, 
  User,
  MessageSquare,
  Heart,
  MessageCircle,
  Share2,
  Eye,
  Trash2,
  ExternalLink,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AppNotification } from '@/hooks/useNotifications';

interface NotificationItemProps {
  notification: AppNotification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  showActions?: boolean;
}

const MODULE_ICONS = {
  network: Users,
  jobs: Briefcase,
  resume: FileText,
  tools: Zap,
  companies: Building,
  learning: BookOpen,
  career_map: Target,
  employer: User
};

const TYPE_ICONS = {
  connection: Users,
  follow: Users,
  message: MessageSquare,
  like: Heart,
  comment: MessageCircle,
  share: Share2,
  view: Eye,
  job_match: Briefcase,
  interview: Clock,
  application: FileText,
  resume_score: FileText,
  ats_score: FileText,
  skill_test: Zap,
  assessment: Zap,
  company_view: Building,
  recruiter_interest: User,
  course_complete: BookOpen,
  certificate: BookOpen,
  goal_update: Target,
  milestone: Target,
  applicant: User,
  hire: User
};

const MODULE_COLORS = {
  network: 'bg-blue-100 text-blue-800',
  jobs: 'bg-green-100 text-green-800',
  resume: 'bg-purple-100 text-purple-800',
  tools: 'bg-orange-100 text-orange-800',
  companies: 'bg-gray-100 text-gray-800',
  learning: 'bg-indigo-100 text-indigo-800',
  career_map: 'bg-pink-100 text-pink-800',
  employer: 'bg-red-100 text-red-800'
};

const PRIORITY_COLORS = {
  high: 'border-l-red-500 bg-red-50',
  medium: 'border-l-yellow-500 bg-yellow-50',
  low: 'border-l-green-500 bg-green-50'
};

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
  showActions = true
}) => {
  const ModuleIcon = MODULE_ICONS[notification.module] || Bell;
  const TypeIcon = TYPE_ICONS[notification.type as keyof typeof TYPE_ICONS] || Bell;
  
  const timeAgo = (dateString: string) => {
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

  const handleNotificationClick = () => {
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <Card 
      className={`
        ${!notification.is_read ? 'ring-2 ring-blue-200' : ''}
        ${PRIORITY_COLORS[notification.priority]} 
        border-l-4 hover:shadow-md transition-all duration-200
      `}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={`
            p-2 rounded-full flex-shrink-0
            ${notification.module === 'network' ? 'bg-blue-100' : ''}
            ${notification.module === 'jobs' ? 'bg-green-100' : ''}
            ${notification.module === 'resume' ? 'bg-purple-100' : ''}
            ${notification.module === 'tools' ? 'bg-orange-100' : ''}
            ${notification.module === 'companies' ? 'bg-gray-100' : ''}
            ${notification.module === 'learning' ? 'bg-indigo-100' : ''}
            ${notification.module === 'career_map' ? 'bg-pink-100' : ''}
            ${notification.module === 'employer' ? 'bg-red-100' : ''}
          `}>
            <TypeIcon className={`
              h-5 w-5
              ${notification.module === 'network' ? 'text-blue-600' : ''}
              ${notification.module === 'jobs' ? 'text-green-600' : ''}
              ${notification.module === 'resume' ? 'text-purple-600' : ''}
              ${notification.module === 'tools' ? 'text-orange-600' : ''}
              ${notification.module === 'companies' ? 'text-gray-600' : ''}
              ${notification.module === 'learning' ? 'text-indigo-600' : ''}
              ${notification.module === 'career_map' ? 'text-pink-600' : ''}
              ${notification.module === 'employer' ? 'text-red-600' : ''}
            `} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className={`font-semibold ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                  {notification.title}
                </h4>
                {!notification.is_read && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                )}
              </div>
              
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge className={MODULE_COLORS[notification.module]} variant="secondary">
                  {notification.module.replace('_', ' ')}
                </Badge>
                {notification.priority === 'high' && (
                  <Badge variant="destructive" className="text-xs">
                    High Priority
                  </Badge>
                )}
              </div>
            </div>

            {notification.message && (
              <p className={`text-sm mb-3 ${!notification.is_read ? 'text-gray-700' : 'text-gray-600'}`}>
                {notification.message}
              </p>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                <span>{timeAgo(notification.created_at)}</span>
              </div>

              {showActions && (
                <div className="flex items-center gap-1">
                  {notification.link && (
                    <Link to={notification.link}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleNotificationClick}
                        className="h-8 px-2"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </Link>
                  )}
                  
                  {!notification.is_read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onMarkAsRead(notification.id)}
                      className="h-8 px-2"
                    >
                      Mark Read
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(notification.id)}
                    className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
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