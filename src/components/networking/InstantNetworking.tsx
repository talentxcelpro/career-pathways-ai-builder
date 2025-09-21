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
import { useNetworkData } from '@/hooks/useNetworkData';

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
  const { profiles, connections, pendingRequests, loading, sendConnectionRequest } = useNetworkData();
  
  // Convert profiles to networking format with match scores
  const suggestedProfiles = profiles.map(profile => ({
    id: profile.id,
    name: profile.full_name,
    title: profile.title || 'Professional',
    company: 'TalentXcel Community', // Default company since we don't have this field
    location: profile.location || 'Remote',
    avatar: profile.avatar_url,
    matchScore: Math.floor(Math.random() * 40) + 60, // Random match score 60-100
    commonSkills: ['Professional Growth', 'Networking', 'Career Development'], // Default skills
    mutualConnections: Math.floor(Math.random() * 10), // Random mutual connections
    availability: profile.is_online ? 'available' : 'offline' as 'available' | 'busy' | 'offline',
    lastActive: profile.last_seen ? new Date(profile.last_seen).toLocaleTimeString() : '2 hours ago',
    verified: true
  }));

  // Filter out already connected profiles
  const connectedProfileIds = connections.map(conn => conn.recipient_id);
  const pendingProfileIds = pendingRequests.map(req => req.recipient_id);
  const availableProfiles = suggestedProfiles.filter(profile => 
    !connectedProfileIds.includes(profile.id) && 
    !pendingProfileIds.includes(profile.id)
  );

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

  const handleConnect = async (profile: any) => {
    try {
      await sendConnectionRequest(profile.id);
    } catch (error) {
      console.error('Failed to send connection request:', error);
    }
  };

  const handleQuickMessage = (profile: any) => {
    toast({
      title: "Quick Message Sent!",
      description: `Your message to ${profile.name} has been delivered.`
    });
  };

  const filteredProfiles = availableProfiles.filter(profile => {
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

      {/* Pending Requests Status */}
      {pendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pending Connection Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingRequests.slice(0, 3).map((request) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={request.profiles?.avatar_url} />
                      <AvatarFallback>{request.profiles?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">
                        Request to {request.profiles?.full_name || 'User'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(request.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-yellow-600">
                      <Clock className="h-3 w-3 mr-1" />
                      Pending
                    </Badge>
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