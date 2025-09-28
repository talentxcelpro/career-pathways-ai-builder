import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface RealtimeSubscription {
  channel: RealtimeChannel;
  table: string;
  callback: (payload: any) => void;
  cleanup: () => void;
}

class ConsolidatedRealtimeManager {
  private subscriptions: Map<string, RealtimeSubscription> = new Map();
  private isAuthenticated = false;
  private authInitialized = false;
  
  constructor() {
    this.initializeAuth();
  }

  private async initializeAuth() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      this.isAuthenticated = !!session;
      this.authInitialized = true;
      
      console.log(`🔐 [ConsolidatedRealtime] Auth initialized: ${this.isAuthenticated ? 'authenticated' : 'unauthenticated'}`);
      
      // Setup auth listener
      supabase.auth.onAuthStateChange((event, session) => {
        const wasAuthenticated = this.isAuthenticated;
        this.isAuthenticated = !!session;
        
        console.log(`🔐 [ConsolidatedRealtime] Auth changed: ${event}, authenticated: ${this.isAuthenticated}`);
        
        // Reinitialize subscriptions if auth status changed
        if (wasAuthenticated !== this.isAuthenticated) {
          this.reinitializeSubscriptions();
        }
      });
    } catch (error) {
      console.warn('[ConsolidatedRealtime] Auth initialization failed:', error);
      this.authInitialized = true;
      this.isAuthenticated = false;
    }
  }

  private async waitForAuth(timeout = 5000): Promise<boolean> {
    if (this.authInitialized) return this.isAuthenticated;
    
    return new Promise((resolve) => {
      const startTime = Date.now();
      const checkAuth = () => {
        if (this.authInitialized) {
          resolve(this.isAuthenticated);
        } else if (Date.now() - startTime > timeout) {
          resolve(false);
        } else {
          setTimeout(checkAuth, 100);
        }
      };
      checkAuth();
    });
  }

  private reinitializeSubscriptions() {
    console.log('🔄 [ConsolidatedRealtime] Reinitializing subscriptions due to auth change');
    
    const currentSubs = Array.from(this.subscriptions.values());
    this.cleanupAll();
    
    // Wait a bit for auth to stabilize, then recreate subscriptions
    setTimeout(() => {
      currentSubs.forEach(sub => {
        this.subscribeToTable(sub.table, sub.callback);
      });
    }, 1000);
  }

  async subscribeToTable(table: string, callback: (payload: any) => void): Promise<() => void> {
    // Wait for auth to be ready
    await this.waitForAuth();
    
    const subscriptionId = `${table}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`🔗 [ConsolidatedRealtime] Subscribing to ${table}`);
    
    // Create unique channel name to avoid conflicts
    const channelName = `consolidated-${table}-${Date.now()}`;
    const channel = supabase.channel(channelName);

    // Set up postgres changes listener
    channel.on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: table
    }, (payload) => {
      console.log(`📦 [ConsolidatedRealtime] ${table} update:`, payload);
      
      try {
        callback(payload);
      } catch (error) {
        console.error(`[ConsolidatedRealtime] Callback error for ${table}:`, error);
      }
    });

    // Subscribe with enhanced error handling
    const subscription = new Promise<RealtimeSubscription>((resolve, reject) => {
      channel.subscribe((status, error) => {
        console.log(`📡 [ConsolidatedRealtime] ${table} status: ${status}`);
        
        if (status === 'SUBSCRIBED') {
          console.log(`✅ [ConsolidatedRealtime] Successfully subscribed to ${table}`);
          
          const subscription: RealtimeSubscription = {
            channel,
            table,
            callback,
            cleanup: () => {
              console.log(`🧹 [ConsolidatedRealtime] Cleaning up subscription for ${table}`);
              try {
                supabase.removeChannel(channel);
                this.subscriptions.delete(subscriptionId);
              } catch (error) {
                console.warn(`[ConsolidatedRealtime] Error cleaning up ${table}:`, error);
              }
            }
          };
          
          this.subscriptions.set(subscriptionId, subscription);
          resolve(subscription);
          
        } else if (status === 'CHANNEL_ERROR') {
          console.warn(`⚠️ [ConsolidatedRealtime] Error subscribing to ${table}:`, error);
          
          // Check for specific errors and decide whether to retry
          const errorMessage = error?.message || '';
          if (errorMessage.includes('permission denied') || 
              errorMessage.includes('not in supabase_realtime publication')) {
            console.log(`🚫 [ConsolidatedRealtime] Permanent error for ${table}, not retrying`);
            reject(new Error(`Permanent subscription error for ${table}: ${errorMessage}`));
          } else {
            // Retry after a delay for transient errors
            console.log(`🔄 [ConsolidatedRealtime] Will retry ${table} in 3 seconds`);
            setTimeout(() => {
              this.subscribeToTable(table, callback);
            }, 3000);
          }
        }
      });
    });

    try {
      const sub = await subscription;
      return sub.cleanup;
    } catch (error) {
      console.error(`[ConsolidatedRealtime] Failed to subscribe to ${table}:`, error);
      return () => {}; // Return no-op cleanup function
    }
  }

  /**
   * Subscribe to multiple tables at once
   */
  async subscribeToTables(tables: string[], callback: (table: string, payload: any) => void): Promise<() => void> {
    const cleanupFunctions = await Promise.all(
      tables.map(table => 
        this.subscribeToTable(table, (payload) => callback(table, payload))
      )
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
      authInitialized: this.authInitialized,
      tables: Array.from(this.subscriptions.values()).map(sub => sub.table)
    };
  }

  /**
   * Clean up all subscriptions
   */
  cleanupAll() {
    console.log('🧹 [ConsolidatedRealtime] Cleaning up all subscriptions');
    
    this.subscriptions.forEach(subscription => {
      try {
        subscription.cleanup();
      } catch (error) {
        console.warn('[ConsolidatedRealtime] Error during cleanup:', error);
      }
    });
    
    this.subscriptions.clear();
  }
}

// Create singleton instance
export const consolidatedRealtimeManager = new ConsolidatedRealtimeManager();

// Export convenience functions
export function subscribeToRealtimeTable(table: string, callback: (payload: any) => void) {
  return consolidatedRealtimeManager.subscribeToTable(table, callback);
}

export function subscribeToRealtimeTables(tables: string[], callback: (table: string, payload: any) => void) {
  return consolidatedRealtimeManager.subscribeToTables(tables, callback);
}

export function getConsolidatedRealtimeStatus() {
  return consolidatedRealtimeManager.getStatus();
}

export function cleanupConsolidatedRealtime() {
  consolidatedRealtimeManager.cleanupAll();
}