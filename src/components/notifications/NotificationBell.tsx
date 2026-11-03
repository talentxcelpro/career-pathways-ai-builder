import React from 'react';
import { 
  Bell, 
  CheckCheck, 
  ExternalLink, 
  UserPlus, 
  MessageSquare, 
  Briefcase, 
  Heart, 
  MessageCircle, 
  Building, 
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNotifications, Notification } from '@/contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export const NotificationBell: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const recentNotifications = notifications.slice(0, 6);

  const getNotificationIcon = (notif: Notification) => {
    const type = (notif.event_type || notif.type || '').toLowerCase();
    const module = (notif.module || '').toLowerCase();

    if (type.includes('connection') || module === 'network') {
      return <UserPlus className="h-4 w-4 text-blue-400" />;
    }
    if (type.includes('message')) {
      return <MessageSquare className="h-4 w-4 text-emerald-400" />;
    }
    if (type.includes('job') || type.includes('application') || module === 'jobs' || module === 'employer') {
      return <Briefcase className="h-4 w-4 text-indigo-400" />;
    }
    if (type.includes('like')) {
      return <Heart className="h-4 w-4 text-rose-400 fill-rose-400" />;
    }
    if (type.includes('comment')) {
      return <MessageCircle className="h-4 w-4 text-amber-400" />;
    }
    if (type.includes('company') || module === 'companies') {
      return <Building className="h-4 w-4 text-cyan-400" />;
    }
    if (type.includes('security') || type.includes('alert')) {
      return <ShieldAlert className="h-4 w-4 text-red-400" />;
    }
    return <Sparkles className="h-4 w-4 text-primary" />;
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    const destination = notification.link || notification.action_url || notification.data?.url || '/notifications';
    if (destination) {
      navigate(destination);
    }
  };

  const handleViewAll = () => {
    navigate('/notifications');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative text-slate-300 hover:text-white hover:bg-white/10 transition-colors rounded-xl"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-lg ring-2 ring-slate-900 animate-in zoom-in-50">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-80 sm:w-96 bg-slate-900/95 backdrop-blur-xl border border-slate-800 text-white shadow-2xl p-0 rounded-2xl overflow-hidden z-50"
      >
        {/* Header */}
        <div className="p-3.5 border-b border-slate-800/80 bg-slate-950/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm text-slate-100">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] px-2 py-0">
                {unreadCount} unread
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead()}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1 font-medium"
              title="Mark all as read"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              <span>Mark all read</span>
            </button>
          )}
        </div>
        
        {/* Notifications List */}
        {recentNotifications.length === 0 ? (
          <div className="py-10 px-4 text-center">
            <div className="h-10 w-10 rounded-full bg-slate-800/60 border border-slate-700/50 flex items-center justify-center mx-auto mb-3">
              <Bell className="h-5 w-5 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-300">No notifications yet</p>
            <p className="text-xs text-slate-500 mt-1">Activities, messages, and job updates will appear here.</p>
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
            {recentNotifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-3.5 transition-colors cursor-pointer flex items-start gap-3 hover:bg-slate-800/50 ${
                  !notification.is_read ? 'bg-blue-950/20' : ''
                }`}
              >
                <div className="h-8 w-8 rounded-full bg-slate-800/80 border border-slate-700/60 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                  {getNotificationIcon(notification)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-xs truncate ${!notification.is_read ? 'font-semibold text-white' : 'font-medium text-slate-300'}`}>
                      {notification.title}
                    </p>
                    {!notification.is_read && (
                      <span className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 mt-1 shadow-sm shadow-blue-500/50" />
                    )}
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                    {notification.message}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1.5 font-medium">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Footer */}
        <div className="p-2 border-t border-slate-800/80 bg-slate-950/40">
          <Button 
            variant="ghost" 
            size="sm"
            className="w-full text-xs text-slate-300 hover:text-white hover:bg-white/5 rounded-xl h-8 font-medium justify-center gap-1.5"
            onClick={handleViewAll}
          >
            <span>View all in Notification Center</span>
            <ExternalLink className="h-3 w-3 opacity-60" />
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
