/**
 * Google Indexing Status Registry
 * Tracks submission timestamps and response metadata.
 */

export interface GoogleIndexingRecord {
  url: string;
  lastSubmittedAt: string;
  lastEventType: 'URL_UPDATED' | 'URL_DELETED';
  responseStatus: 'OK' | 'ERROR' | 'SIMULATED';
  message?: string;
}

const statusStore = new Map<string, GoogleIndexingRecord>();

export function recordIndexingStatus(
  url: string,
  eventType: 'URL_UPDATED' | 'URL_DELETED',
  status: 'OK' | 'ERROR' | 'SIMULATED',
  message?: string
): void {
  statusStore.set(url, {
    url,
    lastSubmittedAt: new Date().toISOString(),
    lastEventType: eventType,
    responseStatus: status,
    message,
  });
}

export function getIndexingStatus(url: string): GoogleIndexingRecord | undefined {
  return statusStore.get(url);
}
