import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/common/UserAvatar';
import { Input } from '@/components/ui/input';
import { 
  Users, MessageSquare, Linkedin, Calendar, MapPin, 
  Building, TrendingUp, Star, Clock, Target, Mail,
  Phone, ExternalLink, UserPlus, CheckCircle
} from 'lucide-react';

interface NetworkContact {
  id: string;
  name: string;
  title: string;
  company: string;
  location: string;
  profileImage?: string;
  connectionStrength: number;
  mutualConnections: number;
  recentActivity: string;
  contactMethod: 'linkedin' | 'email' | 'referral' | 'event';
  responseRate: number;
  lastContact?: string;
  nextBestTime?: string;
  topics: string[];
  value: 'high' | 'medium' | 'low';
}

interface NetworkingOpportunity {
  id: string;
  type: 'event' | 'introduction' | 'content' | 'direct';
  title: string;
  description: string;
  targetContacts: string[];
  successRate: number;
  timeInvestment: string;
  expectedOutcome: string;
  actionSteps: string[];
  deadline?: string;
}

interface MentorProfile {
  id: string;
  name: string;
  title: string;
  company: string;
  experience: string;
  expertise: string[];
  menteeSuccess: number;
  availability: 'available' | 'limited' | 'full';
  matchScore: number;
  communicationStyle: string;
  meetingFrequency: string;
  profileImage?: string;
}

