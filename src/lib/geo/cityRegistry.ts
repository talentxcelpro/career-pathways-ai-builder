/**
 * src/lib/geo/cityRegistry.ts
 * TalentXcel 1,000-City GSC-Driven Employment Discovery Registry
 *
 * INVARIANTS:
 * - Every canonical city slug is unique across the entire registry.
 * - Aliases must NOT match another city's canonical slug.
 * - Latitude/longitude sourced from ISO 3166-2 / OSM data only; never invented.
 * - GSC evidence fields MUST come from real GSC exports; "0" means no data, not fake data.
 * - seoEligible=true requires passing the IndexReadinessGate at runtime.
 *
 * DATA CONTRACT (GSC fields last updated: 2026-11-25 from gsc_performance_latest exports):
 *   gscImpressions / gscClicks / gscAvgPosition are from last-3-month GSC property-wide export.
 *   Unfiltered totals — NOT regex-filtered subsets.
 *
 * EXPANSION WAVES:
 *   Wave 1 (100 cities) — GSC evidence + inventory verified  → activatable now
 *   Wave 2 (200 cities) — Tier-1/2 employment hubs         → activate on Wave-1 health
 *   Wave 3 (300 cities) — Tier-2/3 industrial clusters      → activate on Wave-2 health
 *   Wave 4 (200 cities) — Tier-3 regional centres          → activate on Wave-3 health
 *   Wave 5 (200 cities) — Tier-4 district markets          → activate conditional on inventory
 *
 * @version 2.0.0
 */

export type CityTier = 1 | 2 | 3 | 4;
export type ExpansionWave = 1 | 2 | 3 | 4 | 5;
export type RegionCode = 'NORTH' | 'SOUTH' | 'EAST' | 'WEST' | 'CENTRAL' | 'NORTH_EAST' | 'PAN_INDIA';
export type HubType = 'IT_TECH' | 'INDUSTRIAL_MFG' | 'COMMERCIAL_FINANCIAL' | 'EDUCATION_HEALTH' | 'GOVT_PSU' | 'MIXED' | 'REMOTE';

export interface CityGSCData {
  /** Raw impressions from last-3-month GSC export. 0 = no GSC data found. */
  impressions: number;
  /** Raw clicks from last-3-month GSC export. 0 = no GSC data found. */
  clicks: number;
  /** Average position (GSC). 0 = no data. Lower = better. */
  avgPosition: number;
  /** Number of distinct queries resolving to this city's /locations/ URL in GSC */
  queryCount: number;
  /** Date of last GSC data snapshot */
  lastSnapshot: string;
}

export interface CityInventoryData {
  /** Count of active jobs in Supabase matching this city at last check */
  activeJobCount: number;
  /** Count of unique employers active in this city */
  uniqueEmployerCount: number;
  /** Date of last inventory count */
  lastInventoryCheck: string;
  /** Whether inventory is fresh (< 7 days old) */
  inventoryFresh: boolean;
}

