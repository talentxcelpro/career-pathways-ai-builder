import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SearchResult {
  type: 'post' | 'user' | 'hashtag';
  id: string;
  title: string;
  subtitle?: string;
  avatar?: string;
  url: string;
  relevance: number;
}

interface UseGlobalSearchProps {
  enabled?: boolean;
  debounceMs?: number;
}

export const useGlobalSearch = ({ 
  enabled = true, 
  debounceMs = 300 
}: UseGlobalSearchProps = {}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const debouncedSearchTerm = useMemo(() => {
    const timer = setTimeout(() => {
      setIsSearching(false);
    }, debounceMs);

    return searchTerm;
  }, [searchTerm, debounceMs]);

  const searchQuery = useQuery({
    queryKey: ['globalSearch', debouncedSearchTerm],
    queryFn: async (): Promise<SearchResult[]> => {
      if (!debouncedSearchTerm || debouncedSearchTerm.length < 2) {
        return [];
      }

      const results: SearchResult[] = [];

      // Search posts
      const { data: posts } = await supabase
        .from('posts')
        .select(`
          id, 
          headline, 
          content,
          created_at,
          profiles(full_name, profile_picture_url)
        `)
        .eq('status', 'published')
        .or(`headline.ilike.%${debouncedSearchTerm}%,content.ilike.%${debouncedSearchTerm}%`)
        .limit(5);

      if (posts) {
        results.push(...posts.map(post => ({
          type: 'post' as const,
          id: post.id,
          title: post.headline || post.content?.substring(0, 50) + '...' || 'Untitled Post',
          subtitle: `by ${(post.profiles as any)?.full_name || 'Unknown'}`,
          avatar: (post.profiles as any)?.profile_picture_url,
          url: `/network/posts/${post.id}`,
          relevance: 1
        })));
      }

      // Search users
      const { data: users } = await supabase
        .from('profiles')
        .select('id, full_name, title, profile_picture_url, username, slug')
        .or(`full_name.ilike.%${debouncedSearchTerm}%,title.ilike.%${debouncedSearchTerm}%,username.ilike.%${debouncedSearchTerm}%`)
        .limit(5);

      if (users) {
        results.push(
          ...users.map((user: any) => {
            const clean = (v?: string | null) => (v && v.startsWith('@') ? v.slice(1) : v);
            const username = clean(user.username);
            const slug = clean(user.slug);
            const profilePath = username
              ? `/${username}`
              : slug
              ? `/${slug}`
              : `/p/${user.id}`; // Fallback to public profile by ID
            return {
              type: 'user' as const,
              id: user.id,
              title: user.full_name || 'Unknown User',
              subtitle: user.title || 'Professional',
              avatar: user.profile_picture_url,
              url: profilePath,
              relevance: 1,
            } as SearchResult;
          })
        );
      }

      // Search hashtags if term starts with #
      if (debouncedSearchTerm.startsWith('#')) {
        const hashtag = debouncedSearchTerm.slice(1);
        const { data: hashtags } = await supabase
          .from('trending_hashtags')
          .select('hashtag, count')
          .ilike('hashtag', `%${hashtag}%`)
          .order('count', { ascending: false })
          .limit(3);

        if (hashtags) {
          results.push(...hashtags.map(tag => ({
            type: 'hashtag' as const,
            id: tag.hashtag,
            title: `#${tag.hashtag}`,
            subtitle: `${tag.count} posts`,
            url: `/network?hashtag=${tag.hashtag}`,
            relevance: 1
          })));
        }
      }

      return results;
    },
    enabled: enabled && debouncedSearchTerm.length >= 2,
    staleTime: 30000, // 30 seconds
  });

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    setIsSearching(term.length >= 2);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setIsSearching(false);
  }, []);

  return {
    searchTerm,
    handleSearch,
    clearSearch,
    results: searchQuery.data || [],
    isLoading: searchQuery.isLoading || isSearching,
    error: searchQuery.error
  };
};