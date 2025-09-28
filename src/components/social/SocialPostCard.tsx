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
import { RichUrlPreview, useUrlDetection } from './RichUrlPreview';
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

// Post Content Component with URL Detection
const PostContentWithUrls: React.FC<{
  content: string;
  isLongContent: boolean;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}> = ({ content, isLongContent, isExpanded, onToggleExpanded }) => {
  const { urls, textWithoutUrls } = useUrlDetection(content);

  return (
    <div className="space-y-3">
      <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
        {textWithoutUrls}
      </div>
      
      {urls.map((url, index) => (
        <RichUrlPreview key={index} url={url} />
      ))}
      
      {isLongContent && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleExpanded}
          className="h-auto p-0 text-sm text-blue-600 hover:text-blue-700"
        >
          {isExpanded ? 'Show less' : 'Show more'}
        </Button>
      )}
    </div>
  );
};

export const SocialPostCard: React.FC<SocialPostCardProps> = ({ 
  post, 
  showActions = true,
  className = '' 
}) => {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Use basic engagement stats from post data
  const engagementStats = {
    likesCount: post.likes_count || 0,
    commentsCount: post.comments_count || 0,
    sharesCount: post.shares_count || 0
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
          <ClickableProfile 
            profile={post.profiles}
            size="md"
            showBadge={true}
            showCompany={true}
          />
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 ml-auto">
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
            <PostContentWithUrls 
              content={displayContent}
              isLongContent={isLongContent}
              isExpanded={isExpanded}
              onToggleExpanded={() => setIsExpanded(!isExpanded)}
            />
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
        {(engagementStats.likesCount > 0 || engagementStats.commentsCount > 0 || engagementStats.sharesCount > 0) && (
          <div className="px-4 pb-2 flex items-center justify-between text-sm text-muted-foreground">
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

        {/* Action Buttons */}
        {showActions && (
          <div className="border-t">
            <EnhancedEngagementActions
              postId={post.id}
              postType="post"
              postUrl={`${window.location.origin}/posts/${post.id}`}
              postTitle={post.headline || post.content?.substring(0, 100)}
              authorId={post.author_id}
              className="px-4 py-3"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};