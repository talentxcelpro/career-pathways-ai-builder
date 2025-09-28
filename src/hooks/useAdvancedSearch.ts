import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface SearchResult {
  id: string;
  type: 'user' | 'post' | 'group' | 'hashtag';
  title: string;
  description?: string;
  image_url?: string;
  metadata?: any;
  relevance_score?: number;
}

export interface SearchFilters {
  type?: 'all' | 'users' | 'posts' | 'groups' | 'hashtags';
  location?: string;
  date_range?: 'all' | 'today' | 'week' | 'month' | 'year';
  sort_by?: 'relevance' | 'recent' | 'popular';
}

export const useAdvancedSearch = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    type: 'all',
    sort_by: 'relevance'
  });

  // Perform search
  const { data: searchResults = [], isLoading, refetch } = useQuery({
    queryKey: ['search', searchQuery, filters],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];

      const results: SearchResult[] = [];

      // Search users
      if (filters.type === 'all' || filters.type === 'users') {
        const { data: users } = await supabase
          .from('profiles')
          .select('id, full_name, title, profile_picture_url, location')
          .or(`full_name.ilike.%${searchQuery}%,title.ilike.%${searchQuery}%`)
          .limit(10);

        if (users) {
          results.push(...users.map(user => ({
            id: user.id,
            type: 'user' as const,
            title: user.full_name,
            description: user.title,
            image_url: user.profile_picture_url,
            metadata: { location: user.location }
          })));
        }
      }

      // Search posts
      if (filters.type === 'all' || filters.type === 'posts') {
        const { data: posts } = await supabase
          .from('posts')
          .select(`
            id, content, created_at, likes_count, comments_count,
            profiles!posts_author_id_fkey (full_name, profile_picture_url)
          `)
          .ilike('content', `%${searchQuery}%`)
          .eq('status', 'published')
          .eq('is_public', true)
          .order('created_at', { ascending: false })
          .limit(20);

        if (posts) {
          results.push(...posts.map(post => {
            const author = Array.isArray(post.profiles) ? post.profiles[0] : post.profiles;
            return {
              id: post.id,
              type: 'post' as const,
              title: post.content.substring(0, 100) + (post.content.length > 100 ? '...' : ''),
              description: `By ${author?.full_name || 'Unknown'} • ${post.likes_count} likes • ${post.comments_count} comments`,
              image_url: author?.profile_picture_url || undefined,
              metadata: { 
                created_at: post.created_at,
                likes_count: post.likes_count,
                comments_count: post.comments_count
              }
            };
          }));
        }
      }

      // Search groups
      if (filters.type === 'all' || filters.type === 'groups') {
        const { data: groups } = await supabase
          .from('groups')
          .select('id, name, description, member_count, post_count, group_type, category')
          .or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
          .eq('is_active', true)
          .limit(10);

        if (groups) {
          results.push(...groups.map(group => ({
            id: group.id,
            type: 'group' as const,
            title: group.name,
            description: group.description || `${group.member_count} members • ${group.post_count} posts`,
            metadata: { 
              group_type: group.group_type,
              category: group.category,
              member_count: group.member_count
            }
          })));
        }
      }

      // Search hashtags
      if (filters.type === 'all' || filters.type === 'hashtags') {
        const { data: hashtags } = await supabase
          .from('hashtags')
          .select('id, tag, usage_count')
          .ilike('tag', `%${searchQuery}%`)
          .order('usage_count', { ascending: false })
          .limit(10);

        if (hashtags) {
          results.push(...hashtags.map(hashtag => ({
            id: hashtag.id,
            type: 'hashtag' as const,
            title: `#${hashtag.tag}`,
            description: `${hashtag.usage_count} posts`,
            metadata: { usage_count: hashtag.usage_count }
          })));
        }
      }

      // Sort results based on filters
      if (filters.sort_by === 'recent') {
        results.sort((a, b) => {
          const aDate = a.metadata?.created_at ? new Date(a.metadata.created_at).getTime() : 0;
          const bDate = b.metadata?.created_at ? new Date(b.metadata.created_at).getTime() : 0;
          return bDate - aDate;
        });
      } else if (filters.sort_by === 'popular') {
        results.sort((a, b) => {
          const aScore = (a.metadata?.likes_count || 0) + (a.metadata?.usage_count || 0) + (a.metadata?.member_count || 0);
          const bScore = (b.metadata?.likes_count || 0) + (b.metadata?.usage_count || 0) + (b.metadata?.member_count || 0);
          return bScore - aScore;
        });
      }

      return results;
    },
    enabled: searchQuery.trim().length > 2
  });

  // Get trending topics
  const { data: trendingTopics = [] } = useQuery({
    queryKey: ['trending-topics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trending_topics')
        .select('*')
        .order('trend_score', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    }
  });

  // Get popular hashtags
  const { data: popularHashtags = [] } = useQuery({
    queryKey: ['popular-hashtags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hashtags')
        .select('*')
        .order('usage_count', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    }
  });

  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setFilters({
      type: 'all',
      sort_by: 'relevance'
    });
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    filters,
    updateFilters,
    searchResults,
    isLoading,
    refetch,
    clearSearch,
    trendingTopics,
    popularHashtags
  };
};