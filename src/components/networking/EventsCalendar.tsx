import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Users, MapPin, Video, DollarSign, Star, Filter, Plus, ExternalLink } from "lucide-react";
import { useNetworking } from "@/hooks/useNetworking";
import { useAuth } from "@/contexts/AuthContext";
import { format, addDays, addHours } from "date-fns";

const EventsCalendar = () => {
  const { user } = useAuth();
  const { events, registerForEvent, isLoading, isProcessing } = useNetworking();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock events data
  const mockEvents = [
    {
      id: '1',
      title: 'AI in Product Management: Future Trends',
      description: 'Explore how artificial intelligence is transforming product management practices and learn about emerging trends.',
      event_type: 'webinar',
      start_time: addDays(new Date(), 3).toISOString(),
      end_time: addHours(addDays(new Date(), 3), 1.5).toISOString(),
      is_virtual: true,
      location_details: { platform: 'Zoom' },
      max_attendees: 500,
      current_attendees: 347,
      cover_image_url: '/placeholder-event.png',
      speakers: [
        {
          name: 'Dr. Sarah Kim',
          title: 'VP of Product at OpenAI',
          avatar: '/placeholder-avatar.png'
        },
        {
          name: 'Michael Chen',
          title: 'AI Product Lead at Google',
          avatar: '/placeholder-avatar.png'
        }
      ],
      tags: ['AI', 'Product Management', 'Innovation'],
      is_featured: true,
      cost_amount: 0,
      organizer: {
        name: 'Product Leaders Network',
        avatar: '/placeholder-org.png'
      },
      rating: 4.8,
      past_attendees: 1250
    },
    {
      id: '2',
      title: 'React Performance Optimization Workshop',
      description: 'Hands-on workshop covering advanced React optimization techniques, profiling, and best practices.',
      event_type: 'workshop',
      start_time: addDays(new Date(), 7).toISOString(),
      end_time: addHours(addDays(new Date(), 7), 4).toISOString(),
      is_virtual: false,
      location_details: { 
        venue: 'Tech Hub San Francisco',
        address: '123 Market St, San Francisco, CA'
      },
      max_attendees: 50,
      current_attendees: 42,
      cover_image_url: '/placeholder-event.png',
      speakers: [
        {
          name: 'Alex Rodriguez',
          title: 'Senior Frontend Engineer at Meta',
          avatar: '/placeholder-avatar.png'
        }
      ],
      tags: ['React', 'JavaScript', 'Performance'],
      is_featured: false,
      cost_amount: 99,
      organizer: {
        name: 'Frontend Masters',
        avatar: '/placeholder-org.png'
      },
      rating: 4.9,
      past_attendees: 500
    },
    {
      id: '3',
      title: 'Startup Funding Panel: Insights from VCs',
      description: 'Learn from top venture capitalists about funding strategies, pitch preparation, and market insights.',
      event_type: 'panel_discussion',
      start_time: addDays(new Date(), 10).toISOString(),
      end_time: addHours(addDays(new Date(), 10), 2).toISOString(),
      is_virtual: true,
      location_details: { platform: 'YouTube Live' },
      max_attendees: null,
      current_attendees: 892,
      cover_image_url: '/placeholder-event.png',
      speakers: [
        {
          name: 'Jessica Wang',
          title: 'Partner at Sequoia Capital',
          avatar: '/placeholder-avatar.png'
        },
        {
          name: 'David Kumar',
          title: 'Principal at Andreessen Horowitz',
          avatar: '/placeholder-avatar.png'
        },
        {
          name: 'Lisa Thompson',
          title: 'Managing Director at Accel',
          avatar: '/placeholder-avatar.png'
        }
      ],
      tags: ['Startup', 'Funding', 'Venture Capital'],
      is_featured: true,
      cost_amount: 0,
      organizer: {
        name: 'Startup Founders Hub',
        avatar: '/placeholder-org.png'
      },
      rating: 4.7,
      past_attendees: 2100
    },
    {
      id: '4',
      title: 'Data Science Career Fair 2024',
      description: 'Meet top companies hiring data scientists, attend career talks, and network with industry professionals.',
      event_type: 'networking',
      start_time: addDays(new Date(), 14).toISOString(),
      end_time: addHours(addDays(new Date(), 14), 6).toISOString(),
      is_virtual: false,
      location_details: { 
        venue: 'Convention Center',
        address: '456 Conference Blvd, Austin, TX'
      },
      max_attendees: 1000,
      current_attendees: 743,
      cover_image_url: '/placeholder-event.png',
      speakers: [
        {
          name: 'Dr. Emma Foster',
          title: 'Chief Data Officer at Netflix',
          avatar: '/placeholder-avatar.png'
        }
      ],
      tags: ['Data Science', 'Career', 'Networking'],
      is_featured: false,
      cost_amount: 0,
      organizer: {
        name: 'Data Science Community',
        avatar: '/placeholder-org.png'
      },
      rating: 4.6,
      past_attendees: 3200
    }
  ];

  const eventTypes = ['All', 'Webinar', 'Workshop', 'Networking', 'Conference', 'Panel Discussion'];

  const filteredEvents = mockEvents.filter(event =>
    searchQuery === '' ||
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
    event.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRegisterForEvent = async (eventId: string) => {
    try {
      await registerForEvent(eventId);
    } catch (error) {
      console.error('Error registering for event:', error);
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'webinar': return <Video className="h-4 w-4" />;
      case 'workshop': return <Users className="h-4 w-4" />;
      case 'networking': return <Users className="h-4 w-4" />;
      case 'conference': return <Calendar className="h-4 w-4" />;
      case 'panel_discussion': return <Users className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'webinar': return 'bg-blue-100 text-blue-800';
      case 'workshop': return 'bg-green-100 text-green-800';
      case 'networking': return 'bg-purple-100 text-purple-800';
      case 'conference': return 'bg-orange-100 text-orange-800';
      case 'panel_discussion': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatEventType = (type: string) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-4"
          />
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </div>
      </div>

      {/* Event Type Filters */}
      <div className="flex gap-2 flex-wrap">
        {eventTypes.map((type) => (
          <Badge 
            key={type} 
            variant="outline" 
            className="cursor-pointer hover:bg-accent"
          >
            {type}
          </Badge>
        ))}
      </div>

      {/* Events Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
          <TabsTrigger value="registered">My Events</TabsTrigger>
          <TabsTrigger value="past">Past Events</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredEvents.map((event) => (
              <Card key={event.id} className={`hover:shadow-md transition-shadow ${event.is_featured ? 'ring-2 ring-primary/20' : ''}`}>
                {event.is_featured && (
                  <div className="bg-primary text-primary-foreground px-3 py-1 text-xs font-medium">
                    Featured Event
                  </div>
                )}
                
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-foreground">{event.title}</h3>
                        <Badge className={getEventTypeColor(event.event_type)}>
                          {getEventTypeIcon(event.event_type)}
                          <span className="ml-1">{formatEventType(event.event_type)}</span>
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {event.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Event Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{format(new Date(event.start_time), 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{format(new Date(event.start_time), 'HH:mm')} - {format(new Date(event.end_time), 'HH:mm')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {event.is_virtual ? 
                          `Virtual (${event.location_details.platform})` : 
                          event.location_details.venue
                        }
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {event.current_attendees} {event.max_attendees ? `/ ${event.max_attendees}` : ''} attending
                      </span>
                    </div>
                  </div>

                  {/* Speakers */}
                  <div>
                    <span className="font-medium text-sm">Speakers:</span>
                    <div className="flex items-center gap-2 mt-2">
                      {event.speakers.slice(0, 3).map((speaker, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={speaker.avatar} />
                            <AvatarFallback className="text-xs">{speaker.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{speaker.name}</span>
                        </div>
                      ))}
                      {event.speakers.length > 3 && (
                        <span className="text-xs text-muted-foreground">+{event.speakers.length - 3} more</span>
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {event.tags.slice(0, 4).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Event Stats */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{event.rating}</span>
                      </div>
                      <span className="text-muted-foreground">
                        {event.past_attendees} past attendees
                      </span>
                    </div>
                    {event.cost_amount > 0 ? (
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">${event.cost_amount}</span>
                      </div>
                    ) : (
                      <Badge variant="secondary">Free</Badge>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1"
                      onClick={() => handleRegisterForEvent(event.id)}
                      disabled={isProcessing || (event.max_attendees && event.current_attendees >= event.max_attendees)}
                    >
                      {event.max_attendees && event.current_attendees >= event.max_attendees ? 
                        'Event Full' : 
                        event.cost_amount > 0 ? `Register - $${event.cost_amount}` : 'Register Free'
                      }
                    </Button>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="registered" className="space-y-4">
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Registered Events</h3>
            <p className="text-muted-foreground mb-4">
              Register for events to see them here
            </p>
            <Button onClick={() => setActiveTab('upcoming')}>
              Browse Events
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          <div className="text-center py-12">
            <Clock className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Past Events</h3>
            <p className="text-muted-foreground mb-4">
              Events you've attended will appear here
            </p>
            <Button onClick={() => setActiveTab('upcoming')}>
              Find Events
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EventsCalendar;