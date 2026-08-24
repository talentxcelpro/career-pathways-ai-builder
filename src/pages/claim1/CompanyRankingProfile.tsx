// src/pages/claim1/CompanyRankingProfile.tsx
// /company/:slug — Public SEO-crawlable company ranking profile with real currency metrics

import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ExternalLink, Trophy, Zap, Globe, ShieldCheck, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useEntity, useEntityListings, useRankingHistory } from '@/hooks/useClaim1';
import { formatCurrency } from '@/services/claim1Service';

const EVENT_LABELS: Record<string, string> = {
  entered:    '🟢 Entered Leaderboard',
  moved_up:   '⬆️ Moved Up',
  moved_down: '⬇️ Displaced Down',
  reached_1:  '🥇 Claimed #1',
  lost_1:     '📉 Lost #1',
  reclaimed:  '🔥 Reclaimed #1',
  outbid:     '⚔️ Outbid',
};

export default function CompanyRankingProfile() {
  const { slug } = useParams<{ slug: string }>();
  const { data: entity, isLoading: entityLoading } = useEntity(slug);
  const { data: listings = [], isLoading: listingsLoading } = useEntityListings(entity?.id);
  const { data: history = [] }  = useRankingHistory(entity?.id);

  if (entityLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
        <div className="flex gap-4">
          <Skeleton className="w-20 h-20 rounded-2xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (!entity) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-4">
        <Trophy className="w-12 h-12 mx-auto text-muted-foreground opacity-30" />
        <h1 className="text-2xl font-bold">Profile Not Found</h1>
        <p className="text-muted-foreground text-sm">This company has not been registered on the leaderboard yet.</p>
        <div className="flex gap-3 justify-center pt-2">
          <Link to="/rankings"><Button variant="outline">View Rankings</Button></Link>
          <Link to="/claim1/enter"><Button>Claim a Profile</Button></Link>
        </div>
      </div>
    );
  }

  const topListing = listings[0];
  const totalSpent = listings.reduce((s, l) => s + (l.total_spent_amount || 0), 0);
  const currency = topListing?.currency || 'INR';
  const isFounding = entity.is_founding_100 || entity.founding_fee_locked;

  const pageTitle = `${entity.name} — TalentXcel Rankings`;
  const pageDesc  = entity.description
    || `${entity.name} is competing on TalentXcel's global AI product leaderboard. View live rankings, bid history, and challenge for the top position.`;

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <link rel="canonical" href={`https://talentxcel.com/company/${entity.slug}`} />
      </Helmet>

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">

        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link to="/rankings" className="hover:text-primary">Rankings</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground font-medium">{entity.name}</span>
        </div>

        {/* Header Profile Section */}
        <div className="flex items-start gap-5">
          <div className="w-20 h-20 rounded-2xl border bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
            {entity.logo_url ? (
              <img src={entity.logo_url} alt={entity.name} className="w-full h-full object-contain p-1" />
            ) : (
              <span className="text-3xl font-bold text-muted-foreground">{entity.name.charAt(0)}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold">{entity.name}</h1>
              {entity.verified && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  <ShieldCheck className="w-3 h-3 text-primary" /> Verified
                </Badge>
              )}
              {isFounding && (
                <Badge className="bg-amber-500/20 text-amber-700 border-amber-500/40 text-xs gap-1">
                  <Sparkles className="w-3 h-3" /> Founding 100
                </Badge>
              )}
            </div>
            {entity.description && (
              <p className="text-muted-foreground text-sm mt-1.5">{entity.description}</p>
            )}
            <div className="flex items-center gap-3 mt-2 text-sm flex-wrap">
              {entity.country_name && (
                <span className="flex items-center gap-1 text-muted-foreground text-xs font-medium">
                  <Globe className="w-3.5 h-3.5" /> {entity.country_name}
                </span>
              )}
              {entity.website_url && (
                <a
                  href={entity.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                >
                  {entity.website_url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Metric Highlight Cards */}
        {listings.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Active Boards', value: listings.length },
              { label: 'Highest Rank',  value: topListing?.highest_rank ? `#${topListing.highest_rank}` : '—' },
              { label: 'Total Invested', value: formatCurrency(totalSpent, currency) },
            ].map(({ label, value }) => (
              <Card key={label} className="p-4 text-center">
                <p className="text-xl sm:text-2xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground mt-0.5 font-medium">{label}</p>
              </Card>
            ))}
          </div>
        )}

        {/* Current Active Rankings */}
        <Card className="overflow-hidden">
          <div className="px-5 py-3 border-b bg-muted/20">
            <h2 className="font-bold text-xs text-muted-foreground uppercase tracking-wider">Active Board Positions</h2>
          </div>
          {listingsLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2].map((i) => <Skeleton key={i} className="h-12 w-full rounded" />)}
            </div>
          ) : listings.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground text-sm">
              <p>Not competing on any active boards yet.</p>
            </div>
          ) : (
            <div className="divide-y">
              {listings.map((listing) => {
                const scope = listing.scope as any;
                const catSlug = scope?.category?.slug || 'ai-products';
                const scopeSlug = scope?.slug || 'global';
                const listCurr = listing.currency || 'INR';

                return (
                  <div key={listing.id} className="px-5 py-3.5 flex items-center gap-4 flex-wrap sm:flex-nowrap">
                    <div className="w-8 text-center font-bold text-base">
                      {listing.current_rank === 1 ? '🥇' :
                       listing.current_rank === 2 ? '🥈' :
                       listing.current_rank === 3 ? '🥉' :
                       `#${listing.current_rank ?? '—'}`}
                    </div>
                    <div className="flex-1 min-w-[160px]">
                      <Link
                        to={scopeSlug === 'global' ? `/rankings/${catSlug}` : `/rankings/${catSlug}/${scopeSlug}`}
                        className="text-sm font-semibold hover:text-primary transition-colors"
                      >
                        {scope?.scope_type === 'global' ? '🌍 Global AI Products' :
                         scope?.scope_type === 'emerging' ? '✨ Emerging AI Products' :
                         `${scope?.country_name || scopeSlug} AI Products`}
                      </Link>
                    </div>
                    <div className="text-right text-sm flex-shrink-0">
                      <p className="font-bold">{formatCurrency(listing.current_bid_amount, listCurr)}</p>
                      <p className="text-[10px] text-muted-foreground">{listing.bid_count} bids placed</p>
                    </div>
                    <Link to={`/claim1/bid/${listing.id}`}>
                      <Button size="sm" variant="outline" className="gap-1 text-xs">
                        <Zap className="w-3 h-3" /> Challenge
                      </Button>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Historical Event Timeline */}
        {history.length > 0 && (
          <Card className="overflow-hidden">
            <div className="px-5 py-3 border-b bg-muted/20">
              <h2 className="font-bold text-xs text-muted-foreground uppercase tracking-wider">Position Event History</h2>
            </div>
            <div className="divide-y max-h-64 overflow-y-auto">
              {history.slice(0, 15).map((event) => (
                <div key={event.id} className="px-5 py-3 flex items-center gap-3 text-sm">
                  <span className="flex-1 font-medium">{EVENT_LABELS[event.event_type] || event.event_type}</span>
                  {event.old_rank && event.new_rank && (
                    <span className="text-xs text-muted-foreground font-mono">#{event.old_rank} → #{event.new_rank}</span>
                  )}
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(event.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Bottom CTAs */}
        <div className="flex gap-3">
          {!entity.owner_user_id && (
            <Link to="/claim1/enter" className="flex-1">
              <Button variant="default" className="w-full font-semibold">Claim This Profile</Button>
            </Link>
          )}
          <Link to="/rankings" className="flex-1">
            <Button variant="outline" className="w-full font-semibold">Explore All Leaderboards</Button>
          </Link>
        </div>

      </div>
    </>
  );
}
