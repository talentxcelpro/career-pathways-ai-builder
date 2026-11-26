// src/lib/seo/demandIntelligence/pageQualifier.ts
// Unified Page Qualification & Indexation Governor wrapper.
// Reuses SEOPageGovernor & ContentGovernor while enforcing 11 lifecycle states and zero thin-page sprawl.

import { SEOPageGovernor, type GovernorInputMetrics } from '../governor/seoPageGovernor';
import { ContentGovernor } from '../../udx/seo/ContentGovernor';
import type { PageQualificationInput, PageQualificationResult, QualificationStatus } from './types';

function mapPageTypeToGovernorEntity(pageType: string): GovernorInputMetrics['entityType'] {
  if (pageType.includes('ats') || pageType.includes('resume')) return 'ATS';
  if (pageType.includes('salary')) return 'SALARY';
  if (pageType.includes('passport')) return 'PASSPORT';
  if (pageType.includes('college')) return 'COLLEGE';
  if (pageType.includes('skill') || pageType.includes('learning')) return 'SKILL';
  if (pageType.includes('talentscore')) return 'CERTIFICATION';
  if (pageType.includes('job') || pageType.includes('visa') || pageType.includes('hub')) return 'ROLE_HUB';
  return 'CAREER';
}

const UTILITY_OR_EVERGREEN_TYPES = new Set([
  'ats-check',
  'resume-template',
  'talentscore-assessment',
  'career-passport',
  'recruiter-os',
  'employer-brand',
  'salary-benchmark',
]);

/**
 * Evaluates a candidate SEO destination against real DB inventory, content uniqueness,
 * cannibalization checks, SEOPageGovernor, and ContentGovernor rules.
 */
export function evaluatePageQualification(input: PageQualificationInput): PageQualificationResult {
  const isJobAggregation =
    input.pageType.includes('job') ||
    input.pageType.includes('internship') ||
    input.pageType.includes('hub');

  const isUtilitySurface = input.hasUtilityExperience || UTILITY_OR_EVERGREEN_TYPES.has(input.pageType);

  // 1. Anti-cannibalization guard
  if (
    (input.jaccardOverlapRatio !== undefined && input.jaccardOverlapRatio >= 0.72) ||
    (input.canonicalTargetUrl && input.canonicalTargetUrl !== input.pageUrl)
  ) {
    return {
      pageUrl: input.pageUrl,
      pageType: input.pageType,
      primaryKeyword: input.primaryKeyword,
      qualificationStatus: 'REJECTED_THIN',
      indexationScore: 15,
      cannibalizationTarget: input.canonicalTargetUrl || input.competingUrls?.[0] || null,
      reason: 'Blocked for indexation: high keyword overlap / cannibalization against canonical parent surface.',
      sitemapEligible: false,
      robotsMeta: 'noindex, follow',
    };
  }

  // 2. Hard thin-inventory rejection for job aggregation surfaces (zero empty city/role doorways)
  if (isJobAggregation && input.realInventoryCount <= 0) {
    return {
      pageUrl: input.pageUrl,
      pageType: input.pageType,
      primaryKeyword: input.primaryKeyword,
      qualificationStatus: 'REJECTED_THIN',
      indexationScore: 10,
      cannibalizationTarget: null,
      reason: 'REJECTED_THIN: 0 live active jobs in TalentXcel database; doorway page prevented.',
      sitemapEligible: false,
      robotsMeta: 'noindex, follow',
    };
  }

  const effectiveInventory = isUtilitySurface
    ? Math.max(input.realInventoryCount, input.profileAggregateCount || 5, 3)
    : input.realInventoryCount;

  // 3. ContentGovernor check
  const contentGate = ContentGovernor.validateProposedSurface({
    urlPath: input.pageUrl,
    intentId: input.clusterKey,
    verifiedSupplyCount: effectiveInventory,
    hasFirstPartyEvidence: effectiveInventory > 0 || isUtilitySurface,
    isCityTemplate: input.pageType === 'role-city-job' || input.pageType === 'city-employment-hub',
  });

  // 4. SEOPageGovernor evaluation
  const govEntity = mapPageTypeToGovernorEntity(input.pageType);
  const govResult = SEOPageGovernor.evaluate({
    urlPath: input.pageUrl,
    entityType: govEntity,
    searchDemandScore: input.opportunityScore,
    inventoryCount: effectiveInventory,
    minInventoryThreshold: isJobAggregation ? 3 : 1,
    uniqueContentScore: input.uniqueContentScore,
    commercialIntentScore: input.relevanceScore,
    internalLinkAuthority: 50,
    lastUpdatedDaysAgo: 1,
    hasVerifiedUniqueDataset: isUtilitySurface || effectiveInventory >= 3,
  });

  let status: QualificationStatus = 'NOINDEX_MONITOR';
  if (!contentGate.allowed && isJobAggregation) {
    status = input.realInventoryCount > 0 ? 'NOINDEX_MONITOR' : 'REJECTED_THIN';
  } else if (govResult.decision === 'INDEX' && govResult.includeInSitemap) {
    status = 'QUALIFIED_FOR_INDEX';
  } else if (govResult.decision === 'INDEX_REVIEW') {
    status = 'RECOMMENDED';
  } else if (govResult.decision === 'NOINDEX_HOLD') {
    status = 'NOINDEX_MONITOR';
  } else {
    status = 'REJECTED_THIN';
  }

  return {
    pageUrl: input.pageUrl,
    pageType: input.pageType,
    primaryKeyword: input.primaryKeyword,
    qualificationStatus: status,
    indexationScore: Math.round(govResult.seoValueScore * 100) / 100,
    cannibalizationTarget: null,
    reason: contentGate.violations.length > 0 ? `${govResult.reason} | ${contentGate.violations[0]}` : govResult.reason,
    sitemapEligible: status === 'QUALIFIED_FOR_INDEX',
    robotsMeta: status === 'QUALIFIED_FOR_INDEX' ? 'index, follow' : govResult.robotsMeta,
  };
}
