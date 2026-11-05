/**
 * src/lib/analytics/growthFunnelTracker.ts
 * 
 * Standardized Growth & Acquisition Funnel Instrumentation (15-Event Taxonomy)
 * End-to-end seeker & recruiter journey across all 10 subdomains:
 * - Cross-subdomain persistent attribution via root domain cookie (.talentxcel.in)
 * - Strict PII sanitization for Google Analytics 4 (zero emails, phones, or names)
 * - Deduplication for one-time milestone events (sign_up, login, email_verified)
 */

export type GrowthFunnelEventType =
  // Canonical 15-Event Acquisition & Growth Taxonomy
  | 'landing_view'
  | 'tool_started'
  | 'tool_completed'
  | 'signup_modal_triggered'
  | 'sign_up'
  | 'login'
  | 'email_verified'
  | 'passport_activated'
  | 'passport_shared'
  | 'job_apply_clicked'
  | 'recruiter_inquiry'
  | 'invite_accepted'
  | 'profile_completed'
  | 'resume_uploaded'
  | 'job_match_viewed'
  // Supplemental Domain & Seeker Events
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
  tool_name?: string;
  job_id?: string;
  job_title?: string;
  job_category?: string;
  location?: string;
  country?: string;
  locale?: string;
  device?: 'mobile' | 'desktop' | 'tablet';
  candidate_id?: string;
  user_id?: string;
  role?: string;
  hiring_domain?: string;
  error_message?: string;
  ats_score?: number;
  match_count?: number;
  share_channel?: 'linkedin' | 'twitter' | 'whatsapp' | 'email' | 'clipboard' | 'qr';
  [key: string]: any;
}

// Extract attribution context from URL, cross-subdomain cookie, and browser
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
    } else if (!refHost.endsWith('.talentxcel.in') && refHost !== 'talentxcel.in') {
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

  // Privacy-preserving locale and country detection for international growth segmentation
  const locale = typeof navigator !== 'undefined' ? navigator.language : 'en';
  let inferredCountry = 'Global';
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (tz.includes('Calcutta') || tz.includes('Kolkata') || tz.includes('Asia/Kolkata')) inferredCountry = 'India';
    else if (tz.includes('Dubai') || tz.includes('Muscat') || tz.includes('Riyadh')) inferredCountry = 'UAE_GCC';
    else if (tz.includes('London') || tz.includes('Berlin') || tz.includes('Paris') || tz.includes('Dublin')) inferredCountry = 'UK_Europe';
    else if (tz.includes('New_York') || tz.includes('Los_Angeles') || tz.includes('Chicago') || tz.includes('Toronto')) inferredCountry = 'North_America';
    else if (tz.includes('Singapore') || tz.includes('Bangkok') || tz.includes('Jakarta')) inferredCountry = 'Southeast_Asia';
    else if (tz) inferredCountry = tz.split('/')[0] || 'Global';
  } catch (_) {}

  return {
    source,
    medium,
    campaign: campaign || undefined,
    landing_page: window.location.pathname,
    query: urlParams.get('q') || urlParams.get('query') || undefined,
    device,
    country: inferredCountry,
    locale,
  };
}

// PII Sanitizer: strips personal emails, phones, raw names before sending to external analytics
function sanitizeForAnalytics(payload: Record<string, any>): Record<string, any> {
  const sanitized = { ...payload };
  const piiFields = ['email', 'phone', 'fullName', 'full_name', 'name', 'password', 'token', 'access_token'];
  for (const field of piiFields) {
    if (field in sanitized) {
      delete sanitized[field];
    }
  }
  return sanitized;
}

export class GrowthFunnelTracker {
  /**
   * Cross-subdomain session identifier resolver.
   * Priority:
   * 1. URL parameter '_tx_sid' (passed during cross-subdomain transitions)
   * 2. Shared root domain cookie 'tx_growth_sid' (.talentxcel.in)
   * 3. Local / Session Storage
   * 4. Generated new random session identifier
   */
  public static getStoredSessionId(): string {
    if (typeof window === 'undefined') return 'server_session';

    try {
      // 1. Check URL param
      const urlParams = new URLSearchParams(window.location.search);
      const urlSid = urlParams.get('_tx_sid');
      if (urlSid && /^[a-zA-Z0-9_-]{8,40}$/.test(urlSid)) {
        this.persistSessionId(urlSid);
        // Clean URL to prevent token pollution, leaks, or stale query params
        try {
          urlParams.delete('_tx_sid');
          const cleanQuery = urlParams.toString();
          const cleanUrl = window.location.pathname + (cleanQuery ? `?${cleanQuery}` : '') + window.location.hash;
          window.history.replaceState(null, '', cleanUrl);
        } catch (_) {}
        return urlSid;
      }

      // 2. Check root domain cookie
      const match = document.cookie.match(/(?:^|;\s*)tx_growth_sid=([^;]+)/);
      if (match && match[1]) {
        return match[1];
      }

      // 3. Check sessionStorage / localStorage
      let sid = sessionStorage.getItem('tx_growth_sid') || localStorage.getItem('tx_growth_sid');
      if (!sid) {
        sid = 'sid_' + Math.random().toString(36).slice(2, 10) + '_' + Date.now();
      }
      this.persistSessionId(sid);
      return sid;
    } catch (_) {
      return 'fallback_session_' + Date.now();
    }
  }

  private static persistSessionId(sid: string): void {
    try {
      sessionStorage.setItem('tx_growth_sid', sid);
      localStorage.setItem('tx_growth_sid', sid);

      // Set cookie on root domain for cross-subdomain access (.talentxcel.in)
      const hostname = window.location.hostname;
      if (hostname.endsWith('.talentxcel.in') || hostname === 'talentxcel.in') {
        document.cookie = `tx_growth_sid=${sid}; domain=.talentxcel.in; path=/; max-age=2592000; SameSite=Lax; Secure`;
      } else {
        document.cookie = `tx_growth_sid=${sid}; path=/; max-age=2592000; SameSite=Lax`;
      }
    } catch (_) {}
  }

  /**
   * Tracks a growth funnel event across GA4, decoupled CustomEvent listeners, and internal logging.
   */
  public static track(eventName: GrowthFunnelEventType, payload: GrowthFunnelPayload = {}): void {
    const baseContext = getAcquisitionContext();
    const eventPayload = {
      event: eventName,
      session_id: this.getStoredSessionId(),
      timestamp: new Date().toISOString(),
      ...baseContext,
      ...payload,
    };

    // 1. Google Analytics 4 integration (PII sanitized)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      try {
        const cleanPayload = sanitizeForAnalytics(eventPayload);
        (window as any).gtag('event', eventName, cleanPayload);
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

  /**
   * Tracks a one-time milestone event (e.g. sign_up, email_verified) with duplicate suppression.
   */
  public static trackOnce(eventName: GrowthFunnelEventType, uniqueKey: string, payload: GrowthFunnelPayload = {}): void {
    if (typeof window === 'undefined') return;
    try {
      const storageKey = `tx_fired_${eventName}_${uniqueKey}`;
      if (sessionStorage.getItem(storageKey)) {
        return; // Already tracked in this session
      }
      sessionStorage.setItem(storageKey, 'true');
      this.track(eventName, payload);
    } catch (_) {
      this.track(eventName, payload);
    }
  }
}

export default GrowthFunnelTracker;
