// src/lib/seo/searchUniverse/searchDemandIngestionEngine.ts
/**
 * TalentXcel Continuous Search Demand Ingestion Engine
 *
 * Ingests, normalizes, extracts entities, and classifies search demand signals from:
 * 1. Google Search Console (GSC impressions, clicks, ranking queries)
 * 2. TalentXcel Internal Search Logs & Candidate query strings
 * 3. Market SERP Observations & Competitor Keyword Intelligence
 * 4. First-Party Platform Inventory Telemetry (Jobs, Resumes, Colleges, Courses)
 */

import { GlobalLocationHierarchy, LocationHierarchyNode } from './globalLocationHierarchy';
import { EntityTypeId, EntityTaxonomyRegistry } from './entityTaxonomyRegistry';
import { IntentTypeId, INTENT_TAXONOMY_REGISTRY } from './intentTaxonomyRegistry';

export interface RawDemandSignal {
  sourceType: 'GSC' | 'GOOGLE_TRENDS' | 'BING' | 'INTERNAL_SEARCH' | 'SERP_OBSERVATION' | 'PLATFORM_TELEMETRY';
  rawQuery: string;
  impressions?: number;
  clicks?: number;
  averagePosition?: number;
  countryCode?: string;
  landingUrl?: string;
  timestamp?: string;
}

export interface ExtractedEntityMatch {
  entityType: EntityTypeId;
  canonicalSlug: string;
  matchedToken: string;
  confidence: number;
}

export interface IngestedSearchDemandOpportunity {
  rawQuery: string;
  normalizedQuery: string;
  detectedIntent: IntentTypeId;
  detectedEntities: ExtractedEntityMatch[];
  primaryRole?: string;
  primaryLocation?: LocationHierarchyNode;
  searchDemandScore: number;
  sourceWeight: number;
  recommendedUrl: string;
  isActionable: boolean;
}

// Canonical matching lexicons
const ROLE_KEYWORDS: Record<string, string> = {
  'software engineer': 'software-engineer',
  'software developer': 'software-engineer',
  'sde': 'software-engineer',
  'full stack developer': 'full-stack-developer',
  'full stack': 'full-stack-developer',
  'frontend developer': 'frontend-developer',
  'backend developer': 'backend-developer',
  'react developer': 'react-developer',
  'python developer': 'python-developer',
  'java developer': 'java-developer',
  'data scientist': 'data-scientist',
  'data analyst': 'data-analyst',
  'product manager': 'product-manager',
  'devops engineer': 'devops-engineer',
  'qa engineer': 'qa-automation-engineer',
  'hr manager': 'hr-manager',
  'recruiter': 'talent-acquisition-specialist',
};

const SKILL_KEYWORDS: Record<string, string> = {
  'python': 'python',
  'react': 'react',
  'node': 'node-js',
  'nodejs': 'node-js',
  'aws': 'aws',
  'docker': 'docker',
  'kubernetes': 'kubernetes',
  'sql': 'sql',
  'machine learning': 'machine-learning',
  'system design': 'system-design',
};

const INTENT_INDICATORS: Array<{ intent: IntentTypeId; tokens: string[] }> = [
  { intent: 'ATS_CHECKER', tokens: ['ats', 'ats check', 'ats score', 'ats scanner', 'ats checker', 'ats resume'] },
  { intent: 'PLACEMENTS', tokens: ['placement report', 'average ctc', 'placements', 'highest package', 'placement statistics'] },
  { intent: 'RESUME', tokens: ['resume builder', 'resume template', 'resume format', 'cv maker', 'resume cv'] },
  { intent: 'SALARY', tokens: ['salary', 'ctc', 'compensation', 'package', 'pay scale', 'average pay'] },
  { intent: 'INTERVIEWS', tokens: ['interview questions', 'interview questions and answers', 'interview prep', 'technical interview'] },
  { intent: 'COURSES', tokens: ['course', 'classes', 'certification', 'training', 'learn online', 'bootcamp'] },
  { intent: 'COLLEGES', tokens: ['college', 'university', 'campus', 'institute of technology', 'iit', 'bits', 'iim'] },
  { intent: 'FRESHER', tokens: ['fresher', 'freshers', 'entry level', '0-1 years', 'campus hiring'] },
  { intent: 'REMOTE', tokens: ['remote', 'wfh', 'work from home', 'telecommute', 'hybrid'] },
  { intent: 'GOVT_JOBS', tokens: ['sarkari', 'govt job', 'government job', 'upsc', 'ssc', 'rrb', 'ibps', 'admit card', 'notification'] },
  { intent: 'JOBS', tokens: ['jobs', 'job', 'vacancies', 'hiring', 'opening', 'openings', 'careers'] },
];

const STOP_WORDS = new Set(['in', 'at', 'to', 'for', 'with', 'by', 'of', 'and', 'or', 'the', 'a', 'an', 'free']);

export class SearchDemandIngestionEngine {
  /**
   * Process a batch of raw demand signals from GSC, internal search, or competitors
   */
  static processDemandBatch(signals: RawDemandSignal[]): IngestedSearchDemandOpportunity[] {
    return signals.map(signal => this.processSingleSignal(signal));
  }

