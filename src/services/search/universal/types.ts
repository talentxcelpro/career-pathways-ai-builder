/**
 * Canonical types for TalentXcel Universal Natural Language Search Engine.
 * Shared across QueryInterpreter, Orchestrator, Module Providers, and UI components.
 */

export type SearchEntityType =
  | 'people'
  | 'jobs'
  | 'talent'
  | 'posts'
  | 'connections'
  | 'companies'
  | 'communities'
  | 'articles'
  | 'courses'
  | 'reels'
  | 'colleges'
  | 'messages';

export type SearchPrimaryIntent =
  | 'people_search'
  | 'job_search'
  | 'talent_search'
  | 'post_search'
  | 'connection_search'
  | 'company_search'
  | 'community_search'
  | 'article_search'
  | 'learning_search'
  | 'reel_search'
  | 'message_search'
  | 'universal';

export type QueryComplexity = 'simple' | 'filtered' | 'complex';

export type TimeRangeFilter = '24h' | '7d' | '30d' | '90d';

export type RelationshipFilter =
  | 'connections'
  | 'pending_requests'
  | 'following'
  | 'followers'
  | 'not_connected';

export type ActivityFilter =
  | 'actively_hiring'
  | 'recently_active'
  | 'recently_joined'
  | 'immediate_joining'
  | 'career_passport_completed'
  | 'high_talentscore';

export type SearchSortBy = 'relevance' | 'recent' | 'salary_desc' | 'popular';

export interface ParsedSearchEntities {
  roles: string[];
  skills: string[];
  locations: string[];
  companies: string[];
  industries: string[];
  education: string[];
  seniority?: 'fresher' | 'junior' | 'mid' | 'senior' | 'lead' | 'executive';
}

export interface ParsedSearchFilters {
  location?: string;
  cities: string[];
  isRemote?: boolean;
  workModes: ('remote' | 'hybrid' | 'onsite')[];
  experienceMin?: number;
  experienceMax?: number;
  isFresher?: boolean;
  isInternship?: boolean;
  employmentTypes: string[];
  salaryMinAnnual?: number;
  salaryMaxAnnual?: number;
  salaryCurrency?: 'INR' | 'USD' | 'AED' | 'GBP' | 'EUR';
  timeRange?: TimeRangeFilter;
  relationship?: RelationshipFilter;
  activities: ActivityFilter[];
  isFree?: boolean;
  skillMatchMode?: 'and' | 'or';
}

export interface ParsedSearchIntent {
  rawQuery: string;
  normalizedQuery: string;
  cleanText: string;
  keywords: string[];
  primaryIntent: SearchPrimaryIntent;
  targetScopes: SearchEntityType[];
  complexity: QueryComplexity;
  entities: ParsedSearchEntities;
  filters: ParsedSearchFilters;
  sortBy: SearchSortBy;
  confidence: number;
  explanationChips: string[];
}

export interface UniversalSearchItem {
  id: string;
  type: SearchEntityType;
  title: string;
  subtitle?: string;
  snippet?: string;
  url: string;
  avatarUrl?: string | null;
  badge?: string;
  score: number;
  matchReasons: string[];
  createdAt?: string;
  metadata: Record<string, unknown>;
}

export interface UniversalSearchGroup {
  type: SearchEntityType;
  label: string;
  items: UniversalSearchItem[];
  totalCount: number;
  hasMore: boolean;
}

export interface EmptyResultAlternative {
  label: string;
  query: string;
  reason: string;
}

export interface SearchUserContext {
  userId?: string | null;
  userRole?: string | null;
  isEmployer?: boolean;
  isRecruiter?: boolean;
  isAdmin?: boolean;
  userLocation?: string | null;
  userSkills?: string[];
}

export interface UniversalSearchOptions {
  /** Restrict search to a specific category or subset of categories */
  scopes?: SearchEntityType[];
  /** Maximum items per category (default: 8) */
  limitPerScope?: number;
  /** Pagination page (default: 1) */
  page?: number;
  /** Override sort order */
  sortBy?: SearchSortBy;
  /** Authenticated user context for permission-aware & personalized search */
  userContext?: SearchUserContext;
  /** Explicit filter overrides from UI */
  filterOverrides?: Partial<ParsedSearchFilters>;
  /** Opt-in to search user's own private messages (never enabled by default) */
  includePrivateMessages?: boolean;
}

export interface UniversalSearchResponse {
  query: string;
  intent: ParsedSearchIntent;
  groups: Partial<Record<SearchEntityType, UniversalSearchGroup>>;
  topResults: UniversalSearchItem[];
  totalCount: number;
  latencyMs: number;
  source: 'cache' | 'dedup' | 'live';
  suggestions: string[];
  emptyAlternatives: EmptyResultAlternative[];
  errors: Partial<Record<SearchEntityType, string>>;
}

export interface SearchProviderContext {
  intent: ParsedSearchIntent;
  limit: number;
  page: number;
  userContext: SearchUserContext;
}

export interface SearchProviderOutput {
  type: SearchEntityType;
  items: UniversalSearchItem[];
  totalCount: number;
  hasMore: boolean;
}

export interface UniversalSearchProvider {
  readonly type: SearchEntityType;
  readonly label: string;
  search(ctx: SearchProviderContext): Promise<SearchProviderOutput>;
}
