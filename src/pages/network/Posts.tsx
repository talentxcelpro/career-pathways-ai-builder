import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, MessageCircle, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PostActions } from "@/components/posts/PostActions";
import { CommentsSection } from "@/components/posts/CommentsSection";
import { MediaUpload } from "@/components/posts/MediaUpload";
import { ProfileCompletionPrompt } from "@/components/profile/ProfileCompletionPrompt";
import { AIPostAssistant } from "@/components/network/AIPostAssistant";

const Posts = () => {
  const [newPost, setNewPost] = useState('');
  const [postMedia, setPostMedia] = useState<string[]>([]);
  const [openComments, setOpenComments] = useState<string | null>(null);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const queryClient = useQueryClient();

  const { data: posts, isLoading } = useQuery({
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Professional Feed</h1>
          <p className="text-gray-600 mt-2">Share insights, updates, and connect with your network</p>
        </div>

        {/* Profile Completion Prompt */}
        {missingFields.length > 0 && (
          <ProfileCompletionPrompt 
            missingFields={missingFields}
            className="mb-6"
          />
        )}

        {/* AI Assistant Toggle */}
        <div className="mb-4">
          <Button
            variant={showAIAssistant ? "default" : "outline"}
            onClick={() => setShowAIAssistant(!showAIAssistant)}
            className="flex items-center"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {showAIAssistant ? "Hide AI Assistant" : "Show AI Assistant"}
          </Button>
        </div>

        {/* AI Post Assistant */}
        {showAIAssistant && (
          <AIPostAssistant
            onSuggestionApply={handleAISuggestionApply}
            currentContent={newPost}
          />
        )}

        {/* Create Post */}
        <Card className="mb-8">
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
          {isLoading ? (
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

        {posts && posts.length === 0 && !isLoading && (
          <Card>
            <CardContent className="p-12 text-center">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
              <p className="text-gray-600">Be the first to share something with your network!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Posts;
