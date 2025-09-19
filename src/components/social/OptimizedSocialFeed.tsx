import React, { memo, useMemo, useCallback, useState, useEffect } from 'react';
import { useOptimizedQuery } from '@/hooks/useOptimizedQuery';
import { FastImageLoader } from '@/components/performance/FastImageLoader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Play } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useSocialInteractions } from '@/hooks/useSocialInteractions';
import { formatDistanceToNow } from 'date-fns';

interface Post {
  id: string;
  content: string;
  media_urls?: string[];
  user_id?: string;
  author_id?: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  user: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  tags?: string[];
  location?: string;
}

interface OptimizedSocialFeedProps {
  feedType?: 'explore' | 'following' | 'trending';
  userId?: string;
}

const PostCard = memo<{ post: Post; onInteraction: (postId: string, type: string) => void }>(({ post, onInteraction }) => {
  const { interactions, toggleLike, toggleBookmark } = useSocialInteractions(post.id);

  const handleInteraction = useCallback((type: string) => {
    switch (type) {
      case 'like':
        toggleLike();
        break;
      case 'bookmark':
        toggleBookmark();
        break;
      default:
        onInteraction(post.id, type);
    }
  }, [post.id, toggleLike, toggleBookmark, onInteraction]);

  const timeAgo = useMemo(() => 
    formatDistanceToNow(new Date(post.created_at), { addSuffix: true }), 
    [post.created_at]
  );

  return (
    <Card className="mb-4 border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        {/* User Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.user.avatar_url} />
              <AvatarFallback>{post.user.full_name?.[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">{post.user.full_name}</p>
              <p className="text-xs text-muted-foreground">{timeAgo}</p>
              {post.location && (
                <p className="text-xs text-muted-foreground">📍 {post.location}</p>
              )}
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="mb-3">
          <p className="text-sm leading-relaxed">{post.content}</p>
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {post.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs px-2 py-1">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Media */}
        {!!post.media_urls && post.media_urls.length > 0 && (
          <div className="mb-3 relative">
            {/\.(mp4|mov|webm|avi)$/i.test(post.media_urls[0] || '') ? (
              <div className="relative">
                <FastImageLoader
                  src={post.media_urls[0]!}
                  alt="Post video thumbnail"
                  className="rounded-lg"
                  aspectRatio="16/9"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button size="lg" className="rounded-full">
                    <Play className="h-6 w-6 ml-1" />
                  </Button>
                </div>
              </div>
            ) : (
              <FastImageLoader
                src={post.media_urls[0]!}
                alt="Post image"
                className="rounded-lg"
                aspectRatio="16/9"
              />
            )}
          </div>
        )}

        {/* Interactions */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              size="sm"
              className={`gap-2 ${interactions.isLiked ? 'text-red-500' : ''}`}
              onClick={() => handleInteraction('like')}
            >
              <Heart className={`h-4 w-4 ${interactions.isLiked ? 'fill-current' : ''}`} />
              <span className="text-xs">{post.likes_count}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => handleInteraction('comment')}
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-xs">{post.comments_count}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => handleInteraction('share')}
            >
              <Share2 className="h-4 w-4" />
              <span className="text-xs">{post.shares_count}</span>
            </Button>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className={interactions.isBookmarked ? 'text-blue-500' : ''}
            onClick={() => handleInteraction('bookmark')}
          >
            <Bookmark className={`h-4 w-4 ${interactions.isBookmarked ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

PostCard.displayName = 'PostCard';

export const OptimizedSocialFeed = memo<OptimizedSocialFeedProps>(({ 
  feedType = 'explore',
  userId 
}) => {
  const [page, setPage] = useState(1);
  const [allPosts, setAllPosts] = useState<Post[]>([]);

  const fetchPosts = useCallback(async () => {
    let query = (supabase as any)
      .from('posts' as any)
      .select(`
        id,
        content,
        media_urls,
        author_id,
        created_at,
        likes_count,
        comments_count,
        shares_count,
        tags,
        location,
        user:profiles!posts_author_id_fkey(
          id,
          full_name,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false })
      .range((page - 1) * 10, page * 10 - 1);

    if (feedType === 'following' && userId) {
      // Add following filter when implemented
    }

    const { data, error } = await query;
    if (error) throw error;

    return data as unknown as Post[];
  }, [feedType, userId, page]);

  const { data: posts = [], isLoading, error } = useOptimizedQuery({
    queryKey: ['social-feed', feedType, userId, page.toString()],
    queryFn: fetchPosts,
    staleTime: 2 * 60 * 1000 // 2 minutes for real-time feel
  });

  // Merge new posts with existing ones
  useEffect(() => {
    if (posts && posts.length > 0) {
      if (page === 1) {
        setAllPosts(posts);
      } else {
        setAllPosts(prev => [...prev, ...posts]);
      }
    }
  }, [posts, page]);

  const handleInteraction = useCallback((postId: string, type: string) => {
    console.log(`${type} interaction for post ${postId}`);
    // Handle interactions
  }, []);

  const renderPost = useCallback((post: Post, index: number) => (
    <PostCard key={post.id} post={post} onInteraction={handleInteraction} />
  ), [handleInteraction]);

  const loadMore = useCallback(() => {
    setPage(prev => prev + 1);
  }, []);

  if (isLoading && allPosts.length === 0) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 bg-muted rounded-full" />
                <div className="space-y-1">
                  <div className="h-4 w-32 bg-muted rounded" />
                  <div className="h-3 w-20 bg-muted rounded" />
                </div>
              </div>
              <div className="space-y-2 mb-3">
                <div className="h-4 w-full bg-muted rounded" />
                <div className="h-4 w-3/4 bg-muted rounded" />
              </div>
              <div className="h-40 bg-muted rounded-lg" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {allPosts.map((post, index) => renderPost(post, index))}
      
      {posts && posts.length === 10 && (
        <div className="text-center py-4">
          <Button 
            onClick={loadMore} 
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}
    </div>
  );
});

OptimizedSocialFeed.displayName = 'OptimizedSocialFeed';