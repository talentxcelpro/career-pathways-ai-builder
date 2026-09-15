
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, MessageCircle, Calendar, MapPin, Star, ExternalLink, Plus } from 'lucide-react';

interface NetworkingContact {
  id: string;
  name: string;
  title: string;
  company: string;
  location: string;
  relevanceScore: number;
  connectionType: 'mentor' | 'peer' | 'industry-expert' | 'recruiter' | 'insider';
  mutualConnections: number;
  recentActivity: string;
  expertise: string[];
}

interface NetworkingEvent {
  id: string;
  title: string;
  type: 'conference' | 'meetup' | 'workshop' | 'webinar';
  date: string;
  location: string;
  attendees: number;
  relevanceScore: number;
  topics: string[];
  isVirtual: boolean;
}

interface NetworkingSuggestionsProps {
  targetRole: string;
  currentLocation: string;
  interests: string[];
}

export const NetworkingSuggestions: React.FC<NetworkingSuggestionsProps> = ({
  targetRole,
  currentLocation,
  interests
}) => {
  // Mock networking data
  const suggestedContacts: NetworkingContact[] = [
    {
      id: '1',
      name: 'Sarah Chen',
      title: 'Senior Software Engineer',
      company: 'Google',
      location: 'San Francisco, CA',
      relevanceScore: 95,
      connectionType: 'mentor',
      mutualConnections: 12,
      recentActivity: 'Posted about AI trends',
      expertise: ['Machine Learning', 'System Design', 'Leadership']
    },
    {
      id: '2',
      name: 'Mike Rodriguez',
      title: 'Engineering Manager',
      company: 'Meta',
      location: 'Seattle, WA',
      relevanceScore: 88,
      connectionType: 'industry-expert',
      mutualConnections: 8,
      recentActivity: 'Shared career advice',
      expertise: ['Team Management', 'Product Development', 'Scaling']
    },
    {
      id: '3',
      name: 'Emily Johnson',
      title: 'Technical Recruiter',
      company: 'LinkedIn',
      location: 'Remote',
      relevanceScore: 82,
      connectionType: 'recruiter',
      mutualConnections: 15,
      recentActivity: 'Hiring for senior roles',
      expertise: ['Talent Acquisition', 'Interview Prep', 'Market Insights']
    }
  ];

  const upcomingEvents: NetworkingEvent[] = [
    {
      id: '1',
      title: 'AI & Machine Learning Summit 2024',
      type: 'conference',
      date: '2024-08-15',
      location: 'San Francisco, CA',
      attendees: 2500,
      relevanceScore: 92,
      topics: ['AI', 'Machine Learning', 'Career Growth'],
      isVirtual: false
    },
    {
      id: '2',
      title: 'Senior Engineers Meetup',
      type: 'meetup',
      date: '2024-07-20',
      location: 'Virtual',
      attendees: 150,
      relevanceScore: 85,
      topics: ['Technical Leadership', 'System Design', 'Mentorship'],
      isVirtual: true
    },
    {
      id: '3',
      title: 'Tech Career Advancement Workshop',
      type: 'workshop',
      date: '2024-07-25',
      location: 'New York, NY',
      attendees: 80,
      relevanceScore: 78,
      topics: ['Career Planning', 'Negotiation', 'Personal Branding'],
      isVirtual: false
    }
  ];

  const getConnectionTypeColor = (type: NetworkingContact['connectionType']) => {
    switch (type) {
      case 'mentor': return 'bg-purple-100 text-purple-800';
      case 'peer': return 'bg-blue-100 text-blue-800';
      case 'industry-expert': return 'bg-green-100 text-green-800';
      case 'recruiter': return 'bg-orange-100 text-orange-800';
      case 'insider': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventTypeColor = (type: NetworkingEvent['type']) => {
    switch (type) {
      case 'conference': return 'bg-blue-100 text-blue-800';
      case 'meetup': return 'bg-green-100 text-green-800';
      case 'workshop': return 'bg-purple-100 text-purple-800';
      case 'webinar': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Networking Overview */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            Strategic Networking for {targetRole}
          </CardTitle>
          <CardDescription>
            AI-curated connections and events to accelerate your career growth
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{suggestedContacts.length}</div>
              <div className="text-sm text-gray-600">Suggested Connections</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{upcomingEvents.length}</div>
              <div className="text-sm text-gray-600">Relevant Events</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-2xl font-bold text-green-600">85%</div>
              <div className="text-sm text-gray-600">Match Score</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Suggested Connections */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-blue-600" />
            Recommended Connections
          </CardTitle>
          <CardDescription>
            High-value professionals who can help advance your career
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {suggestedContacts.map((contact) => (
              <div key={contact.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                        {contact.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{contact.name}</h4>
                        <Badge className={getConnectionTypeColor(contact.connectionType)}>
                          {contact.connectionType}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Star className="h-3 w-3 text-yellow-500" />
                          {contact.relevanceScore}% match
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        {contact.title} at {contact.company}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {contact.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {contact.mutualConnections} mutual connections
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {contact.expertise.slice(0, 3).map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500">{contact.recentActivity}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm">
                      <Plus className="h-3 w-3 mr-1" />
                      Connect
                    </Button>
                    <Button size="sm" variant="outline">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View Profile
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Networking Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-green-600" />
            Upcoming Networking Events
          </CardTitle>
          <CardDescription>
            Events aligned with your career goals and interests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{event.title}</h4>
                      <Badge className={getEventTypeColor(event.type)}>
                        {event.type}
                      </Badge>
                      {event.isVirtual && (
                        <Badge variant="secondary" className="text-xs">
                          Virtual
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(event.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {event.attendees} attendees
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {event.topics.map((topic, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-sm font-medium text-green-600">
                        {event.relevanceScore}% match
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 pt-2 border-t">
                  <Button size="sm">
                    <Calendar className="h-3 w-3 mr-1" />
                    Register
                  </Button>
                  <Button size="sm" variant="outline">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Learn More
                  </Button>
                  <Button size="sm" variant="outline">
                    <Star className="h-3 w-3 mr-1" />
                    Save Event
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
