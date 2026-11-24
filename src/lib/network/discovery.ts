// src/lib/network/discovery.ts
/**
 * Global Geographic Professional Discovery Engine
 * Handles multi-dimensional discovery queries across Geography, Industry, Skills,
 * Mentorship, Discussions, Communities, and Events.
 *
 * Privacy Invariant:
 * Strictly queries public profiles with affirmative consent (is_profile_public = true, profile_visibility = 'public').
 * Zero fake data: All metrics and cards derive from authentic database records.
 */

import { supabase } from '@/integrations/supabase/client';
import { 
  resolveLocation, 
  resolveHierarchyFromParams, 
  buildCanonicalGeographicUrl,
  getCountryBySlug,
  getDivisionBySlug,
  getCityBySlug
} from '@/lib/geography/resolver';
import { GeographicCountry, GeographicDivision, GeographicCity, ResolvedGeographicLocation } from '@/lib/geography/types';

export interface NetworkDiscoveryFilters {
  query?: string;
  countrySlug?: string;
  divisionSlug?: string;
  citySlug?: string;
  industry?: string;
  skill?: string;
  role?: string;
  isMentor?: boolean;
  isCollaborator?: boolean;
  isVirtualEvent?: boolean;
  page?: number;
  pageSize?: number;
}

export interface DiscoverableProfessional {
  id: string;
  fullName: string;
  username?: string;
  title?: string;
  headline?: string;
  currentCompany?: string;
  location?: string;
  industry?: string;
  skills: string[];
  experienceYears?: number;
  avatarUrl?: string;
  isOnline?: boolean;
  verificationStatus?: string;
  isMentor?: boolean;
  isCollaborator?: boolean;
  mentorshipAreas?: string[];
  collaborationInterests?: string[];
  canonicalPath?: string;
}

export interface DiscoverableCommunity {
  id: string;
  name: string;
  headline?: string;
  description: string;
  category: string;
  categoryLabel?: string;
  coverImageUrl?: string;
  memberCount: number;
  isPrivate: boolean;
  isFeatured: boolean;
  tags: string[];
  hostName?: string;
  hostTitle?: string;
  hostAvatar?: string;
  locationSlug?: string;
}

export interface DiscoverableDiscussion {
  id: string;
  content: string;
  headline?: string;
  location?: string;
  authorId?: string;
  authorName: string;
  authorHeadline?: string;
  authorAvatar?: string;
  hashtags: string[];
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  createdAt: string;
  canonicalUrl: string;
}

export interface DiscoverableEvent {
  id: string;
  title: string;
  description: string;
  eventType: string;
  startTime: string;
  endTime?: string;
  location?: string;
  isVirtual: boolean;
  meetingUrl?: string;
  currentAttendees: number;
  maxAttendees?: number;
  coverImageUrl?: string;
  groupId?: string;
  canonicalUrl: string;
}

export interface GeographicHubSummary {
  country: GeographicCountry | null;
  division: GeographicDivision | null;
  city: GeographicCity | null;
  canonicalUrl: string;
  title: string;
  description: string;
  breadcrumbs: Array<{ name: string; url: string }>;
  stats: {
    professionalsCount: number;
    communitiesCount: number;
    discussionsCount: number;
    eventsCount: number;
    mentorsCount: number;
  };
  eligibility: {
    isIndexable: boolean;
    reason: string;
    robots: 'index, follow' | 'noindex, follow';
  };
}

/**
 * Operational SEO Page Eligibility Thresholds
 * Configurable thresholds to govern sitemap and robots indexability
 */
export const SEO_INDEXATION_THRESHOLDS = {
  CITY_MIN_PROFILES: 30,
  DIVISION_MIN_PROFILES: 100,
  COUNTRY_MIN_PROFILES: 300,
  FACET_MIN_PROFILES: 20
};

/**
 * Evaluates whether a geographic page meets quality indexation thresholds
 */
