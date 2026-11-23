// src/types/publisherAdoption.ts
// TalentXcel Global Embed Adoption Engine â€” Core Type Definitions

import { EmbedAssetCategory } from './embed';

export type PublisherCategory =
  | 'college'
  | 'education'
  | 'career'
  | 'technology'
  | 'hr_recruitment'
  | 'independent'
  | 'community';

export type PublisherPipelineStage =
  | 'discovered'
  | 'audited'
  | 'qualified'
  | 'prioritized'
  | 'contact_ready'
  | 'contacted'
  | 'followup_due'
  | 'interested'
  | 'embed_offered'
  | 'embed_adopted'
  | 'adoption_verified'
  | 'declined'
  | 'disqualified';

export type OpportunityPriority = 'A' | 'B' | 'C' | 'deprioritized';

export type AdoptionVerificationLevel = 1 | 2 | 3 | 4 | 5;
// Level 1: Offered | Level 2: Interested | Level 3: Reported | Level 4: Observed | Level 5: Verified

export interface PublisherScoreBreakdown {
  contentRelevance: number; // 0 - 30
  embedOpportunity: number; // 0 - 25
  publisherQuality: number; // 0 - 20
  audienceRelevance: number; // 0 - 15
  outreachFeasibility: number; // 0 - 10
  totalScore: number; // 0 - 100
  scoringNotes?: string[];
}

export interface OutreachDrafts {
  emailSubject: string;
  emailBody: string;
  contactFormMessage: string;
  socialMessage: string;
  followUp1: string;
  followUp2: string;
}

export interface PublisherOpportunity {
  id: string;
  name: string;
  domain: string;
  websiteUrl: string;
  category: PublisherCategory;
  country: string;
  region: string;
  relevantTopic: string;
  targetPageUrl?: string;
  suggestedEmbedCategory: EmbedAssetCategory;
  suggestedAssetId: string;
  suggestedAssetTitle: string;
  matchingRationale: string;
  suggestedPlacement: string;
  score: PublisherScoreBreakdown;
  priority: OpportunityPriority;
  contactPageUrl?: string;
  publicContactEmail?: string;
  contactFormUrl?: string;
  socialUrl?: string;
  discoverySource: string;
  discoveredAt: string;
  lastVerifiedAt: string;
  pipelineStage: PublisherPipelineStage;
  adoptionLevel: AdoptionVerificationLevel;
  outreachDrafts: OutreachDrafts;
  notes?: string;
  isOptedOut?: boolean;
}

export interface CampaignFunnelStats {
  totalDiscovered: number;
  totalQualified: number;
  priorityA: number;
  priorityB: number;
  priorityC: number;
  contactReady: number;
  contacted: number;
  repliesReceived: number;
  interested: number;
  embedsOffered: number;
  embedsAdopted: number;
  adoptionsVerified: number;
  declined: number;
  disqualified: number;
  referralVisits: number;
  attributionClicks: number;
  activePublishingDomains: number;
}
