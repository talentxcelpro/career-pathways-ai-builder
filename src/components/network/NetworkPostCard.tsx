import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link } from 'react-router-dom';
import { PostActions } from "@/components/posts/PostActions";
import { CommentsSection } from "@/components/posts/CommentsSection";
import { PostMenu } from "@/components/posts/PostMenu";
import { QuickShareActions } from "@/components/shared/QuickShareActions";
import { useShareContent } from "@/hooks/useShareContent";
import ProBadge from "@/components/network/ProBadge";
import MediaPreview from "@/components/posts/MediaPreview";
import { linkifyText } from "@/utils/textUtils";

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
                    {generateInitials(post.profiles)}
                  </AvatarFallback>
                </Avatar>
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
                to={`/network/people/${post.author_id}`} 
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
            <PostMenu
              postId={post.id}
              authorId={post.author_id || ''}
              currentUserId={post.author_id}
              postContent={post.content}
              isOwnPost={false}
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

        {/* Post Content - Make clickable to navigate to detail page */}
        <Link to={`/network/posts/${post.id}`} className="block mb-4 hover:bg-muted/30 -mx-2 px-2 py-2 rounded transition-colors">
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