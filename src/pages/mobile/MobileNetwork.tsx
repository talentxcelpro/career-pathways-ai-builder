import React, { useState, useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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

  // Enhanced infinite query for better performance
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch
  } = useInfiniteQuery({
    queryKey: ['enhanced-network-feed', user?.id],
    queryFn: async ({ pageParam = 0 }) => {
      const limit = 10;
      const offset = pageParam * limit;

      // Fetch posts with enhanced performance
      const { data: postsData, error } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          headline,
          post_type,
          media_urls,
          created_at,
          author_id,
          likes_count,
          comments_count,
          shares_count,
          profiles!posts_author_id_fkey(
            id,
            full_name,
            profile_picture_url,
            headline,
            current_company
          )
        `)
        .eq('is_public', true)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return (postsData || []).map((post: any) => ({
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
    },
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.length < 10) return undefined;
      return pages.length;
    },
    initialPageParam: 0,
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  });

  // Fast memoized posts calculation
  const allPosts = useMemo(() => {
    if (!data?.pages) return [];
    
    return data.pages
      .flat()
      .sort((a, b) => {
        // Sort by engagement score for trending effect
        const aScore = a.interactions.interested + a.interactions.comments;
        const bScore = b.interactions.interested + b.interactions.comments;
        return bScore - aScore;
      });
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

  // Auto-load more when scrolled near bottom
  const handleScroll = React.useCallback((e: any) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop <= clientHeight * 1.5 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

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
        
        <ScrollArea className="h-[calc(100vh-180px)]" onScrollCapture={handleScroll}>
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
            
            {/* Loading indicator */}
            {isFetchingNextPage && (
              <div className="flex justify-center p-4">
                <RefreshCw className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}
            
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