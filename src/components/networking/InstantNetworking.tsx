import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  UserPlus, 
  MessageCircle, 
  Star, 
  MapPin, 
  Briefcase,
  Search,
  Filter,
  Zap,
  Clock,
  CheckCircle,
  XCircle,
  MoreVertical
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface NetworkingProfile {
  id: string;
  name: string;
  title: string;
  company: string;
  location: string;
  avatar?: string;
  matchScore: number;
  commonSkills: string[];
  mutualConnections: number;
  availability: 'available' | 'busy' | 'offline';
  lastActive: string;
  verified: boolean;
}

interface ConnectionRequest {
  id: string;
  from: NetworkingProfile;
  to: NetworkingProfile;
  message: string;
  timestamp: Date;
  status: 'pending' | 'accepted' | 'declined';
}

export const InstantNetworking: React.FC = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'available' | 'high-match'>('all');
  const [connectionRequests, setConnectionRequests] = useState<ConnectionRequest[]>([]);
  
  const [suggestedProfiles] = useState<NetworkingProfile[]>([
    {
      id: '1',
      name: 'Sarah Chen',
      title: 'Senior React Developer',
      company: 'Google',
      location: 'San Francisco, CA',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b789?w=150',
      matchScore: 95,
      commonSkills: ['React', 'TypeScript', 'Node.js'],
      mutualConnections: 12,
      availability: 'available',
      lastActive: '2 mins ago',
      verified: true
    },
    {
      id: '2',
      name: 'Marcus Rodriguez',
      title: 'Tech Lead',
      company: 'Meta',
      location: 'Remote',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      matchScore: 88,
      commonSkills: ['JavaScript', 'React', 'GraphQL'],
      mutualConnections: 8,
      availability: 'busy',
      lastActive: '15 mins ago',
      verified: true
    },
    {
      id: '3',
      name: 'Emily Johnson',
      title: 'Frontend Engineer',
      company: 'Stripe',
      location: 'Austin, TX',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      matchScore: 82,
      commonSkills: ['React', 'CSS', 'Design Systems'],
      mutualConnections: 5,
      availability: 'available',
      lastActive: '5 mins ago',
      verified: false
    },
    {
      id: '4',
      name: 'David Kim',
      title: 'Full Stack Developer',
      company: 'Startup XYZ',
      location: 'Seattle, WA',
      matchScore: 76,
      commonSkills: ['Node.js', 'React', 'AWS'],
      mutualConnections: 3,
      availability: 'offline',
      lastActive: '2 hours ago',
      verified: true
    }
  ]);

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 75) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const handleConnect = async (profile: NetworkingProfile) => {
    const newRequest: ConnectionRequest = {
      id: Date.now().toString(),
      from: {
        id: 'current-user',
        name: 'You',
        title: 'Frontend Developer',
        company: 'TechCorp',
        location: 'Remote',
        matchScore: 0,
        commonSkills: [],
        mutualConnections: 0,
        availability: 'available',
        lastActive: 'now',
        verified: true
      },
      to: profile,
      message: `Hi ${profile.name}, I'd love to connect and learn about your experience at ${profile.company}!`,
      timestamp: new Date(),
      status: 'pending'
    };

    setConnectionRequests(prev => [...prev, newRequest]);
    
    toast({
      title: "Connection Request Sent!",
      description: `Your request to ${profile.name} has been sent successfully.`
    });

    // Simulate real-time response after 3 seconds
    setTimeout(() => {
      setConnectionRequests(prev => 
        prev.map(req => 
          req.id === newRequest.id 
            ? { ...req, status: Math.random() > 0.3 ? 'accepted' : 'pending' as const }
            : req
        )
      );
    }, 3000);
  };

  const handleQuickMessage = (profile: NetworkingProfile) => {
    toast({
      title: "Quick Message Sent!",
      description: `Your message to ${profile.name} has been delivered.`
    });
  };

  const filteredProfiles = suggestedProfiles.filter(profile => {
    const matchesSearch = profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         profile.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         profile.company.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    
    switch (activeFilter) {
      case 'available':
        return profile.availability === 'available';
      case 'high-match':
        return profile.matchScore >= 85;
      default:
        return true;
    }
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Random connection request updates
      if (Math.random() > 0.8) {
        toast({
          title: "New Connection Request!",
          description: "Someone wants to connect with you."
        });
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [toast]);

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search professionals by name, title, or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={activeFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter('all')}
              >
                All
              </Button>
              <Button
                variant={activeFilter === 'available' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter('available')}
              >
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                Available
              </Button>
              <Button
                variant={activeFilter === 'high-match' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter('high-match')}
              >
                <Star className="h-3 w-3 mr-1" />
                High Match
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connection Requests Status */}
      {connectionRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Connection Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {connectionRequests.slice(0, 3).map((request) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={request.to.avatar} />
                      <AvatarFallback>{request.to.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">
                        Request to {request.to.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {request.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {request.status === 'pending' && (
                      <Badge variant="outline" className="text-yellow-600">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                    {request.status === 'accepted' && (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Connected!
                      </Badge>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Suggested Connections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProfiles.map((profile, index) => (
          <motion.div
            key={profile.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                {/* Profile Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={profile.avatar} />
                        <AvatarFallback>{profile.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getAvailabilityColor(profile.availability)} rounded-full border-2 border-white`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <h3 className="font-semibold text-sm truncate">{profile.name}</h3>
                        {profile.verified && (
                          <CheckCircle className="h-3 w-3 text-blue-500" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{profile.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{profile.company}</p>
                    </div>
                  </div>
                  
                  <Badge className={`${getMatchScoreColor(profile.matchScore)} border`}>
                    {profile.matchScore}%
                  </Badge>
                </div>

                {/* Location and Status */}
                <div className="flex items-center gap-4 mb-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{profile.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{profile.lastActive}</span>
                  </div>
                </div>

                {/* Skills Match */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-medium">Skill Match</span>
                    <span className="text-xs text-muted-foreground">
                      {profile.commonSkills.length} common
                    </span>
                  </div>
                  <Progress value={profile.matchScore} className="h-1.5 mb-2" />
                  <div className="flex flex-wrap gap-1">
                    {profile.commonSkills.slice(0, 3).map((skill, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {profile.commonSkills.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{profile.commonSkills.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Mutual Connections */}
                {profile.mutualConnections > 0 && (
                  <div className="flex items-center gap-1 mb-3 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span>{profile.mutualConnections} mutual connections</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => handleConnect(profile)}
                    disabled={profile.availability === 'offline'}
                  >
                    <UserPlus className="h-3 w-3 mr-1" />
                    Connect
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleQuickMessage(profile)}
                    disabled={profile.availability === 'offline'}
                  >
                    <MessageCircle className="h-3 w-3" />
                  </Button>
                  
                  <Button size="sm" variant="outline">
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredProfiles.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No professionals found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or filters
            </p>
            <Button onClick={() => { setSearchQuery(''); setActiveFilter('all'); }}>
              Reset Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};