import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LiveEventCard } from "./LiveEventCard";
import {
  Search,
  Calendar,
  Clock,
  Users,
  Video,
  Filter,
  TrendingUp,
  Sparkles,
  Radio,
  Play
} from 'lucide-react';

// Mock data for live events
const mockEvents = [
  {
    id: '1',
    title: 'AI in Career Development: Future Trends and Opportunities',
    description: 'Explore how artificial intelligence is reshaping career paths and discover new opportunities in tech. Join industry experts as they discuss the latest AI trends.',
    host_name: 'Sarah Chen',
    host_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    scheduled_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
    duration_minutes: 60,
    participant_count: 234,
    max_participants: 500,
    is_live: false,
    event_type: 'webinar' as const,
    tags: ['AI', 'Career Development', 'Technology', 'Future of Work']
  },
  {
    id: '2',
    title: 'Live Networking: Connect with Tech Leaders',
    description: 'An interactive networking session for professionals in the tech industry. Make meaningful connections and expand your professional network.',
    host_name: 'Michael Rodriguez',
    host_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=michael',
    scheduled_at: new Date().toISOString(), // Live now
    duration_minutes: 90,
    participant_count: 127,
    max_participants: 200,
    is_live: true,
    event_type: 'networking' as const,
    tags: ['Networking', 'Tech Leaders', 'Professional Growth']
  },
  {
    id: '3',
    title: 'Mock Interview Workshop: Ace Your Next Interview',
    description: 'Practice your interview skills with experienced professionals. Get real-time feedback and improve your performance.',
    host_name: 'Emily Johnson',
    host_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emily',
    scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    duration_minutes: 120,
    participant_count: 89,
    max_participants: 150,
    is_live: false,
    event_type: 'workshop' as const,
    tags: ['Interview Prep', 'Career Skills', 'Professional Development']
  },
  {
    id: '4',
    title: 'Technical Interview Masterclass',
    description: 'Deep dive into technical interview preparation. Cover algorithms, system design, and coding challenges with expert guidance.',
    host_name: 'David Kim',
    host_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david',
    scheduled_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    duration_minutes: 150,
    participant_count: 312,
    max_participants: 400,
    is_live: false,
    event_type: 'interview' as const,
    tags: ['Technical Interview', 'Coding', 'System Design', 'Algorithms']
  },
  {
    id: '5',
    title: 'Women in Tech Leadership Panel',
    description: 'Inspiring stories and insights from successful women leaders in the technology industry. Learn about career progression and overcoming challenges.',
    host_name: 'Lisa Anderson',
    host_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisa',
    scheduled_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
    duration_minutes: 75,
    participant_count: 186,
    max_participants: 300,
    is_live: false,
    event_type: 'webinar' as const,
    tags: ['Women in Tech', 'Leadership', 'Diversity', 'Career Growth']
  }
];

interface LiveEventsFeedProps {
  variant?: 'full' | 'compact';
  maxItems?: number;
}

