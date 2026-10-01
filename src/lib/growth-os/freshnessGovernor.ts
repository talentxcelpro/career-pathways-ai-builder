// src/lib/growth-os/freshnessGovernor.ts
// TalentXcel URL Freshness Governor
// Every URL in the search graph has a lifecycle state.
// This engine classifies URLs and recommends actions.
// Stale, thin, or zero-value URLs should be consolidated or removed,
// not kept indexed. This protects crawl budget and domain authority.

export type UrlEntityType = 'JOB' | 'ROLE_HUB' | 'LOCATION_HUB' | 'SKILL_HUB' | 'COMPANY' | 'SALARY' | 'CAREER' | 'RESUME' | 'CONTENT';
export type UrlLifecycleState = 'NEW' | 'ACTIVE' | 'GROWING' | 'STABLE' | 'DECLINING' | 'STALE' | 'CONSOLIDATE' | 'REMOVE';
export type GovernorActionType = 'KEEP' | 'REFRESH' | 'ENRICH' | 'CONSOLIDATE' | 'NOINDEX' | 'REMOVE';
export type GovernorUrgency = 'IMMEDIATE' | 'THIS_WEEK' | 'THIS_MONTH' | 'MONITOR';

// Stale thresholds in days by entity type
const STALE_THRESHOLDS: Record<UrlEntityType, number> = {
  JOB: 30,
  ROLE_HUB: 90,
  LOCATION_HUB: 90,
  SKILL_HUB: 60,
  COMPANY: 60,
  SALARY: 90,
  CAREER: 120,
  RESUME: 120,
  CONTENT: 180,
};

export interface GovernorDecision {
  action: GovernorActionType;
  reason: string;
  urgency: GovernorUrgency;
  suggestedMergeTarget?: string;
}

export interface UrlFreshnessProfile {
  url: string;
  entityType: UrlEntityType;
  lifecycleState: UrlLifecycleState;
  currentWeekImpressions: number;
  currentWeekClicks: number;
  priorWeekImpressions: number;
  priorWeekClicks: number;
  activeInventoryCount: number;
  lastInventoryUpdate: string;
  firstIndexedAt?: string;
  lastCrawledAt?: string;
  lastContentUpdateAt: string;
  impressionDeltaPct: number;
  clickDeltaPct: number;
  staleDaysThreshold: number;
  daysSinceLastUpdate: number;
  governorDecision: GovernorDecision;
}

type FreshnessInput = Omit<UrlFreshnessProfile, 'lifecycleState' | 'impressionDeltaPct' | 'clickDeltaPct' | 'governorDecision'>;

