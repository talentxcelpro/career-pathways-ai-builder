// src/lib/seo/indexabilityPolicy.ts
// TalentXcel Global Organic Acquisition Operating System (GO-AOS)
// Surface-Specific Indexability Policies (Zero Rigid Universal Rules)

import { AcquisitionSurfaceId } from '@/lib/acquisition-os/types';

export interface IndexabilityPolicy {
  surface: AcquisitionSurfaceId;
  surfaceName: string;
  inventoryThreshold: number;       // Min active listings or entities required
  contentLengthThreshold: number;   // Min word count for substantive landing copy
  entityRequirement: boolean;       // Requires verified DB entity node
  demandRequirement: number;        // Min monthly GSC search impressions
  qualityScoreThreshold: number;    // Min composite quality score (0 to 100)
  prohibitsListingJobPostingSchema: boolean; // Must NEVER emit JobPosting on listing hubs
}

export const INDEXABILITY_POLICIES: Record<AcquisitionSurfaceId, IndexabilityPolicy> = {
  JOBS: {
    surface: 'JOBS',
    surfaceName: 'Jobs & High-Intent Openings',
    inventoryThreshold: 3, // Real requirement for job matrices
    contentLengthThreshold: 300,
    entityRequirement: true,
    demandRequirement: 100,
    qualityScoreThreshold: 50,
    prohibitsListingJobPostingSchema: true,
  },
  COMPANIES: {
    surface: 'COMPANIES',
    surfaceName: 'Company Profiles & Hiring Intelligence',
    inventoryThreshold: 1, // Single legitimate company entity is valid
    contentLengthThreshold: 400,
    entityRequirement: true,
    demandRequirement: 50,
    qualityScoreThreshold: 60,
    prohibitsListingJobPostingSchema: true,
  },
  COLLEGES: {
    surface: 'COLLEGES',
    surfaceName: 'Colleges & Campus Placement OS',
    inventoryThreshold: 1, // Single accredited campus institution is valid
    contentLengthThreshold: 500,
    entityRequirement: true,
    demandRequirement: 80,
    qualityScoreThreshold: 65,
    prohibitsListingJobPostingSchema: true,
  },
  RESUME_BUILDER: {
    surface: 'RESUME_BUILDER',
    surfaceName: 'Resume Builder & ATS Scanner',
    inventoryThreshold: 0, // Tool is self-contained utility, zero listings needed
    contentLengthThreshold: 800,
    entityRequirement: false,
    demandRequirement: 150,
    qualityScoreThreshold: 70,
    prohibitsListingJobPostingSchema: true,
  },
  CAREER_TOOLS: {
    surface: 'CAREER_TOOLS',
    surfaceName: 'Salary Calculators & Interview Tools',
    inventoryThreshold: 0, // Free utility calculator, zero listings needed
    contentLengthThreshold: 500,
    entityRequirement: false,
    demandRequirement: 100,
    qualityScoreThreshold: 60,
    prohibitsListingJobPostingSchema: true,
  },
  LEARNING: {
    surface: 'LEARNING',
    surfaceName: 'Skill Courses & Certifications',
    inventoryThreshold: 1, // At least 1 structured course curriculum
    contentLengthThreshold: 800,
    entityRequirement: true,
    demandRequirement: 80,
    qualityScoreThreshold: 60,
    prohibitsListingJobPostingSchema: true,
  },
  SERVICES: {
    surface: 'SERVICES',
    surfaceName: 'Executive Resume & Consulting Services',
    inventoryThreshold: 0,
    contentLengthThreshold: 1000,
    entityRequirement: false,
    demandRequirement: 60,
    qualityScoreThreshold: 75,
    prohibitsListingJobPostingSchema: true,
  },
  CAREER_MAP: {
    surface: 'CAREER_MAP',
    surfaceName: 'Visual Career Progression Pathways',
    inventoryThreshold: 0,
    contentLengthThreshold: 1200, // Substantive roadmap content required
    entityRequirement: true,
    demandRequirement: 80,
    qualityScoreThreshold: 70,
    prohibitsListingJobPostingSchema: true,
  },
  CAREER_PASSPORT: {
    surface: 'CAREER_PASSPORT',
    surfaceName: 'Career Passport Living Identity',
    inventoryThreshold: 0,
    contentLengthThreshold: 600,
    entityRequirement: false,
    demandRequirement: 50,
    qualityScoreThreshold: 60,
    prohibitsListingJobPostingSchema: true,
  },
  NETWORK: {
    surface: 'NETWORK',
    surfaceName: 'Professional Verified Network',
    inventoryThreshold: 3, // At least 3 verified member nodes in directory
    contentLengthThreshold: 300,
    entityRequirement: true,
    demandRequirement: 80,
    qualityScoreThreshold: 50,
    prohibitsListingJobPostingSchema: true,
  },
  EMPLOYER: {
    surface: 'EMPLOYER',
    surfaceName: 'Employer Solutions & Multi-Location Hiring',
    inventoryThreshold: 0, // Direct B2B intake landing page
    contentLengthThreshold: 800,
    entityRequirement: false,
    demandRequirement: 100,
    qualityScoreThreshold: 70,
    prohibitsListingJobPostingSchema: true,
  },
  RANKINGS: {
    surface: 'RANKINGS',
    surfaceName: 'Claim #1 & Leaderboards',
    inventoryThreshold: 3, // Requires 3+ ranked participants
    contentLengthThreshold: 500,
    entityRequirement: true,
    demandRequirement: 100,
    qualityScoreThreshold: 65,
    prohibitsListingJobPostingSchema: true,
  },
};

/**
 * Evaluates whether a candidate landing page meets its specific surface indexability gate
 */
export function evaluateSurfaceIndexability(params: {
  surface: AcquisitionSurfaceId;
  activeInventoryCount: number;
  wordCount: number;
  hasVerifiedEntity: boolean;
  monthlyImpressions: number;
  qualityScore: number;
}): {
  isIndexable: boolean;
  reason: string;
  policy: IndexabilityPolicy;
} {
  const policy = INDEXABILITY_POLICIES[params.surface];

  // 1. Inventory check
  if (params.activeInventoryCount < policy.inventoryThreshold) {
    return {
      isIndexable: false,
      reason: `Insufficient inventory: found ${params.activeInventoryCount}, requires ${policy.inventoryThreshold} for ${params.surface}`,
      policy,
    };
  }

  // 2. Entity check
  if (policy.entityRequirement && !params.hasVerifiedEntity && params.activeInventoryCount === 0) {
    return {
      isIndexable: false,
      reason: `Surface ${params.surface} strictly requires a verified canonical database entity node`,
      policy,
    };
  }

  // 3. Substantive content length check
  if (params.wordCount < policy.contentLengthThreshold) {
    return {
      isIndexable: false,
      reason: `Thin content detected: ${params.wordCount} words is below ${policy.contentLengthThreshold} substantive threshold`,
      policy,
    };
  }

  // 4. Quality score check
  if (params.qualityScore < policy.qualityScoreThreshold) {
    return {
      isIndexable: false,
      reason: `Quality score ${params.qualityScore}/100 is below ${policy.qualityScoreThreshold} threshold`,
      policy,
    };
  }

  return {
    isIndexable: true,
    reason: `Passed all surface-specific indexability criteria for ${params.surface}`,
    policy,
  };
}
