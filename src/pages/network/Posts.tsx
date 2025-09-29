import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, MessageCircle, Sparkles, Users, Calendar, Bell, Eye, MapPin, Briefcase, ExternalLink, Camera, FileText, Share2, Settings, Search, Video, Shield, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PostActions } from "@/components/posts/PostActions";
import { CommentsSection } from "@/components/posts/CommentsSection";
import { EnhancedCreatePost } from "@/components/posts/EnhancedCreatePost";
import { TestPostButton } from "@/components/TestPostButton";
import { DirectPostCreator } from "@/components/DirectPostCreator";
import { CareerIntentBadge } from "@/components/posts/CareerIntentTags";
import LinkPreview from "@/components/shared/LinkPreview";
import { ProfileCompletionPrompt } from "@/components/profile/ProfileCompletionPrompt";
import { LinkedInStyleBanner } from "@/components/profile/LinkedInStyleBanner";
import { NetworkStats } from "@/components/network/NetworkStats";
import { AIPostAssistant } from "@/components/network/AIPostAssistant";
import { ConnectionRequests } from "@/components/network/ConnectionRequests";
import { SmartConnectAI } from "@/components/network/SmartConnectAI";
import { CompanyNetworkActivity } from "@/components/network/CompanyNetworkActivity";
import { OptimizedConnectionSuggestions } from "@/components/performance/OptimizedConnectionSuggestions";
import { LiveNotificationSystem } from "@/components/realtime/LiveNotificationSystem";
import { AdvertisingSidebar } from "@/components/network/AdvertisingSidebar";
import { useRealtimeConnections } from "@/hooks/useRealtimeConnections";
import { useRealtimeActivity } from "@/hooks/useRealtimeActivity";
import { useNetworkRealtime, useAutoRefreshPosts } from "@/hooks/useRealtimeData";
import { useProfileStats } from "@/hooks/useProfileStats";
import FloatingMessenger from "@/components/network/FloatingMessenger";
import ModernMessenger from "@/components/network/ModernMessenger";
import { Link } from 'react-router-dom';
import { AICommentGenerator } from "@/components/network/AICommentGenerator";
import MediaPreview from "@/components/posts/MediaPreview";
import ProBanner from "@/components/network/ProBanner";
import ProBadge from "@/components/network/ProBadge";
import ProPostCTA from "@/components/network/ProPostCTA";
import { useEmployerAccess } from "@/hooks/useEmployerAccess";
import { useSmartFeedPreferences } from "@/hooks/useSmartFeedPreferences";
import { EnhancedNetworkPostsFeed } from "@/components/network/EnhancedNetworkPostsFeed";
import { GlobalSearch } from "@/components/ui/global-search";
import { TrendingHashtags } from "@/components/network/TrendingHashtags";


