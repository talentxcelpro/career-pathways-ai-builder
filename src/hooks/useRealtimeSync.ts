import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SyncOptions {
  table: string;
  action: string;
  data?: any;
}

export function useRealtimeSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [pendingOperations, setPendingOperations] = useState<SyncOptions[]>([]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Process pending operations when back online
      processPendingOperations();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const processPendingOperations = useCallback(async () => {
    if (pendingOperations.length === 0) return;

    try {
      for (const operation of pendingOperations) {
        await executeSync(operation);
      }
      setPendingOperations([]);
      setLastSync(new Date());
    } catch (error) {
      console.error('Failed to process pending operations:', error);
    }
  }, [pendingOperations]);

  const executeSync = async (options: SyncOptions) => {
    const { table, action, data } = options;

    switch (table) {
      case 'posts':
        if (action === 'like') {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          const { data: existingLike } = await supabase
            .from('post_likes')
            .select('id')
            .eq('post_id', data.postId)
            .eq('user_id', user.id)
            .single();

          if (existingLike) {
            await supabase
              .from('post_likes')
              .delete()
              .eq('post_id', data.postId)
              .eq('user_id', user.id);
          } else {
            await supabase
              .from('post_likes')
              .insert({ post_id: data.postId, user_id: user.id });
          }
        } else if (action === 'save') {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          const { data: existingSave } = await supabase
            .from('post_saves')
            .select('id')
            .eq('post_id', data.postId)
            .eq('user_id', user.id)
            .single();

          if (existingSave) {
            await supabase
              .from('post_saves')
              .delete()
              .eq('post_id', data.postId)
              .eq('user_id', user.id);
          } else {
            await supabase
              .from('post_saves')
              .insert({ post_id: data.postId, user_id: user.id });
          }
        }
        break;

      case 'jobs':
        if (action === 'bookmark') {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          const { data: existingBookmark } = await supabase
            .from('job_bookmarks')
            .select('id')
            .eq('job_id', data.jobId)
            .eq('user_id', user.id)
            .single();

          if (existingBookmark) {
            await supabase
              .from('job_bookmarks')
              .delete()
              .eq('job_id', data.jobId)
              .eq('user_id', user.id);
          } else {
            await supabase
              .from('job_bookmarks')
              .insert({ job_id: data.jobId, user_id: user.id });
          }
        } else if (action === 'apply') {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          await supabase.from('job_applications').insert({
            job_id: data.jobId,
            user_id: user.id,
            status: 'pending',
            application_data: {}
          });
        }
        break;

      case 'networking':
        if (action === 'toggle_video' || action === 'toggle_mute' || action === 'raise_hand') {
          // Real-time networking events would be handled via WebRTC/Socket.io
          console.log('Networking action:', action, data);
        }
        break;

      default:
        console.warn('Unknown sync table:', table);
    }
  };

  const sync = useCallback(async (table: string, data?: any) => {
    const operation: SyncOptions = {
      table,
      action: data?.action || 'update',
      data
    };

    if (isOnline) {
      try {
        await executeSync(operation);
        setLastSync(new Date());
      } catch (error) {
        console.error('Sync failed, queuing for later:', error);
        setPendingOperations(prev => [...prev, operation]);
      }
    } else {
      // Queue operation for when back online
      setPendingOperations(prev => [...prev, operation]);
    }
  }, [isOnline]);

  return {
    isOnline,
    lastSync,
    pendingOperations: pendingOperations.length,
    sync
  };
}