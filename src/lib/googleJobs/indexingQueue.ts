/**
 * Google Indexing API Queue Manager
 * Buffers job update/deletion events and dispatches them with rate-limiting.
 */

import { IndexingEventType, GoogleIndexingApiClient } from './indexingApi';

export interface QueuedIndexingEvent {
  id: string;
  jobId: string;
  url: string;
  eventType: IndexingEventType;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  retryCount: number;
  lastError?: string;
  queuedAt: string;
}

export class IndexingQueueManager {
  private queue: QueuedIndexingEvent[] = [];
  private client: GoogleIndexingApiClient;

  constructor(client?: GoogleIndexingApiClient) {
    this.client = client || new GoogleIndexingApiClient();
  }

  enqueue(jobId: string, url: string, eventType: IndexingEventType): QueuedIndexingEvent {
    const event: QueuedIndexingEvent = {
      id: `idx-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      jobId,
      url,
      eventType,
      status: 'PENDING',
      retryCount: 0,
      queuedAt: new Date().toISOString(),
    };
    this.queue.push(event);
    return event;
  }

  async processNextBatch(batchSize = 10): Promise<number> {
    const pending = this.queue.filter((e) => e.status === 'PENDING').slice(0, batchSize);
    let processed = 0;

    for (const item of pending) {
      try {
        const result = item.eventType === 'URL_UPDATED'
          ? await this.client.notifyJobUpdated(item.url)
          : await this.client.notifyJobDeleted(item.url);

        if (result.success) {
          item.status = 'SUCCESS';
          processed++;
        } else {
          item.status = 'FAILED';
          item.lastError = result.message;
          item.retryCount++;
        }
      } catch (err: any) {
        item.status = 'FAILED';
        item.lastError = err?.message || 'Unknown network error';
        item.retryCount++;
      }
    }

    return processed;
  }

  getQueueSnapshot(): QueuedIndexingEvent[] {
    return [...this.queue];
  }
}