  /**
   * Normalize and classify a single search demand signal
   */
  static processSingleSignal(signal: RawDemandSignal): IngestedSearchDemandOpportunity {
    const raw = signal.rawQuery.toLowerCase().trim();
    const cleanTokens = raw.replace(/[^\w\s-]/g, ' ').split(/\s+/).filter(Boolean);

    // 1. Detect Intent
    let detectedIntent: IntentTypeId = 'JOBS';
    for (const item of INTENT_INDICATORS) {
      if (item.tokens.some(t => raw.includes(t))) {
        detectedIntent = item.intent;
        break;
      }
    }

    // 2. Extract Entities
    const detectedEntities: ExtractedEntityMatch[] = [];

    // Role extraction
    let matchedRole: string | undefined = undefined;
    for (const [phrase, slug] of Object.entries(ROLE_KEYWORDS)) {
      if (raw.includes(phrase)) {
        matchedRole = slug;
        detectedEntities.push({
          entityType: 'ROLE',
          canonicalSlug: slug,
          matchedToken: phrase,
          confidence: 0.95,
        });
        break;
      }
    }

    // Skill extraction
    for (const [skillToken, skillSlug] of Object.entries(SKILL_KEYWORDS)) {
      if (cleanTokens.includes(skillToken) || raw.includes(skillToken)) {
        detectedEntities.push({
          entityType: 'SKILL',
          canonicalSlug: skillSlug,
          matchedToken: skillToken,
          confidence: 0.9,
        });
      }
    }

    // Location extraction via GlobalLocationHierarchy (skipping English stop words like 'in')
    let matchedLocation: LocationHierarchyNode | undefined = undefined;
    for (const token of cleanTokens) {
      if (STOP_WORDS.has(token)) continue;
      const loc = GlobalLocationHierarchy.resolveLocation(token);
      if (loc) {
        matchedLocation = loc;
        detectedEntities.push({
          entityType: loc.type === 'COUNTRY' ? 'COUNTRY' : loc.type === 'STATE' ? 'STATE' : 'CITY',
          canonicalSlug: loc.slug,
          matchedToken: token,
          confidence: 0.95,
        });
        break;
      }
    }

    // Also check multi-word locations (e.g. 'san francisco', 'new york', 'delhi ncr')
    if (!matchedLocation) {
      const multiWordCandidates = ['san francisco', 'new york', 'delhi ncr', 'bay area', 'greater london', 'abu dhabi'];
      for (const cand of multiWordCandidates) {
        if (raw.includes(cand)) {
          const loc = GlobalLocationHierarchy.resolveLocation(cand);
          if (loc) {
            matchedLocation = loc;
            detectedEntities.push({
              entityType: 'CITY',
              canonicalSlug: loc.slug,
              matchedToken: cand,
              confidence: 0.98,
            });
            break;
          }
        }
      }
    }

    // 3. Compute Normalized Canonical Query
    const normalizedParts: string[] = [];
    if (matchedRole) normalizedParts.push(matchedRole);
    normalizedParts.push(detectedIntent.toLowerCase());
    if (matchedLocation) normalizedParts.push(matchedLocation.slug);
    const normalizedQuery = normalizedParts.join('-');

    // 4. Calculate Search Demand Score (0 - 100)
    let searchDemandScore = 50;
    if (signal.sourceType === 'GSC') {
      const imps = signal.impressions || 10;
      const clicks = signal.clicks || 0;
      searchDemandScore = Math.min(100, Math.floor(Math.log10(imps + 1) * 25) + clicks * 2);
    } else if (signal.sourceType === 'INTERNAL_SEARCH') {
      searchDemandScore = 75; // Verified first-party intent
    }

    // 5. Derive Recommended URL
    let recommendedUrl = `/jobs`;
    if (detectedIntent === 'JOBS' && matchedRole && matchedLocation) {
      recommendedUrl = `/jobs/${matchedRole}/${matchedLocation.slug}`;
    } else if (detectedIntent === 'SALARY' && matchedRole && matchedLocation) {
      recommendedUrl = `/salary/${matchedRole}/${matchedLocation.slug}`;
    } else if (detectedIntent === 'ATS_CHECKER' && matchedRole) {
      recommendedUrl = `/resume/ats-check/${matchedRole}`;
    } else if (detectedIntent === 'RESUME' && matchedRole) {
      recommendedUrl = `/resume-templates/${matchedRole}`;
    } else if (detectedIntent === 'INTERVIEWS' && matchedRole) {
      recommendedUrl = `/interview-questions/${matchedRole}`;
    } else if (detectedIntent === 'FRESHER' && matchedRole) {
      recommendedUrl = `/jobs/${matchedRole}/freshers`;
    }

    const isActionable = Boolean(matchedRole || matchedLocation || detectedEntities.length > 0);

    return {
      rawQuery: signal.rawQuery,
      normalizedQuery,
      detectedIntent,
      detectedEntities,
      primaryRole: matchedRole,
      primaryLocation: matchedLocation,
      searchDemandScore,
      sourceWeight: signal.sourceType === 'GSC' ? 1.0 : 0.8,
      recommendedUrl,
      isActionable,
    };
  }
}