const Posts = ({ 
  feedType = 'all', 
  optimizedPosts, 
  loading: externalLoading, 
  error: externalError 
}: { 
  feedType?: 'all' | 'connections' | 'trending';
  optimizedPosts?: any[];
  loading?: boolean;
  error?: string | Error | null;
}) => {
  const [openComments, setOpenComments] = useState<string | null>(null);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const feedFilter = feedType; // Use the prop instead of state
  const [showCommentGenerator, setShowCommentGenerator] = useState<string | null>(null);
  const [activePost, setActivePost] = useState<any>(null);
  const [dismissedBanners, setDismissedBanners] = useState<string[]>([]);
  const [showModernMessenger, setShowModernMessenger] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  // Auto-refresh with realtime updates
  const { lastRefresh } = useAutoRefreshPosts();
  const { isConnected } = useNetworkRealtime(
    (payload) => {
      console.log('Post updated:', payload);
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    (payload) => {
      console.log('Connection updated:', payload);
      queryClient.invalidateQueries({ queryKey: ['connections'] });
    }
  );

  // Use real-time hooks
  const { connections, stats, isLoading: connectionsLoading } = useRealtimeConnections();
  const { recentActivity, isLoading: activityLoading } = useRealtimeActivity();
  const { hasEmployerAccess } = useEmployerAccess();
  const { preferences: smartFeedPreferences } = useSmartFeedPreferences();

  // Get current user profile first for Smart Feed filtering
  const { data: currentUserProfile } = useQuery({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    }
  });

  // Check if user is Pro
  const isProUser = currentUserProfile?.pro_status === 'active' && 
                   currentUserProfile?.pro_expires_at && 
                   new Date(currentUserProfile.pro_expires_at) > new Date();

  // Get real profile stats after currentUserProfile is available
  const { data: profileStats } = useProfileStats(currentUserProfile?.id);

  const handlePostCreate = (post: any) => {
    queryClient.invalidateQueries({ queryKey: ['posts'] });
  };

  const handleCommentGeneration = (postId: string, post: any) => {
    setActivePost(post);
    setShowCommentGenerator(postId);
  };

  const handleCommentPost = async (comment: string) => {
    if (!activePost) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('post_comments')
        .insert({
          post_id: activePost.id,
          user_id: user?.id,
          content: comment
        });

      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setShowCommentGenerator(null);
      setActivePost(null);
      
    } catch (error) {
      console.error('Failed to post comment:', error);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const formatDisplayName = (profile: any) => {
    if (profile?.full_name && profile.full_name.trim()) {
      return profile.full_name;
    }
    return 'Professional User';
  };

  const generateInitials = (profile: any) => {
    const displayName = formatDisplayName(profile);
    if (displayName === 'Professional User') return 'PU';
    
    const names = displayName.split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
  };

  // Check if profile needs completion
  const getMissingProfileFields = (profile: any) => {
    const missingFields = [];
    if (!profile?.full_name || !profile.full_name.trim()) missingFields.push('name');
    if (!profile?.profile_picture_url) missingFields.push('profile picture');
    if (!profile?.title) missingFields.push('job title');
    return missingFields;
  };

  const missingFields = currentUserProfile ? getMissingProfileFields(currentUserProfile) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/80 font-system text-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        {/* Feed Content */}

        {/* Three Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Profile Information */}
          <div className="lg:col-span-3 space-y-6">
            {/* LinkedIn Style Profile Banner */}
            <LinkedInStyleBanner
              profile={currentUserProfile}
              isOwnProfile={true}
              stats={{
                connections: profileStats?.connections || 0,
                profileViews: profileStats?.profileViews || 0
              }}
            />
            
            {/* Navigation Menu */}
            <Card className="bg-white/95 backdrop-blur-md border border-gray-200/60 shadow-xl rounded-2xl overflow-hidden">
              <div className="p-4 space-y-1">
                <h3 className="font-bold text-gray-900 text-sm mb-3 px-2 tracking-tight">Navigation</h3>
                <Link to="/network/verified" className="block">
                  <Button variant="ghost" size="sm" className="w-full justify-start h-9 text-xs text-gray-800 hover:text-gray-900 hover:bg-gray-100/80 font-medium rounded-xl transition-all duration-200">
                    <Shield className="h-3.5 w-3.5 mr-3" />
                    Verified
                  </Button>
                </Link>
                <Link to="/network/connections" className="block">
                  <Button variant="ghost" size="sm" className="w-full justify-start h-9 text-xs text-gray-800 hover:text-gray-900 hover:bg-gray-100/80 font-medium rounded-xl transition-all duration-200">
                    <Users className="h-3.5 w-3.5 mr-3" />
                    My Network
                  </Button>
                </Link>
                <Link to="/network/skill-swap" className="block">
                  <Button variant="ghost" size="sm" className="w-full justify-start h-9 text-xs text-gray-800 hover:text-gray-900 hover:bg-gray-100/80 font-medium rounded-xl transition-all duration-200">
                    <ArrowUpDown className="h-3.5 w-3.5 mr-3" />
                    Skill Swap
                  </Button>
                </Link>
                <Link to="/network/communities" className="block">
                  <Button variant="ghost" size="sm" className="w-full justify-start h-9 text-xs text-gray-800 hover:text-gray-900 hover:bg-gray-100/80 font-medium rounded-xl transition-all duration-200">
                    <Users className="h-3.5 w-3.5 mr-3" />
                    Communities
                  </Button>
                </Link>
                <Link to="/dashboard" className="block">
                  <Button variant="ghost" size="sm" className="w-full justify-start h-9 text-xs text-gray-800 hover:text-gray-900 hover:bg-gray-100/80 font-medium rounded-xl transition-all duration-200">
                    <Sparkles className="h-3.5 w-3.5 mr-3" />
                    Dashboard
                  </Button>
                </Link>
                {hasEmployerAccess ? (
                  <Link to="/network/video-intros" className="block">
                    <Button variant="ghost" size="sm" className="w-full justify-start h-9 text-xs text-gray-800 hover:text-gray-900 hover:bg-gray-100/80 font-medium rounded-xl transition-all duration-200">
                      <Video className="h-3.5 w-3.5 mr-3" />
                      Video Intros
                    </Button>
                  </Link>
                ) : (
                  <Link to="/network/video-intros" className="block">
                    <Button variant="ghost" size="sm" className="w-full justify-start h-9 text-xs text-gray-800 hover:text-gray-900 hover:bg-gray-100/80 font-medium rounded-xl transition-all duration-200">
                      <Video className="h-3.5 w-3.5 mr-3" />
                      Video Intros
                    </Button>
                  </Link>
                )}
                <Link to="/network/notifications" className="block">
                  <Button variant="ghost" size="sm" className="w-full justify-start h-9 text-xs text-gray-800 hover:text-gray-900 hover:bg-gray-100/80 font-medium rounded-xl transition-all duration-200">
                    <Bell className="h-3.5 w-3.5 mr-3" />
                    Notifications
                  </Button>
                </Link>
              </div>
              
              <div className="space-y-1 mt-4 pt-3 border-t border-gray-200/60">
                <h3 className="font-bold text-gray-900 text-sm mb-3 px-2 tracking-tight">Discover</h3>
                <Link to="/career-map" className="block">
                  <Button variant="ghost" size="sm" className="w-full justify-start h-9 text-xs text-gray-800 hover:text-gray-900 hover:bg-gray-100/80 font-medium rounded-xl transition-all duration-200">
                    <MapPin className="h-3.5 w-3.5 mr-3" />
                    Career mapping
                  </Button>
                </Link>
                <Link to="/network/events" className="block">
                  <Button variant="ghost" size="sm" className="w-full justify-start h-9 text-xs text-gray-800 hover:text-gray-900 hover:bg-gray-100/80 font-medium rounded-xl transition-all duration-200">
                    <Calendar className="h-3.5 w-3.5 mr-3" />
                    Events
                  </Button>
                </Link>
                <Link to="/learning" className="block">
                  <Button variant="ghost" size="sm" className="w-full justify-start h-9 text-xs text-gray-800 hover:text-gray-900 hover:bg-gray-100/80 font-medium rounded-xl transition-all duration-200">
                    <span className="h-3.5 w-3.5 mr-3 text-sm">📚</span>
                    Courses
                  </Button>
                </Link>
              </div>
              
              <div className="space-y-1 mt-4 pt-3 border-t border-gray-200/60">
                <h3 className="font-bold text-gray-900 text-sm mb-3 px-2 tracking-tight">Settings</h3>
                <Link to="/profile/edit" className="block">
                  <Button variant="ghost" size="sm" className="w-full justify-start h-9 text-xs text-gray-800 hover:text-gray-900 hover:bg-gray-100/80 font-medium rounded-xl transition-all duration-200">
                    <span className="h-3.5 w-3.5 mr-3 text-sm">✏️</span>
                    Edit Profile
                  </Button>
                </Link>
                <Link to="/profile/analytics" className="block">
                  <Button variant="ghost" size="sm" className="w-full justify-start h-9 text-xs text-gray-800 hover:text-gray-900 hover:bg-gray-100/80 font-medium rounded-xl transition-all duration-200">
                    <Eye className="h-3.5 w-3.5 mr-3" />
                    Edit Views
                  </Button>
                </Link>
                <Link to="/profile/settings" className="block">
                  <Button variant="ghost" size="sm" className="w-full justify-start h-9 text-xs text-gray-800 hover:text-gray-900 hover:bg-gray-100/80 font-medium rounded-xl transition-all duration-200">
                    <span className="h-3.5 w-3.5 mr-3 text-sm">🔒</span>
                    Privacy
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Network Stats */}
            <NetworkStats
              stats={{
                connections: profileStats?.connections || 0,
                messages: 0,
                profileViews: profileStats?.profileViews || 0,
                events: 0
              }}
            />
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-6 space-y-6">
            {/* Profile Completion Prompt */}
            {missingFields.length > 0 && !isProUser && (
              <ProfileCompletionPrompt 
                missingFields={missingFields}
              />
            )}

            {/* Pro Banner */}
            {!isProUser && !dismissedBanners.includes('pro-upgrade') && (
              <ProBanner 
                variant="feed"
                onDismiss={() => setDismissedBanners(prev => [...prev, 'pro-upgrade'])}
              />
            )}

            {/* Global Search */}
            <div className="mb-4">
              <GlobalSearch 
                placeholder="Search posts, people, companies, jobs, hashtags..."
                className="w-full"
              />
            </div>

            {/* Create Post */}
            <div className="space-y-4">
              <EnhancedCreatePost onPostCreate={handlePostCreate} />
              <DirectPostCreator />
            </div>

{/* Enhanced Network Posts Feed with Real-time, Infinite Scroll */}
            <div className="space-y-6">
              <EnhancedNetworkPostsFeed feedType={feedFilter} searchTerm={searchTerm} />
            </div>
          </div>

          {/* Right Sidebar - Network Activity & Advertising */}
          <div className="lg:col-span-3 space-y-6">
            {/* Advertising Sidebar */}
            <AdvertisingSidebar maxAds={2} />
            
            {/* Connection Requests */}
            <ConnectionRequests />
            
            {/* Connection Suggestions */}
            <OptimizedConnectionSuggestions showVirtualized={true} />

            {/* Quick Actions */}
            <Card className="bg-white/95 backdrop-blur-md border border-gray-200/60 shadow-xl rounded-2xl overflow-hidden">
              <div className="p-4">
                <h3 className="font-bold text-gray-900 text-sm mb-4 tracking-tight">Quick Actions</h3>
                <div className="space-y-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-start h-9 text-xs text-gray-800 hover:text-gray-900 hover:bg-gray-100/80 font-medium rounded-xl transition-all duration-200"
                    onClick={() => setShowAIAssistant(!showAIAssistant)}
                  >
                    <Sparkles className="h-3.5 w-3.5 mr-3" />
                    AI Assistant
                  </Button>
                  <Link to="/network/people" className="block">
                    <Button variant="ghost" size="sm" className="w-full justify-start h-9 text-xs text-gray-800 hover:text-gray-900 hover:bg-gray-100/80 font-medium rounded-xl transition-all duration-200">
                      <Users className="h-3.5 w-3.5 mr-3" />
                      Find People
                    </Button>
                  </Link>
                  <Link to="/network/events" className="block">
                    <Button variant="ghost" size="sm" className="w-full justify-start h-9 text-xs text-gray-800 hover:text-gray-900 hover:bg-gray-100/80 font-medium rounded-xl transition-all duration-200">
                      <Calendar className="h-3.5 w-3.5 mr-3" />
                      Events
                    </Button>
                  </Link>
                  <Link to="/companies" className="block">
                    <Button variant="ghost" size="sm" className="w-full justify-start h-9 text-xs text-gray-800 hover:text-gray-900 hover:bg-gray-100/80 font-medium rounded-xl transition-all duration-200">
                      <Briefcase className="h-3.5 w-3.5 mr-3" />
                      Companies
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>

            {/* Network Stats */}
            <Card className="bg-white/95 backdrop-blur-md border border-gray-200/60 shadow-xl rounded-2xl overflow-hidden">
              <div className="p-4">
                <h3 className="font-bold text-gray-900 text-sm mb-4 tracking-tight">Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-700 font-medium">Posts Shared</span>
                    <span className="text-sm font-bold text-gray-900">12</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-700 font-medium">Comments</span>
                    <span className="text-sm font-bold text-gray-900">8</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-700 font-medium">Likes Given</span>
                    <span className="text-sm font-bold text-gray-900">24</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Recent Connections */}
            <Card className="bg-white/95 backdrop-blur-md border border-gray-200/60 shadow-xl rounded-2xl overflow-hidden">
              <div className="p-4">
                <h3 className="font-bold text-gray-900 text-sm mb-4 tracking-tight">Recent Connections</h3>
                <div className="space-y-3">
                  {connectionsLoading ? (
                    [...Array(2)].map((_, index) => (
                      <div key={index} className="flex items-center space-x-3 animate-pulse">
                        <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-3 bg-gray-300 rounded w-3/4 mb-1"></div>
                          <div className="h-2 bg-gray-300 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))
                  ) : connections && connections.length > 0 ? (
                    connections.slice(0, 2).map((connection, index) => (
                      <div key={`connection-${connection.id}-${index}`} className="flex items-center space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={connection.otherUser?.profile_picture_url} />
                          <AvatarFallback className="text-xs bg-gray-100 text-gray-800 font-medium">
                            {generateInitials(connection.otherUser)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-xs truncate text-gray-900">
                            {formatDisplayName(connection.otherUser)}
                          </p>
                          <p className="text-xs text-gray-600 truncate font-medium">
                            {connection.otherUser?.title || 'Professional'}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-600 text-center py-2 font-medium">No connections yet</p>
                  )}
                </div>
                <Link to="/network/people" className="block mt-3">
                  <Button variant="ghost" size="sm" className="w-full text-xs h-8 text-gray-800 hover:text-gray-900 hover:bg-gray-100/80 font-medium rounded-xl transition-all duration-200">
                    View All
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Recent Activity */}
            <Card className="p-3">
              <h3 className="font-semibold text-sm mb-3">Recent Activity</h3>
              <div className="space-y-2">
                {activityLoading ? (
                  [...Array(2)].map((_, index) => (
                    <div key={index} className="flex items-start space-x-2 animate-pulse">
                      <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-2 bg-gray-300 rounded w-full mb-1"></div>
                        <div className="h-2 bg-gray-300 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))
                ) : recentActivity && recentActivity.length > 0 ? (
                  recentActivity.slice(0, 3).map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={activity.avatar} />
                        <AvatarFallback className="text-xs">
                          {activity.user.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs">
                          <span className="font-medium">{activity.user}</span> {activity.action}
                        </p>
                        <p className="text-xs text-muted-foreground">{formatTimeAgo(activity.time)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-2">No recent activity</p>
                )}
              </div>
              <Link to="/network/notifications" className="block mt-2">
                <Button variant="ghost" size="sm" className="w-full text-xs h-7">
                  View All
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Floating Messenger */}
      <FloatingMessenger />
      <LiveNotificationSystem userId={currentUserProfile?.id} />
      
      {/* Modern Messenger */}
      <ModernMessenger 
        isOpen={showModernMessenger}
        onClose={() => setShowModernMessenger(false)}
      />
    </div>
  );
};

export default Posts;