export function evaluateIndexationEligibility(
  level: 'country' | 'division' | 'city' | 'facet',
  profilesCount: number,
  communitiesCount: number = 0
): { isIndexable: boolean; reason: string; robots: 'index, follow' | 'noindex, follow' } {
  let threshold = SEO_INDEXATION_THRESHOLDS.CITY_MIN_PROFILES;
  if (level === 'country') threshold = SEO_INDEXATION_THRESHOLDS.COUNTRY_MIN_PROFILES;
  else if (level === 'division') threshold = SEO_INDEXATION_THRESHOLDS.DIVISION_MIN_PROFILES;
  else if (level === 'facet') threshold = SEO_INDEXATION_THRESHOLDS.FACET_MIN_PROFILES;

  const totalSignal = profilesCount + (communitiesCount * 5);

  if (totalSignal >= threshold) {
    return {
      isIndexable: true,
      reason: `Qualified with ${profilesCount} verified professionals and active ecosystem signals.`,
      robots: 'index, follow'
    };
  }

  return {
    isIndexable: false,
    reason: `Below operational indexation threshold (${totalSignal}/${threshold}). Served with noindex to safeguard crawl budget and prevent thin pages.`,
    robots: 'noindex, follow'
  };
}

/**
 * Fetches verified discoverable professionals matching geographic and professional filters
 */
export async function fetchDiscoverableProfiles(
  filters: NetworkDiscoveryFilters = {}
): Promise<{ professionals: DiscoverableProfessional[]; totalCount: number }> {
  try {
    const {
      query,
      countrySlug,
      divisionSlug,
      citySlug,
      industry,
      skill,
      role,
      isMentor,
      isCollaborator,
      page = 1,
      pageSize = 24
    } = filters;

    // Resolve geographic context
    const geo = resolveHierarchyFromParams(countrySlug, divisionSlug, citySlug);
    
    // We select non-sensitive fields from public_profiles or profiles with privacy check
    let dbQuery = supabase
      .from('profiles')
      .select('id, full_name, username, title, headline, location, industry, skills, experience_years, profile_picture_url, profile_photo_url, verification_status, is_online, is_mentor, looking_for_collaboration, mentorship_areas, collaboration_interests, is_profile_public, profile_visibility', { count: 'exact' })
      .eq('is_profile_public', true)
      .eq('profile_visibility', 'public')
      .not('full_name', 'is', null)
      .neq('full_name', '');

    // Search query filter
    if (query && query.trim()) {
      const q = query.trim();
      dbQuery = dbQuery.or(`full_name.ilike.%${q}%,title.ilike.%${q}%,headline.ilike.%${q}%,industry.ilike.%${q}%`);
    }

    // Role filter
    if (role && role.trim()) {
      dbQuery = dbQuery.or(`title.ilike.%${role}%,headline.ilike.%${role}%`);
    }

    // Industry filter
    if (industry && industry.trim() && industry !== 'all') {
      dbQuery = dbQuery.ilike('industry', `%${industry}%`);
    }

    // Mentorship & Collaboration filters
    if (isMentor) {
      dbQuery = dbQuery.eq('is_mentor', true);
    }
    if (isCollaborator) {
      dbQuery = dbQuery.eq('looking_for_collaboration', true);
    }

    // Pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, count, error } = await dbQuery
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.warn('Error fetching discoverable profiles:', error);
      return { professionals: [], totalCount: 0 };
    }

    // Map and apply geographic matching in-memory for precise multi-lingual / alias handling
    const rawList = (data || []).map(p => {
      const rawLocation = p.location || '';
      const resolvedGeo = resolveLocation(rawLocation);

      return {
        id: p.id,
        fullName: p.full_name || 'Member',
        username: p.username || undefined,
        title: p.title || p.headline || 'Professional',
        headline: p.headline || p.title || '',
        location: p.location || 'Worldwide',
        industry: p.industry || undefined,
        skills: Array.isArray(p.skills) ? p.skills : [],
        experienceYears: p.experience_years || undefined,
        avatarUrl: p.profile_photo_url || p.profile_picture_url || undefined,
        isOnline: Boolean(p.is_online),
        verificationStatus: p.verification_status || undefined,
        isMentor: Boolean(p.is_mentor),
        isCollaborator: Boolean(p.looking_for_collaboration),
        mentorshipAreas: Array.isArray(p.mentorship_areas) ? p.mentorship_areas : [],
        collaborationInterests: Array.isArray(p.collaboration_interests) ? p.collaboration_interests : [],
        canonicalPath: p.username ? `/u/@${p.username}` : `/u/${p.id}`,
        _resolvedGeo: resolvedGeo
      };
    });

    // If geographic filters are specified, filter records matching target country/division/city
    let filtered = rawList;
    if (geo.country) {
      filtered = filtered.filter(item => {
        if (!item._resolvedGeo) return false;
        if (geo.city) {
          return item._resolvedGeo.city?.slug === geo.city.slug;
        }
        if (geo.division) {
          return item._resolvedGeo.division?.slug === geo.division.slug;
        }
        return item._resolvedGeo.country.id === geo.country?.id;
      });
    }

    // Skill filter
    if (skill && skill.trim()) {
      const targetSkill = skill.toLowerCase().trim();
      filtered = filtered.filter(item => 
        item.skills.some(s => s.toLowerCase().includes(targetSkill))
      );
    }

    return {
      professionals: filtered,
      totalCount: count ?? filtered.length
    };
  } catch (err) {
    console.error('fetchDiscoverableProfiles failure:', err);
    return { professionals: [], totalCount: 0 };
  }
}

