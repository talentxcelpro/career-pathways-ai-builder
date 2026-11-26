// scripts/search-intelligence/inventoryMatcher.ts
// Phase 10 Live TalentXcel Inventory Matcher.
// Queries live active jobs, opted-in public_profiles aggregates (zero PII!), companies, courses,
// groups, and static verified catalogs in paginated bounds and writes snapshots into SQLite.

import type { DatabaseSync } from 'node:sqlite';
import { CANONICAL_20_INDUSTRIES } from '../../src/config/jobs/industryTaxonomy';
import { INDIAN_INSTITUTIONS_CATALOG } from '../../src/data/indianInstitutionsCatalog';
import { slugifySegment } from '../../src/lib/seo/demandIntelligence/normalizer';
import { getServerSupabaseClient } from './supabaseSync';

export interface LiveInventoryIndex {
  totalActiveJobs: number;
  remoteJobsCount: number;
  fresherJobsCount: number;
  internshipJobsCount: number;
  govtJobsCount: number;
  publicProfilesCount: number;
  companiesCount: number;
  coursesCount: number;
  communityGroupsCount: number;
  institutionsCatalogCount: number;
  industriesCatalogCount: number;
  jobsByRoleSlug: Map<string, number>;
  jobsByCitySlug: Map<string, number>;
  jobsByRoleCity: Map<string, number>;
  jobsByIndustrySlug: Map<string, number>;
  jobsBySkillSlug: Map<string, number>;
  coursesBySkillSlug: Map<string, number>;
}

const CITY_ALIAS_NORMALIZER: Record<string, string> = {
  bengaluru: 'bangalore',
  bangalore: 'bangalore',
  gurugram: 'gurgaon',
  gurgaon: 'gurgaon',
  'new delhi': 'delhi-ncr',
  delhi: 'delhi-ncr',
  'delhi ncr': 'delhi-ncr',
  hyderabad: 'hyderabad',
  pune: 'pune',
  mumbai: 'mumbai',
  noida: 'noida',
  chennai: 'chennai',
  kolkata: 'kolkata',
  ahmedabad: 'ahmedabad',
  jaipur: 'jaipur',
  kochi: 'kochi',
  chandigarh: 'chandigarh',
  indore: 'indore',
  london: 'london',
  dubai: 'dubai',
  singapore: 'singapore',
  'new york': 'new-york',
  toronto: 'toronto',
  sydney: 'sydney',
};

function normCitySlug(rawCity?: string | null): string | null {
  if (!rawCity) return null;
  const low = rawCity.trim().toLowerCase();
  if (CITY_ALIAS_NORMALIZER[low]) return CITY_ALIAS_NORMALIZER[low];
  const firstToken = low.split(',')[0].trim();
  if (CITY_ALIAS_NORMALIZER[firstToken]) return CITY_ALIAS_NORMALIZER[firstToken];
  return slugifySegment(firstToken) || null;
}

