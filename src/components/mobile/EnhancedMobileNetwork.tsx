import React, { useState } from 'react';
import { useInfiniteNetworkFeed } from '@/hooks/useInfiniteNetworkFeed';
import { useAuth } from '@/contexts/AuthContext';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { MobileLayout } from '@/components/mobile/MobileLayout';
import { MobilePullToRefresh } from '@/components/mobile/MobilePullToRefresh';
import { StoryBubbles } from '@/components/mobile/StoryBubbles';
import { NetworkPost } from '@/components/mobile/NetworkPost';
import { PeopleYouMayKnow } from '@/components/mobile/PeopleYouMayKnow';
import { MobilePostCreation } from '@/components/mobile/MobilePostCreation';
import { MobileNetworkSkeleton } from '@/components/mobile/MobileNetworkSkeleton';
import { SwipeableCard } from '@/components/mobile/SwipeableCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, Heart, MessageCircle, Share2 } from 'lucide-react';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { formatTimeAgo } from '@/utils/formatTime';

export const EnhancedMobileNetwork: React.FC = () => {
  const { user } = useAuth();
  const [showCreatePost, setShowCreatePost] = useState(false);
  const { triggerHaptic } = useHapticFeedback();
  
  const {
    posts,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch
  } = useInfiniteNetworkFeed({ feedType: 'all' });

  // Infinite scroll
  const { isFetching } = useInfiniteScroll({
    hasNextPage: !!hasNextPage,
    fetchNextPage,
    threshold: 300
  });

  const handleRefresh = async () => {
    triggerHaptic('light');
    await refetch();
  };

  const handlePostInteraction = (type: 'like' | 'comment' | 'share') => {
    triggerHaptic(type === 'like' ? 'success' : 'light');
  };

  const handleSwipeLeft = (postId: string) => {
    // Could implement "save for later" or "not interested"
    triggerHaptic('medium');
    console.log('Swiped left on post:', postId);
  };

  const handleSwipeRight = (postId: string) => {
    // Could implement quick like
    triggerHaptic('success');
    console.log('Swiped right (liked) post:', postId);
  };

  const allPosts = posts || [];

  if (isLoading) {
    return (
      <MobileLayout>
        <MobileNetworkSkeleton />
      </MobileLayout>
    );
  }

  if (isError) {
    return (
      <MobileLayout>
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="text-center">
            <p className="text-destructive mb-4">Failed to load posts: {error?.message}</p>
            <Button onClick={() => refetch()}>Try again</Button>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <MobilePullToRefresh onRefresh={handleRefresh}>
        <div className="min-h-screen bg-background">
          <StoryBubbles />
          
          {/* Quick Post Creation */}
          <div className="p-4">
            <Card className="p-3 bg-card border-0 shadow-sm rounded-2xl">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.user_metadata?.picture} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {user?.user_metadata?.full_name?.[0] || user?.email?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="ghost"
                  className="flex-1 justify-start text-muted-foreground h-9 rounded-xl bg-muted/50"
                  onClick={() => {
                    triggerHaptic('light');
                    setShowCreatePost(true);
                  }}
                >
                  Share your thoughts...
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="rounded-xl"
                  onClick={() => {
                    triggerHaptic('light');
                    setShowCreatePost(true);
                  }}
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
            </Card>
          </div>
          
          {/* Posts Feed */}
          <div className="pb-20">
            {allPosts.map((post, index) => {
              // Transform post to match NetworkPost interface
              const transformedPost = {
                id: post.id,
                type: 'content' as const,
                title: post.headline || post.content?.split('\n')[0]?.substring(0, 100) || 'Professional Update',
                company: post.profiles?.current_company || post.profiles?.full_name || 'Professional',
                location: 'Remote',
                description: post.content || 'Professional update...',
                tags: post.ai_topics || ['Professional', 'Career'],
                timeAgo: formatTimeAgo(post.created_at),
                interactions: {
                  interested: post.likes_count || 0,
                  comments: post.comments_count || 0,
                  shares: post.shares_count || 0
                },
                author: {
                  name: post.profiles?.full_name || 'Professional User',
                  avatar: post.profiles?.profile_picture_url
                }
              };

              return (
                <div key={post.id}>
                  <SwipeableCard
                    onSwipeLeft={() => handleSwipeLeft(post.id)}
                    onSwipeRight={() => handleSwipeRight(post.id)}
                    className="px-4 mb-4"
                  >
                    <NetworkPost post={transformedPost} />
                  </SwipeableCard>
                  {/* Insert "People You May Know" after the second post */}
                  {index === 1 && (
                    <div className="px-4 mb-4">
                      <PeopleYouMayKnow />
                    </div>
                  )}
                </div>
              );
            })}
            
            {/* Loading more indicator */}
            {(isFetchingNextPage || isFetching) && (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            )}
            
            {allPosts.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">No posts available yet.</p>
                <p className="text-sm text-muted-foreground/70 mt-2">
                  Connect with more professionals to see their updates!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Post Creation Modal */}
        {showCreatePost && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
            <MobilePostCreation
              onClose={() => setShowCreatePost(false)}
              onPostCreated={() => {
                setShowCreatePost(false);
                triggerHaptic('success');
                refetch();
              }}
            />
          </div>
        )}
      </MobilePullToRefresh>
    </MobileLayout>
  );
};