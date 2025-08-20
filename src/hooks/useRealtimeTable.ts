import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface RealtimeTableOptions {
  select?: string;
  orderBy?: string;
  ascending?: boolean;
  filter?: Record<string, any>;
  limit?: number;
  enableToasts?: boolean;
}

/**
 * Hook for real-time table data with automatic state reconciliation
 * No more page refreshes needed - data auto-updates on DB changes
 */
export function useRealtimeTable<T = any>(
  table: string,
  options: RealtimeTableOptions = {}
) {
  const {
    select = '*',
    orderBy = 'created_at',
    ascending = false,
    filter = {},
    limit,
    enableToasts = false
  } = options;

  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Reconcile function to handle INSERT/UPDATE/DELETE
  const reconcileData = useCallback((prevData: T[], payload: any): T[] => {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    switch (eventType) {
      case 'INSERT': {
        // Upsert with de-duplication by id to avoid double entries (initial fetch + realtime)
        const exists = prevData.some((item: any) => item.id === newRecord.id);
        if (exists) {
          return prevData.map((item: any) => (item.id === newRecord.id ? newRecord : item));
        }
        return ascending ? [...prevData, newRecord] : [newRecord, ...prevData];
      }
        
      case 'UPDATE':
        // Update existing record
        return prevData.map((item: any) =>
          item.id === newRecord.id ? newRecord : item
        );
        
      case 'DELETE':
        // Remove deleted record
        return prevData.filter((item: any) => item.id !== oldRecord.id);
        
      default:
        return prevData;
    }
  }, [ascending]);

  // Initial data load
  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true);
        setError(null);

        let query = supabase.from(table).select(select);
        
        // Apply filters
        Object.entries(filter).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
        
        // Apply ordering
        if (orderBy) {
          query = query.order(orderBy, { ascending });
        }
        
        // Apply limit
        if (limit) {
          query = query.limit(limit);
        }

        const { data: initialData, error: queryError } = await query;

        if (queryError) throw queryError;
        
        setData((initialData || []) as T[]);
      } catch (err: any) {
        console.error(`Error loading ${table}:`, err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadInitialData();
  }, [table, select, orderBy, ascending, limit, JSON.stringify(filter)]);

  // Set up real-time subscription
  useEffect(() => {
    const channelName = `realtime:${table}`;
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table 
        },
        (payload) => {
          console.log(`🔄 ${table} realtime update:`, payload);
          
          // Update data with reconciliation
          setData(prevData => reconcileData(prevData, payload));
          
          // Optional toast notification
          if (enableToasts) {
            const { eventType, new: newRecord } = payload;
            toast({
              title: `${table.charAt(0).toUpperCase() + table.slice(1)} ${eventType}`,
              description: `Real-time update: ${eventType.toLowerCase()}d successfully`,
              duration: 2000,
            });
          }
        }
      )
      .subscribe((status) => {
        console.log(`📡 ${table} realtime status:`, status);
      });

    // Cleanup subscription
    return () => {
      console.log(`🧹 Cleaning up ${table} realtime subscription`);
      supabase.removeChannel(channel);
    };
  }, [table, reconcileData, enableToasts, toast]);

  // Refresh function for manual reload
  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase.from(table).select(select);
      
      Object.entries(filter).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
      
      if (orderBy) {
        query = query.order(orderBy, { ascending });
      }
      
      if (limit) {
        query = query.limit(limit);
      }

      const { data: refreshedData, error: queryError } = await query;
      
      if (queryError) throw queryError;
      
      setData((refreshedData || []) as T[]);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [table, select, orderBy, ascending, limit, JSON.stringify(filter)]);

  return {
    data,
    loading,
    error,
    refresh
  };
}

/**
 * Specific hooks for common TalentXcel tables
 */

export function useRealtimeJobs(options?: RealtimeTableOptions) {
  return useRealtimeTable('jobs', {
    select: `
      *,
      companies(name, logo_url),
      profiles!jobs_employer_id_fkey(full_name)
    `,
    orderBy: 'created_at',
    ascending: false,
    ...options
  });
}

export function useRealtimePosts(options?: RealtimeTableOptions) {
  return useRealtimeTable('posts', {
    select: `
      *,
      profiles(full_name, avatar_url),
      post_comments(count),
      post_likes(count)
    `,
    orderBy: 'created_at',
    ascending: false,
    ...options
  });
}

export function useRealtimeMessages(conversationId?: string, options?: RealtimeTableOptions) {
  return useRealtimeTable('messages', {
    select: `
      *,
      sender:profiles!messages_sender_id_fkey(full_name, avatar_url)
    `,
    filter: conversationId ? { conversation_id: conversationId } : {},
    orderBy: 'created_at',
    ascending: true,
    ...options
  });
}

export function useRealtimeApplications(userId?: string, options?: RealtimeTableOptions) {
  return useRealtimeTable('job_applications', {
    select: `
      *,
      jobs(title, company_name),
      profiles(full_name)
    `,
    filter: userId ? { user_id: userId } : {},
    orderBy: 'applied_at',
    ascending: false,
    ...options
  });
}

export function useRealtimeColleges(options?: RealtimeTableOptions) {
  return useRealtimeTable('colleges', {
    select: `
      *,
      college_bookmarks(count)
    `,
    orderBy: 'name',
    ascending: true,
    ...options
  });
}