export function classifyUrlLifecycle(profile: FreshnessInput): UrlFreshnessProfile {
  const impressionDeltaPct = profile.priorWeekImpressions > 0
    ? ((profile.currentWeekImpressions - profile.priorWeekImpressions) / profile.priorWeekImpressions) * 100
    : 0;
  const clickDeltaPct = profile.priorWeekClicks > 0
    ? ((profile.currentWeekClicks - profile.priorWeekClicks) / profile.priorWeekClicks) * 100
    : 0;

  const staleDaysThreshold = STALE_THRESHOLDS[profile.entityType];
  const lastUpdate = new Date(profile.lastContentUpdateAt);
  const daysSinceLastUpdate = Math.floor((Date.now() - lastUpdate.getTime()) / 86400000);

  const firstIndexed = profile.firstIndexedAt ? new Date(profile.firstIndexedAt) : null;
  const daysSinceIndexed = firstIndexed
    ? Math.floor((Date.now() - firstIndexed.getTime()) / 86400000)
    : 999;

  // Classify lifecycle state
  let lifecycleState: UrlLifecycleState;

  if (daysSinceIndexed < 14) {
    lifecycleState = 'NEW';
  } else if (profile.currentWeekImpressions === 0 && daysSinceLastUpdate > 90 && profile.activeInventoryCount === 0) {
    lifecycleState = 'REMOVE';
  } else if (profile.activeInventoryCount < 3 && profile.currentWeekImpressions < 10 && profile.entityType !== 'JOB') {
    lifecycleState = 'CONSOLIDATE';
  } else if (daysSinceLastUpdate > staleDaysThreshold && profile.currentWeekImpressions < 10) {
    lifecycleState = 'STALE';
  } else if (impressionDeltaPct < -25 && profile.priorWeekImpressions > 50) {
    lifecycleState = 'DECLINING';
  } else if (impressionDeltaPct > 15) {
    lifecycleState = 'GROWING';
  } else if (profile.currentWeekImpressions > 0 && profile.currentWeekClicks > 0) {
    lifecycleState = 'ACTIVE';
  } else if (profile.currentWeekImpressions > 0) {
    lifecycleState = 'STABLE';
  } else {
    lifecycleState = 'STALE';
  }

  // Governor decision
  let governorDecision: GovernorDecision;

  switch (lifecycleState) {
    case 'NEW':
      governorDecision = { action: 'KEEP', reason: 'Recently indexed. Allow 14–30 days for Google to evaluate.', urgency: 'MONITOR' };
      break;
    case 'GROWING':
      governorDecision = { action: 'KEEP', reason: `Impressions growing ${impressionDeltaPct.toFixed(1)}% WoW. Do not disrupt.`, urgency: 'MONITOR' };
      break;
    case 'ACTIVE':
      governorDecision = { action: 'KEEP', reason: 'Receiving impressions and clicks. Healthy state.', urgency: 'MONITOR' };
      break;
    case 'STABLE':
      if (profile.activeInventoryCount > 0) {
        governorDecision = { action: 'ENRICH', reason: 'Impressions without clicks. Improve title/meta and add salary/skill data.', urgency: 'THIS_MONTH' };
      } else {
        governorDecision = { action: 'CONSOLIDATE', reason: 'No inventory and no clicks. Merge into stronger parent hub.', urgency: 'THIS_MONTH' };
      }
      break;
    case 'DECLINING':
      governorDecision = { action: 'REFRESH', reason: `Impressions dropped ${Math.abs(impressionDeltaPct).toFixed(1)}% WoW. Diagnose: crawlability, freshness, competitor changes.`, urgency: 'THIS_WEEK' };
      break;
    case 'STALE':
      if (profile.activeInventoryCount > 0) {
        governorDecision = { action: 'REFRESH', reason: `${daysSinceLastUpdate} days since last update. Refresh with current data.`, urgency: 'THIS_WEEK' };
      } else {
        governorDecision = { action: 'NOINDEX', reason: `${daysSinceLastUpdate} days since update, zero inventory. Add noindex until enriched.`, urgency: 'THIS_WEEK' };
      }
      break;
    case 'CONSOLIDATE':
      governorDecision = { action: 'CONSOLIDATE', reason: 'Thin inventory with minimal signals. Merge into stronger parent hub.', urgency: 'THIS_MONTH', suggestedMergeTarget: profile.url.split('/').slice(0, -1).join('/') || '/jobs' };
      break;
    case 'REMOVE':
      governorDecision = {
        action: 'REMOVE',
        reason: 'Zero impressions for 90+ days, zero inventory. Return 410 (job pages) or 301 to parent (hub pages).',
        urgency: 'IMMEDIATE',
      };
      break;
  }

  return {
    ...profile,
    lifecycleState,
    impressionDeltaPct: Math.round(impressionDeltaPct * 10) / 10,
    clickDeltaPct: Math.round(clickDeltaPct * 10) / 10,
    staleDaysThreshold,
    daysSinceLastUpdate,
    governorDecision,
  };
}

export function batchClassifyUrls(profiles: FreshnessInput[]): UrlFreshnessProfile[] {
  return profiles.map(classifyUrlLifecycle);
}

export interface StaleUrlReport {
  totalUrls: number;
  byState: Record<UrlLifecycleState, number>;
  immediateActions: UrlFreshnessProfile[];
  thisWeekActions: UrlFreshnessProfile[];
  healthScore: number;
}

export function getStaleUrlReport(profiles: UrlFreshnessProfile[]): StaleUrlReport {
  const byState: Record<UrlLifecycleState, number> = {
    NEW: 0, ACTIVE: 0, GROWING: 0, STABLE: 0, DECLINING: 0, STALE: 0, CONSOLIDATE: 0, REMOVE: 0,
  };
  for (const p of profiles) byState[p.lifecycleState]++;

  const healthy = byState.NEW + byState.ACTIVE + byState.GROWING + byState.STABLE;
  const healthScore = profiles.length > 0 ? Math.round((healthy / profiles.length) * 100) : 100;

  return {
    totalUrls: profiles.length,
    byState,
    immediateActions: profiles.filter(p => p.governorDecision.urgency === 'IMMEDIATE'),
    thisWeekActions: profiles.filter(p => p.governorDecision.urgency === 'THIS_WEEK'),
    healthScore,
  };
}
