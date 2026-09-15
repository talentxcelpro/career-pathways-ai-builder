import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { EnhancedLiveEventCard } from "./EnhancedLiveEventCard";
import { EventNotifications } from "./EventNotifications";
import { EventCalendar } from "./EventCalendar";
import { LoadingSkeleton } from "@/components/news/LoadingSkeleton";
import { useLiveEvents, useTrendingEvents } from "@/hooks/useLiveEvents";
import { useAuth } from "@/contexts/AuthContext";
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
  Play,
  CalendarDays,
  Bell,
  Grid,
  List
} from 'lucide-react';

interface AdvancedLiveEventsFeedProps {
  variant?: 'full' | 'compact';
  maxItems?: number;
}

export const AdvancedLiveEventsFeed: React.FC<AdvancedLiveEventsFeedProps> = ({
  variant = 'full',
  maxItems = 20
}) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'popularity' | 'trending'>('date');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'calendar'>('grid');
  const [selectedDate, setSelectedDate] = useState<Date>();

  const filters = {
    type: selectedType,
    status: selectedStatus,
    category: selectedCategory,
    search: searchQuery,
    limit: maxItems
  };

  const { data: events = [], isLoading, error, refetch } = useLiveEvents(filters);
  const { data: trendingEvents = [] } = useTrendingEvents(3);

  const eventTypes = [
    { id: 'all', label: 'All Events', icon: Video },
    { id: 'webinar', label: 'Webinars', icon: Play },
    { id: 'workshop', label: 'Workshops', icon: Users },
    { id: 'networking', label: 'Networking', icon: Users },
    { id: 'interview', label: 'Interview Prep', icon: TrendingUp },
  ];

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'technology', label: 'Technology' },
    { id: 'business', label: 'Business' },
    { id: 'career', label: 'Career Development' },
    { id: 'leadership', label: 'Leadership' },
    { id: 'design', label: 'Design' },
    { id: 'marketing', label: 'Marketing' },
  ];

  const difficulties = [
    { id: 'all', label: 'All Levels' },
    { id: 'beginner', label: 'Beginner' },
    { id: 'intermediate', label: 'Intermediate' },
    { id: 'advanced', label: 'Advanced' },
  ];

  const statusFilters = [
    { id: 'all', label: 'All Events', icon: Calendar },
    { id: 'live', label: 'Live Now', icon: Radio },
    { id: 'upcoming', label: 'Upcoming', icon: Clock },
    { id: 'today', label: 'Today', icon: CalendarDays },
  ];

  const filteredAndSortedEvents = useMemo(() => {
    let filtered = events;

    // Additional client-side filters
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(event => event.difficulty_level === selectedDifficulty);
    }

    if (selectedDate) {
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.scheduled_at);
        return eventDate.toDateString() === selectedDate.toDateString();
      });
    }

    // Sort events
    switch (sortBy) {
      case 'popularity':
        return filtered.sort((a, b) => b.participant_count - a.participant_count);
      case 'trending':
        return filtered.sort((a, b) => {
          const aTrending = trendingEvents.some(t => t.id === a.id) ? 1 : 0;
          const bTrending = trendingEvents.some(t => t.id === b.id) ? 1 : 0;
          return bTrending - aTrending;
        });
      default:
        return filtered.sort((a, b) => 
          new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
        );
    }
  }, [events, selectedDifficulty, selectedDate, sortBy, trendingEvents]);

  const liveEvents = events.filter(event => event.is_live);
  const upcomingEvents = events.filter(event => 
    !event.is_live && new Date(event.scheduled_at) > new Date()
  ).slice(0, 3);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="text-center py-8">
          <div className="text-destructive mb-4">Failed to load events</div>
          <Button onClick={() => refetch()} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

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
          {filteredAndSortedEvents.slice(0, 5).map((event) => (
            <EnhancedLiveEventCard key={event.id} event={event} variant="compact" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Event Notifications */}
      {user && <EventNotifications userId={user.id} />}

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
                <EnhancedLiveEventCard key={event.id} event={event} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Featured/Trending Events */}
      {trendingEvents.length > 0 && (
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Trending Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {trendingEvents.map((event) => (
                <EnhancedLiveEventCard key={event.id} event={event} variant="featured" />
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
              <Video className="w-5 h-5 text-primary" />
              Live Events & Workshops
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-primary/10">
                <Users className="w-3 h-3 mr-1" />
                {filteredAndSortedEvents.length} events
              </Badge>
              <div className="flex items-center border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-none"
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('calendar')}
                  className="rounded-l-none"
                >
                  <CalendarDays className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events, topics, hosts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background/50 border-primary/20 focus:border-primary/40"
            />
          </div>

          {/* Status Filters */}
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

          {/* Advanced Filters */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
            {/* Event Type */}
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Event Type" />
              </SelectTrigger>
              <SelectContent>
                {eventTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Category */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Difficulty */}
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                {difficulties.map((difficulty) => (
                  <SelectItem key={difficulty.id} value={difficulty.id}>
                    {difficulty.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort By */}
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="popularity">Popularity</SelectItem>
                <SelectItem value="trending">Trending</SelectItem>
              </SelectContent>
            </Select>

            {/* Date Filter */}
            <DatePicker
              date={selectedDate}
              onDateChange={setSelectedDate}
              placeholder="Select Date"
            />

            {/* Clear Filters */}
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setSelectedType('all');
                setSelectedStatus('all');
                setSelectedCategory('all');
                setSelectedDifficulty('all');
                setSelectedDate(undefined);
              }}
            >
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Events Content */}
      {viewMode === 'calendar' ? (
        <EventCalendar events={filteredAndSortedEvents} />
      ) : (
        <div className={`grid gap-6 ${
          viewMode === 'list' 
            ? 'grid-cols-1' 
            : 'md:grid-cols-2 lg:grid-cols-3'
        }`}>
          {filteredAndSortedEvents.map((event) => (
            <EnhancedLiveEventCard 
              key={event.id} 
              event={event} 
              variant={viewMode === 'list' ? 'compact' : 'default'}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredAndSortedEvents.length === 0 && (
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
                setSelectedCategory('all');
                setSelectedDifficulty('all');
                setSelectedDate(undefined);
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