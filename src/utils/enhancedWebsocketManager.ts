import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface WebSocketManagerConfig {
  maxRetries?: number;
  retryDelay?: number;
  onError?: (error: Error) => void;
  onReconnect?: () => void;
  timeout?: number;
}

export class EnhancedWebSocketManager {
  private channels: Map<string, RealtimeChannel> = new Map();
  private config: WebSocketManagerConfig;
  private retryAttempts: Map<string, number> = new Map();
  private connectionState: 'connecting' | 'connected' | 'disconnected' | 'error' = 'disconnected';
  private healthCheckInterval: NodeJS.Timeout | null = null;

  constructor(config: WebSocketManagerConfig = {}) {
    this.config = {
      maxRetries: 5,
      retryDelay: 2000,
      timeout: 30000,
      ...config
    };
    
    this.startHealthCheck();
  }

  private startHealthCheck() {
    // Check connection health every 30 seconds
    this.healthCheckInterval = setInterval(() => {
      this.checkConnectionHealth();
    }, 30000);
  }

  private async checkConnectionHealth() {
    try {
      // Simple query to test connection
      const { error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
        
      if (error) {
        console.warn('📡 Connection health check failed:', error.message);
        if (error.message.includes('JWT') || error.message.includes('expired')) {
          // Token expired, need to refresh
          window.location.reload();
        }
      }
    } catch (error) {
      console.warn('📡 Connection health check error:', error);
    }
  }

  createChannel(channelName: string, options: { 
    retryOnError?: boolean;
    autoReconnect?: boolean;
  } = {}): RealtimeChannel {
    const { retryOnError = true, autoReconnect = true } = options;
    
    // Clean up existing channel if it exists
    this.removeChannel(channelName);

    console.log(`📡 Creating enhanced channel: ${channelName}`);
    const channel = supabase.channel(channelName, {
      config: {
        presence: { key: 'user_id' },
        broadcast: { self: true }
      }
    });
    
    this.channels.set(channelName, channel);
    this.retryAttempts.set(channelName, 0);

    // Enhanced error handling with circuit breaker pattern
    channel.subscribe((status, err) => {
      console.log(`📡 Channel ${channelName} status: ${status}`);
      
      switch (status) {
        case 'SUBSCRIBED':
          console.log(`✅ Channel ${channelName} subscribed successfully`);
          this.connectionState = 'connected';
          this.retryAttempts.set(channelName, 0);
          this.config.onReconnect?.();
          break;
          
        case 'CHANNEL_ERROR':
          console.warn(`⚠️ Channel ${channelName} error:`, err);
          this.connectionState = 'error';
          
          // Don't retry on certain error types
          if (this.shouldSkipRetry(err)) {
            console.log(`🚫 Skipping retry for ${channelName} due to error type`);
            return;
          }
          
          if (retryOnError) {
            this.handleChannelError(channelName, err, autoReconnect);
          }
          break;
          
        case 'TIMED_OUT':
          console.warn(`⏰ Channel ${channelName} timed out`);
          this.connectionState = 'error';
          if (autoReconnect) {
            this.scheduleReconnect(channelName);
          }
          break;
          
        case 'CLOSED':
          console.log(`🔒 Channel ${channelName} closed`);
          this.connectionState = 'disconnected';
          if (autoReconnect) {
            this.scheduleReconnect(channelName);
          }
          break;
      }
    });

    return channel;
  }

  private shouldSkipRetry(error?: any): boolean {
    if (!error) return false;
    
    const errorMsg = error.message || error.toString().toLowerCase();
    
    // Skip retry for these error types
    const skipErrors = [
      'jwt',
      'unauthorized', 
      'authentication',
      'expired',
      'invalid_token',
      'permission denied'
    ];
    
    return skipErrors.some(skip => errorMsg.includes(skip));
  }

  private handleChannelError(channelName: string, error?: any, autoReconnect = true) {
    const attempts = this.retryAttempts.get(channelName) || 0;
    const maxRetries = this.config.maxRetries || 5;
    
    if (attempts >= maxRetries) {
      console.error(`❌ Max retries (${maxRetries}) reached for channel ${channelName}`);
      this.removeChannel(channelName);
      this.config.onError?.(error || new Error(`Channel ${channelName} failed after ${attempts} attempts`));
      return;
    }

    const delay = this.config.retryDelay! * Math.pow(2, attempts); // Exponential backoff
    console.log(`🔄 Retrying channel ${channelName} in ${delay}ms (attempt ${attempts + 1}/${maxRetries})`);
    
    setTimeout(() => {
      if (autoReconnect) {
        this.retryAttempts.set(channelName, attempts + 1);
        this.recreateChannel(channelName);
      }
    }, delay);
  }

  private scheduleReconnect(channelName: string) {
    const delay = 5000; // 5 second delay for reconnects
    console.log(`📡 Scheduling reconnect for ${channelName} in ${delay}ms`);
    
    setTimeout(() => {
      if (this.channels.has(channelName)) {
        this.recreateChannel(channelName);
      }
    }, delay);
  }

  private recreateChannel(channelName: string) {
    console.log(`🔄 Recreating channel: ${channelName}`);
    
    // Remove the failed channel
    this.removeChannel(channelName);
    
    // Create a new channel with the same name
    const newChannel = this.createChannel(channelName);
    return newChannel;
  }

  removeChannel(channelName: string): void {
    const channel = this.channels.get(channelName);
    if (channel) {
      try {
        supabase.removeChannel(channel);
      } catch (error) {
        console.warn(`Warning: Could not remove channel ${channelName}:`, error);
      }
      this.channels.delete(channelName);
      this.retryAttempts.delete(channelName);
      console.log(`🗑️ Removed channel: ${channelName}`);
    }
  }

  removeAllChannels(): void {
    console.log('🗑️ Removing all channels...');
    this.channels.forEach((_, channelName) => {
      this.removeChannel(channelName);
    });
  }

  getChannel(channelName: string): RealtimeChannel | undefined {
    return this.channels.get(channelName);
  }

  isChannelActive(channelName: string): boolean {
    const channel = this.channels.get(channelName);
    return channel?.state === 'joined';
  }

  getConnectionState(): string {
    return this.connectionState;
  }

  // Force reconnect all channels
  reconnectAll(): void {
    console.log('🔄 Force reconnecting all channels...');
    const channelNames = Array.from(this.channels.keys());
    
    channelNames.forEach(channelName => {
      this.recreateChannel(channelName);
    });
  }

  destroy(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    
    this.removeAllChannels();
    console.log('🔥 Enhanced WebSocket Manager destroyed');
  }
}

// Enhanced singleton instance with better error handling
export const enhancedWebsocketManager = new EnhancedWebSocketManager({
  maxRetries: 3,
  retryDelay: 2000,
  timeout: 30000,
  onError: (error) => {
    console.error('📡 Enhanced WebSocket manager error:', error);
    
    // Show user-friendly error message
    if (error.message.includes('JWT') || error.message.includes('expired')) {
      console.log('🔄 Authentication expired, refreshing page...');
      // Could show a toast here instead of auto-refresh
      setTimeout(() => window.location.reload(), 2000);
    }
  },
  onReconnect: () => {
    console.log('✅ Enhanced WebSocket reconnected successfully');
  }
});

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    enhancedWebsocketManager.destroy();
  });
}