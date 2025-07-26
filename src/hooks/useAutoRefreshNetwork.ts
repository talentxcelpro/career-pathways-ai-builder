import useSWR from 'swr';
import { supabase } from '@/integrations/supabase/client';

const fetcher = async (url: string) => {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      profiles (
        id,
        full_name,
        title,
        profile_picture_url
      ),
      post_reactions (
        id,
        reaction_type,
        user_id
      ),
      post_comments (
        id,
        content,
        user_id
      )
    `)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw error;
  return data;
};

export function useAutoRefreshNetwork() {
  const { data, error, isLoading, mutate } = useSWR('network-posts', fetcher, {
    refreshInterval: 10000, // 10 seconds
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 5000,
  });

  return {
    posts: data || [],
    error,
    isLoading,
    refresh: mutate
  };
}