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

    // Add error handling
    channel.subscribe((status, err) => {
      console.log(`Channel ${channelName} status:`, status, err);
      
      if (status === 'CHANNEL_ERROR') {
        this.handleChannelError(channelName, err);
      } else if (status === 'SUBSCRIBED') {
        this.retryAttempts.set(channelName, 0);
        this.config.onReconnect?.();
      }
    });

    return channel;
  }

  private handleChannelError(channelName: string, error?: Error) {
    const attempts = this.retryAttempts.get(channelName) || 0;
    
    if (attempts < (this.config.maxRetries || 5)) {
      console.log(`Retrying channel ${channelName} in ${this.config.retryDelay}ms (attempt ${attempts + 1})`);
      
      setTimeout(() => {
        this.retryAttempts.set(channelName, attempts + 1);
        const newChannel = this.createChannel(channelName);
        this.channels.set(channelName, newChannel);
      }, this.config.retryDelay);
    } else {
      console.error(`Max retries reached for channel ${channelName}`);
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