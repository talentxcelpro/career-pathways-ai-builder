import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, Clock, MapPin, Users, Heart, Share2, Bell, BellOff } from 'lucide-react';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import { toast } from 'sonner';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  organizer: {
    id: string;
    name: string;
    avatar: string;
    title: string;
  };
  attendees: number;
  maxAttendees?: number;
  image?: string;
  price?: number;
  category: 'networking' | 'workshop' | 'conference' | 'meetup' | 'webinar';
  isAttending: boolean;
  isLiked: boolean;
  remindersEnabled: boolean;
  tags: string[];
}

interface MobileEventsProps {
  className?: string;
}

export const MobileEvents: React.FC<MobileEventsProps> = ({ className = '' }) => {
  const [events, setEvents] = useState<Event[]>([
    {
      id: '1',
      title: 'AI in Product Management',
      description: 'Learn how AI is transforming product management practices and how to integrate AI tools into your workflow.',
      date: '2024-01-15',
      time: '6:00 PM',
      location: 'Tech Hub, San Francisco',
      organizer: {
        id: 'org1',
        name: 'TechCorp',
        avatar: '/api/placeholder/40/40',
        title: 'Technology Company'
      },
      attendees: 142,
      maxAttendees: 200,
      image: '/api/placeholder/350/200',
      price: 25,
      category: 'workshop',
      isAttending: false,
      isLiked: true,
      remindersEnabled: false,
      tags: ['AI', 'Product Management', 'Innovation']
    },
    {
      id: '2',
      title: 'Startup Networking Mixer',
      description: 'Connect with fellow entrepreneurs, investors, and startup enthusiasts in the Bay Area.',
      date: '2024-01-18',
      time: '7:00 PM',
      location: 'Innovation District, SF',
      organizer: {
        id: 'org2',
        name: 'StartupSF',
        avatar: '/api/placeholder/40/40',
        title: 'Startup Community'
      },
      attendees: 89,
      maxAttendees: 150,
      category: 'networking',
      isAttending: true,
      isLiked: false,
      remindersEnabled: true,
      tags: ['Networking', 'Startups', 'Entrepreneurs']
    }
  ]);

  const [filter, setFilter] = useState<'all' | 'attending' | 'liked' | 'nearby'>('all');
  const { triggerHaptic } = useHapticFeedback();
  const { sync, isOnline } = useRealtimeSync();

  const handleAttendance = async (eventId: string) => {
    triggerHaptic('medium');
    setEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { 
            ...event, 
            isAttending: !event.isAttending,
            attendees: event.isAttending ? event.attendees - 1 : event.attendees + 1
          }
        : event
    ));

    const event = events.find(e => e.id === eventId);
    if (event) {
      await sync('events', { action: 'attend', eventId });
      toast.success(event.isAttending ? 'Removed from event' : 'Added to your calendar');
    }
  };

  const handleLike = async (eventId: string) => {
    triggerHaptic('light');
    setEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { ...event, isLiked: !event.isLiked }
        : event
    ));

    await sync('events', { action: 'like', eventId });
  };

  const handleReminder = async (eventId: string) => {
    triggerHaptic('light');
    setEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { ...event, remindersEnabled: !event.remindersEnabled }
        : event
    ));

    const event = events.find(e => e.id === eventId);
    if (event) {
      await sync('events', { action: 'reminder', eventId });
      toast.success(event.remindersEnabled ? 'Reminders disabled' : 'Reminders enabled');
    }
  };

  const getCategoryColor = (category: Event['category']) => {
    switch (category) {
      case 'networking': return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'workshop': return 'bg-green-500/10 text-green-700 border-green-200';
      case 'conference': return 'bg-purple-500/10 text-purple-700 border-purple-200';
      case 'meetup': return 'bg-orange-500/10 text-orange-700 border-orange-200';
      case 'webinar': return 'bg-pink-500/10 text-pink-700 border-pink-200';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  const filteredEvents = events.filter(event => {
    switch (filter) {
      case 'attending': return event.isAttending;
      case 'liked': return event.isLiked;
      case 'nearby': return true; // Simplified - would use location
      default: return true;
    }
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className={`${className}`}>
      {/* Filter Tabs */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/50 mb-4">
        <div className="flex items-center space-x-2 p-4 overflow-x-auto scrollbar-hide">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
            className="text-xs whitespace-nowrap"
          >
            All Events
          </Button>
          <Button
            variant={filter === 'attending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('attending')}
            className="text-xs whitespace-nowrap"
          >
            Attending
          </Button>
          <Button
            variant={filter === 'liked' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('liked')}
            className="text-xs whitespace-nowrap"
          >
            Liked
          </Button>
          <Button
            variant={filter === 'nearby' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('nearby')}
            className="text-xs whitespace-nowrap"
          >
            Nearby
          </Button>
        </div>
      </div>

      {/* Events List */}
      <div className="px-4 space-y-4 pb-6">
        {filteredEvents.map(event => (
          <Card key={event.id} className="overflow-hidden bg-card border-border/50 shadow-sm">
            {/* Event Image */}
            {event.image && (
              <div className="relative aspect-video">
                <img 
                  src={event.image} 
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 flex items-center space-x-2">
                  <Badge className={getCategoryColor(event.category)}>
                    {event.category}
                  </Badge>
                  {event.price && (
                    <Badge variant="secondary" className="bg-black/20 text-white border-white/20">
                      ${event.price}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Event Content */}
            <div className="p-4">
              {/* Event Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground text-sm leading-tight mb-1">
                    {event.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {event.description}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleReminder(event.id)}
                  className={`ml-2 ${event.remindersEnabled ? 'text-primary' : 'text-muted-foreground'}`}
                >
                  {event.remindersEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                </Button>
              </div>

              {/* Event Details */}
              <div className="space-y-2 mb-3">
                <div className="flex items-center text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3 mr-2" />
                  <span>{formatDate(event.date)}</span>
                  <Clock className="w-3 h-3 ml-4 mr-2" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3 mr-2" />
                  <span className="truncate">{event.location}</span>
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Users className="w-3 h-3 mr-2" />
                  <span>
                    {event.attendees} attending
                    {event.maxAttendees && ` • ${event.maxAttendees - event.attendees} spots left`}
                  </span>
                </div>
              </div>

              {/* Organizer */}
              <div className="flex items-center space-x-2 mb-3 pb-3 border-b border-border/50">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={event.organizer.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {event.organizer.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">
                    {event.organizer.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {event.organizer.title}
                  </p>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {event.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(event.id)}
                    className={`text-xs ${event.isLiked ? 'text-red-500' : 'text-muted-foreground'}`}
                  >
                    <Heart className={`w-4 h-4 mr-1 ${event.isLiked ? 'fill-current' : ''}`} />
                    Like
                  </Button>
                  <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
                    <Share2 className="w-4 h-4 mr-1" />
                    Share
                  </Button>
                </div>
                
                <Button
                  variant={event.isAttending ? 'outline' : 'default'}
                  size="sm"
                  onClick={() => handleAttendance(event.id)}
                  disabled={!isOnline}
                  className="text-xs"
                >
                  {event.isAttending ? 'Cancel' : 'Attend'}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Load More */}
      <div className="px-4 pb-4">
        <Button variant="outline" className="w-full text-xs" disabled={!isOnline}>
          {isOnline ? 'Load More Events' : 'Reconnecting...'}
        </Button>
      </div>
    </div>
  );
};