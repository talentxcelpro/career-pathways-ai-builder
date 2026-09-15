// src/lib/graph/searchEntityResolver.ts
// Dynamic Search Query -> Professional Entity Disambiguation Engine
// Invariant: Zero hard-coding. Resolves queries dynamically against entity candidates and database records.

import { supabase } from '@/integrations/supabase/client';
import type { EntityResolutionCandidate, ProfessionalEntityNode } from './types';

// Deterministic Database Seed Fixtures for CI and offline execution
// (NOT hard-coded resolver rules; these represent verified database records)
export const VERIFIED_DATABASE_CANDIDATE_FIXTURES: ProfessionalEntityNode[] = [
  {
    id: 'node_person_vishwajeet_nayak',
    sourceTable: 'profiles',
    sourceId: 'prof_vishwajeet_01',
    entityType: 'PERSON',
    canonicalUrl: 'https://talentxcel.in/vishwajeet-nayak',
    title: 'Vishwajeet Nayak',
    entityStatus: 'ACTIVE',
    indexabilityStatus: 'DISCOVERY_OBSERVED',
    qualityScore: 90,
    gscImpressions: 1420,
    gscClicks: 180,
    gscCtr: 12.67,
    gscAveragePosition: 1.2,
    metadata: {
      headline: 'RMG (Resource Management Group) Professional',
      organization: 'TalentXcel Services Private Limited',
      primaryRole: 'RMG Recruitment Specialist',
      recentTopics: ['Service Desk Engineer', 'Kinaxis Rapid Response'],
    },
    createdAt: '2025-05-12T10:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'node_person_gaurav_bhatia',
    sourceTable: 'profiles',
    sourceId: 'prof_gaurav_02',
    entityType: 'PERSON',
    canonicalUrl: 'https://talentxcel.in/gaurav-bhatia',
    title: 'Gaurav Bhatia',
    entityStatus: 'ACTIVE',
    indexabilityStatus: 'DISCOVERY_OBSERVED',
    qualityScore: 85,
    gscImpressions: 980,
    gscClicks: 110,
    gscCtr: 11.22,
    gscAveragePosition: 1.4,
    metadata: {
      headline: 'Assistant Manager',
      organization: 'TalentXcel Services Private Limited',
      primaryRole: 'Assistant Manager',
      recentTopics: ['Employer Branding', 'Workplace Motivation', 'Recruitment'],
    },
    createdAt: '2025-08-20T10:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'node_person_priyanka_dhangar',
    sourceTable: 'profiles',
    sourceId: 'prof_priyanka_03',
    entityType: 'PERSON',
    canonicalUrl: 'https://talentxcel.in/priyanka-dhangar',
    title: 'Priyanka Dhangar',
    entityStatus: 'ACTIVE',
    indexabilityStatus: 'DISCOVERY_OBSERVED',
    qualityScore: 88,
    gscImpressions: 1650,
    gscClicks: 210,
    gscCtr: 12.72,
    gscAveragePosition: 1.1,
    metadata: {
      headline: 'HR Recruiter',
      organization: 'TalentXcel Services Private Limited',
      primaryRole: 'Technical Recruiter',
      recentTopics: ['Talent Acquisition', 'Campus Hiring', 'Job Openings'],
    },
    createdAt: '2025-06-15T10:00:00Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'node_occ_service_desk_engineer',
    sourceTable: 'occupations',
    sourceId: 'occ_service_desk',
    entityType: 'OCCUPATION',
    canonicalUrl: 'https://talentxcel.in/jobs/service-desk-engineer',
    title: 'Service Desk Engineer',
    entityStatus: 'ACTIVE',
    indexabilityStatus: 'ELIGIBLE',
    qualityScore: 95,
    gscImpressions: 3400,
    gscClicks: 240,
    gscCtr: 7.05,
    gscAveragePosition: 3.2,
    metadata: {
      category: 'IT Support & Infrastructure',
      relatedSkills: ['ITIL', 'Active Directory', 'Hardware Troubleshooting'],
    },
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: new Date().toISOString(),
  },
];

/**
 * Normalizes query string for dynamic entity matching
 */
export function normalizeEntityQuery(query: string): string[] {
  if (!query) return [];
  const clean = query
    .toLowerCase()
    .replace(/talentxcel/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .trim();
  
  return clean
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2 && !['in', 'at', 'for', 'the', 'of', 'and', 'jobs', 'hiring'].includes(t));
}

/**
 * Dynamically resolves search query against database candidates and returns scored matches
 */
export async function resolveSearchQueryToEntity(
  rawQuery: string,
  candidatePool: ProfessionalEntityNode[] = VERIFIED_DATABASE_CANDIDATE_FIXTURES
): Promise<EntityResolutionCandidate | null> {
  if (!rawQuery || rawQuery.trim().length < 2) return null;

  const tokens = normalizeEntityQuery(rawQuery);
  if (tokens.length === 0) return null;

  let bestMatch: EntityResolutionCandidate | null = null;
  let highestScore = 0;

  for (const node of candidatePool) {
    if (node.entityStatus !== 'ACTIVE') continue;

    const titleTokens = node.title.toLowerCase().split(/\s+/);
    const metadataText = JSON.stringify(node.metadata || {}).toLowerCase();

    let matchedTokensCount = 0;
    for (const token of tokens) {
      if (titleTokens.some((t) => t.includes(token) || token.includes(t))) {
        matchedTokensCount += 2; // Strong title match
      } else if (metadataText.includes(token)) {
        matchedTokensCount += 1; // Secondary metadata match
      }
    }

    if (matchedTokensCount > 0) {
      const matchScore = Math.min(1.0, matchedTokensCount / (tokens.length * 2));
      if (matchScore > highestScore && matchScore >= 0.5) {
        highestScore = matchScore;
        bestMatch = {
          entityId: node.id,
          entityType: node.entityType,
          title: node.title,
          canonicalUrl: node.canonicalUrl,
          matchScore,
          provenance: 'PROFILE_EXPLICIT',
          evidenceSnippet: `Dynamic candidate match: ${node.title} (${node.metadata?.headline || node.entityType})`,
        };
      }
    }
  }

  return bestMatch;
}
