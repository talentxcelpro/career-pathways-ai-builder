/**
 * TalentXcel Internal Job Quality Score Engine
 * Computes a transparent 0-100 quality score to evaluate completeness, freshness,
 * verification tier, salary precision, and description depth.
 */

import { GlobalJob } from '@/types/jobs/globalJob';

export interface JobQualityAudit {
  totalScore: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'REJECT';
  factors: {
    sourceReliability: number;     // max 25
    dataCompleteness: number;      // max 25
    salaryTransparency: number;    // max 20
    freshness: number;             // max 15
    locationPrecision: number;     // max 15
  };
  recommendations: string[];
}

export function computeJobQualityScore(job: Partial<GlobalJob>): JobQualityAudit {
  let sourceReliability = 15;
  let dataCompleteness = 10;
  let salaryTransparency = 0;
  let freshness = 15;
  let locationPrecision = 5;
  const recommendations: string[] = [];

  // 1. Source Reliability (max 25)
  if (job.is_government) {
    sourceReliability = 25; // Government notices have highest authoritative provenance
  } else if (job.employer?.verification_status === 'BUSINESS_VERIFIED') {
    sourceReliability = 22;
  } else if (job.employer?.verification_status === 'DOMAIN_VERIFIED') {
    sourceReliability = 18;
  } else {
    sourceReliability = 12;
    recommendations.push('Verify employer domain or business credentials.');
  }

  // 2. Data Completeness (max 25)
  const descLen = (job.description || '').length;
  if (descLen >= 800) {
    dataCompleteness += 10;
  } else if (descLen >= 400) {
    dataCompleteness += 6;
  } else {
    recommendations.push('Expand job description with role responsibilities and qualifications.');
  }

  if (job.skills && job.skills.length >= 3) {
    dataCompleteness += 5;
  }

  // 3. Salary Transparency (max 20)
  if (job.salary?.minimum && job.salary?.maximum) {
    salaryTransparency = 20;
  } else if (job.salary?.minimum) {
    salaryTransparency = 12;
  } else if (job.salary?.original_display) {
    salaryTransparency = 8;
  } else {
    recommendations.push('Add salary range to increase applicant response and Google click-through rate.');
  }

  // 4. Freshness (max 15)
  if (job.posted_at) {
    const ageDays = (Date.now() - new Date(job.posted_at).getTime()) / (1000 * 60 * 60 * 24);
    if (ageDays <= 3) freshness = 15;
    else if (ageDays <= 14) freshness = 12;
    else if (ageDays <= 30) freshness = 8;
    else freshness = 3;
  }

  // 5. Location Precision (max 15)
  if (job.city && job.region_name && job.country_code) {
    locationPrecision = 15;
  } else if (job.city && job.country_code) {
    locationPrecision = 12;
  } else if (job.workplace_type === 'REMOTE') {
    locationPrecision = 15;
  } else {
    recommendations.push('Specify city and state for localized search visibility.');
  }

  const totalScore = sourceReliability + dataCompleteness + salaryTransparency + freshness + locationPrecision;

  let grade: JobQualityAudit['grade'] = 'C';
  if (totalScore >= 90) grade = 'A+';
  else if (totalScore >= 75) grade = 'A';
  else if (totalScore >= 60) grade = 'B';
  else if (totalScore < 40) grade = 'REJECT';

  return {
    totalScore,
    grade,
    factors: {
      sourceReliability,
      dataCompleteness,
      salaryTransparency,
      freshness,
      locationPrecision,
    },
    recommendations,
  };
}
