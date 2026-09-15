// src/lib/seo/acquisitionAttributionEngine.ts
// Acquisition Attribution Engine: Data contract for organic search → user acquisition funnel attribution
// Enables tracing of registered TalentXcel users back to the specific query cluster and landing page
// that drove acquisition. No attribution claimed where data is absent.

import { sha256Truncated } from '@/lib/crypto/deterministicSha256';

export type AttributionFunnelStage =
  | 'IMPRESSION'
  | 'CLICK'
  | 'LANDING'
  | 'SIGNUP'
  | 'ACTIVATION'
  | 'RETENTION'
  | 'FEATURE_USE';

export interface OrganicAttributionEvent {
  event_id: string;
  session_id: string;
  stage: AttributionFunnelStage;
  timestamp: string;
  query: string | null;                     // null if impression-only with no query data
  normalized_query: string | null;          // null if query unavailable
  intent_cluster_id: string | null;         // null if cluster not yet mapped
  surface: string | null;                   // e.g. 'JOBS', 'RESUME_ATS'
  canonical_url: string;
  gsc_average_position: number | null;      // From GSC API — NOT live SERP rank
  serp_observed_position: number | null;    // From SERP crawl — NOT GSC average
  country: string;
  device: 'DESKTOP' | 'MOBILE' | 'TABLET' | 'UNKNOWN';
  user_id: string | null;                   // null until consent + signup
  signup_completed: boolean;
  activation_completed: boolean;
  feature_id: string | null;                // e.g. 'resume_builder', 'job_apply'
  attribution_confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNAVAILABLE';
  attribution_note: string;
}

export const ATTRIBUTION_POLICY = {
  noAttributionWithoutTraceableEvent: true,
  gscAveragePositionIsNotLiveSerpRank: true,
  userIdOnlyAfterConsent: true,
  nullForUnverifiedMetrics: true,
  noGuaranteedRankingClaims: true,
  lookbackWindowDays: 30,
} as const;

export function generateAttributionEventId(
  sessionId: string,
  stage: AttributionFunnelStage,
  timestamp: string
): string {
  const hash = sha256Truncated(`${sessionId}|${stage}|${timestamp}`, 8);
  return `attr_${hash}`;
}

export function computeAttributionConfidence(
  event: Partial<OrganicAttributionEvent>
): OrganicAttributionEvent['attribution_confidence'] {
  if (event.query && event.intent_cluster_id && event.signup_completed) return 'HIGH';
  if (event.query && event.canonical_url) return 'MEDIUM';
  if (event.canonical_url) return 'LOW';
  return 'UNAVAILABLE';
}

