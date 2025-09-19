import React, { useState, useRef } from 'react';
import { useInfiniteNetworkFeed } from '@/hooks/useInfiniteNetworkFeed';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { InfiniteHomeFeed } from '@/components/feed/InfiniteHomeFeed';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Home, TrendingUp, Users, Rss, Search, Filter, Plus } from 'lucide-react';
import { toast } from 'sonner';

export const HomePage = () => {
  const [feedType, setFeedType] = useState<'all' | 'connections' | 'trending'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      refetch();
      toast.success(`Searching for "${searchTerm}"`);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    refetch();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <img 
                src="/lovable-uploads/6d89e12a-6a33-4059-acbe-49af3b255eb3.png" 
                alt="TalentXcel" 
                className="h-10 w-10 rounded-lg"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Home className="h-5 w-5 text-primary" />
                  Home Feed
                </h1>
                <p className="text-sm text-gray-600">Stay updated with your professional network</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-xs">
                {posts.length} posts loaded
              </Badge>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Create Post
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search posts, people, or topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              {searchTerm && (
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={clearSearch}
                  className="px-3"
                >
                  Clear
                </Button>
              )}
            </form>

            <Select value={feedType} onValueChange={(value: any) => setFeedType(value)}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <Rss className="h-4 w-4" />
                    All Posts
                  </div>
                </SelectItem>
                <SelectItem value="connections">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    My Network
                  </div>
                </SelectItem>
                <SelectItem value="trending">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Trending
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Quick Stats */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Feed Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Total Posts</span>
                  <Badge variant="secondary">{posts.length}</Badge>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">This Week</span>
                  <Badge variant="secondary">
                    {posts.filter(post => {
                      const postDate = new Date(post.created_at);
                      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                      return postDate >= weekAgo;
                    }).length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Trending</span>
                  <Badge variant="secondary">
                    {posts.filter(post => (post.likes_count || 0) > 10).length}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Post
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Find Connections
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-3">
            <InfiniteHomeFeed
              posts={posts}
              isLoading={isLoading}
              isError={isError}
              error={error}
              loadMoreRef={loadMoreRef}
              isFetchingNextPage={isFetchingNextPage}
              onRefresh={refetch}
              showHeader={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;