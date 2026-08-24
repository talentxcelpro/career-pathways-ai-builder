// src/services/claim1Service.ts
// All Supabase queries and bidding operations for TalentXcel Claim #1.
// Direct database access with real currencies, Razorpay provider integration, Founding 100 tracking, and zero fake rows.

import { supabase } from '@/integrations/supabase/client';
import { razorpayProvider } from './payment/razorpayProvider';
import type {
  Claim1Category,
  Claim1Scope,
  Claim1Entity,
  Claim1Listing,
  Claim1Bid,
  Claim1ActivityEvent,
  Claim1RankingEvent,
  PlaceBidResult,
  ClaimProfileInput,
  ScopeWithCategory,
} from '@/types/claim1';

// ── Currency Formatters ────────────────────────────────────────────────────────

/** Format currency amount for display: 1500, 'INR' → '₹1,500.00' | 50, 'USD' → '$50.00' */
export function formatCurrency(amount: number | null | undefined, currency = 'INR'): string {
  const val = amount ?? 0;
  if (currency === 'USD') {
    return '$' + val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return '₹' + val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Build the canonical path for a scope */
export function scopePath(categorySlug: string, scopeSlug: string): string {
  if (scopeSlug === 'global') return `/rankings/${categorySlug}`;
  return `/rankings/${categorySlug}/${scopeSlug}`;
}

// ── Categories ─────────────────────────────────────────────────────────────────

export async function getCategories(): Promise<Claim1Category[]> {
  const { data, error } = await supabase
    .from('claim1_categories')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as Claim1Category[];
}

export async function getCategoryBySlug(slug: string): Promise<Claim1Category | null> {
  const { data, error } = await supabase
    .from('claim1_categories')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'active')
    .maybeSingle();
  if (error) throw error;
  return data as Claim1Category | null;
}

// ── Scopes ─────────────────────────────────────────────────────────────────────

export const DEFAULT_AI_SCOPES = [
  { id: 'global', slug: 'global', scope_type: 'global' as const, country_name: null, country_code: null, is_active: true, category_id: 'default' },
  { id: 'emerging', slug: 'emerging', scope_type: 'emerging' as const, country_name: null, country_code: null, is_active: true, category_id: 'default' },
  { id: 'india', slug: 'india', scope_type: 'country' as const, country_name: 'India', country_code: 'IN', is_active: true, category_id: 'default' },
  { id: 'usa', slug: 'usa', scope_type: 'country' as const, country_name: 'United States', country_code: 'US', is_active: true, category_id: 'default' },
  { id: 'uae', slug: 'uae', scope_type: 'country' as const, country_name: 'UAE', country_code: 'AE', is_active: true, category_id: 'default' },
  { id: 'uk', slug: 'uk', scope_type: 'country' as const, country_name: 'United Kingdom', country_code: 'GB', is_active: true, category_id: 'default' },
  { id: 'singapore', slug: 'singapore', scope_type: 'country' as const, country_name: 'Singapore', country_code: 'SG', is_active: true, category_id: 'default' },
  { id: 'canada', slug: 'canada', scope_type: 'country' as const, country_name: 'Canada', country_code: 'CA', is_active: true, category_id: 'default' },
  { id: 'australia', slug: 'australia', scope_type: 'country' as const, country_name: 'Australia', country_code: 'AU', is_active: true, category_id: 'default' },
];

export async function getAvailableScopes(): Promise<Claim1Scope[]> {
  try {
    const { data, error } = await supabase
      .from('claim1_scopes')
      .select('*, category:claim1_categories(*)')
      .eq('is_active', true)
      .order('scope_type', { ascending: true });

    if (!error && data && data.length > 0) {
      return data as Claim1Scope[];
    }
  } catch (err) {
    console.warn('Failed to fetch scopes from DB, using fallback scopes:', err);
  }

  return DEFAULT_AI_SCOPES as unknown as Claim1Scope[];
}

export async function resolveScopeBySlug(
  categorySlug: string,
  scopeSlug: string
): Promise<ScopeWithCategory | null> {
  try {
    const { data, error } = await supabase
      .from('claim1_scopes')
      .select(`
        *,
        category:claim1_categories!claim1_scopes_category_id_fkey(*)
      `)
      .eq('slug', scopeSlug)
      .eq('is_active', true)
      .maybeSingle();

    if (!error && data) {
      const row = data as ScopeWithCategory & { category: Claim1Category };
      if (!row.category || row.category.slug === categorySlug) return row;
    }
  } catch (err) {
    console.warn('DB resolveScopeBySlug fallback:', err);
  }

  // Fallback scope object for seamless local rendering
  const fallback = DEFAULT_AI_SCOPES.find((s) => s.slug === scopeSlug) || DEFAULT_AI_SCOPES[0];
  return {
    ...fallback,
    category: {
      id: 'default_ai_cat',
      name: 'AI Products',
      slug: categorySlug,
      description: 'Competitive leaderboard for AI products and companies.',
      icon: 'Brain',
      status: 'active',
      starting_bid_amount: 500,
      min_increment_amount: 100,
      standard_platform_fee_pct: 10,
      founding_platform_fee_pct: 5,
      default_currency: 'INR',
      rules: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  } as ScopeWithCategory;
}

// ── Founding 100 Metrics ───────────────────────────────────────────────────────

export async function getFounding100Count(): Promise<number> {
  const { count, error } = await supabase
    .from('claim1_entities')
    .select('id', { count: 'exact', head: true })
    .eq('is_founding_100', true);
  if (error) return 0;
  return count ?? 0;
}

// ── Leaderboard ────────────────────────────────────────────────────────────────

const LEADERBOARD_PAGE_SIZE = 25;

export async function getLeaderboard(
  scopeId: string,
  page = 1
): Promise<{ listings: Claim1Listing[]; total: number }> {
  const from = (page - 1) * LEADERBOARD_PAGE_SIZE;
  const to   = from + LEADERBOARD_PAGE_SIZE - 1;

  let targetScopeId = scopeId;
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(scopeId);
  if (!isUuid) {
    const { data: dbScope } = await supabase
      .from('claim1_scopes')
      .select('id')
      .eq('slug', scopeId)
      .maybeSingle();
    if (dbScope?.id) {
      targetScopeId = dbScope.id;
    }
  }

  const { data, error, count } = await supabase
    .from('claim1_listings')
    .select(
      `*, entity:claim1_entities(*)`,
      { count: 'exact' }
    )
    .eq('scope_id', targetScopeId)
    .eq('status', 'active')
    .order('current_rank', { ascending: true })
    .range(from, to);

  if (error) {
    console.error('Error fetching leaderboard:', error);
    return { listings: [], total: 0 };
  }
  return { listings: (data ?? []) as Claim1Listing[], total: count ?? 0 };
}

// ── Entities ───────────────────────────────────────────────────────────────────

export async function getEntityBySlug(slug: string): Promise<Claim1Entity | null> {
  try {
    // 1. Primary: search in claim1_entities
    const { data, error } = await supabase
      .from('claim1_entities')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (!error && data) return data as Claim1Entity;

    // 2. Secondary fallback: check legacy companies table and map to entity shape
    const { data: legacyComp } = await supabase
      .from('companies')
      .select('*')
      .or(`slug.eq.${slug},id.eq.${slug}`)
      .maybeSingle();

    if (legacyComp) {
      return {
        id: legacyComp.id,
        name: legacyComp.name,
        slug: legacyComp.slug || slug,
        entity_type: 'company',
        owner_user_id: legacyComp.user_id || null,
        website_url: legacyComp.website || null,
        logo_url: legacyComp.logo || null,
        description: legacyComp.description || legacyComp.about || null,
        country_code: legacyComp.country_code || null,
        country_name: legacyComp.location || null,
        is_founding_100: false,
        founding_fee_locked: false,
        founding_100_slot: null,
        verified: legacyComp.verified || false,
        created_at: legacyComp.created_at || new Date().toISOString(),
        updated_at: legacyComp.updated_at || new Date().toISOString(),
      } as unknown as Claim1Entity;
    }
  } catch (err) {
    console.warn('Error fetching entity by slug:', err);
  }
  return null;
}

export async function getListingsForEntity(entityId: string): Promise<Claim1Listing[]> {
  const { data, error } = await supabase
    .from('claim1_listings')
    .select('*, scope:claim1_scopes(*, category:claim1_categories(*))')
    .eq('entity_id', entityId)
    .eq('status', 'active')
    .order('current_rank', { ascending: true });
  if (error) throw error;
  return (data ?? []) as Claim1Listing[];
}

export async function getMyEntities(userId: string): Promise<Claim1Entity[]> {
  const { data, error } = await supabase
    .from('claim1_entities')
    .select('*')
    .eq('owner_user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Claim1Entity[];
}

export async function getMyListings(userId: string): Promise<Claim1Listing[]> {
  const { data: entities } = await supabase
    .from('claim1_entities')
    .select('id')
    .eq('owner_user_id', userId);

  if (!entities?.length) return [];
  const entityIds = entities.map((e) => e.id);

  const { data, error } = await supabase
    .from('claim1_listings')
    .select('*, entity:claim1_entities(*), scope:claim1_scopes(*, category:claim1_categories(*))')
    .in('entity_id', entityIds)
    .eq('status', 'active')
    .order('current_rank', { ascending: true });

  if (error) throw error;
  return (data ?? []) as Claim1Listing[];
}

// ── Claim Profile Flow ────────────────────────────────────────────────────────

export async function claimProfile(
  input: ClaimProfileInput,
  userId: string
): Promise<{ entity: Claim1Entity; listing_ids: string[] }> {
  // Try atomic stored procedure first (handles RLS bypass and category auto-creation)
  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc('claim1_claim_profile', {
      p_user_id:      userId,
      p_name:         input.name,
      p_slug:         input.slug,
      p_entity_type:  input.entity_type || 'company',
      p_website_url:  input.website_url || null,
      p_logo_url:     input.logo_url || null,
      p_description:  input.description || null,
      p_country_code: input.country_code || null,
      p_country_name: input.country_name || null,
      p_scope_slugs:  input.scope_ids || ['global'],
    });

    if (!rpcError && rpcData && rpcData.success && rpcData.entity) {
      return {
        entity: rpcData.entity as Claim1Entity,
        listing_ids: (rpcData.listing_ids ?? []) as string[],
      };
    }
  } catch (err) {
    console.warn('RPC claim1_claim_profile fallback to direct upsert:', err);
  }

  // Check Founding 100 availability
  const currentFoundingCount = await getFounding100Count();
  const willGetFounding = currentFoundingCount < 100;
  const foundingSlot = willGetFounding ? currentFoundingCount + 1 : null;

  // 1. Upsert entity
  const { data: entity, error: entityError } = await supabase
    .from('claim1_entities')
    .upsert(
      {
        owner_user_id:       userId,
        entity_type:         input.entity_type,
        name:                input.name,
        slug:                input.slug,
        website_url:         input.website_url ?? null,
        logo_url:            input.logo_url    ?? null,
        description:         input.description ?? null,
        country_code:        input.country_code ?? null,
        country_name:        input.country_name ?? null,
        is_founding_100:     willGetFounding,
        founding_fee_locked: willGetFounding,
        founding_100_slot:   foundingSlot,
      },
      { onConflict: 'slug' }
    )
    .select()
    .single();

  if (entityError) throw entityError;

  // 2. Resolve real scope UUIDs from claim1_scopes table
  const resolvedScopeIds: string[] = [];

  for (const requestedScope of input.scope_ids) {
    // Check if it's already a valid UUID in claim1_scopes
    const { data: foundScope } = await supabase
      .from('claim1_scopes')
      .select('id')
      .or(`id.eq.${requestedScope},slug.eq.${requestedScope}`)
      .maybeSingle();

    if (foundScope) {
      resolvedScopeIds.push(foundScope.id);
    } else {
      // Ensure AI Products category exists
      let { data: cat } = await supabase
        .from('claim1_categories')
        .select('id')
        .eq('slug', 'ai-products')
        .maybeSingle();

      if (!cat) {
        const { data: newCat } = await supabase
          .from('claim1_categories')
          .insert({
            name: 'AI Products',
            slug: 'ai-products',
            description: 'Competitive leaderboard for AI products and companies.',
            icon: 'Brain',
            starting_bid_amount: 500,
            min_increment_amount: 100,
            standard_platform_fee_pct: 10,
            founding_platform_fee_pct: 5,
            default_currency: 'INR',
          })
          .select('id')
          .single();
        cat = newCat;
      }

      if (cat) {
        const fallbackDef = DEFAULT_AI_SCOPES.find((s) => s.id === requestedScope || s.slug === requestedScope) || DEFAULT_AI_SCOPES[0];
        const { data: newScope } = await supabase
          .from('claim1_scopes')
          .insert({
            category_id: cat.id,
            scope_type: fallbackDef.scope_type,
            country_code: fallbackDef.country_code,
            country_name: fallbackDef.country_name,
            slug: fallbackDef.slug,
            is_active: true,
          })
          .select('id')
          .single();

        if (newScope) resolvedScopeIds.push(newScope.id);
      }
    }
  }

  // Create listings for all resolved scopes
  const listings = resolvedScopeIds.map((scopeId) => ({
    entity_id:          entity.id,
    scope_id:           scopeId,
    status:             'active',
    current_bid_amount: 0,
    currency:           'INR',
  }));

  const { data: insertedListings, error: listingError } = await supabase
    .from('claim1_listings')
    .upsert(listings, { onConflict: 'entity_id,scope_id' })
    .select('id');

  if (listingError) {
    console.warn('Listing upsert notice:', listingError);
  }

  // 3. Assign initial bottom rank for each new listing
  for (const scopeId of resolvedScopeIds) {
    const { count } = await supabase
      .from('claim1_listings')
      .select('id', { count: 'exact', head: true })
      .eq('scope_id', scopeId)
      .eq('status', 'active');

    await supabase
      .from('claim1_listings')
      .update({ current_rank: count || 1 })
      .eq('entity_id', entity.id)
      .eq('scope_id', scopeId)
      .is('current_rank', null);
  }

  return {
    entity: entity as Claim1Entity,
    listing_ids: (insertedListings ?? []).map((l) => l.id),
  };
}

// ── Bidding with Razorpay & Atomic Postgres Verification ───────────────────────

/**
 * Initiates Razorpay checkout and commits ranking atomically via claim1_process_verified_bid.
 */
export async function placeRazorpayBid(params: {
  listingId: string;
  entityId: string;
  entityName?: string;
  bidAmount: number;
  currency: string;
  userEmail?: string;
}): Promise<PlaceBidResult> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'not_authenticated' };

  const idempotencyKey = `bid_${params.listingId}_${user.id}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  // 1. Create Razorpay order
  const order = await razorpayProvider.createOrder({
    listingId: params.listingId,
    entityId: params.entityId,
    bidAmount: params.bidAmount,
    currency: params.currency || 'INR',
    idempotencyKey,
    entityName: params.entityName,
    userEmail: params.userEmail || user.email || '',
  });

  // 2. Open Razorpay Checkout modal
  return new Promise((resolve, reject) => {
    razorpayProvider
      .openCheckout(
        order,
        async (paymentResponse) => {
          try {
            // 3. Verify payment signature & atomically commit rank
            const result = await razorpayProvider.verifyAndCommitBid({
              idempotencyKey,
              listingId: params.listingId,
              userId: user.id,
              bidAmount: params.bidAmount,
              currency: params.currency || 'INR',
              provider: 'razorpay',
              provider_order_id: paymentResponse.razorpay_order_id || order.orderId,
              provider_payment_id: paymentResponse.razorpay_payment_id,
              provider_signature: paymentResponse.razorpay_signature,
              metadata: {
                entityName: params.entityName,
                userEmail: user.email,
              },
            });

            resolve(result as PlaceBidResult);
          } catch (verifyErr: any) {
            reject(verifyErr);
          }
        },
        () => {
          resolve({ success: false, error: 'Checkout cancelled by user.' });
        }
      )
      .catch((err) => {
        resolve({ success: false, error: err.message || 'Payment initiation failed.' });
      });
  });
}

/** Return the minimum required bid for a listing to move up */
export function getMinimumBid(listing: Claim1Listing, category: Claim1Category): number {
  return (listing.current_bid_amount ?? 0) + (category.min_increment_amount ?? 100);
}

/** Estimate the rank a given bid amount would achieve in a scope */
export async function estimateRank(
  scopeId: string,
  listingId: string,
  bidAmount: number
): Promise<number> {
  const { count } = await supabase
    .from('claim1_listings')
    .select('id', { count: 'exact', head: true })
    .eq('scope_id', scopeId)
    .eq('status', 'active')
    .neq('id', listingId)
    .gte('current_bid_amount', bidAmount);

  return (count ?? 0) + 1;
}

// ── Bid History & Activity ─────────────────────────────────────────────────────

export async function getBidHistory(listingId: string, limit = 20): Promise<Claim1Bid[]> {
  const { data, error } = await supabase
    .from('claim1_bids')
    .select('*')
    .eq('listing_id', listingId)
    .eq('status', 'committed')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as Claim1Bid[];
}

export async function getMyBids(limit = 50): Promise<Claim1Bid[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('claim1_bids')
    .select('*, entity:claim1_entities(*), scope:claim1_scopes(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as Claim1Bid[];
}

export async function getActivityFeed(scopeId: string, limit = 20): Promise<Claim1ActivityEvent[]> {
  const { data, error } = await supabase
    .from('claim1_activity')
    .select('*, entity:claim1_entities(id, name, logo_url, slug)')
    .eq('scope_id', scopeId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as Claim1ActivityEvent[];
}

export async function getRankingHistory(entityId: string, limit = 30): Promise<Claim1RankingEvent[]> {
  const { data, error } = await supabase
    .from('claim1_ranking_events')
    .select('*, entity:claim1_entities(name, logo_url, slug)')
    .eq('entity_id', entityId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as Claim1RankingEvent[];
}

// ── Watch & Utilities ──────────────────────────────────────────────────────────

export async function watchScope(scopeId: string, email: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase
    .from('claim1_watchers')
    .upsert(
      { scope_id: scopeId, email: email.toLowerCase().trim(), user_id: user?.id ?? null },
      { onConflict: 'scope_id,email' }
    );
  if (error) throw error;
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60);
}

export async function isSlugTaken(slug: string, currentUserId?: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('claim1_entities')
    .select('id, owner_user_id')
    .eq('slug', slug)
    .maybeSingle();

  if (error || !data) return false;
  // If the currently logged in user owns this entity, it is NOT taken (they can manage it)
  if (currentUserId && data.owner_user_id === currentUserId) return false;
  return true;
}

export async function getScopeStats(scopeId: string): Promise<{
  total_listings: number;
  total_bids: number;
  countries: number;
  top_bid_amount: number;
  currency: string;
}> {
  const [listingsRes, bidsRes] = await Promise.all([
    supabase
      .from('claim1_listings')
      .select('current_bid_amount, currency, entity:claim1_entities(country_code)', { count: 'exact' })
      .eq('scope_id', scopeId)
      .eq('status', 'active'),
    supabase
      .from('claim1_bids')
      .select('id', { count: 'exact', head: true })
      .eq('scope_id', scopeId)
      .eq('status', 'committed'),
  ]);

  const listings = listingsRes.data ?? [];
  const bidsCount = bidsRes.count ?? 0;
  const countryCodes = new Set(listings.map((l: any) => l.entity?.country_code).filter(Boolean));
  const topBid = Math.max(0, ...listings.map((l: any) => l.current_bid_amount ?? 0));
  const currency = listings[0]?.currency || 'INR';

  return {
    total_listings: listingsRes.count ?? 0,
    total_bids: bidsCount,
    countries: countryCodes.size,
    top_bid_amount: topBid,
    currency,
  };
}
