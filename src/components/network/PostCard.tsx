
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal } from "lucide-react";
import { Link } from 'react-router-dom';
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
    author_id?: string;
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
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-2">
        {/* Compact Post Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-start gap-2">
            <Link to={`/network/people/${post.author_id}`} className="block">
              <Avatar className="w-6 h-6 hover:scale-105 transition-transform">
                <AvatarImage src={post.profiles?.profile_picture_url} />
                <AvatarFallback className="text-xs">
                  {generateInitials(post.profiles)}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div className="min-w-0 flex-1">
              <Link 
                to={`/network/people/${post.author_id}`} 
                className="hover:text-primary transition-colors"
              >
                <h3 className="font-medium text-sm truncate">
                  {formatDisplayName(post.profiles)}
                </h3>
              </Link>
              <p className="text-xs text-muted-foreground truncate">
                {post.profiles?.title || 'Professional'} • {formatTimeAgo(post.created_at)}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <MoreHorizontal className="w-3 h-3" />
          </Button>
        </div>

        {/* Compact Post Content */}
        <Link to={`/network/posts/${post.id}`} className="block mb-3 hover:bg-accent -mx-1 px-1 py-1 rounded transition-colors">
          <p className="text-sm text-foreground whitespace-pre-wrap line-clamp-3">{post.content}</p>
          
          {/* Compact Post Media */}
          {post.media_urls && post.media_urls.length > 0 && (
            <div className="mt-2 grid gap-1" style={{
              gridTemplateColumns: post.media_urls.length === 1 ? '1fr' : 
                                 post.media_urls.length === 2 ? '1fr 1fr' :
                                 '1fr 1fr'
            }}>
              {post.media_urls.slice(0, 2).map((url: string, index: number) => {
                const isVideo = url.includes('.mp4') || url.includes('.webm') || url.includes('.ogg');
                return (
                  <div key={index} className="relative">
                    {isVideo ? (
                      <video 
                        src={url}
                        className="w-full h-24 object-cover rounded"
                        controls
                      />
                    ) : (
                      <img 
                        src={url}
                        alt={`Media ${index + 1}`}
                        className="w-full h-24 object-cover rounded"
                      />
                    )}
                    {index === 1 && post.media_urls.length > 2 && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded flex items-center justify-center">
                        <span className="text-white text-xs font-semibold">
                          +{post.media_urls.length - 2}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          
          {/* Compact Post Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {post.tags.slice(0, 3).map((tag: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs px-1 py-0">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </Link>

        {/* Compact Post Actions */}
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
