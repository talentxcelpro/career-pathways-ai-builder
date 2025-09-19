import React, { useState, useRef, useCallback } from 'react';
import { useInfiniteNetworkFeed } from '@/hooks/useInfiniteNetworkFeed';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { VirtualizedList } from '@/components/performance/VirtualizedList';
import { PostCard } from '@/components/network/PostCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  Filter, 
  TrendingUp, 
  Users, 
  RefreshCw, 
  Home,
  Plus,
  Heart,
  MessageCircle,
  Share,
  Bookmark
} from 'lucide-react';
import { toast } from 'sonner';

interface InfiniteMobileFeedProps {
  className?: string;
}

const MOBILE_ITEM_HEIGHT = 420;
const MOBILE_CONTAINER_HEIGHT = window.innerHeight - 120; // Account for header/nav

export const InfiniteMobileFeed: React.FC<InfiniteMobileFeedProps> = ({ className }) => {
  const [feedType, setFeedType] = useState<'all' | 'connections' | 'trending'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  
  const { 
    data, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage, 
    isLoading, 
    isError, 
    error, 
    refetch 
  } = useInfiniteNetworkFeed({ 
    type: feedType, 
    searchTerm: searchTerm.length >= 2 ? searchTerm : undefined 
  });

  const loadMoreRef = useRef<HTMLDivElement>(null);
  
  // Intersection observer for infinite scroll
  useIntersectionObserver(
    loadMoreRef,
    () => {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    { threshold: 0.1 }
  );

  // Flatten all pages into a single array
  const posts = data?.pages.flatMap(page => page.data) || [];

  const renderMobilePost = useCallback((post: any, index: number) => (
    <div key={post.id} className="px-4 py-3 border-b border-gray-100 bg-white">
      {/* Mobile-optimized post header */}
      <div className="flex items-center space-x-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
          {post.profiles?.full_name?.charAt(0) || 'U'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {post.profiles?.full_name || 'Unknown User'}
          </p>
          <p className="text-xs text-gray-500">
            {new Date(post.created_at).toLocaleDateString()}
          </p>
        </div>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Bookmark className="h-4 w-4" />
        </Button>
      </div>

      {/* Post content */}
      <div className="mb-3">
        <p className="text-sm text-gray-800 leading-relaxed">
          {post.content}
        </p>
        {post.media_urls && post.media_urls.length > 0 && (
          <div className="mt-3 rounded-lg overflow-hidden">
            <img 
              src={post.media_urls[0]} 
              alt="Post media" 
              className="w-full h-48 object-cover"
              loading="lazy"
            />
          </div>
        )}
      </div>

      {/* Mobile engagement actions */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <div className="flex items-center space-x-6">
          <Button variant="ghost" size="sm" className="flex items-center gap-1 text-gray-600 hover:text-red-500 p-1">
            <Heart className="h-4 w-4" />
            <span className="text-xs">{post.likes_count || 0}</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex items-center gap-1 text-gray-600 hover:text-blue-500 p-1">
            <MessageCircle className="h-4 w-4" />
            <span className="text-xs">{post.comments_count || 0}</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex items-center gap-1 text-gray-600 hover:text-green-500 p-1">
            <Share className="h-4 w-4" />
            <span className="text-xs">{post.shares_count || 0}</span>
          </Button>
        </div>
        <div className="flex items-center space-x-1">
          {post.tags?.slice(0, 2).map((tag: string, i: number) => (
            <Badge key={i} variant="secondary" className="text-xs px-2 py-1">
              #{tag}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  ), []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      refetch();
      toast.success(`Searching for "${searchTerm}"`);
    }
  };

  if (isLoading && posts.length === 0) {
    return (
      <div className={className}>
        <div className="space-y-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-4 py-3 border-b border-gray-100 bg-white">
              <div className="flex items-center space-x-3 mb-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-32 w-full rounded-lg" />
              </div>
              <div className="flex items-center space-x-4 pt-3">
                <Skeleton className="h-6 w-12" />
                <Skeleton className="h-6 w-12" />
                <Skeleton className="h-6 w-12" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={className}>
        <div className="p-4">
          <Alert variant="destructive">
            <AlertDescription className="text-center">
              <p className="mb-2">Failed to load feed</p>
              <Button size="sm" variant="outline" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Mobile Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-3">
          {!showSearch ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src="/lovable-uploads/6d89e12a-6a33-4059-acbe-49af3b255eb3.png" 
                  alt="TalentXcel" 
                  className="h-8 w-8 rounded-lg"
                />
                <h1 className="text-lg font-bold text-gray-900">Feed</h1>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowSearch(true)}
                  className="h-8 w-8 p-0"
                >
                  <Search className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <Input
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 h-9"
                autoFocus
              />
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setShowSearch(false);
                  setSearchTerm('');
                }}
                className="text-sm"
              >
                Cancel
              </Button>
            </form>
          )}
        </div>

        {/* Mobile Filter Tabs */}
        <div className="flex border-t border-gray-100">
          <button
            onClick={() => setFeedType('all')}
            className={`flex-1 py-2 text-sm font-medium ${
              feedType === 'all' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFeedType('connections')}
            className={`flex-1 py-2 text-sm font-medium ${
              feedType === 'connections' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600'
            }`}
          >
            Network
          </button>
          <button
            onClick={() => setFeedType('trending')}
            className={`flex-1 py-2 text-sm font-medium ${
              feedType === 'trending' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600'
            }`}
          >
            Trending
          </button>
        </div>
      </div>

      {/* Mobile Feed */}
      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <Home className="h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-600 mb-2">No posts yet</p>
          <p className="text-sm text-gray-500 text-center mb-4">
            Follow people or join discussions to see posts here
          </p>
          <Button size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      ) : (
        <>
          <VirtualizedList
            items={posts}
            itemHeight={MOBILE_ITEM_HEIGHT}
            containerHeight={MOBILE_CONTAINER_HEIGHT}
            renderItem={renderMobilePost}
            className="w-full"
            overscan={3}
          />
          
          {/* Load more trigger */}
          <div ref={loadMoreRef} className="py-4 text-center bg-white">
            {isFetchingNextPage && (
              <div className="flex items-center justify-center space-x-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span className="text-sm text-gray-600">Loading more...</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};