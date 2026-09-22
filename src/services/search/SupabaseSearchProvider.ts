// SupabaseSearchProvider — ₹0 Scale Search Engine with Search Traffic Governor
//
// Request flow (Supabase is the last resort, not the first hit):
//
//   searchJobs(params)
//     │
//     ├─ normalize query
//     │
//     ├─ Layer 1: Browser LRU cache (3-min TTL, 100 slots)
//     │    └─ HIT → return fresh result
//     │
//     ├─ Layer 2: In-Flight Deduplication
//     │    └─ HIT → await existing Promise (0 extra DB calls)
//     │
//     ├─ Layer 3: Concurrency Governor (default MAX=8, env-configurable)
//     │    ├─ slots free → proceed immediately
//     │    └─ slots full → queue with 200ms back-off, max 2s wait
//     │          ├─ resolved → re-check cache + inFlight before proceeding
//     │          └─ timeout → stale cache if available, else SEARCH_TEMPORARILY_UNAVAILABLE
//     │                       (NEVER silently return [] — [] means no matching jobs)
//     │
//     └─ Layer 4: Supabase RPC → cache result → return
//
// Race-condition guarantees:
//   - activeCount++ is synchronous (no await before it) so governor sees correct count
//   - inFlight.set() is synchronous (before the async IIFE) so dedup works for concurrent callers
//
// Feature flag:
//   VITE_SEARCH_GOVERNOR_ENABLED=false  → skip governor; still uses cache + dedup
//   VITE_SEARCH_MAX_CONCURRENT=N        → override concurrency ceiling (default 8)

import { supabase } from '@/integrations/supabase/client';
import type { SearchProvider, SearchParams, SearchResult, SearchStats } from './SearchProvider';

interface CacheEntry {
  result: SearchResult;
  timestamp: number;
}

const MAX_CONCURRENT: number = Number(
  (import.meta as any).env?.VITE_SEARCH_MAX_CONCURRENT ?? 8
);

const GOVERNOR_ENABLED: boolean =
  ((import.meta as any).env?.VITE_SEARCH_GOVERNOR_ENABLED ?? 'true') !== 'false';

const QUEUE_BACKOFF_MS = 200;
const QUEUE_MAX_WAIT_MS = 2000;

export class SupabaseSearchProvider implements SearchProvider {
  readonly name = 'supabase';

  // ── LRU Cache ────────────────────────────────────────────────────────────
  private cache = new Map<string, CacheEntry>();
  private readonly CACHE_TTL_MS = 3 * 60 * 1000;
  private readonly MAX_CACHE_SIZE = 100;

  // ── In-Flight Deduplication ───────────────────────────────────────────────
  // Populated SYNCHRONOUSLY before any await so concurrent identical calls share one RPC.
  private inFlight = new Map<string, Promise<SearchResult>>();

  // ── Concurrency Governor ─────────────────────────────────────────────────
  // Incremented SYNCHRONOUSLY before any await.
  private activeCount = 0;

  // ── Telemetry (in-memory, resets on page reload) ──────────────────────────
  private stats: SearchStats = {
    totalSearchCalls: 0,
    cacheHits: 0,
    dedupHits: 0,
    dbCalls: 0,
    governorQueued: 0,
    governorDropped: 0,
    cacheHitRate: '0.0%',
    dedupRate: '0.0%',
    dbCallRate: '0.0%',
    activeNow: 0,
    maxActiveObserved: 0,
    estimatedEgressKB: 0
  };

  // ─── Query Normalization ──────────────────────────────────────────────────

  private normalizeString(s: string | undefined): string {
    return (s || '').trim().toLowerCase().replace(/\s+/g, ' ');
  }

  private getCacheKey(params: SearchParams): string {
    const n = {
      q: this.normalizeString(params.query),
      loc: this.normalizeString(params.location),
      emp: (params.employment_types || []).map(s => s.trim().toLowerCase()).sort(),
      exp: (params.experience_levels || []).map(s => s.trim().toLowerCase()).sort(),
      minSal: params.min_salary || 0,
      maxSal: params.max_salary || 0,
      remote: Boolean(params.is_remote),
      skills: (params.skills || []).map(s => s.trim().toLowerCase()).sort(),
      page: Math.max(1, params.page || 1),
      limit: Math.min(50, Math.max(1, params.limit || 20)),
      sort: (params.sortBy || 'created_at').trim().toLowerCase()
    };
    return `jobs-search:${JSON.stringify(n)}`;
  }

