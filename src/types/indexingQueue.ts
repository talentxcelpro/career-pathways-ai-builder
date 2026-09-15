// src/types/indexingQueue.ts
// Data contracts for Google Indexing API Acceleration Queue

export type IndexingApiAction = 'URL_UPDATED' | 'URL_DELETED';
export type IndexingQueuePriority = 'HIGH' | 'NORMAL' | 'BATCH';
export type IndexingQueueStatus = 'PENDING' | 'SUBMITTED' | 'FAILED' | 'EXPIRED';

export interface IndexingQueueItem {
  id: string;
  url: string;                     // Strictly an individual canonical job URL (e.g. https://talentxcel.in/jobs/xyz)
  job_id?: string;
  action: IndexingApiAction;       // 'URL_UPDATED' on publish, 'URL_DELETED' on expiration/close
  priority: IndexingQueuePriority; // HIGH for paid/featured, NORMAL for standard
  status: IndexingQueueStatus;
  http_status?: number;
  error_message?: string;
  payload_json?: Record<string, any>;
  submitted_at?: string;
  created_at: string;
  updated_at?: string;
}

export interface GoogleIndexingBatchResult {
  totalProcessed: number;
  submitted: number;
  failed: number;
  quotaRemaining: number;
  items: Array<{
    url: string;
    action: IndexingApiAction;
    status: 'SUCCESS' | 'ERROR';
    responseCode?: number;
    error?: string;
  }>;
}
