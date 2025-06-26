
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Calendar, Clock, MapPin, Users, Video, Share2, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [rsvpStatus, setRsvpStatus] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      if (!id) throw new Error('Event ID is required');

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  const { data: attendees } = useQuery({
    queryKey: ['event-attendees', id],
    queryFn: async () => {
      if (!id) return [];

      // This would typically fetch from event_attendees table
      // For now, returning mock data
      return [
        { id: '1', name: 'John Doe', title: 'Software Engineer', avatar: null },
        { id: '2', name: 'Jane Smith', title: 'Product Manager', avatar: null },
        { id: '3', name: 'Mike Johnson', title: 'Designer', avatar: null },
      ];
    },
    enabled: !!id
  });

  const rsvpMutation = useMutation({
    mutationFn: async ({ eventId, status }: { eventId: string; status: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // This would typically insert into event_attendees table
      // For now, just updating local state
      setRsvpStatus(status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-attendees', id] });
      toast.success('RSVP updated successfully!');
    },
    onError: () => {
      toast.error('Failed to update RSVP');
    }
  });

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  const handleRSVP = (status: string) => {
    if (!id) return;
    rsvpMutation.mutate({ eventId: id, status });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-32 mb-6"></div>
            <div className="h-64 bg-gray-300 rounded mb-6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link to="/network/events" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Link>
          <Card>
            <CardContent className="p-12 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Event not found</h3>
              <p className="text-gray-600">This event may have been cancelled or removed.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const eventDateTime = formatDateTime(event.start_time);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/network/events" className="inline-flex items-center text-blue-600 hover:text-blue-700">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Link>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share Event
          </Button>
        </div>

        {/* Event Header */}
        <Card className="mb-6">
          <CardContent className="p-8">
            <div className="space-y-6">
              {/* Event Type Badge */}
              {event.event_type && (
                <Badge variant="secondary" className="text-sm">
                  {event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1).replace('_', ' ')}
                </Badge>
              )}

              {/* Event Title */}
              <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>

              {/* Event Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-5 w-5 mr-3" />
                    <div>
                      <p className="font-medium">{eventDateTime.date}</p>
                    </div>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <Clock className="h-5 w-5 mr-3" />
                    <div>
                      <p className="font-medium">{eventDateTime.time}</p>
                      {event.end_time && (
                        <p className="text-sm">
                          Ends at {formatDateTime(event.end_time).time}
                        </p>
                      )}
                    </div>
                  </div>

                  {event.location && !event.is_virtual ? (
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-5 w-5 mr-3" />
                      <p>{event.location}</p>
                    </div>
                  ) : event.is_virtual ? (
                    <div className="flex items-center text-gray-600">
                      <Video className="h-5 w-5 mr-3" />
                      <p>Virtual Event</p>
                    </div>
                  ) : null}

                  <div className="flex items-center text-gray-600">
                    <Users className="h-5 w-5 mr-3" />
                    <p>
                      {event.current_attendees || 0} attending
                      {event.max_attendees && ` / ${event.max_attendees} max`}
                    </p>
                  </div>
                </div>

                {/* RSVP Actions */}
                <div className="flex flex-col space-y-3">
                  <Button 
                    onClick={() => handleRSVP('going')}
                    disabled={rsvpMutation.isPending}
                    variant={rsvpStatus === 'going' ? 'default' : 'outline'}
                    className="w-full"
                  >
                    {rsvpStatus === 'going' ? 'Going ✓' : 'Going'}
                  </Button>
                  
                  <Button 
                    onClick={() => handleRSVP('interested')}
                    disabled={rsvpMutation.isPending}
                    variant={rsvpStatus === 'interested' ? 'default' : 'outline'}
                    className="w-full"
                  >
                    {rsvpStatus === 'interested' ? 'Interested ✓' : 'Interested'}
                  </Button>
                  
                  <Button 
                    onClick={() => handleRSVP('cant_go')}
                    disabled={rsvpMutation.isPending}
                    variant={rsvpStatus === 'cant_go' ? 'destructive' : 'outline'}
                    className="w-full"
                  >
                    {rsvpStatus === 'cant_go' ? "Can't Go ✓" : "Can't Go"}
                  </Button>
                </div>
              </div>

              {/* Event Description */}
              {event.description && (
                <div className="border-t pt-6">
                  <h3 className="font-semibold text-gray-900 mb-3">About this event</h3>
                  <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                    {event.description}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Attendees */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Attendees ({attendees?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {attendees && attendees.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {attendees.map((attendee: any) => (
                  <div key={attendee.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <Avatar>
                      <AvatarImage src={attendee.avatar} />
                      <AvatarFallback>
                        {attendee.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{attendee.name}</p>
                      <p className="text-sm text-gray-500 truncate">{attendee.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No attendees yet. Be the first to RSVP!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Discussion */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageCircle className="h-5 w-5 mr-2" />
              Event Discussion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Join the conversation about this event.</p>
              <Button className="mt-4">Start Discussion</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EventDetail;
