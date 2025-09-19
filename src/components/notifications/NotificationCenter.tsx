import React, { useState } from 'react';
import { Bell, Settings, Filter, Search, CheckCheck, Trash, Volume2, VolumeX } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const NotificationItem: React.FC<{
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}> = ({ notification, onMarkAsRead, onDelete }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const getModuleColor = (module: string) => {
    const colors = {
      jobs: 'bg-blue-100 text-blue-800',
      network: 'bg-green-100 text-green-800',
      resume: 'bg-purple-100 text-purple-800',
      tools: 'bg-yellow-100 text-yellow-800',
      companies: 'bg-orange-100 text-orange-800',
      learning: 'bg-pink-100 text-pink-800',
      career_map: 'bg-indigo-100 text-indigo-800',
      employer: 'bg-red-100 text-red-800'
    };
    return colors[module as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <div className="w-2 h-2 bg-red-500 rounded-full"></div>;
      case 'medium':
        return <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>;
      case 'low':
        return <div className="w-2 h-2 bg-green-500 rounded-full"></div>;
      default:
        return <div className="w-2 h-2 bg-gray-500 rounded-full"></div>;
    }
  };

  return (
    <Card 
      className={cn(
        'cursor-pointer transition-all hover:shadow-md',
        !notification.is_read && 'border-l-4 border-l-primary bg-blue-50/30'
      )}
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {getPriorityIcon(notification.priority)}
              <Badge variant="secondary" className={cn('text-xs', getModuleColor(notification.module))}>
                {notification.module}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
              </span>
            </div>
            
            <h4 className={cn(
              'font-medium mb-1 truncate',
              !notification.is_read && 'font-semibold'
            )}>
              {notification.title}
            </h4>
            
            <p className="text-sm text-muted-foreground line-clamp-2">
              {notification.message}
            </p>
          </div>

          <div className="flex items-center gap-1">
            {!notification.is_read && (
              <div className="w-2 h-2 bg-primary rounded-full"></div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(notification.id);
              }}
              className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
            >
              <Trash className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const NotificationCenter: React.FC = () => {
  const [filters, setFilters] = useState({
    module: '',
    is_read: undefined as boolean | undefined,
    priority: '',
    search: ''
  });

  const {
    notifications,
    isLoading,
    stats,
    soundEnabled,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    toggleSound,
    isMarkingAsRead,
    isMarkingAllAsRead,
    isDeletingNotification
  } = useNotifications(filters);

  const filteredNotifications = notifications;
  const unreadNotifications = notifications.filter(n => !n.is_read);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="h-8 w-8 text-primary" />
            {stats.unread > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {stats.unread > 99 ? '99+' : stats.unread}
              </Badge>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold">Notifications</h2>
            <p className="text-muted-foreground">
              {stats.unread} unread • {stats.total} total
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleSound(!soundEnabled)}
            className="gap-2"
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            Sound {soundEnabled ? 'On' : 'Off'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllAsRead(undefined)}
            disabled={isMarkingAllAsRead || stats.unread === 0}
            className="gap-2"
          >
            <CheckCheck className="h-4 w-4" />
            Mark All Read
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Unread</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.unread}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisWeek}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.byPriority.high || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search" className="text-sm font-medium">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search notifications..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="module" className="text-sm font-medium">Module</Label>
              <Select
                value={filters.module}
                onValueChange={(value) => setFilters({ ...filters, module: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All modules" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All modules</SelectItem>
                  <SelectItem value="jobs">Jobs</SelectItem>
                  <SelectItem value="network">Network</SelectItem>
                  <SelectItem value="resume">Resume</SelectItem>
                  <SelectItem value="tools">Tools</SelectItem>
                  <SelectItem value="companies">Companies</SelectItem>
                  <SelectItem value="learning">Learning</SelectItem>
                  <SelectItem value="career_map">Career Map</SelectItem>
                  <SelectItem value="employer">Employer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority" className="text-sm font-medium">Priority</Label>
              <Select
                value={filters.priority}
                onValueChange={(value) => setFilters({ ...filters, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All priorities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status" className="text-sm font-medium">Status</Label>
              <Select
                value={filters.is_read === undefined ? '' : filters.is_read.toString()}
                onValueChange={(value) => setFilters({ 
                  ...filters, 
                  is_read: value === '' ? undefined : value === 'true' 
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All notifications" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All notifications</SelectItem>
                  <SelectItem value="false">Unread only</SelectItem>
                  <SelectItem value="true">Read only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all">
            All Notifications ({stats.total})
          </TabsTrigger>
          <TabsTrigger value="unread">
            Unread ({stats.unread})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No notifications</h3>
                <p className="text-muted-foreground">
                  {filters.search || filters.module || filters.priority ? 
                    'No notifications match your current filters.' :
                    'You\'re all caught up! New notifications will appear here.'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3 group">
              {filteredNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onDelete={deleteNotification}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="unread" className="space-y-4">
          {unreadNotifications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCheck className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">All caught up!</h3>
                <p className="text-muted-foreground">
                  You have no unread notifications.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3 group">
              {unreadNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onDelete={deleteNotification}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};