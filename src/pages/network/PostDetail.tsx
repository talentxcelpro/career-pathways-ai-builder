import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MoreHorizontal, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { PostActions } from "@/components/posts/PostActions";
import { CommentsSection } from "@/components/posts/CommentsSection";
import { ShareButton } from "@/components/shared/ShareButton";
import { useShareContent } from "@/hooks/useShareContent";
import MediaPreview from "@/components/posts/MediaPreview";

const PostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [showComments, setShowComments] = useState(true);
  const { createPostShareData } = useShareContent();

  const { data: post, isLoading } = useQuery({
    queryKey: ['post', id],
    queryFn: async () => {
      if (!id) throw new Error('Post ID is required');

      const { data: postData, error: postError } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single();

      if (postError) throw postError;

      // Get author profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, profile_picture_url, title')
        .eq('id', postData.author_id)
        .single();

      if (profileError) throw profileError;

      return {
        ...postData,
        profiles: profileData
      };
    },
    enabled: !!id
  });

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
    return profile?.full_name || 'Professional User';
  };

  const generateInitials = (profile: any) => {
    const displayName = formatDisplayName(profile);
    if (displayName === 'Professional User') return 'PU';
    
    const names = displayName.split(' ');
    return names.length === 1 
      ? names[0].charAt(0).toUpperCase()
      : names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-32 mb-6"></div>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/6"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link to="/network/posts" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Posts
          </Link>
          <Card>
            <CardContent className="p-12 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Post not found</h3>
              <p className="text-gray-600">This post may have been deleted or you don't have permission to view it.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const shareContent = createPostShareData(post);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/network/posts" className="inline-flex items-center text-blue-600 hover:text-blue-700">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Posts
          </Link>
          <ShareButton
            content={shareContent}
            variant="outline"
            size="sm"
            showText={true}
          />
        </div>

        {/* Post Detail */}
        <Card className="mb-6">
          <CardContent className="p-6">
            {/* Post Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={post.profiles?.profile_picture_url} />
                  <AvatarFallback>
                    {generateInitials(post.profiles)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">
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
            <div className="mb-6">
              <MediaPreview 
                content={post.content} 
                mediaUrls={post.media_urls || []} 
              />
              
              {/* Post Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {post.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="secondary">
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
              onCommentClick={() => setShowComments(!showComments)}
              postData={post}
            />
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <MessageCircle className="h-5 w-5 mr-2" />
              <h3 className="font-semibold">Comments</h3>
            </div>
            <CommentsSection
              postId={post.id}
              isOpen={true}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PostDetail;
