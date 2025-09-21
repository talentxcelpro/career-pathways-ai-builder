import React, { useState, useMemo } from 'react';
import { useInfiniteNetworkFeed } from '@/hooks/useInfiniteNetworkFeed';
import { useAuth } from '@/contexts/AuthContext';
import { MobileLayout } from '@/components/mobile/MobileLayout';
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
import { Plus, RefreshCw } from 'lucide-react';

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

  if (isLoading) {
    return (
      <MobileLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Trending Carousel */}
        <TrendingCarousel />
        
        <StoryBubbles />
        
        {/* Quick Post Creation */}
        <div className="px-4 pb-2">
          <Card className="p-3 bg-white/95 backdrop-blur-sm border-0 shadow-sm rounded-2xl">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.user_metadata?.picture} />
                <AvatarFallback className="bg-primary text-white text-sm">
                  {user?.user_metadata?.full_name?.[0] || user?.email?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="ghost"
                className="flex-1 justify-start text-gray-500 h-9 rounded-xl bg-gray-50"
                onClick={() => setShowCreatePost(true)}
              >
                Share your thoughts...
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="rounded-xl"
                onClick={() => setShowCreatePost(true)}
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          </Card>
        </div>
        
        <ScrollArea className="h-[calc(100vh-180px)]">
          <div className="pb-20">
            {/* Networking Stats */}
            <MobileNetworkingStats />
            
            {/* Connection Suggestions */}
            <ConnectionSuggestions />
            
            {/* Job World Digest */}
            <JobWorldDigest />
            
            {/* Engagement Poll */}
            <EngagementPoll />
            
            {/* Posts Feed */}
            {allPosts.map((post, index) => (
              <div key={post.id}>
                <NetworkPost post={post} />
                {/* Insert "People You May Know" after the third post */}
                {index === 2 && <PeopleYouMayKnow />}
              </div>
            ))}
            
            {/* Load More Button */}
            {hasNextPage && (
              <div className="flex justify-center py-8 px-4">
                <Button 
                  onClick={handleLoadMore}
                  disabled={isFetchingNextPage}
                  className="w-full max-w-sm bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl h-12 font-medium shadow-lg transition-all duration-200"
                >
                  {isFetchingNextPage ? (
                    <div className="flex items-center gap-3">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Loading more posts...</span>
                    </div>
                  ) : (
                    <span>Load More Posts</span>
                  )}
                </Button>
              </div>
            )}

            {/* End of Feed Message */}
            {!hasNextPage && allPosts.length > 0 && (
              <div className="text-center py-8 px-4">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mx-4 shadow-sm border border-gray-100">
                  <div className="text-2xl mb-2">🎉</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">You're all caught up!</h3>
                  <p className="text-gray-600 text-sm">
                    You've seen all the latest posts from your network
                  </p>
                </div>
              </div>
            )}
            
            {/* Empty State */}
            {allPosts.length === 0 && !isLoading && (
              <div className="p-8 text-center">
                <p className="text-gray-600">Welcome to your Network Feed!</p>
                <p className="text-sm text-gray-500 mt-2">Start following professionals to see trending updates</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={handleRefresh}
                  disabled={refreshing}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'Refreshing...' : 'Refresh Feed'}
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Post Creation Modal */}
        {showCreatePost && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
            <MobilePostCreation
              onClose={() => setShowCreatePost(false)}
              onPostCreated={() => {
                setShowCreatePost(false);
                refetch();
              }}
            />
          </div>
        )}
      </div>
    </MobileLayout>
  );
};