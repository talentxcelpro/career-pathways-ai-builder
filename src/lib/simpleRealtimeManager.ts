import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface SimpleRealtimeConfig {
  maxRetries: number;
  retryDelay: number;
  enableLogging: boolean;
}

export class SimpleRealtimeManager {
  private channels: Map<string, RealtimeChannel> = new Map();
  private config: SimpleRealtimeConfig;
  private connectionAttempts: Map<string, number> = new Map();
  private listeners: Map<string, ((payload: any) => void)[]> = new Map();

  constructor(config: Partial<SimpleRealtimeConfig> = {}) {
    this.config = {
      maxRetries: 2,
      retryDelay: 3000,
      enableLogging: true,
      ...config
    };
  }

  /**
   * Subscribe to table changes with simplified approach
   */
  subscribeToTable(
    table: string, 
    callback: (payload: any) => void,
    filter?: string
  ): () => void {
    const channelName = `simple-${table}-${Date.now()}`;
    
    if (this.config.enableLogging) {
      console.log(`🔗 [SimpleRealtime] Subscribing to ${table}`);
    }

    // Store the callback
    const tableListeners = this.listeners.get(table) || [];
    tableListeners.push(callback);
    this.listeners.set(table, tableListeners);

    // Create channel with minimal configuration
    const channel = supabase.channel(channelName);

    // Configure postgres changes listener
    const changeConfig: any = {
      event: '*',
      schema: 'public',
      table: table
    };

    if (filter) {
      changeConfig.filter = filter;
    }

    channel.on('postgres_changes', changeConfig, (payload) => {
      if (this.config.enableLogging) {
        console.log(`📦 [SimpleRealtime] ${table} update:`, payload);
      }
      
      // Notify all listeners for this table
      const listeners = this.listeners.get(table) || [];
      listeners.forEach(listener => {
        try {
          listener(payload);
        } catch (error) {
          console.error(`[SimpleRealtime] Callback error for ${table}:`, error);
        }
      });
    });

    // Subscribe with error handling
    channel.subscribe((status, error) => {
      if (this.config.enableLogging) {
        console.log(`📡 [SimpleRealtime] ${table} status: ${status}`);
      }

      if (status === 'SUBSCRIBED') {
        // Reset retry counter on success
        this.connectionAttempts.delete(table);
        if (this.config.enableLogging) {
          console.log(`✅ [SimpleRealtime] Successfully subscribed to ${table}`);
        }
      } else if (status === 'CHANNEL_ERROR') {
        if (this.config.enableLogging) {
          console.warn(`⚠️ [SimpleRealtime] Error subscribing to ${table}:`, error);
        }
        
        // Simple retry logic
        const attempts = this.connectionAttempts.get(table) || 0;
        if (attempts < this.config.maxRetries) {
          this.connectionAttempts.set(table, attempts + 1);
          setTimeout(() => {
            if (this.config.enableLogging) {
              console.log(`🔄 [SimpleRealtime] Retrying ${table} (attempt ${attempts + 1})`);
            }
            this.subscribeToTable(table, callback, filter);
          }, this.config.retryDelay);
        } else {
          console.error(`🛑 [SimpleRealtime] Failed to subscribe to ${table} after ${attempts} attempts`);
        }
      }
    });

    this.channels.set(channelName, channel);

    // Return cleanup function
    return () => {
      if (this.config.enableLogging) {
        console.log(`🧹 [SimpleRealtime] Unsubscribing from ${table}`);
      }
      
      // Remove callback from listeners
      const listeners = this.listeners.get(table) || [];
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
        this.listeners.set(table, listeners);
      }
      
      // Remove channel
      const ch = this.channels.get(channelName);
      if (ch) {
        supabase.removeChannel(ch);
        this.channels.delete(channelName);
      }
    };
  }

  /**
   * Get current connection status
   */
  getStatus() {
    return {
      totalChannels: this.channels.size,
      activeListeners: Array.from(this.listeners.entries()).reduce((acc, [table, listeners]) => {
        acc[table] = listeners.length;
        return acc;
      }, {} as Record<string, number>)
    };
  }

  /**
   * Cleanup all connections
   */
  cleanup() {
    if (this.config.enableLogging) {
      console.log('🧹 [SimpleRealtime] Cleaning up all connections');
    }
    
    this.channels.forEach((channel) => {
      try {
        supabase.removeChannel(channel);
      } catch (error) {
        console.warn('[SimpleRealtime] Error removing channel:', error);
      }
    });
    
    this.channels.clear();
    this.listeners.clear();
    this.connectionAttempts.clear();
  }
}

// Create singleton instance
export const simpleRealtimeManager = new SimpleRealtimeManager();

// Export convenience functions
export function subscribeToTable(
  table: string, 
  callback: (payload: any) => void,
  filter?: string
) {
  return simpleRealtimeManager.subscribeToTable(table, callback, filter);
}

export function getSimpleRealtimeStatus() {
  return simpleRealtimeManager.getStatus();
}

export function cleanupSimpleRealtime() {
  simpleRealtimeManager.cleanup();
}