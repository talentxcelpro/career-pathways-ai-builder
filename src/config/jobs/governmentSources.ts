/**
 * TalentXcel Government Jobs Intelligence Network — Source Registry
 * Implements strict source-level governance and redistribution rights.
 *
 * CRITICAL POLICY: Government website ownership != free redistribution rights.
 * Every source must be individually governed by authorization and redistribution policies.
 */

export type GovernmentLevel =
  | 'FEDERAL'
  | 'STATE'
  | 'REGIONAL'
  | 'MUNICIPAL'
  | 'PUBLIC_SECTOR';

export type AccessMethod =
  | 'API'
  | 'FEED'
  | 'RSS'
  | 'BULK_DATA'
  | 'PARTNER'
  | 'PUBLIC_PAGE';

export type AuthorizationStatus =
  | 'AUTHORIZED'
  | 'PUBLIC'
  | 'PENDING'
  | 'PARTNER_REQUIRED'
  | 'RESTRICTED';

export type RedistributionStatus =
  | 'FULL_REPUBLISH'       // Full job text + Schema.org allowed with attribution
  | 'ATTRIBUTED_REPUBLISH' // Summary + official citation allowed; apply links to official portal
  | 'SUMMARY_ONLY'         // Headline + metadata only; full text requires clicking official notice
  | 'LINK_OUT'             // Vacancy title + link to official portal only; zero reproduction
  | 'API_ONLY'             // Data accessible via private API partner integration
  | 'PARTNER_ONLY'         // Requires bilateral agreement with agency
  | 'DO_NOT_INGEST';       // Explicitly restricted by terms; do not crawl or ingest

export type RefreshFrequency =
  | 'HOURLY'
  | 'EVERY_6_HOURS'
  | 'DAILY'
  | 'WEEKLY';

export type ApplicationRouting =
  | 'DIRECT_APPLY_NATIVE'  // Native TalentXcel apply flow (directApply: true eligible)
  | 'REDIRECT_OFFICIAL'    // Redirect candidate to official government portal (directApply: false/omitted)
  | 'REDIRECT_ATS'         // Redirect to agency ATS
  | 'LINK_OUT_ONLY';       // Display link only

export interface GovernmentJobSource {
  source_id: string;
  country_code: string;        // ISO 3166-1 alpha-2 UPPERCASE, e.g. "IN", "US"
  country_name: string;
  government_level: GovernmentLevel;
  organization: string;        // Agency / Ministry / Commission name
  portal_name: string;         // Name of the portal / bulletin
  website: string;
  careers_url?: string;
  api_endpoint?: string;
  feed_endpoint?: string;
  access_method: AccessMethod;
  authorization_status: AuthorizationStatus;
  redistribution_status: RedistributionStatus;
  attribution_required: boolean;
  attribution_text?: string;
  attribution_url?: string;
  application_redirect_required: boolean;
  application_routing: ApplicationRouting;
  fresher_eligible: boolean;   // Typically features entry-level / graduate vacancies
  categories: string[];
  terms_url?: string;
  refresh_frequency: RefreshFrequency;
  active: boolean;
  last_reviewed_at: string;    // ISO date
  notes: string;
  connector_version?: string;
  schema_version?: string;
  policy_version?: string;
  terms_last_reviewed_at?: string;
  last_certified_at?: string;
}

