// src/lib/growth-os/growthEventBus.ts
// TalentXcel Autonomous Growth Event Bus
// Every meaningful data change in TalentXcel emits a GrowthEvent.
// The event bus resolves which URLs are affected and what actions to take.
// This is a type-safe event model — not a runtime message broker.

export type GrowthEventType =
  | 'PROFILE_CREATED' | 'PROFILE_UPDATED' | 'PROFILE_VISIBILITY_CHANGED'
  | 'JOB_CREATED' | 'JOB_UPDATED' | 'JOB_EXPIRED' | 'JOB_DELETED'
  | 'COMPANY_CREATED' | 'COMPANY_UPDATED' | 'COMPANY_JOBS_CHANGED'
  | 'POST_CREATED' | 'POST_UPDATED' | 'POST_QUALITY_SCORED'
  | 'SKILL_CREATED' | 'LOCATION_ACTIVATED' | 'SALARY_DATA_UPDATED'
  | 'GSC_QUERY_EMERGED' | 'GSC_POSITION_IMPROVED' | 'GSC_POSITION_DECLINED'
  | 'GSC_CTR_CHANGED' | 'GSC_PAGE_DECAYED' | 'GSC_NEW_COUNTRY_SIGNAL'
  | 'INDEXING_REQUESTED' | 'INDEXING_CONFIRMED' | 'SITEMAP_UPDATED' | 'CANONICAL_CONFLICT_DETECTED';

export type GrowthEntityType = 'JOB' | 'PROFILE' | 'COMPANY' | 'POST' | 'SKILL' | 'LOCATION' | 'SALARY' | 'GSC_SIGNAL' | 'SYSTEM';
export type GrowthEventTrigger = 'USER_ACTION' | 'SYSTEM_AUTOMATION' | 'GSC_FEEDBACK' | 'CRON_JOB';
export type IndexingApiAction = 'URL_UPDATED' | 'URL_DELETED';
export type AffectedUrlPriority = 'IMMEDIATE' | 'NEXT_BATCH' | 'SCHEDULED';

export interface GrowthEvent<T = unknown> {
  eventId: string;
  type: GrowthEventType;
  occurredAt: string;
  entityType: GrowthEntityType;
  entityId: string;
  payload: T;
  triggeredBy: GrowthEventTrigger;
}

// Typed payload shapes
export interface JobCreatedPayload {
  jobId: string;
  title: string;
  seoSlug: string;
  role: string;
  location: string;
  country: string;
  companyId?: string;
  companySlug?: string;
  companyName: string;
  skills: string[];
  salary?: { min: number; max: number; currency: string };
  isRemote: boolean;
  employmentType: string;
  postedAt: string;
  validThrough: string;
  experienceLevel?: string;
}

export interface JobExpiredPayload {
  jobId: string;
  seoSlug: string;
  canonicalUrl: string;
  expiredAt: string;
  hadActiveIndexing: boolean;
}

export interface CompanyCreatedPayload {
  companyId: string;
  companySlug: string;
  name: string;
  industry: string;
  locations: string[];
  verified: boolean;
}

export interface ProfileCreatedPayload {
  profileId: string;
  profileSlug: string;
  role: string;
  location: string;
  isPublic: boolean;
  hasUserConsent: boolean;
  skills: string[];
}

export interface GscQueryEmergedPayload {
  query: string;
  impressions: number;
  clicks: number;
  position: number;
  country: string;
  weekStarting: string;
  affectedSurface: string;
  opportunityScore: number;
}

export interface GscPageDecayedPayload {
  pageUrl: string;
  query: string;
  impressionsDelta: number;
  clicksDelta: number;
  positionDelta: number;
  decayStartedAt: string;
}

export interface AffectedUrlSet {
  directUrl: string;
  dependentUrls: string[];
  sitemapSections: string[];
  indexingApiAction?: IndexingApiAction;
  priority: AffectedUrlPriority;
  notes: string;
}