export async function collectAndPersistLiveInventory(db: DatabaseSync): Promise<LiveInventoryIndex> {
  const sb = getServerSupabaseClient();

  const index: LiveInventoryIndex = {
    totalActiveJobs: 0,
    remoteJobsCount: 0,
    fresherJobsCount: 0,
    internshipJobsCount: 0,
    govtJobsCount: 0,
    publicProfilesCount: 0,
    companiesCount: 0,
    coursesCount: 0,
    communityGroupsCount: 0,
    institutionsCatalogCount: INDIAN_INSTITUTIONS_CATALOG.length,
    industriesCatalogCount: CANONICAL_20_INDUSTRIES.length,
    jobsByRoleSlug: new Map(),
    jobsByCitySlug: new Map(),
    jobsByRoleCity: new Map(),
    jobsByIndustrySlug: new Map(),
    jobsBySkillSlug: new Map(),
    coursesBySkillSlug: new Map(),
  };

  // 1. Paginate live active non-expired jobs (bounded page size 1000)
  const roleMap = new Map<string, string>();
  const { data: canonicalRoles } = await sb.from('canonical_roles').select('id, slug').limit(500);
  for (const r of canonicalRoles || []) {
    if (r.id && r.slug) roleMap.set(r.id, r.slug);
  }

  let page = 0;
  const pageSize = 1000;
  const nowIso = new Date().toISOString();
  while (page < 20) {
    const from = page * pageSize;
    const to = from + pageSize - 1;
    const { data: jobs, error } = await sb
      .from('jobs')
      .select('id, title, role_id, location_city, location, is_remote, work_mode, is_fresher_eligible, is_internship, is_government_job, industry, skills_required, is_active, expires_at')
      .eq('is_active', true)
      .range(from, to);

    if (error || !jobs || jobs.length === 0) break;

    for (const j of jobs) {
      if (j.expires_at && j.expires_at < nowIso) continue;
      index.totalActiveJobs += 1;
      if (j.is_remote || String(j.work_mode || '').toLowerCase() === 'remote') index.remoteJobsCount += 1;
      if (j.is_fresher_eligible) index.fresherJobsCount += 1;
      if (j.is_internship) index.internshipJobsCount += 1;
      if (j.is_government_job) index.govtJobsCount += 1;

      const roleSlug = (j.role_id && roleMap.get(j.role_id)) || slugifySegment(String(j.title || '').split(/[-|,(]/)[0] || '');
      const citySlug = normCitySlug(j.location_city || j.location);
      const indSlug = j.industry ? slugifySegment(String(j.industry)) : null;

      if (roleSlug) {
        index.jobsByRoleSlug.set(roleSlug, (index.jobsByRoleSlug.get(roleSlug) || 0) + 1);
      }
      if (citySlug) {
        index.jobsByCitySlug.set(citySlug, (index.jobsByCitySlug.get(citySlug) || 0) + 1);
      }
      if (roleSlug && citySlug) {
        const rc = `${roleSlug}|${citySlug}`;
        index.jobsByRoleCity.set(rc, (index.jobsByRoleCity.get(rc) || 0) + 1);
      }
      if (indSlug) {
        index.jobsByIndustrySlug.set(indSlug, (index.jobsByIndustrySlug.get(indSlug) || 0) + 1);
      }
      if (Array.isArray(j.skills_required)) {
        for (const sk of j.skills_required) {
          const skSlug = slugifySegment(String(sk));
          if (skSlug) index.jobsBySkillSlug.set(skSlug, (index.jobsBySkillSlug.get(skSlug) || 0) + 1);
        }
      }
    }
    if (jobs.length < pageSize) break;
    page += 1;
  }

  // 2. Count opted-in public_profiles ONLY (never profiles PII; aggregate count only)
  const { count: pubProfCount } = await sb
    .from('public_profiles')
    .select('id', { count: 'exact', head: true })
    .eq('is_profile_public', true);
  index.publicProfilesCount = pubProfCount ?? 0;

  // 3. Companies, courses, groups counts
  const [{ count: compCount }, { count: courseCount }, { count: grpCount }] = await Promise.all([
    sb.from('companies').select('id', { count: 'exact', head: true }),
    sb.from('aggregated_courses').select('id', { count: 'exact', head: true }),
    sb.from('groups').select('id', { count: 'exact', head: true }).eq('is_public', true),
  ]);
  index.companiesCount = compCount ?? 0;
  index.coursesCount = courseCount ?? 0;
  index.communityGroupsCount = grpCount ?? 0;

  // 4. Persist compact aggregate snapshot rows in SQLite inventory_snapshots
  const upsertInv = db.prepare(`
    INSERT INTO inventory_snapshots (surface_key, surface_type, slug, jobs_count, profiles_count, courses_count, companies_count, metadata_json, checked_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(surface_key) DO UPDATE SET
      jobs_count = excluded.jobs_count,
      profiles_count = excluded.profiles_count,
      courses_count = excluded.courses_count,
      companies_count = excluded.companies_count,
      metadata_json = excluded.metadata_json,
      checked_at = excluded.checked_at
  `);

  const checkedAt = new Date().toISOString();
  db.exec('BEGIN');
  try {
    upsertInv.run(
      'global:ecosystem',
      'ECOSYSTEM',
      'global',
      index.totalActiveJobs,
      index.publicProfilesCount,
      index.coursesCount,
      index.companiesCount,
      JSON.stringify({
        remoteJobsCount: index.remoteJobsCount,
        fresherJobsCount: index.fresherJobsCount,
        internshipJobsCount: index.internshipJobsCount,
        govtJobsCount: index.govtJobsCount,
        communityGroupsCount: index.communityGroupsCount,
        institutionsCatalogCount: index.institutionsCatalogCount,
        industriesCatalogCount: index.industriesCatalogCount,
      }),
      checkedAt
    );

    for (const [roleSlug, cnt] of index.jobsByRoleSlug.entries()) {
      upsertInv.run(`role:${roleSlug}`, 'ROLE', roleSlug, cnt, index.publicProfilesCount, 0, index.companiesCount, '{}', checkedAt);
    }
    for (const [citySlug, cnt] of index.jobsByCitySlug.entries()) {
      upsertInv.run(`city:${citySlug}`, 'CITY', citySlug, cnt, index.publicProfilesCount, 0, index.companiesCount, '{}', checkedAt);
    }
    for (const [rcKey, cnt] of index.jobsByRoleCity.entries()) {
      upsertInv.run(`role_city:${rcKey}`, 'ROLE_CITY', rcKey, cnt, index.publicProfilesCount, 0, 0, '{}', checkedAt);
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }

  return index;
}