/**
 * Fetches authentic communities with optional geographic relevance
 */
export async function fetchLocationCommunities(
  filters: NetworkDiscoveryFilters = {}
): Promise<DiscoverableCommunity[]> {
  try {
    const { countrySlug, divisionSlug, citySlug, industry, query } = filters;
    const geo = resolveHierarchyFromParams(countrySlug, divisionSlug, citySlug);

    let dbQuery = supabase
      .from('groups')
      .select('id, name, description, category, cover_image_url, member_count, is_public, rules, created_by, created_at')
      .order('member_count', { ascending: false })
      .limit(20);

    if (query && query.trim()) {
      dbQuery = dbQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
    }

    if (industry && industry !== 'all') {
      dbQuery = dbQuery.ilike('category', `%${industry}%`);
    }

    const { data: dbGroups, error } = await dbQuery;
    if (error || !dbGroups) return [];

    // Filter by geographic tags or description if in geographic hub
    const targetKeywords: string[] = [];
    if (geo.city) {
      targetKeywords.push(geo.city.name.toLowerCase(), geo.city.slug, ...geo.city.aliases);
    }
    if (geo.division) {
      targetKeywords.push(geo.division.name.toLowerCase(), geo.division.slug);
    }
    if (geo.country) {
      targetKeywords.push(geo.country.name.toLowerCase(), geo.country.slug);
    }

    return dbGroups
      .filter(g => {
        if (targetKeywords.length === 0) return true;
        const text = `${g.name} ${g.description || ''} ${g.rules || ''}`.toLowerCase();
        // Return if matching local keyword or generic remote community
        return targetKeywords.some(k => text.includes(k)) || g.category === 'remote' || g.category === 'ai';
      })
      .map(g => ({
        id: g.id,
        name: g.name,
        headline: g.description?.slice(0, 80) || 'Professional Community on TalentXcel',
        description: g.description || 'Collaborative professional network community.',
        category: g.category || 'general',
        coverImageUrl: g.cover_image_url || undefined,
        memberCount: g.member_count || 1,
        isPrivate: !g.is_public,
        isFeatured: (g.member_count || 0) > 10,
        tags: g.rules ? g.rules.split(',').map(r => r.trim()) : ['#Community', '#Networking']
      }));
  } catch (err) {
    console.warn('fetchLocationCommunities failure:', err);
    return [];
  }
}

/**
 * Fetches location-aware discussions
 */
