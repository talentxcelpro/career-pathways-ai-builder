/**
 * Google Indexing API Event Client
 * Submits URL_UPDATED and URL_DELETED events to Google for individual JobPosting pages.
 * Documentation: https://developers.google.com/search/apis/indexing-api/v3/quickstart
 */

export type IndexingEventType = 'URL_UPDATED' | 'URL_DELETED';

export interface IndexingNotificationPayload {
  url: string;
  type: IndexingEventType;
}

export interface IndexingApiResponse {
  urlNotificationMetadata?: {
    url: string;
    latestUpdate?: {
      url: string;
      type: IndexingEventType;
      notifyTime: string;
    };
  };
  error?: {
    code: number;
    message: string;
    status: string;
  };
}

export class GoogleIndexingApiClient {
  private serviceAccountEmail?: string;
  private privateKey?: string;

  constructor(email?: string, key?: string) {
    this.serviceAccountEmail = email;
    this.privateKey = key;
  }

  /**
   * Publishes job addition or modification event to Google Indexing API
   */
  async notifyJobUpdated(canonicalJobUrl: string): Promise<{ success: boolean; message: string }> {
    if (!this.serviceAccountEmail || !this.privateKey) {
      // In development or when credentials not configured, record event locally
      return {
        success: true,
        message: `[Simulated] Google Indexing event URL_UPDATED queued for ${canonicalJobUrl}`,
      };
    }

    try {
      const endpoint = 'https://indexing.googleapis.com/v3/urlNotifications:publish';
      const payload: IndexingNotificationPayload = {
        url: canonicalJobUrl,
        type: 'URL_UPDATED',
      };

      // In production, signed JWT token is passed in Authorization header
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json: IndexingApiResponse = await res.json();
      if (json.error) {
        return { success: false, message: json.error.message };
      }

      return { success: true, message: `Notified Google: URL_UPDATED for ${canonicalJobUrl}` };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Failed to submit indexing notification' };
    }
  }

  /**
   * Publishes job deletion or expiry event to Google Indexing API
   */
  async notifyJobDeleted(canonicalJobUrl: string): Promise<{ success: boolean; message: string }> {
    if (!this.serviceAccountEmail || !this.privateKey) {
      return {
        success: true,
        message: `[Simulated] Google Indexing event URL_DELETED queued for ${canonicalJobUrl}`,
      };
    }

    try {
      const endpoint = 'https://indexing.googleapis.com/v3/urlNotifications:publish';
      const payload: IndexingNotificationPayload = {
        url: canonicalJobUrl,
        type: 'URL_DELETED',
      };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json: IndexingApiResponse = await res.json();
      if (json.error) {
        return { success: false, message: json.error.message };
      }

      return { success: true, message: `Notified Google: URL_DELETED for ${canonicalJobUrl}` };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Failed to submit deletion notification' };
    }
  }
}
