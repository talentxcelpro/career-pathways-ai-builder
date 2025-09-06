import React, { memo, useState, useCallback } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  Users, 
  Hash, 
  Building2, 
  MapPin,
  Clock,
  TrendingUp,
  X,
  BookOpen,
  Briefcase
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchResult {
  id: string;
  type: 'post' | 'person' | 'hashtag' | 'company';
  title: string;
  description?: string;
  metadata?: any;
  relevance_score?: number;
  url: string;
}

interface GlobalSearchDiscoveryProps {
  onResultClick?: (result: SearchResult) => void;
  className?: string;
}

const GlobalSearchDiscoveryComponent: React.FC<GlobalSearchDiscoveryProps> = ({
  onResultClick,
  className
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  
  const debouncedQuery = useDebounce(searchQuery, 300);

  // Search across multiple content types
  const { data: searchResults = [], isLoading: searchLoading } = useQuery({
    queryKey: ['global-search', debouncedQuery, selectedFilters, activeTab],
    queryFn: async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) return [];

      const results: SearchResult[] = [];

      try {
        // Search posts
        if (activeTab === 'all' || activeTab === 'posts') {
          const { data: posts } = await supabase
            .from('posts')
            .select(`
              id,
              content,
              headline,
              created_at,
              author_id,
              likes_count,
              comments_count,
              profiles!posts_user_id_fkey(full_name, profile_picture_url)
            `)
            .or(`content.ilike.%${debouncedQuery}%,headline.ilike.%${debouncedQuery}%`)
            .eq('visibility', 'public')
            .eq('is_deleted', false)
            .order('created_at', { ascending: false })
            .limit(10);

          posts?.forEach(post => {
            const relevance = calculatePostRelevance(post, debouncedQuery);
            results.push({
              id: post.id,
              type: 'post',
              title: post.headline || post.content.substring(0, 60) + '...',
              description: `By ${(post.profiles as any)?.full_name || 'User'} • ${post.likes_count || 0} likes`,
              metadata: post,
              relevance_score: relevance,
              url: `/network/posts/${post.id}`
            });
          });
        }

        // Search people
        if (activeTab === 'all' || activeTab === 'people') {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, title, current_company, profile_picture_url, headline')
            .or(`full_name.ilike.%${debouncedQuery}%,title.ilike.%${debouncedQuery}%,current_company.ilike.%${debouncedQuery}%`)
            .limit(10);

          profiles?.forEach(profile => {
            const relevance = calculateProfileRelevance(profile, debouncedQuery);
            results.push({
              id: profile.id,
              type: 'person',
              title: profile.full_name || 'Professional User',
              description: `${profile.title || 'Professional'}${profile.current_company ? ` at ${profile.current_company}` : ''}`,
              metadata: profile,
              relevance_score: relevance,
              url: `/user/${profile.id}`
            });
          });
        }

        // Search hashtags from posts
        if (activeTab === 'all' || activeTab === 'hashtags') {
          const { data: hashtagPosts } = await supabase
            .from('posts')
            .select('hashtags, created_at')
            .not('hashtags', 'is', null)
            .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

          const hashtagCounts = new Map<string, number>();
          hashtagPosts?.forEach(post => {
            post.hashtags?.forEach((tag: string) => {
              if (tag.toLowerCase().includes(debouncedQuery.toLowerCase())) {
                hashtagCounts.set(tag, (hashtagCounts.get(tag) || 0) + 1);
              }
            });
          });

          Array.from(hashtagCounts.entries())
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .forEach(([hashtag, count]) => {
              results.push({
                id: hashtag,
                type: 'hashtag',
                title: `#${hashtag}`,
                description: `${count} posts in the last 30 days`,
                metadata: { count },
                relevance_score: count,
                url: `/network/hashtag/${hashtag}`
              });
            });
        }

        // Search companies
        if (activeTab === 'all' || activeTab === 'companies') {
          const { data: companies } = await supabase
            .from('profiles')
            .select('current_company')
            .ilike('current_company', `%${debouncedQuery}%`)
            .not('current_company', 'is', null);

          const companyCounts = new Map<string, number>();
          companies?.forEach(profile => {
            if (profile.current_company) {
              companyCounts.set(
                profile.current_company,
                (companyCounts.get(profile.current_company) || 0) + 1
              );
            }
          });

          Array.from(companyCounts.entries())
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .forEach(([company, count]) => {
              results.push({
                id: company,
                type: 'company',
                title: company,
                description: `${count} professionals`,
                metadata: { count },
                relevance_score: count,
                url: `/network/company/${encodeURIComponent(company)}`
              });
            });
        }

        return results.sort((a, b) => (b.relevance_score || 0) - (a.relevance_score || 0));
      } catch (error) {
        console.error('Search error:', error);
        return [];
      }
    },
    enabled: debouncedQuery.length >= 2,
    staleTime: 30000 // Cache for 30 seconds
  });

  // Search suggestions based on trending topics
  const { data: suggestions = [] } = useQuery({
    queryKey: ['search-suggestions'],
    queryFn: async () => {
      try {
        // Get trending hashtags
        const { data: posts } = await supabase
          .from('posts')
          .select('hashtags, created_at')
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .not('hashtags', 'is', null)
          .limit(100);

        const hashtagCounts = new Map<string, number>();
        posts?.forEach(post => {
          post.hashtags?.forEach((tag: string) => {
            hashtagCounts.set(tag, (hashtagCounts.get(tag) || 0) + 1);
          });
        });

        return Array.from(hashtagCounts.entries())
          .sort(([,a], [,b]) => b - a)
          .slice(0, 8)
          .map(([hashtag]) => hashtag);
      } catch (error) {
        return [];
      }
    },
    staleTime: 5 * 60 * 1000 // Cache for 5 minutes
  });

  // Calculate relevance scores
  const calculatePostRelevance = (post: any, query: string): number => {
    let score = 0;
    const queryLower = query.toLowerCase();
    
    // Title/headline match (higher weight)
    if (post.headline?.toLowerCase().includes(queryLower)) score += 10;
    
    // Content match
    if (post.content?.toLowerCase().includes(queryLower)) score += 5;
    
    // Engagement boost
    score += (post.likes_count || 0) * 0.1 + (post.comments_count || 0) * 0.2;
    
    // Recency boost
    const hoursOld = (Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60);
    score += Math.max(0, 5 - hoursOld / 24);
    
    return score;
  };

  const calculateProfileRelevance = (profile: any, query: string): number => {
    let score = 0;
    const queryLower = query.toLowerCase();
    
    // Name match (highest weight)
    if (profile.full_name?.toLowerCase().includes(queryLower)) score += 20;
    
    // Title match
    if (profile.title?.toLowerCase().includes(queryLower)) score += 15;
    
    // Company match
    if (profile.current_company?.toLowerCase().includes(queryLower)) score += 10;
    
    return score;
  };

  // Get result icon
  const getResultIcon = (type: string) => {
    switch (type) {
      case 'post':
        return <BookOpen className="h-4 w-4" />;
      case 'person':
        return <Users className="h-4 w-4" />;
      case 'hashtag':
        return <Hash className="h-4 w-4" />;
      case 'company':
        return <Building2 className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = useCallback((suggestion: string) => {
    setSearchQuery(suggestion);
  }, []);

  // Handle filter toggle
  const toggleFilter = useCallback((filter: string) => {
    setSelectedFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  }, []);

  return (
    <Card className={`bg-card/95 backdrop-blur-sm border-border/60 ${className}`}>
      <CardContent className="p-6">
        {/* Search Header */}
        <div className="flex items-center gap-2 mb-4">
          <Search className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Discover & Search</h3>
        </div>

        {/* Search Input */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search posts, people, companies, hashtags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              onClick={() => setSearchQuery('')}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Search Suggestions */}
        {!searchQuery && suggestions.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Trending Hashtags</h4>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => handleSuggestionClick(`#${suggestion}`)}
                >
                  <Hash className="h-3 w-3 mr-1" />
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        {searchQuery && (
          <div>
            {/* Search Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                <TabsTrigger value="posts" className="text-xs">Posts</TabsTrigger>
                <TabsTrigger value="people" className="text-xs">People</TabsTrigger>
                <TabsTrigger value="hashtags" className="text-xs">Tags</TabsTrigger>
                <TabsTrigger value="companies" className="text-xs">Companies</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Results List */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              <AnimatePresence>
                {searchLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 animate-pulse">
                      <div className="h-4 w-4 bg-muted rounded" />
                      <div className="flex-1">
                        <div className="h-4 bg-muted rounded mb-1" />
                        <div className="h-3 bg-muted rounded w-3/4" />
                      </div>
                    </div>
                  ))
                ) : searchResults.length > 0 ? (
                  searchResults.map((result, index) => (
                    <motion.div
                      key={result.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30 cursor-pointer transition-colors"
                      onClick={() => {
                        onResultClick?.(result);
                        window.location.href = result.url;
                      }}
                    >
                      <div className="mt-1">
                        {getResultIcon(result.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-foreground text-sm truncate">
                            {result.title}
                          </h4>
                          <Badge variant="outline" className="text-xs">
                            {result.type}
                          </Badge>
                        </div>
                        {result.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {result.description}
                          </p>
                        )}
                      </div>
                      {result.relevance_score && result.relevance_score > 10 && (
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3 text-primary" />
                          <span className="text-xs text-primary font-medium">
                            {result.relevance_score.toFixed(0)}
                          </span>
                        </div>
                      )}
                    </motion.div>
                  ))
                ) : debouncedQuery.length >= 2 ? (
                  <div className="text-center py-4">
                    <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No results found for "{debouncedQuery}"
                    </p>
                  </div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const GlobalSearchDiscovery = memo(GlobalSearchDiscoveryComponent);
GlobalSearchDiscovery.displayName = 'GlobalSearchDiscovery';