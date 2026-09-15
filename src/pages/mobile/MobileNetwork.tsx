import React, { useState, useMemo } from 'react';
import { useInfiniteNetworkFeed } from '@/hooks/useInfiniteNetworkFeed';
import { useAuth } from '@/contexts/AuthContext';
import { MobileNavWrapper } from '@/components/layout/MobileNavWrapper';
import { useToast } from '@/hooks/use-toast';
import { StoryBubbles } from '@/components/mobile/StoryBubbles';
import { NetworkPost } from '@/components/mobile/NetworkPost';
import { PeopleYouMayKnow } from '@/components/mobile/PeopleYouMayKnow';
import { ConnectionSuggestions } from '@/components/mobile/ConnectionSuggestions';
import { MobileNetworkingStats } from '@/components/mobile/MobileNetworkingStats';
import { MobilePostCreation } from '@/components/mobile/MobilePostCreation';
import { TrendingCarousel } from '@/components/network/TrendingCarousel';
import { JobWorldDigest } from '@/components/network/JobWorldDigest';
import { EngagementPoll } from '@/components/network/EngagementPoll';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, RefreshCw, Heart, MessageCircle } from 'lucide-react';

export const MobileNetwork = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Use the existing infinite network feed hook
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch
  } = useInfiniteNetworkFeed({ type: 'all' });

  // Transform network posts to mobile format
  const allPosts = useMemo(() => {
    if (!data?.pages) return [];
    
    return data.pages
      .flatMap(page => page.data)
      .map((post: any) => ({
        id: post.id,
        type: (post.post_type === 'job_posting' ? 'job' : 'content') as 'job' | 'content',
        title: post.headline || post.content?.split('\n')[0] || 'Professional Update',
        company: post.profiles?.current_company || post.profiles?.full_name || 'Professional',
        location: 'Remote',
        salary: post.post_type === 'job_posting' ? '$80k - $120k' : undefined,
        image: post.media_urls?.[0],
        description: post.content || 'Professional update...',
        tags: ['Professional', 'Career', 'Growth'],
        timeAgo: formatTimeAgo(post.created_at),
        interactions: {
          interested: post.likes_count || Math.floor(Math.random() * 100) + 10,
          comments: post.comments_count || Math.floor(Math.random() * 50) + 5,
          shares: post.shares_count || Math.floor(Math.random() * 20) + 2
        },
        author: {
          name: post.profiles?.full_name || 'Professional User',
          avatar: post.profiles?.profile_picture_url
        }
      }));
  }, [data]);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d`;
  };

  // Manual load more (no auto-scroll loading)
  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  // Pull to refresh functionality
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
      toast({
        title: "Feed refreshed",
        description: "Your network feed has been updated with the latest content."
      });
    } catch (error) {
      toast({
        title: "Refresh failed",
        description: "Unable to refresh feed. Please try again.",
        variant: "destructive"
      });
    } finally {
      setRefreshing(false);
    }
  };

  // Mock trending stories
  const trendingStories = [
    { id: 1, name: "Tech News", image: "/placeholder.svg" },
    { id: 2, name: "Career Tips", image: "/placeholder.svg" },
    { id: 3, name: "Industry Updates", image: "/placeholder.svg" }
  ];

  // Handler functions
  const handleLike = (post: any) => {
    console.log('Liked post:', post.id);
  };

  const handleComment = (post: any) => {
    console.log('Comment on post:', post.id);
  };

  const handleShare = (post: any) => {
    console.log('Share post:', post.id);
  };

  if (isLoading) {
    return (
      <MobileNavWrapper>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MobileNavWrapper>
    );
  }

  return (
    <MobileNavWrapper>
      <div className="min-h-screen bg-gray-50 native-app-style ios-scroll">
        {/* Trending Carousel */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200 safe-area-top">
          <div className="px-4 pt-2 pb-3">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Trending Stories</h2>
            <div className="flex gap-3 overflow-x-auto">
              {trendingStories.map((story) => (
                <div key={story.id} className="flex-shrink-0 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full mb-2"></div>
                  <p className="text-xs text-gray-600">{story.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Feed */}
        <div className="space-y-1">
          {data?.pages.map((page, pageIndex) => (
            <React.Fragment key={pageIndex}>
              {page.data.map((post: any, index: number) => (
                <div key={post.id} className="native-card mx-4 my-3 touch-feedback">
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div>
                        <h3 className="font-semibold text-sm">{post.profiles?.full_name || 'User'}</h3>
                        <p className="text-xs text-gray-500">{formatTimeAgo(post.created_at)}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-800 mb-3">{post.content}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <button onClick={() => handleLike(post)} className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {post.likes_count || 0}
                      </button>
                      <button onClick={() => handleComment(post)} className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        {post.comments_count || 0}
                      </button>
                      <button onClick={() => handleShare(post)}>Share</button>
                    </div>
                  </div>
                </div>
              ))}
            </React.Fragment>
          ))}

          {/* Load More Button */}
          {hasNextPage && (
            <div className="px-4 py-6 text-center">
              <Button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                variant="outline"
                className="w-full touch-feedback"
              >
                {isFetchingNextPage ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                    Loading...
                  </>
                ) : (
                  'Load More Posts'
                )}
              </Button>
            </div>
          )}

          {/* End of feed indicator */}
          {!hasNextPage && data && data.pages.length > 0 && (
            <div className="text-center py-8 text-sm text-muted-foreground">
              You've reached the end of your feed
            </div>
          )}
        </div>
      </div>
    </MobileNavWrapper>
  );
};