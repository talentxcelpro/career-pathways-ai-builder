// src/lib/graph/types.ts
// Authoritative Type System for TalentXcel Professional Search Graph & Entity Engine
// Invariant: Derived projection types only. Does not replace canonical domain schemas.

export type ProfessionalEntityType =
  | 'PERSON'          // Professional individual
  | 'PROFILE'         // Canonical public profile
  | 'COMPANY'         // Employer organization
  | 'JOB'             // Individual job opening
  | 'POST'            // User-authored public post
  | 'SKILL'           // Technical or functional skill
  | 'OCCUPATION'      // Standardized role / occupation
  | 'LOCATION'        // 100K global location universe
  | 'COLLEGE'         // Educational institution
  | 'TOOL';           // Career tool (ATS scanner, salary benchmark)

export type EntityLifecycleStatus =
  | 'ACTIVE'          // Live, verified record
  | 'DRAFT'           // In-progress, uncommitted
  | 'HIDDEN'          // Suppressed from public listings
  | 'PRIVATE'         // Explicit user privacy setting
  | 'SUSPENDED'       // Moderation or security suspension
  | 'DELETED'         // Soft-deleted by user or admin
  | 'MERGED'          // Consolidated into another canonical entity
  | 'REDIRECTED';     // Canonicalized to a parent or newer URL

export type IndexabilityStatus =
  | 'NOT_ELIGIBLE'       // Fails privacy, quality, or inventory gate
  | 'ELIGIBLE'           // Meets all quality requirements, ready for indexing
  | 'SUBMITTED'          // Submitted via sitemap or Indexing API
  | 'DISCOVERY_OBSERVED' // Verified appearing in Google Search or AI Overview
  | 'REMOVAL_PENDING';   // Queued for de-indexing due to private/closed status

export type GraphRelationshipType =
  | 'WORKS_AT'           // Person works at Company
  | 'AUTHORED'           // Person authored Post
  | 'PUBLISHED_JOB'      // Recruiter/Person published Job
  | 'REQUIRES_SKILL'     // Job/Role requires Skill
  | 'OFFERS_COURSE'      // College/Platform offers Course
  | 'LOCATED_IN'         // Entity geographically located in Location
  | 'LEADS_TO'           // Skill/Role leads to Career Progression
  | 'MENTIONS';          // Post mentions Entity

export type RelationshipProvenance =
  | 'PROFILE_EXPLICIT'   // Explicitly provided in verified user profile
  | 'JOB_EXPLICIT'       // Formally declared in approved job record
  | 'COMPANY_VERIFIED'   // Confirmed by company organization admin
  | 'USER_AUTHORED'      // Created directly in public user post
  | 'SYSTEM_DERIVED';    // Computed via deterministic matching

export interface ProfessionalEntityNode {
  id: string;
  sourceTable: string;
  sourceId: string;
  entityType: ProfessionalEntityType;
  canonicalUrl: string;
  title: string;
  entityStatus: EntityLifecycleStatus;
  indexabilityStatus: IndexabilityStatus;
  qualityScore: number; // 0 - 100
  gscImpressions: number;
  gscClicks: number;
  gscCtr: number;
  gscAveragePosition: number;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface ProfessionalEntityEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  relationshipType: GraphRelationshipType;
  confidence: number; // 0.0 - 1.0
  provenance: RelationshipProvenance;
  evidenceType: string;
  evidenceReference?: string;
  verifiedAt: string;
  derivedBy: string;
  active: boolean;
}

export interface ProfileQualityScoreBreakdown {
  nameScore: number;           // max 20
  headlineScore: number;       // max 20
  aboutScore: number;          // max 15
  experienceScore: number;     // max 15
  skillsScore: number;         // max 10
  educationScore: number;      // max 5
  activityScore: number;       // max 10
  identityVerifiedScore: number; // max 5
  totalScore: number;          // max 100
  thresholdRequired: number;   // default 50
  isQualityPass: boolean;
}

export interface ProfileIndexabilityDecision {
  isIndexable: boolean;
  entityStatus: EntityLifecycleStatus;
  indexabilityStatus: IndexabilityStatus;
  robotsDirective: 'index, follow' | 'noindex, follow' | 'noindex, nofollow';
  eligibleForSitemap: boolean;
  qualityScoreBreakdown: ProfileQualityScoreBreakdown;
  reason: string;
}

export interface EntityResolutionCandidate {
  entityId: string;
  entityType: ProfessionalEntityType;
  title: string;
  canonicalUrl: string;
  matchScore: number; // 0.0 - 1.0
  provenance: RelationshipProvenance;
  evidenceSnippet: string;
}
