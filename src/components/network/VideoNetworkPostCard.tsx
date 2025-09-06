import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link } from 'react-router-dom';
import { SocialVideoPlayer } from '@/components/video/SocialVideoPlayer';
import { useReelsEngagement } from '@/hooks/useReelsEngagement';
import { useShareContent } from "@/hooks/useShareContent";
import ProBadge from "@/components/network/ProBadge";
import { supabase } from "@/integrations/supabase/client";

interface VideoNetworkPost {
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

interface VideoNetworkPostCardProps {
  post: VideoNetworkPost;
  onCommentClick?: (postId: string) => void;
}

export const VideoNetworkPostCard: React.FC<VideoNetworkPostCardProps> = ({
  post,
  onCommentClick
}) => {
  const [currentUserId, setCurrentUserId] = React.useState<string | null>(null);
  const [hasLiked, setHasLiked] = React.useState(false);
  const { likeReel, shareReel, isLiking } = useReelsEngagement();
  const { createPostShareData } = useShareContent();

  // Get current user
  React.useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
      
      // Check if user has liked this post
      if (user?.id) {
        const { data } = await supabase
          .from('likes')
          .select('id')
          .eq('user_id', user.id)
          .eq('content_id', post.id)
          .eq('content_type', 'post')
          .single();
        
        setHasLiked(!!data);
      }
    };
    getCurrentUser();
  }, [post.id]);

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

  const handleLike = async () => {
    if (!currentUserId || isLiking) return;
    
    try {
      // Use reel engagement hook for consistency
      likeReel({
        reelId: post.id,
        hasLiked: hasLiked
      });
      setHasLiked(!hasLiked);
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleShare = async () => {
    const shareData = createPostShareData(post);
    await shareReel({
      reelId: post.id,
      url: shareData.url,
      title: shareData.title
    });
  };

  const handleComment = () => {
    onCommentClick?.(post.id);
  };

  // Get the video URL (first media URL that's a video)
  const videoUrl = post.media_urls?.find(url => 
    url.includes('.mp4') || url.includes('.webm') || url.includes('.mov')
  );

  if (!videoUrl) {
    return null; // Don't render if no video
  }

  return (
    <Card className="hover:shadow-lg transition-shadow border-border/60 bg-card/95 backdrop-blur-sm overflow-hidden">
      <CardContent className="p-0">
        {/* Post Header */}
        <div className="p-4 pb-0">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start space-x-3">
              <Link to={`/user/${post.author_id}`} className="block">
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
          </div>

          {/* Post Headline */}
          {post.headline && (
            <div className="mb-3">
              <h2 className="text-lg font-semibold text-foreground">
                {post.headline}
              </h2>
            </div>
          )}

          {/* Post Content Text */}
          {post.content && (
            <div className="text-foreground leading-relaxed mb-3">
              <p className="whitespace-pre-wrap break-words">{post.content}</p>
            </div>
          )}
        </div>

        {/* Video Player - Full width, reel-style */}
        <div className="relative w-full h-[500px] bg-black">
          <SocialVideoPlayer
            videoUrl={videoUrl}
            title={post.headline}
            description={post.content}
            autoPlay={true}
            enableSound={false}
            likesCount={post.likes_count || 0}
            commentsCount={post.comments_count || 0}
            sharesCount={post.shares_count || 0}
            hasLiked={hasLiked}
            onLike={handleLike}
            onComment={handleComment}
            onShare={handleShare}
            onDoubleTap={handleLike}
            contentId={post.id}
            contentType="post"
            className="w-full h-full"
          />
        </div>

        {/* Post Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="p-4 pt-3">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};