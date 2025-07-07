
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  MoreHorizontal, 
  MessageCircle, 
  Sparkles, 
  Users, 
  Calendar, 
  Bell, 
  Eye, 
  MapPin, 
  Briefcase, 
  ExternalLink, 
  Camera, 
  FileText,
  Home,
  User,
  Compass,
  Bookmark,
  Hash,
  GraduationCap,
  Settings,
  Edit,
  Shield,
  Search,
  Building,
  Bot,
  Mail,
  UserCheck,
  Image,
  BarChart3
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PostActions } from "@/components/posts/PostActions";
import { CommentsSection } from "@/components/posts/CommentsSection";
import { CreatePost } from "@/components/posts/CreatePost";
import { CareerIntentBadge } from "@/components/posts/CareerIntentTags";
import { LinkPreview } from "@/components/shared/LinkPreview";
import { ProfileCompletionPrompt } from "@/components/profile/ProfileCompletionPrompt";
import { ProfileBanner } from "@/components/profile/ProfileBanner";
import { AIPostAssistant } from "@/components/network/AIPostAssistant";
import { ConnectionRequests } from "@/components/network/ConnectionRequests";
import { SmartConnectAI } from "@/components/network/SmartConnectAI";
import { CompanyNetworkActivity } from "@/components/network/CompanyNetworkActivity";
import { useRealtimeConnections } from "@/hooks/useRealtimeConnections";
import { useRealtimeActivity } from "@/hooks/useRealtimeActivity";
import { useNetworkRealtime, useAutoRefreshPosts } from "@/hooks/useRealtimeData";
import FloatingMessenger from "@/components/network/FloatingMessenger";
import { Link } from 'react-router-dom';

