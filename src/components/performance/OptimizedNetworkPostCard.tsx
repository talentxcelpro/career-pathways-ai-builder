import React, { memo, useCallback, useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link } from 'react-router-dom';
import { EnhancedCommentsSection } from "@/components/posts/EnhancedCommentsSection";
import { EnhancedPostMenu } from "@/components/posts/EnhancedPostMenu";
import { QuickShareActions } from "@/components/shared/QuickShareActions";
import { useShareContent } from "@/hooks/useShareContent";
import { EngagementActions } from "@/components/engagement/EngagementActions";
import ProBadge from "@/components/network/ProBadge";
import MediaPreview from "@/components/posts/MediaPreview";
import { linkifyText } from "@/utils/textUtils";
import { supabase } from "@/integrations/supabase/client";
import { RealtimePostReactions } from "@/components/realtime/RealtimePostReactions";
import { RealtimeTypingIndicators } from "@/components/realtime/RealtimeTypingIndicators";

interface NetworkPost {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  headline?: string;
  media_urls?: string[];
  tags?: string[];
  likes_count?: number;
  comments_count?: number;
  shares_count?: number;
  profiles?: {
    id: string;
    full_name?: string;
    profile_picture_url?: string;
    title?: string;
    current_company?: string;
    pro_plan?: string;
    pro_status?: string;
    pro_expires_at?: string;
  };
}

interface OptimizedNetworkPostCardProps {
  post: NetworkPost;
  openComments?: string | null;
  onCommentClick?: (postId: string) => void;
  currentUserId?: string | null;
}

// Time formatting with memoization
const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

// Display name formatting with memoization
const formatDisplayName = (profile: any) => {
  if (profile?.full_name && profile.full_name.trim()) {
    return profile.full_name;
  }
  return 'Professional User';
};

// Initials generation with memoization
const generateInitials = (profile: any) => {
  const displayName = formatDisplayName(profile);
  if (displayName === 'Professional User') return 'PU';
  
  const names = displayName.split(' ');
  if (names.length === 1) {
    return names[0].charAt(0).toUpperCase();
  }
  return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
};

const OptimizedNetworkPostCardComponent: React.FC<OptimizedNetworkPostCardProps> = ({
  post,
  openComments,
  onCommentClick,
  currentUserId
}) => {
  const { createPostShareData } = useShareContent();

  // Memoized calculations
  const timeAgo = useMemo(() => formatTimeAgo(post.created_at), [post.created_at]);
  const displayName = useMemo(() => formatDisplayName(post.profiles), [post.profiles]);
  const initials = useMemo(() => generateInitials(post.profiles), [post.profiles]);
  const shareContent = useMemo(() => createPostShareData(post), [post, createPostShareData]);
  const isOwnPost = useMemo(() => currentUserId === post.author_id, [currentUserId, post.author_id]);

  // Optimized event handlers
  const handleCommentClick = useCallback(() => {
    onCommentClick?.(post.id);
  }, [onCommentClick, post.id]);

  // Render text with clickable links and mentions
  const renderContentWithLinks = useCallback((content: string) => {
    const parts = linkifyText(content);
    return (
      <div className="whitespace-pre-wrap break-words">
        {parts.map((part, index) => (
          <span key={index}>{part}</span>
        ))}
      </div>
    );
  }, []);

  // Check if user has pro badge
  const hasProBadge = useMemo(() => {
    return post.profiles?.pro_plan && 
           post.profiles?.pro_status === 'active' && 
           post.profiles?.pro_expires_at && 
           new Date(post.profiles.pro_expires_at) > new Date();
  }, [post.profiles]);

  return (
    <Card className="hover:shadow-md transition-shadow border-border/60 bg-card/95 backdrop-blur-sm">
      <CardContent className="p-6">
        {/* Post Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3">
            <Link to={`/network/people/${post.author_id}`} className="block">
              <div className="relative">
                <Avatar className="hover:scale-105 transition-transform">
                  <AvatarImage src={post.profiles?.profile_picture_url} />
                  <AvatarFallback>
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {hasProBadge && (
                  <div className="absolute -top-1 -right-1">
                    <ProBadge plan={post.profiles.pro_plan as any} size="sm" />
                  </div>
                )}
              </div>
            </Link>
            <div className="flex-1 min-w-0">
              <Link 
                to={`/network/people/${post.author_id}`} 
                className="hover:text-primary transition-colors"
              >
                <h3 className="font-semibold text-foreground truncate">
                  {displayName}
                </h3>
              </Link>
              <p className="text-sm text-muted-foreground truncate">
                {post.profiles?.title || 'Professional'}
                {post.profiles?.current_company && (
                  <span> • {post.profiles.current_company}</span>
                )}
              </p>
              <p className="text-xs text-muted-foreground">{timeAgo}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <QuickShareActions content={shareContent} />
            <EnhancedPostMenu
              postId={post.id}
              authorId={post.author_id || ''}
              currentUserId={currentUserId}
              postContent={post.content}
              postHeadline={post.headline}
              isOwnPost={isOwnPost}
            />
          </div>
        </div>

        {/* Post Headline */}
        {post.headline && (
          <div className="mb-3">
            <h2 className="text-lg font-semibold text-foreground">
              {post.headline}
            </h2>
          </div>
        )}

        {/* Post Content with Real-time Reactions */}
        <div className="relative">
          <div className="block mb-4 -mx-2 px-2 py-2 rounded">
            <div className="text-foreground leading-relaxed mb-3">
              {renderContentWithLinks(post.content)}
            </div>

            {/* Media Preview */}
            {post.media_urls && post.media_urls.length > 0 && (
              <MediaPreview 
                content={post.content} 
                mediaUrls={post.media_urls} 
              />
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

          {/* View Details Link */}
          <div className="mt-2">
            <Link 
              to={`/network/posts/${post.id}`} 
              className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
            >
              View full post details →
            </Link>
          </div>

          {/* Real-time Post Reactions Overlay */}
          <RealtimePostReactions postId={post.id} />
        </div>

        {/* Real-time Engagement Actions */}
        <EngagementActions
          contentType="post"
          contentId={post.id}
          contentOwnerId={post.author_id}
          module="network"
          initialStats={{
            likes: post.likes_count || 0,
            comments: post.comments_count || 0,
            shares: post.shares_count || 0,
            views: 0,
          }}
          variant="default"
          onComment={handleCommentClick}
        />

        {/* Real-time Typing Indicators */}
        {openComments === post.id && (
          <RealtimeTypingIndicators 
            contentId={post.id} 
            contentType="post"
            currentUserId={currentUserId}
          />
        )}

        {/* Enhanced Comments Section */}
        <EnhancedCommentsSection
          postId={post.id}
          isOpen={openComments === post.id}
        />
      </CardContent>
    </Card>
  );
};

// Memoized component with custom comparison
export const OptimizedNetworkPostCard = memo(OptimizedNetworkPostCardComponent, (prevProps, nextProps) => {
  // Custom comparison for better performance
  return (
    prevProps.post.id === nextProps.post.id &&
    prevProps.post.likes_count === nextProps.post.likes_count &&
    prevProps.post.comments_count === nextProps.post.comments_count &&
    prevProps.post.shares_count === nextProps.post.shares_count &&
    prevProps.openComments === nextProps.openComments &&
    prevProps.currentUserId === nextProps.currentUserId
  );
});

OptimizedNetworkPostCard.displayName = 'OptimizedNetworkPostCard';