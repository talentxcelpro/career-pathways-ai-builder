
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal } from "lucide-react";
import { PostActions } from "@/components/posts/PostActions";
import { CommentsSection } from "@/components/posts/CommentsSection";

interface PostCardProps {
  post: {
    id: string;
    content: string;
    created_at: string;
    media_urls?: string[];
    tags?: string[];
    likes_count?: number;
    comments_count?: number;
    shares_count?: number;
    profiles?: {
      full_name?: string;
      title?: string;
      profile_picture_url?: string;
    };
  };
  openComments?: string | null;
  onCommentClick?: (postId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  openComments,
  onCommentClick
}) => {
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

  return (
    <Card className="hover:shadow-md transition-shadow">
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
          onCommentClick={() => onCommentClick?.(post.id)}
        />

        {/* Comments Section */}
        <CommentsSection
          postId={post.id}
          isOpen={openComments === post.id}
        />
      </CardContent>
    </Card>
  );
};