export const GOVERNMENT_SOURCES: readonly GovernmentJobSource[] = [
  // ─── India ────────────────────────────────────────────────────────────────
  {
    source_id: 'in-employment-news',
    country_code: 'IN',
    country_name: 'India',
    government_level: 'FEDERAL',
    organization: 'Ministry of Information and Broadcasting, Govt. of India',
    portal_name: 'Employment News / Rozgar Samachar',
    website: 'https://employmentnews.gov.in',
    careers_url: 'https://employmentnews.gov.in',
    access_method: 'FEED',
    authorization_status: 'PUBLIC',
    redistribution_status: 'ATTRIBUTED_REPUBLISH',
    attribution_required: true,
    attribution_text: 'Source: Employment News, Ministry of Information & Broadcasting, Govt. of India',
    attribution_url: 'https://employmentnews.gov.in',
    application_redirect_required: true,
    application_routing: 'REDIRECT_OFFICIAL',
    fresher_eligible: true,
    categories: ['Central Government', 'PSU', 'Defence', 'Railways', 'Banking', 'Universities'],
    terms_url: 'https://employmentnews.gov.in/NewEmp/Home.aspx',
    refresh_frequency: 'DAILY',
    active: true,
    last_reviewed_at: '2025-09-01',
    notes: 'Official weekly bulletin of Government of India. Ingests notification number, post, vacancies, and closing date.',
  },
  {
    source_id: 'in-ncs',
    country_code: 'IN',
    country_name: 'India',
    government_level: 'FEDERAL',
    organization: 'Ministry of Labour and Employment, Govt. of India',
    portal_name: 'National Career Service (NCS)',
    website: 'https://www.ncs.gov.in',
    careers_url: 'https://www.ncs.gov.in',
    access_method: 'PUBLIC_PAGE',
    authorization_status: 'PUBLIC',
    redistribution_status: 'SUMMARY_ONLY',
    attribution_required: true,
    attribution_text: 'Source: National Career Service, Ministry of Labour & Employment, Govt. of India',
    attribution_url: 'https://www.ncs.gov.in',
    application_redirect_required: true,
    application_routing: 'REDIRECT_OFFICIAL',
    fresher_eligible: true,
    categories: ['Government', 'Public Sector', 'Apprenticeships', 'Private'],
    terms_url: 'https://www.ncs.gov.in/Pages/TermsAndConditions.aspx',
    refresh_frequency: 'DAILY',
    active: true,
    last_reviewed_at: '2025-09-01',
    notes: 'NIC hosted. Vacancy summaries with official link out to NCS portal.',
  },
  {
    source_id: 'in-upsc',
    country_code: 'IN',
    country_name: 'India',
    government_level: 'FEDERAL',
    organization: 'Union Public Service Commission (UPSC)',
    portal_name: 'UPSC Recruitment Portal',
    website: 'https://upsc.gov.in',
    careers_url: 'https://upsconline.nic.in',
    access_method: 'FEED',
    authorization_status: 'PUBLIC',
    redistribution_status: 'SUMMARY_ONLY',
    attribution_required: true,
    attribution_text: 'Source: Union Public Service Commission (UPSC)',
    attribution_url: 'https://upsc.gov.in',
    application_redirect_required: true,
    application_routing: 'REDIRECT_OFFICIAL',
    fresher_eligible: true,
    categories: ['Civil Services', 'Engineering Services', 'Combined Medical Services', 'Defence'],
    terms_url: 'https://upsc.gov.in/disclaimer',
    refresh_frequency: 'DAILY',
    active: true,
    last_reviewed_at: '2025-09-01',
    notes: 'Official examinations and recruitment by selection notifications. Candidates apply via upsconline.nic.in.',
  },
  {
    source_id: 'in-ssc',
    country_code: 'IN',
    country_name: 'India',
    government_level: 'FEDERAL',
    organization: 'Staff Selection Commission (SSC)',
    portal_name: 'SSC Official Portal',
    website: 'https://ssc.gov.in',
    careers_url: 'https://ssc.gov.in',
    access_method: 'PUBLIC_PAGE',
    authorization_status: 'PUBLIC',
    redistribution_status: 'SUMMARY_ONLY',
    attribution_required: true,
    attribution_text: 'Source: Staff Selection Commission, Govt. of India',
    attribution_url: 'https://ssc.gov.in',
    application_redirect_required: true,
    application_routing: 'REDIRECT_OFFICIAL',
    fresher_eligible: true,
    categories: ['CGL (Graduate Level)', 'CHSL (10+2)', 'MTS', 'Junior Engineer', 'CPO'],
    terms_url: 'https://ssc.gov.in',
    refresh_frequency: 'DAILY',
    active: true,
    last_reviewed_at: '2025-09-01',
    notes: 'National staff selection examinations for Group B and C posts.',
  },
  {
    source_id: 'in-up-sewayojan',
    country_code: 'IN',
    country_name: 'India',
    government_level: 'STATE',
    organization: 'Department of Training and Employment, Government of Uttar Pradesh',
    portal_name: 'UP Rojgar Sangam (Sewayojan)',
    website: 'https://sewayojan.up.nic.in',
    careers_url: 'https://sewayojan.up.nic.in',
    access_method: 'PUBLIC_PAGE',
    authorization_status: 'PUBLIC',
    redistribution_status: 'LINK_OUT',
    attribution_required: true,
    attribution_text: 'Source: UP Rojgar Sangam, Govt. of Uttar Pradesh',
    attribution_url: 'https://sewayojan.up.nic.in',
    application_redirect_required: true,
    application_routing: 'REDIRECT_OFFICIAL',
    fresher_eligible: true,
    categories: ['State Government', 'Contractual', 'Outsourced', 'Private Job Fairs'],
    terms_url: 'https://sewayojan.up.nic.in',
    refresh_frequency: 'DAILY',
    active: true,
    last_reviewed_at: '2025-09-01',
    notes: 'State-level employment exchange. Link-out only until partnership agreement.',
  },

  // ─── USA ──────────────────────────────────────────────────────────────────
  {
    source_id: 'us-usajobs',
    country_code: 'US',
    country_name: 'United States',
    government_level: 'FEDERAL',
    organization: 'U.S. Office of Personnel Management (OPM)',
    portal_name: 'USAJOBS — The Federal Government’s Official Jobs Site',
    website: 'https://www.usajobs.gov',
    careers_url: 'https://www.usajobs.gov',
    api_endpoint: 'https://data.usajobs.gov/api/search',
    access_method: 'API',
    authorization_status: 'AUTHORIZED',
    redistribution_status: 'ATTRIBUTED_REPUBLISH',
    attribution_required: true,
    attribution_text: 'Source: USAJOBS — The Federal Government’s Official Jobs Site (U.S. OPM)',
    attributionUrl: 'https://www.usajobs.gov',
    application_redirect_required: true,
    application_routing: 'REDIRECT_OFFICIAL',
    fresher_eligible: true,
    categories: ['Federal Government', 'Defence', 'Technology', 'Healthcare', 'Administrative', 'Scientific'],
    terms_url: 'https://developer.usajobs.gov/API-Documentation/Terms-of-Service',
    refresh_frequency: 'EVERY_6_HOURS',
    active: true,
    last_reviewed_at: '2025-09-01',
    notes: 'Commercial job-board API consumer terms: permits search API ingestion, normalized storage, and display with USAJOBS attribution; application must direct to USAJOBS. directApply: false always.',
  },

  // ─── UK ───────────────────────────────────────────────────────────────────
  {
    source_id: 'gb-civil-service',
    country_code: 'GB',
    country_name: 'United Kingdom',
    government_level: 'FEDERAL',
    organization: 'Cabinet Office, HM Government',
    portal_name: 'Civil Service Jobs',
    website: 'https://www.civilservicejobs.service.gov.uk',
    careers_url: 'https://www.civilservicejobs.service.gov.uk',
    access_method: 'PUBLIC_PAGE',
    authorization_status: 'PUBLIC',
    redistribution_status: 'LINK_OUT',
    attribution_required: true,
    attribution_text: 'Source: Civil Service Jobs, UK Government',
    attribution_url: 'https://www.civilservicejobs.service.gov.uk',
    application_redirect_required: true,
    application_routing: 'REDIRECT_OFFICIAL',
    fresher_eligible: true,
    categories: ['Civil Service', 'Policy', 'Operational Delivery', 'Digital, Data and Technology (DDaT)'],
    terms_url: 'https://www.civilservicejobs.service.gov.uk/csr/index.cgi?pageaction=terms',
    refresh_frequency: 'DAILY',
    active: true,
    last_reviewed_at: '2025-09-01',
    notes: 'Link-out discovery only. Full text requires applicant redirect to Civil Service portal.',
  },

  // ─── Australia ────────────────────────────────────────────────────────────
  {
    source_id: 'au-apsjobs',
    country_code: 'AU',
    country_name: 'Australia',
    government_level: 'FEDERAL',
    organization: 'Australian Public Service Commission (APSC)',
    portal_name: 'APSjobs',
    website: 'https://www.apsjobs.gov.au',
    careers_url: 'https://www.apsjobs.gov.au',
    access_method: 'PUBLIC_PAGE',
    authorization_status: 'PUBLIC',
    redistribution_status: 'LINK_OUT',
    attribution_required: true,
    attribution_text: 'Source: APSjobs, Australian Public Service Commission',
    attribution_url: 'https://www.apsjobs.gov.au',
    application_redirect_required: true,
    application_routing: 'REDIRECT_OFFICIAL',
    fresher_eligible: true,
    categories: ['APS General', 'Executive Level', 'APS Graduate Program', 'Technical & Trades'],
    terms_url: 'https://www.apsjobs.gov.au/s/terms-and-conditions',
    refresh_frequency: 'DAILY',
    active: true,
    last_reviewed_at: '2025-09-01',
    notes: 'Commonwealth of Australia vacancies. Link-out to official portal.',
  },

  // ─── UAE ──────────────────────────────────────────────────────────────────
  {
    source_id: 'ae-tawteen',
    country_code: 'AE',
    country_name: 'United Arab Emirates',
    government_level: 'FEDERAL',
    organization: 'Ministry of Human Resources and Emiratisation (MOHRE)',
    portal_name: 'Tawteen National Employment Platform',
    website: 'https://tawteen.ae',
    careers_url: 'https://tawteen.ae',
    access_method: 'PUBLIC_PAGE',
    authorization_status: 'PUBLIC',
    redistribution_status: 'LINK_OUT',
    attribution_required: true,
    attribution_text: 'Source: Tawteen Gate, Ministry of Human Resources and Emiratisation, UAE',
    attribution_url: 'https://tawteen.ae',
    application_redirect_required: true,
    application_routing: 'REDIRECT_OFFICIAL',
    fresher_eligible: true,
    categories: ['Emiratisation', 'Government Entities', 'Semi-Government', 'Banking & Finance'],
    terms_url: 'https://tawteen.ae',
    refresh_frequency: 'WEEKLY',
    active: true,
    last_reviewed_at: '2025-09-01',
    notes: 'Link-out discovery only. UAE national recruitment portal.',
  },
] as const;

export const GOVERNMENT_SOURCE_MAP: Readonly<Record<string, GovernmentJobSource>> =
  Object.fromEntries(GOVERNMENT_SOURCES.map((s) => [s.source_id, s]));

export function getGovernmentSource(sourceId: string): GovernmentJobSource | undefined {
  return GOVERNMENT_SOURCE_MAP[sourceId];
}

export function getSourcesByCountry(countryCode: string): GovernmentJobSource[] {
  const code = countryCode.toUpperCase();
  return GOVERNMENT_SOURCES.filter((s) => s.country_code === code && s.active);
}

export function isDirectApplyEligible(sourceId: string): boolean {
  const source = GOVERNMENT_SOURCE_MAP[sourceId];
  return source?.application_routing === 'DIRECT_APPLY_NATIVE';
}

export function getRequiredAttribution(sourceId: string): { required: boolean; text?: string; url?: string } {
  const source = GOVERNMENT_SOURCE_MAP[sourceId];
  if (!source || !source.attribution_required) {
    return { required: false };
  }
  return {
    required: true,
    text: source.attribution_text || `Source: ${source.portal_name}`,
    url: source.attribution_url || source.website,
  };
}
