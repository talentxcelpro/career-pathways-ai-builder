/**
 * TalentXcel Government Jobs Intelligence Network — Source Registry
 * Phase 7 scaffold only. No connectors implemented.
 *
 * CRITICAL POLICY: Government portal ownership ≠ free redistribution rights.
 * Each source must be individually authorized before ingestion.
 *
 * Source Modes:
 *   A — Authorized API/Feed (explicit commercial permission from portal)
 *   B — Permission/Partnership (direct agreement with governing body)
 *   C — Discovery/Link-out (no republishing; link to official vacancy page only)
 */

export type SourceMode = 'A' | 'B' | 'C';

export type RedistributionPolicy =
  | 'FULL_REPUBLISH'       // Mode A: Full job details may be republished with attribution
  | 'ATTRIBUTED_REPUBLISH' // Mode A/B: Summary + link allowed; full text requires attribution
  | 'SUMMARY_ONLY'         // Mode B/C: Only headline + link to official page
  | 'LINK_OUT'             // Mode C: No content reproduction; show title + official link
  | 'DO_NOT_INGEST';       // Explicitly prohibited or ambiguous — do not ingest

export type ApplicationRouting =
  | 'DIRECT_APPLY_NATIVE'  // Apply via TalentXcel native flow (directApply: true eligible)
  | 'REDIRECT_OFFICIAL'    // Redirect to official government portal for application
  | 'REDIRECT_ATS'         // Redirect to ATS/third-party system
  | 'LINK_OUT_ONLY';       // Only show official link, no apply button

export interface GovernmentJobSource {
  id: string;
  name: string;
  country: string;           // ISO 3166-1 alpha-2 uppercase
  countryName: string;
  portalUrl: string;
  apiEndpoint?: string;       // If Mode A: API/feed URL
  mode: SourceMode;
  redistribution: RedistributionPolicy;
  applicationRouting: ApplicationRouting;
  requiresAttribution: boolean;
  attributionText?: string;   // Required credit line if republishing
  attributionUrl?: string;    // Link back to source if required
  requiresSourceLink: boolean;
  requiresPartnerApproval: boolean;
  partnerAgreementStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'APPROVED' | 'REJECTED';
  fresherEligible: boolean;   // Whether portal typically lists fresher/entry-level jobs
  categories: string[];       // Job categories available on this portal
  notes: string;
  active: boolean;            // Whether this source is currently being ingested
  lastReviewedAt: string;     // ISO date of last policy review
}

/**
 * Government Sources Registry
 * All sources start as INACTIVE until authorization is confirmed.
 * Mode C (LINK_OUT) sources may be activated after internal review only.
 */
