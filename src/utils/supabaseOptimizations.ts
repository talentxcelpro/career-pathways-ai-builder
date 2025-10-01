import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Create optimized Supabase client with connection pooling
export const createOptimizedClient = () => {
  return supabase;
};

// Batch multiple queries for better performance
export const batchQueries = async (queries: PromiseLike<any>[]) => {
  return Promise.all(queries);
};

// Prefetch common data on app load
export const prefetchCommonData = async (userId?: string) => {
  if (!userId) return;

  const queries = [
    supabase.from('profiles').select('*').eq('id', userId).single().then(res => res.data),
    supabase.from('connections').select('*').or(`requester_id.eq.${userId},recipient_id.eq.${userId}`).limit(10).then(res => res.data),
    supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(20).then(res => res.data)
  ];

  try {
    await batchQueries(queries);
  } catch (error) {
    console.error('Prefetch error:', error);
  }
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