const Posts = () => {
  const [openComments, setOpenComments] = useState<string | null>(null);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [feedFilter, setFeedFilter] = useState<'all' | 'smart'>('all');
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

  // Fetch posts with real-time counts
  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ['posts', feedFilter],
    queryFn: async () => {
      // First get posts with fresh counts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          post_likes!left(id),
          post_comments!left(id),
          post_shares!left(id)
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (postsError) throw postsError;

      // Get unique author IDs
      const authorIds = [...new Set(postsData.map(post => post.author_id).filter(Boolean))];

      // Get profiles for all authors
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, profile_picture_url, title')
        .in('id', authorIds);

      if (profilesError) throw profilesError;

      // Create a map of profiles by ID for easy lookup
      const profilesMap = new Map(profilesData.map(profile => [profile.id, profile]));

      // Combine posts with their profiles and accurate counts
      let postsWithProfiles = postsData.map(post => ({
        ...post,
        profiles: profilesMap.get(post.author_id) || null,
        // Use actual counts from related tables
        likes_count: post.post_likes?.length || 0,
        comments_count: post.post_comments?.length || 0,
        shares_count: post.post_shares?.length || 0
      }));

      // Apply Smart Feed filtering
      if (feedFilter === 'smart' && currentUserProfile) {
        const userInterests = currentUserProfile.career_interests || [];
        const userGoals = currentUserProfile.career_goals || [];
        const userStage = currentUserProfile.career_stage || 'early_career';
        
        // Filter posts based on user's career interests and intent tags
        postsWithProfiles = postsWithProfiles.filter(post => {
          if (!post.intent_tags || post.intent_tags.length === 0) return true;
          
          // Match based on career stage
          if (userStage === 'early_career' && post.intent_tags.includes('mentoring')) return true;
          if (userStage === 'mid_career' && post.intent_tags.includes('networking')) return true;
          if (userStage === 'senior_career' && post.intent_tags.includes('showcasing')) return true;
          
          // Match based on interests and goals
          const hasMatchingIntent = post.intent_tags.some(tag => 
            userInterests.includes(tag) || userGoals.includes(tag)
          );
          
          return hasMatchingIntent;
        });
      }

      return postsWithProfiles;
    }
  });

  const handlePostCreate = (post: any) => {
    queryClient.invalidateQueries({ queryKey: ['posts'] });
  };

  // Function to detect URLs in text
  const extractUrls = (text: string): string[] => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.match(urlRegex) || [];
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
    <div className="min-h-screen bg-muted/20">
      {/* Hero Banner */}
      <div className="w-full bg-gradient-to-r from-primary via-primary/90 to-blue-600 text-primary-foreground">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Talentxcel Pro Network</h1>
            <p className="text-lg md:text-xl opacity-90 max-w-2xl">
              Connect with professionals, share insights, and grow your career
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto">
          {/* Left Sidebar */}
          <div className="lg:col-span-3">
            <div className="space-y-4">
              {/* Navigation Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Your Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  <Link to="/network/posts" className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 text-primary transition-colors">
                    <Home className="h-4 w-4" />
                    <span className="text-sm font-medium">Feed</span>
                  </Link>
                  <Link to="/network/people" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">My Network</span>
                  </Link>
                  <Link to="/jobs" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Jobs</span>
                  </Link>
                  <Link to="/network/messages" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <MessageCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Messaging</span>
                  </Link>
                  <Link to="/network/notifications" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Notifications</span>
                  </Link>
                </CardContent>
              </Card>

              {/* Discover Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Compass className="h-5 w-5 text-primary" />
                    Discover
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                    <Bookmark className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Saved Items</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Hashtags</span>
                  </div>
                  <Link to="/network/events" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Events</span>
                  </Link>
                  <Link to="/learning" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Courses</span>
                  </Link>
                </CardContent>
              </Card>

              {/* Settings Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-primary" />
                    Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  <Link to="/profile/edit" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <Edit className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Edit Profile</span>
                  </Link>
                  <Link to="/profile/analytics" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Edit Views</span>
                  </Link>
                  <Link to="/profile/settings" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Privacy</span>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-6">
            <div className="space-y-6">
              {/* Create Post */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={currentUserProfile?.profile_picture_url} />
                      <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                        {generateInitials(currentUserProfile)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 bg-muted/50 rounded-full px-4 py-3 cursor-pointer hover:bg-muted/70 transition-colors">
                      <span className="text-muted-foreground">What's on your mind?</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-around border-t pt-4">
                    <Button variant="ghost" className="flex items-center gap-2 text-green-600 hover:text-green-700 hover:bg-green-50">
                      <Image className="h-5 w-5" />
                      <span>Photo</span>
                    </Button>
                    <Button variant="ghost" className="flex items-center gap-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50">
                      <Calendar className="h-5 w-5" />
                      <span>Event</span>
                    </Button>
                    <Button variant="ghost" className="flex items-center gap-2 text-primary hover:bg-primary/10">
                      <Briefcase className="h-5 w-5" />
                      <span>Job</span>
                    </Button>
                    <Button variant="ghost" className="flex items-center gap-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50">
                      <BarChart3 className="h-5 w-5" />
                      <span>Poll</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* AI Assistant */}
              {showAIAssistant && (
                <AIPostAssistant
                  onSuggestionApply={(suggestion) => {
                    console.log('AI Suggestion:', suggestion);
                  }}
                  currentContent=""
                />
              )}

              {/* Posts Feed */}
              <div className="space-y-4">
                {postsLoading ? (
                  [...Array(3)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-3">
                          <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                            <div className="h-3 bg-gray-300 rounded w-1/6"></div>
                            <div className="space-y-2 mt-4">
                              <div className="h-4 bg-gray-300 rounded"></div>
                              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  posts?.map((post) => (
                    <Card key={post.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        {/* Post Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start space-x-3">
                            <Link to={`/network/people/${post.author_id}`} className="block hover:scale-105 transition-transform">
                              <Avatar className="cursor-pointer">
                                <AvatarImage src={post.profiles?.profile_picture_url} />
                                <AvatarFallback className="bg-primary text-primary-foreground">
                                  {generateInitials(post.profiles)}
                                </AvatarFallback>
                              </Avatar>
                            </Link>
                            <div>
                              <Link 
                                to={`/network/people/${post.author_id}`} 
                                className="hover:text-primary transition-colors cursor-pointer"
                              >
                                <h3 className="font-semibold text-foreground">
                                  {formatDisplayName(post.profiles)}
                                </h3>
                              </Link>
                              <p className="text-sm text-muted-foreground">
                                {post.profiles?.title || 'Professional'}
                              </p>
                              <p className="text-xs text-muted-foreground">{formatTimeAgo(post.created_at)}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Post Content */}
                        <div className="mb-4">
                          <p className="text-foreground whitespace-pre-wrap">{post.content}</p>
                          
                          {/* Career Intent Tags */}
                          {post.intent_tags && post.intent_tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {post.intent_tags.map((intentId: string) => (
                                <CareerIntentBadge key={intentId} intentId={intentId} />
                              ))}
                            </div>
                          )}
                          
                          {/* URL Previews */}
                          {(() => {
                            const urls = extractUrls(post.content);
                            return urls.length > 0 && (
                              <div className="mt-4 space-y-3">
                                {urls.slice(0, 2).map((url, index) => (
                                  <LinkPreview key={index} url={url} />
                                ))}
                              </div>
                            );
                          })()}
                          
                          {/* Post Media */}
                          {post.media_urls && post.media_urls.length > 0 && (
                            <div className="mt-4 grid gap-2" style={{
                              gridTemplateColumns: post.media_urls.length === 1 ? '1fr' : 
                                                 post.media_urls.length === 2 ? '1fr 1fr' :
                                                 post.media_urls.length === 3 ? '1fr 1fr 1fr' :
                                                 '1fr 1fr'
                            }}>
                              {post.media_urls.slice(0, 4).map((url: string, index: number) => {
                                const isVideo = url.includes('.mp4') || url.includes('.webm') || url.includes('.ogg') || url.includes('video');
                                const isDocument = url.includes('.pdf') || url.includes('.doc') || url.includes('document');
                                
                                return (
                                  <div key={index} className="relative">
                                    {isVideo ? (
                                      <video 
                                        src={url}
                                        className="w-full h-64 object-cover rounded-lg"
                                        controls
                                      />
                                    ) : isDocument ? (
                                      <div className="flex items-center justify-center h-32 bg-muted rounded-lg">
                                        <div className="text-center">
                                          <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                          <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">
                                            View Document
                                          </a>
                                        </div>
                                      </div>
                                    ) : (
                                      <img 
                                        src={url}
                                        alt={`Post media ${index + 1}`}
                                        className="w-full h-64 object-cover rounded-lg"
                                      />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Post Actions */}
                        <PostActions
                          postId={post.id}
                          initialLikes={post.likes_count || 0}
                          initialComments={post.comments_count || 0}
                          initialShares={post.shares_count || 0}
                          onCommentClick={() => setOpenComments(openComments === post.id ? null : post.id)}
                        />

                        {/* Comments Section */}
                        <CommentsSection
                          postId={post.id}
                          isOpen={openComments === post.id}
                        />
                      </CardContent>
                    </Card>
                  ))
                )}
                
                {posts && posts.length === 0 && !postsLoading && (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <div className="text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-medium mb-2">No posts yet</h3>
                        <p>Be the first to share something with your network!</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-3">
            <div className="space-y-4">
              {/* Connection Requests */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5" />
                    Connection Requests
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-8 text-muted-foreground">
                    <UserCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No pending requests</p>
                  </div>
                </CardContent>
              </Card>

              {/* Network Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>Network Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-primary/5 rounded-lg hover:bg-primary/10 transition-all hover:-translate-y-1 cursor-pointer">
                      <div className="text-2xl font-bold text-primary mb-1">{stats?.connections || 0}</div>
                      <div className="text-sm text-muted-foreground">Connections</div>
                    </div>
                    <div className="text-center p-4 bg-secondary/5 rounded-lg hover:bg-secondary/10 transition-all hover:-translate-y-1 cursor-pointer">
                      <div className="text-2xl font-bold text-secondary mb-1">0</div>
                      <div className="text-sm text-muted-foreground">Messages</div>
                    </div>
                    <div className="text-center p-4 bg-green-500/5 rounded-lg hover:bg-green-500/10 transition-all hover:-translate-y-1 cursor-pointer">
                      <div className="text-2xl font-bold text-green-600 mb-1">0</div>
                      <div className="text-sm text-muted-foreground">Events</div>
                    </div>
                    <div className="text-center p-4 bg-purple-500/5 rounded-lg hover:bg-purple-500/10 transition-all hover:-translate-y-1 cursor-pointer">
                      <div className="text-2xl font-bold text-purple-600 mb-1">{stats?.profileViews || 161}</div>
                      <div className="text-sm text-muted-foreground">Profile Views</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Link to="/network/people" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <Search className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Find People</span>
                    </Link>
                    <Link to="/network/events" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Upcoming Events</span>
                    </Link>
                    <Link to="/network/messages" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Messages</span>
                    </Link>
                    <Link to="/companies" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Companies | Follow</span>
                    </Link>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start"
                      onClick={() => setShowAIAssistant(!showAIAssistant)}
                    >
                      <Bot className="h-4 w-4 text-muted-foreground mr-3" />
                      <span className="text-sm">AI Assistant</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Talentxcel Link */}
              <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-primary">
                <CardContent className="p-6 text-center">
                  <a 
                    href="https://talentxcel.in" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block font-semibold hover:opacity-90 transition-opacity"
                  >
                    Visit talentxcel.in for more information
                  </a>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating Messenger */}
      <FloatingMessenger />
    </div>
  );
};

export default Posts;
