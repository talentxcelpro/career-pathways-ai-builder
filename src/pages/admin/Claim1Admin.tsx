// src/pages/admin/Claim1Admin.tsx
// /admin/claim1 — Claim #1 Administration Panel with real currency metrics and payments inspection

import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Zap, Users, Flag, Eye, CreditCard, Sparkles } from 'lucide-react';
import { formatCurrency } from '@/services/claim1Service';

// ── Stats Overview ─────────────────────────────────────────────────────────────
function OverviewTab() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['claim1-admin-stats'],
    queryFn: async () => {
      const [listings, bids, entities, watchers, payments] = await Promise.all([
        supabase.from('claim1_listings').select('id', { count: 'exact', head: true }),
        supabase.from('claim1_bids').select('id', { count: 'exact', head: true }).eq('status', 'committed'),
        supabase.from('claim1_entities').select('id', { count: 'exact', head: true }),
        supabase.from('claim1_watchers').select('id', { count: 'exact', head: true }),
        supabase.from('claim1_payments').select('id', { count: 'exact', head: true }),
      ]);
      return {
        listings: listings.count ?? 0,
        bids:     bids.count ?? 0,
        entities: entities.count ?? 0,
        watchers: watchers.count ?? 0,
        payments: payments.count ?? 0,
      };
    },
    staleTime: 60_000,
  });

  const { data: recentBids = [] } = useQuery({
    queryKey: ['claim1-admin-recent-bids'],
    queryFn: async () => {
      const { data } = await supabase
        .from('claim1_bids')
        .select('*, entity:claim1_entities(name, is_founding_100), scope:claim1_scopes(slug, country_name, scope_type)')
        .eq('status', 'committed')
        .order('committed_at', { ascending: false })
        .limit(10);
      return data ?? [];
    },
    staleTime: 30_000,
  });

  if (isLoading) return <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-24" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Active Listings', value: stats?.listings, icon: <Trophy className="w-5 h-5 text-primary" /> },
          { label: 'Committed Bids',  value: stats?.bids,     icon: <Zap className="w-5 h-5 text-yellow-500" /> },
          { label: 'Payments Captured', value: stats?.payments, icon: <CreditCard className="w-5 h-5 text-green-500" /> },
          { label: 'Entities',        value: stats?.entities, icon: <Users className="w-5 h-5 text-blue-500" /> },
          { label: 'Watchers',        value: stats?.watchers, icon: <Eye className="w-5 h-5 text-purple-500" /> },
        ].map(({ label, value, icon }) => (
          <Card key={label} className="p-4">
            <div className="flex items-center gap-2 mb-1">{icon}<span className="text-xs text-muted-foreground font-semibold">{label}</span></div>
            <p className="text-2xl font-bold">{value ?? '—'}</p>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="px-5 py-3 border-b bg-muted/20">
          <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Recent Verified Bids</h3>
        </div>
        <div className="divide-y">
          {recentBids.length === 0
            ? <p className="text-sm text-muted-foreground text-center py-8">No bids captured yet.</p>
            : recentBids.map((bid: any) => (
                <div key={bid.id} className="px-5 py-3.5 flex items-center justify-between text-sm">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground">{bid.entity?.name}</p>
                      {bid.entity?.is_founding_100 && (
                        <Badge className="bg-amber-500/20 text-amber-700 text-[10px] gap-0.5">
                          <Sparkles className="w-2.5 h-2.5" /> Founding
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {bid.scope?.country_name ?? bid.scope?.scope_type} · {new Date(bid.committed_at || bid.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(bid.amount, bid.currency || 'INR')}</p>
                    <p className="text-xs text-primary font-medium">Claimed #{bid.achieved_rank ?? bid.target_rank}</p>
                  </div>
                </div>
              ))
          }
        </div>
      </Card>
    </div>
  );
}

// ── Listings Management ────────────────────────────────────────────────────────
function ListingsTab() {
  const queryClient = useQueryClient();
  const { data: listings = [], isLoading } = useQuery({
    queryKey: ['claim1-admin-listings'],
    queryFn: async () => {
      const { data } = await supabase
        .from('claim1_listings')
        .select('*, entity:claim1_entities(*), scope:claim1_scopes(slug, country_name, scope_type)')
        .order('current_rank', { ascending: true })
        .limit(100);
      return data ?? [];
    },
    staleTime: 30_000,
  });

  const suspendMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: 'suspended' | 'active' }) => {
      const { error } = await supabase.from('claim1_listings').update({ status: action }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, { action }) => {
      toast.success(action === 'suspended' ? 'Listing suspended' : 'Listing restored');
      queryClient.invalidateQueries({ queryKey: ['claim1-admin-listings'] });
    },
    onError: () => toast.error('Action failed'),
  });

  if (isLoading) return <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14" />)}</div>;

  return (
    <Card className="overflow-hidden">
      <div className="divide-y">
        {listings.length === 0
          ? <p className="text-sm text-muted-foreground text-center py-8">No listings yet.</p>
          : listings.map((listing: any) => (
              <div key={listing.id} className="px-5 py-3.5 flex items-center gap-4 text-sm flex-wrap sm:flex-nowrap">
                <div className="w-8 text-center font-bold text-muted-foreground">
                  #{listing.current_rank ?? '—'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold truncate">{listing.entity?.name}</p>
                    {listing.entity?.is_founding_100 && (
                      <Badge className="bg-amber-500/20 text-amber-700 text-[10px]">Founding 100</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {listing.scope?.country_name ?? listing.scope?.scope_type}
                    </Badge>
                    <Badge
                      variant={listing.status === 'active' ? 'secondary' : 'destructive'}
                      className="text-xs"
                    >{listing.status}</Badge>
                    {listing.entity?.fraud_status !== 'normal' && (
                      <Badge variant="destructive" className="text-xs">{listing.entity.fraud_status}</Badge>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold">{formatCurrency(listing.current_bid_amount, listing.currency || 'INR')}</p>
                </div>
                <Button
                  size="sm"
                  variant={listing.status === 'active' ? 'destructive' : 'outline'}
                  onClick={() => suspendMutation.mutate({
                    id: listing.id,
                    action: listing.status === 'active' ? 'suspended' : 'active'
                  })}
                  disabled={suspendMutation.isPending}
                  className="flex-shrink-0 text-xs"
                >
                  {listing.status === 'active' ? 'Suspend' : 'Restore'}
                </Button>
              </div>
            ))
        }
      </div>
    </Card>
  );
}

// ── Fraud Flags ────────────────────────────────────────────────────────────────
function FraudTab() {
  const queryClient = useQueryClient();
  const { data: flags = [], isLoading } = useQuery({
    queryKey: ['claim1-admin-fraud'],
    queryFn: async () => {
      const { data } = await supabase
        .from('claim1_fraud_flags')
        .select('*, entity:claim1_entities(name)')
        .order('created_at', { ascending: false })
        .limit(50);
      return data ?? [];
    },
    staleTime: 30_000,
  });

  const resolveMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('claim1_fraud_flags').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Flag updated');
      queryClient.invalidateQueries({ queryKey: ['claim1-admin-fraud'] });
    },
  });

  if (isLoading) return <Skeleton className="h-32 w-full" />;

  return (
    <Card className="overflow-hidden">
      {flags.length === 0
        ? <p className="text-sm text-muted-foreground text-center py-10">No fraud flags open. Clean state! 🎉</p>
        : (
          <div className="divide-y">
            {flags.map((flag: any) => (
              <div key={flag.id} className="px-5 py-3.5 flex items-center gap-4 text-sm">
                <div className="flex-1">
                  <p className="font-semibold">{flag.entity?.name ?? 'Unknown entity'}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge
                      variant={flag.severity === 'critical' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >{flag.severity}</Badge>
                    <span className="text-muted-foreground text-xs">{flag.flag_type}</span>
                    <Badge variant="outline" className="text-xs">{flag.status}</Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm" variant="outline"
                    onClick={() => resolveMutation.mutate({ id: flag.id, status: 'resolved' })}
                    disabled={flag.status === 'resolved'}
                  >Resolve</Button>
                  <Button
                    size="sm" variant="ghost"
                    onClick={() => resolveMutation.mutate({ id: flag.id, status: 'false_positive' })}
                    disabled={flag.status === 'false_positive'}
                  >False +</Button>
                </div>
              </div>
            ))}
          </div>
        )
      }
    </Card>
  );
}

// ── Watchers Inspection ────────────────────────────────────────────────────────
function WatchersTab() {
  const { data: watchers = [], isLoading } = useQuery({
    queryKey: ['claim1-admin-watchers'],
    queryFn: async () => {
      const { data } = await supabase
        .from('claim1_watchers')
        .select('*, scope:claim1_scopes(slug, country_name, scope_type)')
        .order('created_at', { ascending: false })
        .limit(200);
      return data ?? [];
    },
    staleTime: 60_000,
  });

  const countByScope = watchers.reduce((acc: Record<string, number>, w: any) => {
    const key = w.scope?.country_name ?? w.scope?.scope_type ?? 'unknown';
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  if (isLoading) return <Skeleton className="h-32 w-full" />;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(countByScope).map(([scope, count]) => (
          <Card key={scope} className="p-4 text-center">
            <p className="text-2xl font-bold">{count as number}</p>
            <p className="text-xs text-muted-foreground mt-0.5 font-medium">{scope}</p>
          </Card>
        ))}
      </div>
      <Card className="overflow-hidden">
        <div className="px-5 py-3 border-b text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {watchers.length} Registered Watchers
        </div>
        <div className="divide-y max-h-80 overflow-y-auto">
          {watchers.map((w: any) => (
            <div key={w.id} className="px-5 py-3 flex items-center justify-between text-sm">
              <span className="text-muted-foreground font-mono text-xs">{w.email}</span>
              <Badge variant="outline" className="text-xs">
                {w.scope?.country_name ?? w.scope?.scope_type}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── Main Admin Shell ───────────────────────────────────────────────────────────
export default function Claim1Admin() {
  return (
    <>
      <Helmet>
        <title>Claim #1 Admin Panel — TalentXcel</title>
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="w-6 h-6 text-primary" />
            Claim #1 Administration Panel
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">Manage category leaderboards, listings, and capture fraud monitoring.</p>
        </div>

        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview & Bids</TabsTrigger>
            <TabsTrigger value="listings">Listings</TabsTrigger>
            <TabsTrigger value="fraud">
              Fraud Alerts
              <Flag className="w-3 h-3 ml-1.5" />
            </TabsTrigger>
            <TabsTrigger value="watchers">Watchers</TabsTrigger>
          </TabsList>

          <TabsContent value="overview"  className="mt-6"><OverviewTab /></TabsContent>
          <TabsContent value="listings"  className="mt-6"><ListingsTab /></TabsContent>
          <TabsContent value="fraud"     className="mt-6"><FraudTab /></TabsContent>
          <TabsContent value="watchers"  className="mt-6"><WatchersTab /></TabsContent>
        </Tabs>
      </div>
    </>
  );
}
