/**
 * Global Government & Public Sector Country Registry
 * Maps 100+ countries to their governance structures, official languages,
 * national job portals, currency codes, and localized terminology.
 */

export interface GovernmentCountryConfig {
  code: string;               // ISO 3166-1 alpha-2 UPPERCASE
  name: string;
  flag: string;
  currency: string;           // ISO 4217 code
  languages: string[];
  fresherTerm: string;        // Localized entry-level terminology (e.g. "Freshers", "Entry Level", "Graduate")
  publicSectorTerm: string;   // Localized public sector name (e.g. "PSU / Sarkari", "Federal / Civil Service")
  topPortals: Array<{
    name: string;
    url: string;
    level: 'FEDERAL' | 'STATE' | 'PUBLIC_SECTOR';
  }>;
  active: boolean;
  priorityTier: 1 | 2 | 3;
}

export const GOVERNMENT_COUNTRIES: readonly GovernmentCountryConfig[] = [
  // ─── Tier 1: Core Priority Markets ─────────────────────────────────────────
  {
    code: 'IN',
    name: 'India',
    flag: '🇮🇳',
    currency: 'INR',
    languages: ['en', 'hi'],
    fresherTerm: 'Freshers / Graduate Trainees',
    publicSectorTerm: 'Central / State Govt & PSUs',
    topPortals: [
      { name: 'National Career Service (NCS)', url: 'https://www.ncs.gov.in', level: 'FEDERAL' },
      { name: 'Employment News', url: 'https://employmentnews.gov.in', level: 'FEDERAL' },
      { name: 'UPSC', url: 'https://upsc.gov.in', level: 'FEDERAL' },
      { name: 'SSC', url: 'https://ssc.nic.in', level: 'FEDERAL' },
      { name: 'UP Rojgar Sangam', url: 'https://sewayojan.up.nic.in', level: 'STATE' },
    ],
    active: true,
    priorityTier: 1,
  },
  {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    currency: 'USD',
    languages: ['en', 'es'],
    fresherTerm: 'Recent Graduates / Entry Level (GS-5/7)',
    publicSectorTerm: 'Federal, State & Municipal Government',
    topPortals: [
      { name: 'USAJOBS', url: 'https://www.usajobs.gov', level: 'FEDERAL' },
      { name: 'GovernmentJobs.com', url: 'https://www.governmentjobs.com', level: 'STATE' },
    ],
    active: true,
    priorityTier: 1,
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    flag: '🇬🇧',
    currency: 'GBP',
    languages: ['en'],
    fresherTerm: 'Graduate Scheme / Civil Service Fast Stream',
    publicSectorTerm: 'Civil Service & NHS Public Sector',
    topPortals: [
      { name: 'Civil Service Jobs', url: 'https://www.civilservicejobs.service.gov.uk', level: 'FEDERAL' },
      { name: 'NHS Jobs', url: 'https://www.jobs.nhs.uk', level: 'PUBLIC_SECTOR' },
    ],
    active: true,
    priorityTier: 1,
  },
  {
    code: 'CA',
    name: 'Canada',
    flag: '🇨🇦',
    currency: 'CAD',
    languages: ['en', 'fr'],
    fresherTerm: 'Post-Secondary Recruitment / New Graduates',
    publicSectorTerm: 'Government of Canada / Crown Corps',
    topPortals: [
      { name: 'GC Jobs (Public Service Commission)', url: 'https://emploisfp-psjobs.cfp-psc.gc.ca', level: 'FEDERAL' },
      { name: 'Job Bank Government', url: 'https://www.jobbank.gc.ca', level: 'FEDERAL' },
    ],
    active: true,
    priorityTier: 1,
  },
  {
    code: 'AU',
    name: 'Australia',
    flag: '🇦🇺',
    currency: 'AUD',
    languages: ['en'],
    fresherTerm: 'Australian Public Service (APS) Graduate Program',
    publicSectorTerm: 'Commonwealth & State Government',
    topPortals: [
      { name: 'APSjobs', url: 'https://www.apsjobs.gov.au', level: 'FEDERAL' },
      { name: 'I work for NSW', url: 'https://iworkfor.nsw.gov.au', level: 'STATE' },
    ],
    active: true,
    priorityTier: 1,
  },
  {
    code: 'AE',
    name: 'United Arab Emirates',
    flag: '🇦🇪',
    currency: 'AED',
    languages: ['ar', 'en'],
    fresherTerm: 'Graduate Trainees / Emiratisation',
    publicSectorTerm: 'Federal Authority for Govt Human Resources (FAHR)',
    topPortals: [
      { name: 'Tawteen (MOHRE)', url: 'https://tawteen.ae', level: 'FEDERAL' },
      { name: 'Dubai Careers', url: 'https://dubaicareers.ae', level: 'STATE' },
    ],
    active: true,
    priorityTier: 1,
  },
  {
    code: 'SG',
    name: 'Singapore',
    flag: '🇸🇬',
    currency: 'SGD',
    languages: ['en', 'zh', 'ms', 'ta'],
    fresherTerm: 'Public Service Commission (PSC) Graduates',
    publicSectorTerm: 'Singapore Public Service (Careers@Gov)',
    topPortals: [
      { name: 'Careers@Gov', url: 'https://www.careers.gov.sg', level: 'FEDERAL' },
    ],
    active: true,
    priorityTier: 1,
  },
  {
    code: 'DE',
    name: 'Germany',
    flag: '🇩🇪',
    currency: 'EUR',
    languages: ['de', 'en'],
    fresherTerm: 'Berufseinsteiger / Öffentlicher Dienst',
    publicSectorTerm: 'Öffentlicher Dienst (Bund & Länder)',
    topPortals: [
      { name: 'Interamt', url: 'https://www.interamt.de', level: 'FEDERAL' },
      { name: 'Bund.de', url: 'https://www.service.bund.de', level: 'FEDERAL' },
    ],
    active: true,
    priorityTier: 1,
  },
  {
    code: 'FR',
    name: 'France',
    flag: '🇫🇷',
    currency: 'EUR',
    languages: ['fr'],
    fresherTerm: 'Jeunes Diplômés / Concours Fonction Publique',
    publicSectorTerm: 'Fonction Publique (État, Territoriale, Hospitalière)',
    topPortals: [
      { name: 'Choisir le Service Public', url: 'https://choisirleservicepublic.gouv.fr', level: 'FEDERAL' },
    ],
    active: true,
    priorityTier: 2,
  },
  {
    code: 'JP',
    name: 'Japan',
    flag: '🇯🇵',
    currency: 'JPY',
    languages: ['ja'],
    fresherTerm: '新卒採用 (Shinsotsu)',
    publicSectorTerm: '国家公務員 / 地方公務員',
    topPortals: [
      { name: 'National Personnel Authority (NPA)', url: 'https://www.jinji.go.jp', level: 'FEDERAL' },
    ],
    active: true,
    priorityTier: 2,
  },
  {
    code: 'NZ',
    name: 'New Zealand',
    flag: '🇳🇿',
    currency: 'NZD',
    languages: ['en', 'mi'],
    fresherTerm: 'Graduate Opportunities / Public Service',
    publicSectorTerm: 'Public Service Commission',
    topPortals: [
      { name: 'Govt.nz Careers', url: 'https://www.govt.nz/browse/work/finding-a-job', level: 'FEDERAL' },
    ],
    active: true,
    priorityTier: 2,
  },
  {
    code: 'IE',
    name: 'Ireland',
    flag: '🇮🇪',
    currency: 'EUR',
    languages: ['en', 'ga'],
    fresherTerm: 'Graduate Recruitment / Public Jobs',
    publicSectorTerm: 'Civil & Public Service',
    topPortals: [
      { name: 'Publicjobs.ie', url: 'https://www.publicjobs.ie', level: 'FEDERAL' },
    ],
    active: true,
    priorityTier: 2,
  },
  {
    code: 'NL',
    name: 'Netherlands',
    flag: '🇳🇱',
    currency: 'EUR',
    languages: ['nl', 'en'],
    fresherTerm: 'Starters / Rijksoverheid Traineeship',
    publicSectorTerm: 'Rijksoverheid',
    topPortals: [
      { name: 'Werken voor Nederland', url: 'https://www.werkenvoornederland.nl', level: 'FEDERAL' },
    ],
    active: true,
    priorityTier: 2,
  },
  {
    code: 'SA',
    name: 'Saudi Arabia',
    flag: '🇸🇦',
    currency: 'SAR',
    languages: ['ar', 'en'],
    fresherTerm: 'Graduate Trainees / Saudization',
    publicSectorTerm: 'Ministry of Human Resources (Jadarat)',
    topPortals: [
      { name: 'Jadarat Portal', url: 'https://jadarat.sa', level: 'FEDERAL' },
    ],
    active: true,
    priorityTier: 2,
  },
  {
    code: 'ZA',
    name: 'South Africa',
    flag: '🇿🇦',
    currency: 'ZAR',
    languages: ['en', 'af', 'zu'],
    fresherTerm: 'Public Service Internship & Graduate Scheme',
    publicSectorTerm: 'Department of Public Service and Administration (DPSA)',
    topPortals: [
      { name: 'DPSA Vacancies', url: 'https://www.dpsa.gov.za', level: 'FEDERAL' },
    ],
    active: true,
    priorityTier: 2,
  },
] as const;

export const GOVERNMENT_COUNTRY_MAP: Readonly<Record<string, GovernmentCountryConfig>> =
  Object.fromEntries(GOVERNMENT_COUNTRIES.map((c) => [c.code, c]));

export function getGovernmentCountry(countryCode: string): GovernmentCountryConfig | undefined {
  return GOVERNMENT_COUNTRY_MAP[countryCode.toUpperCase()];
}
