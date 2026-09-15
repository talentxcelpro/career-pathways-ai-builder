// src/agents/shared/EventBus.ts
// Central Event Bus for Pub/Sub inter-agent communication and reactive triggers

import type { BusinessEvent, BusinessEventType, EventHandler } from './types';

class CentralEventBus {
  private handlers = new Map<BusinessEventType | '*', Set<EventHandler>>();
  private eventHistory: BusinessEvent[] = [];
  private readonly MAX_HISTORY = 500;

  /**
   * Subscribes an agent handler to a specific business event or all events ('*')
   */
  subscribe<T = any>(eventType: BusinessEventType | '*', handler: EventHandler<T>): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }

    this.handlers.get(eventType)!.add(handler);

    // Return un-subscribe function
    return () => {
      this.handlers.get(eventType)?.delete(handler);
    };
  }

  /**
   * Publishes an event to all subscribed agents and stores in memory history
   */
  async publish<T = any>(
    type: BusinessEventType,
    payload: T,
    sourceAgent: string,
    metadata?: Record<string, any>
  ): Promise<BusinessEvent<T>> {
    const event: BusinessEvent<T> = {
      id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type,
      payload,
      sourceAgent,
      timestamp: new Date().toISOString(),
      metadata,
    };

    // Keep bounded history for memory inspection
    this.eventHistory.unshift(event);
    if (this.eventHistory.length > this.MAX_HISTORY) {
      this.eventHistory.pop();
    }

    // Notify specific type listeners
    const specificHandlers = this.handlers.get(type);
    if (specificHandlers) {
      for (const handler of specificHandlers) {
        try {
          await handler(event);
        } catch (err) {
          console.error(`[EventBus] Handler error for ${type}:`, err);
        }
      }
    }

    // Notify wildcard listeners
    const wildcardHandlers = this.handlers.get('*');
    if (wildcardHandlers) {
      for (const handler of wildcardHandlers) {
        try {
          await handler(event);
        } catch (err) {
          console.error(`[EventBus] Wildcard handler error for ${type}:`, err);
        }
      }
    }

    return event;
  }

  /**
   * Gets recent event history
   */
  getRecentEvents(limit = 50): BusinessEvent[] {
    return this.eventHistory.slice(0, limit);
  }
}

export const eventBus = new CentralEventBus();
