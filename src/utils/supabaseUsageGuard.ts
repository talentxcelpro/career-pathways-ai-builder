/**
 * src/utils/supabaseUsageGuard.ts
 *
 * Production Usage Guard & Egress Optimizer for Supabase
 * - Tracks request counts and estimated egress in real-time
 * - Detects duplicate queries fired within a 3-second window
 * - Warns on unrestricted select('*') and unpaginated requests
 * - Persists session telemetry in sessionStorage for diagnostics
 */

export interface SupabaseUsageMetrics {
  totalRequests: number;
  totalEstimatedBytes: number;
  duplicateQueriesDetected: number;
  largePayloadsDetected: number;
  unboundedQueriesDetected: number;
  activeRealtimeChannels: number;
  requestsByEndpoint: Record<string, number>;
  recentAlerts: string[];
}

class SupabaseUsageGuard {
  private metrics: SupabaseUsageMetrics = {
    totalRequests: 0,
    totalEstimatedBytes: 0,
    duplicateQueriesDetected: 0,
    largePayloadsDetected: 0,
    unboundedQueriesDetected: 0,
    activeRealtimeChannels: 0,
    requestsByEndpoint: {},
    recentAlerts: []
  };

  private recentRequests: Map<string, number> = new Map();
  private duplicateWindowMs = 3000;
  private maxAlerts = 20;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;
    try {
      const stored = sessionStorage.getItem('txc_supabase_usage');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.metrics.totalRequests = parsed.totalRequests || 0;
        this.metrics.totalEstimatedBytes = parsed.totalEstimatedBytes || 0;
        this.metrics.duplicateQueriesDetected = parsed.duplicateQueriesDetected || 0;
        this.metrics.largePayloadsDetected = parsed.largePayloadsDetected || 0;
        this.metrics.unboundedQueriesDetected = parsed.unboundedQueriesDetected || 0;
      }
    } catch {
      // Ignore storage errors
    }
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.setItem('txc_supabase_usage', JSON.stringify({
        totalRequests: this.metrics.totalRequests,
        totalEstimatedBytes: this.metrics.totalEstimatedBytes,
        duplicateQueriesDetected: this.metrics.duplicateQueriesDetected,
        largePayloadsDetected: this.metrics.largePayloadsDetected,
        unboundedQueriesDetected: this.metrics.unboundedQueriesDetected,
      }));
    } catch {
      // Ignore storage errors
    }
  }

  private addAlert(message: string) {
    this.metrics.recentAlerts.unshift(`[${new Date().toLocaleTimeString()}] ${message}`);
    if (this.metrics.recentAlerts.length > this.maxAlerts) {
      this.metrics.recentAlerts.pop();
    }
  }

  /**
   * Monitor an outbound Supabase HTTP request
   */
  public recordRequest(inputUrl: string, method: string = 'GET') {
    this.metrics.totalRequests++;

    let urlObj: URL;
    try {
      urlObj = new URL(inputUrl);
    } catch {
      return;
    }

    const pathname = urlObj.pathname;
    const searchParams = urlObj.searchParams;

    // Track by base endpoint
    const endpointKey = `${method} ${pathname.replace('/rest/v1/', '')}`;
    this.metrics.requestsByEndpoint[endpointKey] = (this.metrics.requestsByEndpoint[endpointKey] || 0) + 1;

    // 1. Detect duplicate calls within 3 seconds
    const requestKey = `${method}:${pathname}?${searchParams.toString()}`;
    const now = Date.now();
    const lastCalled = this.recentRequests.get(requestKey);

    if (lastCalled && now - lastCalled < this.duplicateWindowMs) {
      this.metrics.duplicateQueriesDetected++;
      const alertMsg = `Duplicate query within ${now - lastCalled}ms: ${pathname}`;
      this.addAlert(alertMsg);
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[USAGE GUARD] Rapid duplicate request:`, requestKey);
      }
    }
    this.recentRequests.set(requestKey, now);

    // Clean up old entries
    if (this.recentRequests.size > 200) {
      for (const [k, time] of this.recentRequests.entries()) {
        if (now - time > 10000) this.recentRequests.delete(k);
      }
    }

    // 2. Detect unrestricted select('*') on REST endpoints
    const selectParam = searchParams.get('select');
    if (selectParam === '*' || selectParam?.startsWith('*,') || selectParam?.endsWith(',*')) {
      const alertMsg = `Unrestricted select('*') on: ${pathname}`;
      this.addAlert(alertMsg);
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[USAGE GUARD] Unrestricted select('*') detected:`, pathname);
      }
    }

    // 3. Detect queries without limit on list endpoints
    const isHead = searchParams.get('head') === 'true';
    const hasLimit = searchParams.has('limit') || searchParams.has('range') || searchParams.has('offset');
    const isSingle = searchParams.get('single') === 'true';
    const isRpc = pathname.includes('/rpc/');

    if (method === 'GET' && !isHead && !hasLimit && !isSingle && !isRpc) {
      this.metrics.unboundedQueriesDetected++;
      const alertMsg = `Potentially unbounded query (no limit/range): ${pathname}`;
      this.addAlert(alertMsg);
    }

    this.saveToStorage();
  }

  /**
   * Record response payload size
   */
  public recordResponse(inputUrl: string, status: number, contentLengthBytes: number = 0, rowCount?: number) {
    this.metrics.totalEstimatedBytes += contentLengthBytes;

    if (contentLengthBytes > 250000 || (rowCount && rowCount > 100)) {
      this.metrics.largePayloadsDetected++;
      const sizeKb = (contentLengthBytes / 1024).toFixed(1);
      const alertMsg = `Large payload: ${sizeKb}KB (${rowCount || '?'} rows) from ${inputUrl.split('?')[0]}`;
      this.addAlert(alertMsg);
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[USAGE GUARD] Large Supabase response:`, alertMsg);
      }
    }

    this.saveToStorage();
  }

  /**
   * Channel tracking
   */
  public registerChannel(channelName: string) {
    this.metrics.activeRealtimeChannels++;
    if (this.metrics.activeRealtimeChannels > 8) {
      this.addAlert(`High realtime channel count: ${this.metrics.activeRealtimeChannels} channels`);
    }
  }

  public unregisterChannel(channelName: string) {
    this.metrics.activeRealtimeChannels = Math.max(0, this.metrics.activeRealtimeChannels - 1);
  }

  public getMetrics(): SupabaseUsageMetrics {
    return { ...this.metrics };
  }

  public resetMetrics() {
    this.metrics = {
      totalRequests: 0,
      totalEstimatedBytes: 0,
      duplicateQueriesDetected: 0,
      largePayloadsDetected: 0,
      unboundedQueriesDetected: 0,
      activeRealtimeChannels: 0,
      requestsByEndpoint: {},
      recentAlerts: []
    };
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('txc_supabase_usage');
    }
  }
}

export const supabaseUsageGuard = new SupabaseUsageGuard();

/**
 * Custom fetch interceptor for Supabase client
 * Accurately tracks egress, payload sizes, and detects regressions transparently
 */
export const usageGuardFetch: typeof fetch = async (input, init) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
  const method = init?.method || (typeof input === 'object' && 'method' in input ? (input as any).method : 'GET') || 'GET';

  // Only intercept Supabase domain requests
  if (url.includes('supabase.co')) {
    supabaseUsageGuard.recordRequest(url, method);

    try {
      const response = await fetch(input, init);
      
      // Determine response size from Content-Length or rough estimate
      const contentLength = response.headers.get('content-length');
      const bytes = contentLength ? parseInt(contentLength, 10) : 0;
      
      // Check content-range for row counts (e.g., 0-19/250)
      const contentRange = response.headers.get('content-range');
      let rowCount: number | undefined;
      if (contentRange) {
        const match = contentRange.match(/\/(\d+|\*)/);
        if (match && match[1] !== '*') {
          rowCount = parseInt(match[1], 10);
        }
      }

      supabaseUsageGuard.recordResponse(url, response.status, bytes, rowCount);
      return response;
    } catch (err) {
      throw err;
    }
  }

  return fetch(input, init);
};
