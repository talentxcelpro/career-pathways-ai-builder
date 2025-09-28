import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  TrendingUp, 
  Users, 
  FileText, 
  Hash, 
  Filter,
  Clock,
  Heart,
  MessageCircle,
  Globe,
  Lock,
  EyeOff
} from 'lucide-react';
import { useAdvancedSearch, SearchResult } from '@/hooks/useAdvancedSearch';

export const AdvancedSearchHub: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    filters,
    updateFilters,
    searchResults,
    isLoading,
    trendingTopics,
    popularHashtags
  } = useAdvancedSearch();

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'user': return <Users className="w-4 h-4" />;
      case 'post': return <FileText className="w-4 h-4" />;
      case 'group': return <Users className="w-4 h-4" />;
      case 'hashtag': return <Hash className="w-4 h-4" />;
      default: return <Search className="w-4 h-4" />;
    }
  };

  const getGroupIcon = (type?: string) => {
    switch (type) {
      case 'public': return <Globe className="w-3 h-3 text-green-500" />;
      case 'private': return <Lock className="w-3 h-3 text-yellow-500" />;
      case 'secret': return <EyeOff className="w-3 h-3 text-red-500" />;
      default: return <Globe className="w-3 h-3" />;
    }
  };

  const renderSearchResult = (result: SearchResult) => {
    return (
      <Card key={result.id} className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              {result.image_url ? (
                <Avatar className="w-10 h-10">
                  <AvatarImage src={result.image_url} />
                  <AvatarFallback>
                    {getResultIcon(result.type)}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  {getResultIcon(result.type)}
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs capitalize">
                  {result.type}
                </Badge>
                {result.type === 'group' && result.metadata?.group_type && (
                  <div className="flex items-center gap-1">
                    {getGroupIcon(result.metadata.group_type)}
                  </div>
                )}
              </div>
              
              <h3 className="font-semibold text-sm mb-1 line-clamp-1">
                {result.title}
              </h3>
              
              {result.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {result.description}
                </p>
              )}
              
              {result.type === 'post' && result.metadata && (
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    {result.metadata.likes_count}
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" />
                    {result.metadata.comments_count}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Advanced Search</h2>
          <p className="text-muted-foreground">Discover people, content, and communities</p>
        </div>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search for people, posts, groups, or hashtags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Filters */}
            <div className="flex gap-2">
              <Select 
                value={filters.type || 'all'} 
                onValueChange={(value) => updateFilters({ type: value as any })}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="users">Users</SelectItem>
                  <SelectItem value="posts">Posts</SelectItem>
                  <SelectItem value="groups">Groups</SelectItem>
                  <SelectItem value="hashtags">Hashtags</SelectItem>
                </SelectContent>
              </Select>
              
              <Select 
                value={filters.sort_by || 'relevance'} 
                onValueChange={(value) => updateFilters({ sort_by: value as any })}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="recent">Recent</SelectItem>
                  <SelectItem value="popular">Popular</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Tabs defaultValue="results" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="results">
            Search Results {searchResults.length > 0 && `(${searchResults.length})`}
          </TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="hashtags">Popular Hashtags</TabsTrigger>
        </TabsList>

        <TabsContent value="results" className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-muted rounded-full" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-1/4" />
                        <div className="h-3 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : searchResults.length > 0 ? (
            <div className="space-y-4">
              {searchResults.map(renderSearchResult)}
            </div>
          ) : searchQuery.length > 2 ? (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No results found for "{searchQuery}"</p>
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Start typing to search...</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="trending">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Trending Topics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {trendingTopics.map((topic, index) => (
                  <div 
                    key={topic.id} 
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => setSearchQuery(topic.topic)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-muted-foreground w-6">
                        #{index + 1}
                      </span>
                      <div>
                        <p className="font-medium">{topic.topic}</p>
                        <p className="text-sm text-muted-foreground">
                          {topic.mention_count} mentions
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Trending
                    </Badge>
                  </div>
                ))}
              </div>
              
              {trendingTopics.length === 0 && (
                <div className="text-center py-8">
                  <TrendingUp className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No trending topics yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hashtags">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="w-5 h-5" />
                Popular Hashtags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {popularHashtags.map((hashtag) => (
                  <Badge 
                    key={hashtag.id}
                    variant="outline" 
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                    onClick={() => setSearchQuery(`#${hashtag.tag}`)}
                  >
                    #{hashtag.tag} ({hashtag.usage_count})
                  </Badge>
                ))}
              </div>
              
              {popularHashtags.length === 0 && (
                <div className="text-center py-8">
                  <Hash className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No hashtags yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};