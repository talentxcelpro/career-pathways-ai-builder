/**
 * src/lib/analytics/growthFunnelTracker.ts
 * 
 * Comprehensive Growth & Conversion Funnel Event Instrumentation
 * Tracks end-to-end seeker journey:
 * SEO Impression -> Landing -> Job View -> Apply Intent -> Guest Modal -> 
 * Account Provisioning -> Resume Upload -> Application Submission -> 
 * ATS Diagnostic -> Career Pathway -> Retention Loops
 */

export type GrowthFunnelEventType =
  | 'seo_landing_view'
  | 'job_view'
  | 'apply_cta_clicked'
  | 'guest_apply_opened'
  | 'google_onetap_shown'
  | 'google_onetap_accepted'
  | 'google_onetap_dismissed'
  | 'auth_started'
  | 'auth_completed'
  | 'guest_profile_created'
  | 'resume_upload_started'
  | 'resume_uploaded'
  | 'application_started'
  | 'application_submitted'
  | 'application_failed'
  | 'ats_score_generated'
  | 'career_pathway_viewed'
  | 'related_job_clicked';

export interface GrowthFunnelPayload {
  source?: string;
  medium?: string;
  campaign?: string;
  landing_page?: string;
  query?: string;
  job_id?: string;
  job_title?: string;
  job_category?: string;
  location?: string;
  device?: 'mobile' | 'desktop' | 'tablet';
  candidate_id?: string;
  error_message?: string;
  ats_score?: number;
  [key: string]: any;
}

// Extract attribution context from URL and browser
export function getAcquisitionContext(): Partial<GrowthFunnelPayload> {
  if (typeof window === 'undefined') return {};

  const urlParams = new URLSearchParams(window.location.search);
  const referrer = document.referrer ? new URL(document.referrer, window.location.href) : null;

  let source = urlParams.get('utm_source') || '';
  let medium = urlParams.get('utm_medium') || '';
  let campaign = urlParams.get('utm_campaign') || '';

  if (!source && referrer) {
    const refHost = referrer.hostname.toLowerCase();
    if (refHost.includes('google')) {
      source = 'google';
      medium = 'organic';
    } else if (refHost.includes('bing') || refHost.includes('yahoo') || refHost.includes('duckduckgo')) {
      source = 'search';
      medium = 'organic';
    } else if (refHost.includes('linkedin') || refHost.includes('twitter') || refHost.includes('facebook') || refHost.includes('t.co')) {
      source = refHost;
      medium = 'social';
    } else {
      source = refHost;
      medium = 'referral';
    }
  }

  if (!source) {
    source = 'direct';
    medium = 'none';
  }

  const userAgent = navigator.userAgent;
  let device: 'mobile' | 'desktop' | 'tablet' = 'desktop';
  if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
    device = 'tablet';
  } else if (/mobile|iphone|ipod|android|blackberry|mini|windows\sce|palm/i.test(userAgent)) {
    device = 'mobile';
  }

  return {
    source,
    medium,
    campaign: campaign || undefined,
    landing_page: window.location.pathname,
    query: urlParams.get('q') || urlParams.get('query') || undefined,
    device,
  };
}

export class GrowthFunnelTracker {
  private static getStoredSessionId(): string {
    if (typeof window === 'undefined') return 'server_session';
    let sid = sessionStorage.getItem('tx_growth_sid');
    if (!sid) {
      sid = 'sid_' + Math.random().toString(36).slice(2, 10) + '_' + Date.now();
      sessionStorage.setItem('tx_growth_sid', sid);
    }
    return sid;
  }

  public static track(eventName: GrowthFunnelEventType, payload: GrowthFunnelPayload = {}): void {
    const baseContext = getAcquisitionContext();
    const eventPayload = {
      event: eventName,
      session_id: this.getStoredSessionId(),
      timestamp: new Date().toISOString(),
      ...baseContext,
      ...payload,
    };

    // 1. Google Analytics 4 integration
    if (typeof window !== 'undefined' && (window as any).gtag) {
      try {
        (window as any).gtag('event', eventName, eventPayload);
      } catch (_) {}
    }

    // 2. Console debug in non-production
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[GrowthFunnel: ${eventName}]`, eventPayload);
    }

    // 3. Dispatch custom window event for decoupled listeners
    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(
          new CustomEvent('tx:growth_funnel_event', { detail: eventPayload })
        );
      } catch (_) {}
    }
  }
}
