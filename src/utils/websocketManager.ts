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
    // Reuse existing channel if still active
    const existing = this.channels.get(channelName);
    if (existing && existing.state !== 'closed') {
      return existing;
    }

    // Clean up any closed channel
    this.removeChannel(channelName);

    const channel = supabase.channel(channelName);
    this.channels.set(channelName, channel);
    this.retryAttempts.set(channelName, 0);

    // Optimized error handling with exponential backoff
    channel.subscribe((status, err) => {
      switch (status) {
        case 'SUBSCRIBED':
          this.retryAttempts.set(channelName, 0);
          this.config.onReconnect?.();
          break;
          
        case 'CHANNEL_ERROR':
          // Ignore common transient errors
          if (err && (
            (err as any).message?.includes('WebSocket') ||
            (err as any).message?.includes('post_likes') ||
            (err as any)._type === 'undefined'
          )) {
            return; // Don't retry for these errors
          }
          this.handleChannelError(channelName, err);
          break;
          
        case 'CLOSED':
          this.channels.delete(channelName);
          this.retryAttempts.delete(channelName);
          break;
      }
    });

    return channel;
  }

  private handleChannelError(channelName: string, error?: any) {
    const attempts = this.retryAttempts.get(channelName) || 0;
    
    // Enhanced error filtering - don't retry common transient errors
    if (error && (
      error.message?.includes('WebSocket') ||
      error.message?.includes('Connection failed') ||
      error.code ||
      (error as any)._type === 'undefined'
    )) {
      return;
    }
    
    if (attempts < (this.config.maxRetries || 2)) { // Reduced max retries
      const delay = Math.min(this.config.retryDelay! * Math.pow(2, attempts), 10000); // Exponential backoff
      
      setTimeout(() => {
        this.retryAttempts.set(channelName, attempts + 1);
        
        // Remove the failed channel first
        this.removeChannel(channelName);
        
        // Create a new channel with the same name
        const newChannel = this.createChannel(channelName);
        this.channels.set(channelName, newChannel);
      }, delay);
    } else {
      this.removeChannel(channelName);
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