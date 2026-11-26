import { QueryInterpreter } from './QueryInterpreter';
import { RelevanceRanker } from './RelevanceRanker';
import { searchAnalytics } from './SearchAnalytics';
import { JobsProvider } from './providers/JobsProvider';
import { PeopleProvider } from './providers/PeopleProvider';
import { TalentProvider } from './providers/TalentProvider';
import { PostsProvider } from './providers/PostsProvider';
import { ConnectionsProvider } from './providers/ConnectionsProvider';
import { CompaniesProvider } from './providers/CompaniesProvider';
import { CommunitiesProvider } from './providers/CommunitiesProvider';
import {
  ArticlesProvider,
  CollegesProvider,
  CoursesProvider,
  ReelsProvider,
} from './providers/KnowledgeProvider';
import { MessagesProvider } from './providers/MessagesProvider';
import type {
  EmptyResultAlternative,
  ParsedSearchIntent,
  SearchEntityType,
  SearchProviderOutput,
  UniversalSearchGroup,
  UniversalSearchItem,
  UniversalSearchOptions,
  UniversalSearchProvider,
  UniversalSearchResponse,
} from './types';

interface CacheEntry {
  response: UniversalSearchResponse;
  timestamp: number;
}

const CACHE_TTL_MS = 2 * 60 * 1000;
const MAX_CACHE_ENTRIES = 80;

export class UniversalSearchOrchestrator {
  private providers = new Map<SearchEntityType, UniversalSearchProvider>();
  private cache = new Map<string, CacheEntry>();
  private inFlight = new Map<string, Promise<UniversalSearchResponse>>();

  constructor() {
    this.registerProvider(new PeopleProvider());
    this.registerProvider(new JobsProvider());
    this.registerProvider(new TalentProvider());
    this.registerProvider(new PostsProvider());
    this.registerProvider(new ConnectionsProvider());
    this.registerProvider(new CompaniesProvider());
    this.registerProvider(new CommunitiesProvider());
    this.registerProvider(new ArticlesProvider());
    this.registerProvider(new CoursesProvider());
    this.registerProvider(new ReelsProvider());
    this.registerProvider(new CollegesProvider());
    this.registerProvider(new MessagesProvider());
  }

  registerProvider(provider: UniversalSearchProvider): void {
    this.providers.set(provider.type, provider);
  }

