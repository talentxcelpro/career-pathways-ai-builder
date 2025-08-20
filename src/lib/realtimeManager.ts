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

  /**
   * Initialize the realtime system with a global callback
   */
  init(callback: RealtimeCallback) {
    if (this.isInitialized) {
      console.warn('Realtime manager already initialized');
      return;
    }

    console.log('🚀 Initializing TalentXcel Realtime System...');

    TABLES_TO_WATCH.forEach((table) => {
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
            console.log(`🔄 ${table.toUpperCase()} updated:`, payload);
            
            const realtimePayload: RealtimePayload = {
              eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
              new: payload.new || {},
              old: payload.old || {},
              table,
              schema: payload.schema
            };

            callback(table, realtimePayload);
            
            // Dispatch custom event for direct component listening
            window.dispatchEvent(
              new CustomEvent(`${table}Update`, { 
                detail: realtimePayload 
              })
            );
          }
        )
        .subscribe((status) => {
          console.log(`📡 ${table} realtime status:`, status);
        });

      this.channels.set(channelName, channel);
    });

    this.isInitialized = true;
    console.log('✅ Realtime system initialized for all TalentXcel modules');
  }

  /**
   * Cleanup all realtime subscriptions
   */
  cleanup() {
    console.log('🧹 Cleaning up realtime subscriptions...');
    
    this.channels.forEach((channel, channelName) => {
      supabase.removeChannel(channel);
      console.log(`❌ Removed channel: ${channelName}`);
    });
    
    this.channels.clear();
    this.isInitialized = false;
  }

  /**
   * Get subscription status for all channels
   */
  getStatus() {
    const status: Record<string, string> = {};
    
    this.channels.forEach((channel, channelName) => {
      status[channelName] = channel.state;
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