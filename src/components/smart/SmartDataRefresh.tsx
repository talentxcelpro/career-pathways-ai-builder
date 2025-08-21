import React from 'react';
import { useRealtimeContext } from '@/components/realtime/RealtimeProvider';
import { useAutoRefresh, AutoRefreshOptions } from '@/hooks/useAutoRefresh';

interface SmartDataRefreshProps<T> {
  children: (data: T | null, loading: boolean, error: Error | null) => React.ReactNode;
  fetchFunction: () => Promise<T>;
  fallbackOptions?: AutoRefreshOptions;
  realtimeTable?: string;
}

/**
 * Smart component that uses Realtime when available, falls back to polling
 */
export function SmartDataRefresh<T>({ 
  children, 
  fetchFunction, 
  fallbackOptions = { interval: 2000 },
  realtimeTable 
}: SmartDataRefreshProps<T>) {
  const { isConnected, usePollingFallback } = useRealtimeContext();
  
  // Use polling when realtime is not connected or explicitly using fallback
  const shouldUsePolling = !isConnected || usePollingFallback;
  
  const { data, loading, error } = useAutoRefresh(fetchFunction, {
    ...fallbackOptions,
    enabled: shouldUsePolling
  });

  // Log the refresh strategy being used
  React.useEffect(() => {
    if (shouldUsePolling) {
      console.log(`🔄 Using polling fallback for ${realtimeTable || 'data'} (every ${fallbackOptions.interval}ms)`);
    } else {
      console.log(`⚡ Using realtime updates for ${realtimeTable || 'data'}`);
    }
  }, [shouldUsePolling, realtimeTable, fallbackOptions.interval]);

  return <>{children(data, loading, error)}</>;
}

// Convenience components for common data types
export const SmartJobsRefresh: React.FC<{
  children: (data: any[] | null, loading: boolean, error: Error | null) => React.ReactNode;
}> = ({ children }) => (
  <SmartDataRefresh
    fetchFunction={async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data || [];
    }}
    fallbackOptions={{ interval: 2000 }}
    realtimeTable="jobs"
  >
    {children}
  </SmartDataRefresh>
);

export const SmartPostsRefresh: React.FC<{
  children: (data: any[] | null, loading: boolean, error: Error | null) => React.ReactNode;
}> = ({ children }) => (
  <SmartDataRefresh
    fetchFunction={async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data || [];
    }}
    fallbackOptions={{ interval: 2000 }}
    realtimeTable="posts"
  >
    {children}
  </SmartDataRefresh>
);

export const SmartApplicationsRefresh: React.FC<{
  children: (data: any[] | null, loading: boolean, error: Error | null) => React.ReactNode;
}> = ({ children }) => (
  <SmartDataRefresh
    fetchFunction={async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];

      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          *,
          jobs(title, company_name),
          profiles(full_name)
        `)
        .order('applied_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data || [];
    }}
    fallbackOptions={{ interval: 3000 }}
    realtimeTable="job_applications"
  >
    {children}
  </SmartDataRefresh>
);

// Smart connections refresh
export const SmartConnectionsRefresh: React.FC<{
  children: (data: any[] | null, loading: boolean, error: Error | null) => React.ReactNode;
}> = ({ children }) => (
  <SmartDataRefresh
    fetchFunction={async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];

      const { data, error } = await supabase
        .from('connections')
        .select(`
          *,
          sender:profiles!connections_sender_id_fkey(id, full_name, avatar_url),
          receiver:profiles!connections_receiver_id_fkey(id, full_name, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data || [];
    }}
    fallbackOptions={{ interval: 5000 }}
    realtimeTable="connections"
  >
    {children}
  </SmartDataRefresh>
);