import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Calendar, UserPlus, CheckCircle } from "lucide-react";
import { NotificationsList } from "@/components/network/NotificationsList";
import { useEnhancedNotifications } from "@/hooks/useEnhancedNotifications";
import { useNotificationStore } from "@/stores/useNotificationStore";

const Notifications = () => {
  const [filterType, setFilterType] = useState('all');
  const { soundEnabled, toggleSound } = useNotificationStore();

  // Get filter object based on current filter type
  const getFilters = () => {
    switch (filterType) {
      case 'unread':
        return { is_read: false };
      case 'connections':
        return { module: 'network' as const };
      case 'interactions':
        return { module: 'jobs' as const };
      default:
        return {};
    }
  };

  const {
    notifications,
    isLoading,
    error,
    stats,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    isMarkingAsRead,
    isMarkingAllAsRead,
    isDeletingNotification
  } = useEnhancedNotifications(getFilters());

  const filteredNotifications = notifications;

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading notifications</h3>
              <p className="text-gray-600">Please try refreshing the page.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Notifications</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleSound(!soundEnabled)}
            >
              {soundEnabled ? '🔊' : '🔇'} {soundEnabled ? 'Sound On' : 'Sound Off'}
            </Button>
            <Button 
              onClick={() => markAllAsRead()}
              disabled={isMarkingAllAsRead || stats.unread === 0}
              size="sm"
            >
              {isMarkingAllAsRead ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2 animate-spin" />
                  Marking as read...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark all as read
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 mt-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <div className="text-2xl font-bold text-primary">{stats.total}</div>
                </div>
                <Bell className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Unread</p>
                  <div className="text-2xl font-bold text-blue-600">{stats.unread}</div>
                </div>
                <Bell className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">This Week</p>
                  <div className="text-2xl font-bold text-green-600">{stats.thisWeek}</div>
                </div>
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={filterType} onValueChange={setFilterType} className="space-y-4">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="unread">
                  Unread {stats.unread > 0 && <Badge className="ml-2">{stats.unread}</Badge>}
                </TabsTrigger>
                <TabsTrigger value="connections">Network</TabsTrigger>
                <TabsTrigger value="interactions">Jobs</TabsTrigger>
              </TabsList>

              <TabsContent value={filterType} className="space-y-4">
                <NotificationsList 
                  notifications={filteredNotifications}
                  onMarkAsRead={markAsRead}
                  isLoading={isLoading}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Notifications;