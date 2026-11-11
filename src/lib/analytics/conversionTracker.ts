/**
 * src/lib/analytics/conversionTracker.ts
 *
 * Lightweight, strictly typed GA4 Conversion & Attribution Tracking Engine.
 * Complies with Indian DPDP Act & GDPR: Zero PII in analytics payloads.
 *
 * Tracks:
 * - sign_up: Fired ONLY for newly created accounts (user.created_at < 60s)
 * - login: Fired for returning users with authentication method
 * - one_tap_shown, one_tap_dismissed
 * - cta_click
 * - claim_passport, apply_job_click, resume_generated
 *
 * Captures first-touch attribution across all 9 subdomains.
 */

import { supabase } from '@/integrations/supabase/client';

export type AuthMethod = 'google' | 'linkedin' | 'email';

export interface EventBaseParams {
  method?: AuthMethod;
  page_type?: string;
  source_subdomain?: string;
  landing_path?: string;
  [key: string]: any;
}

export function getSourceSubdomain(): string {
  if (typeof window === 'undefined') return 'root';
  const host = window.location.hostname.toLowerCase();
  if (host === 'talentxcel.in' || host === 'www.talentxcel.in' || host === 'localhost' || host === '127.0.0.1') {
    return 'root';
  }
  if (host.endsWith('.talentxcel.in')) {
    return host.replace('.talentxcel.in', '');
  }
  return host;
}

export function getPageType(): string {
  if (typeof window === 'undefined') return 'unknown';
  const path = window.location.pathname.toLowerCase();
  if (path === '/' || path === '') return 'home';
  if (path.startsWith('/jobs')) return 'jobs';
  if (path.startsWith('/passport/public')) return 'public_passport';
  if (path.startsWith('/passport')) return 'passport';
  if (path.startsWith('/profile')) return 'profile';
  if (path.startsWith('/network')) return 'network';
  if (path.startsWith('/benchmarks') || path.startsWith('/salary')) return 'salary';
  if (path.startsWith('/resume')) return 'resume';
  if (path.startsWith('/colleges')) return 'colleges';
  if (path.startsWith('/learning')) return 'learning';
  if (path.startsWith('/auth') || path.startsWith('/login') || path.startsWith('/signup')) return 'auth';
  return 'general';
}

/**
 * Dispatches a standard GA4 event via window.gtag.
 * Guarantees zero PII (strips email, phone, name, tokens).
 */