export const SAMPLE_FUNNEL_RECORDS: OrganicAttributionEvent[] = [
  {
    event_id: generateAttributionEventId('sess_a1b2c3', 'IMPRESSION', '2026-08-25T08:12:00Z'),
    session_id: 'sess_a1b2c3',
    stage: 'IMPRESSION',
    timestamp: '2026-08-25T08:12:00Z',
    query: null,
    normalized_query: null,
    intent_cluster_id: null,
    surface: 'JOBS',
    canonical_url: 'https://talentxcel.in/jobs/content-writer-chatr-charchat-talentxcel-services-noida-uttar-pradesh-india-1',
    gsc_average_position: 6.4,
    serp_observed_position: null,
    country: 'IN',
    device: 'MOBILE',
    user_id: null,
    signup_completed: false,
    activation_completed: false,
    feature_id: null,
    attribution_confidence: computeAttributionConfidence({ canonical_url: 'https://talentxcel.in/jobs/content-writer-chatr-charchat-talentxcel-services-noida-uttar-pradesh-india-1' }),
    attribution_note: 'GSC impression record; query data not available at impression stage',
  },
  {
    event_id: generateAttributionEventId('sess_d4e5f6', 'IMPRESSION', '2026-08-25T09:30:00Z'),
    session_id: 'sess_d4e5f6',
    stage: 'IMPRESSION',
    timestamp: '2026-08-25T09:30:00Z',
    query: null,
    normalized_query: null,
    intent_cluster_id: null,
    surface: 'RESUME_ATS',
    canonical_url: 'https://talentxcel.in/resume',
    gsc_average_position: 11.2,
    serp_observed_position: null,
    country: 'IN',
    device: 'DESKTOP',
    user_id: null,
    signup_completed: false,
    activation_completed: false,
    feature_id: null,
    attribution_confidence: 'LOW',
    attribution_note: 'GSC impression; position approaching page 1',
  },
  {
    event_id: generateAttributionEventId('sess_g7h8i9', 'CLICK', '2026-08-25T10:05:00Z'),
    session_id: 'sess_g7h8i9',
    stage: 'CLICK',
    timestamp: '2026-08-25T10:05:00Z',
    query: 'content writer jobs noida',
    normalized_query: 'content writer noida',
    intent_cluster_id: 'cls_content_writer_noida',
    surface: 'JOBS',
    canonical_url: 'https://talentxcel.in/jobs/content-writer-chatr-charchat-talentxcel-services-noida-uttar-pradesh-india-1',
    gsc_average_position: 6.4,
    serp_observed_position: null,
    country: 'IN',
    device: 'MOBILE',
    user_id: null,
    signup_completed: false,
    activation_completed: false,
    feature_id: null,
    attribution_confidence: computeAttributionConfidence({ query: 'content writer jobs noida', canonical_url: 'https://talentxcel.in/jobs', signup_completed: false }),
    attribution_note: 'Click from organic SERP; query captured via GSC analytics; user_id pending consent',
  },
  {
    event_id: generateAttributionEventId('sess_j1k2l3', 'CLICK', '2026-08-25T11:15:00Z'),
    session_id: 'sess_j1k2l3',
    stage: 'CLICK',
    timestamp: '2026-08-25T11:15:00Z',
    query: 'ai recruitment platform india',
    normalized_query: 'ai recruitment platform india',
    intent_cluster_id: 'cls_ai_recruitment_b2b',
    surface: 'MO1_BUSINESS_OS',
    canonical_url: 'https://talentxcel.in/mo1',
    gsc_average_position: 8.8,
    serp_observed_position: null,
    country: 'IN',
    device: 'DESKTOP',
    user_id: null,
    signup_completed: false,
    activation_completed: false,
    feature_id: null,
    attribution_confidence: 'MEDIUM',
    attribution_note: 'B2B intent click; position 8.8 approaching page 1',
  },
  {
    event_id: generateAttributionEventId('sess_m4n5o6', 'LANDING', '2026-08-25T12:00:00Z'),
    session_id: 'sess_m4n5o6',
    stage: 'LANDING',
    timestamp: '2026-08-25T12:00:00Z',
    query: 'free ats resume scanner india',
    normalized_query: 'ats resume scanner india',
    intent_cluster_id: 'cls_ats_resume_scanner',
    surface: 'RESUME_ATS',
    canonical_url: 'https://talentxcel.in/resume',
    gsc_average_position: null,
    serp_observed_position: null,
    country: 'IN',
    device: 'DESKTOP',
    user_id: null,
    signup_completed: false,
    activation_completed: false,
    feature_id: null,
    attribution_confidence: 'MEDIUM',
    attribution_note: 'Landing from organic click; session active on resume page',
  },
  {
    event_id: generateAttributionEventId('sess_m4n5o6', 'SIGNUP', '2026-08-25T12:04:22Z'),
    session_id: 'sess_m4n5o6',
    stage: 'SIGNUP',
    timestamp: '2026-08-25T12:04:22Z',
    query: 'free ats resume scanner india',
    normalized_query: 'ats resume scanner india',
    intent_cluster_id: 'cls_ats_resume_scanner',
    surface: 'RESUME_ATS',
    canonical_url: 'https://talentxcel.in/resume',
    gsc_average_position: null,
    serp_observed_position: null,
    country: 'IN',
    device: 'DESKTOP',
    user_id: 'usr_consented_abc123',
    signup_completed: true,
    activation_completed: false,
    feature_id: null,
    attribution_confidence: computeAttributionConfidence({ query: 'free ats resume scanner india', intent_cluster_id: 'cls_ats_resume_scanner', signup_completed: true }),
    attribution_note: 'Organic SERP → resume page → signup within 4 min; HIGH confidence attribution; user consented to tracking',
  },
  {
    event_id: generateAttributionEventId('sess_m4n5o6', 'ACTIVATION', '2026-08-25T12:07:10Z'),
    session_id: 'sess_m4n5o6',
    stage: 'ACTIVATION',
    timestamp: '2026-08-25T12:07:10Z',
    query: 'free ats resume scanner india',
    normalized_query: 'ats resume scanner india',
    intent_cluster_id: 'cls_ats_resume_scanner',
    surface: 'RESUME_ATS',
    canonical_url: 'https://talentxcel.in/resume',
    gsc_average_position: null,
    serp_observed_position: null,
    country: 'IN',
    device: 'DESKTOP',
    user_id: 'usr_consented_abc123',
    signup_completed: true,
    activation_completed: true,
    feature_id: 'ats_resume_scan',
    attribution_confidence: 'HIGH',
    attribution_note: 'User completed first ATS resume scan within 3 min of signup; full funnel from organic query confirmed',
  },
  {
    event_id: generateAttributionEventId('sess_p7q8r9', 'RETENTION', '2026-09-01T09:22:00Z'),
    session_id: 'sess_p7q8r9',
    stage: 'RETENTION',
    timestamp: '2026-09-01T09:22:00Z',
    query: null,
    normalized_query: null,
    intent_cluster_id: 'cls_ats_resume_scanner',
    surface: 'RESUME_ATS',
    canonical_url: 'https://talentxcel.in/resume',
    gsc_average_position: null,
    serp_observed_position: null,
    country: 'IN',
    device: 'MOBILE',
    user_id: 'usr_consented_abc123',
    signup_completed: true,
    activation_completed: true,
    feature_id: 'ats_resume_scan',
    attribution_confidence: 'HIGH',
    attribution_note: 'Return visit 7 days post-signup; retention milestone confirmed; original attribution cluster maintained',
  },
];
