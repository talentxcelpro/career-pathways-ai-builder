import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Trophy,
  Zap,
  ArrowUp,
  Bell,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Edit3,
  Globe,
  Building2,
} from 'lucide-react';
import { useMyListings, useMyBids, useMyEntities } from '@/hooks/useClaim1';
import { formatCurrency } from '@/services/claim1Service';
import { EditEntityProfileModal } from '@/components/claim1/EditEntityProfileModal';
import { ShareRankModal } from '@/components/claim1/ShareRankModal';
import { EmbedBadgeModal } from '@/components/claim1/EmbedBadgeModal';
import { Code, Flame } from 'lucide-react';
import type { Claim1Listing, Claim1Entity } from '@/types/claim1';

export default function ParticipantDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: myEntities = [], isLoading: entitiesLoading } = useMyEntities();
  const { data: myListings = [], isLoading: listingsLoading } = useMyListings();
  const { data: myBids = [],    isLoading: bidsLoading }     = useMyBids();

  const [editingEntity, setEditingEntity] = useState<Claim1Entity | null>(null);
  const [sharingEntity, setSharingEntity] = useState<Claim1Entity | null>(null);
  const [badgingEntity, setBadgingEntity] = useState<Claim1Entity | null>(null);

  // Fetch unread outbid notifications
  const { data: outbidNotifs = [], refetch: refetchNotifs } = useQuery({
    queryKey: ['claim1-outbid-notifs', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'claim1_outbid')
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(10);
      return data ?? [];
    },
    enabled: !!user?.id,
    staleTime: 15_000,
  });

  const markRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    refetchNotifs();
  };

  const rankDisplay = (listing: Claim1Listing) => {
    if (!listing.current_rank) return '—';
    if (listing.current_rank === 1) return '🥇 #1';
    if (listing.current_rank === 2) return '🥈 #2';
    if (listing.current_rank === 3) return '🥉 #3';
    return `#${listing.current_rank}`;
  };

  const getScopeLabel = (listing: Claim1Listing) => {
    const scope = listing.scope as any;
    if (!scope) return '';
    if (scope.scope_type === 'global')   return '🌍 Global';
    if (scope.scope_type === 'emerging') return '✨ Emerging';
    return scope.country_name || scope.slug || '';
  };

  return (
    <>
      <Helmet>
        <title>My Rankings Dashboard — TalentXcel</title>
      </Helmet>

      {editingEntity && (
        <EditEntityProfileModal
          entity={editingEntity}
          open={!!editingEntity}
          onOpenChange={(open) => !open && setEditingEntity(null)}
        />
      )}

      {sharingEntity && (
        <ShareRankModal
          entity={sharingEntity}
          open={!!sharingEntity}
          onOpenChange={(open) => !open && setSharingEntity(null)}
          currentRank={myListings.find((l) => l.entity_id === sharingEntity.id)?.current_rank || 1}
          scopeName="Global AI Products"
        />
      )}

      {badgingEntity && (
        <EmbedBadgeModal
          entity={badgingEntity}
          open={!!badgingEntity}
          onOpenChange={(open) => !open && setBadgingEntity(null)}
          currentRank={myListings.find((l) => l.entity_id === badgingEntity.id)?.current_rank || 1}
        />
      )}

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">

        {/* Dashboard Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold">My Rankings Dashboard</h1>
            <p className="text-muted-foreground mt-1">Track your public leaderboard positions, flex social proof, and reclaim rank instantly.</p>
          </div>
          <Link to="/claim1/enter">
            <Button className="gap-1.5">
              <Trophy className="w-4 h-4" /> Enter Another Board
            </Button>
          </Link>
        </div>

        {/* Claimed Company Overview Cards */}
        {myEntities.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Your Claimed Profile</h2>
            {myEntities.map((ent) => (
              <Card key={ent.id} className="p-5 flex items-center justify-between gap-4 flex-wrap bg-card border shadow-sm">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl border bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                    {ent.logo_url ? (
                      <img src={ent.logo_url} alt={ent.name} className="w-full h-full object-contain p-1" />
                    ) : (
                      <span className="text-xl font-bold text-muted-foreground">{ent.name.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-base text-foreground">{ent.name}</h3>
                      {ent.is_founding_100 && (
                        <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/40 text-[10px] gap-1">
                          <Sparkles className="w-2.5 h-2.5" /> Founding 100
                        </Badge>
                      )}
                    </div>
                    {ent.tagline && (
                      <p className="text-xs text-muted-foreground mt-0.5">{ent.tagline}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setBadgingEntity(ent)}
                    className="gap-1 text-xs"
                  >
                    <Code className="w-3.5 h-3.5 text-primary" /> Embed Badge
                  </Button>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => setSharingEntity(ent)}
                    className="gap-1 text-xs bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-sm"
                  >
                    <Flame className="w-3.5 h-3.5" /> Share & Flex
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingEntity(ent)}
                    className="gap-1 text-xs"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit Profile
                  </Button>
                  <Link to={`/company/${ent.slug}`}>
                    <Button size="sm" variant="secondary" className="gap-1 text-xs">
                      <Globe className="w-3.5 h-3.5" /> View Public Page
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* High-Priority Outbid Alerts Banner with Exact Reclaim Price */}
        {outbidNotifs.length > 0 && (
          <Card className="overflow-hidden border-orange-500/40 bg-orange-50/20 dark:bg-orange-950/20">
            <div className="px-5 py-3 border-b border-orange-500/30 bg-orange-500/10 flex items-center justify-between">
              <div className="flex items-center gap-2 text-orange-700 dark:text-orange-400 font-bold text-sm">
                <ShieldAlert className="w-4 h-4" />
                {outbidNotifs.length} Outbid Notice{outbidNotifs.length > 1 ? 's' : ''} — Action Required
              </div>
              <span className="text-xs text-muted-foreground">Immediate Reclaim Available</span>
            </div>
            <div className="divide-y divide-orange-500/20">
              {outbidNotifs.map((notif: any) => {
                const reclaimPrice = notif.data?.reclaim_price;
                const currency = notif.data?.currency || 'INR';
                const actionUrl = notif.action_url || `/claim1/bid/${notif.data?.listing_id}`;

                return (
                  <div key={notif.id} className="px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-[240px]">
                      <p className="font-semibold text-sm text-foreground">{notif.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{notif.message}</p>
                      {reclaimPrice && (
                        <p className="text-xs font-bold text-primary mt-1">
                          Reclaim Target: {formatCurrency(reclaimPrice, currency)}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        className="gap-1 bg-orange-600 hover:bg-orange-700 text-white"
                        onClick={() => {
                          markRead(notif.id);
                          navigate(actionUrl);
                        }}
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                        Reclaim Position
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => markRead(notif.id)}
                      >
                        Dismiss
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* My Position Listings */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            My Active Positions
          </h2>

          {listingsLoading || entitiesLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
            </div>
          ) : myListings.length === 0 ? (
            <Card className="py-12 text-center space-y-3">
              <Trophy className="w-10 h-10 mx-auto text-muted-foreground opacity-40" />
              <p className="font-semibold text-lg">
                {myEntities.length > 0 ? 'No active board listings yet' : "You haven't claimed any positions yet"}
              </p>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                {myEntities.length > 0
                  ? `Select which category boards ${myEntities[0].name} should compete in. Entry is 100% free.`
                  : 'Initial entry is completely free. Claim your profile to start tracking your ranking.'}
              </p>
              <Link to="/claim1/enter">
                <Button className="mt-2">
                  {myEntities.length > 0 ? 'Enter Category Boards' : 'Claim Your Position'}
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-3">
              {myListings.map((listing) => {
                const entity = listing.entity;
                const currency = listing.currency || 'INR';
                const isFounding = entity?.is_founding_100 || entity?.founding_fee_locked;

                return (
                  <Card key={listing.id} className="p-5 transition-all hover:border-primary/40">
                    <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
                      {/* Rank Indicator */}
                      <div className="w-16 text-center flex-shrink-0 bg-muted/40 py-2 rounded-lg border">
                        <p className="text-xl font-bold">{rankDisplay(listing)}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-semibold">Rank</p>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            to={`/company/${entity?.slug}`}
                            className="font-bold text-base hover:text-primary transition-colors truncate"
                          >
                            {entity?.name}
                          </Link>
                          {isFounding && (
                            <Badge className="bg-amber-500/20 text-amber-700 border-amber-500/30 text-[10px] gap-1">
                              <Sparkles className="w-2.5 h-2.5" /> Founding 100 (5% Fee)
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground flex-wrap">
                          <Badge variant="outline" className="text-xs">{getScopeLabel(listing)}</Badge>
                          <span>·</span>
                          <span>Current Bid: <strong>{formatCurrency(listing.current_bid_amount, currency)}</strong></span>
                          <span>·</span>
                          <span>Total Bids: <strong>{listing.bid_count}</strong></span>
                        </div>
                      </div>

                      {/* Action CTA */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Link to={`/claim1/bid/${listing.id}`}>
                          <Button size="sm" className="gap-1">
                            <Zap className="w-3.5 h-3.5" />
                            Increase Bid
                          </Button>
                        </Link>
                      </div>
                    </div>

                    {/* Stats footer if displaced */}
                    {listing.times_outbid > 0 && (
                      <div className="mt-3 pt-3 border-t flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                        <span>Outbid: <strong>{listing.times_outbid}×</strong></span>
                        <span>·</span>
                        <span>Best Rank: <strong>#{listing.highest_rank ?? '—'}</strong></span>
                        <span>·</span>
                        <span>Total Spent: <strong>{formatCurrency(listing.total_spent_amount, currency)}</strong></span>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* My Recent Bids */}
        {myBids.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              My Committed Bids
            </h2>
            <Card className="overflow-hidden">
              <div className="divide-y">
                {myBids.slice(0, 10).map((bid) => (
                  <div key={bid.id} className="px-5 py-3.5 flex items-center justify-between text-sm">
                    <div>
                      <p className="font-semibold">{bid.entity?.name ?? 'Leaderboard Bid'}</p>
                      <p className="text-xs text-muted-foreground">
                        Target Rank #{bid.target_rank} · {new Date(bid.committed_at || bid.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">{formatCurrency(bid.amount, bid.currency || 'INR')}</p>
                      <Badge variant="secondary" className="text-[10px] mt-0.5">{bid.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

      </div>
    </>
  );
}
