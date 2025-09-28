import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

// Tables that should work without authentication issues
const SAFE_TABLES = [
  'jobs',
  'posts', 
  'profiles',
  'companies',
] as const;

// User-specific tables that require authentication
const USER_TABLES = [
  'ai_career_recommendations',
  'ai_job_matches',
  'job_applications',
  'notifications',
  'user_activities',
  'connections',
  'messages',
  'txc_transactions'
] as const;

export type RealtimeTable = typeof SAFE_TABLES[number] | typeof USER_TABLES[number];

interface RealtimeSubscription {
  channel: RealtimeChannel;
  table: string;
  callback: (payload: any) => void;
  cleanup: () => void;
}

class FixedRealtimeManager {
  private subscriptions: Map<string, RealtimeSubscription> = new Map();
  private isAuthenticated = false;
  
  constructor() {
    this.checkAuthStatus();
    this.setupAuthListener();
  }

  private async checkAuthStatus() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      this.isAuthenticated = !!session;
      console.log(`🔐 [FixedRealtime] Auth status: ${this.isAuthenticated ? 'authenticated' : 'unauthenticated'}`);
    } catch (error) {
      console.warn('[FixedRealtime] Auth check failed:', error);
      this.isAuthenticated = false;
    }
  }

  private setupAuthListener() {
    supabase.auth.onAuthStateChange((event, session) => {
      const wasAuthenticated = this.isAuthenticated;
      this.isAuthenticated = !!session;
      
      console.log(`🔐 [FixedRealtime] Auth changed: ${event}, authenticated: ${this.isAuthenticated}`);
      
      // If auth status changed, reinitialize subscriptions
      if (wasAuthenticated !== this.isAuthenticated) {
        this.reinitializeSubscriptions();
      }
    });
  }

  private reinitializeSubscriptions() {
    console.log('🔄 [FixedRealtime] Reinitializing subscriptions due to auth change');
    
    // Store current subscriptions
    const currentSubs = Array.from(this.subscriptions.values());
    
    // Clean up existing
    this.cleanupAll();
    
    // Recreate subscriptions
    currentSubs.forEach(sub => {
      this.subscribeToTable(sub.table, sub.callback);
    });
  }

  /**
   * Subscribe to a table with automatic auth-based filtering
   */
  subscribeToTable(table: string, callback: (payload: any) => void): () => void {
    const subscriptionId = `${table}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`🔗 [FixedRealtime] Subscribing to ${table}`);
    
    // Check if this table requires authentication
    const requiresAuth = USER_TABLES.includes(table as any);
    
    if (requiresAuth && !this.isAuthenticated) {
      console.warn(`⚠️ [FixedRealtime] Table ${table} requires authentication, skipping`);
      
      // Return a no-op cleanup function
      return () => {};
    }

    // Create channel with simple naming
    const channelName = `fixed-${table}`;
    const channel = supabase.channel(channelName);

    // Set up postgres changes listener
    const config: any = {
      event: '*',
      schema: 'public',
      table: table
    };

    // Add user filter for authenticated tables
    if (requiresAuth && this.isAuthenticated) {
      try {
        // This will be handled by RLS, so we don't need to filter here
        console.log(`🔐 [FixedRealtime] Setting up authenticated subscription for ${table}`);
      } catch (error) {
        console.warn(`[FixedRealtime] Could not set up auth filter for ${table}:`, error);
      }
    }

    channel.on('postgres_changes', config, (payload) => {
      console.log(`📦 [FixedRealtime] ${table} update:`, payload);
      
      try {
        callback(payload);
      } catch (error) {
        console.error(`[FixedRealtime] Callback error for ${table}:`, error);
      }
    });

    // Subscribe with error handling
    channel.subscribe((status, error) => {
      console.log(`📡 [FixedRealtime] ${table} status: ${status}`);
      
      if (status === 'SUBSCRIBED') {
        console.log(`✅ [FixedRealtime] Successfully subscribed to ${table}`);
      } else if (status === 'CHANNEL_ERROR') {
        console.warn(`⚠️ [FixedRealtime] Error subscribing to ${table}:`, error);
        
        // Check for specific errors
        if (error?.message?.includes('permission denied') || 
            error?.message?.includes('not in supabase_realtime publication')) {
          console.log(`🚫 [FixedRealtime] Permanent error for ${table}, not retrying`);
        } else {
          // Retry after a delay for transient errors
          setTimeout(() => {
            console.log(`🔄 [FixedRealtime] Retrying subscription for ${table}`);
            this.subscribeToTable(table, callback);
          }, 5000);
        }
      }
    });

    // Store subscription
    const subscription: RealtimeSubscription = {
      channel,
      table,
      callback,
      cleanup: () => {
        console.log(`🧹 [FixedRealtime] Cleaning up subscription for ${table}`);
        try {
          supabase.removeChannel(channel);
          this.subscriptions.delete(subscriptionId);
        } catch (error) {
          console.warn(`[FixedRealtime] Error cleaning up ${table}:`, error);
        }
      }
    };

    this.subscriptions.set(subscriptionId, subscription);

    // Return cleanup function
    return subscription.cleanup;
  }

  /**
   * Subscribe to multiple tables at once
   */
  subscribeToTables(tables: string[], callback: (table: string, payload: any) => void): () => void {
    const cleanupFunctions = tables.map(table => 
      this.subscribeToTable(table, (payload) => callback(table, payload))
    );

    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }

  /**
   * Get subscription status
   */
  getStatus() {
    return {
      totalSubscriptions: this.subscriptions.size,
      isAuthenticated: this.isAuthenticated,
      tables: Array.from(this.subscriptions.values()).map(sub => sub.table)
    };
  }

  /**
   * Clean up all subscriptions
   */
  cleanupAll() {
    console.log('🧹 [FixedRealtime] Cleaning up all subscriptions');
    
    this.subscriptions.forEach(subscription => {
      try {
        subscription.cleanup();
      } catch (error) {
        console.warn('[FixedRealtime] Error during cleanup:', error);
      }
    });
    
    this.subscriptions.clear();
  }
}

// Create singleton instance
export const fixedRealtimeManager = new FixedRealtimeManager();

// Export convenience functions
export function subscribeToRealtimeTable(table: string, callback: (payload: any) => void) {
  return fixedRealtimeManager.subscribeToTable(table, callback);
}

export function subscribeToRealtimeTables(tables: string[], callback: (table: string, payload: any) => void) {
  return fixedRealtimeManager.subscribeToTables(tables, callback);
}

export function getFixedRealtimeStatus() {
  return fixedRealtimeManager.getStatus();
}

export function cleanupFixedRealtime() {
  fixedRealtimeManager.cleanupAll();
}