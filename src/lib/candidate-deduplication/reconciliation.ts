/**
 * Candidate Identity Reconciliation & Safe Merge Engine
 */

import {
  CandidateComparisonInput,
  evaluateDuplicateConfidence,
  DuplicateEvaluationResult,
  DuplicateClassification
} from './scoring';

export interface DuplicateGroup {
  groupId: string;
  canonicalCandidate: any;
  duplicateCandidates: any[];
  allCandidates: any[];
  highestScore: number;
  classification: DuplicateClassification;
  signals: string[];
  status: 'PENDING_REVIEW' | 'CONFIRMED' | 'REJECTED' | 'MERGED';
}

export interface MergePreview {
  targetCanonicalId: string;
  sourceCandidateIds: string[];
  canonicalName: string;
  mergedEmail: string | null;
  mergedPhone: string | null;
  mergedTitle: string | null;
  mergedSkills: string[];
  mergedResumeUrl: string | null;
  historicalResumeUrls: string[];
  totalApplicationsPreserved: number;
  auditTrail: {
    mergedAt: string;
    reason: string;
    sourceIds: string[];
  };
}

/**
 * Determine the canonical record from a cluster of candidate duplicates
 * Policy:
 * 1. Has non-empty email
 * 2. Has valid resume_url
 * 3. Most complete profile (most skills and attributes)
 * 4. Latest updated_at timestamp
 */
export function selectCanonicalCandidate(candidates: any[]): any {
  if (!candidates || candidates.length === 0) return null;
  if (candidates.length === 1) return candidates[0];

  return [...candidates].sort((a, b) => {
    // 1. Has valid email score
    const hasEmailA = !!(a.email && a.email.trim() && !a.email.includes('.temp'));
    const hasEmailB = !!(b.email && b.email.trim() && !b.email.includes('.temp'));
    if (hasEmailA !== hasEmailB) return hasEmailA ? -1 : 1;

    // 2. Has resume_url score
    const hasResumeA = !!(a.resume_url && a.resume_url.trim());
    const hasResumeB = !!(b.resume_url && b.resume_url.trim());
    if (hasResumeA !== hasResumeB) return hasResumeA ? -1 : 1;

    // 3. Profile completeness (count non-null key fields + skills count)
    const skillsCountA = Array.isArray(a.skills) ? a.skills.length : 0;
    const skillsCountB = Array.isArray(b.skills) ? b.skills.length : 0;
    if (skillsCountA !== skillsCountB) return skillsCountB - skillsCountA;

    // 4. Clean name (doesn't have role appended or generic "cv" placeholder)
    const nameA = (a.name || a.full_name || '').toLowerCase();
    const nameB = (b.name || b.full_name || '').toLowerCase();
    const isGenericA = nameA.startsWith('cv ') || nameA.startsWith('candidate ');
    const isGenericB = nameB.startsWith('cv ') || nameB.startsWith('candidate ');
    if (isGenericA !== isGenericB) return isGenericA ? 1 : -1;

    // 5. Most recent updated_at or created_at
    const timeA = new Date(a.updated_at || a.created_at || 0).getTime();
    const timeB = new Date(b.updated_at || b.created_at || 0).getTime();
    return timeB - timeA;
  })[0];
}

/**
 * Clusters a collection of candidates into duplicate groups
 */
export function clusterDuplicateCandidates(candidates: any[]): {
  groups: DuplicateGroup[];
  uniqueCandidatesCount: number;
  duplicateRecordsCount: number;
} {
  const visited = new Set<string>();
  const groups: DuplicateGroup[] = [];

  for (let i = 0; i < candidates.length; i++) {
    const candA = candidates[i];
    if (visited.has(candA.id)) continue;

    const matchedCluster: any[] = [candA];
    let highestGroupScore = 0;
    let groupClassification: DuplicateClassification = 'UNIQUE';
    const groupSignals = new Set<string>();

    for (let j = i + 1; j < candidates.length; j++) {
      const candB = candidates[j];
      if (visited.has(candB.id)) continue;

      const evalResult = evaluateDuplicateConfidence(candA, candB);
      if (evalResult.isDuplicate) {
        matchedCluster.push(candB);
        visited.add(candB.id);

        if (evalResult.totalScore > highestGroupScore) {
          highestGroupScore = evalResult.totalScore;
          groupClassification = evalResult.classification;
        }

        evalResult.signals.forEach(s => groupSignals.add(s.evidence));
      }
    }

    if (matchedCluster.length > 1) {
      visited.add(candA.id);
      const canonical = selectCanonicalCandidate(matchedCluster);
      const duplicates = matchedCluster.filter(c => c.id !== canonical.id);

      groups.push({
        groupId: `dup-group-${canonical.id.slice(0, 8)}`,
        canonicalCandidate: canonical,
        duplicateCandidates: duplicates,
        allCandidates: matchedCluster,
        highestScore: highestGroupScore,
        classification: groupClassification,
        signals: Array.from(groupSignals),
        status: groupClassification === 'CONFIRMED_DUPLICATE' ? 'CONFIRMED' : 'PENDING_REVIEW'
      });
    }
  }

  const duplicateRecordsCount = groups.reduce((acc, g) => acc + g.duplicateCandidates.length, 0);
  const uniqueCandidatesCount = candidates.length - duplicateRecordsCount;

  return {
    groups,
    uniqueCandidatesCount,
    duplicateRecordsCount
  };
}

/**
 * Builds a safe merge preview without executing database mutations
 */
export function buildMergePreview(canonical: any, duplicates: any[]): MergePreview {
  const allInGroup = [canonical, ...duplicates];

  // Merge skills union
  const skillsSet = new Set<string>();
  allInGroup.forEach(c => {
    if (Array.isArray(c.skills)) {
      c.skills.forEach((s: string) => {
        if (s && typeof s === 'string') skillsSet.add(s.trim());
      });
    }
  });

  // Collect historical resume URLs
  const resumesSet = new Set<string>();
  allInGroup.forEach(c => {
    if (c.resume_url && typeof c.resume_url === 'string') {
      resumesSet.add(c.resume_url.trim());
    }
  });

  const sourceIds = duplicates.map(d => d.id);

  return {
    targetCanonicalId: canonical.id,
    sourceCandidateIds: sourceIds,
    canonicalName: canonical.name || canonical.full_name || 'Candidate',
    mergedEmail: canonical.email || duplicates.find(d => d.email)?.email || null,
    mergedPhone: canonical.phone || duplicates.find(d => d.phone)?.phone || null,
    mergedTitle: canonical.title || duplicates.find(d => d.title)?.title || null,
    mergedSkills: Array.from(skillsSet),
    mergedResumeUrl: canonical.resume_url || Array.from(resumesSet)[0] || null,
    historicalResumeUrls: Array.from(resumesSet),
    totalApplicationsPreserved: duplicates.length,
    auditTrail: {
      mergedAt: new Date().toISOString(),
      reason: `Consolidated ${duplicates.length} duplicate records into canonical profile ${canonical.id}`,
      sourceIds
    }
  };
}
