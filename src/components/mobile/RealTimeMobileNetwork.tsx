import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import { useInfiniteNetworkFeed } from '@/hooks/useInfiniteNetworkFeed';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { supabase } from '@/integrations/supabase/client';
import { MobileLayout } from '@/components/mobile/MobileLayout';
import { MobilePullToRefresh } from '@/components/mobile/MobilePullToRefresh';
import { formatTimeAgo } from '@/utils/formatTime';
import { 
  Plus, 
  Heart, 
  MessageCircle, 
  Share2, 
  Users, 
  Wifi, 
  WifiOff,
  RefreshCw,
  Send,
  Camera,
  MoreHorizontal
} from 'lucide-react';
import { EnhancedPostMenu } from '@/components/posts/EnhancedPostMenu';
import { useUrlDetection } from '@/hooks/useUrlDetection';
import LinkPreview from '@/components/shared/LinkPreview';

interface MobileNetworkPost {
  id: string;
  content: string;
  author: {
    name: string;
    avatar?: string;
    title?: string;
  };
  timeAgo: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  media?: string[];
}

export const RealTimeMobileNetwork: React.FC = () => {
  const { user } = useAuth();
  const { triggerHaptic } = useHapticFeedback();
  const { isOnline, sync, lastSync, pendingOperations } = useRealtimeSync();
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch
  } = useInfiniteNetworkFeed({ type: 'all' });

  // Flatten all pages into a single array
  const posts = data?.pages.flatMap(page => page.data) || [];

  // Transform posts for mobile display
  const mobilePosts: MobileNetworkPost[] = posts.map(post => ({
    id: post.id,
    content: post.content || '',
    author: {
      name: post.profiles?.full_name || 'Unknown User',
      avatar: post.profiles?.profile_picture_url || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
      title: post.profiles?.title || 'Professional'
    },
    timeAgo: formatTimeAgo(post.created_at),
    likes: post.likes_count || 0,
    comments: post.comments_count || 0,
    shares: post.shares_count || 0,
    isLiked: false, // TODO: Check if user has liked
    media: post.media_urls
  }));

  const handleRefresh = async () => {
    triggerHaptic('light');
    if (isOnline) {
      await refetch();
      await sync('posts', { action: 'refresh' });
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    triggerHaptic('medium');

    try {
      const postData = {
        content: newPostContent.trim(),
        author_id: user?.id,
        created_at: new Date().toISOString()
      };

      if (isOnline) {
        // Try immediate creation
        const { error } = await supabase.from('posts').insert({
          content: newPostContent.trim(),
          author_id: user?.id,
          user_id: user?.id,
          is_public: true,
          status: 'published',
          post_type: 'text'
        });
        if (error) throw error;
      } else {
        // Queue for offline
        await sync('posts', { 
          action: 'create', 
          data: {
            content: newPostContent.trim(),
            author_id: user?.id,
            user_id: user?.id,
            is_public: true,
            status: 'published',
            post_type: 'text'
          }
        });
      }

      setNewPostContent('');
      setShowCreatePost(false);
      triggerHaptic('success');
      
      // Optimistically update UI
      await refetch();

    } catch (error) {
      console.error('Error creating post:', error);
      
      // Queue for retry
      await sync('posts', { 
        action: 'create', 
        data: {
          content: newPostContent.trim(),
          author_id: user?.id,
          user_id: user?.id,
          is_public: true,
          status: 'published',
          post_type: 'text'
        }
      });
      
      setNewPostContent('');
      setShowCreatePost(false);
      triggerHaptic('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (postId: string) => {
    triggerHaptic('success');
    await sync('posts', { action: 'like', postId });
    await refetch(); // Refresh to show updated like count
  };

  const handleComment = (postId: string) => {
    triggerHaptic('light');
    // TODO: Open comment modal or navigate to post detail
    console.log('Comment on post:', postId);
  };

  const handleShare = (postId: string) => {
    triggerHaptic('light');
    // TODO: Implement share functionality
    console.log('Share post:', postId);
  };

  if (isError) {
    return (
      <MobileLayout>
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="text-center space-y-4">
            <div className="text-destructive text-lg font-semibold">Failed to load network</div>
            <p className="text-muted-foreground">{error?.message}</p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>

      <MobilePullToRefresh onRefresh={handleRefresh}>
        <div className="min-h-screen bg-background">
          
          {/* Header */}
          <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b">
            <div className="flex items-center justify-between p-4">
              <div>
                <h1 className="text-xl font-bold">Network</h1>
                <p className="text-sm text-muted-foreground">
                  {mobilePosts.length} professional updates
                </p>
              </div>
              <Button
                size="icon"
                className="rounded-full"
                onClick={() => {
                  triggerHaptic('light');
                  setShowCreatePost(true);
                }}
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Quick Post Creation */}
          <div className="p-4 border-b bg-card">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.user_metadata?.picture} />
                <AvatarFallback>
                  {user?.user_metadata?.full_name?.[0] || user?.email?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="ghost"
                className="flex-1 justify-start text-muted-foreground rounded-full bg-muted/50"
                onClick={() => {
                  triggerHaptic('light');
                  setShowCreatePost(true);
                }}
              >
                Share a professional update...
              </Button>
            </div>
          </div>

          {/* Network Feed */}
          <div className="space-y-0">
            {isLoading && mobilePosts.length === 0 ? (
              <div className="space-y-4 p-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="p-4">
                    <div className="flex items-start space-x-3 animate-pulse">
                      <div className="w-10 h-10 bg-muted rounded-full" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-1/3" />
                        <div className="h-4 bg-muted rounded w-full" />
                        <div className="h-4 bg-muted rounded w-2/3" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              mobilePosts.map((post) => {
                const PostWithFeatures = () => {
                  const { detectedUrls } = useUrlDetection(post.content);
                  
                  return (
                <Card key={post.id} className="rounded-none border-x-0 border-t-0 border-b">
                  <div className="p-4 space-y-3">
                    {/* Post Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={post.author.avatar} />
                          <AvatarFallback>
                            {post.author.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-sm">{post.author.name}</h3>
                          {post.author.title && (
                            <p className="text-xs text-muted-foreground">{post.author.title}</p>
                          )}
                          <p className="text-xs text-muted-foreground">{post.timeAgo}</p>
                        </div>
                      </div>
                      <EnhancedPostMenu
                        postId={post.id}
                        authorId={post.author.name}
                        currentUserId={post.author.name}
                        postContent={post.content}
                        isOwnPost={true}
                      />
                    </div>

                    {/* Post Content */}
                    <div className="space-y-3">
                      <p className="text-sm leading-relaxed">{post.content}</p>
                      
                      {/* Link Previews */}
                      {detectedUrls.length > 0 && (
                        <div className="space-y-2">
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
                      
                      {/* Media if present */}
                      {post.media && post.media.length > 0 && (
                        <div className="rounded-lg overflow-hidden">
                          <img 
                            src={post.media[0]} 
                            alt="Post media" 
                            className="w-full h-48 object-cover"
                          />
                        </div>
                      )}
                    </div>

                    {/* Engagement Stats */}
                    {(post.likes > 0 || post.comments > 0) && (
                      <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-3">
                        <span>{post.likes} likes</span>
                        <span>{post.comments} comments</span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-around border-t pt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`flex-1 gap-2 ${post.isLiked ? 'text-red-500' : ''}`}
                        onClick={() => handleLike(post.id)}
                      >
                        <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
                        Like
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 gap-2"
                        onClick={() => handleComment(post.id)}
                      >
                        <MessageCircle className="h-4 w-4" />
                        Comment
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 gap-2"
                        onClick={() => handleShare(post.id)}
                      >
                        <Share2 className="h-4 w-4" />
                        Share
                      </Button>
                    </div>
                  </div>
                </Card>
                  );
                };
                
                return <PostWithFeatures key={post.id} />;
              })
            )}

            {/* Enhanced Load More Section */}
            {hasNextPage && (
              <div className="p-4 text-center border-t">
                <Button
                  variant="outline"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="w-full max-w-sm mx-auto"
                >
                  {isFetchingNextPage ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span>Loading more posts...</span>
                    </div>
                  ) : (
                    'Load More Posts'
                  )}
                </Button>
              </div>
            )}
            
            {!hasNextPage && mobilePosts.length > 0 && (
              <div className="text-center py-6 border-t">
                <p className="text-sm text-muted-foreground">You've reached the end of your feed</p>
              </div>
            )}

            {mobilePosts.length === 0 && !isLoading && (
              <div className="p-8 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">Welcome to your professional network</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Connect with professionals and start sharing updates
                </p>
                <Button onClick={() => setShowCreatePost(true)}>
                  Create your first post
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Create Post Modal */}
        {showCreatePost && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
            <div className="w-full bg-background rounded-t-xl max-h-[80vh] flex flex-col">
              <div className="flex items-center justify-between p-4 border-b">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowCreatePost(false);
                    setNewPostContent('');
                  }}
                >
                  Cancel
                </Button>
                <h2 className="font-semibold">New Post</h2>
                <Button
                  onClick={handleCreatePost}
                  disabled={!newPostContent.trim() || isSubmitting}
                  size="sm"
                >
                  {isSubmitting ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-1" />
                      Post
                    </>
                  )}
                </Button>
              </div>
              
              <div className="flex-1 p-4">
                <div className="flex gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.user_metadata?.picture} />
                    <AvatarFallback>
                      {user?.user_metadata?.full_name?.[0] || user?.email?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <textarea
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      placeholder="Share your professional thoughts..."
                      className="w-full h-32 resize-none border-none outline-none bg-transparent text-base"
                      autoFocus
                    />
                  </div>
                </div>
              </div>
              
              <div className="border-t p-4">
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Camera className="h-4 w-4" />
                    Photo
                  </Button>
                  <div className="text-xs text-muted-foreground">
                    {newPostContent.length}/1000
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </MobilePullToRefresh>
    </MobileLayout>
  );
};