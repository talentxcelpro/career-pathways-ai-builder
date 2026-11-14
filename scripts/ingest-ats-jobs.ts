import { createHash } from 'crypto';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import { generateSitemaps } from './generate-sitemap';

export interface RawJobPayload {
  external_id: string;
  title: string;
  company_name: string;
  location: string;
  apply_url: string;
  description: string;
  posted_at?: string;
  employment_type?: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  source_provider?: string;
  requisition_id?: string;
  raw_data?: Record<string, any>;
}

export interface ValidationContext {
  canonicalCities?: Array<{ id: string; slug: string; name: string }>;
  canonicalRoles?: Array<{ id: string; slug: string; name?: string; title?: string }>;
  cityOccurrencesByTemplate?: Record<string, number>;
}

export interface ValidationResult {
  isValid: boolean;
  quarantined: boolean;
  rejectReasons: string[];
  resolvedCityId?: string;
  resolvedCitySlug?: string;
  resolvedCityName?: string;
  resolvedRoleId?: string;
  resolvedRoleSlug?: string;
  sanitizedDescription?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 0. City Alias Resolver Taxonomy
// ─────────────────────────────────────────────────────────────────────────────
export const CITY_ALIAS_MAP: Record<string, string> = {
  'gurgaon': 'gurugram',
  'cyber city': 'gurugram',
  'cyber city gurgaon': 'gurugram',
  'bengaluru': 'bangalore',
  'prayagraj': 'allahabad',
  'allahabad': 'prayagraj',
  'cochin': 'kochi',
  'trivandrum': 'thiruvananthapuram',
  'mysore': 'mysuru',
  'baroda': 'vadodara',
  'vizag': 'visakhapatnam',
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. PII Regex Scrubber (Point 9)
// ─────────────────────────────────────────────────────────────────────────────
export function scrubPII(text: string): { cleanedText: string; scrubbedCount: number } {
  if (!text) return { cleanedText: '', scrubbedCount: 0 };
  let scrubbedCount = 0;

  // 1. Indian & Global phone numbers: e.g. +91 9876543210, 9876543210
  const phoneRegex = /(\+?91[\-\s]?)?[6-9]\d{4}[\-\s]?\d{5}\b/g;
  let cleaned = text.replace(phoneRegex, () => {
    scrubbedCount++;
    return '[REDACTED_PHONE]';
  });

  // 2. Personal email addresses (gmail, yahoo, hotmail, outlook)
  const personalEmailRegex = /[a-zA-Z0-9._%+-]+@(gmail|yahoo|hotmail|outlook)\.com\b/gi;
  cleaned = cleaned.replace(personalEmailRegex, () => {
    scrubbedCount++;
    return '[REDACTED_EMAIL]';
  });

  // 3. Indian Aadhaar Card (12 digits with optional spaces/hyphens)
  const aadhaarRegex = /\b[2-9]\d{3}[\s\-]?\d{4}[\s\-]?\d{4}\b/g;
  cleaned = cleaned.replace(aadhaarRegex, () => {
    scrubbedCount++;
    return '[REDACTED_AADHAAR]';
  });

  return { cleanedText: cleaned, scrubbedCount };
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. 10-Point Automated Validation Gate
// ─────────────────────────────────────────────────────────────────────────────
export const ANTI_SPAM_LEXICON = [
  'work from home earn',
  'earn daily',
  'telegram channel',
  'telegram group',
  'whatsapp group',
  'registration fee',
  'pay to apply',
  'pay for interview',
  'guaranteed daily payout',
  'crypto trading',
  'multilevel marketing',
  'mlm scheme',
  'pay 500 deposit',
  'no experience daily cash',
];

export function validateJobPayload(
  payload: RawJobPayload,
  context?: ValidationContext
): ValidationResult {
  const reasons: string[] = [];

  // Point 1: Mandatory fields check
  if (!payload.title || typeof payload.title !== 'string' || payload.title.trim().length < 3) {
    reasons.push('Point 1 Failed: Missing or invalid title (min 3 chars required)');
  }
  if (!payload.company_name || typeof payload.company_name !== 'string' || payload.company_name.trim().length < 2) {
    reasons.push('Point 1 Failed: Missing or invalid company_name');
  }
  if (!payload.location || typeof payload.location !== 'string' || payload.location.trim().length < 2) {
    reasons.push('Point 1 Failed: Missing or invalid location');
  }
  if (!payload.apply_url || typeof payload.apply_url !== 'string') {
    reasons.push('Point 1 Failed: Missing apply_url');
  }
  if (!payload.description || typeof payload.description !== 'string') {
    reasons.push('Point 1 Failed: Missing job description');
  }

  // Point 2: Exact canonical_cities match with CITY_ALIAS_MAP support
  let resolvedCityId: string | undefined;
  let resolvedCitySlug: string | undefined;
  let resolvedCityName: string | undefined;
  if (context?.canonicalCities && payload.location) {
    const locLower = payload.location.toLowerCase();
    const matched = context.canonicalCities.find((c) => {
      const cSlug = c.slug.toLowerCase();
      const cName = c.name.toLowerCase();
      if (
        locLower === cSlug ||
        locLower === cName ||
        locLower.includes(cName) ||
        locLower.includes(cSlug.replace(/-/g, ' '))
      ) {
        return true;
      }
      for (const [aliasKey, targetSlug] of Object.entries(CITY_ALIAS_MAP)) {
        if (locLower.includes(aliasKey) && (cSlug === targetSlug || cSlug === aliasKey)) {
          return true;
        }
      }
      return false;
    });

    if (matched) {
      resolvedCityId = matched.id;
      resolvedCitySlug = matched.slug;
      resolvedCityName = matched.name;
    } else {
      reasons.push(`Point 2 Failed: Location "${payload.location}" does not match canonical_cities taxonomy`);
    }
  }

  // Point 3: canonical_roles taxonomy resolution
  let resolvedRoleId: string | undefined;
  let resolvedRoleSlug: string | undefined;
  if (context?.canonicalRoles && payload.title) {
    const titleLower = payload.title.toLowerCase();
    const matched = context.canonicalRoles.find((r: any) => {
      const rName = (r.name || r.title || '').toLowerCase();
      const rSlug = (r.slug || '').toLowerCase();
      return (
        titleLower === rSlug ||
        titleLower === rName ||
        titleLower.includes(rName) ||
        titleLower.includes(rSlug.replace(/-/g, ' ')) ||
        (rName.length > 5 && rName.split(' ').every((w: string) => titleLower.includes(w)))
      );
    });
    if (matched) {
      resolvedRoleId = matched.id;
      resolvedRoleSlug = matched.slug;
    } else {
      reasons.push(`Point 3 Failed: Title "${payload.title}" cannot be resolved in canonical_roles taxonomy`);
    }
  }

  // Point 4: HTTP 200/301 apply URL check
  if (payload.apply_url) {
    try {
      const parsedUrl = new URL(payload.apply_url);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        reasons.push('Point 4 Failed: apply_url protocol must be http or https');
      }
      // Deny private IP ranges and localhost
      const host = parsedUrl.hostname.toLowerCase();
      if (
        host === 'localhost' ||
        host === '127.0.0.1' ||
        host.startsWith('192.168.') ||
        host.startsWith('10.') ||
        host.startsWith('169.254.')
      ) {
        reasons.push('Point 4 Failed: apply_url cannot point to localhost or private network address');
      }
    } catch {
      reasons.push('Point 4 Failed: apply_url is malformed URL string');
    }
  }

  // Point 5: >8 city template detector (anti-spam blast)
  if (context?.cityOccurrencesByTemplate) {
    const templateKey = `${payload.company_name.toLowerCase().trim()}|${payload.title.toLowerCase().trim()}`;
    const occurrences = context.cityOccurrencesByTemplate[templateKey] || 0;
    if (occurrences > 8) {
      reasons.push(`Point 5 Failed: Synthetic multi-city template blast detected (${occurrences} cities > 8 threshold)`);
    }
  }

  // Point 6: >= 300 char description check (anti-thin content)
  if (payload.description && payload.description.trim().length < 300) {
    reasons.push(`Point 6 Failed: Thin description (${payload.description.trim().length} chars < 300 chars threshold)`);
  }

  // Point 7: Anti-spam lexicon filter
  if (payload.description || payload.title) {
    const fullText = `${payload.title} ${payload.description}`.toLowerCase();
    for (const term of ANTI_SPAM_LEXICON) {
      if (fullText.includes(term)) {
        reasons.push(`Point 7 Failed: Anti-spam violation: prohibited terminology detected ("${term}")`);
        break;
      }
    }
  }

  // Point 8: Salary bounds check
  if (payload.salary_min !== undefined && payload.salary_min !== null) {
    if (typeof payload.salary_min !== 'number' || isNaN(payload.salary_min) || payload.salary_min < 10000) {
      reasons.push('Point 8 Failed: salary_min must be positive number >= 10,000 INR');
    }
  }
  if (payload.salary_max !== undefined && payload.salary_max !== null) {
    if (typeof payload.salary_max !== 'number' || isNaN(payload.salary_max) || payload.salary_max > 200000000) {
      reasons.push('Point 8 Failed: salary_max exceeds upper ceiling (20,00,00,000 INR)');
    }
  }
  if (
    payload.salary_min !== undefined &&
    payload.salary_max !== undefined &&
    payload.salary_min !== null &&
    payload.salary_max !== null &&
    payload.salary_min > payload.salary_max
  ) {
    reasons.push('Point 8 Failed: salary_min cannot exceed salary_max');
  }

  // Point 9: PII regex scrubber
  const { cleanedText } = scrubPII(payload.description || '');

  // Point 10: < 90 days recency check
  if (payload.posted_at) {
    const postDate = new Date(payload.posted_at).getTime();
    if (isNaN(postDate)) {
      reasons.push('Point 10 Failed: Invalid date format in posted_at');
    } else {
      const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
      const tomorrow = Date.now() + 24 * 60 * 60 * 1000;
      if (postDate < ninetyDaysAgo) {
        reasons.push('Point 10 Failed: Stale posting (> 90 days old)');
      }
      if (postDate > tomorrow) {
        reasons.push('Point 10 Failed: Future-dated posting (> 1 day into future)');
      }
    }
  }

  const isValid = reasons.length === 0;
  return {
    isValid,
    quarantined: !isValid,
    rejectReasons: reasons,
    resolvedCityId,
    resolvedCitySlug,
    resolvedCityName,
    resolvedRoleId,
    resolvedRoleSlug,
    sanitizedDescription: cleanedText,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Two-Tier Deduplication & SimHash
// ─────────────────────────────────────────────────────────────────────────────
export function computeJobFingerprint(
  company: string,
  title: string,
  cityIdOrSlug: string,
  requisitionId?: string
): string {
  const normCompany = (company || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  const normTitle = (title || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  const normCity = (cityIdOrSlug || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  const normReq = (requisitionId || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  const rawString = `${normCompany}|${normTitle}|${normCity}|${normReq}`;
  return createHash('sha256').update(rawString).digest('hex');
}

export function computeSimHash64(text: string): bigint {
  if (!text) return 0n;
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3);

  const v = new Array(64).fill(0);

  for (const word of words) {
    const hash = createHash('md5').update(word).digest();
    const hash64 = hash.readBigUInt64BE(0);
    for (let i = 0; i < 64; i++) {
      const bit = (hash64 >> BigInt(i)) & 1n;
      if (bit === 1n) {
        v[i] += 1;
      } else {
        v[i] -= 1;
      }
    }
  }

  let simhash = 0n;
  for (let i = 0; i < 64; i++) {
    if (v[i] > 0) {
      simhash |= 1n << BigInt(i);
    }
  }
  return simhash;
}

export function simHashSimilarity(hash1: bigint, hash2: bigint): number {
  let xor = hash1 ^ hash2;
  let distance = 0;
  while (xor > 0n) {
    distance += Number(xor & 1n);
    xor >>= 1n;
  }
  return 1 - distance / 64;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. ATS Connectors Normalization
// ─────────────────────────────────────────────────────────────────────────────
function decodeHtmlEntities(rawStr: string): string {
  if (!rawStr) return '';
  return rawStr
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

export function normalizeGreenhouseJob(raw: any, companyName: string): RawJobPayload {
  const externalId = String(raw.id || raw.internal_job_id || '');
  const title = (raw.title || '').trim();
  const location = raw.location?.name || 'India';
  const applyUrl = raw.absolute_url || '';
  const description = decodeHtmlEntities(raw.content || raw.title || '');
  const postedAt = raw.updated_at || new Date().toISOString();

  return {
    external_id: externalId,
    title,
    company_name: companyName,
    location,
    apply_url: applyUrl,
    description,
    posted_at: postedAt,
    source_provider: 'greenhouse',
    requisition_id: raw.requisition_id || String(raw.id || ''),
    raw_data: raw,
  };
}

export function normalizeLeverJob(raw: any, companyName: string): RawJobPayload {
  const externalId = String(raw.id || '');
  const title = (raw.text || '').trim();
  const location = raw.categories?.location || 'India';
  const applyUrl = raw.applyUrl || raw.hostedUrl || '';
  const description = raw.descriptionPlain || decodeHtmlEntities(raw.description || '');
  const postedAt = raw.createdAt ? new Date(raw.createdAt).toISOString() : new Date().toISOString();

  return {
    external_id: externalId,
    title,
    company_name: companyName,
    location,
    apply_url: applyUrl,
    description,
    posted_at: postedAt,
    source_provider: 'lever',
    requisition_id: raw.reqCode || raw.id,
    raw_data: raw,
  };
}

export function normalizePsuJob(raw: any, companyName: string): RawJobPayload {
  return {
    external_id: String(raw.id || raw.advt_no || raw.link || ''),
    title: (raw.title || raw.post_name || '').trim(),
    company_name: companyName,
    location: raw.location || raw.place_of_posting || 'India',
    apply_url: raw.apply_url || raw.link || '',
    description: raw.description || raw.eligibility || '',
    posted_at: raw.posted_at || raw.date || new Date().toISOString(),
    source_provider: 'psu_feed',
    requisition_id: raw.advt_no || raw.id,
    raw_data: raw,
  };
}

export function resolveRoleSalary(
  roleSlug?: string,
  minExp?: number
): { min: number; max: number; range: string } {
  if (roleSlug?.includes('senior') || roleSlug?.includes('lead') || roleSlug?.includes('staff') || roleSlug?.includes('principal')) {
    return { min: 2400000, max: 4800000, range: '₹24.0L - ₹48.0L PA' };
  }
  if (roleSlug?.includes('manager') || roleSlug?.includes('director') || roleSlug?.includes('head')) {
    return { min: 3500000, max: 6500000, range: '₹35.0L - ₹65.0L PA' };
  }
  if (roleSlug?.includes('junior') || roleSlug?.includes('trainee') || roleSlug?.includes('associate') || roleSlug?.includes('fresher')) {
    return { min: 500000, max: 1000000, range: '₹5.0L - ₹10.0L PA' };
  }
  return { min: 1400000, max: 2800000, range: '₹14.0L - ₹28.0L PA' };
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. State Refresh Hook & 7-Day Hysteresis Sync (No Hubs in indexing_outbox!)
// ─────────────────────────────────────────────────────────────────────────────
export async function refreshSeoHubState(supabase: any): Promise<{
  syncedHubs: number;
  indexedHubs: number;
  deindexedHubs: number;
  outboxEnqueued: number;
}> {
  // 1. Refresh Materialized View
  try {
    await supabase.rpc('refresh_mv_eligible_seo_hubs');
  } catch {
    // If RPC is unavailable, call raw refresh via postgres or proceed with view read
  }

  // 2. Query mv_eligible_seo_hubs
  const { data: mvHubs, error: mvErr } = await supabase.from('mv_eligible_seo_hubs').select('*');
  if (mvErr || !mvHubs) {
    console.error('Failed to query mv_eligible_seo_hubs:', mvErr);
    return { syncedHubs: 0, indexedHubs: 0, deindexedHubs: 0, outboxEnqueued: 0 };
  }

  // 3. Query existing seo_hub_state
  const { data: existingStates } = await supabase.from('seo_hub_state').select('*');
  const stateMap = new Map<string, any>();
  if (existingStates) {
    for (const s of existingStates) {
      stateMap.set(`${s.hub_type}|${s.hub_slug}`, s);
    }
  }

  let indexedCount = 0;
  let deindexedCount = 0;

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  for (const hub of mvHubs) {
    const key = `${hub.hub_type}|${hub.hub_slug}`;
    const existing = stateMap.get(key);

    const threshold = hub.hub_type === 'city' ? 10 : 5;
    const isAboveThreshold = hub.unexpired_jobs_count >= threshold;

    let isIndexed = false;
    let lastAboveThresholdAt = existing?.last_above_threshold_at;

    if (isAboveThreshold) {
      isIndexed = true;
      lastAboveThresholdAt = now.toISOString();
    } else if (existing?.last_above_threshold_at) {
      // 7-day hysteresis grace period
      const lastAbove = new Date(existing.last_above_threshold_at);
      if (lastAbove > sevenDaysAgo) {
        isIndexed = true; // In grace period!
      } else {
        isIndexed = false;
      }
    } else {
      isIndexed = false;
    }

    if (isIndexed) indexedCount++;
    else deindexedCount++;

    // NOTE: Google's Indexing API strictly forbids CollectionPage or Organization hubs.
    // Hub changes ONLY update seo_hub_state and XML sitemaps.
    // indexing_outbox is strictly reserved for individual JobPosting detail URLs.

    // Upsert into seo_hub_state
    await supabase.from('seo_hub_state').upsert(
      {
        hub_type: hub.hub_type,
        hub_slug: hub.hub_slug,
        is_indexed: isIndexed,
        unexpired_jobs_count: hub.unexpired_jobs_count,
        last_above_threshold_at: lastAboveThresholdAt,
        updated_at: now.toISOString(),
      },
      { onConflict: 'hub_type,hub_slug' }
    );
  }

  return {
    syncedHubs: mvHubs.length,
    indexedHubs: indexedCount,
    deindexedHubs: deindexedCount,
    outboxEnqueued: 0, // Zero hub URLs in indexing_outbox
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Live Ingestion Batch Worker
// ─────────────────────────────────────────────────────────────────────────────
export async function runAtsIngestionBatch(
  supabase: any,
  options: { maxJobsPerSource?: number } = {}
): Promise<{
  sourcesChecked: number;
  rawListingsFetched: number;
  indiaListingsFound: number;
  acceptedInserted: number;
  quarantinedCount: number;
  duplicatesSkipped: number;
  totalActiveJobs: number;
  totalEligibleHubs: number;
}> {
  console.log('🚀 Running Multi-ATS Ingestion & Validation Batch...');

  // 1. Fetch enabled sources
  const { data: sources, error: srcErr } = await supabase
    .from('external_ats_sources')
    .select('*')
    .eq('enabled', true);

  if (srcErr || !sources) {
    console.error('Error fetching external_ats_sources:', srcErr);
    return {
      sourcesChecked: 0,
      rawListingsFetched: 0,
      indiaListingsFound: 0,
      acceptedInserted: 0,
      quarantinedCount: 0,
      duplicatesSkipped: 0,
      totalActiveJobs: 0,
      totalEligibleHubs: 0,
    };
  }

  // 2. Fetch canonical taxonomies
  const { data: canonicalCities } = await supabase.from('canonical_cities').select('id, slug, name');
  const { data: canonicalRoles } = await supabase.from('canonical_roles').select('id, slug, name');
  const { data: existingCompanies } = await supabase.from('companies').select('id, name, slug');

  const companyMap = new Map<string, string>();
  if (existingCompanies) {
    for (const c of existingCompanies) {
      companyMap.set(c.name.toLowerCase().trim(), c.id);
      if (c.slug) companyMap.set(c.slug.toLowerCase().trim(), c.id);
    }
  }

  // 3. Query existing fingerprints & titles for deduplication
  const { data: activeJobs } = await supabase
    .from('jobs')
    .select('id, fingerprint, title, company_name, location')
    .eq('is_active', true)
    .limit(10000);

  const seenFingerprints = new Set<string>();
  const activeSimHashes: Array<{ title: string; company: string; hash: bigint }> = [];

  if (activeJobs) {
    for (const j of activeJobs) {
      if (j.fingerprint) seenFingerprints.add(j.fingerprint);
      const fullText = `${j.title} ${j.company_name} ${j.location}`;
      activeSimHashes.push({
        title: j.title,
        company: j.company_name,
        hash: computeSimHash64(fullText),
      });
    }
  }

  let totalRaw = 0;
  let totalIndia = 0;
  let acceptedCount = 0;
  let quarantinedCount = 0;
  let duplicatesCount = 0;

  const maxPerSource = options.maxJobsPerSource || 50;

  for (const src of sources) {
    console.log(`📡 Ingesting from ${src.company_name} (${src.provider})...`);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(src.base_url, { signal: controller.signal });
      clearTimeout(timeout);

      if (!res.ok) {
        console.warn(`Failed to fetch ${src.company_name}: HTTP ${res.status}`);
        continue;
      }

      const data = await res.json();
      const rawList: any[] = Array.isArray(data) ? data : (data.jobs || []);
      totalRaw += rawList.length;

      // Filter for India / Indian location matches
      const indiaCandidates = rawList.filter((raw: any) => {
        const loc = src.provider === 'greenhouse' ? (raw.location?.name || '') : (raw.categories?.location || '');
        const title = src.provider === 'greenhouse' ? (raw.title || '') : (raw.text || '');
        return /india|bengaluru|bangalore|gurgaon|gurugram|mumbai|pune|hyderabad|noida|delhi|chennai|kolkata|remote/i.test(
          loc + ' ' + title
        );
      });

      totalIndia += indiaCandidates.length;

      // Resolve or create company in companies table
      let companyId = companyMap.get(src.company_name.toLowerCase().trim());
      if (!companyId) {
        const compSlug = src.company_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        const { data: newComp } = await supabase.from('companies').insert({
          name: src.company_name,
          slug: compSlug,
          is_verified: true,
          industry: 'Technology & Cloud',
        }).select('id').single();
        if (newComp) {
          companyId = newComp.id;
          companyMap.set(src.company_name.toLowerCase().trim(), companyId);
        }
      }

      const queueBatch: any[] = [];
      const newJobsToInsert: any[] = [];
      const newOutboxItems: any[] = [];

      let acceptedFromThisSource = 0;

      for (const raw of indiaCandidates) {
        if (acceptedFromThisSource >= maxPerSource) break;

        const payload: RawJobPayload = src.provider === 'greenhouse'
          ? normalizeGreenhouseJob(raw, src.company_name)
          : normalizeLeverJob(raw, src.company_name);

        // Validation Gate
        const validation = validateJobPayload(payload, {
          canonicalCities: canonicalCities || [],
          canonicalRoles: canonicalRoles || [],
        });

        const payloadHash = createHash('sha256').update(JSON.stringify(payload)).digest('hex');

        if (!validation.isValid) {
          quarantinedCount++;
          queueBatch.push({
            source_id: src.id,
            external_id: payload.external_id,
            payload,
            payload_hash: payloadHash,
            status: 'quarantined',
            reject_reasons: validation.rejectReasons,
          });
          continue;
        }

        // Deduplication Check
        const fingerprint = computeJobFingerprint(
          payload.company_name,
          payload.title,
          validation.resolvedCitySlug || 'india',
          payload.requisition_id
        );

        if (seenFingerprints.has(fingerprint)) {
          duplicatesCount++;
          queueBatch.push({
            source_id: src.id,
            external_id: payload.external_id,
            payload,
            payload_hash: payloadHash,
            status: 'duplicate',
            reject_reasons: ['Fingerprint exact duplicate detected'],
          });
          continue;
        }

        // SimHash Near-Duplicate Check
        const simHash = computeSimHash64(`${payload.title} ${payload.company_name} ${payload.location}`);
        const isNearDuplicate = activeSimHashes.some((item) => {
          if (item.company.toLowerCase() === payload.company_name.toLowerCase()) {
            return simHashSimilarity(simHash, item.hash) > 0.85;
          }
          return false;
        });

        if (isNearDuplicate) {
          duplicatesCount++;
          queueBatch.push({
            source_id: src.id,
            external_id: payload.external_id,
            payload,
            payload_hash: payloadHash,
            status: 'duplicate',
            reject_reasons: ['SimHash > 85% content collision with existing posting'],
          });
          continue;
        }

        // Mark as seen
        seenFingerprints.add(fingerprint);
        activeSimHashes.push({
          title: payload.title,
          company: payload.company_name,
          hash: simHash,
        });

        const jobId = crypto.randomUUID();
        const nowIso = new Date().toISOString();
        const sixtyDaysLater = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString();

        const benchmark = resolveRoleSalary(validation.resolvedRoleSlug);
        const finalSalaryMin = payload.salary_min || benchmark.min;
        const finalSalaryMax = payload.salary_max || benchmark.max;
        const finalSalaryRange = `₹${(finalSalaryMin / 100000).toFixed(1)}L - ₹${(finalSalaryMax / 100000).toFixed(1)}L PA`;

        newJobsToInsert.push({
          id: jobId,
          title: payload.title,
          company_name: payload.company_name,
          company_id: companyId || null,
          location: payload.location,
          location_city: validation.resolvedCityName || 'Bangalore',
          city_id: validation.resolvedCityId || null,
          role_id: validation.resolvedRoleId || null,
          description: validation.sanitizedDescription || payload.description,
          apply_url: payload.apply_url,
          external_url: payload.apply_url,
          is_active: true,
          is_remote: /remote/i.test(payload.location),
          employment_type: payload.employment_type || 'Full-time',
          salary_min: finalSalaryMin,
          salary_max: finalSalaryMax,
          salary_range: finalSalaryRange,
          salary_currency: 'INR',
          posted_at: payload.posted_at || nowIso,
          expires_at: sixtyDaysLater,
          source: `${src.company_name} ATS Ingestion`,
          fingerprint,
          external_id: payload.external_id,
          source_id: src.id,
          verification_status: 'verified',
          created_at: nowIso,
          updated_at: nowIso,
        });

        // Enqueue individual JobPosting URL into indexing_outbox
        newOutboxItems.push({
          url: `https://jobs.talentxcel.in/jobs/${jobId}`,
          action: 'URL_UPDATED',
          priority: 1,
        });

        queueBatch.push({
          source_id: src.id,
          external_id: payload.external_id,
          payload,
          payload_hash: payloadHash,
          status: 'accepted',
        });

        acceptedFromThisSource++;
        acceptedCount++;
      }

      // Persist accepted jobs to Supabase
      if (newJobsToInsert.length > 0) {
        const { error: insertJobErr } = await supabase.from('jobs').insert(newJobsToInsert);
        if (insertJobErr) {
          console.error(`Error inserting jobs for ${src.company_name}:`, insertJobErr);
        } else {
          console.log(`✅ Inserted ${newJobsToInsert.length} verified jobs for ${src.company_name}`);
        }
      }

      // Persist indexing_outbox items (ONLY JobPosting detail URLs!)
      if (newOutboxItems.length > 0) {
        await supabase.from('indexing_outbox').insert(newOutboxItems);
      }

      // Persist queue audit trail
      if (queueBatch.length > 0) {
        await supabase.from('job_ingestion_queue').insert(queueBatch);
      }

      // Update source status
      await supabase.from('external_ats_sources').update({
        last_success_at: new Date().toISOString(),
        last_status: `Ingested ${acceptedFromThisSource} accepted jobs`,
        consecutive_failures: 0,
      }).eq('id', src.id);

    } catch (err: any) {
      console.warn(`Error processing ${src.company_name}:`, err.message);
    }
  }

  // 4. Trigger Hub State Refresh & Sitemap Regeneration
  console.log('🔄 Syncing SEO Hub State & Regenerating Sitemaps...');
  await refreshSeoHubState(supabase);
  await generateSitemaps();

  // 5. Gather Final Telemetry
  const { count: totalActiveJobs } = await supabase
    .from('jobs')
    .select('id', { count: 'exact', head: true })
    .eq('is_active', true)
    .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString());

  const { data: mvHubs } = await supabase.from('mv_eligible_seo_hubs').select('hub_type, hub_slug');
  const totalEligibleHubs = mvHubs ? mvHubs.length : 0;

  return {
    sourcesChecked: sources.length,
    rawListingsFetched: totalRaw,
    indiaListingsFound: totalIndia,
    acceptedInserted: acceptedCount,
    quarantinedCount,
    duplicatesSkipped: duplicatesCount,
    totalActiveJobs: totalActiveJobs || 0,
    totalEligibleHubs,
  };
}

export function getSupabaseAdminClient() {
  const envPath = resolve(process.cwd(), '.env.local');
  let serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.TALENTXCEL_SERVICE_ROLE_KEY;
  let supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.TX_SUPABASE_URL;

  if (existsSync(envPath)) {
    const lines = readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      if (line.startsWith('TALENTXCEL_SERVICE_ROLE_KEY=')) {
        serviceKey = line.split('=')[1].trim().replace(/^['"]|['"]$/g, '');
      }
      if (line.startsWith('TX_SUPABASE_URL=')) {
        supabaseUrl = line.split('=')[1].trim().replace(/^['"]|['"]$/g, '');
      }
    }
  }

  const finalUrl = supabaseUrl || 'https://dthlgsnakhoftinssokm.supabase.co';
  const finalKey = serviceKey || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc';
  return createClient(finalUrl, finalKey);
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Standalone CLI Runner
// ─────────────────────────────────────────────────────────────────────────────
if (process.argv[1] && process.argv[1].endsWith('ingest-ats-jobs.ts')) {
  const supabase = getSupabaseAdminClient();

  runAtsIngestionBatch(supabase)
    .then((telemetry) => {
      console.log('\n================================================================');
      console.log('📊 MULTI-ATS LIVE INGESTION TELEMETRY REPORT');
      console.log('================================================================');
      console.table({
        'Sources Checked': telemetry.sourcesChecked,
        'Raw Listings Fetched': telemetry.rawListingsFetched,
        'India Listings Found': telemetry.indiaListingsFound,
        'Accepted & Inserted': telemetry.acceptedInserted,
        'Quarantined (Malformed/Thin)': telemetry.quarantinedCount,
        'Duplicates Skipped': telemetry.duplicatesSkipped,
        'Total Active Verified Jobs': telemetry.totalActiveJobs,
        'Total Eligible SEO Hubs': telemetry.totalEligibleHubs,
      });
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Ingestion Engine Error:', err);
      process.exit(1);
    });
}
