// src/agents/kernel/EventBus.ts
// Persistent Pub/Sub Event Bus writing to memory and Supabase telemetry

import type { BusinessEvent, BusinessEventType, DepartmentId } from './types';
import { supabase } from '@/integrations/supabase/client';

export type KernelEventHandler<T = any> = (event: BusinessEvent<T>) => Promise<void> | void;

class KernelEventBus {
  private handlers = new Map<BusinessEventType | '*', Set<KernelEventHandler>>();
  private inMemoryHistory: BusinessEvent[] = [];
  private readonly MAX_HISTORY = 500;

  subscribe<T = any>(eventType: BusinessEventType | '*', handler: KernelEventHandler<T>): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler);

    return () => {
      this.handlers.get(eventType)?.delete(handler);
    };
  }

  async publish<T = any>(
    type: BusinessEventType,
    payload: T,
    sourceAgent: string,
    department: DepartmentId = 'executive',
    metadata?: Record<string, any>
  ): Promise<BusinessEvent<T>> {
    const event: BusinessEvent<T> = {
      id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type,
      payload,
      sourceAgent,
      department,
      timestamp: new Date().toISOString(),
      metadata,
    };

    // Store in memory ring-buffer
    this.inMemoryHistory.unshift(event);
    if (this.inMemoryHistory.length > this.MAX_HISTORY) {
      this.inMemoryHistory.pop();
    }

    // Persist to Supabase telemetry table
    try {
      await supabase.from('claim1_growth_events' as any).insert({
        event_type: type,
        channel: `dept_${department}`,
        metadata: { ...payload, sourceAgent, department, eventId: event.id },
      });
    } catch {
      // safe fallback
    }

    // Dispatch to subscribers
    const specific = this.handlers.get(type);
    if (specific) {
      for (const h of specific) {
        try {
          await h(event);
        } catch (err) {
          console.error(`[KernelEventBus] Error in handler for ${type}:`, err);
        }
      }
    }

    const wildcard = this.handlers.get('*');
    if (wildcard) {
      for (const h of wildcard) {
        try {
          await h(event);
        } catch (err) {
          console.error(`[KernelEventBus] Wildcard handler error for ${type}:`, err);
        }
      }
    }

    return event;
  }

  getRecentEvents(limit = 40): BusinessEvent[] {
    return this.inMemoryHistory.slice(0, limit);
  }
}

export const kernelEventBus = new KernelEventBus();
