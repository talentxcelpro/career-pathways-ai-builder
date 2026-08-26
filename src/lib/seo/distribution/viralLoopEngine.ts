// src/lib/seo/distribution/viralLoopEngine.ts
// TalentXcel Viral Loop & User-Generated Distribution Engine
// Transforms user activity (Career Passports, ATS scans, job applications) into crawlable, shareable viral growth objects

import { ViralObjectMetadata } from './types.js';

export function computeViralKFactor(invitesPerUser: number, conversionRatePct: number): number {
  return Number((invitesPerUser * (conversionRatePct / 100)).toFixed(4));
}

export function projectCompoundingGrowth(
  initialUsers: number,
  organicGrowthRatePerCycle: number,
  kFactor: number,
  cycles: number
): number[] {
  const progression: number[] = [initialUsers];
  let currentUsers = initialUsers;

  for (let i = 1; i <= cycles; i++) {
    const newOrganic = currentUsers * organicGrowthRatePerCycle;
    const viralAdditions = (currentUsers + newOrganic) * kFactor;
    currentUsers = Math.round(currentUsers + newOrganic + viralAdditions);
    progression.push(currentUsers);
  }

  return progression;
}

export function generatePassportViralObject(user: {
  slug: string;
  fullName: string;
  primaryRole: string;
  topSkills: string[];
  verifiedCredentialCount: number;
}): ViralObjectMetadata {
  const canonicalUrl = `https://talentxcel.in/passport/${user.slug}`;
  const title = `${user.fullName} — Verified Career Passport & ATS Profile | TalentXcel`;
  const description = `View ${user.fullName}'s verified Career Passport: ${user.primaryRole} with verified expertise in ${user.topSkills.slice(0, 3).join(', ')}. ${user.verifiedCredentialCount} verified credentials.`;

  return {
    objectId: `obj_pass_${user.slug}`,
    objectType: 'CAREER_PASSPORT',
    title,
    description,
    canonicalUrl,
    shareUrl: `${canonicalUrl}?ref=viral_passport_share`,
    ogImageUrl: `https://talentxcel.in/api/og/passport?slug=${user.slug}`,
    shareTriggers: {
      linkedinText: `I just verified my professional credentials on TalentXcel! Check out my live Career Passport: ${canonicalUrl}`,
      whatsAppText: `Hi! Here is my verified Career Passport on TalentXcel with my real project credentials: ${canonicalUrl}`,
      twitterText: `Verified my skills and credentials on @TalentXcel: ${canonicalUrl} #TechCareers #Hiring2026`,
      emailSubject: `${user.fullName} — Verified Career Passport & Profile`,
      emailBody: `Hi,\n\nPlease find my verified Career Passport and technical profile here:\n${canonicalUrl}\n\nBest regards,\n${user.fullName}`
    },
    viralKFactorAssumption: 0.35
  };
}

export function generateAtsScorecardViralObject(scan: {
  scanId: string;
  targetRole: string;
  atsScore: number;
  matchedKeywordsCount: number;
  missingKeywordsCount: number;
}): ViralObjectMetadata {
  const shareUrl = `https://talentxcel.in/resume?ref=ats_scorecard_share&scan_id=${scan.scanId}`;
  const title = `ATS Resume Scan Score: ${scan.atsScore}/100 for ${scan.targetRole} | TalentXcel`;
  const description = `Tested my resume against ATS parsers on TalentXcel. Scored ${scan.atsScore}/100 with ${scan.matchedKeywordsCount} matched skills. Check your resume score free!`;

  return {
    objectId: `obj_ats_${scan.scanId.slice(0, 8)}`,
    objectType: 'ATS_SCORECARD',
    title,
    description,
    canonicalUrl: 'https://talentxcel.in/resume',
    shareUrl,
    ogImageUrl: `https://talentxcel.in/api/og/ats-scorecard?score=${scan.atsScore}&role=${encodeURIComponent(scan.targetRole)}`,
    shareTriggers: {
      linkedinText: `Just scanned my resume with TalentXcel's free ATS Scanner for ${scan.targetRole} roles (Score: ${scan.atsScore}/100). Check yours: ${shareUrl}`,
      whatsAppText: `Hey! Found this free ATS resume scanner on TalentXcel that shows exact keywords missing from your resume: ${shareUrl}`,
      twitterText: `Scored ${scan.atsScore}/100 on my ${scan.targetRole} resume via @TalentXcel ATS Scanner! Try it free: ${shareUrl}`,
      emailSubject: `Free ATS Resume Checker for ${scan.targetRole}`,
      emailBody: `Hi,\n\nI just tested my resume on TalentXcel's ATS scanner and found missing keywords for ${scan.targetRole} roles. You can test yours here:\n${shareUrl}`
    },
    viralKFactorAssumption: 0.42
  };
}

export const SAMPLE_VIRAL_COHORTS = [
  {
    cohortId: 'cohort_search_to_ats',
    channel: 'PRODUCT_LED_UTILITY' as const,
    monthlyVisitors: 75000,
    freeToolEngagementRatePct: 45.0,
    firstValueMomentCompletionRatePct: 68.0,
    visitorToSignupRatePct: 8.5,
    signupToActiveUserRatePct: 75.0,
    viralSharesPerActiveUser: 0.85,
    viralInviteConversionRatePct: 40.0,
    calculatedViralKFactor: computeViralKFactor(0.85, 40.0),
    projectedCompoundingUsers6Months: 48500,
    projectedCompoundingUsers12Months: 185000
  },
  {
    cohortId: 'cohort_passport_ugc',
    channel: 'USER_GENERATED_UGC' as const,
    monthlyVisitors: 30000,
    freeToolEngagementRatePct: 60.0,
    firstValueMomentCompletionRatePct: 80.0,
    visitorToSignupRatePct: 15.0,
    signupToActiveUserRatePct: 85.0,
    viralSharesPerActiveUser: 1.2,
    viralInviteConversionRatePct: 35.0,
    calculatedViralKFactor: computeViralKFactor(1.2, 35.0),
    projectedCompoundingUsers6Months: 38000,
    projectedCompoundingUsers12Months: 145000
  }
];
