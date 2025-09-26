import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Bell, 
  BellRing, 
  Settings, 
  MessageSquare, 
  Users, 
  Briefcase, 
  Heart,
  CheckCircle2,
  X,
  Filter,
  Search,
  MoreVertical,
  Clock,
  Star
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'connection' | 'message' | 'job' | 'like' | 'comment' | 'system';
  title: string;
  content: string;
  is_read: boolean;
  created_at: string;
  action_url?: string;
  avatar_url?: string;
  sender_name?: string;
}

const NotificationsDebug = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Sample notifications for demo
  const sampleNotifications: Notification[] = [
    {
      id: '1',
      type: 'connection',
      title: 'New Connection Request',
      content: 'Sarah Chen wants to connect with you',
      is_read: false,
      created_at: new Date(Date.now() - 300000).toISOString(),
      sender_name: 'Sarah Chen',
      avatar_url: null
    },
    {
      id: '2',
      type: 'message',
      title: 'New Message',
      content: 'Thanks for the great conversation yesterday!',
      is_read: false,
      created_at: new Date(Date.now() - 1800000).toISOString(),
      sender_name: 'Mike Johnson',
      avatar_url: null
    },
    {
      id: '3',
      type: 'job',
      title: 'Job Match Found',
      content: 'Senior React Developer at TechCorp matches your profile',
      is_read: true,
      created_at: new Date(Date.now() - 3600000).toISOString(),
      sender_name: 'TalentXcel AI',
      avatar_url: null
    },
    {
      id: '4',
      type: 'like',
      title: 'Post Liked',
      content: 'John Smith liked your post about React best practices',
      is_read: true,
      created_at: new Date(Date.now() - 7200000).toISOString(),
      sender_name: 'John Smith',
      avatar_url: null
    },
    {
      id: '5',
      type: 'system',
      title: 'Profile Updated',
      content: 'Your profile completeness is now 95%. Add skills to reach 100%!',
      is_read: false,
      created_at: new Date(Date.now() - 86400000).toISOString(),
      sender_name: 'TalentXcel',
      avatar_url: null
    }
  ];

  useEffect(() => {
    fetchNotifications();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications'
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      
      if (!user?.id) {
        setNotifications(sampleNotifications);
        return;
      }

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      
      // Use sample data if no real notifications
      const notificationsData = data && data.length > 0 ? data : sampleNotifications;
      setNotifications(notificationsData);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications(sampleNotifications);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );

      if (user?.id) {
        await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', notificationId)
          .eq('user_id', user.id);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true }))
      );

      if (user?.id) {
        await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('user_id', user.id)
          .eq('is_read', false);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'connection':
        return <Users className="h-5 w-5 text-blue-600" />;
      case 'message':
        return <MessageSquare className="h-5 w-5 text-green-600" />;
      case 'job':
        return <Briefcase className="h-5 w-5 text-purple-600" />;
      case 'like':
        return <Heart className="h-5 w-5 text-red-600" />;
      case 'system':
        return <Settings className="h-5 w-5 text-gray-600" />;
      default:
        return <Bell className="h-5 w-5 text-blue-600" />;
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesReadFilter = 
      filter === 'all' || 
      (filter === 'read' && notification.is_read) ||
      (filter === 'unread' && !notification.is_read);
    
    const matchesTypeFilter = typeFilter === 'all' || notification.type === typeFilter;
    
    return matchesReadFilter && matchesTypeFilter;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12 fade-in-up">
          <div className="inline-flex items-center justify-center p-2 bg-blue-100 rounded-full mb-6">
            <Bell className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-apple-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Notifications Center
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6 font-apple-medium">
            Stay updated with all your professional activity and connections
          </p>
          {unreadCount > 0 && (
            <Badge className="bg-red-100 text-red-700 border-red-200">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        {/* Actions Bar */}
        <div className="apple-card mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <Button 
                onClick={markAllAsRead}
                className="apple-button"
                disabled={unreadCount === 0}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Mark All Read
              </Button>
              <Button variant="outline" className="apple-button-outline">
                <Settings className="h-4 w-4 mr-2" />
                Notification Settings
              </Button>
            </div>
            
            <div className="flex items-center gap-3">
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value as any)}
                className="apple-input"
              >
                <option value="all">All Notifications</option>
                <option value="unread">Unread Only</option>
                <option value="read">Read Only</option>
              </select>
              
              <select 
                value={typeFilter} 
                onChange={(e) => setTypeFilter(e.target.value)}
                className="apple-input"
              >
                <option value="all">All Types</option>
                <option value="connection">Connections</option>
                <option value="message">Messages</option>
                <option value="job">Jobs</option>
                <option value="like">Likes</option>
                <option value="system">System</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bell className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No notifications</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {filter === 'unread' ? 'All caught up! No unread notifications.' : 'You have no notifications at the moment.'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification, index) => (
              <div 
                key={notification.id}
                className={`apple-card cursor-pointer group transition-all duration-200 ${
                  !notification.is_read ? 'bg-blue-50/50 border-blue-200' : 'hover:bg-gray-50'
                }`}
                onClick={() => markAsRead(notification.id)}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start gap-4">
                  {/* Notification Icon */}
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
                      {notification.avatar_url ? (
                        <img 
                          src={notification.avatar_url} 
                          alt={notification.sender_name}
                          className="w-12 h-12 rounded-2xl object-cover"
                        />
                      ) : (
                        getNotificationIcon(notification.type)
                      )}
                    </div>
                  </div>
                  
                  {/* Notification Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`font-semibold ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </h3>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-gray-600 mb-2 line-clamp-2">
                          {notification.content}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{getTimeAgo(notification.created_at)}</span>
                          </div>
                          {notification.sender_name && (
                            <span>from {notification.sender_name}</span>
                          )}
                          <Badge variant="outline" className="capitalize text-xs">
                            {notification.type}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Action Button */}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Load More */}
        {filteredNotifications.length > 0 && (
          <div className="text-center mt-12">
            <Button variant="outline" className="apple-button-outline">
              Load More Notifications
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsDebug;