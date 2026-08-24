// src/pages/claim1/LeaderboardPage.tsx
// The authoritative Claim #1 leaderboard page.
// Shows only authentic claimed listings with real-time updates and real currencies (INR / USD).

import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import {
  Trophy,
  Zap,
  Globe,
  Eye,
  ArrowUp,
  ExternalLink,
  ChevronRight,
  Flame,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import {
  useScopeBySlug,
  useLeaderboard,
  useActivityFeed,
  useScopeStats,
  useWatchScope,
  claim1Keys,
} from '@/hooks/useClaim1';
import { formatCurrency, scopePath } from '@/services/claim1Service';
import type { Claim1Listing } from '@/types/claim1';

// ── Rank badge ────────────────────────────────────────────────────────────────
function RankBadge({ rank }: { rank: number | null }) {
  if (!rank) return <span className="text-muted-foreground text-sm font-semibold">—</span>;
  if (rank === 1) return <span className="text-2xl">🥇</span>;
  if (rank === 2) return <span className="text-2xl">🥈</span>;
  if (rank === 3) return <span className="text-2xl">🥉</span>;
  return (
    <span className="font-bold text-base text-muted-foreground">#{rank}</span>
  );
}

// ── Single leaderboard row ────────────────────────────────────────────────────
function LeaderboardRow({
  listing,
  isTop3,
}: {
  listing: Claim1Listing;
  isTop3: boolean;
}) {
  const entity = listing.entity;
  if (!entity) return null;
  const currency = listing.currency || 'INR';
  const isFounding = entity.is_founding_100 || entity.founding_fee_locked;

  return (
    <div
      className={`flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/40 ${
        isTop3 ? 'bg-gradient-to-r from-primary/5 via-transparent to-transparent' : ''
      }`}
    >
      {/* Rank Indicator */}
      <div className="w-10 flex-shrink-0 flex items-center justify-center">
        <RankBadge rank={listing.current_rank} />
      </div>

      {/* Logo */}
      <div className="w-10 h-10 flex-shrink-0 rounded-xl overflow-hidden bg-muted flex items-center justify-center border">
        {entity.logo_url ? (
          <img
            src={entity.logo_url}
            alt={entity.name}
            className="w-full h-full object-contain p-0.5"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <span className="text-base font-bold text-muted-foreground">
            {entity.name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      {/* Name + Meta */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to={`/company/${entity.slug}`}
            className="font-bold text-foreground hover:text-primary transition-colors truncate"
          >
            {entity.name}
          </Link>
          {entity.verified && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 gap-0.5">
              <ShieldCheck className="w-2.5 h-2.5 text-primary" /> Verified
            </Badge>
          )}
          {isFounding && (
            <Badge className="text-[10px] px-1.5 py-0 bg-amber-500/20 text-amber-700 border-amber-500/40 gap-0.5">
              <Sparkles className="w-2.5 h-2.5" /> Founding 100
            </Badge>
          )}
          {entity.country_name && (
            <span className="text-xs text-muted-foreground">{entity.country_name}</span>
          )}
        </div>
        {entity.website_url && (
          <a
            href={entity.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 mt-0.5 truncate"
          >
            {entity.website_url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
            <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" />
          </a>
        )}
      </div>

      {/* Bid Amount */}
      <div className="text-right flex-shrink-0">
        <p className="font-bold text-sm text-foreground">
          {formatCurrency(listing.current_bid_amount, currency)}
        </p>
        <p className="text-[10px] text-muted-foreground uppercase font-semibold">
          {listing.bid_count} {listing.bid_count === 1 ? 'bid' : 'bids'}
        </p>
      </div>

      {/* Challenge CTA */}
      <div className="flex-shrink-0">
        <Link to={`/claim1/bid/${listing.id}`}>
          <Button size="sm" variant={isTop3 ? 'default' : 'outline'} className="text-xs gap-1 font-semibold">
            {isTop3 ? 'Challenge #1' : 'Outbid'}
            <ArrowUp className="w-3 h-3" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

// ── Main Page Component ───────────────────────────────────────────────────────
export default function LeaderboardPage() {
  const { categorySlug = 'ai-products', scopeSlug = 'global' } = useParams<{
    categorySlug: string;
    scopeSlug?: string;
  }>();
  const navigate    = useNavigate();
  const queryClient = useQueryClient();
  const [watchEmail, setWatchEmail] = useState('');
  const [page, setPage] = useState(1);

  const { data: scopeWithCat, isLoading: scopeLoading } = useScopeBySlug(categorySlug, scopeSlug);
  const scope    = scopeWithCat;
  const category = scopeWithCat?.category;

  const { data: leaderboardData, isLoading: boardLoading } = useLeaderboard(scope?.id, page);
  const { data: activityEvents = [] } = useActivityFeed(scope?.id);
  const { data: stats } = useScopeStats(scope?.id);
  const watchMutation = useWatchScope();

  const listings = leaderboardData?.listings ?? [];
  const total    = leaderboardData?.total ?? 0;
  const currency = scopeWithCat?.category?.default_currency || 'INR';

  // ── Supabase Realtime Subscription ──────────────────────────────────────────
  useEffect(() => {
    if (!scope?.id) return;

    const channel = supabase
      .channel(`claim1-leaderboard-${scope.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'claim1_listings', filter: `scope_id=eq.${scope.id}` },
        () => {
          queryClient.invalidateQueries({ queryKey: claim1Keys.leaderboard(scope.id, page) });
          queryClient.invalidateQueries({ queryKey: claim1Keys.activity(scope.id) });
          queryClient.invalidateQueries({ queryKey: claim1Keys.stats(scope.id) });
          toast.info('Leaderboard position updated in real-time', { duration: 2500 });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [scope?.id, page, queryClient]);

  // ── SEO Meta Tag Generation ─────────────────────────────────────────────────
  const scopeLabel = scope?.scope_type === 'global' ? 'Global'
                   : scope?.scope_type === 'emerging' ? 'Emerging'
                   : scope?.country_name ?? '';
  const categoryName = category?.name ?? 'AI Products';
  const topEntity    = listings[0]?.entity?.name ?? '';
  const topBid       = listings[0] ? formatCurrency(listings[0].current_bid_amount, currency) : '';
  const pageTitle    = `#1 ${categoryName} — ${scopeLabel} | TalentXcel Rankings`;
  const pageDesc     = topEntity
    ? `Currently #1: ${topEntity} with ${topBid}. See who is competing for #1 ${categoryName} ${scopeLabel === 'Global' ? 'worldwide' : 'in ' + scopeLabel}.`
    : `Compete for #1 ${categoryName} ${scopeLabel === 'Global' ? 'worldwide' : 'in ' + scopeLabel} on TalentXcel.`;
  const canonicalUrl = `https://talentxcel.com${scopePath(categorySlug, scopeSlug)}`;

  if (scopeLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-4">
        <Skeleton className="h-12 w-72" />
        <Skeleton className="h-6 w-48" />
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
      </div>
    );
  }

  if (!scope || !category) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Leaderboard not found</h1>
        <p className="text-muted-foreground mb-6">This category or scope does not exist yet.</p>
        <Link to="/rankings"><Button>See All Rankings</Button></Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">

        {/* ── Hero Section ─────────────────────────────────────────────── */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
            <Link to="/rankings" className="hover:text-primary font-medium">Rankings</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to={`/rankings/${categorySlug}`} className="hover:text-primary font-medium">{categoryName}</Link>
            {scopeSlug !== 'global' && (
              <>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-foreground font-semibold">{scopeLabel}</span>
              </>
            )}
          </div>

          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
            {scopeLabel === 'Global' ? 'Global' : scopeLabel} {categoryName} Leaderboard
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
            Compete for <strong>#1</strong> through transparent public bidding.
            Authoritative ranking with instant outbid alerts.
          </p>

          {/* Live Stats Counters */}
          {stats && (
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground flex-wrap pt-1">
              <span className="flex items-center gap-1 font-medium">
                <Flame className="w-4 h-4 text-orange-500" />
                {stats.total_listings} Competing
              </span>
              <span className="flex items-center gap-1 font-medium">
                <Zap className="w-4 h-4 text-yellow-500" />
                {stats.total_bids} Bids Placed
              </span>
              {stats.countries > 0 && (
                <span className="flex items-center gap-1 font-medium">
                  <Globe className="w-4 h-4 text-blue-500" />
                  {stats.countries} Countries
                </span>
              )}
            </div>
          )}

          <div className="flex items-center justify-center gap-3 pt-2">
            <Link to="/claim1/enter">
              <Button size="lg" className="gap-2 font-bold shadow-sm">
                <Trophy className="w-4 h-4" />
                Claim Your Position
              </Button>
            </Link>
          </div>
        </div>

        {/* ── Geographic Scope Navigation Tabs ─────────────────────────── */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {[
            { slug: 'global',    label: 'Global 🌍' },
            { slug: 'emerging',  label: 'Emerging ✨' },
            { slug: 'india',     label: '🇮🇳 India' },
            { slug: 'usa',       label: '🇺🇸 USA' },
            { slug: 'uae',       label: '🇦🇪 UAE' },
            { slug: 'uk',        label: '🇬🇧 UK' },
            { slug: 'singapore', label: '🇸🇬 Singapore' },
          ].map(({ slug, label }) => (
            <button
              key={slug}
              onClick={() => navigate(scopePath(categorySlug, slug))}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors flex-shrink-0
                ${scopeSlug === slug
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted/70 text-muted-foreground hover:bg-muted'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── Official Leaderboard Table (Zero Fake Rows) ──────────────── */}
        <Card className="overflow-hidden border-border/80">
          <div className="px-5 py-3.5 border-b bg-muted/20 flex items-center justify-between">
            <h2 className="font-bold text-xs text-muted-foreground uppercase tracking-wider">
              Authoritative Rankings
            </h2>
            <span className="text-xs font-semibold text-muted-foreground">{total} Participating</span>
          </div>

          {boardLoading ? (
            <div className="p-4 space-y-3">
              {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
            </div>
          ) : listings.length === 0 ? (
            <div className="py-20 text-center space-y-3 px-4">
              <Trophy className="w-12 h-12 mx-auto text-muted-foreground opacity-30" />
              <p className="font-bold text-xl text-foreground">The throne is empty.</p>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                No company has claimed #1 on this board yet. Initial entry is 100% free.
              </p>
              <Link to="/claim1/enter">
                <Button className="mt-3 font-bold">Claim #1 Now</Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {listings.map((listing, i) => (
                <LeaderboardRow
                  key={listing.id}
                  listing={listing}
                  isTop3={i < 3}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {total > 25 && (
            <div className="px-5 py-3 border-t flex items-center justify-between">
              <Button
                variant="outline" size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >Previous</Button>
              <span className="text-xs text-muted-foreground font-medium">
                Page {page} of {Math.ceil(total / 25)}
              </span>
              <Button
                variant="outline" size="sm"
                disabled={page >= Math.ceil(total / 25)}
                onClick={() => setPage((p) => p + 1)}
              >Next</Button>
            </div>
          )}
        </Card>

        {/* ── Public Live Activity Feed ─────────────────────────────────── */}
        {activityEvents.length > 0 && (
          <Card className="overflow-hidden">
            <div className="px-5 py-3.5 border-b bg-muted/20">
              <h2 className="font-bold text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-yellow-500" />
                Live Feed Activity
              </h2>
            </div>
            <div className="divide-y divide-border/40 max-h-64 overflow-y-auto">
              {activityEvents.map((event) => (
                <div key={event.id} className="px-5 py-3 flex items-center gap-3">
                  {event.entity?.logo_url ? (
                    <img src={event.entity.logo_url} alt="" className="w-6 h-6 rounded object-contain" />
                  ) : (
                    <div className="w-6 h-6 rounded bg-muted flex items-center justify-center text-xs font-bold">
                      {event.entity?.name?.charAt(0) ?? '?'}
                    </div>
                  )}
                  <span className="text-sm font-medium text-foreground flex-1">{event.headline}</span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(event.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* ── Zero-Friction Watcher Lead Capture ────────────────────────── */}
        <Card className="p-6 bg-gradient-to-br from-primary/5 to-background border-primary/20">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Eye className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-base mb-1">Get notified when #1 changes</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Enter your email to receive an instant alert when a new entity claims #1 on this board.
              </p>
              <form
                className="flex gap-2 max-w-sm"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!scope?.id || !watchEmail.trim()) return;
                  watchMutation.mutate({ scopeId: scope.id, email: watchEmail.trim() });
                  setWatchEmail('');
                }}
              >
                <Input
                  type="email"
                  placeholder="name@company.com"
                  value={watchEmail}
                  onChange={(e) => setWatchEmail(e.target.value)}
                  required
                  className="flex-1"
                />
                <Button type="submit" disabled={watchMutation.isPending} variant="default">
                  {watchMutation.isPending ? 'Subscribing...' : 'Watch Board'}
                </Button>
              </form>
            </div>
          </div>
        </Card>

      </div>
    </>
  );
}