export interface CityRecord {
  /** Canonical slug — MUST be unique. Used in URLs: /locations/{slug} */
  slug: string;
  /** Display name used in page titles, h1, breadcrumbs */
  canonicalName: string;
  /** State or Union Territory */
  stateName: string;
  /** ISO 3166-1 alpha-2 */
  countryCode: 'IN';
  /** Geographic region of India */
  region: RegionCode;
  /** City tier for prioritization */
  tier: CityTier;
  /** Employment hub type */
  hubType: HubType;
  /** Expansion wave this city belongs to */
  wave: ExpansionWave;
  /** All known aliases and alternate spellings (lowercase). Never duplicates canonical slug of another city. */
  aliases: string[];
  /** WGS84 latitude. Source: OSM/ISO verified. */
  latitude: number;
  /** WGS84 longitude. Source: OSM/ISO verified. */
  longitude: number;
  /** GSC evidence. All fields from real GSC exports. */
  gsc: CityGSCData;
  /** Live job inventory. Populated at runtime from Supabase. */
  inventory?: CityInventoryData;
  /**
   * Opportunity score (0–100). Computed by cityOpportunityScore().
   * Not stored statically — computed at index-readiness check time.
   */
  opportunityScore?: number;
  /**
   * Whether this city passes the IndexReadinessGate.
   * Evaluated dynamically — never hard-coded to true for cities with zero inventory.
   */
  indexReady?: boolean;
  /** Key industries present in this city */
  industries: string[];
  /** Whether this city is active in the registry (not deprecated/merged) */
  active: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// GSC SNAPSHOT METADATA
// ─────────────────────────────────────────────────────────────────────────────
export const GSC_SNAPSHOT_DATE = '2026-11-25';
export const GSC_PERIOD = 'Last 3 months (2026-08-25 to 2026-11-10)';
export const GSC_FILTER = 'Web (text-based) — Unfiltered property-wide';
export const GSC_TOTAL_CLICKS = 1408;
export const GSC_TOTAL_IMPRESSIONS = 62245;
export const GSC_OVERALL_CTR = '2.26%';
export const GSC_AVG_POSITION = 29.8;

// ─────────────────────────────────────────────────────────────────────────────
// WAVE 1 — 100 HIGHEST-PRIORITY CITIES
// Priority: GSC evidence > existing clicks > avg position ≤ 10 > tier > inventory potential
// ─────────────────────────────────────────────────────────────────────────────
export const CITY_REGISTRY_WAVE1: CityRecord[] = [
  // ── GSC-CONFIRMED: Varanasi — #1 city page. 133 clicks, 4,097 impressions, avg pos 2.51
  {
    slug: 'varanasi',
    canonicalName: 'Varanasi',
    stateName: 'Uttar Pradesh',
    countryCode: 'IN',
    region: 'NORTH',
    tier: 2,
    hubType: 'COMMERCIAL_FINANCIAL',
    wave: 1,
    aliases: ['banaras', 'kashi', 'ramnagar', 'varansi'],
    latitude: 25.3176,
    longitude: 82.9739,
    gsc: { impressions: 4097, clicks: 133, avgPosition: 2.51, queryCount: 32, lastSnapshot: GSC_SNAPSHOT_DATE },
    industries: ['banking', 'education', 'healthcare', 'it_services', 'logistics', 'textiles'],
    active: true,
  },
  // ── GSC-CONFIRMED: Patiala — 12 clicks, 226 impressions, avg pos 1.91 (via /locations/patiala)
  {
    slug: 'patiala',
    canonicalName: 'Patiala',
    stateName: 'Punjab',
    countryCode: 'IN',
    region: 'NORTH',
    tier: 2,
    hubType: 'EDUCATION_HEALTH',
    wave: 1,
    aliases: ['patiala city', 'punjab patiala'],
    latitude: 30.3398,
    longitude: 76.3869,
    gsc: { impressions: 226, clicks: 12, avgPosition: 1.91, queryCount: 5, lastSnapshot: GSC_SNAPSHOT_DATE },
    industries: ['education', 'healthcare', 'retail', 'manufacturing', 'govt_psu'],
    active: true,
  },
  // ── GSC-CONFIRMED: Bhubaneswar — 0 clicks, 102 impressions, avg pos 3.88 (HIGH OPPORTUNITY: pos 4, 0 CTR)
  {
    slug: 'bhubaneswar',
    canonicalName: 'Bhubaneswar',
    stateName: 'Odisha',
    countryCode: 'IN',
    region: 'EAST',
    tier: 2,
    hubType: 'IT_TECH',
    wave: 1,
    aliases: ['bbsr', 'bhubaneshwar', 'bhubaneswar it'],
    latitude: 20.2961,
    longitude: 85.8245,
    gsc: { impressions: 102, clicks: 0, avgPosition: 3.88, queryCount: 22, lastSnapshot: GSC_SNAPSHOT_DATE },
    industries: ['it_services', 'govt_psu', 'education', 'healthcare', 'retail'],
    active: true,
  },
  // ── GSC-CONFIRMED: Chennai — 3 clicks, 45 impressions, avg pos 2.29 (via /locations/chennai)
  {
    slug: 'chennai',
    canonicalName: 'Chennai',
    stateName: 'Tamil Nadu',
    countryCode: 'IN',
    region: 'SOUTH',
    tier: 1,
    hubType: 'IT_TECH',
    wave: 1,
    aliases: ['madras', 'omr', 'sholinganallur', 'guindy', 'siruseri', 'tambaram'],
    latitude: 13.0827,
    longitude: 80.2707,
    gsc: { impressions: 45, clicks: 3, avgPosition: 2.29, queryCount: 25, lastSnapshot: GSC_SNAPSHOT_DATE },
    industries: ['it_services', 'manufacturing', 'automotive', 'banking', 'healthcare', 'logistics'],
    active: true,
  },
  // ── GSC-EVIDENCE (query level): Bangalore — 56 queries, 730 impressions, avg pos 37
  {
    slug: 'bangalore',
    canonicalName: 'Bangalore',
    stateName: 'Karnataka',
    countryCode: 'IN',
    region: 'SOUTH',
    tier: 1,
    hubType: 'IT_TECH',
    wave: 1,
    aliases: ['bengaluru', 'whitefield', 'electronic city', 'koramangala', 'indiranagar', 'bellandur', 'manyata', 'hsr layout'],
    latitude: 12.9716,
    longitude: 77.5946,
    gsc: { impressions: 21, clicks: 0, avgPosition: 54.1, queryCount: 56, lastSnapshot: GSC_SNAPSHOT_DATE },
    industries: ['it_services', 'startup', 'fintech', 'aerospace', 'biotech', 'ecommerce'],
    active: true,
  },
  // ── GSC-EVIDENCE (query): Thrissur — 5 clicks, 94 impressions, avg pos 3.9
  {
    slug: 'thrissur',
    canonicalName: 'Thrissur',
    stateName: 'Kerala',
    countryCode: 'IN',
    region: 'SOUTH',
    tier: 2,
    hubType: 'COMMERCIAL_FINANCIAL',
    wave: 1,
    aliases: ['trichur', 'thrissur city', 'infopark thrissur', 'sobha city thrissur'],
    latitude: 10.5276,
    longitude: 76.2144,
    gsc: { impressions: 94, clicks: 5, avgPosition: 3.9, queryCount: 6, lastSnapshot: GSC_SNAPSHOT_DATE },
    industries: ['banking', 'gold_jewelry', 'it_services', 'retail', 'healthcare'],
    active: true,
  },
  // ── GSC-EVIDENCE (query): Calicut/Kozhikode — 4 clicks, 89 impressions, avg pos 4.6
  {
    slug: 'kozhikode',
    canonicalName: 'Kozhikode',
    stateName: 'Kerala',
    countryCode: 'IN',
    region: 'SOUTH',
    tier: 2,
    hubType: 'IT_TECH',
    wave: 1,
    aliases: ['calicut', 'cyberpark calicut', 'ul cyberpark', 'government cyberpark calicut', 'calicut city'],
    latitude: 11.2588,
    longitude: 75.7804,
    gsc: { impressions: 89, clicks: 4, avgPosition: 4.6, queryCount: 7, lastSnapshot: GSC_SNAPSHOT_DATE },
    industries: ['it_services', 'education', 'textile', 'trade', 'healthcare'],
    active: true,
  },
  // ── GSC-EVIDENCE (query): Mangalore — 7 clicks, 49 impressions, avg pos 4.9
  {
    slug: 'mangaluru',
    canonicalName: 'Mangaluru',
    stateName: 'Karnataka',
    countryCode: 'IN',
    region: 'SOUTH',
    tier: 2,
    hubType: 'IT_TECH',
    wave: 1,
    aliases: ['mangalore', 'mangaluru city', 'baikampady', 'derlakatte', 'mrpl'],
    latitude: 12.9141,
    longitude: 74.8560,
    gsc: { impressions: 49, clicks: 7, avgPosition: 4.9, queryCount: 9, lastSnapshot: GSC_SNAPSHOT_DATE },
    industries: ['banking', 'it_services', 'petrochemicals', 'port_logistics', 'education'],
    active: true,
  },
  // ── GSC-EVIDENCE (query): Bilaspur — 9 clicks, 42 impressions, avg pos 5.3
  {
    slug: 'bilaspur',
    canonicalName: 'Bilaspur',
    stateName: 'Chhattisgarh',
    countryCode: 'IN',
    region: 'CENTRAL',
    tier: 2,
    hubType: 'GOVT_PSU',
    wave: 1,
    aliases: ['bilaspur chhattisgarh', 'ntpc bilaspur', 'sipat bilaspur', 'bilaspur cg'],
    latitude: 22.0797,
    longitude: 82.1409,
    gsc: { impressions: 42, clicks: 9, avgPosition: 5.3, queryCount: 6, lastSnapshot: GSC_SNAPSHOT_DATE },
    industries: ['power_energy', 'mining', 'govt_psu', 'railways', 'steel'],
    active: true,
  },
  // ── GSC-EVIDENCE (query): Ranchi — 7 clicks, 60 impressions, avg pos 16.1
  {
    slug: 'ranchi',
    canonicalName: 'Ranchi',
    stateName: 'Jharkhand',
    countryCode: 'IN',
    region: 'EAST',
    tier: 2,
    hubType: 'GOVT_PSU',
    wave: 1,
    aliases: ['ranchi jharkhand', 'ccl ranchi', 'mecon ranchi'],
    latitude: 23.3441,
    longitude: 85.3096,
    gsc: { impressions: 60, clicks: 7, avgPosition: 16.1, queryCount: 8, lastSnapshot: GSC_SNAPSHOT_DATE },
    industries: ['mining', 'govt_psu', 'it_services', 'steel', 'education'],
    active: true,
  },
  // ── GSC-EVIDENCE (query): Nagpur — 5 clicks, 262 impressions, avg pos 29.1
  {
    slug: 'nagpur',
    canonicalName: 'Nagpur',
    stateName: 'Maharashtra',
    countryCode: 'IN',
    region: 'WEST',
    tier: 2,
    hubType: 'INDUSTRIAL_MFG',
    wave: 1,
    aliases: ['nagpur city', 'mihan nagpur', 'mihan', 'nagpur orange city'],
    latitude: 21.1458,
    longitude: 79.0882,
    gsc: { impressions: 262, clicks: 5, avgPosition: 29.1, queryCount: 17, lastSnapshot: GSC_SNAPSHOT_DATE },
    industries: ['manufacturing', 'orange_trade', 'it_services', 'mining', 'railways'],
    active: true,
  },
  // ── GSC-EVIDENCE (query): Kochi — 4 clicks, 164 impressions, avg pos 39
  {
    slug: 'kochi',
    canonicalName: 'Kochi',
    stateName: 'Kerala',
    countryCode: 'IN',
    region: 'SOUTH',
    tier: 1,
    hubType: 'IT_TECH',
    wave: 1,
    aliases: ['cochin', 'ernakulam', 'infopark kochi', 'kakkanad', 'infopark koratty', 'smart city kochi'],
    latitude: 9.9312,
    longitude: 76.2673,
    gsc: { impressions: 164, clicks: 4, avgPosition: 39.0, queryCount: 10, lastSnapshot: GSC_SNAPSHOT_DATE },
    industries: ['it_services', 'port_logistics', 'tourism', 'fintech', 'startup'],
    active: true,
  },
  // ── GSC-EVIDENCE (query): Coimbatore — 2 clicks, 295 impressions, avg pos 51.5
  {
    slug: 'coimbatore',
    canonicalName: 'Coimbatore',
    stateName: 'Tamil Nadu',
    countryCode: 'IN',
    region: 'SOUTH',
    tier: 2,
    hubType: 'INDUSTRIAL_MFG',
    wave: 1,
    aliases: ['kovai', 'tidel park coimbatore', 'peelamedu', 'saravanampatti', 'coimbatore city'],
    latitude: 11.0168,
    longitude: 76.9558,
    gsc: { impressions: 295, clicks: 2, avgPosition: 51.5, queryCount: 20, lastSnapshot: GSC_SNAPSHOT_DATE },
    industries: ['manufacturing', 'textiles', 'it_services', 'pumps_motors', 'healthcare'],
    active: true,
  },
  // ── GSC-EVIDENCE (query): Vadodara — 2 clicks, 58 impressions, avg pos 27.6
  {
    slug: 'vadodara',
    canonicalName: 'Vadodara',
    stateName: 'Gujarat',
    countryCode: 'IN',
    region: 'WEST',
    tier: 2,
    hubType: 'INDUSTRIAL_MFG',
    wave: 1,
    aliases: ['baroda', 'vadodara city', 'gujarat refinery vadodara'],
    latitude: 22.3072,
    longitude: 73.1812,
    gsc: { impressions: 58, clicks: 2, avgPosition: 27.6, queryCount: 7, lastSnapshot: GSC_SNAPSHOT_DATE },
    industries: ['petrochemicals', 'manufacturing', 'it_services', 'pharmaceuticals', 'defence'],
    active: true,
  },
  // ── GSC-EVIDENCE (query): Jabalpur — 3 clicks, 56 impressions, avg pos 10.2
  {
    slug: 'jabalpur',
    canonicalName: 'Jabalpur',
    stateName: 'Madhya Pradesh',
    countryCode: 'IN',
    region: 'CENTRAL',
    tier: 2,
    hubType: 'GOVT_PSU',
    wave: 1,
    aliases: ['jubbulpore', 'jabalpur city', 'ordnance factory khamaria'],
    latitude: 23.1815,
    longitude: 79.9864,
    gsc: { impressions: 56, clicks: 3, avgPosition: 10.2, queryCount: 3, lastSnapshot: GSC_SNAPSHOT_DATE },
    industries: ['defence', 'railways', 'govt_psu', 'manufacturing', 'education'],
    active: true,
  },
  // ── GSC-EVIDENCE (query): Gwalior — 0 clicks, 70 impressions, avg pos 21.2
  {
    slug: 'gwalior',
    canonicalName: 'Gwalior',
    stateName: 'Madhya Pradesh',
    countryCode: 'IN',
    region: 'CENTRAL',
    tier: 2,
    hubType: 'INDUSTRIAL_MFG',
    wave: 1,
    aliases: ['gwalior city', 'lashkar'],
    latitude: 26.2183,
    longitude: 78.1828,
    gsc: { impressions: 70, clicks: 0, avgPosition: 21.2, queryCount: 3, lastSnapshot: GSC_SNAPSHOT_DATE },
    industries: ['defence', 'manufacturing', 'education', 'textile', 'govt_psu'],
    active: true,
  },
  // ── GSC-EVIDENCE: Dhanbad — 1 click, 6 impressions, avg pos 6.7 (Tata Steel / BCCL / coal)
  {
    slug: 'dhanbad',
    canonicalName: 'Dhanbad',
    stateName: 'Jharkhand',
    countryCode: 'IN',
    region: 'EAST',
    tier: 2,
    hubType: 'INDUSTRIAL_MFG',
    wave: 1,
    aliases: ['dhanbad jharkhand', 'bccl dhanbad', 'tata steel dhanbad', 'coal city'],
    latitude: 23.7957,
    longitude: 86.4304,
    gsc: { impressions: 6, clicks: 1, avgPosition: 6.7, queryCount: 1, lastSnapshot: GSC_SNAPSHOT_DATE },
    industries: ['mining', 'coal', 'steel', 'railways', 'power_energy'],
    active: true,
  },
  // ── GSC-EVIDENCE: Jamshedpur — 1 click, 20 impressions, avg pos 3
  {
    slug: 'jamshedpur',
    canonicalName: 'Jamshedpur',
    stateName: 'Jharkhand',
    countryCode: 'IN',
    region: 'EAST',
    tier: 2,
    hubType: 'INDUSTRIAL_MFG',
    wave: 1,
    aliases: ['tatanagar', 'tata steel jamshedpur', 'jharkhand industrial'],
    latitude: 22.8046,
    longitude: 86.2029,
    gsc: { impressions: 20, clicks: 1, avgPosition: 3.0, queryCount: 2, lastSnapshot: GSC_SNAPSHOT_DATE },
    industries: ['steel', 'manufacturing', 'automotive', 'it_services'],
    active: true,
  },
  // ── GSC-EVIDENCE: Nashik — 2 clicks, 14 impressions, avg pos 13.6
  {
    slug: 'nashik',
    canonicalName: 'Nashik',
    stateName: 'Maharashtra',
    countryCode: 'IN',
    region: 'WEST',
    tier: 2,
    hubType: 'INDUSTRIAL_MFG',
    wave: 1,
    aliases: ['nasik', 'nashik city', 'ambad nashik'],
    latitude: 19.9975,
    longitude: 73.7898,
    gsc: { impressions: 14, clicks: 2, avgPosition: 13.6, queryCount: 3, lastSnapshot: GSC_SNAPSHOT_DATE },
    industries: ['manufacturing', 'pharmaceuticals', 'grape_wine', 'engineering'],
    active: true,
  },
  // ── GSC-EVIDENCE: Hubli — 1 click, 14 impressions, avg pos 5.7
  {
    slug: 'hubballi',
    canonicalName: 'Hubballi',
    stateName: 'Karnataka',
    countryCode: 'IN',
    region: 'SOUTH',
    tier: 2,
    hubType: 'COMMERCIAL_FINANCIAL',
    wave: 1,
    aliases: ['hubli', 'hubli dharwad', 'hubballi dharwad', 'dharwad'],
    latitude: 15.3647,
    longitude: 75.1240,
    gsc: { impressions: 14, clicks: 1, avgPosition: 5.7, queryCount: 2, lastSnapshot: GSC_SNAPSHOT_DATE },
    industries: ['trade', 'railways', 'it_services', 'manufacturing', 'education'],
    active: true,
  },
  // ── GSC-EVIDENCE: Raipur — 1 click, 32 impressions, avg pos 29.1
  {
    slug: 'raipur',
    canonicalName: 'Raipur',
    stateName: 'Chhattisgarh',
    countryCode: 'IN',
    region: 'CENTRAL',
    tier: 2,
    hubType: 'INDUSTRIAL_MFG',
    wave: 1,
    aliases: ['raipur chhattisgarh', 'raipur city'],
    latitude: 21.2514,
    longitude: 81.6296,
    gsc: { impressions: 32, clicks: 1, avgPosition: 29.1, queryCount: 4, lastSnapshot: GSC_SNAPSHOT_DATE },
    industries: ['steel', 'mining', 'manufacturing', 'it_services', 'govt_psu'],
    active: true,
  },
  // ── GSC-EVIDENCE: Guwahati — 2 clicks, 14 impressions, avg pos 9.2
  {
    slug: 'guwahati',
    canonicalName: 'Guwahati',
    stateName: 'Assam',
    countryCode: 'IN',
    region: 'NORTH_EAST',
    tier: 2,
    hubType: 'COMMERCIAL_FINANCIAL',
    wave: 1,
    aliases: ['gauhati', 'guwahati city', 'dispur', 'oil india guwahati'],
    latitude: 26.1445,
    longitude: 91.7362,
    gsc: { impressions: 14, clicks: 2, avgPosition: 9.2, queryCount: 3, lastSnapshot: GSC_SNAPSHOT_DATE },
    industries: ['oil_gas', 'tea', 'it_services', 'retail', 'education'],
    active: true,
  },
  // ── GSC-EVIDENCE: Visakhapatnam/Vizag — 2 clicks, 31 impressions, avg pos 25.4
  {
    slug: 'visakhapatnam',
    canonicalName: 'Visakhapatnam',
    stateName: 'Andhra Pradesh',
    countryCode: 'IN',
    region: 'SOUTH',
    tier: 1,
    hubType: 'INDUSTRIAL_MFG',
    wave: 1,
    aliases: ['vizag', 'waltair', 'visakhapatnam city', 'hpcl vizag', 'divis laboratories vizag', 'andhra university vizag'],
    latitude: 17.6868,
    longitude: 83.2185,
    gsc: { impressions: 31, clicks: 2, avgPosition: 25.4, queryCount: 4, lastSnapshot: GSC_SNAPSHOT_DATE },
    industries: ['steel', 'shipbuilding', 'pharmaceuticals', 'it_services', 'port_logistics'],
    active: true,
  },
  // ── GSC-EVIDENCE: Agra — 2 clicks, 20 impressions, avg pos 3.4
  {
    slug: 'agra',
    canonicalName: 'Agra',
    stateName: 'Uttar Pradesh',
    countryCode: 'IN',
    region: 'NORTH',
    tier: 2,
    hubType: 'INDUSTRIAL_MFG',
    wave: 1,
    aliases: ['agra city', 'sanjay place agra', 'taj mahal city'],
    latitude: 27.1767,
    longitude: 78.0081,
    gsc: { impressions: 20, clicks: 2, avgPosition: 3.4, queryCount: 1, lastSnapshot: GSC_SNAPSHOT_DATE },
    industries: ['leather', 'tourism', 'manufacturing', 'textiles', 'trade'],
    active: true,
  },
  // ── GSC-EVIDENCE: Aurangabad — 1 click, 112 impressions, avg pos 52.2
  {
    slug: 'aurangabad',
    canonicalName: 'Aurangabad',
    stateName: 'Maharashtra',
    countryCode: 'IN',
    region: 'WEST',
    tier: 2,
    hubType: 'INDUSTRIAL_MFG',
    wave: 1,
    aliases: ['chhatrapati sambhajinagar', 'waluj aurangabad', 'shendra aurangabad'],
    latitude: 19.8762,
    longitude: 75.3433,
    gsc: { impressions: 112, clicks: 1, avgPosition: 52.2, queryCount: 9, lastSnapshot: GSC_SNAPSHOT_DATE },
    industries: ['automotive', 'manufacturing', 'pharmaceuticals', 'it_services'],
    active: true,
  },
  // ── Tier-1 hubs with strong query signals — no /locations/ page impressions but high job-URL GSC evidence
  {
    slug: 'noida',
    canonicalName: 'Noida',
    stateName: 'Uttar Pradesh',
    countryCode: 'IN',
    region: 'NORTH',
    tier: 1,
    hubType: 'IT_TECH',
    wave: 1,
    aliases: ['noida expressway', 'sector 62', 'sector 135', 'greater noida'],
    latitude: 28.5355,
    longitude: 77.3910,
    gsc: { impressions: 0, clicks: 0, avgPosition: 0, queryCount: 0, lastSnapshot: GSC_SNAPSHOT_DATE },
    industries: ['it_services', 'manufacturing', 'fintech', 'media', 'electronics'],
    active: true,
  },
  {
    slug: 'gurugram',
    canonicalName: 'Gurugram',
    stateName: 'Haryana',
    countryCode: 'IN',
    region: 'NORTH',
    tier: 1,
    hubType: 'IT_TECH',
    wave: 1,
    aliases: ['gurgaon', 'cyber city', 'dlf phase', 'golf course road', 'sohna road', 'udyog vihar'],
    latitude: 28.4595,
    longitude: 77.0266,
    gsc: { impressions: 8, clicks: 0, avgPosition: 12.5, queryCount: 1, lastSnapshot: GSC_SNAPSHOT_DATE },
    industries: ['it_services', 'fintech', 'consulting', 'automotive', 'ecommerce'],
    active: true,
  },
  {
    slug: 'hyderabad',
    canonicalName: 'Hyderabad',
    stateName: 'Telangana',
    countryCode: 'IN',
    region: 'SOUTH',
    tier: 1,
    hubType: 'IT_TECH',
    wave: 1,
    aliases: ['hitec city', 'gachibowli', 'madhapur', 'kondapur', 'secunderabad', 'cyberabad', 'jubilee hills'],
    latitude: 17.3850,
    longitude: 78.4867,
    gsc: { impressions: 167, clicks: 3, avgPosition: 41.8, queryCount: 15, lastSnapshot: GSC_SNAPSHOT_DATE },
    industries: ['it_services', 'pharmaceuticals', 'fintech', 'aerospace', 'biotech'],
    active: true,
  },
  {
    slug: 'pune',
    canonicalName: 'Pune',
    stateName: 'Maharashtra',
    countryCode: 'IN',
    region: 'WEST',
    tier: 1,
    hubType: 'IT_TECH',
    wave: 1,
    aliases: ['poona', 'hinjewadi', 'magarpatta', 'viman nagar', 'kharadi', 'baner', 'hadapsar', 'pcmc'],
    latitude: 18.5204,
    longitude: 73.8567,
    gsc: { impressions: 365, clicks: 0, avgPosition: 56.9, queryCount: 22, lastSnapshot: GSC_SNAPSHOT_DATE },
    industries: ['it_services', 'automotive', 'manufacturing', 'fintech', 'defense', 'education'],
    active: true,
  },
  {
    slug: 'mumbai',
    canonicalName: 'Mumbai',
    stateName: 'Maharashtra',
    countryCode: 'IN',
    region: 'WEST',
    tier: 1,
    hubType: 'COMMERCIAL_FINANCIAL',
    wave: 1,
    aliases: ['bombay', 'bkc', 'bandra', 'andheri', 'nariman point', 'worli', 'powai', 'malad', 'navi mumbai'],
    latitude: 19.0760,
    longitude: 72.8777,
    gsc: { impressions: 231, clicks: 3, avgPosition: 44.1, queryCount: 16, lastSnapshot: GSC_SNAPSHOT_DATE },
    industries: ['banking', 'fintech', 'media', 'it_services', 'textiles', 'pharmaceuticals'],
    active: true,
  },
  {
    slug: 'delhi',
    canonicalName: 'Delhi',
    stateName: 'Delhi',
    countryCode: 'IN',
    region: 'NORTH',
    tier: 1,
    hubType: 'COMMERCIAL_FINANCIAL',
    wave: 1,
    aliases: ['new delhi', 'delhi ncr', 'connaught place', 'south delhi', 'nehru place', 'ncr'],
    latitude: 28.6139,
    longitude: 77.2090,
    gsc: { impressions: 64, clicks: 0, avgPosition: 45.0, queryCount: 5, lastSnapshot: GSC_SNAPSHOT_DATE },
    industries: ['govt_psu', 'consulting', 'media', 'it_services', 'retail', 'education'],
    active: true,
  },
  {
    slug: 'kolkata',
    canonicalName: 'Kolkata',
    stateName: 'West Bengal',
    countryCode: 'IN',
    region: 'EAST',
    tier: 1,
    hubType: 'COMMERCIAL_FINANCIAL',
    wave: 1,
    aliases: ['calcutta', 'salt lake', 'sector v', 'new town', 'rajarhat', 'park street'],
    latitude: 22.5726,
    longitude: 88.3639,
    gsc: { impressions: 89, clicks: 3, avgPosition: 53.7, queryCount: 11, lastSnapshot: GSC_SNAPSHOT_DATE },
    industries: ['banking', 'jute', 'it_services', 'tea_trade', 'manufacturing', 'leather'],
    active: true,
  },
  {
    slug: 'ahmedabad',
    canonicalName: 'Ahmedabad',
    stateName: 'Gujarat',
    countryCode: 'IN',
    region: 'WEST',
    tier: 1,
    hubType: 'COMMERCIAL_FINANCIAL',
    wave: 1,
    aliases: ['sg highway', 'prahlad nagar', 'sanand', 'gift city', 'gandhinagar'],
    latitude: 23.0225,
    longitude: 72.5714,
    gsc: { impressions: 101, clicks: 0, avgPosition: 49.4, queryCount: 5, lastSnapshot: GSC_SNAPSHOT_DATE },
    industries: ['manufacturing', 'textiles', 'pharmaceuticals', 'fintech', 'chemicals'],
    active: true,
  },
  {
    slug: 'jaipur',
    canonicalName: 'Jaipur',
    stateName: 'Rajasthan',
    countryCode: 'IN',
    region: 'NORTH',
    tier: 2,
    hubType: 'COMMERCIAL_FINANCIAL',
    wave: 1,
    aliases: ['pink city', 'sitapura', 'malviya nagar jaipur', 'mansarovar', 'mahindra world city jaipur'],
    latitude: 26.9124,
    longitude: 75.7873,
    gsc: { impressions: 74, clicks: 0, avgPosition: 48.3, queryCount: 4, lastSnapshot: GSC_SNAPSHOT_DATE },
    industries: ['gems_jewelry', 'tourism', 'it_services', 'textiles', 'handicrafts'],
    active: true,
  },
  {
    slug: 'lucknow',
    canonicalName: 'Lucknow',
    stateName: 'Uttar Pradesh',
    countryCode: 'IN',
    region: 'NORTH',
    tier: 2,
    hubType: 'COMMERCIAL_FINANCIAL',
    wave: 1,
    aliases: ['gomti nagar', 'hazratganj', 'alambagh', 'transport nagar lucknow'],
    latitude: 26.8467,
    longitude: 80.9462,
    gsc: { impressions: 427, clicks: 0, avgPosition: 73.4, queryCount: 14, lastSnapshot: GSC_SNAPSHOT_DATE },
    industries: ['banking', 'it_services', 'healthcare', 'education', 'manufacturing'],
    active: true,
  },
  {
    slug: 'chandigarh',
    canonicalName: 'Chandigarh',
    stateName: 'Punjab',
    countryCode: 'IN',
    region: 'NORTH',
    tier: 2,
    hubType: 'IT_TECH',
    wave: 1,
    aliases: ['chandigarh tricity', 'panchkula', 'mohali chandigarh', 'it park chandigarh'],
    latitude: 30.7333,
    longitude: 76.7794,
    gsc: { impressions: 123, clicks: 0, avgPosition: 9.5, queryCount: 11, lastSnapshot: GSC_SNAPSHOT_DATE },
    industries: ['it_services', 'education', 'healthcare', 'banking', 'govt_psu'],
    active: true,
  },
  {
    slug: 'thiruvananthapuram',
    canonicalName: 'Thiruvananthapuram',
    stateName: 'Kerala',
    countryCode: 'IN',
    region: 'SOUTH',
    tier: 2,
    hubType: 'IT_TECH',
    wave: 1,
    aliases: ['trivandrum', 'technopark', 'kazhakoottam', 'technopark trivandrum'],
    latitude: 8.5241,
    longitude: 76.9366,
    gsc: { impressions: 20, clicks: 0, avgPosition: 52.6, queryCount: 1, lastSnapshot: GSC_SNAPSHOT_DATE },
    industries: ['it_services', 'aerospace', 'govt_psu', 'tourism', 'education'],
    active: true,
  },
  {
    slug: 'madurai',
    canonicalName: 'Madurai',
    stateName: 'Tamil Nadu',
    countryCode: 'IN',
    region: 'SOUTH',
    tier: 2,
    hubType: 'COMMERCIAL_FINANCIAL',
    wave: 1,
    aliases: ['madurai city', 'elcot madurai', 'vadapalanji'],
    latitude: 9.9252,
    longitude: 78.1198,
    gsc: { impressions: 0, clicks: 0, avgPosition: 0, queryCount: 0, lastSnapshot: GSC_SNAPSHOT_DATE },
    industries: ['textiles', 'tourism', 'manufacturing', 'it_services'],
    active: true,
  },
  {
    slug: 'tiruchirappalli',
    canonicalName: 'Tiruchirappalli',
    stateName: 'Tamil Nadu',
    countryCode: 'IN',
    region: 'SOUTH',
    tier: 2,
    hubType: 'INDUSTRIAL_MFG',
    wave: 1,
    aliases: ['trichy', 'bhel trichy', 'elcot trichy', 'trichinopoly', 'southern railway salem division'],
    latitude: 10.7905,
    longitude: 78.7047,
    gsc: { impressions: 0, clicks: 0, avgPosition: 0, queryCount: 0, lastSnapshot: GSC_SNAPSHOT_DATE },
    industries: ['manufacturing', 'engineering', 'it_services', 'railways', 'defence'],
    active: true,
  },
  {
    slug: 'indore',
    canonicalName: 'Indore',
    stateName: 'Madhya Pradesh',
    countryCode: 'IN',
    region: 'CENTRAL',
    tier: 2,
    hubType: 'COMMERCIAL_FINANCIAL',
    wave: 1,
    aliases: ['indore city', 'super corridor indore', 'pithampur'],
    latitude: 22.7196,
    longitude: 75.8577,
    gsc: { impressions: 28, clicks: 0, avgPosition: 55.8, queryCount: 3, lastSnapshot: GSC_SNAPSHOT_DATE },
    industries: ['pharmaceuticals', 'manufacturing', 'it_services', 'textiles', 'trade'],
    active: true,
  },
  {
    slug: 'bhopal',
    canonicalName: 'Bhopal',
    stateName: 'Madhya Pradesh',
    countryCode: 'IN',
    region: 'CENTRAL',
    tier: 2,
    hubType: 'GOVT_PSU',
    wave: 1,
    aliases: ['bhopal city', 'manit bhopal', 'bhel bhopal'],
    latitude: 23.2599,
    longitude: 77.4126,
    gsc: { impressions: 11, clicks: 0, avgPosition: 71.9, queryCount: 1, lastSnapshot: GSC_SNAPSHOT_DATE },
    industries: ['govt_psu', 'manufacturing', 'it_services', 'education', 'healthcare'],
    active: true,
  },
  {
    slug: 'surat',
    canonicalName: 'Surat',
    stateName: 'Gujarat',
    countryCode: 'IN',
    region: 'WEST',
    tier: 2,
    hubType: 'COMMERCIAL_FINANCIAL',
    wave: 1,
    aliases: ['surat city', 'diamond city surat', 'textile city surat'],
    latitude: 21.1702,
    longitude: 72.8311,
    gsc: { impressions: 18, clicks: 0, avgPosition: 62.6, queryCount: 1, lastSnapshot: GSC_SNAPSHOT_DATE },
    industries: ['diamonds', 'textiles', 'chemicals', 'trade', 'manufacturing'],
    active: true,
  },
  {
    slug: 'kanpur',
    canonicalName: 'Kanpur',
    stateName: 'Uttar Pradesh',
    countryCode: 'IN',
    region: 'NORTH',
    tier: 2,
    hubType: 'INDUSTRIAL_MFG',
    wave: 1,
    aliases: ['cawnpore', 'panki', 'fazalganj', 'kanpur city'],
    latitude: 26.4499,
    longitude: 80.3319,
    gsc: { impressions: 16, clicks: 0, avgPosition: 39.9, queryCount: 1, lastSnapshot: GSC_SNAPSHOT_DATE },
    industries: ['leather', 'textiles', 'manufacturing', 'banking', 'it_services'],
    active: true,
  },
  {
    slug: 'patna',
    canonicalName: 'Patna',
    stateName: 'Bihar',
    countryCode: 'IN',
    region: 'EAST',
    tier: 2,
    hubType: 'GOVT_PSU',
    wave: 1,
    aliases: ['patna city', 'patna sahib', 'bihar capital'],
    latitude: 25.5941,
    longitude: 85.1376,
    gsc: { impressions: 20, clicks: 0, avgPosition: 39.6, queryCount: 2, lastSnapshot: GSC_SNAPSHOT_DATE },
    industries: ['govt_psu', 'banking', 'education', 'healthcare', 'construction'],
    active: true,
  },
  {
    slug: 'dehradun',
    canonicalName: 'Dehradun',
    stateName: 'Uttarakhand',
    countryCode: 'IN',
    region: 'NORTH',
    tier: 2,
    hubType: 'EDUCATION_HEALTH',
    wave: 1,
    aliases: ['rajpur road', 'selakui', 'it park dehradun', 'doon'],
    latitude: 30.3165,
    longitude: 78.0322,
    gsc: { impressions: 55, clicks: 0, avgPosition: 49.4, queryCount: 1, lastSnapshot: GSC_SNAPSHOT_DATE },
    industries: ['education', 'it_services', 'tourism', 'healthcare', 'defence'],
    active: true,
  },
  {
    slug: 'ludhiana',
    canonicalName: 'Ludhiana',
    stateName: 'Punjab',
    countryCode: 'IN',
    region: 'NORTH',
    tier: 2,
    hubType: 'INDUSTRIAL_MFG',
    wave: 1,
    aliases: ['focal point ludhiana', 'industrial area ludhiana', 'ludhiana city'],
    latitude: 30.9010,
    longitude: 75.8573,
    gsc: { impressions: 10, clicks: 0, avgPosition: 35.4, queryCount: 1, lastSnapshot: GSC_SNAPSHOT_DATE },
    industries: ['hosiery', 'bicycles', 'textiles', 'manufacturing', 'banking'],
    active: true,
  },
  {
    slug: 'amritsar',
    canonicalName: 'Amritsar',
    stateName: 'Punjab',
    countryCode: 'IN',
    region: 'NORTH',
    tier: 2,
    hubType: 'COMMERCIAL_FINANCIAL',
    wave: 1,
    aliases: ['amritsar cantt', 'holy city amritsar', 'golden temple city'],
    latitude: 31.6340,
    longitude: 74.8723,
    gsc: { impressions: 0, clicks: 0, avgPosition: 0, queryCount: 0, lastSnapshot: GSC_SNAPSHOT_DATE },
    industries: ['trade', 'tourism', 'textiles', 'banking', 'food_processing'],
    active: true,
  },
  {
    slug: 'jalandhar',
    canonicalName: 'Jalandhar',
    stateName: 'Punjab',
    countryCode: 'IN',
    region: 'NORTH',
    tier: 2,
    hubType: 'INDUSTRIAL_MFG',
    wave: 1,
    aliases: ['jalandhar city', 'leather complex jalandhar'],
    latitude: 31.3260,
    longitude: 75.5762,
    gsc: { impressions: 36, clicks: 0, avgPosition: 49.1, queryCount: 3, lastSnapshot: GSC_SNAPSHOT_DATE },
    industries: ['sports_goods', 'leather', 'manufacturing', 'banking'],
    active: true,
  },
  {
    slug: 'mysuru',
    canonicalName: 'Mysuru',
    stateName: 'Karnataka',
    countryCode: 'IN',
    region: 'SOUTH',
    tier: 2,
    hubType: 'IT_TECH',
    wave: 1,
    aliases: ['mysore', 'infosys mysore', 'hebbal mysore', 'mysore city'],
    latitude: 12.2958,
    longitude: 76.6394,
    gsc: { impressions: 0, clicks: 0, avgPosition: 0, queryCount: 0, lastSnapshot: GSC_SNAPSHOT_DATE },
    industries: ['it_services', 'textiles', 'silk', 'tourism', 'engineering'],
    active: true,
  },
  {
    slug: 'vijayawada',
    canonicalName: 'Vijayawada',
    stateName: 'Andhra Pradesh',
    countryCode: 'IN',
    region: 'SOUTH',
    tier: 2,
    hubType: 'COMMERCIAL_FINANCIAL',
    wave: 1,
    aliases: ['vijayawada city', 'gannavaram vijayawada', 'amaravati vijayawada'],
    latitude: 16.5062,
    longitude: 80.6480,
    gsc: { impressions: 0, clicks: 0, avgPosition: 0, queryCount: 0, lastSnapshot: GSC_SNAPSHOT_DATE },
    industries: ['trade', 'it_services', 'manufacturing', 'banking', 'agriculture'],
    active: true,
  },
  {
    slug: 'kollam',
    canonicalName: 'Kollam',
    stateName: 'Kerala',
    countryCode: 'IN',
    region: 'SOUTH',
    tier: 2,
    hubType: 'INDUSTRIAL_MFG',
    wave: 1,
    aliases: ['quilon', 'kollam technopark', 'kundara kollam', 'cashew capital'],
    latitude: 8.8932,
    longitude: 76.6141,
    gsc: { impressions: 9, clicks: 0, avgPosition: 4.6, queryCount: 1, lastSnapshot: GSC_SNAPSHOT_DATE },
    industries: ['cashew', 'it_services', 'coir', 'manufacturing', 'fishing'],
    active: true,
  },
  {
    slug: 'udaipur',
    canonicalName: 'Udaipur',
    stateName: 'Rajasthan',
    countryCode: 'IN',
    region: 'NORTH',
    tier: 2,
    hubType: 'COMMERCIAL_FINANCIAL',
    wave: 1,
    aliases: ['city of lakes', 'udaipur rajasthan', 'vedanta udaipur'],
    latitude: 24.5854,
    longitude: 73.7125,
    gsc: { impressions: 0, clicks: 0, avgPosition: 0, queryCount: 0, lastSnapshot: GSC_SNAPSHOT_DATE },
    industries: ['mining', 'tourism', 'manufacturing', 'banking', 'zinc'],
    active: true,
  },
  {
    slug: 'jodhpur',
    canonicalName: 'Jodhpur',
    stateName: 'Rajasthan',
    countryCode: 'IN',
    region: 'NORTH',
    tier: 2,
    hubType: 'INDUSTRIAL_MFG',
    wave: 1,
    aliases: ['marwar', 'boranada', 'blue city jodhpur'],
    latitude: 26.2389,
    longitude: 73.0243,
    gsc: { impressions: 0, clicks: 0, avgPosition: 0, queryCount: 0, lastSnapshot: GSC_SNAPSHOT_DATE },
    industries: ['handicrafts', 'textiles', 'tourism', 'manufacturing', 'defence'],
    active: true,
  },
  // Additional Wave-1 Tier-2/3 cities with job-URL GSC evidence
  {
    slug: 'silchar',
    canonicalName: 'Silchar',
    stateName: 'Assam',
    countryCode: 'IN',
    region: 'NORTH_EAST',
    tier: 3,
    hubType: 'EDUCATION_HEALTH',
    wave: 1,
    aliases: ['silchar city', 'nit silchar'],
    latitude: 24.8333,
    longitude: 92.7789,
    gsc: { impressions: 26, clicks: 0, avgPosition: 10.3, queryCount: 1, lastSnapshot: GSC_SNAPSHOT_DATE },
    industries: ['education', 'tea', 'govt_psu', 'healthcare', 'trade'],
    active: true,
  },
  {
    slug: 'jammu',
    canonicalName: 'Jammu',
    stateName: 'Jammu and Kashmir',
    countryCode: 'IN',
    region: 'NORTH',
    tier: 2,
    hubType: 'GOVT_PSU',
    wave: 1,
    aliases: ['jammu city', 'bari brahmana', 'gangyal', 'jammu kashmir'],
    latitude: 32.7266,
    longitude: 74.8570,
    gsc: { impressions: 14, clicks: 0, avgPosition: 65.6, queryCount: 1, lastSnapshot: GSC_SNAPSHOT_DATE },
    industries: ['govt_psu', 'manufacturing', 'tourism', 'banking', 'defence'],
    active: true,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// WAVE 2–5 REGISTRY (selected entries — full list truncated for file size)
// Full 1,000-city registry is managed in Supabase table: city_registry
// ─────────────────────────────────────────────────────────────────────────────

/** All waves combined for lookup */
export const CITY_REGISTRY_ALL: CityRecord[] = [
  ...CITY_REGISTRY_WAVE1,
  // Wave 2–5 loaded from Supabase at runtime via cityRegistryService.ts
];

/**
 * Deduplicated slug lookup map. Use this to find a CityRecord by any alias or slug.
 * Built at module load — O(1) lookup.
 */
export const CITY_SLUG_MAP = new Map<string, CityRecord>();
export const CITY_ALIAS_INDEX = new Map<string, string>(); // alias → canonical slug

CITY_REGISTRY_ALL.forEach((city) => {
  CITY_SLUG_MAP.set(city.slug, city);
  city.aliases.forEach((alias) => {
    if (!CITY_SLUG_MAP.has(alias)) {
      CITY_ALIAS_INDEX.set(alias.toLowerCase(), city.slug);
    }
  });
});

/**
 * Resolve any city name, alias, or slug to a canonical CityRecord.
 * Returns undefined if not found.
 */
export function resolveCity(input: string): CityRecord | undefined {
  const normalized = input.toLowerCase().trim();
  if (CITY_SLUG_MAP.has(normalized)) return CITY_SLUG_MAP.get(normalized);
  const canonicalSlug = CITY_ALIAS_INDEX.get(normalized);
  if (canonicalSlug) return CITY_SLUG_MAP.get(canonicalSlug);
  return undefined;
}

/**
 * Returns all cities in a given wave, sorted by GSC impressions descending.
 */
export function getCitiesByWave(wave: ExpansionWave): CityRecord[] {
  return CITY_REGISTRY_ALL
    .filter((c) => c.wave === wave && c.active)
    .sort((a, b) => b.gsc.impressions - a.gsc.impressions);
}
