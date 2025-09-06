import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Clock, Users, Video, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface LiveEventCardProps {
  event: {
    id: string;
    title: string;
    description: string;
    host_name: string;
    host_avatar?: string;
    scheduled_at: string;
    duration_minutes: number;
    participant_count: number;
    max_participants?: number;
    is_live: boolean;
    event_type: 'webinar' | 'workshop' | 'networking' | 'interview';
    tags?: string[];
  };
}

export const LiveEventCard: React.FC<LiveEventCardProps> = ({ event }) => {
  const navigate = useNavigate();
  
  const handleJoinEvent = () => {
    navigate(`/live-event/${event.id}`);
  };

  const eventDate = new Date(event.scheduled_at);
  const isUpcoming = eventDate > new Date();
  const timeLabel = isUpcoming 
    ? `Starts ${formatDistanceToNow(eventDate, { addSuffix: true })}`
    : event.is_live 
    ? 'Live now'
    : 'Ended';

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'webinar': return 'bg-blue-100 text-blue-800';
      case 'workshop': return 'bg-green-100 text-green-800';
      case 'networking': return 'bg-purple-100 text-purple-800';
      case 'interview': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold line-clamp-2 mb-2">
              {event.title}
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{eventDate.toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{event.duration_minutes}m</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{event.participant_count}</span>
                {event.max_participants && (
                  <span>/{event.max_participants}</span>
                )}
              </div>
            </div>
          </div>
          {event.is_live && (
            <Badge variant="destructive" className="animate-pulse">
              <Video className="h-3 w-3 mr-1" />
              LIVE
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {event.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={event.host_avatar} />
              <AvatarFallback>
                {event.host_name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{event.host_name}</p>
              <p className="text-xs text-muted-foreground">Host</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge 
              variant="secondary" 
              className={getEventTypeColor(event.event_type)}
            >
              {event.event_type}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {timeLabel}
            </Badge>
          </div>
        </div>

        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {event.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {event.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{event.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <Button 
            onClick={handleJoinEvent}
            className="flex-1"
            variant={event.is_live ? "default" : "outline"}
          >
            <Video className="h-4 w-4 mr-2" />
            {event.is_live ? 'Join Live' : isUpcoming ? 'Join Event' : 'View Recording'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};