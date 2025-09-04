import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { updateMetaTags } from '@/utils/metaTags';
import { 
  Users, 
  MessageCircle, 
  Search,
  UserPlus,
  MapPin,
  Briefcase,
  Star,
  Filter,
  Grid,
  List,
  Phone,
  Video,
  Mail,
  Calendar,
  Globe,
  Building,
  GraduationCap,
  Award,
  Clock
} from 'lucide-react';

interface NetworkProfile {
  id: string;
  name: string;
  title: string;
  company: string;
  location: string;
  avatar: string;
  skills: string[];
  mutualConnections: number;
  isOnline: boolean;
  lastActive: string;
  connectionStatus: 'connected' | 'pending' | 'none';
  industry: string;
  experience: string;
}

const NetworkPage = () => {
  const [activeTab, setActiveTab] = useState('discover');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [profiles, setProfiles] = useState<NetworkProfile[]>([]);

  useEffect(() => {
    updateMetaTags({
      title: 'Professional Network - Connect & Grow | TalentXcel',
      description: 'Connect with industry professionals, expand your network, and discover career opportunities through meaningful professional relationships.'
    });

    // Generate mock data for networking
    const mockProfiles: NetworkProfile[] = [
      {
        id: '1',
        name: 'Priya Sharma',
        title: 'Senior Software Engineer',
        company: 'Tech Mahindra',
        location: 'Bangalore, India',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b512d6ef?w=150&h=150&fit=crop&crop=face',
        skills: ['React', 'Node.js', 'Python', 'AWS'],
        mutualConnections: 12,
        isOnline: true,
        lastActive: 'Active now',
        connectionStatus: 'none',
        industry: 'Technology',
        experience: '5+ years'
      },
      {
        id: '2',
        name: 'Rahul Gupta',
        title: 'Product Manager',
        company: 'Flipkart',
        location: 'Mumbai, India',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        skills: ['Product Strategy', 'Analytics', 'Agile', 'Leadership'],
        mutualConnections: 8,
        isOnline: false,
        lastActive: '2 hours ago',
        connectionStatus: 'connected',
        industry: 'E-commerce',
        experience: '7+ years'
      },
      {
        id: '3',
        name: 'Sneha Patel',
        title: 'UX Designer',
        company: 'Zomato',
        location: 'Delhi, India',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems'],
        mutualConnections: 15,
        isOnline: true,
        lastActive: 'Active now',
        connectionStatus: 'pending',
        industry: 'Food Tech',
        experience: '4+ years'
      },
      {
        id: '4',
        name: 'Arjun Singh',
        title: 'Data Scientist',
        company: 'Paytm',
        location: 'Noida, India',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        skills: ['Python', 'Machine Learning', 'SQL', 'TensorFlow'],
        mutualConnections: 6,
        isOnline: false,
        lastActive: '1 day ago',
        connectionStatus: 'none',
        industry: 'Fintech',
        experience: '3+ years'
      },
      {
        id: '5',
        name: 'Kavya Menon',
        title: 'Marketing Manager',
        company: 'Byju\'s',
        location: 'Bangalore, India',
        avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face',
        skills: ['Digital Marketing', 'Content Strategy', 'SEO', 'Analytics'],
        mutualConnections: 20,
        isOnline: true,
        lastActive: 'Active now',
        connectionStatus: 'connected',
        industry: 'EdTech',
        experience: '6+ years'
      },
      {
        id: '6',
        name: 'Vikram Rao',
        title: 'DevOps Engineer',
        company: 'Swiggy',
        location: 'Hyderabad, India',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
        skills: ['Docker', 'Kubernetes', 'AWS', 'Jenkins'],
        mutualConnections: 9,
        isOnline: false,
        lastActive: '5 hours ago',
        connectionStatus: 'none',
        industry: 'Food Delivery',
        experience: '5+ years'
      }
    ];

    setProfiles(mockProfiles);
  }, []);

  const filteredProfiles = profiles.filter(profile =>
    profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    profile.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    profile.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    profile.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleConnect = (profileId: string) => {
    setProfiles(prev => prev.map(profile => 
      profile.id === profileId 
        ? { ...profile, connectionStatus: 'pending' as const }
        : profile
    ));
  };

  const handleMessage = (profileId: string) => {
    // In a real app, this would open a chat interface
    console.log('Opening chat with profile:', profileId);
  };

  const ProfileCard = ({ profile }: { profile: NetworkProfile }) => (
    <Card className="hover:shadow-lg transition-all duration-200 border-slate-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="relative">
              <Avatar className="w-12 h-12">
                <AvatarImage src={profile.avatar} alt={profile.name} />
                <AvatarFallback>{profile.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              {profile.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900 truncate">{profile.name}</h3>
              <p className="text-sm text-slate-600 truncate">{profile.title}</p>
              <p className="text-sm text-slate-500 truncate flex items-center gap-1">
                <Building className="w-3 h-3" />
                {profile.company}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {profile.connectionStatus === 'connected' && (
              <Badge variant="secondary" className="text-xs">Connected</Badge>
            )}
            {profile.connectionStatus === 'pending' && (
              <Badge variant="outline" className="text-xs">Pending</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Location and Experience */}
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {profile.location}
            </div>
            <div className="flex items-center gap-1">
              <Briefcase className="w-3 h-3" />
              {profile.experience}
            </div>
          </div>

          {/* Skills */}
          <div className="flex flex-wrap gap-1">
            {profile.skills.slice(0, 3).map(skill => (
              <Badge key={skill} variant="outline" className="text-xs">
                {skill}
              </Badge>
            ))}
            {profile.skills.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{profile.skills.length - 3}
              </Badge>
            )}
          </div>

          {/* Mutual Connections */}
          <div className="flex items-center gap-1 text-xs text-slate-600">
            <Users className="w-3 h-3" />
            {profile.mutualConnections} mutual connections
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            {profile.connectionStatus === 'none' && (
              <Button 
                size="sm" 
                className="flex-1" 
                onClick={() => handleConnect(profile.id)}
              >
                <UserPlus className="w-4 h-4 mr-1" />
                Connect
              </Button>
            )}
            {profile.connectionStatus === 'connected' && (
              <>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => handleMessage(profile.id)}
                >
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Message
                </Button>
                <Button size="sm" variant="outline">
                  <Phone className="w-4 h-4" />
                </Button>
              </>
            )}
            {profile.connectionStatus === 'pending' && (
              <Button size="sm" variant="outline" className="flex-1" disabled>
                <Clock className="w-4 h-4 mr-1" />
                Pending
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Professional Network</h1>
              <p className="text-slate-600">Connect with industry professionals and grow your career</p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button 
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Tab Navigation */}
          <div className="flex items-center justify-between mb-6">
            <TabsList className="grid grid-cols-4 w-fit">
              <TabsTrigger value="discover" className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">Discover</span>
              </TabsTrigger>
              <TabsTrigger value="connections" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">My Network</span>
              </TabsTrigger>
              <TabsTrigger value="requests" className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Requests</span>
              </TabsTrigger>
              <TabsTrigger value="messages" className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Messages</span>
              </TabsTrigger>
            </TabsList>

            {/* Search Bar */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search professionals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Tab Content */}
          <TabsContent value="discover">
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-primary">{filteredProfiles.length}</div>
                    <div className="text-sm text-slate-600">Professionals Found</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {profiles.filter(p => p.connectionStatus === 'connected').length}
                    </div>
                    <div className="text-sm text-slate-600">Connections</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {profiles.filter(p => p.connectionStatus === 'pending').length}
                    </div>
                    <div className="text-sm text-slate-600">Pending</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {profiles.filter(p => p.isOnline).length}
                    </div>
                    <div className="text-sm text-slate-600">Online Now</div>
                  </CardContent>
                </Card>
              </div>

              {/* Profiles Grid */}
              <div className={`grid gap-4 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {filteredProfiles.map(profile => (
                  <ProfileCard key={profile.id} profile={profile} />
                ))}
              </div>

              {filteredProfiles.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No professionals found</h3>
                  <p className="text-slate-600">Try adjusting your search criteria</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="connections">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Your Professional Network</CardTitle>
                  <CardDescription>
                    You have {profiles.filter(p => p.connectionStatus === 'connected').length} professional connections
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {profiles
                      .filter(profile => profile.connectionStatus === 'connected')
                      .map(profile => (
                        <ProfileCard key={profile.id} profile={profile} />
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="requests">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Connection Requests</CardTitle>
                  <CardDescription>
                    You have {profiles.filter(p => p.connectionStatus === 'pending').length} pending connection requests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {profiles
                      .filter(profile => profile.connectionStatus === 'pending')
                      .map(profile => (
                        <ProfileCard key={profile.id} profile={profile} />
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="messages">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Messages</CardTitle>
                  <CardDescription>Stay connected with your professional network</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <MessageCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No messages yet</h3>
                    <p className="text-slate-600">Start a conversation with your connections</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default NetworkPage;