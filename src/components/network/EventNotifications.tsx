import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEventNotifications } from "@/hooks/useLiveEvents";
import { formatDistanceToNow } from 'date-fns';
import {
  Bell,
  Clock,
  Video,
  X,
  Calendar,
  Users
} from 'lucide-react';

interface EventNotificationsProps {
  userId: string;
}

export const EventNotifications: React.FC<EventNotificationsProps> = ({ userId }) => {
  const { data: notifications = [] } = useEventNotifications(userId);

  if (notifications.length === 0) {
    return null;
  }

  return (
    <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
          <Bell className="w-5 h-5" />
          Upcoming Events
          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
            {notifications.length} reminder{notifications.length > 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {notifications.map((notification) => {
            const event = notification.event;
            const timeUntilStart = formatDistanceToNow(new Date(event.scheduled_at), { addSuffix: true });
            
            return (
              <div
                key={notification.id}
                className="flex items-center gap-3 p-3 bg-white/50 dark:bg-black/20 rounded-lg border border-orange-200/50"
              >
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/50 rounded-full flex items-center justify-center">
                    <Video className="w-5 h-5 text-orange-600" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm truncate">{event.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      {event.event_type}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Starts {timeUntilStart}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{event.participant_count} joined</span>
                    </div>
                  </div>
                  
                  {event.host_name && (
                    <div className="flex items-center gap-1 mt-1">
                      <Avatar className="w-4 h-4">
                        <AvatarImage src={event.host_avatar} />
                        <AvatarFallback className="text-xs">
                          {event.host_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">
                        by {event.host_name}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline">
                    <Calendar className="w-3 h-3 mr-1" />
                    Remind Me
                  </Button>
                  <Button size="sm">
                    <Video className="w-3 h-3 mr-1" />
                    Join
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};