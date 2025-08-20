import { supabase } from '@/integrations/supabase/client';

// All tables we want to watch for real-time updates
const TABLES_TO_WATCH = [
  'jobs',
  'posts', 
  'profiles',
  'companies',
  'colleges',
  'connections',
  'job_applications',
  'user_activities',
  'ai_career_recommendations',
  'ai_job_matches',
  'messages',
  'events',
  'college_bookmarks',
  'post_comments',
  'post_likes'
] as const;

export type WatchedTable = typeof TABLES_TO_WATCH[number];

export interface RealtimePayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: Record<string, any>;
  old: Record<string, any>;
  table: WatchedTable;
  schema: string;
}

export type RealtimeCallback = (table: WatchedTable, payload: RealtimePayload) => void;

class RealtimeManager {
  private channels: Map<string, any> = new Map();
  private isInitialized = false;
  private callbacks = new Set<RealtimeCallback>();
  private queues = new Map<string, RealtimePayload[]>();
  private flushTimers = new Map<string, number>();
  private broadcastChannel: BroadcastChannel | null = null;
  private channelStatuses = new Map<string, string>();

  constructor() {
    // Initialize BroadcastChannel for cross-tab communication
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.broadcastChannel = new BroadcastChannel('talentxcel-realtime');
      this.broadcastChannel.onmessage = (event) => {
        const { table, payload } = event.data;
        this._handleIncomingEvent(table, payload, true);
      };
    }
  }

  /**
   * Initialize the realtime system with batching and cross-tab sync
   */
  init(callback?: RealtimeCallback) {
    if (this.isInitialized) {
      console.warn('Realtime manager already initialized');
      return;
    }

    console.log('🚀 Initializing TalentXcel Production Realtime System...');
    console.log('🔍 Tables to watch:', TABLES_TO_WATCH);

    // Add callback if provided
    if (callback) {
      this.callbacks.add(callback);
    }

    // Create a single shared channel for all Postgres changes (more reliable)
    const sharedChannelName = 'public:postgres-changes';
    console.log(`🔗 Creating shared channel: ${sharedChannelName}`);
    
    const sharedChannel = supabase.channel(sharedChannelName);
    
    // Attach listeners for each table on the shared channel
    TABLES_TO_WATCH.forEach((table) => {
      console.log(`📥 Subscribing to table: ${table}`);
      sharedChannel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table
        },
        (payload) => {
          const realtimePayload: RealtimePayload = {
            eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
            new: payload.new || {},
            old: payload.old || {},
            table,
            schema: payload.schema
          };
          this._handleIncomingEvent(table, realtimePayload, false);
        }
      );
    });

    // Subscribe once and mirror status to all tables
    sharedChannel.subscribe((status, err) => {
      console.log(`📡 Shared realtime status:`, status, err);
      TABLES_TO_WATCH.forEach((table) => this.channelStatuses.set(table, status));
      if (status === 'CHANNEL_ERROR') {
        console.error('❌ Shared realtime channel error. Details:', err);
      }
      if (status === 'TIMED_OUT') {
        console.error('⏰ Shared realtime subscription timed out');
      }
      if (status === 'CLOSED') {
        console.warn('🔒 Shared realtime channel closed');
      }
    });

    this.channels.set(sharedChannelName, sharedChannel);

    this.isInitialized = true;
    console.log('✅ Production realtime system initialized with batching and cross-tab sync');
  }

  /**
   * Handle incoming realtime events with batching and broadcasting
   */
  private _handleIncomingEvent(table: WatchedTable, payload: RealtimePayload, fromBroadcast: boolean) {
    console.log(`🔄 ${table.toUpperCase()} updated:`, payload);
    
    // Add to batch queue
    const queue = this.queues.get(table) || [];
    queue.push(payload);
    this.queues.set(table, queue);

    // Set up flush timer if not already set (batching window: 150ms)
    if (!this.flushTimers.has(table)) {
      const timerId = window.setTimeout(() => this._flushQueue(table), 150);
      this.flushTimers.set(table, timerId);
    }

    // Broadcast to other tabs (only if not already from broadcast)
    if (!fromBroadcast && this.broadcastChannel) {
      this.broadcastChannel.postMessage({ table, payload });
    }
  }

  /**
   * Flush queued events and notify callbacks
   */
  private _flushQueue(table: WatchedTable) {
    const queue = this.queues.get(table) || [];
    if (queue.length === 0) return;

    // Clear the queue and timer
    const batch = queue.splice(0, queue.length);
    this.queues.set(table, queue);
    const timerId = this.flushTimers.get(table);
    if (timerId) {
      clearTimeout(timerId);
      this.flushTimers.delete(table);
    }

    console.log(`🚀 Flushing ${batch.length} events for ${table}`);

    // Process each event in the batch
    batch.forEach(payload => {
      // Notify all callbacks
      this.callbacks.forEach(callback => {
        try {
          callback(table, payload);
        } catch (error) {
          console.error('Realtime callback error:', error);
        }
      });

      // Dispatch custom events for backward compatibility
      window.dispatchEvent(
        new CustomEvent(`${table}Update`, { 
          detail: payload 
        })
      );
    });
  }

  /**
   * Add a callback to receive realtime events
   */
  subscribe(callback: RealtimeCallback) {
    this.callbacks.add(callback);
  }

  /**
   * Remove a callback
   */
  unsubscribe(callback: RealtimeCallback) {
    this.callbacks.delete(callback);
  }

  /**
   * Cleanup all realtime subscriptions
   */
  cleanup() {
    console.log('🧹 Cleaning up realtime subscriptions...');
    
    // Clear all channels
    this.channels.forEach((channel, channelName) => {
      supabase.removeChannel(channel);
      console.log(`❌ Removed channel: ${channelName}`);
    });
    this.channels.clear();

    // Clear callbacks and timers
    this.callbacks.clear();
    this.flushTimers.forEach(timerId => clearTimeout(timerId));
    this.flushTimers.clear();
    this.queues.clear();

    // Close broadcast channel
    if (this.broadcastChannel) {
      this.broadcastChannel.close();
      this.broadcastChannel = null;
    }
    
    this.isInitialized = false;
    console.log('✅ Realtime cleanup completed');
  }

  /**
   * Get subscription status for all channels
   */
  getStatus() {
    const status: Record<string, string> = {};
    
    // Return last known subscription status per table (e.g., SUBSCRIBED, CHANNEL_ERROR)
    this.channelStatuses.forEach((tableStatus, tableName) => {
      status[tableName] = tableStatus;
    });
    
    return status;
  }

  /**
   * Check if realtime is initialized
   */
  get initialized() {
    return this.isInitialized;
  }
}

// Create singleton instance
export const realtimeManager = new RealtimeManager();

/**
 * Global realtime initializer - call this once in your app
 */
export function initTalentXcelRealtime(callback?: RealtimeCallback) {
  const defaultCallback: RealtimeCallback = (table, payload) => {
    console.log(`🔄 Global ${table} update:`, payload);
    
    // You can add global logic here, like updating global state,
    // invalidating React Query cache, etc.
  };

  realtimeManager.init(callback || defaultCallback);
}

/**
 * Cleanup realtime connections
 */
export function cleanupRealtime() {
  realtimeManager.cleanup();
}