// src/pages/admin/EmbedGrowthCampaignDashboard.tsx
// TalentXcel Global Embed Adoption Engine — Publisher Acquisition & Campaign Command Center
// Enhanced with Data-Driven Live Status, Test Isolation, and Outreach Persistence

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { publisherDiscovery } from '@/services/publisher/PublisherDiscoveryEngine';
import {
  PublisherOpportunity,
  PublisherCategory,
  PublisherPipelineStage,
  OpportunityPriority,
  CampaignFunnelStats
} from '@/types/publisherAdoption';
import {
  Users,
  Building2,
  Mail,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  Search,
  Filter,
  Sliders,
  Sparkles,
  ShieldCheck,
  Globe,
  ArrowRight,
  TrendingUp,
  Send,
  MessageSquare,
  Share2,
  Layers,
  ChevronRight,
  XCircle,
  RefreshCw,
  Award,
  Database,
  Radio,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';

type DashboardDataStatus = 'LIVE PRODUCTION DATA' | 'NO LIVE ACTIVITY YET' | 'TEST DATA' | 'DATA UNAVAILABLE';

export const EmbedGrowthCampaignDashboard: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<PublisherCategory | 'all'>('all');
  const [selectedPriority, setSelectedPriority] = useState<OpportunityPriority | 'all'>('all');
  const [selectedStage, setSelectedStage] = useState<PublisherPipelineStage | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedOpportunity, setSelectedOpportunity] = useState<PublisherOpportunity | null>(null);
  const [hasCopiedSnippet, setHasCopiedSnippet] = useState<string | null>(null);

  // Data Integrity & Operational States
  const [isTestSandboxMode, setIsTestSandboxMode] = useState<boolean>(false);
  const [dataStatus, setDataStatus] = useState<DashboardDataStatus>('NO LIVE ACTIVITY YET');
  const [statusDetails, setStatusDetails] = useState<string>('');
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string>(new Date().toLocaleTimeString());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isPersisting, setIsPersisting] = useState<boolean>(false);

  // Dynamic Funnel Statistics
  const [stats, setStats] = useState<CampaignFunnelStats>(() =>
    publisherDiscovery.getFunnelStats({ includeFixtures: false })
  );

  const refreshDashboardData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      if (isTestSandboxMode) {
        setDataStatus('TEST DATA');
        setStatusDetails('Showing isolated demonstration test fixtures.');
        setStats(publisherDiscovery.getFunnelStats({ includeFixtures: true }));
      } else {
        const syncResult = await publisherDiscovery.fetchLiveStateFromDb();
        setDataStatus(syncResult.status);
        setStatusDetails(syncResult.details || '');
        setStats(publisherDiscovery.getFunnelStats({ includeFixtures: false }));
      }
      setLastRefreshedAt(new Date().toLocaleTimeString());
    } catch {
      setDataStatus('DATA UNAVAILABLE');
      setStatusDetails('Database synchronization failed.');
    } finally {
      setIsRefreshing(false);
    }
  }, [isTestSandboxMode]);

  useEffect(() => {
    refreshDashboardData();
  }, [refreshDashboardData]);

  const opportunities = useMemo(() => {
    return publisherDiscovery.listOpportunities({
      category: selectedCategory,
      priority: selectedPriority,
      stage: selectedStage,
      search: searchQuery
    });
  }, [selectedCategory, selectedPriority, selectedStage, searchQuery]);

  const handleStageChange = async (id: string, stage: PublisherPipelineStage, notes?: string) => {
    setIsPersisting(true);
    try {
      const res = await publisherDiscovery.persistPipelineAction(
        id,
        stage,
        'admin@talentxcel.in',
        notes || `Stage updated via growth dashboard`
      );

      if (res.success && res.opportunity) {
        if (selectedOpportunity && selectedOpportunity.id === id) {
          setSelectedOpportunity({
            ...selectedOpportunity,
            pipelineStage: stage,
            adoptionLevel: res.opportunity.adoptionLevel
          });
        }
        await refreshDashboardData();
        toast.success(`Pipeline stage persisted: ${stage.replace('_', ' ').toUpperCase()}`);
      } else {
        toast.error(`Failed to update stage: ${res.error || 'Unknown error'}`);
      }
    } finally {
      setIsPersisting(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setHasCopiedSnippet(label);
    toast.success(`Copied ${label} to clipboard!`);
    setTimeout(() => setHasCopiedSnippet(null), 2500);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto text-white font-sans">
      <Helmet>
        <title>Global Embed Adoption Engine — Campaign Command Center | TalentXcel</title>
      </Helmet>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <Badge className="bg-blue-600/20 text-blue-400 border-blue-500/30 text-xs font-semibold gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Phase 2 Adoption Engine</span>
            </Badge>

            {/* Explicit Data Status Pill */}
            <Badge
              className={`text-xs font-mono font-bold flex items-center gap-1.5 px-2.5 py-0.5 border ${
                dataStatus === 'LIVE PRODUCTION DATA'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : dataStatus === 'NO LIVE ACTIVITY YET'
                  ? 'bg-sky-500/10 text-sky-300 border-sky-500/30'
                  : dataStatus === 'TEST DATA'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
              }`}
            >
              <Radio className="w-2.5 h-2.5 animate-pulse" />
              <span>STATUS: {dataStatus}</span>
            </Badge>

            <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-500" />
              <span>Updated: {lastRefreshedAt}</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Publisher Acquisition &amp; Embed Campaign Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Systematic discovery, 100-point opportunity scoring, contextual outreach drafting, and verified embed adoption.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Test Sandbox Toggle */}
          <button
            onClick={() => setIsTestSandboxMode(!isTestSandboxMode)}
            className={`text-xs px-3 h-9 rounded-xl font-bold border transition-all flex items-center gap-1.5 ${
              isTestSandboxMode
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border-slate-800'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>{isTestSandboxMode ? 'Sandbox: Fixtures ON' : 'Sandbox: Off (Live Mode)'}</span>
          </button>

          <Button
            onClick={refreshDashboardData}
            disabled={isRefreshing}
            variant="outline"
            className="border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs h-9 rounded-xl flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>

          <Button
            onClick={() => window.open('/embeds', '_blank')}
            variant="outline"
            className="border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs h-9 rounded-xl flex items-center gap-1.5"
          >
            <span>Public Catalog</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Button>

          <Button
            onClick={() => window.open('/admin/embeds', '_blank')}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs h-9 px-3.5 rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/20"
          >
            <span>Telemetry Center</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Test Sandbox Warning Banner */}
      {isTestSandboxMode && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between gap-3 text-xs text-amber-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>TEST SANDBOX PREVIEW ACTIVE:</strong> Showing isolated demonstration fixtures. Real production campaign operations remain unaffected and zero-state.
            </span>
          </div>
          <button
            onClick={() => setIsTestSandboxMode(false)}
            className="text-amber-400 hover:underline font-bold text-[11px] shrink-0"
          >
            Switch to Pure Live Mode
          </button>
        </div>
      )}

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <Card className="bg-slate-900/80 border-slate-800 text-white rounded-2xl">
          <CardContent className="p-3.5 space-y-1">
            <span className="text-slate-400 text-[11px] block truncate">Discovered</span>
            <div className="text-xl sm:text-2xl font-black text-white">{stats.totalDiscovered}</div>
            <p className="text-[10px] text-emerald-400">300 Real Targets</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 border-slate-800 text-white rounded-2xl">
          <CardContent className="p-3.5 space-y-1">
            <span className="text-slate-400 text-[11px] block truncate">Priority A (80-100)</span>
            <div className="text-xl sm:text-2xl font-black text-emerald-400">{stats.priorityA}</div>
            <p className="text-[10px] text-emerald-300">Top Tier Review</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 border-slate-800 text-white rounded-2xl">
          <CardContent className="p-3.5 space-y-1">
            <span className="text-slate-400 text-[11px] block truncate">Contact Ready</span>
            <div className="text-xl sm:text-2xl font-black text-blue-400">{stats.contactReady}</div>
            <p className="text-[10px] text-blue-300">Drafts Staged</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 border-slate-800 text-white rounded-2xl">
          <CardContent className="p-3.5 space-y-1">
            <span className="text-slate-400 text-[11px] block truncate">Embeds Adopted</span>
            <div className="text-xl sm:text-2xl font-black text-purple-400">{stats.embedsAdopted}</div>
            <p className="text-[10px] text-purple-300">
              {stats.embedsAdopted > 0 ? 'Live External Placements' : '0 Placements (Awaiting Launch)'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 border-slate-800 text-white rounded-2xl">
          <CardContent className="p-3.5 space-y-1">
            <span className="text-slate-400 text-[11px] block truncate">Verified Backlinks</span>
            <div className="text-xl sm:text-2xl font-black text-amber-400">{stats.adoptionsVerified}</div>
            <p className="text-[10px] text-amber-300">
              {stats.adoptionsVerified > 0 ? 'DOM Confirmed' : '0 Verified (Awaiting DOM)'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/80 border-slate-800 text-white rounded-2xl">
          <CardContent className="p-3.5 space-y-1">
            <span className="text-slate-400 text-[11px] block truncate">Referral Visits</span>
            <div className="text-xl sm:text-2xl font-black text-rose-400">
              {stats.referralVisits.toLocaleString()}
            </div>
            <p className="text-[10px] text-rose-300">
              {stats.referralVisits > 0 ? 'Inbound Organic Traffic' : '0 Inbound Visits'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Search by college name, publisher, domain (e.g. iitm.ac.in, careers360, dev.to)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 bg-slate-900 border-slate-800 text-white text-xs rounded-xl"
            />
          </div>

          <div className="flex gap-2">
            {/* Priority Filter */}
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value as any)}
              className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 h-10"
            >
              <option value="all">All Priorities</option>
              <option value="A">Priority A (80+ pts)</option>
              <option value="B">Priority B (60-79 pts)</option>
              <option value="C">Priority C (40-59 pts)</option>
            </select>

            {/* Stage Filter */}
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value as any)}
              className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 h-10"
            >
              <option value="all">All Stages</option>
              <option value="contact_ready">Contact Ready</option>
              <option value="contacted">Contacted</option>
              <option value="interested">Interested</option>
              <option value="embed_offered">Embed Offered</option>
              <option value="embed_adopted">Embed Adopted</option>
              <option value="adoption_verified">Adoption Verified</option>
              <option value="declined">Declined</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: 'All Sectors (300)' },
            { id: 'college', label: 'Higher Ed & Placement Cells' },
            { id: 'career', label: 'Career & Education Portals' },
            { id: 'technology', label: 'Tech & Engineering Platforms' },
            { id: 'hr_recruitment', label: 'HR & Recruitment Media' },
            { id: 'community', label: 'Student & Dev Communities' }
          ].map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id as any)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
                selectedCategory === c.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Opportunities Pipeline Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Publisher &amp; Domain</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Score</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Suggested Embed Asset</th>
                <th className="py-3 px-4">Pipeline Stage</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {opportunities.slice(0, 50).map((opp) => (
                <tr key={opp.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-white text-xs">{opp.name}</div>
                    <a
                      href={opp.websiteUrl}
                      target="_blank"
                      rel="noopener"
                      className="text-[11px] text-blue-400 hover:underline inline-flex items-center gap-1 font-mono"
                    >
                      <span>{opp.domain}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </td>

                  <td className="py-3 px-4">
                    <Badge className="bg-slate-800 text-slate-300 text-[10px] uppercase font-mono">
                      {opp.category.replace('_', ' ')}
                    </Badge>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-black text-sm text-emerald-400">
                      {opp.score.totalScore}
                    </span>
                    <span className="text-[10px] text-slate-500"> / 100</span>
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                        opp.priority === 'A'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : opp.priority === 'B'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      Tier {opp.priority}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-200 truncate max-w-[200px]">
                      {opp.suggestedAssetTitle}
                    </div>
                    <span className="text-[10px] text-slate-500 block truncate">
                      {opp.suggestedPlacement}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <Badge className="bg-slate-800 text-slate-300 text-[10px] font-mono capitalize">
                      {opp.pipelineStage.replace('_', ' ')}
                    </Badge>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <Button
                      onClick={() => setSelectedOpportunity(opp)}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs h-7 px-3 rounded-lg flex items-center gap-1 ml-auto"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Review &amp; Draft</span>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-slate-950/60 border-t border-slate-800 text-center text-xs text-slate-400">
          Showing top {Math.min(50, opportunities.length)} of {opportunities.length} filtered publisher opportunities.
        </div>
      </div>

      {/* Publisher Detail & Outreach Draft Drawer/Modal */}
      {selectedOpportunity && (
        <Dialog open={Boolean(selectedOpportunity)} onOpenChange={(open) => !open && setSelectedOpportunity(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-[#0b0f19] border border-slate-800 text-white p-6 rounded-2xl shadow-2xl">
            <DialogHeader className="pb-3 border-b border-slate-800">
              <div className="flex items-center justify-between gap-2 mb-1">
                <Badge className="bg-emerald-600/20 text-emerald-400 border-emerald-500/30 text-xs font-semibold gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Tier {selectedOpportunity.priority} Opportunity ({selectedOpportunity.score.totalScore}/100)</span>
                </Badge>
                <span className="text-xs text-slate-400 font-mono">Stage: {selectedOpportunity.pipelineStage}</span>
              </div>
              <DialogTitle className="text-xl sm:text-2xl font-black text-white">
                {selectedOpportunity.name}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400 flex items-center gap-2">
                <span>{selectedOpportunity.country}</span>
                <span>•</span>
                <span className="font-mono text-blue-400">{selectedOpportunity.domain}</span>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 pt-3">
              {/* 1. Opportunity Rationale & Match */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-slate-300 flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Asset Matching Rationale</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedOpportunity.matchingRationale}
                </p>
                <div className="pt-2 flex flex-wrap gap-2 text-xs">
                  <div className="bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-400">
                    <span className="text-slate-500">Asset: </span>
                    <strong className="text-white">{selectedOpportunity.suggestedAssetTitle}</strong>
                  </div>
                  <div className="bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-400">
                    <span className="text-slate-500">Placement: </span>
                    <strong className="text-white">{selectedOpportunity.suggestedPlacement}</strong>
                  </div>
                </div>
              </div>

              {/* 2. Public Contact Channel Info */}
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Public Contact Channel</span>
                  <span className="font-mono text-white font-bold">
                    {selectedOpportunity.publicContactEmail || 'Public Web Contact Form'}
                  </span>
                </div>
                {selectedOpportunity.contactPageUrl && (
                  <Button
                    onClick={() => window.open(selectedOpportunity.contactPageUrl, '_blank')}
                    variant="outline"
                    size="sm"
                    className="border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs h-8"
                  >
                    <span>Open Contact Page</span>
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>
                )}
              </div>

              {/* 3. Bespoke Outreach Drafts */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-blue-400" />
                    <span>Human-Approved Outreach Drafts</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Strict Anti-Spam Guardrail</span>
                </div>

                <Tabs defaultValue="email" className="w-full">
                  <TabsList className="bg-slate-900 border border-slate-800 grid grid-cols-4 h-9">
                    <TabsTrigger value="email" className="text-xs data-[state=active]:bg-blue-600">Email Draft</TabsTrigger>
                    <TabsTrigger value="form" className="text-xs data-[state=active]:bg-blue-600">Contact Form</TabsTrigger>
                    <TabsTrigger value="social" className="text-xs data-[state=active]:bg-blue-600">Social Pitch</TabsTrigger>
                    <TabsTrigger value="followup" className="text-xs data-[state=active]:bg-blue-600">Follow-up 1</TabsTrigger>
                  </TabsList>

                  {/* Email Draft Tab */}
                  <TabsContent value="email" className="space-y-2 mt-2">
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                      <div className="text-slate-500 pb-2 border-b border-slate-900 mb-2">
                        <strong>Subject:</strong> {selectedOpportunity.outreachDrafts.emailSubject}
                      </div>
                      {selectedOpportunity.outreachDrafts.emailBody}
                    </div>
                    <Button
                      onClick={() =>
                        copyToClipboard(
                          `Subject: ${selectedOpportunity.outreachDrafts.emailSubject}\n\n${selectedOpportunity.outreachDrafts.emailBody}`,
                          'Email Draft'
                        )
                      }
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs h-9 rounded-xl flex items-center justify-center gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{hasCopiedSnippet === 'Email Draft' ? 'Copied to Clipboard!' : 'Copy Email & Subject'}</span>
                    </Button>
                  </TabsContent>

                  {/* Contact Form Tab */}
                  <TabsContent value="form" className="space-y-2 mt-2">
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-sans text-xs text-slate-300 leading-relaxed">
                      {selectedOpportunity.outreachDrafts.contactFormMessage}
                    </div>
                    <Button
                      onClick={() => copyToClipboard(selectedOpportunity.outreachDrafts.contactFormMessage, 'Contact Form Pitch')}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs h-9 rounded-xl flex items-center justify-center gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{hasCopiedSnippet === 'Contact Form Pitch' ? 'Copied Form Message!' : 'Copy Form Message'}</span>
                    </Button>
                  </TabsContent>

                  {/* Social Pitch Tab */}
                  <TabsContent value="social" className="space-y-2 mt-2">
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-sans text-xs text-slate-300 leading-relaxed">
                      {selectedOpportunity.outreachDrafts.socialPitch}
                    </div>
                    <Button
                      onClick={() => copyToClipboard(selectedOpportunity.outreachDrafts.socialPitch, 'Social Pitch')}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs h-9 rounded-xl flex items-center justify-center gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{hasCopiedSnippet === 'Social Pitch' ? 'Copied Social Pitch!' : 'Copy Social Pitch'}</span>
                    </Button>
                  </TabsContent>

                  {/* Follow-up Tab */}
                  <TabsContent value="followup" className="space-y-2 mt-2">
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-sans text-xs text-slate-300 leading-relaxed">
                      {selectedOpportunity.outreachDrafts.followUp1}
                    </div>
                    <Button
                      onClick={() => copyToClipboard(selectedOpportunity.outreachDrafts.followUp1, 'Follow-up Draft')}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs h-9 rounded-xl flex items-center justify-center gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{hasCopiedSnippet === 'Follow-up Draft' ? 'Copied Follow-up!' : 'Copy Follow-up 1'}</span>
                    </Button>
                  </TabsContent>
                </Tabs>
              </div>

              {/* 4. Action Stage Transition Controls with Database Persistence */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-300 block">Outreach Workflow Action</span>
                  <span className="text-[10px] text-slate-500">Persists state to Supabase publisher_outreach_log</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <Button
                    onClick={() => handleStageChange(selectedOpportunity.id, 'contacted')}
                    disabled={isPersisting}
                    size="sm"
                    className="bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/30 text-xs h-8"
                  >
                    Mark Contacted
                  </Button>
                  <Button
                    onClick={() => handleStageChange(selectedOpportunity.id, 'interested')}
                    disabled={isPersisting}
                    size="sm"
                    className="bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 border border-purple-500/30 text-xs h-8"
                  >
                    Mark Interested
                  </Button>
                  <Button
                    onClick={() => handleStageChange(selectedOpportunity.id, 'adoption_verified')}
                    disabled={isPersisting}
                    size="sm"
                    className="bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30 text-xs h-8"
                  >
                    Verify Adoption
                  </Button>
                  <Button
                    onClick={() => handleStageChange(selectedOpportunity.id, 'declined')}
                    disabled={isPersisting}
                    size="sm"
                    className="bg-rose-600/20 text-rose-400 hover:bg-rose-600/30 border border-rose-500/30 text-xs h-8"
                  >
                    Opt-out / Declined
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default EmbedGrowthCampaignDashboard;