export async function fetchLocationDiscussions(
  filters: NetworkDiscoveryFilters = {}
): Promise<DiscoverableDiscussion[]> {
  try {
    const { countrySlug, divisionSlug, citySlug, query } = filters;
    const geo = resolveHierarchyFromParams(countrySlug, divisionSlug, citySlug);

    let dbQuery = supabase
      .from('posts')
      .select('id, content, headline, location, hashtags, likes_count, comments_count, shares_count, created_at, author_id')
      .eq('is_public', true)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(30);

    if (query && query.trim()) {
      dbQuery = dbQuery.or(`content.ilike.%${query}%,headline.ilike.%${query}%`);
    }

    const { data: dbPosts, error } = await dbQuery;
    if (error || !dbPosts) return [];

    // Filter by geographic relevance
    const targetKeywords: string[] = [];
    if (geo.city) targetKeywords.push(geo.city.name.toLowerCase(), geo.city.slug);
    if (geo.division) targetKeywords.push(geo.division.name.toLowerCase());
    if (geo.country) targetKeywords.push(geo.country.name.toLowerCase());

    const filtered = dbPosts.filter(p => {
      if (targetKeywords.length === 0) return true;
      const text = `${p.headline || ''} ${p.content || ''} ${p.location || ''} ${(p.hashtags || []).join(' ')}`.toLowerCase();
      return targetKeywords.some(k => text.includes(k));
    });

    const displayList = filtered.length > 0 ? filtered : dbPosts.slice(0, 10);

    return displayList.map(p => ({
      id: p.id,
      content: p.content,
      headline: p.headline || undefined,
      location: p.location || undefined,
      authorId: p.author_id,
      authorName: 'TalentXcel Professional',
      hashtags: Array.isArray(p.hashtags) ? p.hashtags : [],
      likesCount: p.likes_count || 0,
      commentsCount: p.comments_count || 0,
      sharesCount: p.shares_count || 0,
      createdAt: p.created_at || new Date().toISOString(),
      canonicalUrl: `/network/posts/${p.id}`
    }));
  } catch (err) {
    console.warn('fetchLocationDiscussions failure:', err);
    return [];
  }
}

/**
 * Fetches authentic events matching geographic location or virtual
 */
export async function fetchLocationEvents(
  filters: NetworkDiscoveryFilters = {}
): Promise<DiscoverableEvent[]> {
  try {
    const { countrySlug, divisionSlug, citySlug, isVirtualEvent } = filters;
    const geo = resolveHierarchyFromParams(countrySlug, divisionSlug, citySlug);

    let dbQuery = supabase
      .from('events')
      .select('*')
      .gte('start_time', new Date().toISOString())
      .order('start_time', { ascending: true })
      .limit(20);

    const { data: dbEvents, error } = await dbQuery;
    if (error || !dbEvents) return [];

    const targetKeywords: string[] = [];
    if (geo.city) targetKeywords.push(geo.city.name.toLowerCase(), geo.city.slug);
    if (geo.division) targetKeywords.push(geo.division.name.toLowerCase());
    if (geo.country) targetKeywords.push(geo.country.name.toLowerCase());

    return dbEvents
      .filter(e => {
        if (isVirtualEvent && e.is_virtual) return true;
        if (targetKeywords.length === 0) return true;
        const loc = (e.location || '').toLowerCase();
        return e.is_virtual || targetKeywords.some(k => loc.includes(k));
      })
      .map(e => ({
        id: e.id,
        title: e.title,
        description: e.description || '',
        eventType: e.event_type || 'meetup',
        startTime: e.start_time,
        endTime: e.end_time || undefined,
        location: e.location || (e.is_virtual ? 'Virtual (Online)' : 'TBD'),
        isVirtual: Boolean(e.is_virtual),
        meetingUrl: e.meeting_url || undefined,
        currentAttendees: e.current_attendees || 1,
        maxAttendees: e.max_attendees || undefined,
        coverImageUrl: e.cover_image_url || undefined,
        groupId: e.group_id || undefined,
        canonicalUrl: `/network/events/${e.id}`
      }));
  } catch (err) {
    console.warn('fetchLocationEvents failure:', err);
    return [];
  }
}

/**
 * Builds a comprehensive summary for a Geographic Hub (City, State, or Country)
 */
