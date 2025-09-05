import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface RealtimeSyncHook {
  isOnline: boolean;
  syncStatus: SyncStatus;
  lastSyncTime: Date | null;
  queuedActions: QueuedAction[];
  performSync: () => Promise<void>;
  queueAction: (action: Omit<QueuedAction, 'id' | 'timestamp' | 'attempts'>) => void;
}

interface SyncStatus {
  posts: 'synced' | 'syncing' | 'offline' | 'error';
  connections: 'synced' | 'syncing' | 'offline' | 'error'; 
  messages: 'synced' | 'syncing' | 'offline' | 'error';
  profile: 'synced' | 'syncing' | 'offline' | 'error';
}

interface QueuedAction {
  id: string;
  type: 'post_create' | 'connection_request' | 'message_send' | 'profile_update' | 'post_like' | 'post_comment';
  data: any;
  timestamp: string;
  attempts: number;
}

export const useRealtimeSync = (): RealtimeSyncHook => {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    posts: 'synced',
    connections: 'synced',
    messages: 'synced',
    profile: 'synced'
  });
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [queuedActions, setQueuedActions] = useState<QueuedAction[]>([]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Connection restored - syncing data...');
      performSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error('Working offline - changes will sync when connected');
      updateSyncStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Initialize real-time subscriptions
  useEffect(() => {
    if (!user || !isOnline) return;

    const channels = initializeRealtimeSubscriptions();
    loadQueuedActions();

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [user, isOnline]);

  const updateSyncStatus = useCallback((status: 'synced' | 'syncing' | 'offline' | 'error', table?: keyof SyncStatus) => {
    setSyncStatus(prev => {
      if (table) {
        return { ...prev, [table]: status };
      } else {
        return {
          posts: status,
          connections: status,
          messages: status,
          profile: status
        };
      }
    });
  }, []);

  const initializeRealtimeSubscriptions = useCallback(() => {
    if (!user) return [];

    const channels = [];

    // Posts subscription
    const postsChannel = supabase
      .channel('posts-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts'
        },
        (payload) => {
          console.log('Posts sync event:', payload);
          updateSyncStatus('synced', 'posts');
          setLastSyncTime(new Date());
          
          // Broadcast sync event for cross-tab synchronization
          window.dispatchEvent(new CustomEvent('postsSync', { detail: payload }));
        }
      )
      .subscribe();

    // Connections subscription
    const connectionsChannel = supabase
      .channel('connections-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'connections',
          filter: `requester_id=eq.${user.id},recipient_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Connections sync event:', payload);
          updateSyncStatus('synced', 'connections');
          setLastSyncTime(new Date());
          
          window.dispatchEvent(new CustomEvent('connectionsSync', { detail: payload }));
        }
      )
      .subscribe();

    // Messages subscription
    const messagesChannel = supabase
      .channel('messages-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'direct_messages',
          filter: `sender_id=eq.${user.id},recipient_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Messages sync event:', payload);
          updateSyncStatus('synced', 'messages');
          setLastSyncTime(new Date());
          
          window.dispatchEvent(new CustomEvent('messagesSync', { detail: payload }));
        }
      )
      .subscribe();

    // Profile subscription
    const profileChannel = supabase
      .channel('profile-realtime')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        },
        (payload) => {
          console.log('Profile sync event:', payload);
          updateSyncStatus('synced', 'profile');
          setLastSyncTime(new Date());
          
          window.dispatchEvent(new CustomEvent('profileSync', { detail: payload }));
        }
      )
      .subscribe();

    channels.push(postsChannel, connectionsChannel, messagesChannel, profileChannel);
    return channels;
  }, [user, updateSyncStatus]);

  const performSync = useCallback(async () => {
    if (!isOnline || !user) return;

    try {
      updateSyncStatus('syncing');
      
      // Process queued actions first
      await processQueuedActions();
      
      // Perform full sync
      updateSyncStatus('synced');
      setLastSyncTime(new Date());
      
      // Clear processed actions
      setQueuedActions([]);
      localStorage.removeItem('queuedActions');
      
      console.log('Full sync completed successfully');
      
    } catch (error) {
      console.error('Sync error:', error);
      updateSyncStatus('error');
      toast.error('Sync failed - will retry automatically');
    }
  }, [isOnline, user, updateSyncStatus]);

  const processQueuedActions = useCallback(async () => {
    const actions = [...queuedActions];
    
    for (const action of actions) {
      try {
        await executeAction(action);
        console.log('Executed queued action:', action.type);
      } catch (error) {
        console.error('Failed to execute queued action:', error);
        
        // Re-queue with increased attempt count if under limit
        if (action.attempts < 3) {
          queueAction({ 
            type: action.type, 
            data: action.data, 
            attempts: action.attempts + 1 
          });
        }
      }
    }
  }, [queuedActions]);

  const executeAction = useCallback(async (action: QueuedAction) => {
    switch (action.type) {
      case 'post_create':
        await supabase.from('posts').insert(action.data);
        break;
      case 'post_like':
        await supabase.from('post_likes').insert(action.data);
        break;
      case 'post_comment':
        await supabase.from('comments').insert(action.data);
        break;
      case 'connection_request':
        await supabase.from('connections').insert(action.data);
        break;
      case 'message_send':
        await supabase.from('direct_messages').insert(action.data);
        break;
      case 'profile_update':
        await supabase.from('profiles').update(action.data).eq('id', user?.id);
        break;
      default:
        console.warn('Unknown action type:', action.type);
    }
  }, [user]);

  const queueAction = useCallback((actionData: Omit<QueuedAction, 'id' | 'timestamp' | 'attempts'> & Partial<Pick<QueuedAction, 'attempts'>>) => {
    const queuedAction: QueuedAction = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      attempts: actionData.attempts || 0,
      type: actionData.type,
      data: actionData.data
    };

    setQueuedActions(prev => {
      const updated = [...prev, queuedAction];
      saveQueuedActions(updated);
      return updated;
    });

    // Try to execute immediately if online
    if (isOnline) {
      executeAction(queuedAction).catch(() => {
        // Will be retried in next sync
        console.log('Action queued for retry:', queuedAction.type);
      });
    }
  }, [isOnline, executeAction]);

  const loadQueuedActions = useCallback(() => {
    try {
      const stored = localStorage.getItem('queuedActions');
      if (stored) {
        const actions = JSON.parse(stored);
        setQueuedActions(actions);
      }
    } catch (error) {
      console.error('Failed to load queued actions:', error);
    }
  }, []);

  const saveQueuedActions = useCallback((actions: QueuedAction[]) => {
    try {
      localStorage.setItem('queuedActions', JSON.stringify(actions));
    } catch (error) {
      console.error('Failed to save queued actions:', error);
    }
  }, []);

  return {
    isOnline,
    syncStatus,
    lastSyncTime,
    queuedActions,
    performSync,
    queueAction
  };
};