  // ─── LRU Cache Utilities ──────────────────────────────────────────────────

  private getFreshCached(key: string): SearchResult | null {
    const e = this.cache.get(key);
    if (!e) return null;
    return Date.now() - e.timestamp < this.CACHE_TTL_MS ? e.result : null;
  }

  private getStaleCached(key: string): SearchResult | null {
    const e = this.cache.get(key);
    return e ? { ...e.result, source: 'cache', stale: true } : null;
  }

  private setCached(key: string, result: SearchResult): void {
    // Prune expired entries
    const now = Date.now();
    for (const [k, v] of this.cache.entries()) {
      if (now - v.timestamp > this.CACHE_TTL_MS) this.cache.delete(k);
    }
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const oldest = this.cache.keys().next().value;
      if (oldest) this.cache.delete(oldest);
    }
    this.cache.set(key, { result, timestamp: now });
  }

  clearCache(): void { this.cache.clear(); }

  // ─── Telemetry ────────────────────────────────────────────────────────────

  private pct(n: number, total: number): string {
    return total > 0 ? `${((n / total) * 100).toFixed(1)}%` : '0.0%';
  }

  private updateRates(): void {
    const t = this.stats.totalSearchCalls;
    this.stats.cacheHitRate = this.pct(this.stats.cacheHits, t);
    this.stats.dedupRate = this.pct(this.stats.dedupHits, t);
    this.stats.dbCallRate = this.pct(this.stats.dbCalls, t);
    this.stats.estimatedEgressKB = Math.round(this.stats.dbCalls * 3.01);
    this.stats.activeNow = this.activeCount;
  }

  getStats(): SearchStats {
    this.updateRates();
    return { ...this.stats };
  }

  // ─── Concurrency Governor: wait for a free slot ──────────────────────────

  private waitForSlot(): Promise<void> {
    return new Promise((resolve, reject) => {
      const started = Date.now();
      const tryAcquire = () => {
        if (this.activeCount < MAX_CONCURRENT) { resolve(); return; }
        if (Date.now() - started >= QUEUE_MAX_WAIT_MS) {
          this.stats.governorDropped++;
          reject(new Error('GOVERNOR_TIMEOUT'));
          return;
        }
        setTimeout(tryAcquire, QUEUE_BACKOFF_MS);
      };
      tryAcquire();
    });
  }

  // ─── Core RPC Execution ───────────────────────────────────────────────────

  private async executeRpc(params: SearchParams): Promise<SearchResult> {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(50, Math.max(1, params.limit || 20));
    const start = performance.now();

    const { data, error } = await supabase.rpc('get_jobs_paginated_optimized', {
      p_page: page,
      p_limit: limit,
      p_search: this.normalizeString(params.query),
      p_location: this.normalizeString(params.location),
      p_employment_types: params.employment_types || [],
      p_experience_levels: params.experience_levels || [],
      p_min_salary: params.min_salary || 0,
      p_max_salary: params.max_salary || 0,
      p_is_remote: params.is_remote || false,
      p_skills: params.skills || [],
      p_sort_by: (params.sortBy || 'created_at').trim()
    });

    if (error) throw error;

    const latencyMs = Math.round(performance.now() - start);
    const validJobs = (data?.jobs || [])
      .filter((j: any) => (!j.expires_at || new Date(j.expires_at) > new Date()) && j.id && j.title)
      .map((j: any) => {
        const snippet = j.description_snippet || (
          j.description && j.description.length > 200
            ? j.description.substring(0, 200)
            : j.description || ''
        );
        return { ...j, description: snippet, description_snippet: snippet };
      });

    return {
      jobs: validJobs,
      totalCount: data?.total_count || 0,
      hasMore: data?.has_more || false,
      source: 'supabase',
      latencyMs
    };
  }

  /**
   * Dispatches an RPC call with:
   * - Synchronous inFlight registration (BEFORE any await)
   * - Cleanup in finally (activeCount--, inFlight.delete)
   *
   * IMPORTANT: caller must increment activeCount and dbCalls BEFORE calling this.
   */
  private dispatchRpc(cacheKey: string, params: SearchParams): Promise<SearchResult> {
    let resolve!: (r: SearchResult) => void;
    let reject!: (e: any) => void;
    const promise: Promise<SearchResult> = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });

    // Register SYNCHRONOUSLY so any concurrent call at Layer 2 finds this entry.
    this.inFlight.set(cacheKey, promise);

    (async () => {
      try {
        const result = await this.executeRpc(params);
        this.setCached(cacheKey, result);
        resolve(result);
      } catch (err: any) {
        console.warn('[SupabaseSearchProvider] RPC failed:', err?.message || err);
        reject(err);
      } finally {
        this.activeCount--;
        this.inFlight.delete(cacheKey);
        this.updateRates();
      }
    })();

    return promise;
  }

  // ─── Primary Search Entry Point ───────────────────────────────────────────

  async searchJobs(params: SearchParams): Promise<SearchResult> {
    this.stats.totalSearchCalls++;
    const cacheKey = this.getCacheKey(params);

    // ── Layer 1: Browser LRU Cache ──────────────────────────────────────────
    const fresh = this.getFreshCached(cacheKey);
    if (fresh) {
      this.stats.cacheHits++;
      this.updateRates();
      return { ...fresh, source: 'cache', latencyMs: 0 };
    }

    // ── Layer 2: In-Flight Deduplication ────────────────────────────────────
    const existing = this.inFlight.get(cacheKey);
    if (existing) {
      this.stats.dedupHits++;
      this.updateRates();
      return { ...(await existing), source: 'dedup', latencyMs: 0 };
    }

    // ── Bypass governor if disabled ─────────────────────────────────────────
    if (!GOVERNOR_ENABLED) {
      // Synchronously increment before dispatchRpc (which sets inFlight before any await)
      this.activeCount++;
      this.stats.dbCalls++;
      if (this.activeCount > this.stats.maxActiveObserved) this.stats.maxActiveObserved = this.activeCount;
      this.updateRates();
      return this.dispatchRpc(cacheKey, params);
    }

    // ── Layer 3: Concurrency Governor ───────────────────────────────────────
    if (this.activeCount >= MAX_CONCURRENT) {
      this.stats.governorQueued++;
      try {
        await this.waitForSlot();
      } catch (err: any) {
        if (err?.message === 'GOVERNOR_TIMEOUT') {
          // Prefer stale cache over a misleading empty result.
          const stale = this.getStaleCached(cacheKey);
          if (stale) {
            console.warn('[SearchGovernor] Timeout — returning stale cache');
            return stale;
          }
          // No stale available. Surface explicit error — NEVER silently return [].
          // [] means "no matching jobs". Overload must not look like zero results.
          throw new Error('SEARCH_TEMPORARILY_UNAVAILABLE');
        }
        throw err;
      }

      // After queuing, re-check: another call may have resolved this key while we waited.
      const freshAfterWait = this.getFreshCached(cacheKey);
      if (freshAfterWait) {
        this.stats.cacheHits++;
        this.updateRates();
        return { ...freshAfterWait, source: 'cache', latencyMs: 0 };
      }
      const inFlightAfterWait = this.inFlight.get(cacheKey);
      if (inFlightAfterWait) {
        this.stats.dedupHits++;
        this.updateRates();
        return { ...(await inFlightAfterWait), source: 'dedup', latencyMs: 0 };
      }
    }

    // ── Layer 4: Supabase RPC ────────────────────────────────────────────────
    // Increment activeCount synchronously (no await between here and dispatchRpc)
    // so the governor sees the correct count for the next concurrent caller.
    this.activeCount++;
    this.stats.dbCalls++;
    if (this.activeCount > this.stats.maxActiveObserved) this.stats.maxActiveObserved = this.activeCount;
    this.updateRates();

    return this.dispatchRpc(cacheKey, params);
  }
}
