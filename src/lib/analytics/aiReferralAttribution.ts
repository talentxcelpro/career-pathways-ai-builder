/**
 * src/lib/analytics/aiReferralAttribution.ts
 *
 * Dedicated AI Search Engine & Answer Engine Referral Attribution Engine.
 * Identifies, normalizes, and tracks visitors arriving from:
 * - Tier 1: ChatGPT, OpenAI Search, Perplexity, Google Gemini, Claude, Copilot
 * - Tier 2: Grok, Meta AI, DeepSeek, Mistral, You.com, DuckAssist, Brave Search AI, Kagi, Poe
 *
 * Features:
 * - Cross-subdomain persistent attribution via .talentxcel.in cookie and localStorage
 * - Automatic conversion event tracking for TalentScore, ATS Resume Check, Job Applications, Signups
 * - 100% compliant with privacy standards (zero PII collected)
 */

export interface AiReferralDetails {
  isAiReferral: boolean;
  platform: 'chatgpt' | 'perplexity' | 'gemini' | 'claude' | 'copilot' | 'grok' | 'meta_ai' | 'deepseek' | 'mistral' | 'you_com' | 'duckassist' | 'brave_ai' | 'kagi' | 'poe' | 'other_ai' | 'none';
  medium: 'ai_search' | 'ai_assistant' | 'none';
  referrerHost: string;
  sourceToken?: string;
  queryParam?: string;
  landingPage: string;
  timestamp: number;
}

export interface AiConversionEvent {
  conversionType:
    | 'ai_talent_score_started'
    | 'ai_talent_score_completed'
    | 'ai_ats_check_started'
    | 'ai_ats_check_completed'
    | 'ai_sign_up'
    | 'ai_passport_created'
    | 'ai_job_applied'
    | 'ai_network_engaged'
    | 'ai_recruiter_inquiry';
  platform: string;
  landingPage: string;
  currentPath: string;
  metadata?: Record<string, any>;
  timestamp: number;
}

const STORAGE_KEY = 'tx_ai_attribution_data';
const COOKIE_NAME = 'tx_ai_session';

/**
 * Detects if the current session originated from an AI platform.
 */
export function detectAiReferral(urlObj?: URL, referrerStr?: string): AiReferralDetails {
  if (typeof window === 'undefined' && !urlObj) {
    return {
      isAiReferral: false,
      platform: 'none',
      medium: 'none',
      referrerHost: '',
      landingPage: '/',
      timestamp: Date.now()
    };
  }

  const url = urlObj || new URL(window.location.href);
  const rawReferrer = referrerStr !== undefined ? referrerStr : (typeof document !== 'undefined' ? document.referrer : '');
  const urlParams = url.searchParams;

  let refHost = '';
  try {
    if (rawReferrer) {
      refHost = new URL(rawReferrer).hostname.toLowerCase();
    }
  } catch {}

  const utmSource = (urlParams.get('utm_source') || '').toLowerCase();
  const utmMedium = (urlParams.get('utm_medium') || '').toLowerCase();
  const refParam = (urlParams.get('ref') || '').toLowerCase();
  const sourceParam = (urlParams.get('source') || '').toLowerCase();

  let platform: AiReferralDetails['platform'] = 'none';
  let medium: AiReferralDetails['medium'] = 'none';

  // 1. ChatGPT / OpenAI
  if (
    refHost.includes('chatgpt.com') ||
    refHost.includes('chat.openai.com') ||
    refHost.includes('oaistatic.com') ||
    utmSource === 'chatgpt' ||
    utmSource === 'openai' ||
    refParam === 'chatgpt'
  ) {
    platform = 'chatgpt';
    medium = 'ai_search';
  }
  // 2. Perplexity AI
  else if (
    refHost.includes('perplexity.ai') ||
    utmSource === 'perplexity' ||
    refParam === 'perplexity' ||
    sourceParam === 'perplexity'
  ) {
    platform = 'perplexity';
    medium = 'ai_search';
  }
  // 3. Google Gemini / AI Overviews
  else if (
    refHost.includes('gemini.google.com') ||
    refHost.includes('bard.google.com') ||
    utmSource === 'gemini' ||
    (refHost.includes('google.') && (url.searchParams.has('ai') || utmMedium.includes('ai_overview')))
  ) {
    platform = 'gemini';
    medium = 'ai_assistant';
  }
  // 4. Anthropic Claude
  else if (
    refHost.includes('claude.ai') ||
    refHost.includes('anthropic.com') ||
    utmSource === 'claude' ||
    refParam === 'claude'
  ) {
    platform = 'claude';
    medium = 'ai_assistant';
  }
  // 5. Microsoft Copilot / Bing Chat
  else if (
    refHost.includes('copilot.microsoft.com') ||
    refHost.includes('sydney.bing.com') ||
    (refHost.includes('bing.com') && rawReferrer.includes('/chat')) ||
    utmSource === 'copilot' ||
    refParam === 'copilot'
  ) {
    platform = 'copilot';
    medium = 'ai_search';
  }
  // 6. Grok / xAI
  else if (
    refHost.includes('grok.com') ||
    refHost.includes('x.ai') ||
    utmSource === 'grok' ||
    refParam === 'grok'
  ) {
    platform = 'grok';
    medium = 'ai_assistant';
  }
  // 7. Meta AI
  else if (refHost.includes('meta.ai') || utmSource === 'meta_ai') {
    platform = 'meta_ai';
    medium = 'ai_assistant';
  }
  // 8. DeepSeek
  else if (refHost.includes('deepseek.com') || utmSource === 'deepseek') {
    platform = 'deepseek';
    medium = 'ai_assistant';
  }
  // 9. Mistral Le Chat
  else if (refHost.includes('mistral.ai') || utmSource === 'mistral') {
    platform = 'mistral';
    medium = 'ai_assistant';
  }
  // 10. You.com
  else if (refHost.includes('you.com') || utmSource === 'you.com') {
    platform = 'you_com';
    medium = 'ai_search';
  }
  // 11. DuckAssist
  else if (
    refHost.includes('duck.ai') ||
    (refHost.includes('duckduckgo.com') && rawReferrer.includes('ia=chat'))
  ) {
    platform = 'duckassist';
    medium = 'ai_search';
  }
  // 12. Brave Search AI
  else if (refHost.includes('search.brave.com') || utmSource === 'brave') {
    platform = 'brave_ai';
    medium = 'ai_search';
  }
  // 13. Kagi AI
  else if (refHost.includes('kagi.com') || utmSource === 'kagi') {
    platform = 'kagi';
    medium = 'ai_search';
  }
  // 14. Poe
  else if (refHost.includes('poe.com') || utmSource === 'poe') {
    platform = 'poe';
    medium = 'ai_assistant';
  }
  // Generic AI medium check
  else if (
    utmMedium === 'ai_search' ||
    utmMedium === 'ai_referral' ||
    utmMedium === 'ai_overviews'
  ) {
    platform = 'other_ai';
    medium = 'ai_search';
  }

  const isAiReferral = platform !== 'none';

  return {
    isAiReferral,
    platform,
    medium,
    referrerHost: refHost,
    sourceToken: utmSource || refParam || undefined,
    queryParam: urlParams.get('q') || urlParams.get('query') || undefined,
    landingPage: url.pathname,
    timestamp: Date.now()
  };
}

