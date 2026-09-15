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
import { ChatrNetworkBanner } from '@/components/network/ChatrNetworkBanner';

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
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  
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
    <div 
      className="glass-card group relative overflow-hidden border border-primary/20 hover:border-primary/50 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
      onMouseEnter={() => setHoveredCard(profile.id)}
      onMouseLeave={() => setHoveredCard(null)}
      onClick={() => handleProfileClick(profile.id)}
    >
      {/* Animated gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-ai-violet/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
      
      {/* Accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-ai-violet to-accent"></div>
      
      <div className="relative z-10 p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="relative">
              <Avatar className="w-14 h-14 border-2 border-primary/30 ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                <AvatarImage src={profile.avatar} alt={profile.name} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-ai-violet text-white font-bold">
                  {profile.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              {profile.isOnline && (
                <div className="absolute -bottom-1 -right-1 flex items-center justify-center">
                  <div className="absolute w-5 h-5 bg-success rounded-full animate-ping opacity-75"></div>
                  <div className="relative w-5 h-5 bg-success border-2 border-background rounded-full"></div>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-foreground truncate group-hover:text-primary transition-colors">{profile.name}</h3>
              <p className="text-sm text-muted-foreground font-medium truncate">{profile.title}</p>
              <p className="text-xs text-muted-foreground/80 truncate flex items-center gap-1 mt-1">
                <Building className="w-3 h-3" />
                {profile.company}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            {profile.connectionStatus === 'connected' && (
              <Badge className="bg-gradient-to-r from-success to-success/80 text-white border-0 text-xs font-semibold">
                Connected
              </Badge>
            )}
            {profile.connectionStatus === 'pending' && (
              <Badge className="bg-gradient-to-r from-warning to-warning/80 text-white border-0 text-xs font-semibold">
                Pending
              </Badge>
            )}
            <span className="text-[10px] text-muted-foreground font-medium">{profile.lastActive}</span>
          </div>
        </div>
      
        
        <div className="space-y-3">
          {/* Location and Experience */}
          <div className="flex items-center gap-3 text-[11px] font-medium">
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="w-3 h-3 text-primary" />
              {profile.location}
            </div>
            <div className="w-px h-3 bg-border"></div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Briefcase className="w-3 h-3 text-ai-violet" />
              {profile.experience}
            </div>
          </div>

          {/* Skills - Edgy badges */}
          <div className="flex flex-wrap gap-1.5">
            {profile.skills.slice(0, 3).map((skill, idx) => (
              <Badge 
                key={skill} 
                className={`text-[10px] font-semibold border-0 ${
                  idx === 0 ? 'bg-primary/20 text-primary' :
                  idx === 1 ? 'bg-ai-violet/20 text-ai-violet' :
                  'bg-accent/20 text-accent'
                }`}
              >
                {skill}
              </Badge>
            ))}
            {profile.skills.length > 3 && (
              <Badge className="text-[10px] font-semibold bg-muted text-muted-foreground border-0">
                +{profile.skills.length - 3}
              </Badge>
            )}
          </div>

          {/* Mutual Connections */}
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
            <Users className="w-3.5 h-3.5 text-primary" />
            <span className="font-semibold text-foreground">{profile.mutualConnections}</span> mutual
          </div>

          {/* Action Buttons - Edgy design */}
          <div className="flex gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
            {profile.connectionStatus === 'none' && (
              <Button 
                size="sm" 
                className="flex-1 bg-gradient-to-r from-primary to-ai-violet hover:from-primary/90 hover:to-ai-violet/90 text-white font-semibold shadow-lg shadow-primary/30 transition-all hover:scale-105" 
                onClick={(e) => { e.stopPropagation(); handleConnect(profile.id); }}
                disabled={discoverLoading}
              >
                <UserPlus className="w-4 h-4 mr-1.5" />
                Connect
              </Button>
            )}
            {profile.connectionStatus === 'connected' && (
              <>
                <Button 
                  size="sm" 
                  className="flex-1 glass-button border-primary/30 hover:border-primary hover:scale-105 transition-all font-semibold"
                  onClick={(e) => { e.stopPropagation(); handleMessage(profile.id); }}
                >
                  <MessageCircle className="w-4 h-4 mr-1.5" />
                  Message
                </Button>
                <Button 
                  size="sm" 
                  className="glass-button border-ai-violet/30 hover:border-ai-violet hover:scale-110 transition-all"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Phone className="w-4 h-4" />
                </Button>
              </>
            )}
            {profile.connectionStatus === 'pending' && activeTab === 'requests' && (
              <>
                <Button 
                  size="sm" 
                  className="flex-1 bg-gradient-to-r from-success to-success/80 hover:from-success/90 hover:to-success/70 text-white font-semibold shadow-lg shadow-success/30"
                  onClick={(e) => {
                    e.stopPropagation();
                    const request = pendingRequests.find(r => r.profiles?.id === profile.id);
                    if (request) handleAcceptRequest(request.id);
                  }}
                >
                  Accept
                </Button>
                <Button 
                  size="sm" 
                  className="glass-button border-destructive/30 hover:border-destructive font-semibold"
                  onClick={(e) => {
                    e.stopPropagation();
                    const request = pendingRequests.find(r => r.profiles?.id === profile.id);
                    if (request) handleDeclineRequest(request.id);
                  }}
                >
                  Decline
                </Button>
              </>
            )}
            {profile.connectionStatus === 'pending' && activeTab !== 'requests' && (
              <Button size="sm" className="flex-1 glass-button border-warning/30 font-semibold" disabled>
                <Clock className="w-4 h-4 mr-1.5" />
                Pending
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-ai-violet/10 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float"></div>
        <div className="absolute top-1/2 -right-4 w-96 h-96 bg-ai-violet/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute -bottom-8 left-1/3 w-96 h-96 bg-accent/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Edgy Header */}
      <div className="glass-navbar border-b border-white/10 sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-1 h-12 bg-gradient-to-b from-primary via-ai-violet to-accent rounded-full animate-glow-pulse"></div>
                <div>
                  <h1 className="text-4xl font-black bg-gradient-to-r from-primary via-ai-violet to-accent bg-clip-text text-transparent">
                    Network
                  </h1>
                  <p className="text-muted-foreground font-medium">Level up your professional circle</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 animate-fade-in delay-100">
              <Button 
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="glass-button hover:scale-105 transition-transform"
              >
                <Grid className="w-5 h-5" />
              </Button>
              <Button 
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="glass-button hover:scale-105 transition-transform"
              >
                <List className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Edgy Tab Navigation */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-8 animate-fade-in-up">
            <TabsList className="glass-card p-2 grid grid-cols-4 lg:grid-cols-8 w-full lg:w-fit gap-1 border border-primary/20">
              <TabsTrigger 
                value="discover" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-ai-violet data-[state=active]:text-white font-semibold transition-all"
              >
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">Discover</span>
              </TabsTrigger>
              <TabsTrigger 
                value="connections" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-ai-violet data-[state=active]:text-white font-semibold transition-all"
              >
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Network</span>
              </TabsTrigger>
              <TabsTrigger 
                value="requests" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-ai-violet data-[state=active]:text-white font-semibold transition-all"
              >
                <UserPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Requests</span>
              </TabsTrigger>
              <TabsTrigger 
                value="messages" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-ai-violet data-[state=active]:text-white font-semibold transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Messages</span>
              </TabsTrigger>
              <TabsTrigger 
                value="skill-swap" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-ai-violet data-[state=active]:text-white font-semibold transition-all"
              >
                <Award className="w-4 h-4" />
                <span className="hidden sm:inline">Skills</span>
              </TabsTrigger>
              <TabsTrigger 
                value="eventless" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-ai-violet data-[state=active]:text-white font-semibold transition-all"
              >
                <Video className="w-4 h-4" />
                <span className="hidden sm:inline">Video</span>
              </TabsTrigger>
              <TabsTrigger 
                value="proof" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-ai-violet data-[state=active]:text-white font-semibold transition-all"
              >
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Verified</span>
              </TabsTrigger>
              <TabsTrigger 
                value="interests" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-ai-violet data-[state=active]:text-white font-semibold transition-all"
              >
                <Star className="w-4 h-4" />
                <span className="hidden sm:inline">Communities</span>
              </TabsTrigger>
            </TabsList>

            {/* Edgy Search Bar */}
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <div className="flex-1 lg:w-72">
                <GlobalSearch placeholder="Search network..." />
              </div>
              <Button 
                variant="outline" 
                size="icon" 
                className="glass-button hover:scale-110 transition-all border-primary/30 hover:border-primary"
              >
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* CHATR Promotion Banner */}
          <ChatrNetworkBanner />

          {/* Tab Content */}
          <TabsContent value="discover">
            <div className="space-y-6">
              {/* Edgy Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger-children">
                <div className="glass-card p-6 border border-primary/30 hover:border-primary transition-all hover:scale-105 group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10">
                    <div className="text-3xl font-black bg-gradient-to-r from-primary to-ai-violet bg-clip-text text-transparent mb-1">
                      {discoverProfiles.length}
                    </div>
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Professionals</div>
                  </div>
                </div>
                <div className="glass-card p-6 border border-success/30 hover:border-success transition-all hover:scale-105 group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-success/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10">
                    <div className="text-3xl font-black text-success mb-1">
                      {connections.length}
                    </div>
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Connected</div>
                  </div>
                </div>
                <div className="glass-card p-6 border border-warning/30 hover:border-warning transition-all hover:scale-105 group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-warning/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10">
                    <div className="text-3xl font-black text-warning mb-1">
                      {pendingRequests.length}
                    </div>
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pending</div>
                  </div>
                </div>
                <div className="glass-card p-6 border border-accent/30 hover:border-accent transition-all hover:scale-105 group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10">
                    <div className="text-3xl font-black text-accent mb-1 flex items-center gap-2">
                      {stats.online}
                      <span className="w-2 h-2 bg-success rounded-full animate-pulse"></span>
                    </div>
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Online Now</div>
                  </div>
                </div>
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