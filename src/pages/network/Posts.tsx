
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, MessageCircle, Sparkles, Users, Calendar, Bell, Eye, MapPin, Briefcase, ExternalLink, Camera, FileText, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PostActions } from "@/components/posts/PostActions";
import { CommentsSection } from "@/components/posts/CommentsSection";
import { EnhancedCreatePost } from "@/components/posts/EnhancedCreatePost";
import { CareerIntentBadge } from "@/components/posts/CareerIntentTags";
import { LinkPreview } from "@/components/shared/LinkPreview";
import { ProfileCompletionPrompt } from "@/components/profile/ProfileCompletionPrompt";
import { LinkedInStyleBanner } from "@/components/profile/LinkedInStyleBanner";
import { NetworkStats } from "@/components/network/NetworkStats";
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Simplified Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant={feedFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFeedFilter('all')}
              >
                All Posts
              </Button>
              <Button
                variant={feedFilter === 'smart' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFeedFilter('smart')}
              >
                Smart Feed
              </Button>
            </div>
          </div>
        </div>


        {/* Three Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Sidebar - Profile Information */}
          <div className="lg:col-span-3 space-y-4">
            {/* LinkedIn Style Profile Banner */}
            <LinkedInStyleBanner
              profile={currentUserProfile}
              isOwnProfile={true}
              stats={{
                connections: stats?.connections || 14,
                profileViews: stats?.profileViews || 167
              }}
            />
            
            {/* Navigation Menu */}
            <Card className="p-3">
              <div className="space-y-1">
                <h3 className="font-semibold text-sm mb-2 px-2">Navigation</h3>
                <Link to="/network" className="block">
                  <Button variant="ghost" size="sm" className="w-full justify-start h-8 text-xs">
                    <MessageCircle className="h-3 w-3 mr-2" />
                    Feed
                  </Button>
                </Link>
                <Link to="/network/people" className="block">
                  <Button variant="ghost" size="sm" className="w-full justify-start h-8 text-xs">
                    <Users className="h-3 w-3 mr-2" />
                    My Network
                  </Button>
                </Link>
                <Link to="/jobs" className="block">
                  <Button variant="ghost" size="sm" className="w-full justify-start h-8 text-xs">
                    <Briefcase className="h-3 w-3 mr-2" />
                    Jobs
                  </Button>
                </Link>
                <Link to="/network/messages" className="block">
                  <Button variant="ghost" size="sm" className="w-full justify-start h-8 text-xs">
                    <MessageCircle className="h-3 w-3 mr-2" />
                    Messaging
                  </Button>
                </Link>
                <Link to="/network/notifications" className="block">
                  <Button variant="ghost" size="sm" className="w-full justify-start h-8 text-xs">
                    <Bell className="h-3 w-3 mr-2" />
                    Notifications
                  </Button>
                </Link>
              </div>
              
              <div className="space-y-1 mt-3">
                <h3 className="font-semibold text-sm mb-2 px-2">Discover</h3>
                <Link to="/career-map" className="block">
                  <Button variant="ghost" size="sm" className="w-full justify-start h-8 text-xs">
                    <MapPin className="h-3 w-3 mr-2" />
                    Career mapping
                  </Button>
                </Link>
                <Link to="/network/events" className="block">
                  <Button variant="ghost" size="sm" className="w-full justify-start h-8 text-xs">
                    <Calendar className="h-3 w-3 mr-2" />
                    Events
                  </Button>
                </Link>
                <Link to="/learning" className="block">
                  <Button variant="ghost" size="sm" className="w-full justify-start h-8 text-xs">
                    <span className="h-3 w-3 mr-2">📚</span>
                    Courses
                  </Button>
                </Link>
              </div>
              
              <div className="space-y-1 mt-3">
                <h3 className="font-semibold text-sm mb-2 px-2">Settings</h3>
                <Link to="/profile/edit" className="block">
                  <Button variant="ghost" size="sm" className="w-full justify-start h-8 text-xs">
                    <span className="h-3 w-3 mr-2">✏️</span>
                    Edit Profile
                  </Button>
                </Link>
                <Link to="/profile/analytics" className="block">
                  <Button variant="ghost" size="sm" className="w-full justify-start h-8 text-xs">
                    <Eye className="h-3 w-3 mr-2" />
                    Edit Views
                  </Button>
                </Link>
                <Link to="/profile/settings" className="block">
                  <Button variant="ghost" size="sm" className="w-full justify-start h-8 text-xs">
                    <span className="h-3 w-3 mr-2">🔒</span>
                    Privacy
                  </Button>
                </Link>
              </div>
            </Card>
            
            {/* Network Stats */}
            <NetworkStats
              stats={{
                connections: stats?.connections || 14,
                messages: 0,
                profileViews: stats?.profileViews || 167,
                events: 0
              }}
            />
          </div>

          {/* Middle Column - Posts Feed */}
          <div className="lg:col-span-6 space-y-6">
            {/* Enhanced Create Post with AI Features */}
            <EnhancedCreatePost onPostCreate={handlePostCreate} />

            {/* AI Assistant */}
            {showAIAssistant && (
              <AIPostAssistant
                onSuggestionApply={(suggestion) => {
                  // Handle suggestion application - could pass to CreatePost if needed
                  console.log('AI Suggestion:', suggestion);
                  // You could also use a state or callback to pass this to CreatePost
                }}
                currentContent=""
              />
            )}

            {/* Posts Feed */}
            <div className="space-y-6">
              {postsLoading ? (
                // Loading skeleton
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
                      {/* Post Header - Make user info clickable */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-3">
                          <Link to={`/network/people/${post.author_id}`} className="block hover:scale-105 transition-transform">
                            <Avatar className="cursor-pointer">
                              <AvatarImage src={post.profiles?.profile_picture_url} />
                              <AvatarFallback>
                                {generateInitials(post.profiles)}
                              </AvatarFallback>
                            </Avatar>
                          </Link>
                          <div>
                            <Link 
                              to={`/network/people/${post.author_id}`} 
                              className="hover:text-blue-600 transition-colors cursor-pointer"
                            >
                              <h3 className="font-semibold text-gray-900">
                                {formatDisplayName(post.profiles)}
                              </h3>
                            </Link>
                            <p className="text-sm text-gray-600">
                              {post.profiles?.title || 'Professional'}
                            </p>
                            <p className="text-xs text-gray-500">{formatTimeAgo(post.created_at)}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Post Content */}
                      <div className="mb-4">
                        <p className="text-gray-900 whitespace-pre-wrap">{post.content}</p>
                        
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
                                <div key={index} className="relative group">
                                  {isVideo ? (
                                    <video 
                                      src={url}
                                      className="w-full h-64 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                      controls
                                      onClick={() => window.open(url, '_blank')}
                                    />
                                  ) : isDocument ? (
                                    <div className="flex items-center justify-center h-32 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer">
                                      <div className="text-center">
                                        <FileText className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                                        <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                                          View Document
                                        </a>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="relative overflow-hidden rounded-lg cursor-pointer" onClick={() => window.open(url, '_blank')}>
                                      <img 
                                        src={url}
                                        alt={`Shared by ${formatDisplayName(post.profiles)}`}
                                        className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
                                        onError={(e) => {
                                          console.error('Image failed to load:', url);
                                          (e.target as HTMLImageElement).style.display = 'none';
                                          const parent = (e.target as HTMLImageElement).parentElement;
                                          if (parent) {
                                            parent.innerHTML = `
                                              <div class="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
                                                <div class="text-center">
                                                  <div class="w-16 h-16 bg-gray-300 rounded-lg flex items-center justify-center mx-auto mb-2">
                                                    <svg class="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                  </div>
                                                  <p class="text-sm text-gray-500">Image unavailable</p>
                                                  <a href="${url}" target="_blank" class="text-blue-600 hover:underline text-xs">View original</a>
                                                </div>
                                              </div>
                                            `;
                                          }
                                        }}
                                        onLoad={() => {
                                          console.log('Image loaded successfully:', url);
                                        }}
                                      />
                                      {/* Overlay for hover effect */}
                                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                          <div className="bg-white/90 rounded-full p-2">
                                            <ExternalLink className="h-4 w-4 text-gray-800" />
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  {index === 3 && post.media_urls.length > 4 && (
                                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                                      <span className="text-white text-xl font-semibold">
                                        +{post.media_urls.length - 4}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                        
                        {/* Location */}
                        {post.location && (
                          <div className="flex items-center gap-1 mt-3 text-sm text-gray-500">
                            <MapPin className="h-4 w-4" />
                            <span>{post.location}</span>
                          </div>
                        )}
                        
                        {/* Post Tags */}
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {post.tags.map((tag: string, index: number) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                #{tag}
                              </Badge>
                            ))}
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
            </div>

            {posts && posts.length === 0 && !postsLoading && (
              <Card>
                <CardContent className="p-12 text-center">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                  <p className="text-gray-600">Be the first to share something with your network!</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Sidebar - Network Activity */}
          <div className="lg:col-span-3 space-y-4">
            {/* Connection Requests */}
            <ConnectionRequests />

            {/* Quick Actions */}
            <Card className="p-3">
              <h3 className="font-semibold text-sm mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start h-8 text-xs"
                  onClick={() => setShowAIAssistant(!showAIAssistant)}
                >
                  <Sparkles className="h-3 w-3 mr-2" />
                  AI Assistant
                </Button>
                <Link to="/network/people" className="block">
                  <Button variant="ghost" size="sm" className="w-full justify-start h-8 text-xs">
                    <Users className="h-3 w-3 mr-2" />
                    Find People
                  </Button>
                </Link>
                <Link to="/network/events" className="block">
                  <Button variant="ghost" size="sm" className="w-full justify-start h-8 text-xs">
                    <Calendar className="h-3 w-3 mr-2" />
                    Events
                  </Button>
                </Link>
                <Link to="/companies" className="block">
                  <Button variant="ghost" size="sm" className="w-full justify-start h-8 text-xs">
                    <Briefcase className="h-3 w-3 mr-2" />
                    Companies
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Network Stats */}
            <Card className="p-3">
              <h3 className="font-semibold text-sm mb-3">Activity</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Posts Shared</span>
                  <span className="text-sm font-bold">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Comments</span>
                  <span className="text-sm font-bold">8</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Likes Given</span>
                  <span className="text-sm font-bold">24</span>
                </div>
              </div>
            </Card>

            {/* Recent Connections */}
            <Card className="p-3">
              <h3 className="font-semibold text-sm mb-3">Recent Connections</h3>
              <div className="space-y-2">
                {connectionsLoading ? (
                  [...Array(2)].map((_, index) => (
                    <div key={index} className="flex items-center space-x-2 animate-pulse">
                      <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-3 bg-gray-300 rounded w-3/4 mb-1"></div>
                        <div className="h-2 bg-gray-300 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))
                ) : connections && connections.length > 0 ? (
                  connections.slice(0, 2).map((connection, index) => (
                    <div key={connection.id} className="flex items-center space-x-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={connection.otherUser?.profile_picture_url} />
                        <AvatarFallback className="text-xs">
                          {generateInitials(connection.otherUser)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-xs truncate">
                          {formatDisplayName(connection.otherUser)}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {connection.otherUser?.title || 'Professional'}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 text-center py-2">No connections yet</p>
                )}
              </div>
              <Link to="/network/people" className="block mt-2">
                <Button variant="ghost" size="sm" className="w-full text-xs h-7">
                  View All
                </Button>
              </Link>
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
                        <p className="text-xs text-gray-500">{formatTimeAgo(activity.time)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 text-center py-2">No recent activity</p>
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
    </div>
  );
};

export default Posts;
