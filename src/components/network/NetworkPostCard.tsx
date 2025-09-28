import React, { useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from 'react-router-dom';
import { UserAvatar } from "@/components/common/UserAvatar";
import { EnhancedCommentsSection } from "@/components/posts/EnhancedCommentsSection";
import { EnhancedPostMenu } from "@/components/posts/EnhancedPostMenu";
import { QuickShareActions } from "@/components/shared/QuickShareActions";
import { useShareContent } from "@/hooks/useShareContent";
import { EngagementActions } from "@/components/engagement/EngagementActions";
import ProBadge from "@/components/network/ProBadge";
import MediaPreview from "@/components/posts/MediaPreview";
import { VideoNetworkPostCard } from './VideoNetworkPostCard';
import { linkifyText } from "@/utils/textUtils";
import { supabase } from "@/integrations/supabase/client";
import { getCustomStorageUrl } from "@/utils/storage";
import { ReshareButton } from './ReshareButton';
import { useViewportProfileTracking } from '@/hooks/useViewportProfileTracking';
import { ContentEmbed } from '@/components/embeds/ContentEmbed';

interface NetworkPost {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  headline?: string;
  media_urls?: string[];
  tags?: string[];
  link_previews?: Array<{ url: string }>;
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

interface NetworkPostCardProps {
  post: NetworkPost;
  openComments?: string | null;
  onCommentClick?: (postId: string) => void;
}

export const NetworkPostCard: React.FC<NetworkPostCardProps> = ({
  post,
  openComments,
  onCommentClick
}) => {
  const { trackElementRef } = useViewportProfileTracking(
    post.profiles?.id || '',
    'network_card',
    {
      threshold: 0.6, // 60% visible
      minViewTime: 3000 // 3 seconds minimum view time
    }
  );
  
  const cardRef = React.useRef<HTMLDivElement>(null);
  
  // Set up viewport tracking for this card
  React.useEffect(() => {
    if (cardRef.current && post.profiles?.id) {
      trackElementRef(cardRef.current);
    }
  }, [trackElementRef, post.profiles?.id]);

  // Check if this post contains video content
  const hasVideo = post.media_urls?.some(url => 
    url.includes('.mp4') || url.includes('.webm') || url.includes('.mov')
  );

  // If it's a video post, render the specialized video card
  if (hasVideo) {
    return (
      <VideoNetworkPostCard 
        post={post} 
        onCommentClick={onCommentClick}
      />
    );
  }
  const { createPostShareData } = useShareContent();
  const [currentUserId, setCurrentUserId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

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


  const shareContent = createPostShareData(post);

  // Render text with clickable links and mentions
  const renderContentWithLinks = (content: string) => {
    const parts = linkifyText(content);
    return (
      <div className="whitespace-pre-wrap break-words">
        {parts.map((part, index) => (
          <span key={index}>{part}</span>
        ))}
      </div>
    );
  };

  return (
    <Card 
      ref={cardRef}
      className="hover:shadow-md transition-shadow border-border/60 bg-card/95 backdrop-blur-sm"
    >
      <CardContent className="p-6">
        {/* Post Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3">
            <Link to={`/user/${post.author_id}`} className="block">
              <div className="relative">
                <UserAvatar 
                  src={post.profiles?.profile_picture_url || null}
                  userName={formatDisplayName(post.profiles)}
                  size="md"
                  className="hover:scale-105 transition-transform ring-2 ring-border/20"
                />
                {post.profiles?.pro_plan && post.profiles?.pro_status === 'active' && 
                 post.profiles?.pro_expires_at && new Date(post.profiles.pro_expires_at) > new Date() && (
                  <div className="absolute -top-1 -right-1">
                    <ProBadge plan={post.profiles.pro_plan as any} size="sm" />
                  </div>
                )}
              </div>
            </Link>
            <div className="flex-1 min-w-0">
              <Link 
                to={`/user/${post.author_id}`} 
                className="hover:text-primary transition-colors"
              >
                <h3 className="font-semibold text-foreground truncate">
                  {formatDisplayName(post.profiles)}
                </h3>
              </Link>
              <p className="text-sm text-muted-foreground truncate">
                {post.profiles?.title || 'Professional'}
                {post.profiles?.current_company && (
                  <span> • {post.profiles.current_company}</span>
                )}
              </p>
              <p className="text-xs text-muted-foreground">{formatTimeAgo(post.created_at)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <QuickShareActions content={shareContent} />
            <ReshareButton
              postId={post.id}
              postContent={post.content}
              postAuthor={formatDisplayName(post.profiles)}
              postUrl={`${window.location.origin}/network/posts/${post.id}`}
            />
            <EnhancedPostMenu
              postId={post.id}
              authorId={post.author_id || ''}
              currentUserId={currentUserId}
              postContent={post.content}
              postHeadline={post.headline}
              isOwnPost={currentUserId === post.author_id}
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

        {/* Post Content */}
        <div className="mb-4">
          <div className="text-foreground leading-relaxed mb-3">
            {renderContentWithLinks(post.content)}
          </div>

          {/* Media Preview - Now fully interactive */}
          {post.media_urls && post.media_urls.length > 0 && (
            <MediaPreview 
              content={post.content} 
              mediaUrls={post.media_urls} 
            />
          )}

          {/* Link Embeds */}
          {post.link_previews && post.link_previews.length > 0 && (
            <div className="space-y-3 mt-3">
              {post.link_previews.map((linkData, index) => (
                <ContentEmbed 
                  key={index}
                  url={linkData.url}
                  className="rounded-lg overflow-hidden"
                />
              ))}
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
            views: 0, // TODO: Add views tracking
          }}
          variant="default"
          onComment={() => onCommentClick?.(post.id)}
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