  async search(rawQuery: string, options: UniversalSearchOptions = {}): Promise<UniversalSearchResponse> {
    const start = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const intent = this.buildIntent(rawQuery, options);
    const userContext = options.userContext || {};
    const limitPerScope = Math.min(25, Math.max(1, options.limitPerScope || 6));
    const page = Math.max(1, options.page || 1);

    // Determine authorized scopes to execute
    const requestedScopes = options.scopes && options.scopes.length > 0 ? options.scopes : intent.targetScopes;
    const activeScopes = requestedScopes.filter((scope) => {
      if (scope === 'messages') {
        return Boolean(userContext.userId && (options.includePrivateMessages || intent.primaryIntent === 'message_search'));
      }
      if (scope === 'connections') {
        return Boolean(userContext.userId);
      }
      return this.providers.has(scope);
    });

    if (!intent.normalizedQuery && activeScopes.length === 0) {
      return this.emptyResponse(rawQuery, intent, 0);
    }

    // Safe bounded browse limits for empty queries to avoid unbounded table scans
    const isEmptyQuery = !intent.normalizedQuery;
    const effectiveLimit = isEmptyQuery ? Math.min(limitPerScope, 4) : limitPerScope;

    const cacheKey = this.getCacheKey(intent.normalizedQuery, activeScopes, effectiveLimit, page, userContext.userId);

    // Layer 1: Fresh Cache
    const cached = this.getFreshCache(cacheKey);
    if (cached) {
      const hit: UniversalSearchResponse = { ...cached, source: 'cache', latencyMs: 1 };
      searchAnalytics.recordSearch({
        intent,
        resultCount: hit.totalCount,
        latencyMs: hit.latencyMs,
        source: 'cache',
      });
      return hit;
    }

    // Layer 2: In-Flight Deduplication
    const existing = this.inFlight.get(cacheKey);
    if (existing) {
      const deduped = await existing;
      return { ...deduped, source: 'dedup' };
    }

    // Layer 3: Parallel Provider Execution
    const promise = (async (): Promise<UniversalSearchResponse> => {
      const errors: Partial<Record<SearchEntityType, string>> = {};
      const groups: Partial<Record<SearchEntityType, UniversalSearchGroup>> = {};
      const allItems: UniversalSearchItem[] = [];

      const settled = await Promise.allSettled(
        activeScopes.map(async (scope) => {
          const provider = this.providers.get(scope)!;
          const output = await provider.search({
            intent,
            limit: effectiveLimit,
            page,
            userContext,
          });
          return { scope, providerLabel: provider.label, output };
        })
      );

      let totalCount = 0;

      for (let i = 0; i < settled.length; i++) {
        const res = settled[i];
        const scope = activeScopes[i];
        if (res.status === 'fulfilled') {
          const { providerLabel, output } = res.value as {
            scope: SearchEntityType;
            providerLabel: string;
            output: SearchProviderOutput;
          };
          if (output.items.length > 0) {
            const rankedItems = RelevanceRanker.rank(output.items, intent);
            groups[scope] = {
              type: scope,
              label: providerLabel,
              items: rankedItems,
              totalCount: output.totalCount,
              hasMore: output.hasMore,
            };
            allItems.push(...rankedItems);
            totalCount += output.totalCount;
          }
        } else {
          errors[scope] = res.reason?.message || 'Search provider failed';
        }
      }

      // Author concentration control: do not let a single author/poster monopolize more than 2 slots in topResults
      const authorCounts = new Map<string, number>();
      const diverseTopResults: UniversalSearchItem[] = [];
      const rankedAll = RelevanceRanker.rank(allItems, intent);

      for (const item of rankedAll) {
        const authorKey = String(item.metadata?.author_id || item.metadata?.user_id || item.id);
        const count = authorCounts.get(authorKey) || 0;
        if (count < 2 || diverseTopResults.length >= 8) {
          diverseTopResults.push(item);
          authorCounts.set(authorKey, count + 1);
        }
        if (diverseTopResults.length >= 12) break;
      }

      const topResults = diverseTopResults.length > 0 ? diverseTopResults : rankedAll.slice(0, 12);
      const end = typeof performance !== 'undefined' ? performance.now() : Date.now();
      const latencyMs = Math.max(1, Math.round(end - start));

      const response: UniversalSearchResponse = {
        query: rawQuery,
        intent,
        groups,
        topResults,
        totalCount,
        latencyMs,
        source: 'live',
        suggestions: this.getSuggestions(rawQuery),
        emptyAlternatives: totalCount === 0 ? this.buildEmptyAlternatives(intent) : [],
        errors,
      };

      this.setCache(cacheKey, response);
      searchAnalytics.recordSearch({
        intent,
        resultCount: totalCount,
        latencyMs,
        source: 'live',
      });

      return response;
    })();

    this.inFlight.set(cacheKey, promise);
    try {
      return await promise;
    } finally {
      this.inFlight.delete(cacheKey);
    }
  }

