
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Users, Video } from "lucide-react";

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description?: string;
    event_type?: string;
    start_time: string;
    end_time?: string;
    location?: string;
    is_virtual?: boolean;
    max_attendees?: number;
    current_attendees?: number;
  };
  onRSVP?: (eventId: string, status: string) => void;
  isRSVPing?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onRSVP,
  isRSVPing = false
}) => {
  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Event Header */}
          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg mx-auto flex items-center justify-center">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          
          <div className="text-center">
            <h3 className="font-semibold text-lg">{event.title}</h3>
            {event.event_type && (
              <Badge variant="secondary" className="mt-1">
                {event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1).replace('_', ' ')}
              </Badge>
            )}
          </div>

          {/* Event Details */}
          <div className="space-y-2">
            <div className="flex items-center justify-center text-sm text-gray-600">
              <Clock className="h-4 w-4 mr-2" />
              {formatDateTime(event.start_time)}
            </div>
            
            {event.location && !event.is_virtual && (
              <div className="flex items-center justify-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                {event.location}
              </div>
            )}
            
            {event.is_virtual && (
              <div className="flex items-center justify-center text-sm text-gray-600">
                <Video className="h-4 w-4 mr-2" />
                Virtual Event
              </div>
            )}
            
            <div className="flex items-center justify-center text-sm text-gray-600">
              <Users className="h-4 w-4 mr-2" />
              {event.current_attendees || 0} attending
              {event.max_attendees && ` / ${event.max_attendees} max`}
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <p className="text-gray-600 text-sm text-center line-clamp-2">
              {event.description}
            </p>
          )}

          {/* RSVP Button */}
          <Button 
            className="w-full"
            onClick={() => onRSVP?.(event.id, 'going')}
            disabled={isRSVPing}
          >
            {isRSVPing ? 'RSVPing...' : 'RSVP'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
