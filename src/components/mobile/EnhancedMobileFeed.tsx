import React, { useState, useCallback, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/common/UserAvatar';
import { getAvatarProps } from '@/utils/avatarUtils';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Eye, RefreshCw, Plus } from 'lucide-react';
import { EnhancedPostMenu } from '@/components/posts/EnhancedPostMenu';
import { PostActions } from '@/components/posts/PostActions';
import LinkPreview from '@/components/shared/LinkPreview';
import { useUrlDetection } from '@/hooks/useUrlDetection';
import { EnhancedSwipeableCard } from './EnhancedSwipeableCard';
import { useNetworkEngagement } from '@/hooks/useNetworkEngagement';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import { supabase } from '@/integrations/supabase/client';
import { useInfiniteNetworkFeed, NetworkPost } from '@/hooks/useInfiniteNetworkFeed';
import { VirtualizedNetworkFeed } from '@/components/performance/VirtualizedNetworkFeed';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { VideoContent } from '@/components/feed/VideoContent';
import { NewsCard } from '@/components/feed/NewsCard';
import { MobileCreatePost } from './MobileCreatePost';

interface Post {
  id: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    title: string;
    verified: boolean;
  };
  content: string;
  image?: string;
  video?: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  isSaved: boolean;
  engagement_score: number;
  type: 'text' | 'image' | 'video' | 'article' | 'job' | 'event';
}

interface EnhancedMobileFeedProps {
  className?: string;
}

