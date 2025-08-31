import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface WebSocketManagerConfig {
  maxRetries?: number;
  retryDelay?: number;
  onError?: (error: Error) => void;
  onReconnect?: () => void;
}

export class WebSocketManager {
  private channels: Map<string, RealtimeChannel> = new Map();
  private config: WebSocketManagerConfig;
  private retryAttempts: Map<string, number> = new Map();

  constructor(config: WebSocketManagerConfig = {}) {
    this.config = {
      maxRetries: 5,
      retryDelay: 1000,
      ...config
    };
  }

  createChannel(channelName: string): RealtimeChannel {
    // Clean up existing channel if it exists
    this.removeChannel(channelName);

    const channel = supabase.channel(channelName);
    this.channels.set(channelName, channel);
    this.retryAttempts.set(channelName, 0);

    // Add error handling with better logging
    channel.subscribe((status, err) => {
      console.log(`Channel ${channelName} status:`, status);
      
      if (status === 'CHANNEL_ERROR') {
        console.warn(`Channel ${channelName} error:`, err);
        // Don't retry on connection errors, just log
        if (err && typeof err === 'object' && (err as any)._type === 'undefined') {
          console.warn(`WebSocket connection error for ${channelName}, ignoring...`);
          return;
        }
        this.handleChannelError(channelName, err);
      } else if (status === 'SUBSCRIBED') {
        console.log(`✅ Channel ${channelName} subscribed successfully`);
        this.retryAttempts.set(channelName, 0);
        this.config.onReconnect?.();
      } else if (status === 'CLOSED') {
        console.log(`Channel ${channelName} closed`);
      }
    });

    return channel;
  }

  private handleChannelError(channelName: string, error?: any) {
    const attempts = this.retryAttempts.get(channelName) || 0;
    
    // Don't retry if it's a connection error - just log it
    if (error && (error.message?.includes('WebSocket') || error.code)) {
      console.warn(`WebSocket connection issue for channel ${channelName}:`, error);
      return;
    }
    
    if (attempts < (this.config.maxRetries || 3)) {
      console.log(`Retrying channel ${channelName} in ${this.config.retryDelay}ms (attempt ${attempts + 1})`);
      
      setTimeout(() => {
        this.retryAttempts.set(channelName, attempts + 1);
        
        // Remove the failed channel first
        this.removeChannel(channelName);
        
        // Create a new channel with the same name
        const newChannel = this.createChannel(channelName);
        this.channels.set(channelName, newChannel);
      }, this.config.retryDelay);
    } else {
      console.error(`❌ Max retries reached for channel ${channelName}`);
      this.removeChannel(channelName); // Clean up failed channel
      this.config.onError?.(error || new Error(`Channel ${channelName} failed after ${attempts} attempts`));
    }
  }

  removeChannel(channelName: string): void {
    const channel = this.channels.get(channelName);
    if (channel) {
      supabase.removeChannel(channel);
      this.channels.delete(channelName);
      this.retryAttempts.delete(channelName);
    }
  }

  removeAllChannels(): void {
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
}

// Singleton instance
export const websocketManager = new WebSocketManager({
  onError: (error) => {
    console.error('WebSocket manager error:', error);
  },
  onReconnect: () => {
    console.log('WebSocket reconnected successfully');
  }
});