export function sendGA4Event(eventName: string, params: EventBaseParams = {}): void {
  if (typeof window === 'undefined') return;

  const enrichedParams: Record<string, any> = {
    page_type: params.page_type || getPageType(),
    source_subdomain: params.source_subdomain || getSourceSubdomain(),
    landing_path: params.landing_path || window.location.pathname,
    ...params,
  };

  // Strict PII filter
  const cleanParams: Record<string, any> = {};
  for (const [key, val] of Object.entries(enrichedParams)) {
    if (/email|phone|name|password|token|secret|jwt|bearer/i.test(key)) continue;
    if (typeof val === 'string' && /@/.test(val)) continue; // Drop strings containing '@'
    cleanParams[key] = val;
  }

  // Ensure dataLayer exists
  window.dataLayer = window.dataLayer || [];
  if (typeof (window as any).gtag === 'function') {
    (window as any).gtag('event', eventName, cleanParams);
  }

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[GA4 Event: ${eventName}]`, cleanParams);
  }
}

/**
 * Tracks confirmed user session upon auth completion.
 * Fired ONLY after Supabase session is established or registration is created.
 *
 * - New Account: Fires 'sign_up' with method (google | linkedin | email)
 * - Returning Account: Fires 'login' with method
 *
 * Uses a triple-detection strategy to identify new signups:
 * 1. Explicit registration flag from signup forms (isExplicitSignUp)
 * 2. Account created within last 90s (OAuth & instant email accounts)
 * 3. Just confirmed email (last_sign_in_at ≈ email_confirmed_at within 120s of now)
 *
 * Uses sessionStorage + localStorage deduplication as secondary guard against double-firing.
 */
export function trackAuthSession(
  user: {
    id: string;
    created_at?: string | null;
    last_sign_in_at?: string | null;
    email_confirmed_at?: string | null;
    confirmed_at?: string | null;
    [key: string]: any;
  },
  method: AuthMethod,
  isExplicitSignUp?: boolean
): void {
  if (!user || !user.id) return;

  const now = Date.now();
  const createdAtMs = user.created_at ? new Date(user.created_at).getTime() : 0;
  const lastSignInMs = user.last_sign_in_at ? new Date(user.last_sign_in_at).getTime() : 0;
  const confirmedAtMs = (user.email_confirmed_at || user.confirmed_at)
    ? new Date(user.email_confirmed_at || user.confirmed_at!).getTime()
    : 0;

  // Triple-detection strategy:
  // 1. Explicit signup call from registration form
  // 2. Account created within last 90s (OAuth & immediate email signups)
  // 3. User just confirmed email for first session (email confirmation link clicked)
  const isCreatedRecently = createdAtMs > 0 && (now - createdAtMs) < 90000;
  const isJustConfirmed = confirmedAtMs > 0 && lastSignInMs > 0 && Math.abs(lastSignInMs - confirmedAtMs) < 120000 && (now - lastSignInMs) < 120000;

  const isNewAccount = Boolean(isExplicitSignUp || isCreatedRecently || isJustConfirmed);

  const baseParams: EventBaseParams = {
    method,
    page_type: getPageType(),
    source_subdomain: getSourceSubdomain(),
    landing_path: typeof window !== 'undefined' ? window.location.pathname : '',
  };

  const signupKey = `tx_ga4_signup_fired_${user.id}`;
  const alreadySignedUp = typeof window !== 'undefined' &&
    (sessionStorage.getItem(signupKey) || localStorage.getItem(signupKey));

  if (isNewAccount && !alreadySignedUp) {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(signupKey, 'true');
        localStorage.setItem(signupKey, 'true');
      } catch (_) {}
    }
    sendGA4Event('sign_up', baseParams);
    saveFirstTouchAttributionToProfile(user.id);
  } else if (!isNewAccount) {
    const loginKey = `tx_ga4_login_fired_${user.id}`;
    if (typeof window !== 'undefined' && !sessionStorage.getItem(loginKey)) {
      try {
        sessionStorage.setItem(loginKey, 'true');
      } catch (_) {}
      sendGA4Event('login', baseParams);
    }
  }
}

/**
 * Persists first-touch attribution into Supabase user metadata and profiles.
 * Captures landing path, subdomain, referrer, and UTM parameters.
 */
export async function saveFirstTouchAttributionToProfile(userId: string): Promise<void> {
  if (typeof window === 'undefined' || !userId) return;

  try {
    const getAttributionCookie = (name: string): string | null => {
      if (typeof document === 'undefined') return null;
      const match = document.cookie.match(new RegExp('(^|;\\s*)' + name + '=([^;]*)'));
      return match ? decodeURIComponent(match[3] || match[2] || '') : null;
    };
    const stored = localStorage.getItem('txc_first_touch_attribution') || getAttributionCookie('txc_first_touch_attribution');
    let attribution: any = null;
    if (stored) {
      try {
        attribution = JSON.parse(stored);
      } catch (_) {}
    }

    if (!attribution) {
      const urlParams = new URLSearchParams(window.location.search);
      attribution = {
        landingPath: window.location.pathname,
        landingHostname: window.location.hostname,
        referrer: document.referrer || '',
        utmSource: urlParams.get('utm_source') || '',
        utmMedium: urlParams.get('utm_medium') || '',
        utmCampaign: urlParams.get('utm_campaign') || '',
        timestamp: new Date().toISOString(),
      };
    }

    // 1. Save directly into Supabase auth user_metadata (always reliable across all Supabase setups)
    await supabase.auth.updateUser({
      data: {
        first_touch_attribution: {
          landing_path: attribution.landingPath || '',
          source_subdomain: attribution.landingHostname || '',
          referrer: attribution.referrer || '',
          utm_source: attribution.utmSource || '',
          utm_medium: attribution.utmMedium || '',
          utm_campaign: attribution.utmCampaign || '',
          first_touch_at: attribution.timestamp || new Date().toISOString(),
        },
      },
    });

    // 2. Also attempt non-blocking profile column update if schema supports it
    try {
      await (supabase.from('profiles') as any)
        .update({
          utm_source: attribution.utmSource || null,
          utm_medium: attribution.utmMedium || null,
          utm_campaign: attribution.utmCampaign || null,
          referrer: attribution.referrer || null,
          landing_page: attribution.landingPath || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);
    } catch (_) {
      // Non-fatal if profiles table does not have these optional columns
    }
  } catch (err) {
    console.warn('[Analytics] First-touch attribution non-fatal notice:', err);
  }
}

// ─────────────────────────────────────────────────────────────
// Specialized Conversion Event Helpers
// ─────────────────────────────────────────────────────────────

export function trackOneTapShown(): void {
  sendGA4Event('one_tap_shown', {
    page_type: getPageType(),
    source_subdomain: getSourceSubdomain(),
    landing_path: typeof window !== 'undefined' ? window.location.pathname : '',
  });
}

export function trackOneTapDismissed(reason: string = 'dismissed'): void {
  sendGA4Event('one_tap_dismissed', {
    reason,
    page_type: getPageType(),
    source_subdomain: getSourceSubdomain(),
    landing_path: typeof window !== 'undefined' ? window.location.pathname : '',
  });
}

export function trackCtaClick(ctaName: string, ctaLocation: string): void {
  sendGA4Event('cta_click', {
    cta_name: ctaName,
    cta_location: ctaLocation,
    page_type: getPageType(),
    source_subdomain: getSourceSubdomain(),
    landing_path: typeof window !== 'undefined' ? window.location.pathname : '',
  });
}

export function trackClaimPassport(passportId?: string): void {
  sendGA4Event('claim_passport', {
    passport_id: passportId || 'self',
    page_type: getPageType(),
    source_subdomain: getSourceSubdomain(),
    landing_path: typeof window !== 'undefined' ? window.location.pathname : '',
  });
}

export function trackApplyJobClick(jobId?: string, stage: 'click' | 'completed' = 'click'): void {
  sendGA4Event('apply_job_click', {
    job_id: jobId,
    stage,
    page_type: getPageType(),
    source_subdomain: getSourceSubdomain(),
    landing_path: typeof window !== 'undefined' ? window.location.pathname : '',
  });
}

export function trackResumeGenerated(templateId?: string): void {
  sendGA4Event('resume_generated', {
    template_id: templateId || 'standard',
    page_type: getPageType(),
    source_subdomain: getSourceSubdomain(),
    landing_path: typeof window !== 'undefined' ? window.location.pathname : '',
  });
}
