// Conversion Telemetry — Persistent Growth & Funnel Telemetry Tracker
// Tracks core funnel milestones: landing_view -> ats_started -> ats_completed -> signup_cta_click -> signup_completed -> matching_jobs_clicked -> job_applied
// Persists stats & event stream across sessions, tabs, and OAuth redirects via localStorage & Supabase.

import { supabase } from '@/integrations/supabase/client';
import { getCrossSubdomainCookieDomain } from '@/config/domainArchitecture';

export type ConversionEvent = 
  | 'landing_view'
  | 'free_tool_started'
  | 'free_tool_completed'
  | 'signup_started'
  | 'signup_completed'
  | 'email_verified'
  | 'profile_completed'
  | 'job_saved'
  | 'application_started'
  | 'resume_created'
  | 'salary_report_saved'
  | 'career_plan_saved'
  | 'alert_created'
  | 'learning_progress_saved'
  | 'employer_job_published'
  | 'return_visit'
  // Legacy events retained for 100% backward compatibility
  | 'ats_started'
  | 'ats_completed'
  | 'signup_cta_view'
  | 'signup_cta_click'
  | 'matching_jobs_clicked'
  | 'view_job_detail'
  | 'job_applied';

export type FunnelCategory = 'job_seeker' | 'employer' | 'institution';

export interface TelemetryLogEntry {
  event: ConversionEvent;
  timestamp: string;
  url: string;
  hostname: string;
  funnelType: FunnelCategory;
  anonymousSessionId: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  metadata?: Record<string, any>;
  synced?: boolean;
}

export interface FirstTouchAttribution {
  landingHostname: string;
  landingPath: string;
  referrer: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  timestamp: string;
}

export interface ConversionStats {
  landing_view: number;
  free_tool_started: number;
  free_tool_completed: number;
  signup_started: number;
  signup_completed: number;
  email_verified: number;
  profile_completed: number;
  job_saved: number;
  application_started: number;
  resume_created: number;
  salary_report_saved: number;
  career_plan_saved: number;
  alert_created: number;
  learning_progress_saved: number;
  employer_job_published: number;
  return_visit: number;
  // Legacy milestones
  ats_started: number;
  ats_completed: number;
  signup_cta_view: number;
  signup_cta_click: number;
  matching_jobs_clicked: number;
  view_job_detail: number;
  job_applied: number;
  // Derived conversion rates
  toolCompletionRate: string;   // (free_tool_completed + ats_completed) / (free_tool_started + ats_started)
  signupConversionRate: string; // signup_completed / signup_started
  overallFunnelRate: string;   // signup_completed / landing_view
}

const STORAGE_KEY = 'txc_persistent_funnel_stats';
const LOG_STORAGE_KEY = 'txc_funnel_events_log';
const ANON_SID_COOKIE = 'txc_anon_sid';
const FIRST_TOUCH_KEY = 'txc_first_touch_attribution';
const MAX_LOCAL_EVENTS = 50;

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
}

function setCookie(name: string, value: string, maxAgeSeconds: number = 31536000): void {
  if (typeof document === 'undefined') return;
  const cookieDomain = getCrossSubdomainCookieDomain();
  const domainPart = cookieDomain ? `; domain=${cookieDomain}` : '';
  const securePart = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax${domainPart}${securePart}`;
}

function getOrCreateAnonymousSessionId(): string {
  if (typeof window === 'undefined') return 'server_session';
  try {
    const existingCookie = getCookie(ANON_SID_COOKIE);
    if (existingCookie) return existingCookie;

    const existingStorage = localStorage.getItem(ANON_SID_COOKIE);
    if (existingStorage) {
      setCookie(ANON_SID_COOKIE, existingStorage);
      return existingStorage;
    }

    const newId = `txc_anon_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    setCookie(ANON_SID_COOKIE, newId);
    localStorage.setItem(ANON_SID_COOKIE, newId);
    return newId;
  } catch {
    return `txc_fallback_${Date.now()}`;
  }
}

function sanitizeMetadata(meta?: Record<string, any>): Record<string, any> {
  if (!meta) return {};
  const cleaned: Record<string, any> = {};
  const forbiddenPatterns = [/email/i, /phone/i, /password/i, /token/i, /secret/i, /jwt/i];

  for (const [key, val] of Object.entries(meta)) {
    if (forbiddenPatterns.some(p => p.test(key))) continue;
    if (typeof val === 'string' && val.length > 500) {
      cleaned[key] = val.slice(0, 500);
    } else {
      cleaned[key] = val;
    }
  }
  return cleaned;
}

function resolveFunnelCategory(hostname: string, pathname: string, event: ConversionEvent): FunnelCategory {
  if (
    hostname.startsWith('employers.') || 
    hostname.startsWith('employer.') || 
    pathname.startsWith('/hire') || 
    pathname.startsWith('/recruiters') || 
    pathname.startsWith('/employer') ||
    event === 'employer_job_published'
  ) {
    return 'employer';
  }
  if (hostname.startsWith('colleges.') || pathname.startsWith('/colleges')) {
    return 'institution';
  }
  return 'job_seeker';
}

