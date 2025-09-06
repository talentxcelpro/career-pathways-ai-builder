import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share2, MoreHorizontal, CheckCircle, Bookmark } from 'lucide-react';
import { MobileUserProfile } from './MobileUserProfile';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { useInfiniteQuery } from '@tanstack/react-query';

interface Post {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  headline?: string;
  media_urls?: string[];
  tags?: string[];
  likes_count?: number;
  comments_count?: number;
  shares_count?: number;
  isLiked?: boolean;
  isSaved?: boolean;
  profiles?: {
    id: string;
    full_name: string | null;
    profile_picture_url: string | null;
    title: string | null;
    current_company: string | null;
    location: string | null;
    about: string | null;
    skills: string[] | null;
    headline: string | null;
    pro_plan?: string;
    pro_status?: string;
    pro_expires_at?: string;
  };
}

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onSave: (postId: string) => void;
  onShare: (postId: string) => void;
}

const POSTS_PER_PAGE = 10;

const PostCard: React.FC<PostCardProps> = ({ post, onLike, onSave, onShare }) => {
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
  const [isSaveAnimating, setIsSaveAnimating] = useState(false);
  const [lastTap, setLastTap] = useState<number>(0);
  const [tapCount, setTapCount] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const heartRef = useRef<HTMLDivElement>(null);

  // Double-tap to like gesture
  const handleDoubleTap = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTap < DOUBLE_TAP_DELAY) {
      setTapCount(prev => prev + 1);
      
      // Trigger like on double tap
      if (!post.isLiked) {
        onLike(post.id);
        setIsLikeAnimating(true);
        
        // Show heart animation at tap location
        if (heartRef.current && cardRef.current) {
          const rect = cardRef.current.getBoundingClientRect();
          const clientX = 'touches' in e ? e.touches[0]?.clientX : (e as React.MouseEvent).clientX;
          const clientY = 'touches' in e ? e.touches[0]?.clientY : (e as React.MouseEvent).clientY;
          
          heartRef.current.style.left = `${clientX - rect.left - 20}px`;
          heartRef.current.style.top = `${clientY - rect.top - 20}px`;
          heartRef.current.style.opacity = '1';
          heartRef.current.style.transform = 'scale(1)';
          
          setTimeout(() => {
            if (heartRef.current) {
              heartRef.current.style.opacity = '0';
              heartRef.current.style.transform = 'scale(1.5)';
            }
          }, 600);
        }
        
        setTimeout(() => setIsLikeAnimating(false), 1000);
      }
    } else {
      setTapCount(1);
    }
    
    setLastTap(now);
  }, [lastTap, post.isLiked, post.id, onLike]);

  // Swipe gestures
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isLeftSwipe = distanceX > 50;
    const isRightSwipe = distanceX < -50;
    const isVerticalSwipe = Math.abs(distanceY) > Math.abs(distanceX);

    if (isVerticalSwipe) return; // Ignore vertical swipes for scrolling

    if (isLeftSwipe) {
      // Swipe left to save
      onSave(post.id);
      setIsSaveAnimating(true);
      setTimeout(() => setIsSaveAnimating(false), 500);
    } else if (isRightSwipe) {
      // Swipe right to share
      onShare(post.id);
    }
  };

  const getAuthorName = () => post?.profiles?.full_name || 'Professional User';
  const getAvatar = () => post?.profiles?.profile_picture_url || '';
  const getVerified = () => Boolean(post?.profiles?.pro_status === 'active');
  const getContent = () => post?.content || '';
  const getImage = () => post?.media_urls?.[0] || undefined;
  const getTimestamp = () => {
    try { 
      return post?.created_at ? new Date(post.created_at).toLocaleString() : ''; 
    } catch { 
      return ''; 
    }
  };
  const getLikes = () => post?.likes_count ?? 0;
  const getComments = () => post?.comments_count ?? 0;

  return (
    <Card 
      ref={cardRef}
      className="bg-white border border-gray-200 shadow-sm relative overflow-hidden animate-fade-in"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onDoubleClick={handleDoubleTap}
    >
      {/* Floating heart animation for double-tap */}
      <div
        ref={heartRef}
        className="absolute z-50 pointer-events-none transition-all duration-600 opacity-0 transform scale-75"
        style={{ transition: 'opacity 0.6s ease-out, transform 0.6s ease-out' }}
      >
        <Heart className="w-10 h-10 text-red-500 fill-current" />
      </div>

      {/* Post Header */}
      <div className="flex items-center justify-between p-4 pb-3">
        <div className="flex items-center space-x-3">
          {post.profiles && (
            <MobileUserProfile
              profile={post.profiles}
              trigger={
                <div className="flex items-center space-x-3 cursor-pointer hover-scale">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={getAvatar()} alt={getAuthorName()} />
                    <AvatarFallback className="bg-gray-200 text-gray-600">
                      {getAuthorName().split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-1">
                      <span className="font-semibold text-gray-900 text-sm">
                        {getAuthorName()}
                      </span>
                      {getVerified() && (
                        <CheckCircle className="w-4 h-4 text-blue-500 fill-current" />
                      )}
                    </div>
                    <span className="text-xs text-gray-500">{getTimestamp()}</span>
                  </div>
                </div>
              }
            />
          )}
        </div>
        <Button variant="ghost" size="icon" className="w-8 h-8 text-gray-400 hover-scale">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>

      {/* Post Content */}
      <div className="px-4 pb-3">
        <p className="text-gray-900 text-sm leading-relaxed">
          {getContent()}
        </p>
      </div>

      {/* Post Image */}
      {getImage() && (
        <div className="mb-3">
          <img 
            src={getImage() as string}
            alt={`${getAuthorName()} post image`}
            className="w-full aspect-video object-cover bg-gray-100"
            loading="lazy"
          />
        </div>
      )}

      {/* Engagement Actions */}
      <div className="px-4 py-3 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLike(post.id)}
              className={cn(
                "flex items-center space-x-2 p-0 h-auto transition-all duration-200",
                post?.isLiked ? 'text-red-500' : 'text-gray-600',
                isLikeAnimating && 'animate-pulse'
              )}
            >
              <Heart className={cn(
                "w-5 h-5 transition-all duration-200",
                post?.isLiked ? 'fill-current scale-110' : '',
                isLikeAnimating && 'animate-[heartbeat_0.6s_ease-in-out]'
              )} />
              <span className={cn(
                "text-sm font-medium transition-all duration-200",
                isLikeAnimating && 'animate-scale-in'
              )}>
                {getLikes()}
              </span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center space-x-2 p-0 h-auto text-gray-600 hover-scale"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm font-medium">{getComments()}</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onShare(post.id)}
              className="p-0 h-auto text-gray-600 hover-scale"
            >
              <Share2 className="w-5 h-5" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSave(post.id)}
            className={cn(
              "p-0 h-auto transition-all duration-200",
              post?.isSaved ? 'text-blue-600' : 'text-gray-600',
              isSaveAnimating && 'animate-pulse'
            )}
          >
            <Bookmark className={cn(
              "w-5 h-5 transition-all duration-200",
              post?.isSaved ? 'fill-current' : '',
              isSaveAnimating && 'animate-scale-in'
            )} />
          </Button>
        </div>
      </div>

      {/* Swipe indicators */}
      {touchStart && touchEnd && (
        <div className="absolute inset-0 pointer-events-none">
          {touchStart.x - touchEnd.x > 25 && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium animate-fade-in">
              Save
            </div>
          )}
          {touchEnd.x - touchStart.x > 25 && (
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium animate-fade-in">
              Share
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export const AddictiveFeed: React.FC = () => {
  const { user } = useAuth();
  const [realTimeLikes, setRealTimeLikes] = useState<Record<string, number>>({});
  const [realTimeComments, setRealTimeComments] = useState<Record<string, number>>({});
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Infinite query with predictive loading
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error
  } = useInfiniteQuery({
    queryKey: ['addictive-feed'],
    queryFn: async ({ pageParam = 0 }) => {
      const offset = pageParam * POSTS_PER_PAGE;
      
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          post_likes!left(id, user_id),
          post_comments!left(id),
          post_saves!left(id, user_id),
          profiles!inner(
            id,
            full_name,
            profile_picture_url,
            title,
            current_company,
            location,
            about,
            skills,
            headline,
            pro_plan,
            pro_status,
            pro_expires_at
          )
        `)
        .eq('visibility', 'public')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .range(offset, offset + POSTS_PER_PAGE - 1);

      if (postsError) throw postsError;

      const transformedPosts = (postsData || []).map(post => ({
        ...post,
        likes_count: (realTimeLikes[post.id] ?? post.post_likes?.length) || 0,
        comments_count: (realTimeComments[post.id] ?? post.post_comments?.length) || 0,
        shares_count: post.post_shares?.length || 0,
        isLiked: user ? post.post_likes?.some((like: any) => like.user_id === user.id) : false,
        isSaved: user ? post.post_saves?.some((save: any) => save.user_id === user.id) : false,
      }));

      return {
        posts: transformedPosts,
        nextPage: postsData.length === POSTS_PER_PAGE ? pageParam + 1 : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 0,
  });

  // Intersection Observer for infinite scroll with predictive loading
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '200px' // Start loading before user reaches the bottom
      }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Real-time updates for likes and comments
  useEffect(() => {
    const likesChannel = supabase
      .channel('post_likes_realtime')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'post_likes' }, 
        (payload) => {
          const postId = (payload.new as any)?.post_id || (payload.old as any)?.post_id;
          if (postId) {
            setRealTimeLikes(prev => ({
              ...prev,
              [postId]: payload.eventType === 'DELETE' 
                ? Math.max(0, (prev[postId] || 0) - 1)
                : (prev[postId] || 0) + 1
            }));
          }
        }
      )
      .subscribe();

    const commentsChannel = supabase
      .channel('post_comments_realtime')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'post_comments' }, 
        (payload) => {
          const postId = (payload.new as any)?.post_id || (payload.old as any)?.post_id;
          if (postId) {
            setRealTimeComments(prev => ({
              ...prev,
              [postId]: payload.eventType === 'DELETE' 
                ? Math.max(0, (prev[postId] || 0) - 1)
                : (prev[postId] || 0) + 1
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(likesChannel);
      supabase.removeChannel(commentsChannel);
    };
  }, []);

  const handleLike = useCallback(async (postId: string) => {
    if (!user) return;

    // Optimistic update
    setRealTimeLikes(prev => ({
      ...prev,
      [postId]: (prev[postId] || 0) + 1
    }));

    try {
      const { error } = await supabase
        .from('post_likes')
        .upsert([{ post_id: postId, user_id: user.id }], { onConflict: 'post_id,user_id' });
      
      if (error) throw error;
    } catch (error) {
      // Revert optimistic update
      setRealTimeLikes(prev => ({
        ...prev,
        [postId]: Math.max(0, (prev[postId] || 0) - 1)
      }));
    }
  }, [user]);

  const handleSave = useCallback(async (postId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('post_saves')
        .upsert([{ post_id: postId, user_id: user.id }], { onConflict: 'post_id,user_id' });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error saving post:', error);
    }
  }, [user]);

  const handleShare = useCallback(async (postId: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out this post',
          url: `${window.location.origin}/post/${postId}`,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback to copy to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`);
    }
  }, []);

  const allPosts = data?.pages.flatMap(page => page.posts) || [];

  if (isLoading) {
    return (
      <div className="space-y-4 mt-4 px-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="bg-white border border-gray-200 shadow-sm animate-pulse">
            <div className="p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="pb-6">
      <div className="space-y-4 mt-4 px-4">
        {allPosts.map((post, index) => (
          <PostCard
            key={`${post.id}-${index}`}
            post={post}
            onLike={handleLike}
            onSave={handleSave}
            onShare={handleShare}
          />
        ))}

        {/* Load more trigger */}
        <div ref={loadMoreRef} className="h-4">
          {isFetchingNextPage && (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>

        {!hasNextPage && allPosts.length > 0 && (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">You're all caught up! 🎉</p>
            <p className="text-xs mt-1">Share something new to keep the conversation going</p>
          </div>
        )}
      </div>
    </div>
  );
};