export const EnhancedMobileFeed: React.FC<EnhancedMobileFeedProps> = ({ className = '' }) => {
  const [filter, setFilter] = useState<'all' | 'connections' | 'trending'>('all');
  const loadMoreRef = useRef<HTMLDivElement>(null);
  
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch
  } = useInfiniteNetworkFeed({ type: filter });
  
  const { sharePost } = useNetworkEngagement();
  const { sync, isOnline } = useRealtimeSync();
  const { triggerHaptic } = useHapticFeedback();

  // Flatten all pages into a single array
  const posts = data?.pages.flatMap(page => page.data) || [];

  // Mock data for videos and news (in real app, these would come from APIs)
  const mockVideos = [
    {
      id: 'video-1',
      title: 'Top 10 Interview Tips for Tech Professionals',
      description: 'Learn essential interview strategies that will help you land your dream tech job',
      thumbnailUrl: 'https://images.unsplash.com/photo-1551818255-e6e10975cd5d?w=500&h=300&fit=crop',
      videoUrl: 'https://youtube.com/watch?v=example1',
      duration: '8:45',
      views: 15420,
      likes: 892,
      comments: 156,
      channel: {
        name: 'TechCareers Pro',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        verified: true
      },
      category: 'Career Tips',
      publishedAt: '2024-01-10T10:00:00Z'
    },
    {
      id: 'video-2', 
      title: 'AI Revolution in Job Market 2024',
      description: 'How artificial intelligence is transforming the way we work and find jobs',
      thumbnailUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=500&h=300&fit=crop',
      videoUrl: 'https://youtube.com/watch?v=example2',
      duration: '12:30',
      views: 23100,
      likes: 1234,
      comments: 267,
      channel: {
        name: 'Future Work TV',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        verified: true
      },
      category: 'Industry Trends',
      publishedAt: '2024-01-08T14:30:00Z'
    }
  ];

  const mockNews = [
    {
      id: 'news-1',
      title: 'Remote Work Policies: What Companies Are Offering in 2024',
      summary: 'A comprehensive look at how major tech companies are adapting their remote work policies post-pandemic',
      imageUrl: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=500&h=300&fit=crop',
      source: 'TechNews Daily',
      author: 'Sarah Johnson',
      publishedAt: '2024-01-12T09:15:00Z',
      readTime: '4 min read',
      category: 'Workplace',
      trending: true,
      url: 'https://example.com/remote-work-2024'
    },
    {
      id: 'news-2',
      title: 'Salary Transparency Laws: Impact on Job Seekers',
      summary: 'New legislation requiring salary disclosure in job postings is changing the hiring landscape across multiple states',
      imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500&h=300&fit=crop',
      source: 'Career Insights',
      author: 'Michael Chen',
      publishedAt: '2024-01-11T16:45:00Z',
      readTime: '6 min read',
      category: 'Legal & Policy',
      trending: false,
      url: 'https://example.com/salary-transparency-2024'
    }
  ];

  // Combine and shuffle content for engaging mixed feed
  const allContent = [
    ...posts.map(post => ({ ...post, contentType: 'post' })),
    ...mockVideos.map(video => ({ ...video, contentType: 'video' })),
    ...mockNews.map(news => ({ ...news, contentType: 'news' }))
  ];

  // Sort by recency and engagement (in real app, use proper algorithm)
  const sortedContent = allContent.sort((a, b) => {
    const aDate = new Date(a.created_at || a.publishedAt);
    const bDate = new Date(b.created_at || b.publishedAt);
    return bDate.getTime() - aDate.getTime();
  });

  const handleLike = useCallback(async (postId: string) => {
    triggerHaptic('light');
    await sync('posts', { action: 'like', postId });
    // Optimistically update local state
    await refetch();
  }, [sync, triggerHaptic, refetch]);

  const handleSave = useCallback(async (postId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      toast.info('Please sign in to save posts');
      return;
    }
    
    triggerHaptic('medium');
    
    // Check if already saved
    const { data: existingSave } = await supabase
      .from('saved_posts')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', session.user.id)
      .single();
    
    if (existingSave) {
      // Remove bookmark
      await supabase
        .from('saved_posts')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', session.user.id);
    } else {
      // Add bookmark
      await supabase
        .from('saved_posts')
        .insert({ 
          post_id: postId, 
          user_id: session.user.id 
        });
      toast.success('Post saved to bookmarks');
    }
    
    await sync('posts', { action: 'save', postId });
    await refetch();
  }, [sync, triggerHaptic, refetch]);

  const handleShare = useCallback(async (post: NetworkPost) => {
    try {
      await sharePost(post.id, post.author_id);
      await refetch();
    } catch (error) {
      console.error('Share failed:', error);
    }
  }, [sharePost, refetch]);

  const handleSwipeLeft = useCallback((postId: string) => {
    triggerHaptic('medium');
    handleSave(postId);
  }, [handleSave, triggerHaptic]);

  const handleSwipeRight = useCallback((postId: string) => {
    triggerHaptic('light');
    handleLike(postId);
  }, [handleLike, triggerHaptic]);

  // Use intersection observer to trigger load more
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const PostCard: React.FC<{ post: NetworkPost }> = ({ post }) => {
    const { detectedUrls } = useUrlDetection(post.content);
    
    return (
    <EnhancedSwipeableCard
      onSwipeLeft={() => handleSwipeLeft(post.id)}
      onSwipeRight={() => handleSwipeRight(post.id)}
      onDoubleTap={() => handleLike(post.id)}
      className=""
    >
      <div className="bg-background border-0">
        {/* Post Header */}
        <div className="flex items-center justify-between p-4 pb-3">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.location.href = `/user/${post.author_id}`}>
            <UserAvatar 
              {...getAvatarProps(post.profiles)}
              size="md"
              className="ring-2 ring-primary/20"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-1">
                <p className="text-sm font-semibold text-foreground truncate hover:text-primary transition-colors">
                  {post.profiles?.full_name || 'Unknown User'}
                </p>
                {post.profiles?.is_verified && (
                  <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {post.profiles?.title || 'Professional'}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(post.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <EnhancedPostMenu
            postId={post.id}
            authorId={post.author_id || ''}
            currentUserId={post.author_id}
            postContent={post.content}
            isOwnPost={true}
          />
        </div>

        {/* Post Content */}
        <div className="px-4 pb-3">
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>
          
          {/* Link Previews */}
          {detectedUrls.length > 0 && (
            <div className="mt-3 space-y-2">
              {detectedUrls.slice(0, 1).map((urlData, index) => (
                <LinkPreview 
                  key={`${urlData.url}-${index}`}
                  url={urlData.url}
                  className="border rounded-lg"
                  compact={true}
                />
              ))}
            </div>
          )}
        </div>

        {/* Post Media */}
        {post.media_urls && post.media_urls.length > 0 && (
          <div className="relative mb-3">
            <img 
              src={post.media_urls[0]} 
              alt="Post content" 
              className="w-full aspect-square object-cover object-center bg-muted rounded-lg"
              loading="lazy"
            />
            {post.post_type === 'video' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
                <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                  <div className="w-0 h-0 border-l-[8px] border-l-primary border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent ml-1" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Engagement Stats */}
        <div className="px-4 py-2 border-t border-border/50">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1">
                <Heart className="w-3 h-3" />
                <span>{post.likes_count || 0}</span>
              </span>
              <span className="flex items-center space-x-1">
                <MessageCircle className="w-3 h-3" />
                <span>{post.comments_count || 0}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Eye className="w-3 h-3" />
                <span>{post.shares_count || 0}</span>
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-1 h-1 bg-primary rounded-full" />
              <span className="text-primary font-medium">
                {Math.round(((post.likes_count || 0) + (post.comments_count || 0)) / 10)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border/50 gap-2">
          <Button
            variant="ghost"
            size="mobile-touch"
            onClick={() => handleLike(post.id)}
            className={`flex items-center gap-2 ${(post as any).isLiked ? 'text-destructive' : 'text-muted-foreground'}`}
          >
            <Heart className={`w-4 h-4 ${(post as any).isLiked ? 'fill-current' : ''}`} />
            <span className="text-xs">Like</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="mobile-touch"
            onClick={() => window.location.href = `/network/posts/${post.id}`}
            className="flex items-center gap-2 text-muted-foreground">
            <MessageCircle className="w-4 h-4" />
            <span className="text-xs">Comment</span>
          </Button>
          
          <Button
            variant="ghost"
            size="mobile-touch"
            onClick={() => handleShare(post)}
            className="flex items-center gap-2 text-muted-foreground"
          >
            <Share2 className="w-4 h-4" />
            <span className="text-xs">Share</span>
          </Button>
          
          <Button
            variant="ghost"
            size="mobile-touch"
            onClick={() => handleSave(post.id)}
            className={`flex items-center gap-2 ${(post as any).isSaved ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <Bookmark className={`w-4 h-4 ${(post as any).isSaved ? 'fill-current' : ''}`} />
            <span className="text-xs">Save</span>
          </Button>
        </div>
      </div>
    </EnhancedSwipeableCard>
    );
  };

  return (
    <div className={`${className}`}>
      {/* Create Post Section */}
      <MobileCreatePost onPostCreate={() => refetch()} />

      {/* Posts Feed */}
      {isLoading && posts.length === 0 ? (
        <div className="px-4 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-start space-x-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : isError ? (
        <div className="px-4 py-8 text-center">
          <p className="text-muted-foreground mb-4">Failed to load posts</p>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      ) : (
        <div className="space-y-0">
          {sortedContent.map((item, index) => {
            if (item.contentType === 'post') {
              return (
                <div key={`post-${item.id}`} className="border-b border-border/10 bg-background p-4">
                  <PostCard post={item as NetworkPost} />
                </div>
              );
            } else if (item.contentType === 'video') {
              return (
                <div key={`video-${item.id}`} className="border-b border-border/10 bg-background p-4">
                  <VideoContent {...item} className="" />
                </div>
              );
            } else if (item.contentType === 'news') {
              return (
                <div key={`news-${item.id}`} className="border-b border-border/10 bg-background p-4">
                  <NewsCard {...item} className="" />
                </div>
              );
            }
            return null;
          })}
        </div>
      )}

      {/* Infinite Scroll Load More Trigger */}
      <div ref={loadMoreRef} className="px-4 pb-4">
        {isFetchingNextPage ? (
          <div className="flex items-center justify-center py-6">
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium">Loading more posts...</span>
            </div>
          </div>
        ) : hasNextPage ? (
          <div className="text-center py-4">
            <Button 
              variant="outline" 
              onClick={() => fetchNextPage()}
              className="w-full"
            >
              Load More Posts
            </Button>
          </div>
        ) : sortedContent.length > 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground">You've reached the end of your feed</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};