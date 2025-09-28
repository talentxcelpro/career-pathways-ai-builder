import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Briefcase, 
  Users, 
  Video, 
  MoreHorizontal,
  MessageCircle,
  Share2
} from 'lucide-react';
import { UserFollowButton } from '@/components/social/UserFollowButton';
import { ClickableProfile } from '@/components/social/ClickableProfile';
import { EnhancedPostContent } from '@/components/social/EnhancedPostContent';
import { ReactionPicker } from '@/components/social/ReactionPicker';
import { ReactionSummary } from '@/components/social/ReactionSummary';
import { VideoThumbnail } from '@/components/media/VideoThumbnail';
import { useEnhancedReactions } from '@/hooks/useEnhancedReactions';
import { useSocialInteractions } from '@/hooks/useSocialInteractions';

interface Post {
  id: string;
  author_id: string;
  content: string;
  media_url?: string;
  video_url?: string;
  post_type: 'text' | 'image' | 'video' | 'poll' | 'achievement' | 'job_update';
  likes_count: number;
  comments_count: number;
  shares_count: number;
  created_at: string;
  author?: {
    id?: string;
    full_name: string;
    profile_picture_url?: string;
    title?: string;
    user_role: string;
    username?: string;
    slug?: string;
  };
  liked_by_user?: boolean;
}

interface PostCardProps {
  post: Post;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onComment, onShare }) => {
  const { reactions, toggleReaction, isUpdating, getTotalReactions } = useEnhancedReactions(post.id);
  const { interactions } = useSocialInteractions(post.id);

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'achievement': return <TrendingUp className="w-4 h-4" />;
      case 'job_update': return <Briefcase className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'poll': return <Users className="w-4 h-4" />;
      default: return null;
    }
  };

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'achievement': return 'bg-success/10 text-success';
      case 'job_update': return 'bg-primary/10 text-primary';
      case 'video': return 'bg-red-500/10 text-red-500';
      case 'poll': return 'bg-accent/10 text-accent';
      default: return 'bg-muted/10 text-muted-foreground';
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex space-x-4">
          {post.author && (
            <ClickableProfile 
              profile={{
                id: post.author.id || post.author_id,
                full_name: post.author.full_name,
                profile_picture_url: post.author.profile_picture_url,
                headline: post.author.title,
                username: post.author.username,
                slug: post.author.slug
              }}
              size="md"
              showBadge={false}
              showCompany={false}
            />
          )}
          
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {post.author?.title} • {new Date(post.created_at).toLocaleDateString()}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                {post.post_type !== 'text' && (
                  <Badge variant="secondary" className={getPostTypeColor(post.post_type)}>
                    {getPostTypeIcon(post.post_type)}
                    <span className="ml-1 capitalize">{post.post_type.replace('_', ' ')}</span>
                  </Badge>
                )}
                {post.author?.id && (
                  <UserFollowButton userId={post.author.id} size="sm" showText={false} />
                )}
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {/* Enhanced Post Content */}
            <EnhancedPostContent content={post.content} />
            
            {post.media_url && (
              <img 
                src={post.media_url} 
                alt="Post media" 
                className="rounded-lg max-w-full h-auto"
              />
            )}
            
            {post.video_url && (
              <div className="mt-3">
                <VideoThumbnail 
                  url={post.video_url} 
                  className="max-w-full"
                  onClick={() => window.open(post.video_url, '_blank')}
                />
              </div>
            )}
            
            {/* Reaction Summary */}
            {getTotalReactions() > 0 && (
              <div className="pt-2">
                <ReactionSummary reactions={reactions} />
              </div>
            )}
            
            {/* Enhanced Engagement Actions */}
            <div className="pt-3 border-t flex items-center justify-between">
            <div className="flex items-center gap-1">
                {/* Enhanced Reaction Button */}
                <ReactionPicker
                  onReaction={toggleReaction}
                  currentReaction={'userReaction' in reactions ? reactions.userReaction : undefined}
                  disabled={isUpdating}
                >
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className={`gap-2 ${'userReaction' in reactions && reactions.userReaction ? 'text-primary' : ''}`}
                    disabled={isUpdating}
                  >
                    <span className="text-lg">
                      {'userReaction' in reactions && reactions.userReaction ? 
                        reactions.userReaction === 'like' ? '👍' :
                        reactions.userReaction === 'love' ? '❤️' :
                        reactions.userReaction === 'laugh' ? '😂' :
                        reactions.userReaction === 'wow' ? '😮' :
                        reactions.userReaction === 'sad' ? '😢' :
                        reactions.userReaction === 'angry' ? '😡' : '👍'
                        : '👍'
                      }
                    </span>
                    <span className="text-sm">
                      {'userReaction' in reactions && reactions.userReaction ? 'Reacted' : 'React'}
                    </span>
                  </Button>
                </ReactionPicker>

                {/* Comment Button */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-2"
                  onClick={() => onComment?.(post.id)}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm">Comment ({interactions.commentsCount})</span>
                </Button>

                {/* Share Button */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-2"
                  onClick={() => onShare?.(post.id)}
                >
                  <Share2 className="w-4 h-4" />
                  <span className="text-sm">Share ({interactions.sharesCount})</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};