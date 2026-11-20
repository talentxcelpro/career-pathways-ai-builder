/**
 * src/utils/realtimeChannelRegistry.ts
 *
 * Singleton registry that tracks every open Supabase Realtime channel and
 * enforces a hard cap of MAX_CHANNELS (8) simultaneous channels.
 *
 * When a new channel registration would exceed the cap, the oldest channel
 * is forcibly removed via supabase.removeChannel() before the new one is
 * recorded.  This prevents uncoordinated hooks from leaking WebSocket slots.
 *
 * Usage:
 *   import { realtimeChannelRegistry } from '@/utils/realtimeChannelRegistry';
 *
 *   const ch = supabase.channel('my-channel');
 *   realtimeChannelRegistry.register('my-channel', ch);
 *   ch.subscribe();
 *
 *   // On cleanup:
 *   realtimeChannelRegistry.unregister('my-channel');
 */

import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

const MAX_CHANNELS = 8;

interface ChannelEntry {
  name: string;
  channel: RealtimeChannel;
  registeredAt: number; // epoch ms — used to evict the oldest first
}

class RealtimeChannelRegistry {
  /** Insertion-ordered map — first key is the oldest channel. */
  private channels: Map<string, ChannelEntry> = new Map();

  /**
   * Register a new Realtime channel.
   *
   * If registering would push the active count above MAX_CHANNELS, the oldest
   * tracked channel is removed first so the total never exceeds the cap.
   */
  register(channelName: string, channel: RealtimeChannel): void {
    // If the name is already tracked (e.g. hot-reload), clean it up first.
    if (this.channels.has(channelName)) {
      this._evict(channelName);
    }

    // Enforce hard cap — evict oldest before inserting.
    while (this.channels.size >= MAX_CHANNELS) {
      const oldestKey = this.channels.keys().next().value;
      if (oldestKey === undefined) break;
      console.warn(
        `[RealtimeRegistry] Cap of ${MAX_CHANNELS} reached. Evicting oldest channel: "${oldestKey}"`
      );
      this._evict(oldestKey);
    }

    this.channels.set(channelName, {
      name: channelName,
      channel,
      registeredAt: Date.now(),
    });

    if (process.env.NODE_ENV === 'development') {
      console.debug(
        `[RealtimeRegistry] Registered "${channelName}" — active: ${this.channels.size}/${MAX_CHANNELS}`
      );
    }
  }

  /**
   * Unregister a channel by name and close it cleanly via
   * supabase.removeChannel().  Safe to call even if the name was never
   * registered.
   */
  unregister(channelName: string): void {
    if (!this.channels.has(channelName)) return;
    this._evict(channelName);

    if (process.env.NODE_ENV === 'development') {
      console.debug(
        `[RealtimeRegistry] Unregistered "${channelName}" — active: ${this.channels.size}/${MAX_CHANNELS}`
      );
    }
  }

  /** Number of currently tracked open channels. */
  getActiveCount(): number {
    return this.channels.size;
  }

  /** Internal: remove channel from map and call supabase.removeChannel(). */
  private _evict(channelName: string): void {
    const entry = this.channels.get(channelName);
    if (!entry) return;

    this.channels.delete(channelName);

    try {
      supabase.removeChannel(entry.channel);
    } catch (err) {
      console.error(
        `[RealtimeRegistry] Error removing channel "${channelName}":`,
        err
      );
    }
  }
}

/** Shared singleton — import this everywhere instead of creating per-hook instances. */
export const realtimeChannelRegistry = new RealtimeChannelRegistry();