const NetworkingIntelligence: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'contacts' | 'opportunities' | 'mentors'>('contacts');

  const strategicContacts: NetworkContact[] = [
    {
      id: '1',
      name: 'Sarah Chen',
      title: 'Engineering Director',
      company: 'Google',
      location: 'Mountain View, CA',
      connectionStrength: 92,
      mutualConnections: 15,
      recentActivity: 'Posted about AI trends',
      contactMethod: 'linkedin',
      responseRate: 85,
      lastContact: '2024-01-15',
      nextBestTime: 'Tuesday 2-4 PM PST',
      topics: ['AI/ML', 'Engineering Leadership', 'Career Growth'],
      value: 'high'
    },
    {
      id: '2',
      name: 'Michael Rodriguez',
      title: 'Senior Software Engineer',
      company: 'Microsoft',
      location: 'Seattle, WA',
      connectionStrength: 78,
      mutualConnections: 8,
      recentActivity: 'Shared article on cloud architecture',
      contactMethod: 'referral',
      responseRate: 72,
      nextBestTime: 'Wednesday 10-12 PM PST',
      topics: ['Cloud Computing', 'DevOps', 'Azure'],
      value: 'high'
    },
    {
      id: '3',
      name: 'Emily Johnson',
      title: 'Product Manager',
      company: 'Meta',
      location: 'Menlo Park, CA',
      connectionStrength: 65,
      mutualConnections: 12,
      recentActivity: 'Attending Product Conference',
      contactMethod: 'event',
      responseRate: 68,
      topics: ['Product Strategy', 'User Experience', 'Tech Trends'],
      value: 'medium'
    }
  ];

  const networkingOpportunities: NetworkingOpportunity[] = [
    {
      id: '1',
      type: 'event',
      title: 'AI & Future of Work Conference',
      description: 'Premier event with 500+ tech leaders, perfect for strategic networking',
      targetContacts: ['Sarah Chen', 'David Kim'],
      successRate: 78,
      timeInvestment: '2 days',
      expectedOutcome: '5-8 high-quality connections',
      actionSteps: [
        'Register for conference',
        'Review speaker list and attendees',
        'Schedule pre-event coffee meetings',
        'Prepare elevator pitch for AI focus'
      ],
      deadline: '2024-03-15'
    },
    {
      id: '2',
      type: 'introduction',
      title: 'Warm Introduction to Netflix Tech Lead',
      description: 'John Martinez can introduce you to their VP of Engineering',
      targetContacts: ['Alex Thompson'],
      successRate: 92,
      timeInvestment: '30 minutes',
      expectedOutcome: 'Direct connection to decision maker',
      actionSteps: [
        'Message John with specific ask',
        'Share your updated resume',
        'Suggest mutual value proposition',
        'Follow up within 48 hours'
      ]
    },
    {
      id: '3',
      type: 'content',
      title: 'Thought Leadership Article',
      description: 'Write about DevOps trends to attract industry attention',
      targetContacts: ['Industry influencers'],
      successRate: 65,
      timeInvestment: '4-6 hours',
      expectedOutcome: 'Increased visibility, inbound connections',
      actionSteps: [
        'Research trending DevOps topics',
        'Draft 1000-word article',
        'Share on LinkedIn and Medium',
        'Engage with comments and responses'
      ]
    }
  ];

  const potentialMentors: MentorProfile[] = [
    {
      id: '1',
      name: 'Lisa Wang',
      title: 'VP of Engineering',
      company: 'Stripe',
      experience: '15 years in tech leadership',
      expertise: ['Engineering Management', 'Scaling Teams', 'Career Development'],
      menteeSuccess: 89,
      availability: 'limited',
      matchScore: 94,
      communicationStyle: 'Direct, actionable advice',
      meetingFrequency: 'Bi-weekly, 30 minutes'
    },
    {
      id: '2',
      name: 'Robert Kumar',
      title: 'Chief Technology Officer',
      company: 'Airbnb',
      experience: '12 years, transitioned from IC to exec',
      expertise: ['Technical Leadership', 'Architecture', 'Innovation'],
      menteeSuccess: 86,
      availability: 'available',
      matchScore: 91,
      communicationStyle: 'Collaborative, strategic thinking',
      meetingFrequency: 'Monthly, 45 minutes'
    },
    {
      id: '3',
      name: 'Jennifer Adams',
      title: 'Senior Principal Engineer',
      company: 'Amazon',
      experience: '10 years, expert in distributed systems',
      expertise: ['System Design', 'Technical Excellence', 'Mentoring'],
      menteeSuccess: 92,
      availability: 'available',
      matchScore: 88,
      communicationStyle: 'Technical deep-dives, practical',
      meetingFrequency: 'Weekly, 1 hour'
    }
  ];

  const getValueColor = (value: string) => {
    switch (value) {
      case 'high': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'text-green-600 bg-green-50';
      case 'limited': return 'text-yellow-600 bg-yellow-50';
      case 'full': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getContactMethodIcon = (method: string) => {
    switch (method) {
      case 'linkedin': return <Linkedin className="h-4 w-4 text-blue-600" />;
      case 'email': return <Mail className="h-4 w-4 text-gray-600" />;
      case 'referral': return <Users className="h-4 w-4 text-green-600" />;
      case 'event': return <Calendar className="h-4 w-4 text-purple-600" />;
      default: return <MessageSquare className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Networking Dashboard Header */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Networking Intelligence Hub
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">127</div>
              <div className="text-sm text-muted-foreground">Strategic Connections</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">73%</div>
              <div className="text-sm text-muted-foreground">Response Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">15</div>
              <div className="text-sm text-muted-foreground">This Month's Connections</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">5</div>
              <div className="text-sm text-muted-foreground">Active Opportunities</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b">
        <Button 
          variant={activeTab === 'contacts' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('contacts')}
          className="flex items-center gap-2"
        >
          <Users className="h-4 w-4" />
          Strategic Contacts
        </Button>
        <Button 
          variant={activeTab === 'opportunities' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('opportunities')}
          className="flex items-center gap-2"
        >
          <Target className="h-4 w-4" />
          Opportunities
        </Button>
        <Button 
          variant={activeTab === 'mentors' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('mentors')}
          className="flex items-center gap-2"
        >
          <Star className="h-4 w-4" />
          Mentors
        </Button>
      </div>

      {/* Strategic Contacts Tab */}
      {activeTab === 'contacts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">High-Value Contacts</h3>
            <div className="flex gap-2">
              <Input placeholder="Search contacts..." className="w-64" />
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Contact
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            {strategicContacts.map((contact) => (
              <Card key={contact.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <UserAvatar 
                      src={contact.profileImage}
                      userName={contact.name}
                      size="lg"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-lg">{contact.name}</h4>
                          <p className="text-muted-foreground">{contact.title} at {contact.company}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{contact.location}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge className={getValueColor(contact.value)}>
                            {contact.value} value
                          </Badge>
                          <div className="text-right">
                            <div className="text-lg font-bold text-primary">{contact.connectionStrength}%</div>
                            <div className="text-xs text-muted-foreground">Connection Strength</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div>
                          <div className="text-sm font-medium mb-1">Contact Intelligence</div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              {getContactMethodIcon(contact.contactMethod)}
                              <span>Best via {contact.contactMethod}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span>{contact.nextBestTime}</span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {contact.responseRate}% response rate
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-sm font-medium mb-1">Topics of Interest</div>
                          <div className="flex flex-wrap gap-1">
                            {contact.topics.map((topic) => (
                              <Badge key={topic} variant="outline" className="text-xs">{topic}</Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-sm font-medium mb-1">Recent Activity</div>
                          <p className="text-sm text-muted-foreground">{contact.recentActivity}</p>
                          <div className="text-xs text-muted-foreground mt-1">
                            {contact.mutualConnections} mutual connections
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        <Button size="sm">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Send Message
                        </Button>
                        <Button size="sm" variant="outline">
                          <Calendar className="h-3 w-3 mr-1" />
                          Schedule Meeting
                        </Button>
                        <Button size="sm" variant="outline">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View Profile
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Networking Opportunities Tab */}
      {activeTab === 'opportunities' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Active Networking Opportunities</h3>
          
          <div className="grid gap-4">
            {networkingOpportunities.map((opportunity) => (
              <Card key={opportunity.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{opportunity.title}</CardTitle>
                      <p className="text-muted-foreground mt-1">{opportunity.description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant="secondary" className="capitalize">{opportunity.type}</Badge>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">{opportunity.successRate}%</div>
                        <div className="text-xs text-muted-foreground">Success Rate</div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Opportunity Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span>Time investment: {opportunity.timeInvestment}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Target className="h-3 w-3 text-muted-foreground" />
                          <span>Expected outcome: {opportunity.expectedOutcome}</span>
                        </div>
                        {opportunity.deadline && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 text-red-500" />
                            <span>Deadline: {opportunity.deadline}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Action Steps</h4>
                      <div className="space-y-1">
                        {opportunity.actionSteps.map((step, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <div className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-medium">
                              {index + 1}
                            </div>
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Start Opportunity
                    </Button>
                    <Button variant="outline">Learn More</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Mentors Tab */}
      {activeTab === 'mentors' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Potential Mentors</h3>
          
          <div className="grid gap-4">
            {potentialMentors.map((mentor) => (
              <Card key={mentor.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <UserAvatar 
                      src={mentor.profileImage}
                      userName={mentor.name}
                      size="lg"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-lg">{mentor.name}</h4>
                          <p className="text-muted-foreground">{mentor.title} at {mentor.company}</p>
                          <p className="text-sm text-muted-foreground mt-1">{mentor.experience}</p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge className={getAvailabilityColor(mentor.availability)}>
                            {mentor.availability}
                          </Badge>
                          <div className="text-right">
                            <div className="text-lg font-bold text-primary">{mentor.matchScore}%</div>
                            <div className="text-xs text-muted-foreground">Match Score</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div>
                          <div className="text-sm font-medium mb-1">Expertise</div>
                          <div className="flex flex-wrap gap-1">
                            {mentor.expertise.map((skill) => (
                              <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-sm font-medium mb-1">Mentoring Style</div>
                          <p className="text-sm text-muted-foreground">{mentor.communicationStyle}</p>
                          <div className="text-sm text-muted-foreground mt-1">
                            {mentor.meetingFrequency}
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-sm font-medium mb-1">Track Record</div>
                          <div className="flex items-center gap-2">
                            <div className="text-lg font-bold text-green-600">{mentor.menteeSuccess}%</div>
                            <span className="text-xs text-muted-foreground">mentee success rate</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        <Button size="sm">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Request Mentorship
                        </Button>
                        <Button size="sm" variant="outline">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View Profile
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NetworkingIntelligence;