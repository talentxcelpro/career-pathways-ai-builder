// src/lib/seo/searchUniverse/searchCoverageScorer.ts
// Opportunity and Conversion Value Scorer for Search Queries

export interface QueryScoreResult {
  commercialValue: 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';
  conversionPotential: 'HIGH' | 'MEDIUM' | 'LOW';
  priorityTier: 1 | 2 | 3 | 4;
}

export function scoreSearchOpportunity(
  intent: string,
  userType: string,
  hasCommercialModifier: boolean,
  isMajorCity: boolean
): QueryScoreResult {
  if (intent === 'EMPLOYER' || (intent === 'COMMERCIAL' && hasCommercialModifier)) {
    return {
      commercialValue: 'HIGH',
      conversionPotential: 'HIGH',
      priorityTier: 1,
    };
  }

  if (intent === 'TRANSACTIONAL' || (intent === 'JOB_SEARCH' && isMajorCity)) {
    return {
      commercialValue: 'HIGH',
      conversionPotential: 'HIGH',
      priorityTier: 1,
    };
  }

  if (intent === 'JOB_SEARCH' || intent === 'EDUCATION') {
    return {
      commercialValue: 'MEDIUM',
      conversionPotential: 'MEDIUM',
      priorityTier: 2,
    };
  }

  if (intent === 'CAREER' || intent === 'SALARY') {
    return {
      commercialValue: 'MEDIUM',
      conversionPotential: 'LOW',
      priorityTier: 3,
    };
  }

  return {
    commercialValue: 'INFORMATIONAL',
    conversionPotential: 'LOW',
    priorityTier: 4,
  };
}
