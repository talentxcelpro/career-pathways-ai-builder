import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { updateMetaTags } from '@/utils/metaTags';
import { useRealtimeConnections } from '@/hooks/useRealtimeConnections';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { GlobalSearch } from '@/components/ui/global-search';
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
  Clock,
  Shield
} from 'lucide-react';
import { SkillSwapNetwork } from '@/components/network/advanced/SkillSwapNetwork';
import { EventlessNetworking } from '@/components/network/advanced/EventlessNetworking';
import { NetworkingWithProof } from '@/components/network/advanced/NetworkingWithProof';
import { InterestFirstNetwork } from '@/components/network/advanced/InterestFirstNetwork';

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
  email?: string;
}

interface Connection {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  profiles?: {
    id: string;
    full_name: string;
    profile_picture_url: string;
    headline: string;
    title: string;
    current_company: string;
    location: string;
    skills: string[];
  };
}

const NetworkPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('discover');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [connections, setConnections] = useState<Connection[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Connection[]>([]);
  
  // Use real-time connections hook for discover tab
  const { 
    users, 
    loading: discoverLoading, 
    sendConnectionRequest, 
    getLastSeenText, 
    stats,
    refetch 
  } = useRealtimeConnections();

  useEffect(() => {
    updateMetaTags({
      title: 'Professional Network - Connect & Grow | TalentXcel',
      description: 'Connect with industry professionals, expand your network, and discover career opportunities through meaningful professional relationships.'
    });

    if (user) {
      fetchConnections();
      fetchPendingRequests();
    }
  }, [user]);

  // Fetch existing connections
  const fetchConnections = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('connections')
        .select(`
          *,
          profiles!connections_recipient_id_fkey(
            id,
            full_name,
            profile_picture_url,
            headline,
            title,
            current_company,
            location,
            skills
          )
        `)
        .eq('status', 'accepted')
        .eq('requester_id', user.id);

      if (error) throw error;
      setConnections(data || []);
    } catch (error) {
      console.error('Error fetching connections:', error);
    }
  };

  // Fetch pending connection requests
  const fetchPendingRequests = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('connections')
        .select(`
          *,
          profiles!connections_requester_id_fkey(
            id,
            full_name,
            profile_picture_url,
            headline,
            title,
            current_company,
            location,
            skills
          )
        `)
        .eq('status', 'pending')
        .eq('recipient_id', user.id);

      if (error) throw error;
      setPendingRequests(data || []);
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    }
  };

  // Convert real user data to NetworkProfile format
  const convertToNetworkProfile = (user: any, connectionStatus: 'connected' | 'pending' | 'none' = 'none'): NetworkProfile => ({
    id: user.id,
    name: user.full_name || 'Unknown User',
    title: user.title || user.headline || 'Professional',
    company: user.current_company || 'Company',
    location: user.location || 'Location',
    avatar: user.profile_picture_url || '',
    skills: user.skills || [],
    mutualConnections: Math.floor(Math.random() * 20), // TODO: Calculate real mutual connections
    isOnline: user.is_online || false,
    lastActive: user.is_online ? 'Active now' : getLastSeenText(user.last_seen),
    connectionStatus,
    industry: 'Technology', // TODO: Add industry to profiles table
    experience: '3+ years', // TODO: Calculate from profile data
    email: user.email
  });

  // Convert discover users to profiles
  const discoverProfiles = users.map(user => convertToNetworkProfile(user, 'none'));
  
  // Convert connections to profiles
  const connectedProfiles = connections.map(conn => 
    convertToNetworkProfile(conn.profiles, 'connected')
  );
  
  // Convert pending requests to profiles
  const pendingProfiles = pendingRequests.map(req => 
    convertToNetworkProfile(req.profiles, 'pending')
  );

  // Combine all profiles for search
  const allProfiles = [...discoverProfiles, ...connectedProfiles, ...pendingProfiles];

  const getFilteredProfiles = (profiles: NetworkProfile[]) => 
    profiles.filter(profile =>
      profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  const handleConnect = async (profileId: string) => {
    try {
      const result = await sendConnectionRequest(profileId);
      if (result.success) {
        toast.success('Connection request sent!');
        refetch(); // Refresh the discover list
      } else {
        toast.error('Failed to send connection request');
      }
    } catch (error) {
      console.error('Error sending connection request:', error);
      toast.error('Something went wrong');
    }
  };

  const handleAcceptRequest = async (connectionId: string) => {
    try {
      const { error } = await supabase
        .from('connections')
        .update({ status: 'accepted' })
        .eq('id', connectionId);

      if (error) throw error;

      toast.success('Connection request accepted!');
      fetchConnections();
      fetchPendingRequests();
    } catch (error) {
      console.error('Error accepting connection:', error);
      toast.error('Failed to accept connection request');
    }
  };

  const handleDeclineRequest = async (connectionId: string) => {
    try {
      const { error } = await supabase
        .from('connections')
        .delete()
        .eq('id', connectionId);

      if (error) throw error;

      toast.success('Connection request declined');
      fetchPendingRequests();
    } catch (error) {
      console.error('Error declining connection:', error);
      toast.error('Failed to decline connection request');
    }
  };

  const handleMessage = (profileId: string) => {
    // TODO: Navigate to messages page or open chat interface
    console.log('Opening chat with profile:', profileId);
    toast.info('Messaging feature coming soon!');
  };

  const handleProfileClick = (profileId: string) => {
    navigate(`/user/${profileId}`);
  };

  const ProfileCard = ({ profile }: { profile: NetworkProfile }) => (
    <Card className="hover:shadow-lg transition-all duration-200 border-slate-200">
      <CardHeader className="pb-3 cursor-pointer" onClick={() => handleProfileClick(profile.id)}>
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
                    disabled={discoverLoading}
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
                {profile.connectionStatus === 'pending' && activeTab === 'requests' && (
                  <>
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => {
                        const request = pendingRequests.find(r => r.profiles?.id === profile.id);
                        if (request) handleAcceptRequest(request.id);
                      }}
                    >
                      Accept
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        const request = pendingRequests.find(r => r.profiles?.id === profile.id);
                        if (request) handleDeclineRequest(request.id);
                      }}
                    >
                      Decline
                    </Button>
                  </>
                )}
                {profile.connectionStatus === 'pending' && activeTab !== 'requests' && (
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
          <TabsList className="grid grid-cols-8 w-fit">
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
            <TabsTrigger value="skill-swap" className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              <span className="hidden sm:inline">Skill Swap</span>
            </TabsTrigger>
            <TabsTrigger value="eventless" className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              <span className="hidden sm:inline">Video Intros</span>
            </TabsTrigger>
            <TabsTrigger value="proof" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Verified</span>
            </TabsTrigger>
            <TabsTrigger value="interests" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              <span className="hidden sm:inline">Communities</span>
            </TabsTrigger>
          </TabsList>

            {/* Global Search Bar */}
            <div className="flex items-center gap-2">
              <div className="w-64">
                <GlobalSearch placeholder="Search posts, people, hashtags..." />
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
                    <div className="text-2xl font-bold text-primary">{discoverProfiles.length}</div>
                    <div className="text-sm text-slate-600">Professionals Found</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{connections.length}</div>
                    <div className="text-sm text-slate-600">Connections</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">{pendingRequests.length}</div>
                    <div className="text-sm text-slate-600">Pending</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.online}</div>
                    <div className="text-sm text-slate-600">Online Now</div>
                  </CardContent>
                </Card>
              </div>

              {discoverLoading ? (
                <div className="text-center py-12">
                   <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                   <p className="text-slate-600">Loading professionals...</p>
                 </div>
               ) : (
                 <>
                   {/* Infinite Scroll Enhanced Feed */}
                   <div className="space-y-6">
                     <div className={`grid gap-4 ${
                       viewMode === 'grid' 
                         ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                         : 'grid-cols-1'
                     }`}>
                       {getFilteredProfiles(discoverProfiles).map(profile => (
                         <ProfileCard key={profile.id} profile={profile} />
                       ))}
                     </div>

                     {/* Load More Button with Plus Icon */}
                     {getFilteredProfiles(discoverProfiles).length > 0 && (
                       <div className="text-center py-6">
                         <Button 
                           variant="outline" 
                           onClick={() => refetch()}
                           className="flex items-center gap-2"
                         >
                           <UserPlus className="w-4 h-4" />
                           Load More Professionals
                         </Button>
                       </div>
                     )}
                   </div>

                   {getFilteredProfiles(discoverProfiles).length === 0 && (
                     <div className="text-center py-12">
                       <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                       <h3 className="text-lg font-semibold text-slate-900 mb-2">No professionals found</h3>
                       <p className="text-slate-600">Try adjusting your search criteria or check back later</p>
                     </div>
                   )}
                 </>
               )}
            </div>
          </TabsContent>

          <TabsContent value="connections">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Your Professional Network</CardTitle>
                  <CardDescription>
                    You have {connections.length} professional connections
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {connections.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">No connections yet</h3>
                      <p className="text-slate-600">Start building your network by connecting with professionals</p>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {getFilteredProfiles(connectedProfiles).map(profile => (
                        <ProfileCard key={profile.id} profile={profile} />
                      ))}
                    </div>
                  )}
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
                    You have {pendingRequests.length} pending connection requests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {pendingRequests.length === 0 ? (
                    <div className="text-center py-12">
                      <UserPlus className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">No pending requests</h3>
                      <p className="text-slate-600">You'll see connection requests here when people want to connect with you</p>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {getFilteredProfiles(pendingProfiles).map(profile => (
                        <ProfileCard key={profile.id} profile={profile} />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="messages">
            <Card className="text-center py-12">
              <CardContent>
                <MessageCircle className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Messages Coming Soon</h3>
                <p className="text-slate-600">Direct messaging feature will be available soon.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="skill-swap">
            <SkillSwapNetwork />
          </TabsContent>

          <TabsContent value="eventless">
            <EventlessNetworking />
          </TabsContent>

          <TabsContent value="proof">
            <NetworkingWithProof />
          </TabsContent>

          <TabsContent value="interests">
            <InterestFirstNetwork />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default NetworkPage;