export const GOVERNMENT_SOURCES: readonly GovernmentJobSource[] = [
  // ─── India ────────────────────────────────────────────────────────────────
  {
    id: 'ncs-india',
    name: 'National Career Service Portal (NCS) — India',
    country: 'IN',
    countryName: 'India',
    portalUrl: 'https://www.ncs.gov.in',
    mode: 'C',
    redistribution: 'LINK_OUT',
    applicationRouting: 'REDIRECT_OFFICIAL',
    requiresAttribution: true,
    attributionText: 'Source: National Career Service Portal, Ministry of Labour & Employment, Govt. of India',
    attributionUrl: 'https://www.ncs.gov.in',
    requiresSourceLink: true,
    requiresPartnerApproval: true,
    partnerAgreementStatus: 'NOT_STARTED',
    fresherEligible: true,
    categories: ['Government', 'Private', 'PSU', 'Defence', 'Railway'],
    notes: 'NCS is NIC-hosted. Reproduction of vacancy content requires MoLE permission. Currently mode C only.',
    active: false,
    lastReviewedAt: '2025-09-01',
  },
  {
    id: 'rojgar-sangam-up',
    name: 'UP Rojgar Sangam — Uttar Pradesh',
    country: 'IN',
    countryName: 'India',
    portalUrl: 'https://sewayojan.up.nic.in',
    mode: 'C',
    redistribution: 'LINK_OUT',
    applicationRouting: 'REDIRECT_OFFICIAL',
    requiresAttribution: true,
    attributionText: 'Source: UP Sewayojan Portal, Government of Uttar Pradesh',
    attributionUrl: 'https://sewayojan.up.nic.in',
    requiresSourceLink: true,
    requiresPartnerApproval: true,
    partnerAgreementStatus: 'NOT_STARTED',
    fresherEligible: true,
    categories: ['Government', 'Private', 'Apprenticeship'],
    notes: 'UP Rojgar Sangam vacancy data terms require permission before reproduction. Link-out only until partnership.',
    active: false,
    lastReviewedAt: '2025-09-01',
  },
  {
    id: 'upsc-india',
    name: 'UPSC — Union Public Service Commission',
    country: 'IN',
    countryName: 'India',
    portalUrl: 'https://upsc.gov.in',
    mode: 'C',
    redistribution: 'SUMMARY_ONLY',
    applicationRouting: 'REDIRECT_OFFICIAL',
    requiresAttribution: true,
    attributionText: 'Source: Union Public Service Commission (UPSC)',
    attributionUrl: 'https://upsc.gov.in',
    requiresSourceLink: true,
    requiresPartnerApproval: false,
    partnerAgreementStatus: 'NOT_STARTED',
    fresherEligible: true,
    categories: ['Civil Services', 'Defence', 'Technical', 'Engineering Services'],
    notes: 'Vacancy notifications are publicly available. Summary + link is safe. Full text reproduction requires review.',
    active: false,
    lastReviewedAt: '2025-09-01',
  },
  {
    id: 'ssc-india',
    name: 'Staff Selection Commission (SSC)',
    country: 'IN',
    countryName: 'India',
    portalUrl: 'https://ssc.nic.in',
    mode: 'C',
    redistribution: 'SUMMARY_ONLY',
    applicationRouting: 'REDIRECT_OFFICIAL',
    requiresAttribution: true,
    attributionText: 'Source: Staff Selection Commission (SSC), Government of India',
    attributionUrl: 'https://ssc.nic.in',
    requiresSourceLink: true,
    requiresPartnerApproval: false,
    partnerAgreementStatus: 'NOT_STARTED',
    fresherEligible: true,
    categories: ['Central Government', 'Defence', 'Technical', 'Clerical'],
    notes: 'SSC notifications are public. Summary with official link is permissible. Full text reproduction requires legal review.',
    active: false,
    lastReviewedAt: '2025-09-01',
  },
  {
    id: 'ibps-india',
    name: 'IBPS — Institute of Banking Personnel Selection',
    country: 'IN',
    countryName: 'India',
    portalUrl: 'https://www.ibps.in',
    mode: 'C',
    redistribution: 'SUMMARY_ONLY',
    applicationRouting: 'REDIRECT_OFFICIAL',
    requiresAttribution: true,
    attributionText: 'Source: IBPS (Institute of Banking Personnel Selection)',
    attributionUrl: 'https://www.ibps.in',
    requiresSourceLink: true,
    requiresPartnerApproval: false,
    partnerAgreementStatus: 'NOT_STARTED',
    fresherEligible: true,
    categories: ['Banking', 'Financial Services'],
    notes: 'IBPS exam notifications are public. Summary + link allowed.',
    active: false,
    lastReviewedAt: '2025-09-01',
  },
  // ─── USA ──────────────────────────────────────────────────────────────────
  {
    id: 'usajobs-usa',
    name: 'USAJOBS — US Federal Government Jobs',
    country: 'US',
    countryName: 'United States',
    portalUrl: 'https://www.usajobs.gov',
    apiEndpoint: 'https://data.usajobs.gov/api/search',
    mode: 'A',
    redistribution: 'ATTRIBUTED_REPUBLISH',
    applicationRouting: 'REDIRECT_OFFICIAL',
    requiresAttribution: true,
    attributionText: 'Source: USAJOBS — The Federal Government\'s Official Jobs Site',
    attributionUrl: 'https://www.usajobs.gov',
    requiresSourceLink: true,
    requiresPartnerApproval: false,
    partnerAgreementStatus: 'NOT_STARTED',
    fresherEligible: true,
    categories: ['Federal Government', 'Defence', 'Healthcare', 'Technology', 'Administrative'],
    notes: 'USAJOBS provides an API for commercial job boards. Terms: data may be stored/reformatted for internal application with source credit and back-links to USAJOBS. Standalone redistribution/competing job-data products require approval. Application must always redirect to USAJOBS. directApply: false always.',
    active: false,
    lastReviewedAt: '2025-09-01',
  },
  // ─── UK ───────────────────────────────────────────────────────────────────
  {
    id: 'civil-service-jobs-uk',
    name: 'Civil Service Jobs — UK',
    country: 'GB',
    countryName: 'United Kingdom',
    portalUrl: 'https://www.civilservicejobs.service.gov.uk',
    mode: 'C',
    redistribution: 'LINK_OUT',
    applicationRouting: 'REDIRECT_OFFICIAL',
    requiresAttribution: true,
    attributionText: 'Source: Civil Service Jobs, UK Government',
    attributionUrl: 'https://www.civilservicejobs.service.gov.uk',
    requiresSourceLink: true,
    requiresPartnerApproval: true,
    partnerAgreementStatus: 'NOT_STARTED',
    fresherEligible: true,
    categories: ['Civil Service', 'Government', 'Administrative', 'Technical'],
    notes: 'UK Civil Service Jobs: scraping restricted. Partnership/API access required for Mode A/B ingestion.',
    active: false,
    lastReviewedAt: '2025-09-01',
  },
  // ─── Australia ─────────────────────────────────────────────────────────────
  {
    id: 'apsjobs-australia',
    name: 'APSJobs — Australian Public Service',
    country: 'AU',
    countryName: 'Australia',
    portalUrl: 'https://www.apsjobs.gov.au',
    mode: 'C',
    redistribution: 'LINK_OUT',
    applicationRouting: 'REDIRECT_OFFICIAL',
    requiresAttribution: true,
    attributionText: 'Source: APSJobs, Australian Public Service Commission',
    attributionUrl: 'https://www.apsjobs.gov.au',
    requiresSourceLink: true,
    requiresPartnerApproval: true,
    partnerAgreementStatus: 'NOT_STARTED',
    fresherEligible: true,
    categories: ['Federal Government', 'Technical', 'Administrative'],
    notes: 'APS Jobs requires partnership for feed access.',
    active: false,
    lastReviewedAt: '2025-09-01',
  },
  // ─── UAE ───────────────────────────────────────────────────────────────────
  {
    id: 'tawteen-uae',
    name: 'Tawteen — UAE Government Jobs Portal',
    country: 'AE',
    countryName: 'United Arab Emirates',
    portalUrl: 'https://tawteen.ae',
    mode: 'C',
    redistribution: 'LINK_OUT',
    applicationRouting: 'REDIRECT_OFFICIAL',
    requiresAttribution: true,
    attributionText: 'Source: Tawteen, UAE Government',
    attributionUrl: 'https://tawteen.ae',
    requiresSourceLink: true,
    requiresPartnerApproval: true,
    partnerAgreementStatus: 'NOT_STARTED',
    fresherEligible: false,
    categories: ['Government', 'Emiratisation', 'Technical'],
    notes: 'UAE Tawteen primarily serves Emiratisation. International candidates may link out only.',
    active: false,
    lastReviewedAt: '2025-09-01',
  },
] as const;