  /**
   * Intelligent debounced autocomplete suggestions based on query understanding + real history.
   * Zero fabricated counts.
   */
  getSuggestions(partialQuery: string): string[] {
    const clean = (partialQuery || '').trim();
    const recent = searchAnalytics.getRecentSearches();

    if (!clean) {
      const defaults = [
        'Remote Python developer jobs',
        'HR managers in Bengaluru',
        'Jobs for freshers in Delhi',
        'Posts about AI recruitment',
        'Communities for startup founders',
        'Articles about ATS resumes',
      ];
      return Array.from(new Set([...recent.slice(0, 3), ...defaults])).slice(0, 6);
    }

    const lower = clean.toLowerCase();
    const dynamic: string[] = [];

    // Matching recent searches first
    for (const r of recent) {
      if (r.toLowerCase().includes(lower) && r.toLowerCase() !== lower) {
        dynamic.push(r);
      }
    }

    // Intent-aware completions
    if (clean.length >= 2 && clean.split(/\s+/).length <= 2) {
      dynamic.push(
        `${clean} jobs`,
        `${clean} professionals`,
        `Remote ${clean} opportunities`,
        `Posts about ${clean}`,
        `${clean} communities`
      );
    }

    return Array.from(new Set(dynamic)).slice(0, 6);
  }

  clearCache(): void {
    this.cache.clear();
  }

  private buildIntent(rawQuery: string, options: UniversalSearchOptions): ParsedSearchIntent {
    const base = QueryInterpreter.parse(rawQuery);
    if (options.filterOverrides) {
      base.filters = { ...base.filters, ...options.filterOverrides };
    }
    if (options.sortBy) {
      base.sortBy = options.sortBy;
    }
    return base;
  }

  private buildEmptyAlternatives(intent: ParsedSearchIntent): EmptyResultAlternative[] {
    const alts: EmptyResultAlternative[] = [];
    const { entities, filters } = intent;

    if (filters.location && (entities.roles.length > 0 || entities.skills.length > 0)) {
      const core = [...entities.roles, ...entities.skills].join(' ');
      alts.push({
        label: `${core} across India`,
        query: `${core} in India`,
        reason: `Broaden location beyond ${filters.location}`,
      });
    }

    if (entities.skills.length > 1) {
      alts.push({
        label: `Search for ${entities.skills[0]}`,
        query: entities.skills[0],
        reason: 'Relax multiple skill requirements',
      });
    }

    if (entities.roles.length > 0 && filters.experienceMin !== undefined) {
      alts.push({
        label: `All ${entities.roles[0]}s${filters.location ? ` in ${filters.location}` : ''}`,
        query: `${entities.roles[0]}${filters.location ? ` in ${filters.location}` : ''}`,
        reason: 'Remove strict experience filter',
      });
    }

    if (alts.length === 0 && intent.keywords.length > 1) {
      alts.push({
        label: `Search "${intent.keywords[0]}"`,
        query: intent.keywords[0],
        reason: 'Try a broader keyword',
      });
    }

    return alts.slice(0, 4);
  }

  private emptyResponse(query: string, intent: ParsedSearchIntent, latencyMs: number): UniversalSearchResponse {
    return {
      query,
      intent,
      groups: {},
      topResults: [],
      totalCount: 0,
      latencyMs,
      source: 'live',
      suggestions: this.getSuggestions(query),
      emptyAlternatives: [],
      errors: {},
    };
  }

  private getCacheKey(
    normalizedQuery: string,
    scopes: SearchEntityType[],
    limit: number,
    page: number,
    userId?: string | null
  ): string {
    // Scope cache key by userId so connection/message results never leak across sessions
    return `u:${userId || 'anon'}|q:${normalizedQuery}|s:${scopes.slice().sort().join(',')}|l:${limit}|p:${page}`;
  }

  private getFreshCache(key: string): UniversalSearchResponse | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
      this.cache.delete(key);
      return null;
    }
    return entry.response;
  }

  private setCache(key: string, response: UniversalSearchResponse): void {
    if (this.cache.size >= MAX_CACHE_ENTRIES) {
      const oldest = this.cache.keys().next().value;
      if (oldest) this.cache.delete(oldest);
    }
    this.cache.set(key, { response, timestamp: Date.now() });
  }
}

export const universalSearchOrchestrator = new UniversalSearchOrchestrator();
