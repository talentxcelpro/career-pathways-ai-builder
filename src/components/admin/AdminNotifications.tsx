
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, Eye, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

interface Notification {
  id: string;
  type: 'employer_request' | 'content_report' | 'job_approval' | 'user_issue';
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  timestamp: Date;
  isRead: boolean;
  actionUrl?: string;
}

export const AdminNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'employer_request',
      title: 'New Employer Request',
      message: 'TechCorp has requested employer access',
      priority: 'high',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      isRead: false,
      actionUrl: '/admin/employer-requests'
    },
    {
      id: '2',
      type: 'content_report',
      title: 'Content Reported',
      message: 'A post has been reported for inappropriate content',
      priority: 'medium',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      isRead: false,
      actionUrl: '/admin/network'
    },
    {
      id: '3',
      type: 'job_approval',
      title: 'Job Pending Approval',
      message: '5 jobs are waiting for approval',
      priority: 'medium',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
      isRead: true,
      actionUrl: '/admin/jobs'
    }
  ]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'employer_request': return <AlertTriangle className="h-4 w-4" />;
      case 'content_report': return <AlertTriangle className="h-4 w-4" />;
      case 'job_approval': return <Clock className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <CheckCircle className="h-4 w-4 mr-1" />
              Mark All Read
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-3 rounded-lg border ${
                !notification.isRead ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-1">
                    {getTypeIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{notification.title}</h4>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getPriorityColor(notification.priority)}`}
                      >
                        {notification.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                    <p className="text-xs text-gray-500">
                      {notification.timestamp.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!notification.isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAsRead(notification.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  {notification.actionUrl && (
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
