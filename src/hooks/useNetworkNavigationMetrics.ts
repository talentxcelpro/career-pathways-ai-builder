import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { FOUNDATION_NEWS_ARTICLES } from '@/data/newsArticles';

export interface NetworkLiveProfile {
  id: string;
  full_name: string | null;
  title: string | null;
  headline: string | null;
  current_company: string | null;
  location: string | null;
  profile_picture_url: string | null;
  profile_photo_url?: string | null;
  cover_image_url: string | null;
  username: string | null;
  profile_views_count?: number;
  verification_status?: string | null;
}

export interface NetworkNavigationMetrics {
  connectionCount: number;
  pendingRequestsCount: number;
  articleCount: number;
  profile: NetworkLiveProfile | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

export function useNetworkNavigationMetrics(): NetworkNavigationMetrics {
  const { user } = useAuth();
  const [connectionCount, setConnectionCount] = useState<number>(0);
  const [pendingRequestsCount, setPendingRequestsCount] = useState<number>(0);
  const [articleCount, setArticleCount] = useState<number>(() => FOUNDATION_NEWS_ARTICLES?.length || 35);
  const [profile, setProfile] = useState<NetworkLiveProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 1. Fetch live connections count (accepted)
  const fetchConnections = useCallback(async (userId: string) => {
    try {
      const { count, error } = await supabase
        .from('connections')
        .select('id', { count: 'exact', head: true })
        .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
        .eq('status', 'accepted');

      if (!error && count !== null) {
        setConnectionCount(count);
      }
    } catch (err) {
      console.error('Failed to fetch live connection count:', err);
    }
  }, []);

  // 2. Fetch pending incoming requests count
  const fetchPendingRequests = useCallback(async (userId: string) => {
    try {
      const { count, error } = await supabase
        .from('connections')
        .select('id', { count: 'exact', head: true })
        .eq('recipient_id', userId)
        .eq('status', 'pending');

      if (!error && count !== null) {
        setPendingRequestsCount(count);
      }
    } catch (err) {
      console.error('Failed to fetch pending requests count:', err);
    }
  }, []);

  // 3. Fetch real total articles count
  const fetchArticlesCount = useCallback(async () => {
    try {
      const { count, error } = await supabase
        .from('posts')
        .select('id', { count: 'exact', head: true })
        .in('post_type', ['article', 'career_article'])
        .eq('status', 'published');

      const fallbackCount = FOUNDATION_NEWS_ARTICLES?.length || 35;
      if (!error && count !== null && count > 0) {
        // Total combined database articles and curated catalog
        setArticleCount(count + fallbackCount);
      } else {
        setArticleCount(fallbackCount);
      }
    } catch {
      setArticleCount(FOUNDATION_NEWS_ARTICLES?.length || 35);
    }
  }, []);

  // 4. Fetch live profile for current user
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, title, headline, current_company, location, profile_picture_url, profile_photo_url, cover_image_url, username, profile_views_count, verification_status')
        .eq('id', userId)
        .maybeSingle();

      if (!error && data) {
        setProfile({
          ...data,
          profile_picture_url: data.profile_picture_url || data.profile_photo_url,
        });
      }
    } catch (err) {
      console.error('Failed to fetch live user profile:', err);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    await Promise.all([
      fetchConnections(user.id),
      fetchPendingRequests(user.id),
      fetchArticlesCount(),
      fetchProfile(user.id),
    ]);
    setIsLoading(false);
  }, [user?.id, fetchConnections, fetchPendingRequests, fetchArticlesCount, fetchProfile]);

  // Initial load
  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // ============================================================================
  // SUPABASE REALTIME SUBSCRIPTIONS
  // ============================================================================
  useEffect(() => {
    if (!user?.id) return;

    const channelName = `network-nav-live-${user.id}-${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      // Listen to connections changes for this user
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'connections',
          filter: `requester_id=eq.${user.id}`,
        },
        () => {
          fetchConnections(user.id);
          fetchPendingRequests(user.id);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'connections',
          filter: `recipient_id=eq.${user.id}`,
        },
        () => {
          fetchConnections(user.id);
          fetchPendingRequests(user.id);
        }
      )
      // Listen to profile changes for this user
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        () => {
          fetchProfile(user.id);
        }
      )
      // Listen to new articles/posts
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
        },
        () => {
          fetchArticlesCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchConnections, fetchPendingRequests, fetchProfile, fetchArticlesCount]);

  return {
    connectionCount,
    pendingRequestsCount,
    articleCount,
    profile,
    isLoading,
    refresh: refreshAll,
  };
}
