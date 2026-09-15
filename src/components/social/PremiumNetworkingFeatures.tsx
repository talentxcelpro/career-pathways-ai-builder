import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Crown, Users, MessageCircle, Calendar, Zap, Star, 
  Filter, Search, MapPin, Briefcase, GraduationCap,
  Video, Phone, Mail, UserPlus, TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';

interface NetworkingContact {
  id: string;
  name: string;
  title: string;
  company: string;
  location: string;
  avatar: string;
  matchScore: number;
  commonConnections: number;
  isPremium: boolean;
  availability: 'available' | 'busy' | 'away';
  skills: string[];
  lastActive: string;
}

export const PremiumNetworkingFeatures: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('smart-matching');

  // Mock premium networking data
  const smartMatches: NetworkingContact[] = [
    {
      id: '1',
      name: 'Sarah Chen',
      title: 'Senior Product Manager',
      company: 'Google',
      location: 'San Francisco, CA',
      avatar: '/api/placeholder/40/40',
      matchScore: 95,
      commonConnections: 12,
      isPremium: true,
      availability: 'available',
      skills: ['Product Strategy', 'AI/ML', 'Growth'],
      lastActive: '2 hours ago'
    },
    {
      id: '2',
      name: 'Marcus Rodriguez',
      title: 'Engineering Director',
      company: 'Meta',
      location: 'Austin, TX',
      avatar: '/api/placeholder/40/40',
      matchScore: 88,
      commonConnections: 8,
      isPremium: true,
      availability: 'busy',
      skills: ['Leadership', 'React', 'Team Building'],
      lastActive: '1 hour ago'
    },
    {
      id: '3',
      name: 'Emily Watson',
      title: 'UX Research Lead',
      company: 'Spotify',
      location: 'New York, NY',
      avatar: '/api/placeholder/40/40',
      matchScore: 82,
      commonConnections: 15,
      isPremium: false,
      availability: 'available',
      skills: ['User Research', 'Design Systems', 'Analytics'],
      lastActive: '30 minutes ago'
    }
  ];

  const industryInsights = [
    {
      category: 'Trending Skills',
      items: ['AI/ML Engineering', 'Product Management', 'Data Science', 'Cloud Architecture'],
      growth: '+23%'
    },
    {
      category: 'Hot Companies',
      items: ['OpenAI', 'Anthropic', 'Stripe', 'Notion'],
      growth: '+45%'
    },
    {
      category: 'Growing Locations',
      items: ['Austin', 'Miami', 'Denver', 'Seattle'],
      growth: '+18%'
    }
  ];

  const handleConnect = (contactId: string, method: 'message' | 'video' | 'coffee') => {
    toast.success(`Connection request sent via ${method}!`);
  };

  const handleScheduleMeeting = (contactId: string) => {
    toast.success('Meeting request sent! They will receive a calendar invite.');
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'bg-green-500';
      case 'busy': return 'bg-red-500';
      case 'away': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const ContactCard = ({ contact }: { contact: NetworkingContact }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3">
            <div className="relative">
              <Avatar className="h-12 w-12">
                <AvatarImage src={contact.avatar} alt={contact.name} />
                <AvatarFallback>{contact.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getAvailabilityColor(contact.availability)}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{contact.name}</h3>
                {contact.isPremium && <Crown className="w-4 h-4 text-yellow-500" />}
              </div>
              <p className="text-sm text-muted-foreground">{contact.title}</p>
              <p className="text-sm text-muted-foreground">{contact.company}</p>
              <div className="flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{contact.location}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <Badge variant="secondary" className="mb-2">
              {contact.matchScore}% Match
            </Badge>
            <p className="text-xs text-muted-foreground">
              {contact.commonConnections} mutual connections
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Skills</p>
            <div className="flex flex-wrap gap-1">
              {contact.skills.slice(0, 3).map((skill) => (
                <Badge key={skill} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button 
              size="sm" 
              onClick={() => handleConnect(contact.id, 'message')}
              className="flex-1"
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              Message
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => handleConnect(contact.id, 'video')}
            >
              <Video className="w-4 h-4" />
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => handleScheduleMeeting(contact.id)}
            >
              <Calendar className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Crown className="w-6 h-6 text-yellow-500" />
          <h2 className="text-2xl font-bold">Premium Networking</h2>
          <Badge variant="secondary">Pro Feature</Badge>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          View Analytics
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="smart-matching">Smart Matching</TabsTrigger>
          <TabsTrigger value="industry-insights">Industry Insights</TabsTrigger>
          <TabsTrigger value="event-networking">Event Networking</TabsTrigger>
        </TabsList>

        <TabsContent value="smart-matching" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search professionals by role, company, or skills..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* AI-Powered Matches */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-yellow-500" />
              <h3 className="text-lg font-semibold">AI-Powered Matches</h3>
              <Badge variant="outline">Updated daily</Badge>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {smartMatches.map((contact) => (
                <ContactCard key={contact.id} contact={contact} />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="industry-insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {industryInsights.map((insight) => (
              <Card key={insight.category}>
                <CardHeader>
                  <CardTitle className="text-lg">{insight.category}</CardTitle>
                  <Badge variant="secondary" className="w-fit">
                    {insight.growth} growth
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {insight.items.map((item) => (
                      <div key={item} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                        <span className="text-sm font-medium">{item}</span>
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Market Intelligence */}
          <Card>
            <CardHeader>
              <CardTitle>Market Intelligence</CardTitle>
              <p className="text-sm text-muted-foreground">
                Real-time insights from your industry network
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-green-500">+23%</div>
                  <div className="text-sm text-muted-foreground">Job Openings</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-blue-500">89%</div>
                  <div className="text-sm text-muted-foreground">Response Rate</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-purple-500">156</div>
                  <div className="text-sm text-muted-foreground">New Connections</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-orange-500">4.8</div>
                  <div className="text-sm text-muted-foreground">Network Score</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="event-networking" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Networking Events</CardTitle>
              <p className="text-sm text-muted-foreground">
                Premium members get early access and VIP networking opportunities
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    title: 'Tech Leaders Summit 2024',
                    date: 'March 15, 2024',
                    location: 'San Francisco, CA',
                    attendees: 250,
                    type: 'Conference'
                  },
                  {
                    title: 'AI Product Managers Meetup',
                    date: 'March 20, 2024',
                    location: 'Virtual',
                    attendees: 150,
                    type: 'Virtual Meetup'
                  },
                  {
                    title: 'Startup Founders Circle',
                    date: 'March 25, 2024',
                    location: 'Austin, TX',
                    attendees: 75,
                    type: 'Exclusive'
                  }
                ].map((event, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{event.title}</h4>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {event.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {event.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {event.attendees} attendees
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{event.type}</Badge>
                      <Button size="sm">Join Event</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};