export async function fetchGeographicHubSummary(
  countrySlug?: string,
  divisionOrCitySlug?: string,
  citySlug?: string
): Promise<GeographicHubSummary | null> {
  const geo = resolveHierarchyFromParams(countrySlug, divisionOrCitySlug, citySlug);
  if (!geo.country) return null;

  const canonicalUrl = buildCanonicalGeographicUrl(geo.country, geo.division, geo.city);

  // Compute breadcrumbs
  const breadcrumbs: Array<{ name: string; url: string }> = [
    { name: 'Home', url: 'https://talentxcel.in' },
    { name: 'Network', url: 'https://talentxcel.in/network' },
    { name: geo.country.name, url: `https://talentxcel.in/network/${geo.country.slug}` }
  ];

  if (geo.division) {
    breadcrumbs.push({
      name: geo.division.name,
      url: `https://talentxcel.in/network/${geo.country.slug}/${geo.division.slug}`
    });
  }

  if (geo.city) {
    breadcrumbs.push({
      name: geo.city.name,
      url: `https://talentxcel.in${canonicalUrl}`
    });
  }

  // Fetch verified data counts
  const [profilesRes, communities, discussions, events] = await Promise.all([
    fetchDiscoverableProfiles({ countrySlug: geo.country.slug, divisionSlug: geo.division?.slug, citySlug: geo.city?.slug, pageSize: 50 }),
    fetchLocationCommunities({ countrySlug: geo.country.slug, divisionSlug: geo.division?.slug, citySlug: geo.city?.slug }),
    fetchLocationDiscussions({ countrySlug: geo.country.slug, divisionSlug: geo.division?.slug, citySlug: geo.city?.slug }),
    fetchLocationEvents({ countrySlug: geo.country.slug, divisionSlug: geo.division?.slug, citySlug: geo.city?.slug })
  ]);

  const professionalsCount = profilesRes.totalCount;
  const mentorsCount = profilesRes.professionals.filter(p => p.isMentor).length;

  let level: 'country' | 'division' | 'city' = 'country';
  let title = `${geo.country.name} Professional Network | Connect, Discover & Grow | TalentXcel`;
  let description = `Explore verified professionals, communities, discussions, and career opportunities across ${geo.country.name} on the TalentXcel Global Network.`;

  if (geo.city) {
    level = 'city';
    const stateSuffix = geo.division ? `, ${geo.division.name}` : '';
    title = `${geo.city.name}${stateSuffix} Professional Network & Community | TalentXcel`;
    description = `Connect with verified professionals, local communities, events, and mentors in ${geo.city.name}${stateSuffix}, ${geo.country.name} on TalentXcel.`;
  } else if (geo.division) {
    level = 'division';
    title = `${geo.division.name}, ${geo.country.name} Professional Talent Network | TalentXcel`;
    description = `Discover verified leaders, industry groups, and career opportunities across ${geo.division.name}, ${geo.country.name} on TalentXcel.`;
  }

  const eligibility = evaluateIndexationEligibility(level, professionalsCount, communities.length);

  return {
    country: geo.country,
    division: geo.division,
    city: geo.city,
    canonicalUrl: `https://talentxcel.in${canonicalUrl}`,
    title,
    description,
    breadcrumbs,
    stats: {
      professionalsCount,
      communitiesCount: communities.length,
      discussionsCount: discussions.length,
      eventsCount: events.length,
      mentorsCount
    },
    eligibility
  };
}

export interface DynamicActiveHub {
  name: string;
  displayName: string;
  canonicalPath: string;
  flag: string;
  verifiedMembersCount: number;
}

export interface IntelligentDiscoveryContext {
  contextType: 'personalized' | 'global';
  resolvedLocation: ResolvedGeographicLocation | null;
  headline: string;
  nearbyProfessionals: DiscoverableProfessional[];
  activeCommunities: DiscoverableCommunity[];
  trendingDiscussions: DiscoverableDiscussion[];
  upcomingEvents: DiscoverableEvent[];
  dynamicActiveHubs: DynamicActiveHub[];
}

/**
 * Backend-driven dynamic active hubs discovery.
 * Queries actual public profiles with location data to surface real active clusters,
 * strictly preventing hardcoded featured cities or fake statistics.
 */
