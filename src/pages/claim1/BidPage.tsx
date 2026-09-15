// src/pages/claim1/BidPage.tsx
// /claim1/bid/:listingId — Real-money bidding interface with Razorpay checkout & exact reclaim pricing

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowUp,
  Zap,
  ChevronRight,
  CreditCard,
  TrendingUp,
  History,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { usePlaceBid, useBidHistory, useEstimateRank } from '@/hooks/useClaim1';
import { formatCurrency } from '@/services/claim1Service';
import type { Claim1Listing } from '@/types/claim1';

export default function BidPage() {
  const { listingId } = useParams<{ listingId: string }>();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const placeBidMutation = usePlaceBid();

  const [bidAmount, setBidAmount] = useState<number>(0);

  // Fetch listing with entity and scope details
  const { data: listing, isLoading } = useQuery({
    queryKey: ['claim1-listing', listingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('claim1_listings')
        .select('*, entity:claim1_entities(*), scope:claim1_scopes(*, category:claim1_categories(*))')
        .eq('id', listingId!)
        .single();
      if (error) throw error;
      return data as Claim1Listing & {
        scope: {
          slug: string;
          country_name: string | null;
          scope_type: string;
          category: {
            min_increment_amount: number;
            standard_platform_fee_pct: number;
            founding_platform_fee_pct: number;
            default_currency: string;
            slug: string;
          };
        };
      };
    },
    enabled: !!listingId,
  });

  const { data: bidHistory = [] } = useBidHistory(listingId);
  const { data: estimatedRank } = useEstimateRank(listing?.scope_id, listingId, bidAmount);

  const entity = listing?.entity;
  const category = listing?.scope?.category;
  const currency = listing?.currency || category?.default_currency || 'INR';

  const minIncrement = category?.min_increment_amount ?? 100;
  const minRequiredBid = (listing?.current_bid_amount ?? 0) + minIncrement;

  const isFounding = entity?.is_founding_100 || entity?.founding_fee_locked;
  const feePct = isFounding
    ? category?.founding_platform_fee_pct ?? 5
    : category?.standard_platform_fee_pct ?? 10;

  const platformFee = Math.round((bidAmount * (feePct / 100)) * 100) / 100;
  const totalCharge = bidAmount + platformFee;
  const isValidBid = bidAmount >= minRequiredBid;

  // Auto-fill bid amount if reclaim_amount query param is present or set to minRequiredBid
  useEffect(() => {
    const urlReclaim = searchParams.get('reclaim_amount');
    if (urlReclaim && !isNaN(Number(urlReclaim))) {
      setBidAmount(Number(urlReclaim));
    } else if (minRequiredBid > 0 && bidAmount === 0) {
      setBidAmount(minRequiredBid);
    }
  }, [searchParams, minRequiredBid]);

  const handleCheckout = async () => {
    if (!isValidBid || !listingId || !entity) return;

    await placeBidMutation.mutateAsync({
      listingId,
      entityId: entity.id,
      entityName: entity.name,
      bidAmount,
      currency,
      userEmail: user?.email,
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (!listing || !entity) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <p className="text-lg font-semibold mb-2">Listing not found</p>
        <Link to="/rankings"><Button variant="outline">Back to Rankings</Button></Link>
      </div>
    );
  }

  const scopeTitle = listing.scope?.scope_type === 'global'
    ? 'Global'
    : listing.scope?.scope_type === 'emerging'
    ? 'Emerging'
    : listing.scope?.country_name || listing.scope?.slug;

  return (
    <>
      <Helmet>
        <title>Place Bid for {entity.name} — TalentXcel Rankings</title>
      </Helmet>

      <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">

        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link to="/rankings" className="hover:text-primary">Rankings</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to={`/company/${entity.slug}`} className="hover:text-primary">{entity.name}</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground">Place Bid ({scopeTitle})</span>
        </div>

        {/* Entity Card Header */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl border bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
            {entity.logo_url ? (
              <img src={entity.logo_url} alt={entity.name} className="w-full h-full object-contain" />
            ) : (
              <span className="text-2xl font-bold text-muted-foreground">{entity.name.charAt(0)}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold truncate">{entity.name}</h1>
              {isFounding && (
                <Badge className="bg-amber-500/20 text-amber-700 border-amber-500/40 text-xs gap-1">
                  <Sparkles className="w-3 h-3" /> Founding 100 (5% Fee)
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground text-sm mt-0.5">
              Current Rank: <strong className="text-foreground">{listing.current_rank ? `#${listing.current_rank}` : 'Unranked'}</strong>
              {' '}· Current Bid: <strong className="text-foreground">{formatCurrency(listing.current_bid_amount, currency)}</strong>
            </p>
          </div>
        </div>

        {/* Bidding Card */}
        <Card className="p-6 space-y-5 border-primary/20">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <ArrowUp className="w-5 h-5 text-primary" />
              Place Your Bid via Razorpay
            </h2>
            <Badge variant="outline" className="text-xs">
              Min increment: {formatCurrency(minIncrement, currency)}
            </Badge>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Your Bid Amount ({currency}) — minimum {formatCurrency(minRequiredBid, currency)}
            </label>
            <Input
              type="number"
              value={bidAmount || ''}
              onChange={(e) => setBidAmount(Number(e.target.value))}
              min={minRequiredBid}
              step={minIncrement}
              placeholder={String(minRequiredBid)}
              className="text-lg font-bold h-12"
            />
            {/* Quick preset increments */}
            <div className="flex gap-2 flex-wrap pt-1">
              {[minRequiredBid, minRequiredBid + minIncrement * 2, minRequiredBid + minIncrement * 5].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setBidAmount(preset)}
                  className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                    bidAmount === preset
                      ? 'border-primary bg-primary/10 text-primary font-bold'
                      : 'border-border text-muted-foreground hover:border-primary/40'
                  }`}
                >
                  {formatCurrency(preset, currency)}
                </button>
              ))}
            </div>
          </div>

          {/* Fee and breakdown */}
          {bidAmount > 0 && (
            <div className="rounded-lg bg-muted/50 p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bid Amount</span>
                <span>{formatCurrency(bidAmount, currency)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-1">
                  Platform Fee ({feePct}%)
                  {isFounding && <ShieldCheck className="w-3.5 h-3.5 text-amber-600 inline" />}
                </span>
                <span>{formatCurrency(platformFee, currency)}</span>
              </div>
              <div className="flex justify-between font-bold border-t pt-2 mt-1 text-base">
                <span>Total Charge</span>
                <span className="text-primary">{formatCurrency(totalCharge, currency)}</span>
              </div>
            </div>
          )}

          {/* Real-time Rank Estimation */}
          {bidAmount >= minRequiredBid && estimatedRank && (
            <div className={`rounded-lg border p-4 flex items-center gap-3 ${
              estimatedRank === 1 ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/20' : 'border-primary/20 bg-primary/5'
            }`}>
              <TrendingUp className={`w-5 h-5 flex-shrink-0 ${estimatedRank === 1 ? 'text-amber-600' : 'text-primary'}`} />
              <div>
                <p className="font-semibold text-sm">
                  {estimatedRank === 1 ? '🥇 You would claim #1!' : `Projected Rank: #${estimatedRank}`}
                </p>
                <p className="text-xs text-muted-foreground">
                  Based on live authoritative positions in the {scopeTitle} leaderboard.
                </p>
              </div>
            </div>
          )}

          <Button
            className="w-full h-12 text-base gap-2"
            disabled={!isValidBid || placeBidMutation.isPending}
            onClick={handleCheckout}
          >
            {placeBidMutation.isPending ? 'Processing Razorpay...' : (
              <>
                <CreditCard className="w-4 h-4" />
                Pay & Claim with Razorpay ({formatCurrency(totalCharge, currency)})
              </>
            )}
          </Button>
        </Card>

        {/* Bid History */}
        {bidHistory.length > 0 && (
          <Card className="overflow-hidden">
            <div className="px-4 py-3 border-b flex items-center gap-2">
              <History className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Listing Bid History</h3>
            </div>
            <div className="divide-y">
              {bidHistory.map((bid) => (
                <div key={bid.id} className="px-4 py-3 flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">Rank #{bid.achieved_rank ?? bid.target_rank} Claimed</p>
                    <p className="text-xs text-muted-foreground">{new Date(bid.committed_at || bid.created_at).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(bid.amount, bid.currency || currency)}</p>
                    <Badge variant="secondary" className="text-xs">{bid.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

      </div>
    </>
  );
}
