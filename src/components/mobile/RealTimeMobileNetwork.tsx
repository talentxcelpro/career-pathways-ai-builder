import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserAvatar } from '@/components/common/UserAvatar';
import { useAuth } from '@/contexts/AuthContext';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import { useInfiniteNetworkFeed } from '@/hooks/useInfiniteNetworkFeed';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { supabase } from '@/integrations/supabase/client';
import { MobileLayout } from '@/components/mobile/MobileLayout';
import { MobilePullToRefresh } from '@/components/mobile/MobilePullToRefresh';
import { MobileUserProfileModal } from '@/components/mobile/MobileUserProfileModal';
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

interface MobileNetworkPost {
  id: string;
  content: string;
  author_id?: string;
  user_id?: string;
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

interface RealTimeMobileNetworkProps {
  activeFilter?: 'all' | 'connections' | 'trending';
}

export const RealTimeMobileNetwork: React.FC<RealTimeMobileNetworkProps> = ({ 
  activeFilter = 'all' 
}) => {
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
  } = useInfiniteNetworkFeed({ type: activeFilter });

  // Real-time subscription for posts
  useEffect(() => {
    const channel = supabase
      .channel('posts_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts'
        },
        () => {
          // Refetch when new posts are created
          refetch();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'posts'
        },
        () => {
          // Refetch when posts are updated (likes, etc.)
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  // Flatten all pages into a single array
  const posts = data?.pages.flatMap(page => page.data) || [];

  // Transform posts for mobile display with diagnostics
  const mobilePosts: MobileNetworkPost[] = posts.map(post => {
    console.log('🔍 Post transform:', { 
      postId: post.id, 
      authorId: post.author_id, 
      userId: post.user_id,
      profiles: post.profiles,
      fullName: post.profiles?.full_name
    });
    
    return {
      id: post.id,
      content: post.content || '',
      author_id: post.author_id,
      user_id: post.user_id,
      author: {
        name: post.profiles?.full_name || 'Unknown User',
        avatar: post.profiles?.profile_picture_url || post.profiles?.avatar_url,
        title: post.profiles?.title
      },
      timeAgo: formatTimeAgo(post.created_at),
      likes: post.likes_count || 0,
      comments: post.comments_count || 0,
      shares: post.shares_count || 0,
      isLiked: post.isLiked || false,
      media: post.media_urls
    };
  });

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
    try {
      triggerHaptic('success');
      if (!user?.id) throw new Error('Please sign in to like posts');

      // Check if like exists
      const { data: existingLike } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingLike) {
        // Unlike
        const { error: delErr } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
        if (delErr) throw delErr;
        // Decrement counter via RPC if available
        await supabase.rpc('decrement_post_likes', { post_id: postId });
      } else {
        // Like
        const { error: insErr } = await supabase
          .from('post_likes')
          .insert({ post_id: postId, user_id: user.id });
        if (insErr) throw insErr;
        // Increment counter via RPC if available
        await supabase.rpc('increment_post_likes', { post_id: postId });
      }

      await refetch();
    } catch (e) {
      console.error('Like error:', e);
    }
  };

  const handleComment = async (postId: string) => {
    try {
      triggerHaptic('light');
      if (!user?.id) throw new Error('Please sign in to comment');
      const content = window.prompt('Write a comment');
      if (!content || !content.trim()) return;
      const { error: cErr } = await supabase
        .from('post_comments')
        .insert({ post_id: postId, user_id: user.id, content: content.trim() });
      if (cErr) throw cErr;
      await refetch();
    } catch (e) {
      console.error('Comment error:', e);
    }
  };

  const handleShare = (postId: string) => {
    try {
      triggerHaptic('light');
      const shareUrl = `${window.location.origin}/post/${postId}`;
      const text = 'Check out this post on Career Network';
      if (navigator.share) {
        navigator.share({ title: 'Career Network', text, url: shareUrl });
      } else {
        // Fallback to LinkedIn/Twitter
        const linkedIn = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        const twitter = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
        window.open(linkedIn, '_blank');
        setTimeout(() => window.open(twitter, '_blank'), 300);
      }
    } catch (e) {
      console.error('Share error:', e);
    }
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
                <h1 className="text-xl font-bold">
                  {activeFilter === 'all' ? 'All Posts' : 
                   activeFilter === 'connections' ? 'My Network' : 
                   'Trending Now'}
                </h1>
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
                <AvatarImage src={user?.user_metadata?.avatar_url || user?.user_metadata?.picture} />
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
              mobilePosts.map((post) => (
                <Card key={post.id} className="rounded-none border-x-0 border-t-0 border-b">
                  <div className="p-4 space-y-3">
                     {/* Post Header */}
                     <div className="flex items-start justify-between">
                       <MobileUserProfileModal 
                         userId={post.author_id || post.user_id || ''}
                         trigger={
                           <div className="flex items-start gap-3 flex-1 cursor-pointer hover:bg-muted/20 rounded-lg p-2 -m-2 active:scale-[0.98] transition-all">
                              {/* Use reusable avatar component with robust fallbacks */}
                              <UserAvatar 
                                src={post.author.avatar || undefined}
                                userName={post.author.name}
                                size="md"
                                className="ring-2 ring-primary/10"
                              />
                             <div>
                               <h3 className="font-semibold text-sm hover:text-primary transition-colors">
                                 {post.author.name}
                               </h3>
                               {post.author.title && (
                                 <p className="text-xs text-muted-foreground">{post.author.title}</p>
                               )}
                               <p className="text-xs text-muted-foreground">{post.timeAgo}</p>
                             </div>
                           </div>
                         }
                         onConnectionChange={() => refetch()}
                       />
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 hover:bg-muted active:scale-95 transition-transform"
                        onClick={() => triggerHaptic('light')}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Post Content */}
                    <div 
                      className="space-y-3 cursor-pointer hover:bg-muted/20 rounded-lg p-2 -m-2 active:scale-[0.99] transition-all"
                      onClick={() => {
                        triggerHaptic('light');
                        // Navigate to post detail
                        console.log('View post detail:', post.id);
                      }}
                    >
                      <p className="text-sm leading-relaxed">{post.content}</p>
                      
                      {/* Media if present */}
                      {post.media && post.media.length > 0 && (
                        <div className="rounded-lg overflow-hidden">
                          <img 
                            src={post.media[0]} 
                            alt="Post media" 
                            className="w-full h-48 object-cover hover:scale-105 transition-transform"
                          />
                        </div>
                      )}
                    </div>

                    {/* Engagement Stats */}
                    {(post.likes > 0 || post.comments > 0) && (
                      <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-3">
                        <button 
                          className="hover:text-primary transition-colors active:scale-95"
                          onClick={() => {
                            triggerHaptic('light');
                            console.log('View likes for post:', post.id);
                          }}
                        >
                          {post.likes} {post.likes === 1 ? 'like' : 'likes'}
                        </button>
                        <button 
                          className="hover:text-primary transition-colors active:scale-95"
                          onClick={() => handleComment(post.id)}
                        >
                          {post.comments} {post.comments === 1 ? 'comment' : 'comments'}
                        </button>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-around border-t pt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`flex-1 gap-2 hover:bg-red-50 hover:text-red-600 active:scale-95 transition-all ${
                          post.isLiked ? 'text-red-500 bg-red-50' : 'hover:bg-muted'
                        }`}
                        onClick={() => handleLike(post.id)}
                      >
                        <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-current' : ''}`} />
                        Like
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 gap-2 hover:bg-blue-50 hover:text-blue-600 active:scale-95 transition-all"
                        onClick={() => handleComment(post.id)}
                      >
                        <MessageCircle className="h-4 w-4" />
                        Comment
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 gap-2 hover:bg-green-50 hover:text-green-600 active:scale-95 transition-all"
                        onClick={() => handleShare(post.id)}
                      >
                        <Share2 className="h-4 w-4" />
                        Share
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}

            {/* Load More */}
            {hasNextPage && (
              <div className="p-4 text-center">
                <Button
                  variant="outline"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="w-full"
                >
                  {isFetchingNextPage ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load More Posts'
                  )}
                </Button>
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