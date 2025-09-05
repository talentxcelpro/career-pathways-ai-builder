import React, { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Eye } from 'lucide-react';
import { EnhancedSwipeableCard } from './EnhancedSwipeableCard';
import { useNetworkEngagement } from '@/hooks/useNetworkEngagement';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import { toast } from 'sonner';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';

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
  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      author: {
        id: 'user1',
        name: 'Sarah Johnson',
        avatar: '/api/placeholder/40/40',
        title: 'Senior Product Manager at TechCorp',
        verified: true
      },
      content: 'Just launched our new AI-powered feature! The team worked incredibly hard on this. Excited to see how it helps our users. #ProductLaunch #AI #Innovation',
      image: '/api/placeholder/350/200',
      timestamp: '2h',
      likes: 24,
      comments: 8,
      shares: 3,
      isLiked: false,
      isSaved: false,
      engagement_score: 8.5,
      type: 'image'
    },
    {
      id: '2',
      author: {
        id: 'user2',
        name: 'Alex Chen',
        avatar: '/api/placeholder/40/40',
        title: 'Software Engineer at StartupXYZ',
        verified: false
      },
      content: 'Looking for recommendations on the best React Native libraries for mobile app performance optimization. Any suggestions?',
      timestamp: '4h',
      likes: 12,
      comments: 15,
      shares: 2,
      isLiked: true,
      isSaved: true,
      engagement_score: 7.2,
      type: 'text'
    }
  ]);

  const [filter, setFilter] = useState<'all' | 'connections' | 'trending'>('all');
  const { sharePost, events } = useNetworkEngagement();
  const { sync, isOnline } = useRealtimeSync();
  const { triggerHaptic } = useHapticFeedback();

  const handleLike = useCallback(async (postId: string) => {
    triggerHaptic('light');
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
    
    // Sync with backend
    await sync('posts', { action: 'like', postId });
  }, [sync, triggerHaptic]);

  const handleSave = useCallback(async (postId: string) => {
    triggerHaptic('medium');
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, isSaved: !post.isSaved }
        : post
    ));
    
    await sync('posts', { action: 'save', postId });
    toast.success('Post saved to bookmarks');
  }, [sync, triggerHaptic]);

  const handleShare = useCallback(async (post: Post) => {
    try {
      await sharePost(post.id, post.author.id);
      setPosts(prev => prev.map(p => 
        p.id === post.id 
          ? { ...p, shares: p.shares + 1 }
          : p
      ));
    } catch (error) {
      console.error('Share failed:', error);
    }
  }, [sharePost]);

  const handleSwipeLeft = useCallback((postId: string) => {
    triggerHaptic('medium');
    handleSave(postId);
  }, [handleSave, triggerHaptic]);

  const handleSwipeRight = useCallback((postId: string) => {
    triggerHaptic('light');
    handleLike(postId);
  }, [handleLike, triggerHaptic]);

  const filteredPosts = posts.filter(post => {
    switch (filter) {
      case 'connections':
        return post.author.verified; // Simplified filter
      case 'trending':
        return post.engagement_score > 7;
      default:
        return true;
    }
  });

  const PostCard: React.FC<{ post: Post }> = ({ post }) => (
    <EnhancedSwipeableCard
      onSwipeLeft={() => handleSwipeLeft(post.id)}
      onSwipeRight={() => handleSwipeRight(post.id)}
      onDoubleTap={() => handleLike(post.id)}
      className="mb-3"
    >
      <Card className="bg-card border-border/50 shadow-sm">
        {/* Post Header */}
        <div className="flex items-center justify-between p-4 pb-3">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10 ring-2 ring-primary/20">
              <AvatarImage src={post.author.avatar} alt={post.author.name} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {post.author.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-1">
                <p className="text-sm font-semibold text-foreground truncate">
                  {post.author.name}
                </p>
                {post.author.verified && (
                  <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {post.author.title}
              </p>
              <p className="text-xs text-muted-foreground">{post.timestamp}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>

        {/* Post Content */}
        <div className="px-4 pb-3">
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>
        </div>

        {/* Post Media */}
        {post.image && (
          <div className="relative mb-3">
            <img 
              src={post.image} 
              alt="Post content" 
              className="w-full aspect-video object-cover bg-muted"
              loading="lazy"
            />
            {post.type === 'video' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
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
                <span>{post.likes}</span>
              </span>
              <span className="flex items-center space-x-1">
                <MessageCircle className="w-3 h-3" />
                <span>{post.comments}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Eye className="w-3 h-3" />
                <span>{Math.floor(post.engagement_score * 10)}k</span>
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-1 h-1 bg-primary rounded-full" />
              <span className="text-primary font-medium">{post.engagement_score}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleLike(post.id)}
            className={`flex items-center space-x-2 ${post.isLiked ? 'text-red-500' : 'text-muted-foreground'}`}
          >
            <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
            <span className="text-xs">Like</span>
          </Button>
          
          <Button variant="ghost" size="sm" className="flex items-center space-x-2 text-muted-foreground">
            <MessageCircle className="w-4 h-4" />
            <span className="text-xs">Comment</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleShare(post)}
            className="flex items-center space-x-2 text-muted-foreground"
          >
            <Share2 className="w-4 h-4" />
            <span className="text-xs">Share</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSave(post.id)}
            className={`flex items-center space-x-2 ${post.isSaved ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <Bookmark className={`w-4 h-4 ${post.isSaved ? 'fill-current' : ''}`} />
            <span className="text-xs">Save</span>
          </Button>
        </div>
      </Card>
    </EnhancedSwipeableCard>
  );

  return (
    <div className={`${className}`}>
      {/* Feed Filters */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/50 mb-4">
        <div className="flex items-center space-x-2 p-4">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
            className="text-xs"
          >
            All
          </Button>
          <Button
            variant={filter === 'connections' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('connections')}
            className="text-xs"
          >
            Connections
          </Button>
          <Button
            variant={filter === 'trending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('trending')}
            className="text-xs"
          >
            Trending
          </Button>
          {!isOnline && (
            <div className="ml-auto flex items-center space-x-1 text-xs text-muted-foreground">
              <div className="w-2 h-2 bg-orange-500 rounded-full" />
              <span>Offline</span>
            </div>
          )}
        </div>
      </div>

      {/* Posts Feed */}
      <div className="px-4 pb-6">
        {filteredPosts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {/* Load More */}
      <div className="px-4 pb-4">
        <Button variant="outline" className="w-full" disabled={!isOnline}>
          {isOnline ? 'Load More Posts' : 'Reconnecting...'}
        </Button>
      </div>
    </div>
  );
};