import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/common/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal } from "lucide-react";
import { Link } from 'react-router-dom';
import { PostActions } from "@/components/posts/PostActions";
import { CommentsSection } from "@/components/posts/CommentsSection";
import { PostMenu } from "@/components/posts/PostMenu";
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
            <Link to={`/network/people/${post.author_id}`} className="block">
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
                to={`/network/people/${post.author_id}`} 
                className="hover:text-blue-600 transition-colors"
              >
                <h3 className="font-semibold text-gray-900">
                  {formatDisplayName(post.profiles)}
                </h3>
              </Link>
              <p className="text-sm text-gray-600">
                {post.profiles?.title || 'Professional'}
              </p>
              <p className="text-xs text-muted-foreground">{formatTimeAgo(post.created_at)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <QuickShareActions content={shareContent} />
            <PostMenu
              postId={post.id}
              authorId={post.author_id || ''}
              currentUserId={post.author_id}
              postContent={post.content}
              isOwnPost={true}
            />
          </div>
        </div>

        {/* Post Content - Make clickable to navigate to detail page */}
        <Link to={`/network/posts/${post.id}`} className="block mb-4 hover:bg-gray-50 -mx-2 px-2 py-2 rounded transition-colors">
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
        </Link>

        {/* Post Actions */}
        <PostActions
          postId={post.id}
          initialLikes={post.likes_count || 0}
          initialComments={post.comments_count || 0}
          initialShares={post.shares_count || 0}
          onCommentClick={() => onCommentClick?.(post.id)}
          postData={post}
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
