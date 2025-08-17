import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Bell, BellOff, TestTube } from 'lucide-react';

export const PushNotificationToggle: React.FC = () => {
  const pushNotifications = usePushNotifications();
  const {
    isSupported,
    isSubscribed,
    isLoading,
    permission
  } = pushNotifications;

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Push Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Push notifications are not supported in this browser.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getPermissionBadge = () => {
    switch (permission) {
      case 'granted':
        return <Badge variant="default">Allowed</Badge>;
      case 'denied':
        return <Badge variant="destructive">Blocked</Badge>;
      default:
        return <Badge variant="secondary">Not Set</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Push Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm">Permission Status:</span>
          {getPermissionBadge()}
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm">Subscription Status:</span>
          <Badge variant={isSubscribed ? "default" : "secondary"}>
            {isSubscribed ? "Subscribed" : "Not Subscribed"}
          </Badge>
        </div>

        <div className="space-y-2">
          {!isSubscribed ? (
            <Button 
              onClick={pushNotifications.subscribeToPush}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Subscribing...' : 'Enable Push Notifications'}
            </Button>
          ) : (
            <div className="space-y-2">
              <Button 
                onClick={pushNotifications.unsubscribeFromPush}
                variant="outline"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Unsubscribing...' : 'Disable Push Notifications'}
              </Button>
              
              <Button 
                onClick={pushNotifications.sendTestNotification}
                variant="secondary"
                size="sm"
                className="w-full"
              >
                <TestTube className="h-4 w-4 mr-2" />
                Send Test Notification
              </Button>
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          Get notified about new job matches, connection requests, and important updates.
        </p>
      </CardContent>
    </Card>
  );
};