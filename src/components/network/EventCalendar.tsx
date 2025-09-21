import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LiveEvent } from "@/hooks/useLiveEvents";
import { Calendar, dateFnsLocalizer, Views, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Users,
  Video
} from 'lucide-react';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface EventCalendarProps {
  events: LiveEvent[];
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: LiveEvent;
}

export const EventCalendar: React.FC<EventCalendarProps> = ({ events }) => {
  const [currentView, setCurrentView] = useState<View>('month');
  const [currentDate, setCurrentDate] = useState(new Date());

  const calendarEvents: CalendarEvent[] = events.map(event => ({
    id: event.id,
    title: event.title,
    start: new Date(event.scheduled_at),
    end: new Date(new Date(event.scheduled_at).getTime() + event.duration_minutes * 60000),
    resource: event
  }));

  const eventStyleGetter = (event: CalendarEvent) => {
    const eventData = event.resource;
    let backgroundColor = '#3174ad';
    
    switch (eventData.event_type) {
      case 'webinar':
        backgroundColor = '#3b82f6';
        break;
      case 'workshop':
        backgroundColor = '#10b981';
        break;
      case 'networking':
        backgroundColor = '#8b5cf6';
        break;
      case 'interview':
        backgroundColor = '#f59e0b';
        break;
    }

    if (eventData.is_live) {
      backgroundColor = '#ef4444';
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  const CustomEvent = ({ event }: { event: CalendarEvent }) => {
    const eventData = event.resource;
    
    return (
      <div className="p-1">
        <div className="flex items-center gap-1 mb-1">
          {eventData.is_live && (
            <Badge variant="destructive" className="text-xs animate-pulse">
              LIVE
            </Badge>
          )}
          <Badge variant="secondary" className="text-xs">
            {eventData.event_type}
          </Badge>
        </div>
        <div className="font-medium text-sm line-clamp-2">{event.title}</div>
        <div className="flex items-center gap-2 text-xs mt-1">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{eventData.duration_minutes}m</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>{eventData.participant_count}</span>
          </div>
        </div>
      </div>
    );
  };

  const CustomToolbar = ({ label, onNavigate, onView }: any) => {
    return (
      <div className="flex items-center justify-between mb-4 p-4 bg-card rounded-lg border">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('PREV')}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('TODAY')}
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('NEXT')}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <h2 className="text-lg font-semibold">{label}</h2>

        <div className="flex items-center gap-1">
          <Button
            variant={currentView === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setCurrentView('month');
              onView('month');
            }}
          >
            Month
          </Button>
          <Button
            variant={currentView === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setCurrentView('week');
              onView('week');
            }}
          >
            Week
          </Button>
          <Button
            variant={currentView === 'day' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setCurrentView('day');
              onView('day');
            }}
          >
            Day
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Card className="h-[800px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5" />
          Events Calendar
          <Badge variant="outline">
            {events.length} events
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-full p-4">
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            view={currentView}
            onView={setCurrentView}
            date={currentDate}
            onNavigate={setCurrentDate}
            eventPropGetter={eventStyleGetter}
            components={{
              event: CustomEvent,
              toolbar: CustomToolbar,
            }}
            popup
            popupOffset={{ x: 30, y: 20 }}
            views={[Views.MONTH, Views.WEEK, Views.DAY]}
            defaultView={Views.MONTH}
            step={30}
            timeslots={2}
            formats={{
              timeGutterFormat: 'HH:mm',
              eventTimeRangeFormat: ({ start, end }) => 
                `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`,
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};