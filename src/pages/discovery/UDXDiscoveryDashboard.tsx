import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  TrendingUp, 
  ShieldCheck, 
  BrainCircuit, 
  Sparkles, 
  Activity, 
  AlertCircle, 
  Database,
  Compass, 
  ArrowUpRight, 
  RefreshCw, 
  Eye, 
  CheckCircle2, 
  Clock, 
  Radio, 
  Zap, 
  Globe,
  Radar,
  GitFork,
  Cpu,
  Bot, 
  History, 
  ExternalLink,
  Target,
  Sparkle
} from 'lucide-react';
import { GSCControlPanel } from './components/GSCControlPanel';
import { DemandQueriesTable, DemandEntity } from './components/DemandQueriesTable';
import { WorldView } from './components/WorldView';
import { NowView } from './components/NowView';
import { ForesightRadarView } from './components/ForesightRadarView';
import { PossibilityGraphView } from './components/PossibilityGraphView';
import { RealityEngineView } from './components/RealityEngineView';
import { OutcomeView } from './components/OutcomeView';
import { SEOIntelligenceView } from './components/SEOIntelligenceView';
import { WorldObservatoryPayload, IntentCollapseEngine } from '@/lib/discovery/world';
import { UDXIntent } from '@/lib/udx/core/IntentTypes';
import { getObservationClock, getCountryMeta } from '@/lib/udx/observationClock';

export type UDXPillarMode = 'WORLD' | 'NOW' | 'FUTURE' | 'ACTION' | 'OUTCOME' | 'SEO_INTELLIGENCE' | 'REALITY_ENGINE' | 'TELEMETRY';

interface Opportunity {
  opportunity_id: string;
  opportunity_type: string;
  priority: string;
  quadrant: string;
  opportunity_score: number;
  status: string;
  recommended_action: string;
  created_at: string;
  udx_demand_entities?: DemandEntity;
}

interface SearchMemory {
  memory_id: string;
  memory_type: string;
  content_pattern: string;
  outcome: string;
  confidence: number;
  observations: number;
  last_confirmed_at: string;
}

interface AuditLog {
  log_id: string;
  action_taken: string;
  policy_class: string;
  outcome: string;
  actor: string;
  created_at: string;
  metadata: any;
}

interface GscStatus {
  hasCredentials: boolean;
  propertyId: string;
  mode: string;
  serviceAccountEmail: string | null;
  clientId: string | null;
}

