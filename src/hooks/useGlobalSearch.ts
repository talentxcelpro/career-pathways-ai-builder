import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SearchResult {
  type: 'post' | 'user' | 'hashtag' | 'job' | 'company';
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

      // Search hashtags
      if (debouncedSearchTerm.startsWith('#') || debouncedSearchTerm.length >= 2) {
        const searchTag = debouncedSearchTerm.startsWith('#') ? debouncedSearchTerm.slice(1) : debouncedSearchTerm;
        
        // Get hashtags from recent posts
        const { data: posts } = await supabase
          .from('posts')
          .select('tags')
          .not('tags', 'is', null)
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

        if (posts) {
          const hashtagCounts: Record<string, number> = {};
          posts.forEach(post => {
            post.tags?.forEach((tag: string) => {
              if (tag.toLowerCase().includes(searchTag.toLowerCase())) {
                hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1;
              }
            });
          });

          const topHashtags = Object.entries(hashtagCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3);

          results.push(...topHashtags.map(([hashtag, count]) => ({
            type: 'hashtag' as const,
            id: hashtag,
            title: `#${hashtag}`,
            subtitle: `${count} posts`,
            url: `/network?hashtag=${hashtag}`,
            relevance: 1
          })));
        }
      }

      // Search jobs
      const { data: jobs } = await supabase
        .from('jobs')
        .select('id, title, company_name, location, slug')
        .or(`title.ilike.%${debouncedSearchTerm}%,company_name.ilike.%${debouncedSearchTerm}%,location.ilike.%${debouncedSearchTerm}%`)
        .eq('status', 'open')
        .limit(3);

      if (jobs) {
        results.push(...jobs.map(job => ({
          type: 'job' as const,
          id: job.id,
          title: job.title,
          subtitle: `${job.company_name} • ${job.location}`,
          url: job.slug ? `/jobs/${job.slug}` : `/jobs/${job.id}`,
          relevance: 1
        })));
      }

      // Search companies (from profiles)
      const { data: companies } = await supabase
        .from('profiles')
        .select('current_company')
        .ilike('current_company', `%${debouncedSearchTerm}%`)
        .not('current_company', 'is', null)
        .limit(10);

      if (companies) {
        const uniqueCompanies = [...new Set(companies.map(p => p.current_company).filter(Boolean))];
        results.push(...uniqueCompanies.slice(0, 3).map(company => ({
          type: 'company' as const,
          id: company!,
          title: company!,
          subtitle: 'Company',
          url: `/network?company=${encodeURIComponent(company!)}`,
          relevance: 1
        })));
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