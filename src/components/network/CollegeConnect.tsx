import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { 
  GraduationCap, 
  Users, 
  Calendar, 
  MapPin, 
  Briefcase,
  Trophy,
  BookOpen,
  Video,
  FileText,
  Search,
  Filter,
  ExternalLink,
  Star,
  Clock,
  Building,
  Camera
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

interface CollegeEvent {
  id: string;
  title: string;
  description: string;
  event_type: 'job_fair' | 'workshop' | 'seminar' | 'placement_drive' | 'networking';
  college_name: string;
  date: string;
  location: string;
  is_virtual: boolean;
  registration_link?: string;
  companies_participating: string[];
  max_participants?: number;
  current_participants: number;
}

interface CampusRecruiter {
  id: string;
  name: string;
  company: string;
  role: string;
  avatar_url?: string;
  specialization: string[];
  colleges_visiting: string[];
  upcoming_visits: number;
  rating: number;
}

export const CollegeConnect: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'events' | 'recruiters' | 'resources'>('events');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const { data: currentUser } = useQuery({
    queryKey: ['current-user-college'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      return { ...user, profile };
    }
  });

  // Fetch real college events from database
  const { data: collegeEvents = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['college-events', searchQuery, filterType],
    queryFn: async () => {
      // Note: This would require a college_events table in your database
      // For now, return empty array until table is created
      return [];
    }
  });

  // Fetch real campus recruiters from database  
  const { data: campusRecruiters = [], isLoading: recruitersLoading } = useQuery({
    queryKey: ['campus-recruiters', searchQuery],
    queryFn: async () => {
      // Note: This would require a campus_recruiters table in your database
      // For now, return empty array until table is created
      return [];
    }
  });

  const getEventTypeInfo = (type: string) => {
    const types = {
      job_fair: { label: 'Job Fair', icon: Briefcase, color: 'bg-blue-100 text-blue-800' },
      workshop: { label: 'Workshop', icon: BookOpen, color: 'bg-purple-100 text-purple-800' },
      seminar: { label: 'Seminar', icon: Users, color: 'bg-green-100 text-green-800' },
      placement_drive: { label: 'Placement Drive', icon: Trophy, color: 'bg-yellow-100 text-yellow-800' },
      networking: { label: 'Networking', icon: Users, color: 'bg-indigo-100 text-indigo-800' }
    };
    return types[type as keyof typeof types] || types.job_fair;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysUntil = (dateString: string) => {
    const eventDate = new Date(dateString);
    const today = new Date();
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays > 0) return `${diffDays} days away`;
    return 'Past event';
  };

  const filteredEvents = collegeEvents.filter(event => {
    const matchesSearch = event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.college_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || event.event_type === filterType;
    return matchesSearch && matchesFilter;
  });

  const filteredRecruiters = campusRecruiters.filter(recruiter => {
    return recruiter.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           recruiter.company?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-green-900 mb-2">College Connect</h2>
              <p className="text-green-700">Bridge the gap between campus and career</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-900">150+</div>
                <div className="text-xs text-green-600">Partner Colleges</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-900">500+</div>
                <div className="text-xs text-blue-600">Campus Events</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-900">1000+</div>
                <div className="text-xs text-purple-600">Recruiters</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Tabs */}
      <Card>
        <CardHeader>
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {[
              { key: 'events', label: 'Campus Events', icon: Calendar },
              { key: 'recruiters', label: 'Campus Recruiters', icon: Users },
              { key: 'resources', label: 'Career Resources', icon: BookOpen }
            ].map(({ key, label, icon: Icon }) => (
              <Button
                key={key}
                variant={activeTab === key ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab(key as any)}
                className="flex-1 flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Button>
            ))}
          </div>
        </CardHeader>

        <CardContent>
          {/* Search and Filter */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            {activeTab === 'events' && (
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border rounded-md bg-white"
              >
                <option value="all">All Events</option>
                <option value="job_fair">Job Fairs</option>
                <option value="workshop">Workshops</option>
                <option value="placement_drive">Placement Drives</option>
                <option value="networking">Networking</option>
              </select>
            )}
          </div>

          {/* Events Tab */}
          {activeTab === 'events' && (
            <div className="space-y-4">
              {eventsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="border rounded-lg p-4 animate-pulse">
                      <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                      <div className="h-4 bg-muted rounded w-full"></div>
                    </div>
                  ))}
                </div>
              ) : filteredEvents.length > 0 ? (
                filteredEvents.map((event) => {
                  const eventInfo = getEventTypeInfo(event.event_type);
                  const EventIcon = eventInfo.icon;
                  const daysUntil = getDaysUntil(event.date);
                  
                  return (
                    <div key={event.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <EventIcon className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-gray-900">{event.title}</h4>
                              <Badge className={eventInfo.color}>
                                {eventInfo.label}
                              </Badge>
                              {event.is_virtual && (
                                <Badge variant="outline">
                                  <Camera className="h-3 w-3 mr-1" />
                                  Virtual
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <GraduationCap className="h-3 w-3" />
                                {event.college_name}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(event.date)}
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {event.location}
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {event.current_participants}/{event.max_participants || '∞'} registered
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900 mb-1">{daysUntil}</div>
                          <Button size="sm">
                            Register
                            <ExternalLink className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </div>

                      {/* Participating Companies */}
                      {event.companies_participating && event.companies_participating.length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-sm font-medium text-gray-900 mb-2">Participating Companies</p>
                          <div className="flex flex-wrap gap-2">
                            {event.companies_participating.map((company) => (
                              <Badge key={company} variant="outline" className="text-xs">
                                <Building className="h-3 w-3 mr-1" />
                                {company}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No college events found.</p>
                  <p className="text-sm mt-1">Check back later for upcoming events.</p>
                </div>
              )}
            </div>
          )}

          {/* Recruiters Tab */}
          {activeTab === 'recruiters' && (
            <div className="space-y-4">
              {recruitersLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="border rounded-lg p-4 animate-pulse">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-muted rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-5 bg-muted rounded w-3/4"></div>
                          <div className="h-4 bg-muted rounded w-1/2"></div>
                          <div className="h-4 bg-muted rounded w-2/3"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredRecruiters.length > 0 ? (
                filteredRecruiters.map((recruiter) => (
                  <div key={recruiter.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={recruiter.avatar_url} />
                          <AvatarFallback>
                            {recruiter.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold text-gray-900">{recruiter.name}</h4>
                          <p className="text-sm text-gray-600">{recruiter.role} at {recruiter.company}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="text-sm text-gray-600">{recruiter.rating}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Connect
                        </Button>
                        <Button size="sm">
                          Schedule Meet
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900 mb-1">Specialization</p>
                        <div className="flex flex-wrap gap-1">
                          {recruiter.specialization?.map((spec) => (
                            <Badge key={spec} variant="secondary" className="text-xs">
                              {spec}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-gray-900 mb-1">Visiting Colleges</p>
                        <div className="flex flex-wrap gap-1">
                          {recruiter.colleges_visiting?.slice(0, 3).map((college) => (
                            <Badge key={college} variant="outline" className="text-xs">
                              {college}
                            </Badge>
                          ))}
                          {recruiter.colleges_visiting && recruiter.colleges_visiting.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{recruiter.colleges_visiting.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {recruiter.upcoming_visits} upcoming visits
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No campus recruiters found.</p>
                  <p className="text-sm mt-1">Check back later for recruiter visits.</p>
                </div>
              )}
            </div>
          )}

          {/* Resources Tab */}
          {activeTab === 'resources' && (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <h4 className="font-semibold">Placement Preparation Kit</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Complete guide with resume templates, interview questions, and coding challenges
                  </p>
                  <Button size="sm" className="w-full">
                    Download Kit
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Video className="h-5 w-5 text-purple-600" />
                    <h4 className="font-semibold">Mock Interview Sessions</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Practice with industry experts and get personalized feedback
                  </p>
                  <Button size="sm" className="w-full" variant="outline">
                    Book Session
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Trophy className="h-5 w-5 text-yellow-600" />
                    <h4 className="font-semibold">Campus Leaderboard</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    See how your college ranks in placement statistics
                  </p>
                  <Button size="sm" className="w-full" variant="outline">
                    View Rankings
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <BookOpen className="h-5 w-5 text-green-600" />
                    <h4 className="font-semibold">Skill Assessments</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Test your knowledge and get certification recommendations
                  </p>
                  <Button size="sm" className="w-full" variant="outline">
                    Take Assessment
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};