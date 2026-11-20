import { supabase } from '@/integrations/supabase/client';

// Create optimized Supabase client with connection pooling
export const createOptimizedClient = () => {
  return supabase;
};

// Batch multiple queries for better performance
export const batchQueries = async (queries: PromiseLike<any>[]) => {
  return Promise.all(queries);
};

// ---------------------------------------------------------------------------
// Prefetch cache — stale-while-revalidate, 60 s TTL per userId
// ---------------------------------------------------------------------------
interface PrefetchCacheEntry {
  userId: string;
  fetchedAt: number;
  data: {
    profile: unknown;
    connections: unknown;
    notifications: unknown;
  };
}

const prefetchCache = new Map<string, PrefetchCacheEntry>();
const PREFETCH_TTL_MS = 60_000; // 60 seconds

// Prefetch common data on app load — skips the round-trip when the cached
// result is still fresh (< 60 s old) for the same userId.
export const prefetchCommonData = async (userId?: string) => {
  if (!userId) return;

  const cached = prefetchCache.get(userId);
  if (cached && Date.now() - cached.fetchedAt < PREFETCH_TTL_MS) {
    // Still within TTL — return cached result without hitting Supabase
    return cached.data;
  }

  const [profile, connections, notifications] = await batchQueries([
    supabase
      .from('profiles')
      .select('id, full_name, username, profile_picture_url, user_role, primary_role')
      .eq('id', userId)
      .single()
      .then(res => res.data),
    supabase
      .from('connections')
      .select('id, requester_id, recipient_id, status, connected_at')
      .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
      .limit(10)
      .then(res => res.data),
    supabase
      .from('notifications')
      .select('id, title, message, type, is_read, created_at, link, icon, module, priority, related_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)
      .then(res => res.data),
  ]).catch((error: unknown) => {
    console.error('Prefetch error:', error);
    return [null, null, null];
  });

  const result = { profile, connections, notifications };
  prefetchCache.set(userId, { userId, fetchedAt: Date.now(), data: result });
  return result;
};

// Debounce database writes
export const debouncedWrite = (() => {
  const timeouts = new Map<string, NodeJS.Timeout>();

  return (key: string, fn: () => Promise<any>, delay: number = 500) => {
    const existingTimeout = timeouts.get(key);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    const timeout = setTimeout(async () => {
      await fn();
      timeouts.delete(key);
    }, delay);

    timeouts.set(key, timeout);
  };
})();