/** Map by source ID for O(1) lookup */
export const GOVERNMENT_SOURCE_MAP: Readonly<Record<string, GovernmentJobSource>> =
  Object.fromEntries(GOVERNMENT_SOURCES.map((s) => [s.id, s]));

/** Sources approved for any form of content ingestion */
export const INGESTIBLE_SOURCES = GOVERNMENT_SOURCES.filter(
  (s) => s.redistribution !== 'DO_NOT_INGEST' && s.redistribution !== 'LINK_OUT'
);

/** Sources that are active and can be queried */
export const ACTIVE_SOURCES = GOVERNMENT_SOURCES.filter((s) => s.active);

/**
 * Determines how a job from this source should be handled.
 * Returns the redistribution policy for the source.
 */
export function getSourcePolicy(sourceId: string): RedistributionPolicy {
  return GOVERNMENT_SOURCE_MAP[sourceId]?.redistribution ?? 'DO_NOT_INGEST';
}

/**
 * Returns true if a source permits any form of content republishing.
 * (FULL_REPUBLISH or ATTRIBUTED_REPUBLISH or SUMMARY_ONLY).
 */
export function canRepublishContent(sourceId: string): boolean {
  const policy = getSourcePolicy(sourceId);
  return policy === 'FULL_REPUBLISH' || policy === 'ATTRIBUTED_REPUBLISH' || policy === 'SUMMARY_ONLY';
}

/**
 * Returns the required attribution string for a source.
 * Returns null if no attribution required.
 */
export function getAttributionText(sourceId: string): string | null {
  const source = GOVERNMENT_SOURCE_MAP[sourceId];
  if (!source?.requiresAttribution) return null;
  return source.attributionText ?? source.name;
}
