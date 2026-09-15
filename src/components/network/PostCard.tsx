import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/common/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal } from "lucide-react";
import { Link } from 'react-router-dom';
import { PostActions } from "@/components/posts/PostActions";
import { EnhancedCommentsSection } from "@/components/posts/EnhancedCommentsSection";
import { EnhancedPostMenu } from "@/components/posts/EnhancedPostMenu";
import { QuickShareActions } from "@/components/shared/QuickShareActions";
import { useShareContent } from "@/hooks/useShareContent";
import ProBadge from "@/components/network/ProBadge";
import MediaPreview from "@/components/posts/MediaPreview";

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
      pro_plan?: string;
      pro_status?: string;
      pro_expires_at?: string;
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
  const { createPostShareData } = useShareContent();

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

  const shareContent = createPostShareData(post);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        {/* Post Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3">
            <Link to={`/user/${post.author_id}`} className="block">
              <div className="relative">
                <div className="hover:scale-105 transition-transform">
                  <UserAvatar
                    src={post.profiles?.profile_picture_url}
                    userName={post.profiles?.full_name}
                    size="lg"
                  />
                </div>
                {post.profiles?.pro_plan && post.profiles?.pro_status === 'active' && 
                 post.profiles?.pro_expires_at && new Date(post.profiles.pro_expires_at) > new Date() && (
                  <div className="absolute -top-1 -right-1">
                    <ProBadge plan={post.profiles.pro_plan as any} size="sm" />
                  </div>
                )}
              </div>
            </Link>
            <div>
              <Link 
                to={`/user/${post.author_id}`} 
                className="hover:text-primary transition-colors"
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
          <div className="flex items-center gap-2">
            <QuickShareActions content={shareContent} />
            <EnhancedPostMenu
              postId={post.id}
              authorId={post.author_id || ''}
              currentUserId={post.author_id}
              postContent={post.content}
              isOwnPost={true}
            />
          </div>
        </div>

        {/* Post Content */}
        <div className="mb-4">
          <MediaPreview 
            content={post.content} 
            mediaUrls={post.media_urls || []} 
          />
          
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

          {/* View Details Link */}
          <div className="mt-3 pt-2 border-t border-border/30">
            <Link 
              to={`/network/posts/${post.id}`} 
              className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
            >
              View full post details →
            </Link>
          </div>
        </div>

        {/* Post Actions */}
        <PostActions
          postId={post.id}
          initialLikes={post.likes_count || 0}
          initialComments={post.comments_count || 0}
          initialShares={post.shares_count || 0}
          onCommentClick={() => onCommentClick?.(post.id)}
          postData={post}
        />

        {/* Enhanced Comments Section */}
        <EnhancedCommentsSection
          postId={post.id}
          isOpen={openComments === post.id}
        />
      </CardContent>
    </Card>
  );
};