/**
 * Persists detected AI referral attribution in localStorage and root-domain cookie.
 */
export function persistAiAttribution(details: AiReferralDetails): void {
  if (typeof window === 'undefined' || !details.isAiReferral) return;

  try {
    const payloadStr = JSON.stringify(details);
    window.localStorage.setItem(STORAGE_KEY, payloadStr);

    // Cross-subdomain cookie valid across *.talentxcel.in for 30 days
    const isProd = window.location.hostname.endsWith('talentxcel.in');
    const domainPart = isProd ? '; domain=.talentxcel.in' : '';
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(details.platform)}|${encodeURIComponent(details.landingPage)}; path=/; max-age=2592000; SameSite=Lax${domainPart}`;
  } catch (_) {}
}

/**
 * Retrieves the active AI referral attribution session if one exists.
 */
export function getActiveAiAttribution(): AiReferralDetails | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as AiReferralDetails;
    // Attribution expires after 30 days (2,592,000,000 ms)
    if (Date.now() - data.timestamp > 30 * 24 * 60 * 60 * 1000) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

/**
 * Tracks an AI referral conversion event and forwards it to Google Analytics / Growth Funnel.
 */
export function trackAiConversion(
  conversionType: AiConversionEvent['conversionType'],
  metadata?: Record<string, any>
): void {
  const activeAttribution = getActiveAiAttribution();
  if (!activeAttribution || !activeAttribution.isAiReferral) return;

  const eventPayload: AiConversionEvent = {
    conversionType,
    platform: activeAttribution.platform,
    landingPage: activeAttribution.landingPage,
    currentPath: typeof window !== 'undefined' ? window.location.pathname : '',
    metadata,
    timestamp: Date.now()
  };

  // 1. Dispatch to window.dataLayer for Google Analytics 4
  if (typeof window !== 'undefined' && (window as any).gtag) {
    try {
      (window as any).gtag('event', conversionType, {
        ai_platform: activeAttribution.platform,
        ai_medium: activeAttribution.medium,
        ai_landing_page: activeAttribution.landingPage,
        current_path: eventPayload.currentPath,
        ...metadata
      });
    } catch (_) {}
  }

  // 2. Dispatch custom DOM event for decoupled application listeners
  if (typeof window !== 'undefined' && typeof CustomEvent !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent('tx_ai_conversion', { detail: eventPayload }));
    } catch (_) {}
  }
}
