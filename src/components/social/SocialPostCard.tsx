import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark,
  Clock,
  MapPin,
  MoreHorizontal,
  Send,
  Copy,
  ExternalLink,
  Globe
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { useSocialInteractions } from '@/hooks/useSocialInteractions';
import { CommentsSection } from './CommentsSection';
import { toast } from 'sonner';

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
  className = '' 
}) => {
  const { user } = useAuth();
  const { interactions, toggleLike, toggleBookmark, isLiking, isBookmarking } = useSocialInteractions(post.id);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Share functionality
  const handleShare = async (platform?: string) => {
    const shareUrl = `${window.location.origin}/posts/${post.id}`;
    const shareText = post.headline || post.content?.substring(0, 100) + '...';
    
    if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard!');
        setShowShareModal(false);
      } catch (error) {
        toast.error('Failed to copy link');
      }
      return;
    }

    if (navigator.share && !platform) {
      try {
        await navigator.share({
          title: shareText,
          text: 'Check out this post on TalentXcel',
          url: shareUrl,
        });
        toast.success('Post shared successfully!');
      } catch (error) {
        // Fallback to copy link
        try {
          await navigator.clipboard.writeText(shareUrl);
          toast.success('Link copied to clipboard!');
        } catch (copyError) {
          toast.error('Failed to share post');
        }
      }
    } else {
      // Social platform sharing
      const shareUrls = {
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
        whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
        telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`
      };

      const targetUrl = shareUrls[platform as keyof typeof shareUrls];
      if (targetUrl) {
        window.open(targetUrl, '_blank', 'width=600,height=400');
        toast.success('Opening share dialog...');
      }
    }
    setShowShareModal(false);
  };

  const hasImages = post.media_urls.some(url => /\.(jpg|jpeg|png|gif|webp)$/i.test(url));
  const hasVideos = post.media_urls.some(url => /\.(mp4|mov|webm|avi)$/i.test(url));

  const isLongContent = post.content && post.content.length > 300;
  const displayContent = isLongContent && !isExpanded 
    ? post.content.substring(0, 300) + '...' 
    : post.content;

  return (
    <Card className={`w-full hover:shadow-md transition-shadow duration-200 ${className}`}>
      <CardContent className="p-0">
        {/* Post Header */}
        <div className="p-4 flex items-start gap-3">
          <Avatar className="h-12 w-12 ring-2 ring-white shadow-sm">
            <AvatarImage src={post.profiles.profile_picture_url} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              {post.profiles.full_name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold text-sm">{post.profiles.full_name}</h4>
              {post.profiles.headline && (
                <Badge variant="secondary" className="text-xs">
                  {post.profiles.headline}
                </Badge>
              )}
              {post.profiles.current_company && (
                <span className="text-xs text-muted-foreground">
                  at {post.profiles.current_company}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              <Clock className="h-3 w-3" />
              <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
              {post.location && (
                <>
                  <MapPin className="h-3 w-3 ml-2" />
                  <span>{post.location}</span>
                </>
              )}
              <Globe className="h-3 w-3 ml-2" />
              <span className="capitalize">{post.visibility}</span>
            </div>
          </div>
          
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {/* Post Content */}
        <div className="px-4 pb-3">
          {post.headline && (
            <h3 className="font-semibold text-lg mb-2 text-gray-900">
              {post.headline}
            </h3>
          )}
          
          {post.content && (
            <div className="space-y-2">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {displayContent}
              </p>
              {isLongContent && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="h-auto p-0 text-sm text-blue-600 hover:text-blue-700"
                >
                  {isExpanded ? 'Show less' : 'Show more'}
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Media Content */}
        {post.media_urls.length > 0 && (
          <div className="px-4 pb-3">
            {post.media_urls.length === 1 ? (
              <div className="rounded-lg overflow-hidden">
                {hasImages && !post.media_urls[0].includes('placeholder.com') && (
                  <img
                    src={post.media_urls[0]}
                    alt="Post media"
                    className="w-full h-auto max-h-96 object-cover"
                    loading="lazy"
                    onError={(e) => {
                      // Hide image if it fails to load
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
                {hasVideos && !post.media_urls[0].includes('placeholder.com') && (
                  <video
                    src={post.media_urls[0]}
                    controls
                    className="w-full h-auto max-h-96 object-cover"
                    preload="metadata"
                    onError={(e) => {
                      // Hide video if it fails to load
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 rounded-lg overflow-hidden">
                {post.media_urls.filter(url => !url.includes('placeholder.com')).slice(0, 4).map((url, index) => (
                  <div key={index} className="relative aspect-square">
                    <img
                      src={url}
                      alt={`Media ${index + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        // Hide image if it fails to load
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    {index === 3 && post.media_urls.filter(url => !url.includes('placeholder.com')).length > 4 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-semibold">
                        +{post.media_urls.filter(url => !url.includes('placeholder.com')).length - 4} more
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Engagement Stats */}
        {(interactions.likesCount > 0 || interactions.commentsCount > 0 || interactions.sharesCount > 0) && (
          <div className="px-4 pb-2 flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              {interactions.likesCount > 0 && (
                <span>{interactions.likesCount} like{interactions.likesCount !== 1 ? 's' : ''}</span>
              )}
              {interactions.commentsCount > 0 && (
                <span>{interactions.commentsCount} comment{interactions.commentsCount !== 1 ? 's' : ''}</span>
              )}
              {interactions.sharesCount > 0 && (
                <span>{interactions.sharesCount} share{interactions.sharesCount !== 1 ? 's' : ''}</span>
              )}
            </div>
            {post.views_count > 0 && (
              <span>{post.views_count} views</span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        {showActions && (
          <div className="border-t px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                {/* Like Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleLike()}
                  disabled={isLiking}
                  className={`gap-1 transition-colors ${
                    interactions.isLiked ? 'text-red-600 hover:text-red-700' : 'text-gray-600 hover:text-red-600'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${interactions.isLiked ? 'fill-current' : ''}`} />
                  <span className="text-sm">Like</span>
                </Button>

                {/* Comment Button */}
                <CommentsSection
                  postId={post.id}
                  commentsCount={interactions.commentsCount}
                  onCommentAdded={() => {
                    // Refresh interactions if needed
                  }}
                />

                {/* Share Button */}
                <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 text-gray-600 hover:text-blue-600"
                    >
                      <Share2 className="h-4 w-4" />
                      <span className="text-sm">Share</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Share Post</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          variant="outline"
                          onClick={() => handleShare('linkedin')}
                          className="flex items-center gap-2"
                        >
                          <div className="w-4 h-4 bg-blue-600 rounded"></div>
                          LinkedIn
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleShare('twitter')}
                          className="flex items-center gap-2"
                        >
                          <div className="w-4 h-4 bg-sky-500 rounded"></div>
                          Twitter
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleShare('whatsapp')}
                          className="flex items-center gap-2"
                        >
                          <div className="w-4 h-4 bg-green-500 rounded"></div>
                          WhatsApp
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleShare('telegram')}
                          className="flex items-center gap-2"
                        >
                          <div className="w-4 h-4 bg-blue-500 rounded"></div>
                          Telegram
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => handleShare('copy')}
                          className="flex-1 flex items-center gap-2"
                        >
                          <Copy className="h-4 w-4" />
                          Copy Link
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleShare()}
                          className="flex-1 flex items-center gap-2"
                        >
                          <ExternalLink className="h-4 w-4" />
                          More Options
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Bookmark Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleBookmark()}
                disabled={isBookmarking}
                className={`gap-1 ${
                  interactions.isBookmarked ? 'text-yellow-600' : 'text-gray-600 hover:text-yellow-600'
                }`}
              >
                <Bookmark className={`h-4 w-4 ${interactions.isBookmarked ? 'fill-current' : ''}`} />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};