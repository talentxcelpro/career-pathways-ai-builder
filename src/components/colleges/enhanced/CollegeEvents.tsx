import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, ExternalLink, CalendarPlus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CollegeEventsProps {
  collegeId?: string;
  showAll?: boolean;
  limit?: number;
}

export const CollegeEvents: React.FC<CollegeEventsProps> = ({
  collegeId,
  showAll = false,
  limit = 5
}) => {
  const { data: events, isLoading } = useQuery({
    queryKey: ['college-events', collegeId, showAll],
    queryFn: async () => {
      let query = supabase
        .from('college_events')
        .select(`
          *,
          colleges(name, logo_url)
        `)
        .eq('is_active', true)
        .gte('start_date', new Date().toISOString())
        .order('start_date', { ascending: true });

      if (collegeId && !showAll) {
        query = query.eq('college_id', collegeId);
      }

      if (limit && !showAll) {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  const handleRSVP = async (eventId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please login to RSVP for events');
        return;
      }

      const { error } = await supabase
        .from('event_registrations')
        .insert({
          event_id: eventId,
          user_id: user.id,
          registration_status: 'registered'
        });

      if (error) throw error;
      toast.success('RSVP confirmed! Check your email for details.');
    } catch (error: any) {
      toast.error('Failed to RSVP: ' + error.message);
    }
  };

  const addToCalendar = (event: any) => {
    const startDate = new Date(event.start_date);
    const endDate = new Date(event.end_date || event.start_date);
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.event_name)}&dates=${startDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}/${endDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}&details=${encodeURIComponent(event.description || '')}&location=${encodeURIComponent(event.venue || '')}`;
    
    window.open(googleCalendarUrl, '_blank');
  };

  const getEventTypeColor = (eventType: string) => {
    const colors = {
      'admission': 'bg-blue-100 text-blue-800',
      'webinar': 'bg-green-100 text-green-800',
      'open_house': 'bg-purple-100 text-purple-800',
      'fest': 'bg-pink-100 text-pink-800',
      'seminar': 'bg-orange-100 text-orange-800',
      'workshop': 'bg-indigo-100 text-indigo-800'
    };
    return colors[eventType as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!events || events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 text-center py-8">
            No upcoming events at the moment. Check back soon!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5" />
          <span>{showAll ? 'All Upcoming Events' : 'Upcoming Events'}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {events.map((event) => (
          <div key={event.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="font-semibold text-gray-900">{event.event_name}</h3>
                  <Badge className={getEventTypeColor(event.event_type)}>
                    {event.event_type?.replace('_', ' ')}
                  </Badge>
                  {event.is_online && (
                    <Badge variant="outline" className="text-xs">Online</Badge>
                  )}
                </div>
                
                {showAll && event.colleges && (
                  <div className="text-sm text-gray-600 mb-2">
                    {event.colleges.name}
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600 mb-2">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(event.start_date)}
                  </div>
                  <div className="flex items-center">
                    <span className="mr-1">⏰</span>
                    {formatTime(event.start_date)}
                  </div>
                  {event.venue && !event.is_online && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {event.venue}
                    </div>
                  )}
                </div>
                
                {event.description && (
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {event.description}
                  </p>
                )}
                
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  {event.current_registrations !== undefined && event.max_participants && (
                    <div className="flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      {event.current_registrations}/{event.max_participants} registered
                    </div>
                  )}
                  {event.registration_fee && event.registration_fee > 0 && (
                    <div>Fee: ₹{event.registration_fee}</div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={() => handleRSVP(event.id)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                RSVP
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => addToCalendar(event)}
              >
                <CalendarPlus className="h-4 w-4 mr-1" />
                Add to Calendar
              </Button>
              
              {event.registration_url && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(event.registration_url, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Register
                </Button>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};