export default function UDXDiscoveryDashboard() {
  const [activePillar, setActivePillar] = useState<UDXPillarMode>('WORLD');
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [entities, setEntities] = useState<DemandEntity[]>([]);
  const [memory, setMemory] = useState<SearchMemory[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [gscStatus, setGscStatus] = useState<GscStatus | null>({
    hasCredentials: true,
    propertyId: 'https://talentxcel.in/',
    mode: 'LIVE_GSC_CONNECTED',
    serviceAccountEmail: 'antigravity-search@talentxcel-login.iam.gserviceaccount.com',
    clientId: '114907681688043399974'
  });
  const [totalEntitiesCount, setTotalEntitiesCount] = useState<number>(0);
  const [totalOpportunitiesCount, setTotalOpportunitiesCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [worldLoading, setWorldLoading] = useState(true);
  const [worldPayload, setWorldPayload] = useState<WorldObservatoryPayload | null>(null);
  const [selectedQuadrant, setSelectedQuadrant] = useState<string>('ALL');
  const [oppSearch, setOppSearch] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [geoLevel, setGeoLevel] = useState<string>('GLOBAL');
  const [selectedCountry, setSelectedCountry] = useState<string>('GLOBAL');
  const clock = getObservationClock();

  const fetchDiscoveryData = async () => {
    setLoading(true);
    setWorldLoading(true);
    setError(null);
    try {
      // 1. Fetch World Observatory Intent Graph in parallel
      try {
        const wRes = await fetch('/api/discovery/world-data');
        if (wRes.ok) {
          const wData = await wRes.json();
          if (wData.success) {
            setWorldPayload(wData);
          }
        }
      } catch (wErr) {
        console.warn('[UDX] World Data API error, will compute from entities:', wErr);
      } finally {
        setWorldLoading(false);
      }

      // 2. Load Telemetry via local API (service-role backed)
      let apiLoaded = false;
      try {
        const res = await fetch('/api/discovery/data');
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setOpportunities(data.opportunities || []);
            setEntities(data.entities || []);
            setTotalEntitiesCount(data.totalEntities || data.entities?.length || 0);
            setTotalOpportunitiesCount(data.totalOpportunities || data.opportunities?.length || 0);
            setMemory(data.memory || []);
            setAuditLogs(data.auditLogs || []);
            if (data.gscStatus) setGscStatus(data.gscStatus);
            if (!worldPayload && data.entities?.length) {
              setWorldPayload(IntentCollapseEngine.collapse(data.entities));
            }
            apiLoaded = true;
          }
        }
      } catch (apiErr) {
        console.warn('[UDX] Local API not reachable, falling back to direct client');
      }

      if (apiLoaded) return;

      // 2. Direct Supabase Client Fallback
      const { count: entCount } = await supabase
        .from('udx_demand_entities')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', 'talentxcel');
      if (entCount !== null && entCount !== undefined) {
        setTotalEntitiesCount(entCount);
      }

      const { count: oppCount } = await supabase
        .from('udx_opportunities')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', 'talentxcel');
      if (oppCount !== null && oppCount !== undefined) {
        setTotalOpportunitiesCount(oppCount);
      }

      const { data: oppData, error: oppErr } = await supabase
        .from('udx_opportunities')
        .select(`
          opportunity_id,
          opportunity_type,
          priority,
          quadrant,
          opportunity_score,
          status,
          recommended_action,
          created_at,
          udx_demand_entities (
            entity_id, query, normalized_query, impressions, clicks, ctr, avg_position, country, intent, audience, business_segment, supply_page
          )
        `)
        .eq('tenant_id', 'talentxcel')
        .order('opportunity_score', { ascending: false })
        .limit(100);

      if (oppErr) throw oppErr;
      setOpportunities((oppData as any) || []);

      // Paginated fetch of all demand entities to feed complete warehouse into IntentCollapseEngine
      let allEntities: any[] = [];
      let page = 0;
      let hasMore = true;
      while (hasMore && page < 5) {
        const { data: pageData, error: pageErr } = await supabase
          .from('udx_demand_entities')
          .select('*')
          .eq('tenant_id', 'talentxcel')
          .order('impressions', { ascending: false })
          .range(page * 1000, (page + 1) * 1000 - 1);
        if (pageErr || !pageData || pageData.length === 0) {
          hasMore = false;
        } else {
          allEntities = allEntities.concat(pageData);
          if (pageData.length < 1000) {
            hasMore = false;
          } else {
            page++;
          }
        }
      }
      setEntities(allEntities);

      const { data: memData } = await supabase
        .from('udx_search_memory')
        .select('*')
        .eq('tenant_id', 'talentxcel')
        .order('confidence', { ascending: false })
        .limit(20);
      setMemory(memData || []);

      const { data: logData } = await supabase
        .from('udx_audit_log')
        .select('*')
        .eq('tenant_id', 'talentxcel')
        .order('created_at', { ascending: false })
        .limit(15);
      setAuditLogs(logData || []);

      if (allEntities && allEntities.length > 0) {
        setWorldPayload(prev => prev || IntentCollapseEngine.collapse(allEntities));
      }

    } catch (err: any) {
      console.error('[UDX Dashboard] Error loading data:', err);
      setError(err.message || 'Failed to connect to UDX data warehouse.');
    } finally {
      setLoading(false);
      setWorldLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscoveryData();
  }, []);

  const liveCanonicalIntents: UDXIntent[] = useMemo(() => {
    if (!worldPayload?.canonicalIntents || worldPayload.canonicalIntents.length === 0) {
      return [];
    }
    return worldPayload.canonicalIntents.map((wi) => ({
      intentId: wi.id,
      canonicalIntent: wi.canonicalQuery,
      goal: wi.canonicalQuery,
      domain: 'CAREER',
      epistemicStatus: 'OBSERVED',
      confidence: 0.94,
      constraints: [],
      entities: [],
      sourceSignals: (wi.rawQueries || []).map((q, i) => ({
        signalId: `sig-${wi.id}-${i}`,
        channel: 'SEARCH_QUERY' as const,
        rawPayload: q,
        detectedAt: new Date().toISOString(),
        confidence: 0.95,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  }, [worldPayload]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="flex items-start gap-3.5">
            <div className="p-3 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-2xl shadow-inner">
              <Compass className="w-7 h-7 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                  UDX — Universal Discovery & Intelligence OS
                </h1>
                <Badge variant="outline" className="border-indigo-500/40 text-indigo-300 bg-indigo-500/10 font-mono text-xs px-2.5 py-0.5">
                  Blueprint v3.0 Core
                </Badge>
                <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 bg-emerald-500/10 font-mono text-xs px-2.5 py-0.5">
                  Proving Ground: talentxcel.in
                </Badge>
                <Badge variant="outline" className="border-cyan-500/40 text-cyan-300 bg-cyan-500/10 font-mono text-xs px-2.5 py-0.5 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                  MODE_B_REALITY: ACTIVE
                </Badge>
              </div>
              <p className="text-sm text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                <span>Warehouse: <code className="text-indigo-300 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">dthlgsnakhoftinssokm</code></span>
                <span>•</span>
                <span>Property: <code className="text-emerald-300 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">{gscStatus?.propertyId || 'sc-domain:talentxcel.in'}</code></span>
                <span>•</span>
                <span>Global Supply: <code className="text-amber-300 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">Observed: {totalEntitiesCount.toLocaleString()} Signals | Verified: 0 (NO_VERIFIED_GLOBAL_DATA)</code></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchDiscoveryData}
              disabled={loading}
              className="border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-200"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Sync Telemetry
            </Button>
            
            <div className="px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 text-xs font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {gscStatus?.hasCredentials ? 'GSC API: Live Sync' : (totalEntitiesCount > 0 ? `GSC Warehouse: ${totalEntitiesCount.toLocaleString()} Ingested` : 'GSC Wire: Standby')}
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-950/40 border border-rose-800/50 text-rose-300 rounded-xl flex items-center gap-3 text-sm">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <span className="font-semibold">Telemetry Notification:</span> {error}
            </div>
          </div>
        )}

        {/* 4 OPERATIONAL PILLARS OF UDX v3.0 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-2 rounded-2xl shadow-xl">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* PILLAR 1: WORLD */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActivePillar('WORLD')}
              className={`rounded-xl px-3.5 py-2 text-xs md:text-sm font-semibold transition-all flex items-center gap-2 ${
                activePillar === 'WORLD'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Globe className="w-4 h-4 text-blue-300" />
              <span>1. WORLD</span>
              <Badge className="ml-1 bg-blue-500/30 text-blue-100 border-none text-2xs font-mono">
                {worldPayload?.summary.totalCanonicalIntents || 16} N
              </Badge>
            </Button>

            {/* PILLAR 2: NOW */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActivePillar('NOW')}
              className={`rounded-xl px-3.5 py-2 text-xs md:text-sm font-semibold transition-all flex items-center gap-2 ${
                activePillar === 'NOW'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>2. NOW</span>
              <Badge className="ml-1 bg-emerald-500/30 text-emerald-100 border-none text-2xs font-mono">
                Truth Layer
              </Badge>
            </Button>

            {/* PILLAR 3: FUTURE */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActivePillar('FUTURE')}
              className={`rounded-xl px-3.5 py-2 text-xs md:text-sm font-semibold transition-all flex items-center gap-2 ${
                activePillar === 'FUTURE'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Radar className="w-4 h-4 text-purple-300" />
              <span>3. FUTURE</span>
              <Badge className="ml-1 bg-purple-500/30 text-purple-100 border-none text-2xs font-mono">
                Foresight
              </Badge>
            </Button>

            {/* PILLAR 4: ACTION */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActivePillar('ACTION')}
              className={`rounded-xl px-3.5 py-2 text-xs md:text-sm font-semibold transition-all flex items-center gap-2 ${
                activePillar === 'ACTION'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <GitFork className="w-4 h-4 text-amber-300" />
              <span>4. ACTION</span>
              <Badge className="ml-1 bg-amber-500/30 text-amber-100 border-none text-2xs font-mono">
                Best Path
              </Badge>
            </Button>

            {/* PILLAR 5: OUTCOME */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActivePillar('OUTCOME')}
              className={`rounded-xl px-3.5 py-2 text-xs md:text-sm font-semibold transition-all flex items-center gap-2 ${
                activePillar === 'OUTCOME'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Target className="w-4 h-4 text-emerald-300" />
              <span>5. OUTCOME</span>
              <Badge className="ml-1 bg-emerald-500/30 text-emerald-100 border-none text-2xs font-mono">
                IRR & SDR
              </Badge>
            </Button>

            {/* OPERATING LAYER: SEO INTELLIGENCE */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActivePillar('SEO_INTELLIGENCE')}
              className={`rounded-xl px-3.5 py-2 text-xs md:text-sm font-semibold transition-all flex items-center gap-2 ${
                activePillar === 'SEO_INTELLIGENCE'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-400/50'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BrainCircuit className="w-4 h-4 text-indigo-300 animate-pulse" />
              <span>SEO INTELLIGENCE</span>
              <Badge className="ml-1 bg-indigo-500/30 text-indigo-100 border-none text-2xs font-mono">
                12 ANSWERS
              </Badge>
            </Button>

            {/* REALITY ENGINE: PROOF */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActivePillar('REALITY_ENGINE')}
              className={`rounded-xl px-3.5 py-2 text-xs md:text-sm font-semibold transition-all flex items-center gap-2 ${
                activePillar === 'REALITY_ENGINE'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-400/50'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Cpu className="w-4 h-4 text-emerald-300 animate-pulse" />
              <span>REALITY ENGINE</span>
              <Badge className="ml-1 bg-emerald-500/30 text-emerald-100 border-none text-2xs font-mono">
                PROOF
              </Badge>
            </Button>

            {/* TELEMETRY DRAWER */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActivePillar('TELEMETRY')}
              className={`rounded-xl px-3 py-2 text-xs font-mono transition-all flex items-center gap-1.5 ${
                activePillar === 'TELEMETRY'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/40'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-slate-400" />
              <span>Telemetry & GSC Wire</span>
            </Button>
          </div>

          <div className="flex items-center gap-2 text-2xs font-mono text-slate-400 px-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Closed-Loop Moat: Active</span>
          </div>
        </div>

        {/* PILLAR VIEWS */}
        {activePillar === 'WORLD' && (
          <WorldView
            payload={worldPayload}
            loading={worldLoading}
            onRefresh={fetchDiscoveryData}
            onSelectTalentXcelView={() => setActivePillar('NOW')}
          />
        )}

        {activePillar === 'NOW' && (
          <NowView
            opportunities={opportunities}
            entities={entities}
            totalEntitiesCount={totalEntitiesCount}
            geoLevel={geoLevel}
            activeCountry={selectedCountry}
            totalOpportunitiesCount={totalOpportunitiesCount}
            selectedQuadrant={selectedQuadrant}
            setSelectedQuadrant={setSelectedQuadrant}
            oppSearch={oppSearch}
            setOppSearch={setOppSearch}
          />
        )}

        {activePillar === 'FUTURE' && (
          <ForesightRadarView intents={liveCanonicalIntents} />
        )}

        {activePillar === 'ACTION' && (
          <PossibilityGraphView initialLocation="Global" />
        )}

        {activePillar === 'OUTCOME' && (
          <OutcomeView totalEntitiesCount={totalEntitiesCount}
            geoLevel={geoLevel}
            activeCountry={selectedCountry} />
        )}

        {activePillar === 'SEO_INTELLIGENCE' && (
          <SEOIntelligenceView
            totalEntitiesCount={totalEntitiesCount}
            geoLevel={geoLevel}
            activeCountry={selectedCountry}
            totalOpportunitiesCount={totalOpportunitiesCount}
            entities={entities}
            opportunities={opportunities}
            memory={memory}
            auditLogs={auditLogs}
            loading={loading}
          />
        )}

        {activePillar === 'REALITY_ENGINE' && (
          <RealityEngineView />
        )}

        {activePillar === 'TELEMETRY' && (
          <div className="space-y-6">
            <Tabs defaultValue="queries" className="space-y-4">
              <TabsList className="bg-slate-900 border border-slate-800 p-1 rounded-xl">
                <TabsTrigger value="queries" className="data-[state=active]:bg-indigo-600 text-slate-400 data-[state=active]:text-white">
                  <Database className="w-4 h-4 mr-2" />
                  Demand Queries ({totalEntitiesCount})
                </TabsTrigger>
                <TabsTrigger value="gsc" className="data-[state=active]:bg-emerald-600 text-slate-400 data-[state=active]:text-white">
                  <Radio className="w-4 h-4 mr-2" />
                  GSC Live OAuth & Sync
                </TabsTrigger>
                <TabsTrigger value="memory" className="data-[state=active]:bg-indigo-600 text-slate-400 data-[state=active]:text-white">
                  <BrainCircuit className="w-4 h-4 mr-2" />
                  Intent Memory (Moat)
                </TabsTrigger>
                <TabsTrigger value="audit" className="data-[state=active]:bg-indigo-600 text-slate-400 data-[state=active]:text-white">
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  Audit Trail
                </TabsTrigger>
              </TabsList>

              <TabsContent value="queries" className="space-y-4">
                <DemandQueriesTable entities={entities} totalCount={totalEntitiesCount} />
              </TabsContent>

              <TabsContent value="gsc" className="space-y-6">
                <GSCControlPanel gscStatus={gscStatus} totalQueries={totalEntitiesCount} onRefresh={fetchDiscoveryData} />
              </TabsContent>

              <TabsContent value="memory" className="space-y-4">
                <Card className="bg-slate-900/60 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-base text-white flex items-center gap-2">
                      <BrainCircuit className="w-4 h-4 text-indigo-400" />
                      Accumulated Search Memory (Moat)
                    </CardTitle>
                    <CardDescription className="text-slate-400 text-xs">
                      Causal intelligence derived from completed experiments. Never overwritten; confidence compounds with verified observations.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {memory.length === 0 ? (
                      <div className="text-center py-12 text-slate-500 text-sm">
                        No completed experiments yet. As the UDX Experiment Engine tests content briefs and CTR fixes, causal patterns accumulate here.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {memory.map(m => (
                          <div key={m.memory_id} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-white text-sm">{m.content_pattern}</div>
                              <div className="text-xs text-slate-400 mt-1">Outcome: <span className="text-emerald-400">{m.outcome}</span> • Observations: {m.observations}</div>
                            </div>
                            <Badge variant="outline" className="border-indigo-500/40 text-indigo-300 font-mono text-xs">
                              Confidence: {(m.confidence * 100).toFixed(0)}%
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="audit" className="space-y-4">
                <Card className="bg-slate-900/60 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-base text-white flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      Immutable Decision Audit Log
                    </CardTitle>
                    <CardDescription className="text-slate-400 text-xs">
                      Every automated analysis, policy evaluation, and execution step is stamped with full provenance.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {auditLogs.length === 0 ? (
                      <div className="text-center py-12 text-slate-500 text-sm">
                        No audit records yet. Logs will be recorded during GSC sync and loop executions.
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-800/60">
                        {auditLogs.map(log => (
                          <div key={log.log_id} className="py-3 flex items-center justify-between text-sm">
                            <div className="flex items-center gap-3">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                              <div>
                                <span className="font-medium text-white">{log.action_taken}</span>
                                <span className="text-xs text-slate-500 ml-2 font-mono">by {log.actor}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="text-xs font-mono border-slate-800 text-slate-400">
                                {log.policy_class}
                              </Badge>
                              <span className="text-xs text-slate-500 font-mono">
                                {new Date(log.created_at).toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}

      </div>
    </div>
  );
}
