import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, MessageCircle, Sparkles, Users, Calendar, TrendingUp, Bell, UserPlus, Eye, MapPin, Briefcase, ExternalLink, Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PostActions } from "@/components/posts/PostActions";
import { CommentsSection } from "@/components/posts/CommentsSection";
import { MediaUpload } from "@/components/posts/MediaUpload";
import { ProfileCompletionPrompt } from "@/components/profile/ProfileCompletionPrompt";
import { AIPostAssistant } from "@/components/network/AIPostAssistant";
import { useRealtimeConnections } from "@/hooks/useRealtimeConnections";
import { useRealtimeActivity } from "@/hooks/useRealtimeActivity";
import { Link } from 'react-router-dom';

const Posts = () => {
  const [newPost, setNewPost] = useState('');
  const [postMedia, setPostMedia] = useState<string[]>([]);
  const [openComments, setOpenComments] = useState<string | null>(null);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const queryClient = useQueryClient();

  // Use real-time hooks
  const { connections, stats, isLoading: connectionsLoading } = useRealtimeConnections();
  const { recentActivity, isLoading: activityLoading } = useRealtimeActivity();

  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      // First get posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
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

      // Combine posts with their profiles
      const postsWithProfiles = postsData.map(post => ({
        ...post,
        profiles: profilesMap.get(post.author_id) || null
      }));

      return postsWithProfiles;
    }
  });

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

  const createPostMutation = useMutation({
    mutationFn: async ({ content, mediaUrls }: { content: string; mediaUrls: string[] }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Determine post type based on content and media
      let postType = 'text';
      if (mediaUrls.length > 0) {
        postType = 'image'; // Use 'image' instead of 'media' to match the constraint
      }

      const { error } = await supabase
        .from('posts')
        .insert({
          author_id: user.id,
          content,
          post_type: postType,
          media_urls: mediaUrls,
          is_public: true
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setNewPost('');
      setPostMedia([]);
      toast.success('Post created successfully!');
    },
    onError: (error) => {
      toast.error('Failed to create post');
      console.error('Post creation error:', error);
    }
  });

  const handleCreatePost = () => {
    if (!newPost.trim() && postMedia.length === 0) {
      toast.error('Please write something or add media before posting');
      return;
    }
    createPostMutation.mutate({ content: newPost, mediaUrls: postMedia });
  };

  const handleAISuggestionApply = (suggestion: string) => {
    setNewPost(suggestion);
    toast.success("AI suggestion applied!");
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
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Connect, Share, and Grow Your Professional Network</h1>
          <p className="text-gray-600 mt-2">Share insights, updates, and connect with your network</p>
        </div>

        {/* Three Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar - Profile Information */}
          <div className="lg:col-span-3 space-y-6">
            {/* Profile Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-4">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={currentUserProfile?.profile_picture_url} />
                      <AvatarFallback className="text-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                        {currentUserProfile ? generateInitials(currentUserProfile) : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-md">
                      <Camera className="h-4 w-4 text-gray-600" />
                    </div>
                  </div>
                  
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">
                    {formatDisplayName(currentUserProfile)}
                  </h2>
                  
                  <p className="text-gray-600 mb-3 flex items-center">
                    <Briefcase className="h-4 w-4 mr-1" />
                    {currentUserProfile?.title || 'Add your job title'}
                  </p>
                  
                  {currentUserProfile?.location && (
                    <p className="text-sm text-gray-500 mb-3 flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {currentUserProfile.location}
                    </p>
                  )}

                  <div className="flex items-center space-x-4 mb-4">
                    <div className="text-center">
                      <div className="text-sm font-semibold text-gray-900">{stats?.connections || 0}</div>
                      <div className="text-xs text-gray-500">Connections</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-semibold text-gray-900">{stats?.profileViews || 0}</div>
                      <div className="text-xs text-gray-500">Profile Views</div>
                    </div>
                  </div>

                  <Link to="/profile" className="w-full">
                    <Button variant="outline" className="w-full">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Profile
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Profile Completion */}
            {missingFields.length > 0 && (
              <ProfileCompletionPrompt 
                missingFields={missingFields}
              />
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/network/people">
                  <Button variant="ghost" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Find People
                  </Button>
                </Link>
                <Link to="/network/events">
                  <Button variant="ghost" className="w-full justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    Upcoming Events
                  </Button>
                </Link>
                <Link to="/network/messages">
                  <Button variant="ghost" className="w-full justify-start">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Messages
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => setShowAIAssistant(!showAIAssistant)}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI Assistant
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Middle Column - Posts Feed */}
          <div className="lg:col-span-6 space-y-6">
            {/* AI Post Assistant */}
            {showAIAssistant && (
              <AIPostAssistant
                onSuggestionApply={handleAISuggestionApply}
                currentContent={newPost}
              />
            )}

            {/* Create Post */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Avatar className="h-8 w-8 mr-3">
                    <AvatarImage src={currentUserProfile?.profile_picture_url} />
                    <AvatarFallback>
                      {currentUserProfile ? generateInitials(currentUserProfile) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  Share an update
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea
                    placeholder="What's on your mind? Share a professional update, insight, or achievement..."
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    className="min-h-[120px] resize-none"
                  />
                  
                  <MediaUpload 
                    onMediaUploaded={setPostMedia}
                    existingMedia={postMedia}
                  />
                  
                  <div className="flex items-center justify-end">
                    <Button 
                      onClick={handleCreatePost}
                      disabled={createPostMutation.isPending || (!newPost.trim() && postMedia.length === 0)}
                    >
                      {createPostMutation.isPending ? 'Posting...' : 'Post'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

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
                      {/* Post Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-3">
                          <Avatar>
                            <AvatarImage src={post.profiles?.profile_picture_url} />
                            <AvatarFallback>
                              {generateInitials(post.profiles)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {formatDisplayName(post.profiles)}
                            </h3>
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
                        
                        {/* Post Media */}
                        {post.media_urls && post.media_urls.length > 0 && (
                          <div className="mt-4 grid gap-2" style={{
                            gridTemplateColumns: post.media_urls.length === 1 ? '1fr' : 
                                               post.media_urls.length === 2 ? '1fr 1fr' :
                                               post.media_urls.length === 3 ? '1fr 1fr 1fr' :
                                               '1fr 1fr'
                          }}>
                            {post.media_urls.slice(0, 4).map((url: string, index: number) => {
                              const isVideo = url.includes('.mp4') || url.includes('.webm') || url.includes('.ogg');
                              return (
                                <div key={index} className="relative">
                                  {isVideo ? (
                                    <video 
                                      src={url}
                                      className="w-full h-64 object-cover rounded-lg"
                                      controls
                                    />
                                  ) : (
                                    <img 
                                      src={url}
                                      alt={`Post media ${index + 1}`}
                                      className="w-full h-64 object-cover rounded-lg"
                                    />
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
          <div className="lg:col-span-3 space-y-6">
            {/* Network Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Network Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Link to="/network/people" className="flex items-center justify-between hover:bg-gray-50 p-2 rounded transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Users className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">Connections</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900">{stats?.connections || 0}</span>
                  </Link>
                  
                  <Link to="/network/messages" className="flex items-center justify-between hover:bg-gray-50 p-2 rounded transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <MessageCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">Messages</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900">{stats?.messages || 0}</span>
                  </Link>
                  
                  <Link to="/network/events" className="flex items-center justify-between hover:bg-gray-50 p-2 rounded transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-purple-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">Events</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900">{stats?.events || 0}</span>
                  </Link>
                  
                  <div className="flex items-center justify-between p-2">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Eye className="h-4 w-4 text-orange-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">Profile Views</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900">{stats?.profileViews || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Connections */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Users className="h-5 w-5 mr-2" />
                  Recent Connections
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {connectionsLoading ? (
                    [...Array(3)].map((_, index) => (
                      <div key={index} className="flex items-center space-x-3 animate-pulse">
                        <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-300 rounded w-3/4 mb-1"></div>
                          <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))
                  ) : connections && connections.length > 0 ? (
                    connections.slice(0, 3).map((connection, index) => (
                      <div key={connection.id} className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={connection.otherUser?.profile_picture_url} />
                          <AvatarFallback>
                            {generateInitials(connection.otherUser)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">
                            {formatDisplayName(connection.otherUser)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {connection.otherUser?.title || 'Professional'}
                          </p>
                        </div>
                        <Link to={`/network/messages/${connection.otherUser?.id}`}>
                          <Button variant="outline" size="sm">
                            Message
                          </Button>
                        </Link>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">No connections yet</p>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <Link to="/network/people">
                    <Button variant="ghost" className="w-full">
                      View All Connections
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Bell className="h-5 w-5 mr-2" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activityLoading ? (
                    [...Array(3)].map((_, index) => (
                      <div key={index} className="flex items-start space-x-3 animate-pulse">
                        <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-3 bg-gray-300 rounded w-full mb-1"></div>
                          <div className="h-2 bg-gray-300 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))
                  ) : recentActivity && recentActivity.length > 0 ? (
                    recentActivity.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={activity.avatar} />
                          <AvatarFallback className="text-xs">
                            {activity.user.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm">
                            <span className="font-medium">{activity.user}</span> {activity.action}
                          </p>
                          <p className="text-xs text-gray-500">{formatTimeAgo(activity.time)}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <Link to="/network/notifications">
                    <Button variant="ghost" className="w-full">
                      View All Notifications
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Posts;