export const LiveEventsFeed: React.FC<LiveEventsFeedProps> = ({
  variant = 'full',
  maxItems = 10
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const eventTypes = [
    { id: 'all', label: 'All Events', icon: Video, color: 'bg-gradient-to-r from-blue-500 to-blue-600' },
    { id: 'webinar', label: 'Webinars', icon: Play, color: 'bg-gradient-to-r from-purple-500 to-purple-600' },
    { id: 'workshop', label: 'Workshops', icon: Users, color: 'bg-gradient-to-r from-green-500 to-green-600' },
    { id: 'networking', label: 'Networking', icon: Users, color: 'bg-gradient-to-r from-orange-500 to-orange-600' },
    { id: 'interview', label: 'Interview Prep', icon: TrendingUp, color: 'bg-gradient-to-r from-red-500 to-red-600' },
  ];

  const statusFilters = [
    { id: 'all', label: 'All Events', icon: Calendar },
    { id: 'live', label: 'Live Now', icon: Radio },
    { id: 'upcoming', label: 'Upcoming', icon: Clock },
    { id: 'today', label: 'Today', icon: Calendar },
  ];

  const filteredEvents = useMemo(() => {
    let filtered = mockEvents;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by event type
    if (selectedType !== 'all') {
      filtered = filtered.filter(event => event.event_type === selectedType);
    }

    // Filter by status
    switch (selectedStatus) {
      case 'live':
        filtered = filtered.filter(event => event.is_live);
        break;
      case 'upcoming':
        filtered = filtered.filter(event => 
          !event.is_live && new Date(event.scheduled_at) > new Date()
        );
        break;
      case 'today':
        const today = new Date();
        filtered = filtered.filter(event => {
          const eventDate = new Date(event.scheduled_at);
          return eventDate.toDateString() === today.toDateString();
        });
        break;
    }

    return filtered.slice(0, maxItems);
  }, [searchQuery, selectedType, selectedStatus, maxItems]);

  const liveEvents = mockEvents.filter(event => event.is_live);
  const upcomingEvents = mockEvents.filter(event => 
    !event.is_live && new Date(event.scheduled_at) > new Date()
  ).slice(0, 3);

  if (variant === 'compact') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Live Events</h3>
          <Badge variant="secondary" className="animate-pulse">
            <Radio className="w-3 h-3 mr-1" />
            {liveEvents.length} live
          </Badge>
        </div>
        <div className="space-y-3">
          {filteredEvents.slice(0, 3).map((event) => (
            <LiveEventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Live Events Banner */}
      {liveEvents.length > 0 && (
        <Card className="border-red-200 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
              <Radio className="w-5 h-5 animate-pulse" />
              Live Events Happening Now
              <Badge variant="destructive" className="animate-pulse">
                {liveEvents.length} Live
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {liveEvents.map((event) => (
                <LiveEventCard key={event.id} event={event} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card className="border-0 shadow-md bg-gradient-to-r from-card via-card to-muted/30">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Live Events & Workshops
            </CardTitle>
            <Badge variant="outline" className="bg-primary/10">
              <Users className="w-3 h-3 mr-1" />
              {filteredEvents.length} events
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events, topics, or hosts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background/50 border-primary/20 focus:border-primary/40"
            />
          </div>

          {/* Filters */}
          <Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
            <TabsList className="grid w-full grid-cols-4 bg-muted/50">
              {statusFilters.map((filter) => {
                const Icon = filter.icon;
                return (
                  <TabsTrigger key={filter.id} value={filter.id} className="flex items-center gap-1">
                    <Icon className="w-3 h-3" />
                    <span className="hidden sm:inline">{filter.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>

          {/* Event Type Filters */}
          <div className="flex flex-wrap gap-2">
            {eventTypes.map((type) => {
              const Icon = type.icon;
              return (
                <Button
                  key={type.id}
                  variant={selectedType === type.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedType(type.id)}
                  className={`
                    ${selectedType === type.id 
                      ? `${type.color} text-white border-0 shadow-lg` 
                      : 'hover:bg-primary/10'
                    }
                    transition-all duration-200
                  `}
                >
                  <Icon className="w-3 h-3 mr-1" />
                  {type.label}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Events Preview */}
      {upcomingEvents.length > 0 && selectedStatus === 'all' && (
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Coming Up Next
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {upcomingEvents.map((event) => (
                <LiveEventCard key={event.id} event={event} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Events Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredEvents.map((event) => (
          <LiveEventCard key={event.id} event={event} />
        ))}
      </div>

      {/* Empty State */}
      {filteredEvents.length === 0 && (
        <Card className="border-dashed border-2">
          <CardContent className="text-center py-12">
            <Video className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <div className="text-muted-foreground mb-2">
              No events found matching your criteria
            </div>
            <Button
              onClick={() => {
                setSearchQuery('');
                setSelectedType('all');
                setSelectedStatus('all');
              }}
              variant="outline"
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};