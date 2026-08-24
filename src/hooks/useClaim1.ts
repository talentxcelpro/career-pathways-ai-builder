// src/hooks/useClaim1.ts
// React Query hooks for TalentXcel Claim #1 with Razorpay payments & Founding 100 mechanics.

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  getLeaderboard,
  getActivityFeed,
  resolveScopeBySlug,
  getCategories,
  getScopesForCategory,
  getEntityBySlug,
  getListingsForEntity,
  getMyEntities,
  getMyListings,
  getMyBids,
  getBidHistory,
  getRankingHistory,
  getScopeStats,
  getFounding100Count,
  getAvailableScopes,
  claimProfile,
  placeRazorpayBid,
  watchScope,
  estimateRank,
  formatCurrency,
} from '@/services/claim1Service';
import type { ClaimProfileInput } from '@/types/claim1';

// ── Query key factory ──────────────────────────────────────────────────────────
export const claim1Keys = {
  all:            ['claim1'] as const,
  categories:     () => [...claim1Keys.all, 'categories'] as const,
  founding100:    () => [...claim1Keys.all, 'founding100-count'] as const,
  scope:          (catSlug: string, scopeSlug: string) =>
                    [...claim1Keys.all, 'scope', catSlug, scopeSlug] as const,
  leaderboard:    (scopeId: string, page: number) =>
                    [...claim1Keys.all, 'leaderboard', scopeId, page] as const,
  activity:       (scopeId: string) =>
                    [...claim1Keys.all, 'activity', scopeId] as const,
  entity:         (slug: string) =>
                    [...claim1Keys.all, 'entity', slug] as const,
  entityListings: (entityId: string) =>
                    [...claim1Keys.all, 'entity-listings', entityId] as const,
  myEntities:     (userId: string) =>
                    [...claim1Keys.all, 'my-entities', userId] as const,
  myListings:     (userId: string) =>
                    [...claim1Keys.all, 'my-listings', userId] as const,
  myBids:         (userId: string) =>
                    [...claim1Keys.all, 'my-bids', userId] as const,
  bidHistory:     (listingId: string) =>
                    [...claim1Keys.all, 'bid-history', listingId] as const,
  rankHistory:    (entityId: string) =>
                    [...claim1Keys.all, 'rank-history', entityId] as const,
  stats:          (scopeId: string) =>
                    [...claim1Keys.all, 'stats', scopeId] as const,
};

// ── Scope resolution ──────────────────────────────────────────────────────────

export function useScopeBySlug(categorySlug: string, scopeSlug = 'global') {
  return useQuery({
    queryKey: claim1Keys.scope(categorySlug, scopeSlug),
    queryFn:  () => resolveScopeBySlug(categorySlug, scopeSlug),
    staleTime: 10 * 60 * 1000,
    enabled:   !!categorySlug,
  });
}

export function useAvailableScopes() {
  return useQuery({
    queryKey: [...claim1Keys.all, 'available-scopes'],
    queryFn:  getAvailableScopes,
    staleTime: 5 * 60 * 1000,
  });
}

export function useFounding100Count() {
  return useQuery({
    queryKey: claim1Keys.founding100(),
    queryFn:  getFounding100Count,
    staleTime: 60_000,
  });
}

// ── Leaderboard ───────────────────────────────────────────────────────────────

export function useLeaderboard(scopeId: string | undefined, page = 1) {
  return useQuery({
    queryKey: claim1Keys.leaderboard(scopeId ?? '', page),
    queryFn:  () => getLeaderboard(scopeId!, page),
    enabled:  !!scopeId,
    staleTime: 30_000,
  });
}

// ── Activity Feed ─────────────────────────────────────────────────────────────

