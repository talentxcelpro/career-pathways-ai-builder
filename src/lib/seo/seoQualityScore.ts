// src/lib/seo/seoQualityScore.ts
// TALENTXCEL INTERNAL SEO QUALITY SCORE (0-100 Engineering Quality & Intent Evaluation Engine)
// NOTE: This score is an internal engineering quality metric and does NOT simulate Google's proprietary ranking algorithm.

export type InternalQualityStatus = 'INDEX' | 'REVIEW' | 'NOINDEX' | 'CONSOLIDATE';

export interface SeoScoreBreakdown {
  technicalSeo: number; // Max 20
  contentQuality: number; // Max 20
  searchIntentMatch: number; // Max 15
  internalLinking: number; // Max 15
  metadataCompleteness: number; // Max 10
  entityRelevance: number; // Max 10
  structuredData: number; // Max 5
  conversionRelevance: number; // Max 5
  totalScore: number; // Max 100
  grade: 'A+' | 'A' | 'B' | 'C' | 'NOINDEX';
  qualityStatus: InternalQualityStatus;
  actionRecommendation: 'KEEP_INDEXED' | 'IMPROVE' | 'REVIEW' | 'NOINDEX' | 'CONSOLIDATE';
}

export interface SeoEvaluationInput {
  httpStatus: number;
  hasCanonical: boolean;
  hasTitle: boolean;
  titleLength?: number;
  hasMetaDescription: boolean;
  descLength?: number;
  hasH1: boolean;
  contentLength: number;
  inboundInternalLinks: number;
  outboundInternalLinks: number;
  hasSchema: boolean;
  hasConversionCta: boolean;
  hasAssignedIntent: boolean;
  isPrivate?: boolean;
  isDuplicate?: boolean;
}

export function evaluatePageSeoQuality(input: SeoEvaluationInput): SeoScoreBreakdown {
  if (input.isPrivate || input.httpStatus !== 200) {
    return {
      technicalSeo: 0,
      contentQuality: 0,
      searchIntentMatch: 0,
      internalLinking: 0,
      metadataCompleteness: 0,
      entityRelevance: 0,
      structuredData: 0,
      conversionRelevance: 0,
      totalScore: 0,
      grade: 'NOINDEX',
      qualityStatus: 'NOINDEX',
      actionRecommendation: 'NOINDEX',
    };
  }

  if (input.isDuplicate) {
    return {
      technicalSeo: 10,
      contentQuality: 5,
      searchIntentMatch: 5,
      internalLinking: 5,
      metadataCompleteness: 5,
      entityRelevance: 5,
      structuredData: 0,
      conversionRelevance: 0,
      totalScore: 35,
      grade: 'NOINDEX',
      qualityStatus: 'CONSOLIDATE',
      actionRecommendation: 'CONSOLIDATE',
    };
  }

  // 1. Technical SEO (Max 20)
  let technicalSeo = 0;
  if (input.httpStatus === 200) technicalSeo += 10;
  if (input.hasCanonical) technicalSeo += 10;

  // 2. Content Quality (Max 20)
  let contentQuality = 0;
  if (input.contentLength >= 300) contentQuality = 20;
  else if (input.contentLength >= 150) contentQuality = 15;
  else if (input.contentLength >= 50) contentQuality = 10;
  else contentQuality = 5;

  // 3. Search Intent Match (Max 15)
  let searchIntentMatch = input.hasAssignedIntent ? 15 : 5;

  // 4. Internal Linking (Max 15)
  let internalLinking = 0;
  if (input.outboundInternalLinks >= 4) internalLinking += 8;
  else if (input.outboundInternalLinks >= 1) internalLinking += 4;
  if (input.inboundInternalLinks >= 1) internalLinking += 7;

  // 5. Metadata Completeness (Max 10)
  let metadataCompleteness = 0;
  if (input.hasTitle) metadataCompleteness += 5;
  if (input.hasMetaDescription) metadataCompleteness += 5;

  // 6. Entity / Topic Relevance (Max 10)
  let entityRelevance = input.hasH1 ? 10 : 0;

  // 7. Structured Data (Max 5)
  let structuredData = input.hasSchema ? 5 : 0;

  // 8. Conversion Relevance (Max 5)
  let conversionRelevance = input.hasConversionCta ? 5 : 0;

  const totalScore =
    technicalSeo +
    contentQuality +
    searchIntentMatch +
    internalLinking +
    metadataCompleteness +
    entityRelevance +
    structuredData +
    conversionRelevance;

  let grade: 'A+' | 'A' | 'B' | 'C' | 'NOINDEX' = 'NOINDEX';
  let qualityStatus: InternalQualityStatus = 'NOINDEX';
  let action: 'KEEP_INDEXED' | 'IMPROVE' | 'REVIEW' | 'NOINDEX' | 'CONSOLIDATE' = 'NOINDEX';

  if (totalScore >= 90) {
    grade = 'A+';
    qualityStatus = 'INDEX';
    action = 'KEEP_INDEXED';
  } else if (totalScore >= 80) {
    grade = 'A';
    qualityStatus = 'INDEX';
    action = 'KEEP_INDEXED';
  } else if (totalScore >= 70) {
    grade = 'B';
    qualityStatus = 'INDEX';
    action = 'KEEP_INDEXED';
  } else if (totalScore >= 60) {
    grade = 'C';
    qualityStatus = 'REVIEW';
    action = 'REVIEW';
  } else {
    grade = 'NOINDEX';
    qualityStatus = 'NOINDEX';
    action = 'NOINDEX';
  }

  return {
    technicalSeo,
    contentQuality,
    searchIntentMatch,
    internalLinking,
    metadataCompleteness,
    entityRelevance,
    structuredData,
    conversionRelevance,
    totalScore,
    grade,
    qualityStatus,
    actionRecommendation: action,
  };
}
