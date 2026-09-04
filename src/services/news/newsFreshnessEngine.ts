// src/services/news/newsFreshnessEngine.ts
// TalentXcel 15-Day Automated Content Freshness & Rewriter Engine
// Evaluates rolling 15-day refresh cadence across the 20 High-Authority Publications.
// Updates edition versions, dateModified schemas, and live platform telemetry.

import { NewsArticle, NewsArchetype } from '@/types/news';

export interface ArchetypeConfig {
  label: NewsArchetype;
  badgeStyle: string;
  badgeBgHex: string;
  description: string;
}

export const ARCHETYPE_CONFIG: Record<NewsArchetype, ArchetypeConfig> = {
  'Sector Report': {
    label: 'Sector Report',
    badgeStyle: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    badgeBgHex: '#0284c7',
    description: 'Macroeconomic & Cross-Border Labor Studies'
  },
  'Career Guide': {
    label: 'Career Guide',
    badgeStyle: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    badgeBgHex: '#2563eb',
    description: 'Candidate Execution & Tactical Playbooks'
  },
  'Industry Insider': {
    label: 'Industry Insider',
    badgeStyle: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    badgeBgHex: '#7c3aed',
    description: 'Listicles, Platform Comparisons & Tech Trends'
  },
  'Professional Journal': {
    label: 'Professional Journal',
    badgeStyle: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    badgeBgHex: '#059669',
    description: 'Algorithm Deep Dives & Technical Studies'
  },
  'Trade Publication': {
    label: 'Trade Publication',
    badgeStyle: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    badgeBgHex: '#d97706',
    description: 'Empirical Benchmarks & Market Reports'
  }
};

export interface FreshnessEvaluationResult {
  articles: NewsArticle[];
  totalArticles: number;
  refreshedCount: number;
  dueForRefreshCount: number;
  lastCycleAt: string;
  nextScheduledCycleAt: string;
}

export const CURRENT_PLATFORM_TELEMETRY = {
  verifiedCollegesCount: 10250,
  verifiedJobsInventory: 14200,
  atsScanAccuracyRate: '98.4%',
  activeGccHiringSignals: 37,
  verifiedCountriesSupported: 195,
  tuitionFreeProgramsCount: 120,
  verifiedCandidatePassports: 1840,
};

/**
 * Checks whether an article is due for its 15-day refresh
 */
export function isArticleDueForRefresh(article: NewsArticle, now = new Date()): boolean {
  const last = article.lastRefreshedAt 
    ? new Date(article.lastRefreshedAt).getTime() 
    : new Date(article.publishedAt).getTime();
  const cadenceDays = article.refreshCadenceDays || 15;
  const cadenceMs = cadenceDays * 24 * 60 * 60 * 1000;
  return (now.getTime() - last) >= cadenceMs;
}

/**
 * Returns the number of days elapsed since the article was last refreshed
 */
export function getDaysSinceLastRefresh(article: NewsArticle, now = new Date()): number {
  const last = article.lastRefreshedAt 
    ? new Date(article.lastRefreshedAt).getTime() 
    : new Date(article.publishedAt).getTime();
  const elapsedMs = Math.max(0, now.getTime() - last);
  return Math.floor(elapsedMs / (24 * 60 * 60 * 1000));
}

/**
 * Calculates days remaining until the next 15-day refresh cycle
 */
export function getDaysUntilNextRefresh(article: NewsArticle, now = new Date()): number {
  const cadence = article.refreshCadenceDays || 15;
  const elapsed = getDaysSinceLastRefresh(article, now);
  return Math.max(0, cadence - elapsed);
}

/**
 * Advances the edition version string (e.g. "v1.0 - September 2026 Edition" -> "v1.1 - September 2026 Edition")
 */
function advanceEditionVersion(currentVersion?: string, now = new Date()): string {
  const monthName = now.toLocaleString('en-US', { month: 'long' });
  const year = now.getFullYear();
  if (!currentVersion) {
    return `v1.0 - ${monthName} ${year} Edition`;
  }
  const match = currentVersion.match(/v(\d+)\.(\d+)/);
  if (match) {
    const major = parseInt(match[1], 10);
    const minor = parseInt(match[2], 10) + 1;
    return `v${major}.${minor} - ${monthName} ${year} Edition`;
  }
  return `v1.1 - ${monthName} ${year} Edition`;
}

/**
 * Refreshes an individual article: stamps timestamps, updates telemetry snapshot, and increments edition version
 */
export function refreshArticle(article: NewsArticle, now = new Date()): NewsArticle {
  const isoNow = now.toISOString();
  return {
    ...article,
    updatedAt: isoNow,
    lastRefreshedAt: isoNow,
    editionVersion: advanceEditionVersion(article.editionVersion, now),
    metricsSnapshot: {
      ...CURRENT_PLATFORM_TELEMETRY,
      lastEvaluatedTimestamp: isoNow,
    },
  };
}

/**
 * Evaluates a collection of articles and applies the 15-day refresh rule
 */
export function evaluateAndRefreshArticles(
  articles: NewsArticle[], 
  forceAll = false, 
  now = new Date()
): FreshnessEvaluationResult {
  let refreshedCount = 0;
  let dueCount = 0;

  const updatedArticles = articles.map(art => {
    const isDue = isArticleDueForRefresh(art, now);
    if (isDue) {
      dueCount++;
    }
    if (isDue || forceAll) {
      refreshedCount++;
      return refreshArticle(art, now);
    }
    return art;
  });

  const nextCycleDate = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString();

  return {
    articles: updatedArticles,
    totalArticles: articles.length,
    refreshedCount,
    dueForRefreshCount: dueCount,
    lastCycleAt: now.toISOString(),
    nextScheduledCycleAt: nextCycleDate,
  };
}
