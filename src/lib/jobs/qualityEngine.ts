/**
 * TalentXcel Internal Job Quality & Official Source Confidence Engine
 * Computes:
 * 1. Job Quality Score (0 - 100): completeness, description depth, salary, dates, skills
 * 2. Official Source Confidence Score (0 - 100): verified government domain, official PDF notice, application URL stability
 * 3. Evaluates source-specific quality thresholds to gate automated publishing
 */

import { GlobalJob } from '@/types/jobs/globalJob';

export interface JobQualityAudit {
  totalScore: number;
  sourceConfidenceScore: number;
  sourceThreshold: number;
  decision: 'PASS' | 'REVIEW' | 'REJECT';
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

export function computeSourceConfidenceScore(params: {
  sourceId: string;
  domain: string;
  hasOfficialPdf?: boolean;
  hasOfficialApplicationUrl?: boolean;
  isRecent?: boolean;
}): number {
  let score = 0;
  const d = (params.domain || '').toLowerCase();

  // Official Government TLD (+35)
  if (
    d.includes('.gov') || 
    d.includes('.nic.in') || 
    d.includes('.mil') || 
    d.includes('.gc.ca') || 
    d.includes('.gov.uk') || 
    d.includes('.gov.au') || 
    d.includes('.gov.sg') || 
    d.includes('.europa.eu') || 
    d.includes('.esa.int') ||
    d.includes('iocl.com') ||
    d.includes('csiro.au') ||
    d.includes('rta.ae') ||
    d.includes('digitaldubai.ae')
  ) {
    score += 35;
  } else if (d.includes('.edu') || d.includes('.ac.in') || d.includes('.org')) {
    score += 20;
  } else {
    score += 10;
  }

  // Official Vacancy Notice PDF attached (+25)
  if (params.hasOfficialPdf) {
    score += 25;
  }

  // Official Secure Application URL (+25)
  if (params.hasOfficialApplicationUrl) {
    score += 25;
  }

  // Recency within 24h (+15)
  if (params.isRecent !== false) {
    score += 15;
  }

  return Math.min(100, score);
}

export function getSourceQualityThreshold(sourceLevel?: string, isNewlyDiscovered = false): number {
  if (isNewlyDiscovered) return 85;
  if (sourceLevel === 'FEDERAL') return 70;
  if (sourceLevel === 'STATE') return 75;
  if (sourceLevel === 'PUBLIC_SECTOR') return 70;
  return 80;
}

export function computeJobQualityScore(job: Partial<GlobalJob>, isNewlyDiscovered = false): JobQualityAudit {
  let sourceReliability = 15;
  let dataCompleteness = 10;
  let salaryTransparency = 0;
  let freshness = 15;
  let locationPrecision = 5;
  const recommendations: string[] = [];

  // 1. Source Reliability (max 25)
  if (job.is_government) {
    sourceReliability = 25;
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
    salaryTransparency = 10;
  } else {
    recommendations.push('Disclose salary pay scale or pay band for Google Jobs rich results eligibility.');
  }

  // 4. Freshness (max 15)
  if (job.posted_at) {
    const ageDays = (Date.now() - new Date(job.posted_at).getTime()) / (1000 * 60 * 60 * 24);
    if (ageDays <= 7) freshness = 15;
    else if (ageDays <= 30) freshness = 10;
    else freshness = 5;
  }

  // 5. Location Precision (max 15)
  if (job.city && job.region_name && job.country_code) {
    locationPrecision = 15;
  } else if (job.city && job.country_code) {
    locationPrecision = 12;
  } else if (job.country_code) {
    locationPrecision = 8;
  } else {
    recommendations.push('Specify city and administrative region for accurate geographic distribution.');
  }

  const totalScore = Math.min(100, sourceReliability + dataCompleteness + salaryTransparency + freshness + locationPrecision);

  // Compute Source Confidence Score
  const sourceConfidenceScore = computeSourceConfidenceScore({
    sourceId: job.provenance?.source_id || 'unknown',
    domain: job.provenance?.source_url || '',
    hasOfficialPdf: !!job.provenance?.official_notification_pdf_url,
    hasOfficialApplicationUrl: !!(job.application_url && job.application_url.startsWith('https://')),
    isRecent: freshness >= 10,
  });

  const sourceThreshold = getSourceQualityThreshold(job.government_level, isNewlyDiscovered);

  let decision: 'PASS' | 'REVIEW' | 'REJECT' = 'REVIEW';
  if (totalScore >= sourceThreshold && sourceConfidenceScore >= 60) {
    decision = 'PASS';
  } else if (totalScore < 50 || sourceConfidenceScore < 40) {
    decision = 'REJECT';
  }

  let grade: JobQualityAudit['grade'] = 'C';
  if (totalScore >= 90) grade = 'A+';
  else if (totalScore >= 80) grade = 'A';
  else if (totalScore >= 70) grade = 'B';
  else if (totalScore < 50) grade = 'REJECT';

  return {
    totalScore,
    sourceConfidenceScore,
    sourceThreshold,
    decision,
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
