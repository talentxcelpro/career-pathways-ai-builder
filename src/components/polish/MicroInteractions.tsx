import React, { useState, useRef, useEffect, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  MoreHorizontal, 
  Copy, 
  Flag, 
  Eye,
  TrendingUp,
  Users,
  Clock,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface MicroInteractionButtonProps {
  variant?: 'like' | 'comment' | 'share' | 'bookmark' | 'follow';
  isActive?: boolean;
  count?: number;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  tooltipText?: string;
  className?: string;
  children?: React.ReactNode;
}

export const MicroInteractionButton: React.FC<MicroInteractionButtonProps> = memo(({
  variant = 'like',
  isActive = false,
  count = 0,
  onClick,
  disabled = false,
  loading = false,
  size = 'md',
  showTooltip = true,
  tooltipText,
  className,
  children
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [localCount, setLocalCount] = useState(count);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Update local count when prop changes
  useEffect(() => {
    setLocalCount(count);
  }, [count]);

  const handleClick = () => {
    if (disabled || loading) return;

    // Trigger micro-animation
    setIsAnimating(true);
    
    // Haptic feedback on supported devices
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }

    // Optimistic update for better UX
    if (variant === 'like' || variant === 'bookmark') {
      setLocalCount(prev => isActive ? prev - 1 : prev + 1);
    }

    onClick?.();

    // Reset animation
    setTimeout(() => setIsAnimating(false), 300);
  };

  const getIcon = () => {
    switch (variant) {
      case 'like':
        return <Heart className={cn(
          "transition-all duration-300",
          isActive && "fill-current text-red-500",
          isAnimating && "scale-125"
        )} />;
      case 'comment':
        return <MessageCircle className={cn(
          "transition-all duration-300",
          isAnimating && "scale-110"
        )} />;
      case 'share':
        return <Share2 className={cn(
          "transition-all duration-300",
          isAnimating && "scale-110 rotate-12"
        )} />;
      case 'bookmark':
        return <Bookmark className={cn(
          "transition-all duration-300",
          isActive && "fill-current text-amber-500",
          isAnimating && "scale-125"
        )} />;
      case 'follow':
        return <Users className={cn(
          "transition-all duration-300",
          isAnimating && "scale-110"
        )} />;
      default:
        return null;
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return "h-8 px-2 text-xs";
      case 'lg':
        return "h-12 px-6 text-base";
      default:
        return "h-10 px-4 text-sm";
    }
  };

  const getVariantClasses = () => {
    const baseClasses = "transition-all duration-300 hover:scale-105 active:scale-95";
    
    switch (variant) {
      case 'like':
        return cn(
          baseClasses,
          isActive 
            ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100" 
            : "hover:bg-red-50 hover:text-red-600 hover:border-red-200"
        );
      case 'comment':
        return cn(baseClasses, "hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200");
      case 'share':
        return cn(baseClasses, "hover:bg-green-50 hover:text-green-600 hover:border-green-200");
      case 'bookmark':
        return cn(
          baseClasses,
          isActive 
            ? "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100" 
            : "hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200"
        );
      case 'follow':
        return cn(
          baseClasses,
          isActive 
            ? "bg-primary text-primary-foreground hover:bg-primary/90" 
            : "hover:bg-primary/10 hover:text-primary"
        );
      default:
        return baseClasses;
    }
  };

  const formatCount = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getTooltipText = () => {
    if (tooltipText) return tooltipText;
    
    switch (variant) {
      case 'like':
        return isActive ? 'Unlike' : 'Like';
      case 'comment':
        return 'Comment';
      case 'share':
        return 'Share';
      case 'bookmark':
        return isActive ? 'Remove bookmark' : 'Bookmark';
      case 'follow':
        return isActive ? 'Unfollow' : 'Follow';
      default:
        return '';
    }
  };

  const button = (
    <Button
      ref={buttonRef}
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={disabled || loading}
      className={cn(
        getSizeClasses(),
        getVariantClasses(),
        "relative overflow-hidden group",
        isAnimating && "animate-pulse",
        loading && "opacity-70 cursor-not-allowed",
        className
      )}
      aria-label={getTooltipText()}
    >
      {/* Ripple effect background */}
      <div className={cn(
        "absolute inset-0 bg-current opacity-0 group-active:opacity-10 transition-opacity duration-200",
        isAnimating && "animate-ping opacity-20"
      )} />
      
      <div className="flex items-center gap-2 relative z-10">
        <div className={cn(
          "flex-shrink-0",
          size === 'sm' ? "w-4 h-4" : size === 'lg' ? "w-6 h-6" : "w-5 h-5"
        )}>
          {loading ? (
            <div className="animate-spin rounded-full border-2 border-current border-t-transparent w-full h-full" />
          ) : (
            getIcon()
          )}
        </div>
        
        {(localCount > 0 || children) && (
          <span className={cn(
            "font-medium transition-all duration-300",
            isAnimating && "scale-110"
          )}>
            {children || formatCount(localCount)}
          </span>
        )}
      </div>
    </Button>
  );

  if (!showTooltip) return button;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {button}
        </TooltipTrigger>
        <TooltipContent>
          <p>{getTooltipText()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});

// Enhanced Post Actions with Micro-interactions
interface EnhancedPostActionsProps {
  postId: string;
  isLiked?: boolean;
  isBookmarked?: boolean;
  likesCount?: number;
  commentsCount?: number;
  sharesCount?: number;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
  onBookmark?: (postId: string) => void;
  className?: string;
}

export const EnhancedPostActions: React.FC<EnhancedPostActionsProps> = memo(({
  postId,
  isLiked = false,
  isBookmarked = false,
  likesCount = 0,
  commentsCount = 0,
  sharesCount = 0,
  onLike,
  onComment,
  onShare,
  onBookmark,
  className
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showShareMenu, setShowShareMenu] = useState(false);

  // Like mutation with optimistic updates
  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      if (isLiked) {
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('post_likes')
          .insert({ post_id: postId, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success(isLiked ? 'Post unliked' : 'Post liked!');
    },
    onError: (error) => {
      console.error('Error liking post:', error);
      toast.error('Failed to update like');
    }
  });

  // Share functionality with multiple options
  const handleShare = async () => {
    const postUrl = `${window.location.origin}/posts/${postId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out this post',
          url: postUrl
        });
        toast.success('Shared successfully!');
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          fallbackShare(postUrl);
        }
      }
    } else {
      fallbackShare(postUrl);
    }
    
    onShare?.(postId);
  };

  const fallbackShare = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  const shareOptions = [
    {
      name: 'Copy Link',
      icon: Copy,
      action: () => fallbackShare(`${window.location.origin}/posts/${postId}`)
    },
    {
      name: 'Share on LinkedIn',
      icon: ExternalLink,
      action: () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin + '/posts/' + postId)}`)
    },
    {
      name: 'Share on Twitter',
      icon: ExternalLink,
      action: () => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.origin + '/posts/' + postId)}`)
    }
  ];

  return (
    <div className={cn("flex items-center justify-between border-t border-border/50 pt-3", className)}>
      <div className="flex items-center gap-2">
        <MicroInteractionButton
          variant="like"
          isActive={isLiked}
          count={likesCount}
          onClick={() => {
            likeMutation.mutate();
            onLike?.(postId);
          }}
          loading={likeMutation.isPending}
          tooltipText={isLiked ? `Unlike (${likesCount})` : `Like (${likesCount})`}
        />

        <MicroInteractionButton
          variant="comment"
          count={commentsCount}
          onClick={() => onComment?.(postId)}
          tooltipText={`View comments (${commentsCount})`}
        />

        <div className="relative">
          <MicroInteractionButton
            variant="share"
            count={sharesCount}
            onClick={handleShare}
            tooltipText="Share this post"
          />
          
          {showShareMenu && (
            <Card className="absolute top-full left-0 mt-2 z-50 shadow-lg border">
              <CardContent className="p-2 space-y-1">
                {shareOptions.map((option) => (
                  <Button
                    key={option.name}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => {
                      option.action();
                      setShowShareMenu(false);
                    }}
                  >
                    <option.icon className="w-4 h-4 mr-2" />
                    {option.name}
                  </Button>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <MicroInteractionButton
          variant="bookmark"
          isActive={isBookmarked}
          onClick={() => onBookmark?.(postId)}
          showTooltip={true}
          tooltipText={isBookmarked ? 'Remove bookmark' : 'Save post'}
        />

        <Button variant="ghost" size="sm" className="hover:bg-muted">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
});

// Engagement metrics with animations
interface EngagementMetricsProps {
  views?: number;
  engagement?: number;
  reach?: number;
  className?: string;
}

export const EngagementMetrics: React.FC<EngagementMetricsProps> = memo(({
  views = 0,
  engagement = 0,
  reach = 0,
  className
}) => {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const metrics = [
    { label: 'Views', value: views, icon: Eye, color: 'text-blue-600' },
    { label: 'Engagement', value: engagement, icon: TrendingUp, color: 'text-green-600' },
    { label: 'Reach', value: reach, icon: Users, color: 'text-purple-600' }
  ];

  return (
    <div className={cn("flex items-center gap-4 text-sm text-muted-foreground", className)}>
      {metrics.map((metric) => (
        <TooltipProvider key={metric.label}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1.5 hover:text-foreground transition-colors cursor-help">
                <metric.icon className={cn("w-4 h-4", metric.color)} />
                <span className="font-medium">{formatNumber(metric.value)}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{metric.label}: {metric.value.toLocaleString()}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  );
});

MicroInteractionButton.displayName = 'MicroInteractionButton';
EnhancedPostActions.displayName = 'EnhancedPostActions';
EngagementMetrics.displayName = 'EngagementMetrics';