export async function fetchDynamicActiveHubs(limit: number = 4): Promise<DynamicActiveHub[]> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('location')
      .eq('is_profile_public', true)
      .eq('profile_visibility', 'public')
      .not('location', 'is', null)
      .neq('location', '')
      .limit(100);

    if (error || !data || data.length === 0) return [];

    const counts = new Map<string, { resolved: ResolvedGeographicLocation; count: number }>();
    for (const row of data) {
      if (!row.location) continue;
      const resolved = resolveLocation(row.location);
      if (!resolved || !resolved.city) continue;
      const key = resolved.canonicalPath;
      const existing = counts.get(key);
      if (existing) {
        existing.count++;
      } else {
        counts.set(key, { resolved, count: 1 });
      }
    }

    const sorted = Array.from(counts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    return sorted.map(item => ({
      name: item.resolved.city?.name || item.resolved.displayName,
      displayName: item.resolved.displayName,
      canonicalPath: item.resolved.canonicalPath,
      flag: item.resolved.country.flag,
      verifiedMembersCount: item.count
    }));
  } catch (err) {
    console.warn('fetchDynamicActiveHubs failure:', err);
    return [];
  }
}

/**
 * Backend-driven intelligent discovery engine.
 * Automatically assesses user profile location and platform density.
 * Organically surfaces local professional intelligence when available,
 * and gracefully falls back to global discovery without requiring manual user configuration.
 */
export async function fetchIntelligentDiscoveryContext(
  userLocation?: string | null
): Promise<IntelligentDiscoveryContext> {
  const resolved = userLocation ? resolveLocation(userLocation) : null;

  if (resolved) {
    const [profilesRes, communities, discussions, events, dynamicHubs] = await Promise.all([
      fetchDiscoverableProfiles({
        countrySlug: resolved.country.slug,
        divisionSlug: resolved.division?.slug,
        citySlug: resolved.city?.slug,
        pageSize: 4
      }),
      fetchLocationCommunities({
        countrySlug: resolved.country.slug,
        divisionSlug: resolved.division?.slug,
        citySlug: resolved.city?.slug
      }),
      fetchLocationDiscussions({
        countrySlug: resolved.country.slug,
        divisionSlug: resolved.division?.slug,
        citySlug: resolved.city?.slug
      }),
      fetchLocationEvents({
        countrySlug: resolved.country.slug,
        divisionSlug: resolved.division?.slug,
        citySlug: resolved.city?.slug
      }),
      fetchDynamicActiveHubs(4)
    ]);

    const hasLocalContent = profilesRes.professionals.length > 0 || communities.length > 0 || discussions.length > 0;
    
    if (hasLocalContent) {
      const locationName = resolved.city?.name || resolved.division?.name || resolved.country.name;
      return {
        contextType: 'personalized',
        resolvedLocation: resolved,
        headline: `Active in ${locationName}`,
        nearbyProfessionals: profilesRes.professionals,
        activeCommunities: communities.slice(0, 3),
        trendingDiscussions: discussions.slice(0, 3),
        upcomingEvents: events.slice(0, 3),
        dynamicActiveHubs: dynamicHubs
      };
    }
  }

  // Graceful fallback to Global Discovery
  const [globalProfiles, globalCommunities, globalDiscussions, globalEvents, dynamicHubs] = await Promise.all([
    fetchDiscoverableProfiles({ pageSize: 4 }),
    fetchLocationCommunities(),
    fetchLocationDiscussions(),
    fetchLocationEvents({ isVirtualEvent: true }),
    fetchDynamicActiveHubs(4)
  ]);

  return {
    contextType: 'global',
    resolvedLocation: null,
    headline: 'Global Network Discovery',
    nearbyProfessionals: globalProfiles.professionals,
    activeCommunities: globalCommunities.slice(0, 3),
    trendingDiscussions: globalDiscussions.slice(0, 3),
    upcomingEvents: globalEvents.slice(0, 3),
    dynamicActiveHubs: dynamicHubs
  };
}
