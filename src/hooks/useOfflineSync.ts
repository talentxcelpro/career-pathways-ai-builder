/**
 * Offline-First Architecture with Background Sync
 * Handles offline actions and syncs when reconnected
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface OfflineAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  table: string;
  data: any;
  timestamp: number;
  retries: number;
  status: 'pending' | 'syncing' | 'failed' | 'synced';
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;
const STORAGE_KEY = 'offline_actions';

class OfflineManager {
  private actions: Map<string, OfflineAction> = new Map();
  private syncInProgress = false;
  private db: IDBDatabase | null = null;

  constructor() {
    this.initIndexedDB();
    this.loadActionsFromStorage();
  }

  private async initIndexedDB() {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open('offline_storage', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('actions')) {
          db.createObjectStore('actions', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('cache')) {
          db.createObjectStore('cache', { keyPath: 'key' });
        }
      };
    });
  }

  private async loadActionsFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const actions: OfflineAction[] = JSON.parse(stored);
        actions.forEach(action => this.actions.set(action.id, action));
      }
    } catch (error) {
      console.error('Failed to load offline actions:', error);
    }
  }

  private saveActionsToStorage() {
    try {
      const actions = Array.from(this.actions.values());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(actions));
    } catch (error) {
      console.error('Failed to save offline actions:', error);
    }
  }

  // Queue an action for offline execution
  queueAction(type: OfflineAction['type'], table: string, data: any): string {
    const action: OfflineAction = {
      id: `offline_${Date.now()}_${Math.random()}`,
      type,
      table,
      data,
      timestamp: Date.now(),
      retries: 0,
      status: 'pending',
    };

    this.actions.set(action.id, action);
    this.saveActionsToStorage();

    return action.id;
  }

  // Sync all pending actions
  async syncActions(): Promise<void> {
    if (this.syncInProgress) return;

    this.syncInProgress = true;
    const pendingActions = Array.from(this.actions.values())
      .filter(action => action.status === 'pending' || action.status === 'failed')
      .sort((a, b) => a.timestamp - b.timestamp);

    for (const action of pendingActions) {
      try {
        action.status = 'syncing';
        await this.executeAction(action);
        action.status = 'synced';
        this.actions.delete(action.id);
      } catch (error) {
        action.retries++;
        if (action.retries >= MAX_RETRIES) {
          action.status = 'failed';
          console.error('Action failed after max retries:', action, error);
        } else {
          action.status = 'pending';
          // Wait before next retry
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * action.retries));
        }
      }
    }

    this.saveActionsToStorage();
    this.syncInProgress = false;
  }

  private async executeAction(action: OfflineAction): Promise<void> {
    switch (action.type) {
      case 'create':
        const { error: createError } = await supabase
          .from(action.table)
          .insert(action.data);
        if (createError) throw createError;
        break;

      case 'update':
        const { error: updateError } = await supabase
          .from(action.table)
          .update(action.data.updates)
          .match(action.data.match);
        if (updateError) throw updateError;
        break;

      case 'delete':
        const { error: deleteError } = await supabase
          .from(action.table)
          .delete()
          .match(action.data);
        if (deleteError) throw deleteError;
        break;
    }
  }

  // Get pending actions count
  getPendingCount(): number {
    return Array.from(this.actions.values())
      .filter(action => action.status === 'pending' || action.status === 'failed')
      .length;
  }

  // Clear all actions
  clearActions() {
    this.actions.clear();
    localStorage.removeItem(STORAGE_KEY);
  }

  // Get action status
  getActionStatus(id: string): OfflineAction['status'] | null {
    return this.actions.get(id)?.status || null;
  }
}

const offlineManager = new OfflineManager();

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Back online - syncing changes...', { id: 'online-status' });
      syncPendingActions();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error('You are offline - changes will sync when reconnected', { 
        id: 'online-status',
        duration: 5000,
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Periodic sync when online
  useEffect(() => {
    if (!isOnline) return;

    const interval = setInterval(() => {
      syncPendingActions();
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [isOnline]);

  // Update pending count
  useEffect(() => {
    const interval = setInterval(() => {
      setPendingCount(offlineManager.getPendingCount());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const syncPendingActions = useCallback(async () => {
    if (!isOnline || isSyncing) return;

    setIsSyncing(true);
    try {
      await offlineManager.syncActions();
      const remaining = offlineManager.getPendingCount();
      
      if (remaining === 0) {
        toast.success('All changes synced', { id: 'sync-status' });
      } else {
        toast.warning(`${remaining} changes pending`, { id: 'sync-status' });
      }
      
      setPendingCount(remaining);
    } catch (error) {
      toast.error('Sync failed - will retry', { id: 'sync-status' });
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing]);

  const queueOfflineAction = useCallback(
    (type: OfflineAction['type'], table: string, data: any): string => {
      const actionId = offlineManager.queueAction(type, table, data);
      setPendingCount(offlineManager.getPendingCount());
      
      if (isOnline) {
        // Debounce sync
        if (syncTimeoutRef.current) {
          clearTimeout(syncTimeoutRef.current);
        }
        syncTimeoutRef.current = setTimeout(syncPendingActions, 1000);
      }
      
      return actionId;
    },
    [isOnline, syncPendingActions]
  );

  const forceSyn = useCallback(() => {
    syncPendingActions();
  }, [syncPendingActions]);

  return {
    isOnline,
    pendingCount,
    isSyncing,
    queueOfflineAction,
    forceSync: forceSyn,
  };
}

export { offlineManager };
