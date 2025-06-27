
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, 
  Users, 
  GraduationCap, 
  Calendar,
  BookOpen,
  Award,
  Globe,
  Star,
  Building,
  Network,
  UserPlus
} from 'lucide-react';

const CollegeDetail = () => {
  const { id } = useParams();
  const [isFollowing, setIsFollowing] = useState(false);

  // Sample college data
  const college = {
    id: '1',
    name: 'Stanford University',
    type: 'University',
    location: 'Stanford, CA',
    logo_url: '/placeholder.svg',
    cover_image_url: '/placeholder.svg',
    description: 'Leading research university known for innovation and entrepreneurship',
    ranking: 2,
    alumni_count: 45000,
    students_count: 17000,
    established: 1885,
    website: 'https://stanford.edu',
    notable_programs: ['Computer Science', 'Engineering', 'Business', 'Medicine', 'Law'],
    verified_alumni: 2340,
    rating: 4.8,
    acceptance_rate: 4.3,
    endowment: '28.9B',
    student_faculty_ratio: '5:1'
  };

  const alumni = [
    {
      id: '1',
      name: 'Sarah Chen',
      graduation_year: 2018,
      degree: 'MS Computer Science',
      current_role: 'Senior Software Engineer',
      company: 'Google',
      location: 'Mountain View, CA',
      avatar_url: '/placeholder.svg',
      verified: true
    },
    {
      id: '2',
      name: 'Michael Rodriguez',
      graduation_year: 2015,
      degree: 'MBA',
      current_role: 'Product Manager',
      company: 'Apple',
      location: 'Cupertino, CA',
      avatar_url: '/placeholder.svg',
      verified: true
    },
    {
      id: '3',
      name: 'Dr. Emily Watson',
      graduation_year: 2012,
      degree: 'PhD Bioengineering',
      current_role: 'Research Scientist',
      company: 'Genentech',
      location: 'South San Francisco, CA',
      avatar_url: '/placeholder.svg',
      verified: true
    }
  ];

  const events = [
    {
      id: '1',
      title: 'Bay Area Alumni Networking',
      date: '2024-01-15',
      time: '6:00 PM',
      location: 'San Francisco, CA',
      type: 'Networking',
      attendees: 45,
      description: 'Connect with fellow Stanford alumni in the Bay Area tech industry.'
    },
    {
      id: '2',
      title: 'Career Development Workshop',
      date: '2024-01-20',
      time: '2:00 PM',
      location: 'Virtual',
      type: 'Workshop',
      attendees: 120,
      description: 'Learn career advancement strategies from successful alumni.'
    },
    {
      id: '3',
      title: 'Startup Pitch Competition',
      date: '2024-01-25',
      time: '10:00 AM',
      location: 'Stanford Campus',
      type: 'Competition',
      attendees: 200,
      description: 'Watch student entrepreneurs pitch their innovative ideas.'
    }
  ];

  const stats = [
    { label: 'World Ranking', value: `#${college.ranking}`, icon: Award },
    { label: 'Alumni Network', value: `${Math.round(college.alumni_count / 1000)}K+`, icon: Network },
    { label: 'Acceptance Rate', value: `${college.acceptance_rate}%`, icon: GraduationCap },
    { label: 'Student-Faculty Ratio', value: college.student_faculty_ratio, icon: Users }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Image */}
      <div className="h-64 bg-gradient-to-r from-red-600 to-red-800 relative">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* College Header */}
        <div className="relative -mt-32 mb-8">
          <Card className="p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between">
              <div className="flex items-start space-x-4 mb-4 md:mb-0">
                <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                  <AvatarImage src={college.logo_url} alt={college.name} />
                  <AvatarFallback className="text-2xl">SU</AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{college.name}</h1>
                  <div className="flex items-center space-x-4 text-gray-600 mb-2">
                    <div className="flex items-center">
                      <Star className="h-5 w-5 text-yellow-400 fill-current mr-1" />
                      <span className="font-medium">{college.rating}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {college.location}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Est. {college.established}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">#{college.ranking} World Ranking</Badge>
                    <Badge variant="outline">{college.type}</Badge>
                    <Badge variant="outline" className="text-blue-600">
                      <GraduationCap className="h-3 w-3 mr-1" />
                      {college.verified_alumni.toLocaleString()} verified alumni
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant={isFollowing ? "default" : "outline"}
                  onClick={() => setIsFollowing(!isFollowing)}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </Button>
                <Button variant="outline">
                  <Globe className="h-4 w-4 mr-2" />
                  Visit Website
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center">
              <CardContent className="p-6">
                <stat.icon className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="alumni">Alumni ({college.verified_alumni})</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="programs">Programs</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About {college.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{college.description}</p>
                    <p className="text-gray-600">
                      Stanford University has been at the forefront of innovation and academic excellence since its founding. 
                      Located in the heart of Silicon Valley, it has produced numerous leaders in technology, business, 
                      and public service.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Notable Programs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {college.notable_programs.map((program, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <BookOpen className="h-4 w-4 text-red-600" />
                          <span>{program}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Facts</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Established</span>
                      <span className="font-medium">{college.established}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Students</span>
                      <span className="font-medium">{college.students_count.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Alumni</span>
                      <span className="font-medium">{college.alumni_count.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Endowment</span>
                      <span className="font-medium">${college.endowment}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Alumni by Industry</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {[
                        { industry: 'Technology', percentage: 35 },
                        { industry: 'Finance', percentage: 20 },
                        { industry: 'Healthcare', percentage: 15 },
                        { industry: 'Consulting', percentage: 12 },
                        { industry: 'Education', percentage: 18 }
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{item.industry}</span>
                          <span className="text-sm font-medium">{item.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="alumni" className="space-y-6">
            <div className="grid gap-4">
              {alumni.map((person) => (
                <Card key={person.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={person.avatar_url} alt={person.name} />
                          <AvatarFallback>{person.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-gray-900">{person.name}</h3>
                            {person.verified && (
                              <Badge variant="secondary" className="text-xs">Verified</Badge>
                            )}
                          </div>
                          <p className="text-gray-600">{person.current_role} at {person.company}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                            <span>{person.degree} • Class of {person.graduation_year}</span>
                            <span>•</span>
                            <span>{person.location}</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Connect
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <div className="grid gap-4">
              {events.map((event) => (
                <Card key={event.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                          <Badge variant="outline">{event.type}</Badge>
                        </div>
                        <p className="text-gray-600 mb-3">{event.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {event.date} at {event.time}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {event.location}
                          </div>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {event.attendees} attending
                          </div>
                        </div>
                      </div>
                      <Button>RSVP</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="programs" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {college.notable_programs.map((program, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BookOpen className="h-5 w-5 text-red-600" />
                      <span>{program}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      Excellence in {program.toLowerCase()} education with cutting-edge research opportunities 
                      and industry partnerships.
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">Top Ranked</Badge>
                      <Button variant="outline" size="sm">Learn More</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CollegeDetail;
