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
  private isCleaningUp = false;
  private callbacks = new Set<RealtimeCallback>();
  private queues = new Map<string, RealtimePayload[]>();
  private flushTimers = new Map<string, number>();
  private broadcastChannel: BroadcastChannel | null = null;
  private channelStatuses = new Map<string, string>();
  private maxRetries = 3;
  private retryDelays = [1000, 3000, 5000]; // Progressive delays
  private disabledChannels: Set<string> = new Set();
  private circuitBreaker: Map<string, { failures: number; lastFailure: number }> = new Map();
  private connectionAttempts: Map<string, number> = new Map();

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
   * Initialize the realtime system with authentication checks and auto-reconnect
   */
  async init(callback?: RealtimeCallback) {
    if (this.isInitialized) {
      console.warn('Realtime manager already initialized');
      return;
    }

    console.log('🚀 Initializing TalentXcel Production Realtime System...');
    console.log('🔍 Tables to watch:', TABLES_TO_WATCH);

    // Check authentication status first
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) {
      console.warn('🔐 No authenticated session - using public tables only');
    } else {
      console.log('🔐 Authenticated user detected');
    }

    // Add callback if provided
    if (callback) {
      this.callbacks.add(callback);
    }

    this._setupRealtimeConnections(!!session);
  }
  
  /**
   * Setup realtime connections with authentication awareness
   */
  private _setupRealtimeConnections(isAuthenticated: boolean) {
    // Filter tables based on authentication status
    const tablesToWatch = TABLES_TO_WATCH.filter(table => {
      // Public tables that don't require authentication
      const publicTables = ['jobs', 'posts', 'companies', 'colleges', 'post_comments', 'post_likes'];
      
      if (publicTables.includes(table)) {
        return true;
      }
      
      // User-specific tables require authentication
      if (!isAuthenticated) {
        console.log(`⚠️ Skipping ${table} - requires authentication`);
        return false;
      }
      
      return true;
    });

    console.log('🎯 Watching tables:', tablesToWatch);

    tablesToWatch.forEach((table) => {
      const channelName = `realtime:public:${table}`;
      console.log(`🔗 Creating channel: ${channelName}`);

      const channel = supabase.channel(channelName);

      // Attach listener for this specific table
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
        },
        (payload) => {
          const realtimePayload: RealtimePayload = {
            eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
            new: payload.new || {},
            old: payload.old || {},
            table,
            schema: payload.schema,
          };
          this._handleIncomingEvent(table, realtimePayload, false);
        }
      );

      // Subscribe and track status for this table only
      channel.subscribe((status, err) => {
        console.log(`📡 Realtime status [${table}]:`, status);
        if (err) console.error(`📡 Realtime error details [${table}]:`, err);

        this.channelStatuses.set(table, status);

        if (status === 'SUBSCRIBED') {
          console.log(`✅ Channel subscribed for table: ${table}`);
          // Mark initialized when first channel subscribes successfully
          if (!this.isInitialized) this.isInitialized = true;
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`❌ Channel error for table: ${table}. Possible causes:`);
          console.error('   - Table not in supabase_realtime publication');
          console.error('   - Table does not exist');
          console.error('   - Authentication required but user not logged in');
          console.error('   - Network/connectivity issues');
          console.error('   - Project realtime disabled');
          if (err) console.error('   - Error details:', err);
          
          this.recordFailure(table);
          
          // Remove faulty channel to prevent repeated errors
          const channelName = `realtime:public:${table}`;
          this.channels.delete(channelName);
          this.channelStatuses.delete(table);
          
          // Check if we should disable this table
          const attempts = this.connectionAttempts.get(table) || 0;
          if (attempts >= this.maxRetries) {
            console.log(`🛑 Disabling ${table} after ${attempts} failed attempts`);
            this.disabledChannels.add(table);
          }
        } else if (status === 'CLOSED' || status === 'TIMED_OUT') {
          console.warn(`🔒 Realtime channel ${status.toLowerCase()} for table: ${table}`);
          this.recordFailure(table);
          const channelName = `realtime:public:${table}`;
          // Ensure we drop the stale channel
          this.channels.delete(channelName);
          this.channelStatuses.delete(table);
        }
      });

      this.channels.set(channelName, channel);
    });

    console.log('✅ Production realtime system initialized with per-table channels, batching and cross-tab sync');
  }

  /**
   * Setup a single connection (used for reconnecting)
   */
  private _setupSingleConnection(table: WatchedTable) {
    const channelName = `realtime:public:${table}`;
    const channel = supabase.channel(channelName);

    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table,
      },
      (payload) => {
        const realtimePayload: RealtimePayload = {
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
          new: payload.new || {},
          old: payload.old || {},
          table,
          schema: payload.schema,
        };
        this._handleIncomingEvent(table, realtimePayload, false);
      }
    );

    channel.subscribe((status, err) => {
      console.log(`📡 Reconnect status [${table}]:`, status);
      if (err) console.error(`📡 Reconnect error details [${table}]:`, err);
      this.channelStatuses.set(table, status);
      if (status === 'CHANNEL_ERROR' || status === 'CLOSED' || status === 'TIMED_OUT') {
        const channelName = `realtime:public:${table}`;
        try { supabase.removeChannel(channel); } catch (_) {}
        this.channels.delete(channelName);
        this.channelStatuses.delete(table);
        console.log(`🛑 Single connection failed for ${table}, not retrying to prevent loops`);
      }
    });

    this.channels.set(channelName, channel);
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
    
    // Prevent recursive cleanup calls
    if (this.isCleaningUp) {
      console.log('🧹 Cleanup already in progress, skipping...');
      return;
    }
    this.isCleaningUp = true;
    
    // Clear all channels with error handling
    this.channels.forEach((channel, channelName) => {
      try {
        // Only remove if channel still exists
        if (channel && typeof channel.unsubscribe === 'function') {
          channel.unsubscribe();
        }
        console.log(`❌ Removed channel: ${channelName}`);
      } catch (error) {
        console.warn(`⚠️ Error removing channel ${channelName}:`, error);
      }
    });
    this.channels.clear();

    // Clear callbacks and timers
    this.callbacks.clear();
    this.flushTimers.forEach(timerId => clearTimeout(timerId));
    this.flushTimers.clear();
    this.queues.clear();
    this.channelStatuses.clear();

    // Close broadcast channel
    if (this.broadcastChannel) {
      this.broadcastChannel.close();
      this.broadcastChannel = null;
    }
    
    this.isInitialized = false;
    this.isCleaningUp = false;
    this.disabledChannels.clear();
    this.circuitBreaker.clear();
    this.connectionAttempts.clear();
    console.log('✅ Realtime cleanup completed');
  }

  private isCircuitOpen(table: WatchedTable): boolean {
    const breaker = this.circuitBreaker.get(table);
    if (!breaker) return false;
    
    const now = Date.now();
    const timeSinceLastFailure = now - breaker.lastFailure;
    
    // Circuit opens after 3 failures, stays open for 60 seconds
    return breaker.failures >= 3 && timeSinceLastFailure < 60000;
  }

  private recordFailure(table: WatchedTable): void {
    const existing = this.circuitBreaker.get(table) || { failures: 0, lastFailure: 0 };
    this.circuitBreaker.set(table, {
      failures: existing.failures + 1,
      lastFailure: Date.now()
    });
  }

  private resetCircuitBreaker(table: WatchedTable): void {
    this.circuitBreaker.delete(table);
  }

  public enableTable(table: WatchedTable): void {
    console.log(`🔄 Re-enabling table: ${table}`);
    this.disabledChannels.delete(table);
    this.resetCircuitBreaker(table);
    this.connectionAttempts.delete(table);
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