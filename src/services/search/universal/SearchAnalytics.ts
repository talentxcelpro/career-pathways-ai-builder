import type { ParsedSearchIntent, SearchEntityType } from './types';

export interface SearchAnalyticsEvent {
  timestamp: number;
  intent: ParsedSearchIntent['primaryIntent'];
  complexity: ParsedSearchIntent['complexity'];
  scopes: SearchEntityType[];
  resultCount: number;
  latencyMs: number;
  source: 'cache' | 'dedup' | 'live';
  isZeroResult: boolean;
}

export interface SearchAnalyticsSummary {
  totalSearches: number;
  zeroResultCount: number;
  avgLatencyMs: number;
  cacheHitCount: number;
  topIntents: Array<{ intent: string; count: number }>;
  recentClicks: Array<{ type: SearchEntityType; id: string; timestamp: number }>;
}

const RECENT_SEARCHES_STORAGE_KEY = 'txc_universal_recent_searches';
const MAX_RECENT_SEARCHES = 10;
const MAX_EVENTS = 200;

/**
 * Lightweight, privacy-safe search analytics.
 * Never logs private message content, PII, or secrets.
 */
class SearchAnalyticsService {
  private events: SearchAnalyticsEvent[] = [];
  private clicks: Array<{ type: SearchEntityType; id: string; timestamp: number }> = [];

  recordSearch(params: {
    intent: ParsedSearchIntent;
    resultCount: number;
    latencyMs: number;
    source: 'cache' | 'dedup' | 'live';
  }): void {
    // Never store private message query strings in recent history
    if (params.intent.primaryIntent !== 'message_search' && params.intent.rawQuery.trim().length >= 2) {
      this.saveRecentQuery(params.intent.rawQuery.trim());
    }

    this.events.push({
      timestamp: Date.now(),
      intent: params.intent.primaryIntent,
      complexity: params.intent.complexity,
      scopes: params.intent.targetScopes,
      resultCount: params.resultCount,
      latencyMs: params.latencyMs,
      source: params.source,
      isZeroResult: params.resultCount === 0,
    });

    if (this.events.length > MAX_EVENTS) {
      this.events = this.events.slice(-MAX_EVENTS);
    }
  }

  recordResultClick(type: SearchEntityType, id: string): void {
    this.clicks.push({ type, id, timestamp: Date.now() });
    if (this.clicks.length > MAX_EVENTS) {
      this.clicks = this.clicks.slice(-MAX_EVENTS);
    }
  }

  getRecentSearches(): string[] {
    try {
      if (typeof localStorage === 'undefined') return [];
      const raw = localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter((s) => typeof s === 'string') : [];
    } catch {
      return [];
    }
  }

  clearRecentSearches(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(RECENT_SEARCHES_STORAGE_KEY);
      }
    } catch {
      // ignore storage errors
    }
  }

  private saveRecentQuery(query: string): void {
    try {
      if (typeof localStorage === 'undefined') return;
      const existing = this.getRecentSearches();
      const updated = [query, ...existing.filter((q) => q.toLowerCase() !== query.toLowerCase())].slice(
        0,
        MAX_RECENT_SEARCHES
      );
      localStorage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore storage errors
    }
  }

  getSummary(): SearchAnalyticsSummary {
    const total = this.events.length;
    const zeroResultCount = this.events.filter((e) => e.isZeroResult).length;
    const cacheHitCount = this.events.filter((e) => e.source === 'cache' || e.source === 'dedup').length;
    const avgLatencyMs =
      total > 0 ? Math.round(this.events.reduce((acc, e) => acc + e.latencyMs, 0) / total) : 0;

    const intentCounts = new Map<string, number>();
    for (const ev of this.events) {
      intentCounts.set(ev.intent, (intentCounts.get(ev.intent) || 0) + 1);
    }

    const topIntents = Array.from(intentCounts.entries())
      .map(([intent, count]) => ({ intent, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalSearches: total,
      zeroResultCount,
      avgLatencyMs,
      cacheHitCount,
      topIntents,
      recentClicks: this.clicks.slice(-20),
    };
  }
}

export const searchAnalytics = new SearchAnalyticsService();
