// Conversion Telemetry — Persistent Growth & Funnel Telemetry Tracker
// Tracks core funnel milestones: landing_view -> ats_started -> ats_completed -> signup_cta_click -> signup_completed -> matching_jobs_clicked -> job_applied
// Persists stats & event stream across sessions, tabs, and OAuth redirects via localStorage & Supabase.

import { supabase } from '@/integrations/supabase/client';

export type ConversionEvent = 
  | 'landing_view'
  | 'ats_started'
  | 'ats_completed'
  | 'signup_cta_view'
  | 'signup_cta_click'
  | 'signup_started'
  | 'signup_completed'
  | 'matching_jobs_clicked'
  | 'view_job_detail'
  | 'job_applied';

export interface TelemetryLogEntry {
  event: ConversionEvent;
  timestamp: string;
  url: string;
  referrer?: string;
  metadata?: Record<string, any>;
  synced?: boolean;
}

export interface ConversionStats {
  landing_view: number;
  ats_started: number;
  ats_completed: number;
  signup_cta_view: number;
  signup_cta_click: number;
  signup_started: number;
  signup_completed: number;
  matching_jobs_clicked: number;
  view_job_detail: number;
  job_applied: number;
  // Derived conversion rates
  atsCompletionRate: string;   // ats_completed / ats_started
  signupCtaClickRate: string;  // signup_cta_click / signup_cta_view
  signupConversionRate: string; // signup_completed / signup_started
  overallFunnelRate: string;   // signup_completed / landing_view
}

const STORAGE_KEY = 'txc_persistent_funnel_stats';
const LOG_STORAGE_KEY = 'txc_funnel_events_log';
const MAX_LOCAL_EVENTS = 50;

class ConversionTelemetryManager {
  private counts: Record<ConversionEvent, number> = {
    landing_view: 0,
    ats_started: 0,
    ats_completed: 0,
    signup_cta_view: 0,
    signup_cta_click: 0,
    signup_started: 0,
    signup_completed: 0,
    matching_jobs_clicked: 0,
    view_job_detail: 0,
    job_applied: 0,
  };

  private eventsLog: TelemetryLogEntry[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      const rawCounts = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
      if (rawCounts) {
        const parsed = JSON.parse(rawCounts);
        this.counts = { ...this.counts, ...parsed };
      }
      const rawLog = localStorage.getItem(LOG_STORAGE_KEY);
      if (rawLog) {
        this.eventsLog = JSON.parse(rawLog);
      }
    } catch {
      // Storage safety
    }
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      const serializedCounts = JSON.stringify(this.counts);
      localStorage.setItem(STORAGE_KEY, serializedCounts);
      sessionStorage.setItem(STORAGE_KEY, serializedCounts);
      localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(this.eventsLog.slice(-MAX_LOCAL_EVENTS)));
    } catch {
      // Storage safety
    }
  }

  /**
   * Records a conversion event locally and syncs to backend if authenticated
   */
  track(event: ConversionEvent, meta?: { source?: string; score?: number; [key: string]: any }): void {
    if (this.counts[event] !== undefined) {
      this.counts[event]++;
    }

    const logEntry: TelemetryLogEntry = {
      event,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.pathname + window.location.search : '',
      referrer: typeof document !== 'undefined' ? document.referrer : '',
      metadata: meta,
    };

    this.eventsLog.push(logEntry);
    if (this.eventsLog.length > MAX_LOCAL_EVENTS) {
      this.eventsLog.shift();
    }

    this.saveToStorage();

    // Async background sync to Supabase user_behavior_events if authenticated
    this.syncToSupabase(logEntry);

    if (typeof window !== 'undefined' && (import.meta as any).env?.DEV) {
      console.log(`[GrowthTelemetry] ${event}`, meta || '');
    }
  }

  private async syncToSupabase(entry: TelemetryLogEntry): Promise<void> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        // Find all un-synced entries including current
        const pending = this.eventsLog.filter(e => !e.synced);
        if (!pending.some(e => e.timestamp === entry.timestamp && e.event === entry.event)) {
          pending.push(entry);
        }

        const rows = pending.map(e => ({
          user_id: session.user.id,
          event_type: e.event,
          event_category: 'growth_funnel',
          page_url: e.url,
          referrer: e.referrer || null,
          event_data: e.metadata || {},
          created_at: e.timestamp,
        }));

        if (rows.length > 0) {
          const { error } = await supabase.from('user_behavior_events').insert(rows);
          if (!error) {
            pending.forEach(e => { e.synced = true; });
            this.saveToStorage();
          }
        }
      }
    } catch {
      // Non-blocking telemetry failure
    }
  }

  /**
   * Sets acquisition context for the signup return flow
   */
  setAcquisitionContext(source: string, returnUrl?: string): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('txc_acquisition_source', source);
      sessionStorage.setItem('txc_acquisition_source', source);
      if (returnUrl) {
        localStorage.setItem('txc_acquisition_return_url', returnUrl);
        sessionStorage.setItem('txc_acquisition_return_url', returnUrl);
      }
    } catch {}
  }

  /**
   * Retrieves and clears the acquisition return URL
   */
  consumeAcquisitionReturnUrl(): { source: string | null; returnUrl: string | null } {
    if (typeof window === 'undefined') return { source: null, returnUrl: null };
    try {
      const source = localStorage.getItem('txc_acquisition_source') || sessionStorage.getItem('txc_acquisition_source');
      const returnUrl = localStorage.getItem('txc_acquisition_return_url') || sessionStorage.getItem('txc_acquisition_return_url');
      localStorage.removeItem('txc_acquisition_return_url');
      sessionStorage.removeItem('txc_acquisition_return_url');
      return { source, returnUrl };
    } catch {
      return { source: null, returnUrl: null };
    }
  }

  /**
   * Returns recent events log
   */
  getRecentEvents(): TelemetryLogEntry[] {
    return [...this.eventsLog];
  }

  /**
   * Returns current funnel counts and calculated conversion rates
   */
  getStats(): ConversionStats {
    const c = this.counts;
    const pct = (num: number, den: number) => 
      den > 0 ? `${((num / den) * 100).toFixed(1)}%` : '0.0%';

    return {
      ...c,
      atsCompletionRate: pct(c.ats_completed, c.ats_started),
      signupCtaClickRate: pct(c.signup_cta_click, c.signup_cta_view),
      signupConversionRate: pct(c.signup_completed, c.signup_started),
      overallFunnelRate: pct(c.signup_completed, c.landing_view)
    };
  }

  reset(): void {
    Object.keys(this.counts).forEach(k => {
      this.counts[k as ConversionEvent] = 0;
    });
    this.eventsLog = [];
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(LOG_STORAGE_KEY);
      } catch {}
    }
  }
}

export const conversionTelemetry = new ConversionTelemetryManager();

// Expose globally on window for DevTools inspection
if (typeof window !== 'undefined') {
  (window as any).conversionTelemetry = conversionTelemetry;
}
