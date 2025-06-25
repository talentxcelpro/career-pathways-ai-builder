
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Share2, MoreHorizontal, Image, Video, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const Posts = () => {
  const [newPost, setNewPost] = useState('');
  const queryClient = useQueryClient();

  const { data: posts, isLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles(full_name, profile_picture_url, title)
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data;
    }
  });

  const createPostMutation = useMutation({
    mutationFn: async (content: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('posts')
        .insert({
          author_id: user.id,
          content,
          post_type: 'text',
          is_public: true
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setNewPost('');
      toast.success('Post created successfully!');
    },
    onError: (error) => {
      toast.error('Failed to create post');
      console.error('Post creation error:', error);
    }
  });

  const handleCreatePost = () => {
    if (!newPost.trim()) {
      toast.error('Please write something before posting');
      return;
    }
    createPostMutation.mutate(newPost);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Professional Feed</h1>
          <p className="text-gray-600 mt-2">Share insights, updates, and connect with your network</p>
        </div>

        {/* Create Post */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Share an update</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea
                placeholder="What's on your mind? Share a professional update, insight, or achievement..."
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                className="min-h-[120px] resize-none"
              />
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" disabled>
                    <Image className="h-4 w-4 mr-2" />
                    Photo
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    <Video className="h-4 w-4 mr-2" />
                    Video
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    <FileText className="h-4 w-4 mr-2" />
                    Document
                  </Button>
                </div>
                <Button 
                  onClick={handleCreatePost}
                  disabled={createPostMutation.isPending || !newPost.trim()}
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
                          {post.profiles?.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {post.profiles?.full_name || 'Anonymous User'}
                        </h3>
                        <p className="text-sm text-gray-600">{post.profiles?.title}</p>
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
                  <div className="flex items-center justify-between border-t pt-4">
                    <div className="flex space-x-6">
                      <Button variant="ghost" size="sm" className="text-gray-600 hover:text-red-600">
                        <Heart className="h-4 w-4 mr-2" />
                        {post.likes_count || 0}
                      </Button>
                      <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-600">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        {post.comments_count || 0}
                      </Button>
                      <Button variant="ghost" size="sm" className="text-gray-600 hover:text-green-600">
                        <Share2 className="h-4 w-4 mr-2" />
                        {post.shares_count || 0}
                      </Button>
                    </div>
                  </div>
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