export function useActivityFeed(scopeId: string | undefined) {
  return useQuery({
    queryKey: claim1Keys.activity(scopeId ?? ''),
    queryFn:  () => getActivityFeed(scopeId!, 20),
    enabled:  !!scopeId,
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}

// ── Stats (live counters on leaderboard hero) ─────────────────────────────────

export function useScopeStats(scopeId: string | undefined) {
  return useQuery({
    queryKey: claim1Keys.stats(scopeId ?? ''),
    queryFn:  () => getScopeStats(scopeId!),
    enabled:  !!scopeId,
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
}

// ── Entity ────────────────────────────────────────────────────────────────────

export function useEntity(slug: string | undefined) {
  return useQuery({
    queryKey: claim1Keys.entity(slug ?? ''),
    queryFn:  () => getEntityBySlug(slug!),
    enabled:  !!slug,
    staleTime: 2 * 60_000,
  });
}

export function useEntityListings(entityId: string | undefined) {
  return useQuery({
    queryKey: claim1Keys.entityListings(entityId ?? ''),
    queryFn:  () => getListingsForEntity(entityId!),
    enabled:  !!entityId,
    staleTime: 30_000,
  });
}

// ── My data (authenticated) ───────────────────────────────────────────────────

export function useMyEntities() {
  const { user } = useAuth();
  return useQuery({
    queryKey: claim1Keys.myEntities(user?.id ?? ''),
    queryFn:  () => getMyEntities(user!.id),
    enabled:  !!user?.id,
    staleTime: 2 * 60_000,
  });
}

export function useMyListings() {
  const { user } = useAuth();
  return useQuery({
    queryKey: claim1Keys.myListings(user?.id ?? ''),
    queryFn:  () => getMyListings(user!.id),
    enabled:  !!user?.id,
    staleTime: 30_000,
  });
}

export function useMyBids() {
  const { user } = useAuth();
  return useQuery({
    queryKey: claim1Keys.myBids(user?.id ?? ''),
    queryFn:  () => getMyBids(50),
    enabled:  !!user?.id,
    staleTime: 60_000,
  });
}

export function useBidHistory(listingId: string | undefined) {
  return useQuery({
    queryKey: claim1Keys.bidHistory(listingId ?? ''),
    queryFn:  () => getBidHistory(listingId!, 20),
    enabled:  !!listingId,
    staleTime: 60_000,
  });
}

export function useRankingHistory(entityId: string | undefined) {
  return useQuery({
    queryKey: claim1Keys.rankHistory(entityId ?? ''),
    queryFn:  () => getRankingHistory(entityId!, 30),
    enabled:  !!entityId,
    staleTime: 60_000,
  });
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export function usePlaceBid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      listingId: string;
      entityId: string;
      entityName?: string;
      bidAmount: number;
      currency: string;
      userEmail?: string;
    }) => placeRazorpayBid(params),
    onSuccess: (result) => {
      if (!result.success) {
        if (result.error === 'bid_too_low') {
          toast.error(`Minimum bid required is ${formatCurrency(result.minimum_required, result.currency || 'INR')}.`);
        } else {
          toast.error(result.error ?? 'Bid placement was not completed.');
        }
        return;
      }
      toast.success(`Position Claimed! You are now #${result.new_rank}! 🏆`);
      queryClient.invalidateQueries({ queryKey: claim1Keys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Payment verification failed.');
    },
  });
}

export function useClaimProfile() {
  const queryClient = useQueryClient();
  const { user }    = useAuth();

  return useMutation({
    mutationFn: (input: ClaimProfileInput) => {
      if (!user) throw new Error('Must be signed in to claim a profile.');
      return claimProfile(input, user.id);
    },
    onSuccess: (result) => {
      if (result.entity.is_founding_100) {
        toast.success(`Profile claimed! 🎉 Founding 100 Slot #${result.entity.founding_100_slot} locked with 5% permanent fee.`);
      } else {
        toast.success("Profile claimed! You're now on the leaderboard.");
      }
      queryClient.invalidateQueries({ queryKey: claim1Keys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Failed to claim profile.');
    },
  });
}

export function useWatchScope() {
  return useMutation({
    mutationFn: ({ scopeId, email }: { scopeId: string; email: string }) =>
      watchScope(scopeId, email),
    onSuccess: () => {
      toast.success("You'll be notified immediately when #1 changes.");
    },
    onError: () => {
      toast.error('Could not subscribe. Please try again.');
    },
  });
}

// ── Rank estimator ────────────────────────────────────────────────────────────

export function useEstimateRank(
  scopeId: string | undefined,
  listingId: string | undefined,
  bidAmount: number
) {
  return useQuery({
    queryKey: [...claim1Keys.all, 'estimate-rank', scopeId, listingId, bidAmount],
    queryFn:  () => estimateRank(scopeId!, listingId!, bidAmount),
    enabled:  !!scopeId && !!listingId && bidAmount > 0,
    staleTime: 15_000,
  });
}