// Utility: normalize a string to a slug
function toSlug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function resolveAffectedUrls(event: GrowthEvent): AffectedUrlSet {
  switch (event.type) {
    case 'JOB_CREATED': {
      const p = event.payload as JobCreatedPayload;
      const roleSlug = toSlug(p.role);
      const locSlug = toSlug(p.location);
      const expSlug = toSlug(p.experienceLevel ?? 'any');
      const coSlug = p.companySlug ?? toSlug(p.companyName);
      const dependentUrls = [
        `/jobs/${roleSlug}`,
        `/jobs/${roleSlug}/${locSlug}`,
        `/jobs/${roleSlug}/${locSlug}/${expSlug}`,
        `/locations/${locSlug}`,
        `/companies/${coSlug}`,
        ...p.skills.slice(0, 5).map(sk => `/skills/${toSlug(sk)}/jobs`),
      ];
      if (p.isRemote) dependentUrls.push(`/remote/${roleSlug}`);
      return {
        directUrl: `/jobs/${p.seoSlug}`,
        dependentUrls,
        sitemapSections: ['jobs', 'companies', 'locations', 'skills'],
        indexingApiAction: 'URL_UPDATED',
        priority: 'IMMEDIATE',
        notes: `New job: ${p.title} at ${p.companyName}. Affects ${dependentUrls.length} hub pages.`,
      };
    }
    case 'JOB_EXPIRED':
    case 'JOB_DELETED': {
      const p = event.payload as JobExpiredPayload;
      return {
        directUrl: p.canonicalUrl,
        dependentUrls: [],
        sitemapSections: ['jobs'],
        indexingApiAction: 'URL_DELETED',
        priority: 'IMMEDIATE',
        notes: `Job expired/deleted. Indexing API URL_DELETED required immediately to prevent expired JobPosting schema penalty.`,
      };
    }
    case 'COMPANY_CREATED':
    case 'COMPANY_UPDATED': {
      const p = event.payload as CompanyCreatedPayload;
      return {
        directUrl: `/companies/${p.companySlug}`,
        dependentUrls: ['/companies', '/jobs'],
        sitemapSections: ['companies'],
        indexingApiAction: 'URL_UPDATED',
        priority: 'NEXT_BATCH',
        notes: `Company ${p.name} created/updated. Update company hub.`,
      };
    }
    case 'PROFILE_CREATED':
    case 'PROFILE_UPDATED': {
      const p = event.payload as ProfileCreatedPayload;
      // Profiles only get indexing if public AND consent given
      if (!p.isPublic || !p.hasUserConsent) {
        return {
          directUrl: `/profile/${p.profileSlug}`,
          dependentUrls: [],
          sitemapSections: [],
          priority: 'SCHEDULED',
          notes: `Profile not eligible for indexing: isPublic=${p.isPublic}, hasConsent=${p.hasUserConsent}. No SEO action.`,
        };
      }
      return {
        directUrl: `/profile/${p.profileSlug}`,
        dependentUrls: [
          `/jobs/${toSlug(p.role)}/${toSlug(p.location)}`,
          ...p.skills.slice(0, 3).map(sk => `/skills/${toSlug(sk)}`),
        ],
        sitemapSections: ['profiles'],
        indexingApiAction: 'URL_UPDATED',
        priority: 'NEXT_BATCH',
        notes: `Public profile with consent. Update role/location hub pages.`,
      };
    }
    case 'GSC_QUERY_EMERGED': {
      const p = event.payload as GscQueryEmergedPayload;
      return {
        directUrl: '',
        dependentUrls: [],
        sitemapSections: [],
        priority: 'SCHEDULED',
        notes: `GSC signal: new query "${p.query}" in ${p.country} with score ${p.opportunityScore}. No immediate URL change — add to opportunity queue.`,
      };
    }
    case 'GSC_PAGE_DECAYED': {
      const p = event.payload as GscPageDecayedPayload;
      return {
        directUrl: p.pageUrl,
        dependentUrls: [],
        sitemapSections: [],
        priority: 'SCHEDULED',
        notes: `Page decay detected: impressions delta ${p.impressionsDelta}, position delta ${p.positionDelta}. Diagnose before any action.`,
      };
    }
    default:
      return {
        directUrl: '',
        dependentUrls: [],
        sitemapSections: [],
        priority: 'SCHEDULED',
        notes: `Event type ${event.type} processed. No direct URL action required.`,
      };
  }
}

export function createGrowthEvent<T>(params: {
  type: GrowthEventType;
  entityType: GrowthEntityType;
  entityId: string;
  payload: T;
  triggeredBy: GrowthEventTrigger;
}): GrowthEvent<T> {
  return {
    eventId: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type: params.type,
    occurredAt: new Date().toISOString(),
    entityType: params.entityType,
    entityId: params.entityId,
    payload: params.payload,
    triggeredBy: params.triggeredBy,
  };
}
