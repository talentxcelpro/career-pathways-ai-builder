// src/types/embed.ts
// TalentXcel Embed & Distribution Engine â€” Core Type Definitions

export type EmbedAssetCategory =
  | 'college'
  | 'job_market'
  | 'skills'
  | 'career'
  | 'resume'
  | 'employer';

export type EmbedAssetStatus =
  | 'draft'
  | 'approved'
  | 'active'
  | 'suspended'
  | 'expired'
  | 'archived';

export type EmbedTheme = 'dark' | 'light' | 'slate';
export type EmbedLayout = 'standard' | 'compact' | 'expanded';
export type EmbedFormat = 'iframe' | 'javascript' | 'markdown' | 'attribution_link';

export interface EmbedAttribution {
  brand: string;
  brandUrl: string;
  sourceUrl: string;
  displayText: string;
  rel: string;
}

export interface EmbedMetricItem {
  label: string;
  value: string | number;
  highlight?: boolean;
  sublabel?: string;
  color?: string;
}

export interface BaseEmbedAssetData {
  title: string;
  subtitle?: string;
  verified: boolean;
  confidenceScore?: number;
  lastUpdated: string;
  sourceLabel: string;
  sourceUrl: string;
  metrics: EmbedMetricItem[];
  badges?: string[];
  ctaText?: string;
  ctaUrl?: string;
}

// Category A: College Intelligence
export interface CollegeEmbedData extends BaseEmbedAssetData {
  collegeName: string;
  slug: string;
  city: string;
  state: string;
  nirfRank?: number;
  nirfCategory?: string;
  placementRate?: number;
  medianPackageLpa?: number;
  highestPackageLpa?: number;
  topRecruiters?: string[];
  annualTuition?: number;
  institutionType?: string;
  officialWebsite?: string;
}

// Category B: Job Market Intelligence
export interface JobMarketEmbedData extends BaseEmbedAssetData {
  hubName: string;
  slug: string;
  state: string;
  activeJobsCount: string | number;
  companiesCount: string | number;
  avgSalaryRange: string;
  topHiringSectors: string[];
  topHiringCompanies: string[];
  remoteFriendlyPercentage?: number;
}

// Category C: Skills Intelligence
export interface SkillsEmbedData extends BaseEmbedAssetData {
  skillName: string;
  slug: string;
  category: string;
  marketDemandScore: number; // 0-100
  avgSalaryImpact: string;
  matchingJobsCount: number;
  relatedSkills: string[];
  topCareerPaths: string[];
}

// Category D: Career Intelligence
export interface CareerEmbedData extends BaseEmbedAssetData {
  transitionId: string;
  currentRole: string;
  targetRole: string;
  industry: string;
  timeEstimateMonths: number;
  currentAvgCtcLakhs: number;
  targetAvgCtcLakhs: number;
  ctcIncreasePercent: number;
  difficulty: 'Moderate' | 'Demanding' | 'High Impact';
  keySkillGaps: string[];
}

// Category E: Resume & ATS Assets
export interface ResumeEmbedData extends BaseEmbedAssetData {
  targetRole: string;
  avgAtsScore: number;
  topMissingKeywords: string[];
  keyFormattingRules: string[];
  industryBenchmark: string;
}

// Category F: Employer & Hiring Assets
export interface EmployerEmbedData extends BaseEmbedAssetData {
  companyName: string;
  slug: string;
  industry: string;
  headquarters: string;
  activeOpeningsCount: number;
  verifiedEmployer: boolean;
  featuredRoles: string[];
}

export type EmbedAssetSpecificData =
  | CollegeEmbedData
  | JobMarketEmbedData
  | SkillsEmbedData
  | CareerEmbedData
  | ResumeEmbedData
  | EmployerEmbedData;

export interface EmbedAsset {
  id: string;
  category: EmbedAssetCategory;
  slug: string;
  title: string;
  subtitle: string;
  sourceUrl: string;
  canonicalUrl: string;
  version: string;
  status: EmbedAssetStatus;
  verified: boolean;
  updatedAt: string;
  data: EmbedAssetSpecificData;
  attribution: EmbedAttribution;
}

export interface EmbedConfiguration {
  theme: EmbedTheme;
  layout: EmbedLayout;
  showHeader: boolean;
  showFooter: boolean;
  showMetrics: boolean;
  showCta: boolean;
  width?: string;
  height?: number;
  publisherRef?: string;
}

export interface EmbedEventPayload {
  assetId: string;
  assetCategory: EmbedAssetCategory;
  eventType: 'impression' | 'render' | 'attribution_click' | 'cta_click';
  publisherDomain?: string;
  referrer?: string;
  theme?: string;
  layout?: string;
  timestamp: string;
}

export interface PublisherStats {
  domain: string;
  firstSeenAt: string;
  lastSeenAt: string;
  totalImpressions: number;
  totalClicks: number;
  activeAssetsCount: number;
  status: 'active' | 'suspended' | 'verified';
}

export interface EmbedRegistryStats {
  totalAssets: number;
  activeAssets: number;
  totalRenders: number;
  totalClicks: number;
  uniquePublishers: number;
  categoryBreakdown: Record<EmbedAssetCategory, number>;
}
