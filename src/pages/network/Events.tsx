import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, MapPin, Users, Plus, Search, Video, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AIEventAssistant } from "@/components/network/AIEventAssistant";

const Events = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    event_type: '',
    start_time: '',
    end_time: '',
    location: '',
    is_virtual: true,
    meeting_url: '',
    max_attendees: ''
  });

  const queryClient = useQueryClient();

  const { data: events, isLoading } = useQuery({
    queryKey: ['events', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('events')
        .select('*');

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,event_type.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(20);

      if (error) throw error;
      return data;
    }
  });

  const createEventMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('events')
        .insert({
          ...newEvent,
          created_by: user.id,
          max_attendees: newEvent.max_attendees ? parseInt(newEvent.max_attendees) : null,
          current_attendees: 1
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setShowCreateDialog(false);
      setNewEvent({
        title: '',
        description: '',
        event_type: '',
        start_time: '',
        end_time: '',
        location: '',
        is_virtual: true,
        meeting_url: '',
        max_attendees: ''
      });
      toast.success('Event created successfully!');
    },
    onError: (error) => {
      toast.error('Failed to create event');
      console.error('Event creation error:', error);
    }
  });

  const rsvpMutation = useMutation({
    mutationFn: async ({ eventId, status }: { eventId: string; status: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('event_rsvps')
        .upsert({
          event_id: eventId,
          user_id: user.id,
          status
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('RSVP updated successfully!');
    },
    onError: (error) => {
      toast.error('Failed to update RSVP');
      console.error('RSVP error:', error);
    }
  });

  const handleAIEventDataApply = (aiData: {
    title: string;
    description: string;
    event_type: string;
  }) => {
    setNewEvent(prev => ({
      ...prev,
      title: aiData.title,
      description: aiData.description,
      event_type: aiData.event_type
    }));
    toast.success("AI event template applied!");
  };

  const handleCreateEvent = () => {
    if (!newEvent.title.trim() || !newEvent.start_time) {
      toast.error('Please fill in required fields');
      return;
    }
    createEventMutation.mutate();
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const eventTypes = [
    'webinar', 'ama', 'job_fair', 'networking', 'workshop', 'conference', 'meetup'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Professional Events</h1>
            <p className="text-gray-600 mt-2">Discover networking events, webinars, and professional meetups</p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  Create New Event
                  <Button
                    variant={showAIAssistant ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowAIAssistant(!showAIAssistant)}
                  >
                    <Sparkles className="h-4 w-4 mr-1" />
                    AI Assistant
                  </Button>
                </DialogTitle>
              </DialogHeader>
              
              {/* AI Event Assistant */}
              {showAIAssistant && (
                <AIEventAssistant onEventDataApply={handleAIEventDataApply} />
              )}
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-sm font-medium">Event Title *</label>
                    <Input
                      placeholder="Enter event title"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      placeholder="Describe your event"
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      className="min-h-[120px]"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Event Type</label>
                    <Select 
                      value={newEvent.event_type} 
                      onValueChange={(value) => setNewEvent({ ...newEvent, event_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {eventTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Max Attendees</label>
                    <Input
                      type="number"
                      placeholder="50"
                      value={newEvent.max_attendees}
                      onChange={(e) => setNewEvent({ ...newEvent, max_attendees: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Start Date & Time *</label>
                    <Input
                      type="datetime-local"
                      value={newEvent.start_time}
                      onChange={(e) => setNewEvent({ ...newEvent, start_time: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">End Date & Time</label>
                    <Input
                      type="datetime-local"
                      value={newEvent.end_time}
                      onChange={(e) => setNewEvent({ ...newEvent, end_time: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium">
                      {newEvent.is_virtual ? 'Meeting URL' : 'Location'}
                    </label>
                    <Input
                      placeholder={newEvent.is_virtual ? "https://zoom.us/j/..." : "Conference center address"}
                      value={newEvent.is_virtual ? newEvent.meeting_url : newEvent.location}
                      onChange={(e) => setNewEvent({ 
                        ...newEvent, 
                        [newEvent.is_virtual ? 'meeting_url' : 'location']: e.target.value 
                      })}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={newEvent.is_virtual}
                        onChange={(e) => setNewEvent({ ...newEvent, is_virtual: e.target.checked })}
                      />
                      <span className="text-sm font-medium">Virtual Event</span>
                    </label>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateEvent}
                    disabled={createEventMutation.isPending}
                  >
                    {createEventMutation.isPending ? 'Creating...' : 'Create Event'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search events by title, type, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Events Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="h-6 bg-gray-300 rounded"></div>
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    <div className="h-8 bg-gray-300 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events?.map((event) => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Event Header */}
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
                          {event.title}
                        </h3>
                        {event.event_type && (
                          <Badge variant="secondary" className="ml-2">
                            {event.event_type}
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {event.description}
                      </p>
                    </div>

                    {/* Event Details */}
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        {formatDateTime(event.start_time)}
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        {event.is_virtual ? (
                          <>
                            <Video className="h-4 w-4 mr-2" />
                            Virtual Event
                          </>
                        ) : (
                          <>
                            <MapPin className="h-4 w-4 mr-2" />
                            {event.location || 'Location TBD'}
                          </>
                        )}
                      </div>

                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="h-4 w-4 mr-2" />
                        {event.current_attendees || 0}
                        {event.max_attendees && ` / ${event.max_attendees}`} attendees
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <Button 
                        className="flex-1" 
                        onClick={() => rsvpMutation.mutate({ eventId: event.id, status: 'going' })}
                        disabled={rsvpMutation.isPending}
                      >
                        RSVP
                      </Button>
                      <Button variant="outline" size="sm">
                        Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {events && events.length === 0 && !isLoading && (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming events</h3>
              <p className="text-gray-600">Be the first to create an event for your professional community!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Events;
