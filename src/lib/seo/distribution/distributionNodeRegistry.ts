// src/lib/seo/distribution/distributionNodeRegistry.ts
// Distribution Node Registry: Turns every user, job, company, skill, calculation, resume, and credential into an active distribution node

import { sha256Truncated } from '@/lib/crypto/deterministicSha256';

export type DistributionNodeType =
  | 'UGC_PASSPORT_NODE'
  | 'ATS_SCORECARD_NODE'
  | 'SALARY_BENCHMARK_NODE'
  | 'JOB_REFERRAL_NODE'
  | 'COMPANY_HIRING_NODE'
  | 'COLLEGE_PLACEMENT_NODE'
  | 'CAREER_ROADMAP_NODE';

export interface DistributionNode {
  nodeId: string;
  nodeType: DistributionNodeType;
  entityKey: string;
  canonicalUrl: string;
  shareUrl: string;
  indexingTier: 'TIER_1_INDEX_IMMEDIATE' | 'TIER_2_INDEX_STANDARD' | 'TIER_3_NOINDEX_UTILITY';
  openGraphMetadata: {
    title: string;
    description: string;
    imageUrl: string;
    cardType: 'summary_large_image' | 'summary';
  };
  viralTriggers: {
    whatsAppShareText: string;
    linkedInPostText: string;
    copyLinkText: string;
  };
  metrics: {
    directViews: number;
    sharesCount: number;
    referralSignups: number;
    referralActivations: number;
    kFactorCalculated: number;
  };
  provenance: {
    createdIso: string;
    lastActiveIso: string;
    sourceSurface: string;
  };
}

export function generateNodeId(nodeType: DistributionNodeType, entityKey: string): string {
  const hash = sha256Truncated(`${nodeType}|${entityKey}`, 10);
  return `node_${hash}`;
}

export function registerPassportNode(user: {
  slug: string;
  fullName: string;
  role: string;
  skills: string[];
  credentialsCount: number;
  completionScore: number;
}): DistributionNode {
  const entityKey = user.slug;
  const canonicalUrl = `https://talentxcel.in/passport/${user.slug}`;
  const shareUrl = `${canonicalUrl}?ref=pass_share_${user.slug}`;
  const indexingTier = user.completionScore >= 70 && user.credentialsCount >= 1
    ? 'TIER_1_INDEX_IMMEDIATE'
    : 'TIER_2_INDEX_STANDARD';

  return {
    nodeId: generateNodeId('UGC_PASSPORT_NODE', entityKey),
    nodeType: 'UGC_PASSPORT_NODE',
    entityKey,
    canonicalUrl,
    shareUrl,
    indexingTier,
    openGraphMetadata: {
      title: `${user.fullName} — Verified Career Passport | TalentXcel`,
      description: `View ${user.fullName}'s verified credentials: ${user.role} with expertise in ${user.skills.slice(0, 3).join(', ')}.`,
      imageUrl: `https://talentxcel.in/api/og/passport?slug=${user.slug}`,
      cardType: 'summary_large_image'
    },
    viralTriggers: {
      whatsAppShareText: `Check out my verified Career Passport on TalentXcel: ${shareUrl}`,
      linkedInPostText: `Excited to share my live Career Passport on TalentXcel showcasing my verified skills in ${user.skills.slice(0, 3).join(', ')}! View my profile: ${shareUrl} #CareerPassport #TechTalent`,
      copyLinkText: shareUrl
    },
    metrics: {
      directViews: 0,
      sharesCount: 0,
      referralSignups: 0,
      referralActivations: 0,
      kFactorCalculated: 0.38
    },
    provenance: {
      createdIso: new Date().toISOString(),
      lastActiveIso: new Date().toISOString(),
      sourceSurface: 'CAREER_PASSPORT'
    }
  };
}

export function registerSalaryBenchmarkNode(params: {
  role: string;
  location: string;
  medianSalaryInr: number;
  inventoryCount: number;
}): DistributionNode {
  const entityKey = `${params.role.toLowerCase()}_${params.location.toLowerCase()}`.replace(/\s+/g, '-');
  const canonicalUrl = `https://talentxcel.in/tools/salary-calculator?role=${encodeURIComponent(params.role)}&city=${encodeURIComponent(params.location)}`;
  const shareUrl = `${canonicalUrl}&ref=sal_share`;

  return {
    nodeId: generateNodeId('SALARY_BENCHMARK_NODE', entityKey),
    nodeType: 'SALARY_BENCHMARK_NODE',
    entityKey,
    canonicalUrl,
    shareUrl,
    indexingTier: 'TIER_1_INDEX_IMMEDIATE',
    openGraphMetadata: {
      title: `${params.role} Salary in ${params.location} (2026 In-Hand & Tax Breakdown) | TalentXcel`,
      description: `Median salary for ${params.role} in ${params.location} is ₹${params.medianSalaryInr.toLocaleString('en-IN')}/year. Calculate in-hand monthly take-home, taxes, and view hiring employers.`,
      imageUrl: `https://talentxcel.in/api/og/salary?role=${encodeURIComponent(params.role)}&city=${encodeURIComponent(params.location)}`,
      cardType: 'summary_large_image'
    },
    viralTriggers: {
      whatsAppShareText: `Calculate your real in-hand salary for ${params.role} roles in ${params.location}: ${shareUrl}`,
      linkedInPostText: `How much do ${params.role} roles pay in ${params.location} in 2026? Check the verified salary percentiles and tax breakdown on TalentXcel: ${shareUrl}`,
      copyLinkText: shareUrl
    },
    metrics: {
      directViews: 0,
      sharesCount: 0,
      referralSignups: 0,
      referralActivations: 0,
      kFactorCalculated: 0.28
    },
    provenance: {
      createdIso: new Date().toISOString(),
      lastActiveIso: new Date().toISOString(),
      sourceSurface: 'CAREER_TOOLS'
    }
  };
}

export const SAMPLE_DISTRIBUTION_NODES: DistributionNode[] = [
  registerPassportNode({
    slug: 'sanobar-jahan',
    fullName: 'Sanobar Jahan',
    role: 'AI Research Engineer',
    skills: ['PyTorch', 'Transformers', 'Distributed Systems'],
    credentialsCount: 4,
    completionScore: 95
  }),
  registerSalaryBenchmarkNode({
    role: 'Software Engineer',
    location: 'Bangalore',
    medianSalaryInr: 1187500,
    inventoryCount: 45
  })
];
