// Conversion Telemetry — Lightweight, ₹0 In-Memory & Session Funnel Tracker
// Tracks funnel milestones: landing_view -> ats_started -> ats_completed -> signup_cta_click -> signup_completed -> matching_jobs_clicked
// No external analytics, no cookies, no personal data, zero PII, zero resume content stored.

export type ConversionEvent = 
  | 'landing_view'
  | 'ats_started'
  | 'ats_completed'
  | 'signup_cta_view'
  | 'signup_cta_click'
  | 'signup_started'
  | 'signup_completed'
  | 'matching_jobs_clicked';

export interface ConversionStats {
  landing_view: number;
  ats_started: number;
  ats_completed: number;
  signup_cta_view: number;
  signup_cta_click: number;
  signup_started: number;
  signup_completed: number;
  matching_jobs_clicked: number;
  // Derived conversion rates
  atsCompletionRate: string;   // ats_completed / ats_started
  signupCtaClickRate: string;  // signup_cta_click / signup_cta_view
  signupConversionRate: string; // signup_completed / signup_started
  overallFunnelRate: string;   // signup_completed / landing_view
}

const STORAGE_KEY = 'txc_conversion_telemetry';

class ConversionTelemetryManager {
  private counts: Record<ConversionEvent, number> = {
    landing_view: 0,
    ats_started: 0,
    ats_completed: 0,
    signup_cta_view: 0,
    signup_cta_click: 0,
    signup_started: 0,
    signup_completed: 0,
    matching_jobs_clicked: 0
  };

  constructor() {
    this.loadFromSession();
  }

  private loadFromSession(): void {
    if (typeof window === 'undefined') return;
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        this.counts = { ...this.counts, ...parsed };
      }
    } catch {
      // Ignore session storage errors
    }
  }

  private saveToSession(): void {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(this.counts));
    } catch {
      // Ignore session storage errors
    }
  }

  /**
   * Records a conversion event
   */
  track(event: ConversionEvent, meta?: { source?: string; score?: number }): void {
    if (this.counts[event] !== undefined) {
      this.counts[event]++;
      this.saveToSession();
    }
    
    // Optional console log for developer visibility
    if (typeof window !== 'undefined' && (import.meta as any).env?.DEV) {
      console.log(`[ConversionTelemetry] ${event}`, meta || '');
    }
  }

  /**
   * Sets acquisition context for the signup return flow
   */
  setAcquisitionContext(source: 'ats_scanner' | 'jobs' | 'seo_job_page' | 'homepage', returnUrl?: string): void {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.setItem('txc_acquisition_source', source);
      if (returnUrl) {
        sessionStorage.setItem('txc_acquisition_return_url', returnUrl);
      }
    } catch {
      // Ignore
    }
  }

  /**
   * Retrieves and clears the acquisition return URL
   */
  consumeAcquisitionReturnUrl(): { source: string | null; returnUrl: string | null } {
    if (typeof window === 'undefined') return { source: null, returnUrl: null };
    try {
      const source = sessionStorage.getItem('txc_acquisition_source');
      const returnUrl = sessionStorage.getItem('txc_acquisition_return_url');
      sessionStorage.removeItem('txc_acquisition_return_url');
      return { source, returnUrl };
    } catch {
      return { source: null, returnUrl: null };
    }
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
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch {}
    }
  }
}

export const conversionTelemetry = new ConversionTelemetryManager();

// Expose globally on window for DevTools inspection
if (typeof window !== 'undefined') {
  (window as any).conversionTelemetry = conversionTelemetry;
}
