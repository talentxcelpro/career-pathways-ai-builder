// src/lib/seo/demandIntelligence/classifier.ts
// High-throughput multi-dimensional classifier using precompiled phrase lookups.
// Extracts intent, language, geo, industry, role, skill, seniority, work mode, employment type,
// semantic entities, relationships, cluster key, and 25 SEO opportunity archetypes.

import { normalizeKeyword } from './normalizer';
import {
  EMPLOYMENT_TYPE_MODIFIERS,
  GLOBAL_GEO_HUBS,
  GLOBAL_SKILLS_CATALOG,
  SENIORITY_MODIFIERS,
  UNIFIED_30_INDUSTRIES,
  UNIFIED_ROLE_TAXONOMY,
  WORK_MODE_MODIFIERS,
  type GeoHubEntry,
} from './taxonomies';
import { resolveCanonicalDestination } from './destinationMapper';
import type {
  ClassifiedKeyword,
  EmploymentTypeTag,
  EntityExtractionItem,
  SearchIntentType,
  SemanticRelationEdge,
  SeniorityTag,
  SeoOpportunityType,
  SourceAttribution,
  WorkModeTag,
} from './types';

interface MatcherEntry<T> {
  phrase: string;
  regex: RegExp;
  item: T;
}

function escapeRx(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildMatcher<T>(entries: Array<{ phrase: string; item: T }>): MatcherEntry<T>[] {
  const dedup = new Map<string, T>();
  for (const e of entries) {
    const p = e.phrase.trim().toLowerCase();
    if (p && !dedup.has(p)) dedup.set(p, e.item);
  }
  // Longer phrases first so "full stack developer" matches before "developer"
  return Array.from(dedup.entries())
    .sort((a, b) => b[0].length - a[0].length)
    .map(([phrase, item]) => ({
      phrase,
      regex: new RegExp(`(?:^|\\s)${escapeRx(phrase)}(?:$|\\s)`),
      item,
    }));
}

// Fast substring prefilter index: maps normalized tokens -> candidate matcher entries
function buildTokenIndexedMatcher<T>(
  entries: Array<{ phrase: string; item: T }>
): { firstWordMap: Map<string, MatcherEntry<T>[]>; fallback: MatcherEntry<T>[] } {
  const matchers = buildMatcher(entries);
  const firstWordMap = new Map<string, MatcherEntry<T>[]>();
  const fallback: MatcherEntry<T>[] = [];
  for (const m of matchers) {
    const words = m.phrase.split(/\s+/);
    const first = words[0];
    if (first && /^[a-z0-9]/.test(first) && !m.phrase.includes('+') && !m.phrase.includes('/')) {
      const arr = firstWordMap.get(first) || [];
      arr.push(m);
      firstWordMap.set(first, arr);
    } else {
      fallback.push(m);
    }
  }
  return { firstWordMap, fallback };
}

function matchFromIndex<T>(
  normalized: string,
  tokens: string[],
  index: { firstWordMap: Map<string, MatcherEntry<T>[]>; fallback: MatcherEntry<T>[] },
  reverse = false
): T | null {
  const orderedTokens = reverse ? [...tokens].reverse() : tokens;
  for (const tok of orderedTokens) {
    const candidates = index.firstWordMap.get(tok);
    if (!candidates) continue;
    for (const c of candidates) {
      if (normalized === c.phrase || normalized.includes(c.phrase)) {
        if (c.regex.test(normalized)) return c.item;
      }
    }
  }
  for (const c of index.fallback) {
    if (normalized.includes(c.phrase) && c.regex.test(normalized)) {
      return c.item;
    }
  }
  return null;
}

const ROLE_INDEX = buildTokenIndexedMatcher(
  UNIFIED_ROLE_TAXONOMY.flatMap((r) => [
    { phrase: r.canonicalName.toLowerCase(), item: r },
    ...r.aliases.map((a) => ({ phrase: a.toLowerCase(), item: r })),
  ])
);

const SKILL_INDEX = buildTokenIndexedMatcher(
  GLOBAL_SKILLS_CATALOG.flatMap((s) => [
    { phrase: s.name.toLowerCase(), item: s },
    ...s.aliases.map((a) => ({ phrase: a.toLowerCase(), item: s })),
  ])
);

const INDUSTRY_INDEX = buildTokenIndexedMatcher(
  UNIFIED_30_INDUSTRIES.flatMap((ind) =>
    ind.keywords.map((k) => ({ phrase: k.toLowerCase(), item: ind }))
  )
);

const CITY_GEO = GLOBAL_GEO_HUBS.filter((g) => g.regionTier === 'CITY' || g.regionTier === 'METRO');
const COUNTRY_GEO = GLOBAL_GEO_HUBS.filter((g) => g.regionTier === 'COUNTRY' || g.regionTier === 'REMOTE');

const CITY_INDEX = buildTokenIndexedMatcher<GeoHubEntry>(
  CITY_GEO.flatMap((g) => [
    { phrase: g.name.toLowerCase(), item: g },
    ...g.aliases.map((a) => ({ phrase: a.toLowerCase(), item: g })),
  ])
);

const COUNTRY_INDEX = buildTokenIndexedMatcher<GeoHubEntry>(
  COUNTRY_GEO.flatMap((g) => [
    { phrase: g.name.toLowerCase(), item: g },
    ...g.aliases.map((a) => ({ phrase: a.toLowerCase(), item: g })),
  ])
);

interface CompiledTagGroup<T extends string> {
  tag: T;
  checks: Array<{ term: string; regex: RegExp }>;
}

function compileTagGroups<T extends string>(groups: Array<{ tag: T; terms: string[] }>): CompiledTagGroup<T>[] {
  return groups.map((g) => ({
    tag: g.tag,
    checks: g.terms.map((term) => ({
      term,
      regex: new RegExp(`(?:^|\\s)${escapeRx(term)}(?:$|\\s)`),
    })),
  }));
}

const COMPILED_SENIORITY = compileTagGroups(SENIORITY_MODIFIERS);
const COMPILED_WORK_MODE = compileTagGroups(WORK_MODE_MODIFIERS);
const COMPILED_EMPLOYMENT_TYPE = compileTagGroups(EMPLOYMENT_TYPE_MODIFIERS);

function detectTag<T extends string>(normalized: string, groups: CompiledTagGroup<T>[], def: T): T {
  for (const g of groups) {
    for (const c of g.checks) {
      if (normalized.includes(c.term) && c.regex.test(normalized)) {
        return g.tag;
      }
    }
  }
  return def;
}

function detectLanguage(raw: string, normalized: string): string {
  if (/[\u0900-\u097f]/.test(raw)) return 'hi';
  if (/[\u0b80-\u0bff]/.test(raw)) return 'ta';
  if (/\b(beruf|stellenangebote|gehalt|karriere)\b/.test(normalized)) return 'de';
  if (/\b(emploi|salaire|carriere)\b/.test(normalized)) return 'fr';
  return 'en';
}

function detectIntent(
  normalized: string,
  seniority: SeniorityTag,
  workMode: WorkModeTag,
  employmentType: EmploymentTypeTag,
  hasSkill: boolean,
  hasRole: boolean
): SearchIntentType {
  if (/\b(ats|resume check|cv checker|cv score|resume score|resume scanner|resume builder|resume template|cv template|cover letter)\b/.test(normalized)) {
    return 'resume_ats';
  }
  if (/\b(talentscore|talent score|employability score|skill assessment|skills assessment|aptitude test|skill test|coding test)\b/.test(normalized)) {
    return 'assessment_score';
  }
  if (/\b(career passport|verified credential|skill passport|digital portfolio|verified profile)\b/.test(normalized)) {
    return 'career_passport';
  }
  if (
    /\b(hiring platform|hire |candidate sourcing|talent discovery|applicant tracking|employer brand|post a job|recruiter software|recruiter platform)\b/.test(normalized) &&
    !/\b(salary|salaries|interview|jobs)\b/.test(normalized)
  ) {
    return 'recruiter_b2b';
  }
  if (/\b(college|colleges|university|universities|campus placement|placement cell|placement|alumni network|iit|nit|iim)\b/.test(normalized)) {
    return 'college_placement';
  }
  if (/\b(government jobs?|govt jobs?|sarkari|upsc|ssc|psu|railway jobs?|bank po)\b/.test(normalized)) {
    return 'government_jobs';
  }
  if (/\b(salary|salaries|ctc|package|compensation|pay scale|payscale|stipend|wage|hourly rate)\b/.test(normalized)) {
    return 'salary_benchmark';
  }
  if (/\b(interview question|interview prep|interview preparation|mock interview|coding interview)\b/.test(normalized)) {
    return 'interview_prep';
  }
  if (/\b(visa sponsor|visa sponsorship|relocation job|international job|work visa|h1b)\b/.test(normalized)) {
    return 'visa_international';
  }
  if (seniority === 'intern' || employmentType === 'internship' || /\b(internship|internships)\b/.test(normalized)) {
    return 'internship';
  }
  if (seniority === 'fresher' || /\b(fresher|freshers|no experience|0 years)\b/.test(normalized)) {
    return 'fresher_entry';
  }
  if (/\b(career path|career roadmap|career guide|career switch|career change|become a|how to become|transition to|qualifications|scope)\b/.test(normalized)) {
    return 'career_roadmap';
  }
  if (/\b(course|courses|certification|certifications|training|bootcamp|roadmap|learn |skills required)\b/.test(normalized)) {
    return 'skill_learning';
  }
  if (/\b(community|communities|forum|mentor|mentorship|network|networking|peer group)\b/.test(normalized)) {
    return 'community_network';
  }
  if (/\b(company|companies|employer|startup|startups|mnc|reviews)\b/.test(normalized)) {
    return 'company_research';
  }
  if (workMode === 'remote' && /\b(job|jobs|career|careers|hiring|vacancy|vacancies|opening|openings|work from home)\b/.test(normalized)) {
    return 'remote_work';
  }
  if (hasSkill && !hasRole && !/\b(job|jobs|career|careers|vacancy|vacancies|hiring|opening)\b/.test(normalized)) {
    return 'skill_learning';
  }
  return 'job_search';
}

function resolveOpportunityType(
  normalized: string,
  intent: SearchIntentType,
  workMode: WorkModeTag,
  citySlug: string | null,
  roleSlug: string | null,
  skillSlug: string | null,
  industrySlug: string | null
): SeoOpportunityType {
  if (intent === 'resume_ats') {
    return /\b(template|templates|format|sample)\b/.test(normalized) ? 'resume-template' : 'ats-check';
  }
  if (intent === 'assessment_score') return 'talentscore-assessment';
  if (intent === 'career_passport') return 'career-passport';
  if (intent === 'recruiter_b2b') {
    return /\b(talent discovery|find candidates|source candidate)\b/.test(normalized)
      ? 'talent-discovery'
      : /\bemployer brand\b/.test(normalized)
        ? 'employer-brand'
        : 'recruiter-os';
  }
  if (intent === 'company_research') return 'employer-brand';
  if (intent === 'college_placement') return 'college-placement';
  if (intent === 'community_network') return 'community-discussion';
  if (intent === 'salary_benchmark') return 'salary-benchmark';
  if (intent === 'interview_prep') return 'interview-prep';
  if (intent === 'visa_international') return 'global-visa-jobs';
  if (intent === 'internship') return 'internship-role';
  if (intent === 'fresher_entry') return 'fresher-role-job';
  if (intent === 'career_roadmap') {
    if (/\b(switch|change|transition)\b/.test(normalized)) return 'career-transition';
    if (industrySlug && !roleSlug) return 'industry-career-guide';
    return skillSlug && !roleSlug ? 'skill-career' : 'industry-career-guide';
  }
  if (intent === 'skill_learning') {
    return /\b(job|jobs|career|hiring)\b/.test(normalized) ? 'skill-job' : 'learning-path';
  }
  if (workMode === 'remote' || intent === 'remote_work') return 'remote-role-job';
  if (workMode === 'hybrid') return 'hybrid-role-job';
  if (roleSlug && citySlug) return 'role-city-job';
  if (roleSlug) return 'role-country-job';
  if (skillSlug) return 'skill-job';
  if (industrySlug) return 'industry-job';
  if (citySlug) return 'city-employment-hub';
  return 'role-country-job';
}

import type { FastTaxonomyMatcher } from './fastMatcher';

export interface ClassifyOptions {
  source?: string;
  sourceType?: SourceAttribution;
  fastMatcher?: FastTaxonomyMatcher;
}

/**
 * Classifies one raw keyword across all taxonomy dimensions, cluster assignment, canonical route, and entity graph edges.
 */
export function classifyKeyword(rawKeyword: string, options: ClassifyOptions = {}): ClassifiedKeyword | null {
  const norm = normalizeKeyword(rawKeyword);
  if (!norm.isValid) return null;

  const { normalizedKeyword, dedupKey, keywordHash, tokens } = norm;

  const fastMatched = options.fastMatcher ? options.fastMatcher.matchEntities(tokens) : null;
  const roleMatch = matchFromIndex(normalizedKeyword, tokens, ROLE_INDEX);
  const skillMatch = matchFromIndex(normalizedKeyword, tokens, SKILL_INDEX);
  const industryMatch = matchFromIndex(normalizedKeyword, tokens, INDUSTRY_INDEX);
  const cityMatch = matchFromIndex(normalizedKeyword, tokens, CITY_INDEX, true);
  const countryMatch = matchFromIndex(normalizedKeyword, tokens, COUNTRY_INDEX, true);

  const seniority = detectTag(normalizedKeyword, COMPILED_SENIORITY, 'unknown');
  const workMode = detectTag(normalizedKeyword, COMPILED_WORK_MODE, 'unknown');
  const employmentType = detectTag(normalizedKeyword, COMPILED_EMPLOYMENT_TYPE, 'unknown');
  const language = detectLanguage(rawKeyword, normalizedKeyword);

  const jobRoleSlug = roleMatch?.slug || fastMatched?.jobTitle?.slug || null;
  const skillSlug = skillMatch?.slug || fastMatched?.skill?.slug || null;
  const industrySlug =
    industryMatch?.slug ||
    roleMatch?.industrySlug ||
    fastMatched?.jobTitle?.industrySlug ||
    null;
  const citySlug = cityMatch?.slug || fastMatched?.city?.slug || null;
  const regionCode = fastMatched?.region?.regionCode || (fastMatched?.city?.admin1Code ? `${fastMatched.city.countryCode}.${fastMatched.city.admin1Code}` : null);
  const matchedCountryCode =
    cityMatch?.countryCode ||
    fastMatched?.city?.countryCode ||
    countryMatch?.countryCode ||
    fastMatched?.country?.countryCode ||
    fastMatched?.region?.countryCode ||
    null;
  const isExplicitGeo = Boolean(matchedCountryCode || citySlug || regionCode);
  const countryCode = matchedCountryCode || 'GLB';

  const searchIntent = detectIntent(
    normalizedKeyword,
    seniority,
    workMode,
    employmentType,
    Boolean(skillSlug),
    Boolean(jobRoleSlug)
  );
  const opportunityType = resolveOpportunityType(
    normalizedKeyword,
    searchIntent,
    workMode,
    citySlug,
    jobRoleSlug,
    skillSlug,
    industrySlug
  );

  const destination = resolveCanonicalDestination({
    searchIntent,
    opportunityType,
    jobRoleSlug,
    skillSlug,
    industrySlug,
    countryCode,
    citySlug,
    seniority,
    employmentType,
    workMode,
  });

  // Deterministic semantic cluster key grouping intent + primary entity + macro market
  const primaryEntity = jobRoleSlug
    ? `role:${jobRoleSlug}`
    : skillSlug
      ? `skill:${skillSlug}`
      : industrySlug
        ? `industry:${industrySlug}`
        : citySlug
          ? `geo:${citySlug}`
          : `surface:${destination.surfaceName.toLowerCase()}`;

  const geoBucket = workMode === 'remote' ? 'remote' : countryCode.toLowerCase();
  const clusterKey = `${searchIntent}|${primaryEntity}|${geoBucket}`;
  const clusterName = `${primaryEntity.replace(/:/g, ' ')} — ${searchIntent.replace(/_/g, ' ')} (${geoBucket.toUpperCase()})`;
  const clusterType = jobRoleSlug
    ? 'ROLE_INTENT_CLUSTER'
    : skillSlug
      ? 'SKILL_INTENT_CLUSTER'
      : industrySlug
        ? 'INDUSTRY_CLUSTER'
        : 'ECOSYSTEM_FUNNEL_CLUSTER';

  const entities: EntityExtractionItem[] = [];
  const semanticRelations: SemanticRelationEdge[] = [];

  if (roleMatch) {
    entities.push({ type: 'role', value: roleMatch.canonicalName, slug: roleMatch.slug });
  }
  if (skillMatch) {
    entities.push({ type: 'skill', value: skillMatch.name, slug: skillMatch.slug });
    if (roleMatch) {
      semanticRelations.push({ from: roleMatch.slug, to: skillMatch.slug, relation: 'USES_SKILL' });
    }
  }
  if (industryMatch) {
    entities.push({ type: 'industry', value: industryMatch.name, slug: industryMatch.slug });
    if (roleMatch) {
      semanticRelations.push({ from: roleMatch.slug, to: industryMatch.slug, relation: 'IN_INDUSTRY' });
    }
  }
  if (cityMatch) {
    entities.push({ type: 'city', value: cityMatch.name, slug: cityMatch.slug });
    if (roleMatch) {
      semanticRelations.push({ from: roleMatch.slug, to: cityMatch.slug, relation: 'LOCATED_IN' });
    }
  }
  if (countryMatch && countryMatch.countryCode !== 'GLB') {
    entities.push({ type: 'country', value: countryMatch.countryName, slug: countryMatch.slug });
  }
  if (seniority !== 'unknown') {
    entities.push({ type: 'seniority', value: seniority, slug: seniority });
    if (roleMatch) {
      semanticRelations.push({ from: roleMatch.slug, to: seniority, relation: 'HAS_SENIORITY' });
    }
  }
  semanticRelations.push({
    from: primaryEntity,
    to: destination.recommendedDestination,
    relation: 'ROUTES_TO_SURFACE',
  });

  const matchedSignals =
    (roleMatch ? 1 : 0) +
    (skillMatch ? 1 : 0) +
    (industryMatch ? 1 : 0) +
    (cityMatch || countryMatch ? 1 : 0) +
    (seniority !== 'unknown' || workMode !== 'unknown' ? 1 : 0);
  const isClassified = matchedSignals > 0 || searchIntent !== 'job_search';
  const classificationConfidence = Math.min(0.95, Number((0.4 + matchedSignals * 0.14).toFixed(2)));

  return {
    rawKeyword: norm.rawKeyword,
    normalizedKeyword,
    dedupKey,
    keywordHash,
    source: options.source || 'discovery_engine',
    sourceType: options.sourceType || 'DISCOVERY_CORPUS_CSV',
    language,
    countryCode,
    regionCode,
    isExplicitGeo,
    citySlug,
    industrySlug,
    jobRoleSlug,
    skillSlug,
    seniority,
    employmentType,
    workMode,
    searchIntent,
    opportunityType,
    clusterKey,
    clusterName,
    clusterType,
    recommendedDestination: destination.recommendedDestination,
    recommendedCanonicalUrl: destination.recommendedCanonicalUrl,
    isClassified,
    classificationConfidence,
    entities,
    semanticRelations,
  };
}