class ConversionTelemetryManager {
  private counts: Record<ConversionEvent, number> = {
    landing_view: 0,
    free_tool_started: 0,
    free_tool_completed: 0,
    signup_started: 0,
    signup_completed: 0,
    email_verified: 0,
    profile_completed: 0,
    job_saved: 0,
    application_started: 0,
    resume_created: 0,
    salary_report_saved: 0,
    career_plan_saved: 0,
    alert_created: 0,
    learning_progress_saved: 0,
    employer_job_published: 0,
    return_visit: 0,
    // Legacy
    ats_started: 0,
    ats_completed: 0,
    signup_cta_view: 0,
    signup_cta_click: 0,
    matching_jobs_clicked: 0,
    view_job_detail: 0,
    job_applied: 0,
  };

  private eventsLog: TelemetryLogEntry[] = [];
  private syncDebounceTimer: any = null;

  constructor() {
    this.loadFromStorage();
    this.recordFirstTouchAttribution();
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

  private recordFirstTouchAttribution(): void {
    if (typeof window === 'undefined') return;
    try {
      const existing = localStorage.getItem(FIRST_TOUCH_KEY) || getCookie(FIRST_TOUCH_KEY);
      if (!existing) {
        const params = new URLSearchParams(window.location.search);
        const attribution: FirstTouchAttribution = {
          landingHostname: window.location.hostname,
          landingPath: window.location.pathname,
          referrer: document.referrer || '',
          utmSource: params.get('utm_source') || undefined,
          utmMedium: params.get('utm_medium') || undefined,
          utmCampaign: params.get('utm_campaign') || undefined,
          timestamp: new Date().toISOString(),
        };
        const serialized = JSON.stringify(attribution);
        localStorage.setItem(FIRST_TOUCH_KEY, serialized);
        setCookie(FIRST_TOUCH_KEY, serialized);
      }
    } catch {}
  }

  public getFirstTouchAttribution(): FirstTouchAttribution | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(FIRST_TOUCH_KEY) || getCookie(FIRST_TOUCH_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  /**
   * Records a conversion event locally, classifies funnel type, and syncs to Supabase.
   */
  track(event: ConversionEvent, meta?: { source?: string; score?: number; [key: string]: any }): void {
    if (this.counts[event] !== undefined) {
      this.counts[event]++;
    }

    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    const search = typeof window !== 'undefined' ? window.location.search : '';
    const params = new URLSearchParams(search);

    const logEntry: TelemetryLogEntry = {
      event,
      timestamp: new Date().toISOString(),
      url: `${pathname}${search}`,
      hostname,
      funnelType: resolveFunnelCategory(hostname, pathname, event),
      anonymousSessionId: getOrCreateAnonymousSessionId(),
      referrer: typeof document !== 'undefined' ? document.referrer : '',
      utmSource: params.get('utm_source') || undefined,
      utmMedium: params.get('utm_medium') || undefined,
      utmCampaign: params.get('utm_campaign') || undefined,
      metadata: sanitizeMetadata(meta),
      synced: false,
    };

    this.eventsLog.push(logEntry);
    if (this.eventsLog.length > MAX_LOCAL_EVENTS) {
      this.eventsLog.shift();
    }

    this.saveToStorage();

    // Debounced asynchronous sync to Supabase user_behavior_events
    if (this.syncDebounceTimer) clearTimeout(this.syncDebounceTimer);
    this.syncDebounceTimer = setTimeout(() => {
      this.syncPendingToSupabase();
    }, 600);

    if (typeof window !== 'undefined' && (import.meta as any).env?.DEV) {
      console.log(`[GrowthTelemetry:${logEntry.funnelType}] ${event}`, meta || '');
    }
  }

  private async syncPendingToSupabase(): Promise<void> {
    try {
      const pending = this.eventsLog.filter(e => !e.synced);
      if (pending.length === 0) return;

      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id || null;

      const rows = pending.map(e => ({
        user_id: userId,
        anonymous_session_id: e.anonymousSessionId,
        event_type: e.event,
        event_category: e.funnelType,
        page_url: e.url,
        referrer: e.referrer || null,
        utm_source: e.utmSource || null,
        utm_medium: e.utmMedium || null,
        utm_campaign: e.utmCampaign || null,
        event_data: {
          hostname: e.hostname,
          ...e.metadata,
        },
        created_at: e.timestamp,
      }));

      const { error } = await supabase.from('user_behavior_events').insert(rows);
      if (!error) {
        pending.forEach(e => { e.synced = true; });
        this.saveToStorage();
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

  getRecentEvents(): TelemetryLogEntry[] {
    return [...this.eventsLog];
  }

  getStats(): ConversionStats {
    const c = this.counts;
    const pct = (num: number, den: number) => 
      den > 0 ? `${((num / den) * 100).toFixed(1)}%` : '0.0%';

    const toolStarts = (c.free_tool_started || 0) + (c.ats_started || 0);
    const toolCompletes = (c.free_tool_completed || 0) + (c.ats_completed || 0);

    return {
      ...c,
      toolCompletionRate: pct(toolCompletes, toolStarts),
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
