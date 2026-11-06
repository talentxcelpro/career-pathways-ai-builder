import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Clock,
  MapPin,
  MoreHorizontal,
  Globe
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { ClickableProfile } from './ClickableProfile';
import { EnhancedEngagementActions } from './EnhancedEngagementActions';
import { UniversalPostContent } from '@/components/network/UniversalPostContent';
import { UniversalPostMedia } from '@/components/network/UniversalPostMedia';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface SocialPost {
  id: string;
  content: string;
  headline?: string;
  media_urls: string[];
  created_at: string;
  location?: string;
  post_type: 'text' | 'image' | 'video' | 'article';
  visibility: 'public' | 'connections' | 'private';
  likes_count: number;
  comments_count: number;
  shares_count: number;
  views_count: number;
  profiles: {
    id: string;
    full_name: string;
    profile_picture_url?: string;
    headline?: string;
    current_company?: string;
  };
  author_id: string;
}

interface SocialPostCardProps {
  post: SocialPost;
  showActions?: boolean;
  className?: string;
}

export const SocialPostCard: React.FC<SocialPostCardProps> = ({
  post,
  showActions = true,
  className
}) => {
  const { user } = useAuth();
  const [engagementStats, setEngagementStats] = useState({
    likesCount: post.likes_count,
    commentsCount: post.comments_count,
    sharesCount: post.shares_count
  });

  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true });

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.headline || 'TalentXcel Post',
        text: post.content?.substring(0, 100),
        url: window.location.href
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  return (
    <Card className={cn("hover:shadow-md transition-shadow w-full max-w-[680px] mx-auto rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-border/60 bg-white dark:bg-card overflow-hidden", className)}>
      <CardContent className="p-0">
        {/* Post Header */}
        <div className="p-3.5 sm:p-5 flex items-start justify-between">
          <ClickableProfile profile={post.profiles}>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
              <Clock className="w-3 h-3" />
              <span>{timeAgo}</span>
              {post.location && (
                <>
                  <span>•</span>
                  <MapPin className="w-3 h-3" />
                  <span>{post.location}</span>
                </>
              )}
              <span>•</span>
              <Globe className="w-3 h-3" />
            </div>
          </ClickableProfile>

          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {/* Post Headline & Body Content */}
        <div className="px-3.5 sm:px-5 pb-3">
          {post.headline && (
            <h3 className="font-extrabold text-base sm:text-lg mb-2 text-foreground leading-snug">
              {post.headline}
            </h3>
          )}
          
          {post.content && (
            <UniversalPostContent content={post.content} />
          )}
        </div>

        {/* Media Content — Natural Aspect Ratio, Never Cropped */}
        {post.media_urls && post.media_urls.length > 0 && (
          <div className="px-3.5 sm:px-5 pb-3">
            <UniversalPostMedia 
              mediaUrls={post.media_urls.filter(url => !url.includes('placeholder.com'))} 
              headline={post.headline} 
              postType={post.post_type} 
            />
          </div>
        )}

        {/* Engagement Stats */}
        {(engagementStats.likesCount > 0 || engagementStats.commentsCount > 0 || engagementStats.sharesCount > 0) && (
          <div className="px-3.5 sm:px-5 pb-2 flex items-center justify-between text-xs text-muted-foreground font-semibold">
            <div className="flex items-center gap-4">
              {engagementStats.likesCount > 0 && (
                <span>{engagementStats.likesCount} like{engagementStats.likesCount !== 1 ? 's' : ''}</span>
              )}
              {engagementStats.commentsCount > 0 && (
                <span>{engagementStats.commentsCount} comment{engagementStats.commentsCount !== 1 ? 's' : ''}</span>
              )}
              {engagementStats.sharesCount > 0 && (
                <span>{engagementStats.sharesCount} share{engagementStats.sharesCount !== 1 ? 's' : ''}</span>
              )}
            </div>
            {post.views_count > 0 && (
              <span>{post.views_count} views</span>
            )}
          </div>
        )}

        {/* Engagement Actions */}
        {showActions && (
          <div className="px-2 sm:px-4 py-2 border-t border-slate-100 dark:border-border/60">
            <EnhancedEngagementActions
              postId={post.id}
              authorId={post.author_id}
              postTitle={post.headline || post.content?.substring(0, 100)}
              initialLikes={post.likes_count}
              initialComments={post.comments_count}
              initialShares={post.shares_count}
              onShare={handleShare}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
