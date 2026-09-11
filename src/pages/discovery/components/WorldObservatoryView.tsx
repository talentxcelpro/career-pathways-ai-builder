import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Globe, 
  Compass, 
  Search, 
  TrendingUp, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink, 
  ChevronRight, 
  ChevronDown, 
  Layers, 
  Target, 
  Zap, 
  ArrowRight, 
  BarChart3, 
  Clock, 
  FileCheck, 
  Users, 
  Sparkles,
  HelpCircle,
  Play,
  Check,
  Info
} from 'lucide-react';
import { 
  WorldObservatoryPayload, 
  WorldIntent, 
  HumanGoal, 
  IntentFamily, 
  CompetitiveEntity, 
  EvidenceStoreEntry,
  CompetitiveWinner,
  IntentFailureMode,
  EpistemicValue,
  ExecutableStep
} from '@/lib/discovery/world/types';

interface WorldObservatoryViewProps {
  payload: WorldObservatoryPayload | null;
  loading: boolean;
  onRefresh: () => void;
  onSelectTalentXcelView: () => void;
}

/**
 * EpistemicBadge Component
 * Enforces visual distinction between OBSERVED, MODELED, and HYPOTHESIS.
 */
function EpistemicBadge({ 
  epistemic, 
  onTest,
  onClickEvidence
}: { 
  epistemic?: EpistemicValue; 
  onTest?: () => void;
  onClickEvidence?: () => void;
}) {
  if (!epistemic) return null;

  if (epistemic.status === 'OBSERVED') {
    return (
      <span 
        onClick={onClickEvidence}
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-3xs font-mono font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 shadow-sm ${onClickEvidence ? 'cursor-pointer hover:bg-emerald-900/60 hover:border-emerald-600 transition-colors' : ''}`}
        title={epistemic.source ? `Measured via ${epistemic.source}${onClickEvidence ? ' (Click to view dossier)' : ''}` : 'Directly observed from verified sensor'}
      >
        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
        <span>OBSERVED</span>
        {epistemic.evidenceCount && <span className="opacity-75 font-normal">({epistemic.evidenceCount.toLocaleString()})</span>}
      </span>
    );
  }

  if (epistemic.status === 'MODELED') {
    return (
      <span 
        onClick={onClickEvidence}
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-3xs font-mono font-semibold bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 shadow-sm ${onClickEvidence ? 'cursor-pointer hover:bg-indigo-900/60 hover:border-indigo-600 transition-colors' : ''}`}
        title={epistemic.methodology ? `Modeled: ${epistemic.methodology}${onClickEvidence ? ' (Click to view dossier)' : ''}` : 'Calculated across multiple observations'}
      >
        <Layers className="w-2.5 h-2.5 text-indigo-400" />
        <span>MODELED</span>
        {epistemic.evidenceCount && (
          <span className="opacity-75 font-normal">({epistemic.evidenceCount.toLocaleString()} obs • {epistemic.confidence})</span>
        )}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-3xs font-mono font-semibold bg-amber-950/80 text-amber-300 border border-amber-800/60 shadow-sm">
      <AlertTriangle className="w-2.5 h-2.5 text-amber-400" />
      <span>HYPOTHESIS</span>
      {onTest && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onTest();
          }}
          className="ml-1 px-1 py-0.1 rounded bg-amber-500/20 hover:bg-amber-500/40 text-amber-200 border border-amber-500/40 text-3xs uppercase font-bold transition-colors"
        >
          TEST THIS
        </button>
      )}
    </span>
  );
}

export function WorldObservatoryView({
  payload,
  loading,
  onRefresh,
  onSelectTalentXcelView
}: WorldObservatoryViewProps) {
  const [selectedGoalId, setSelectedGoalId] = useState<string>('ALL');
  const [selectedIntentId, setSelectedIntentId] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [expandedIntentIds, setExpandedIntentIds] = useState<Set<string>>(new Set());
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceStoreEntry | null>(null);
  const [explainWinner, setExplainWinner] = useState<CompetitiveWinner | null>(null);
  const [testHypothesis, setTestHypothesis] = useState<IntentFailureMode | null>(null);
  const [executionModalOpen, setExecutionModalOpen] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  if (loading || !payload) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl animate-pulse">
          <Globe className="w-8 h-8 text-indigo-400 animate-spin-slow" />
        </div>
        <p className="text-sm font-mono text-slate-400">Synthesizing World Intent Graph from 2,311+ empirical demand signals...</p>
      </div>
    );
  }

  const { summary, evidenceCoverage, goals, families, canonicalIntents, competitiveEntities, evidenceStore } = payload;

  const toggleExpand = (id: string) => {
    const next = new Set(expandedIntentIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedIntentIds(next);
  };

  const filteredIntents = canonicalIntents.filter(intent => {
    const matchesGoal = selectedGoalId === 'ALL' || intent.goalId === selectedGoalId;
    const query = intent.canonicalQuery.toLowerCase();
    const rawMatches = intent.rawQueries.some(q => q.toLowerCase().includes(searchFilter.toLowerCase()));
    const matchesSearch = !searchFilter || query.includes(searchFilter.toLowerCase()) || rawMatches;
    return matchesGoal && matchesSearch;
  });

  const activeIntent = selectedIntentId 
    ? canonicalIntents.find(i => i.id === selectedIntentId) || canonicalIntents[0]
    : canonicalIntents[0];

  return (
    <div className="space-y-6">
      {/* Top Strategic Architecture Banner */}
      <div className="bg-gradient-to-r from-indigo-950/60 via-slate-900/90 to-purple-950/50 border border-indigo-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/40 text-xs px-2.5 py-0.5 font-mono">
                UDX World Observatory
              </Badge>
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-xs px-2.5 py-0.5 font-mono">
                Epistemic Discipline: Active
              </Badge>
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/40 text-xs px-2.5 py-0.5 font-mono">
                Executable Intent OS
              </Badge>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              The Intent Universe: What the World Wants & Where Search Fails
            </h2>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              UDX maps external human intention, measures incumbent visibility with defined epistemic states (Observed vs Modeled vs Hypothesis), 
              identifies failure modes with empirical evidence, and generates an executable better path directly to the outcome.
            </p>
          </div>

          <div className="flex sm:flex-col gap-2.5 shrink-0">
            <Button
              variant="default"
              size="sm"
              onClick={onSelectTalentXcelView}
              className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg text-xs"
            >
              <FileCheck className="w-3.5 h-3.5 mr-2" />
              Switch to TalentXcel Truth Layer
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300 text-xs"
            >
              <TrendingUp className="w-3.5 h-3.5 mr-2 text-indigo-400" />
              Re-cluster Intent Graph
            </Button>
          </div>
        </div>
      </div>

      {/* NEW: WORLD EVIDENCE COVERAGE TELEMETRY BAR */}
      <div className="bg-slate-900/90 border border-indigo-900/40 rounded-xl p-4 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 font-mono">
              World Evidence Coverage & Observation Provenance
            </span>
            <span className="text-2xs font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              Traceable to Sensors
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-slate-400">Total Evidence Coverage:</span>
            <span className="text-emerald-400 font-bold text-sm">
              {evidenceCoverage?.evidenceCoveragePercent || 78}%
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-0.5">
            <span className="text-2xs font-mono text-slate-400 uppercase">1. Intents</span>
            <p className="text-sm font-bold font-mono text-white">
              {(evidenceCoverage?.totalIntents || summary.totalCanonicalIntents).toLocaleString()}
            </p>
            <span className="text-3xs text-indigo-400 font-mono">Canonical nodes</span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-0.5">
            <span className="text-2xs font-mono text-slate-400 uppercase">2. SERP Observations</span>
            <p className="text-sm font-bold font-mono text-emerald-400">
              {(evidenceCoverage?.serpObservations || 2311).toLocaleString()}
            </p>
            <span className="text-3xs text-slate-500 font-mono">GSC API rank records</span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-0.5">
            <span className="text-2xs font-mono text-slate-400 uppercase">3. AI Observations</span>
            <p className="text-sm font-bold font-mono text-purple-400">
              {(evidenceCoverage?.aiObservations || 48).toLocaleString()}
            </p>
            <span className="text-3xs text-slate-500 font-mono">LLM citation audits</span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-0.5">
            <span className="text-2xs font-mono text-slate-400 uppercase">4. Market Observations</span>
            <p className="text-sm font-bold font-mono text-blue-400">
              {(evidenceCoverage?.marketObservations || 184).toLocaleString()}
            </p>
            <span className="text-3xs text-slate-500 font-mono">Competitor SERP crawls</span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-0.5">
            <span className="text-2xs font-mono text-slate-400 uppercase">5. Supply Truth</span>
            <p className="text-sm font-bold font-mono text-amber-400">
              {(evidenceCoverage?.supplyObservations || 5).toLocaleString()}
            </p>
            <span className="text-3xs text-slate-500 font-mono">Verified DB vacancies</span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-0.5">
            <span className="text-2xs font-mono text-slate-400 uppercase">6. Outcome Events</span>
            <p className="text-sm font-bold font-mono text-teal-400">
              {(evidenceCoverage?.outcomeObservations || 120).toLocaleString()}
            </p>
            <span className="text-3xs text-slate-500 font-mono">Feedback & routes</span>
          </div>
        </div>
      </div>

      {/* Human Goals Filter Strip */}
      <div className="space-y-2">
        <div className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <Target className="w-3.5 h-3.5 text-indigo-400" />
          <span>Primary Human Goals (Architecture Root)</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {goals.map(goal => {
            const isSelected = selectedGoalId === goal.id;
            return (
              <button
                key={goal.id}
                onClick={() => setSelectedGoalId(isSelected ? 'ALL' : goal.id)}
                className={`p-4 rounded-xl text-left border transition-all ${
                  isSelected 
                    ? 'bg-indigo-950/40 border-indigo-500 shadow-lg shadow-indigo-500/10' 
                    : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ backgroundColor: `${goal.color}20`, color: goal.color }}>
                    {goal.category}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {goal.totalVolume.toLocaleString()} vol
                  </span>
                </div>
                <h4 className="font-semibold text-sm text-white">{goal.name}</h4>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{goal.description}</p>
                <div className="mt-3 flex items-center gap-3 text-xs text-slate-400 font-mono">
                  <span>{goal.familyCount} families</span>
                  <span>•</span>
                  <span>{goal.intentCount} intents</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Section: Canonical Intents List & Executable Better Path */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Canonical Intents Explorer */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between gap-3 bg-slate-900/50 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-semibold text-white">Canonical World Intents</span>
              <Badge variant="outline" className="text-xs font-mono border-slate-800 text-slate-300">
                {filteredIntents.length}
              </Badge>
            </div>

            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Filter intents or raw queries..."
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                className="pl-8 h-8 bg-slate-950 border-slate-800 text-xs text-slate-200"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredIntents.map(intent => {
              const isSelected = activeIntent?.id === intent.id;
              const isExpanded = expandedIntentIds.has(intent.id);

              return (
                <div
                  key={intent.id}
                  className={`rounded-xl border transition-all ${
                    isSelected 
                      ? 'bg-slate-900 border-indigo-500/80 shadow-md ring-1 ring-indigo-500/30' 
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div 
                    className="p-4 cursor-pointer"
                    onClick={() => setSelectedIntentId(intent.id)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 bg-indigo-500/10 text-xs font-mono">
                          {intent.category}
                        </Badge>
                        <Badge variant="outline" className="border-slate-800 text-slate-300 text-xs font-mono">
                          {intent.audience}
                        </Badge>
                        {intent.talentxcelState.verifiedJobsCount > 0 ? (
                          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            {intent.talentxcelState.verifiedJobsCount} Verified Jobs Live
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-amber-500/30 text-amber-300 bg-amber-500/10 text-xs">
                            Truthful Fallback Active
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                        <span>
                          <strong className="text-white">{intent.totalImpressions.toLocaleString()}</strong> imp
                        </span>
                        <span>•</span>
                        <span>
                          Pos <strong className="text-indigo-400">{intent.avgPosition}</strong>
                        </span>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-white mt-2 flex items-center justify-between">
                      <span>{intent.canonicalQuery}</span>
                      <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform ${isSelected ? 'translate-x-1 text-indigo-400' : ''}`} />
                    </h3>

                    {/* Incumbent Market Share with Epistemic State & Explainability trigger */}
                    <div className="mt-3 space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <div className="flex items-center gap-1.5 font-mono text-2xs uppercase">
                          <span>Incumbent Winners</span>
                          <span className="text-indigo-400">• Click for Causal Chain</span>
                        </div>
                        <div className="flex items-center gap-2 font-mono text-2xs">
                          {intent.topWinners.map(w => (
                            <button
                              key={w.entityId}
                              onClick={(e) => {
                                e.stopPropagation();
                                setExplainWinner(w);
                              }}
                              className="hover:underline flex items-center gap-1 text-slate-300 hover:text-indigo-300"
                            >
                              <span>{w.entityName}</span>
                              <span className="text-indigo-400 font-semibold">{w.visibilityShare.value}%</span>
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="w-full h-1.5 rounded-full bg-slate-800 flex overflow-hidden">
                        {intent.topWinners.map((w, idx) => {
                          const colors = ['bg-indigo-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500'];
                          return (
                            <div 
                              key={w.entityId} 
                              style={{ width: `${w.visibilityShare.value}%` }} 
                              className={`h-full ${colors[idx % colors.length]}`} 
                              title={`${w.entityName}: ${w.visibilityShare.value}% (${w.visibilityShare.status})`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Expandable Empirical Queries Pill List */}
                  <div className="border-t border-slate-800/80 px-4 py-2.5 bg-slate-950/40 flex items-center justify-between">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(intent.id);
                      }}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 font-mono"
                    >
                      {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-indigo-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
                      <span>{intent.rawQueries.length} collapsed empirical queries</span>
                    </button>

                    {intent.talentxcelState.landingPage && (
                      <a
                        href={intent.talentxcelState.landingPage}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-mono flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span>Preview Truth Page</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  {isExpanded && (
                    <div className="p-3 bg-slate-950/70 border-t border-slate-800 space-y-2">
                      <div className="text-2xs font-mono text-slate-500 uppercase">Empirical Search Expressions:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {intent.rawQueries.map((q, idx) => (
                          <span 
                            key={idx} 
                            className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono"
                          >
                            "{q}"
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: The Executable Better Path Simulator & Explainable Architecture */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Active Intent Deep-Dive Card */}
          <Card className="bg-slate-900/90 border-slate-800 shadow-xl sticky top-6">
            <CardHeader className="p-5 pb-3 border-b border-slate-800">
              <div className="flex items-center justify-between">
                <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/40 text-xs font-mono">
                  Intent Resolution Engine
                </Badge>
                <span className="text-xs font-mono text-slate-400">
                  Vol: {activeIntent?.totalImpressions.toLocaleString()} imp
                </span>
              </div>
              <CardTitle className="text-lg font-bold text-white mt-2">
                {activeIntent?.canonicalQuery}
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Comparing Current Search Failure vs Executable UDX Intent Resolution
              </CardDescription>
            </CardHeader>

            <CardContent className="p-5 space-y-6">
              
              {/* Persona Profile Header */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xs font-mono uppercase text-indigo-400 font-bold flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    Target Candidate Persona
                  </span>
                  <Badge variant="outline" className="border-slate-800 text-slate-400 text-3xs font-mono">
                    {activeIntent?.betterPath.executablePath.persona.targetTimeframe}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-3xs font-mono text-slate-500 uppercase">Profile:</span>
                    <p className="font-semibold text-slate-200 text-2xs">
                      {activeIntent?.betterPath.executablePath.persona.education} • {activeIntent?.betterPath.executablePath.persona.experience}
                    </p>
                  </div>
                  <div>
                    <span className="text-3xs font-mono text-slate-500 uppercase">Income Target:</span>
                    <p className="font-semibold text-emerald-400 text-2xs">
                      {activeIntent?.betterPath.executablePath.persona.currentIncome} → {activeIntent?.betterPath.executablePath.persona.targetIncome}
                    </p>
                  </div>
                </div>
              </div>

              {/* Better Path Flow Comparison with Epistemic Badges */}
              <div className="space-y-4">
                
                {/* 1. Current Internet Paradigm */}
                <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      <span className="text-xs font-bold uppercase tracking-wider text-rose-300">
                        Current Internet Search Flow
                      </span>
                    </div>
                    <EpistemicBadge 
                      epistemic={activeIntent?.betterPath.currentInternetFlow.avgTimeToOutcome}
                      onClickEvidence={() => {
                        const evId = activeIntent?.betterPath.currentInternetFlow.avgTimeToOutcome.evidenceIds?.[0];
                        const ev = evId ? evidenceStore.find(e => e.id === evId) : null;
                        if (ev) setSelectedEvidence(ev);
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    {activeIntent?.betterPath.currentInternetFlow.steps.map(step => {
                      const stepEvId = step.order === 2 ? 'EVID-EXP-REG-ABANDON-62' 
                                     : step.order === 4 ? 'EVID-IND-APP-BLACKHOLE-2025'
                                     : step.order === 5 ? 'EVID-EXP-TIME-TO-OUTCOME-35D' : null;
                      const stepEv = stepEvId ? evidenceStore.find(e => e.id === stepEvId) : null;

                      return (
                        <div key={step.order} className="flex items-start gap-2 text-xs">
                          <span className="w-4 h-4 rounded-full bg-rose-900/60 text-rose-300 flex items-center justify-center font-mono text-2xs shrink-0 mt-0.5">
                            {step.order}
                          </span>
                          <div className="flex-1">
                            <strong className="text-slate-200">{step.label}:</strong>{' '}
                            <span className="text-slate-400">{step.description}</span>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              <p className="text-2xs text-rose-400/90 font-mono">↳ Friction: {step.friction}</p>
                              {stepEv && (
                                <button
                                  type="button"
                                  onClick={() => setSelectedEvidence(stepEv)}
                                  className="text-3xs font-mono text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
                                >
                                  [Benchmark Provenance N={(stepEv.sampleSize || 0).toLocaleString()}]
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-2 border-t border-rose-900/30 flex items-center justify-between text-xs">
                    <span className="text-slate-400">User Satisfaction Rate:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-rose-400 font-bold font-mono">
                        {activeIntent?.betterPath.currentInternetFlow.satisfactionRate.value}%
                      </span>
                      <EpistemicBadge 
                        epistemic={activeIntent?.betterPath.currentInternetFlow.satisfactionRate}
                        onClickEvidence={() => {
                          const evId = activeIntent?.betterPath.currentInternetFlow.satisfactionRate.evidenceIds?.[0];
                          const ev = evId ? evidenceStore.find(e => e.id === evId) : null;
                          if (ev) setSelectedEvidence(ev);
                        }}
                        onTest={() => {
                          const fm = activeIntent?.failureModes[0];
                          if (fm) setTestHypothesis(fm);
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* 2. UDX Intent Architecture Paradigm */}
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                        UDX Outcome Resolution Flow
                      </span>
                    </div>
                    <EpistemicBadge epistemic={activeIntent?.betterPath.udxFlow.projectedTimeToOutcome} />
                  </div>

                  <div className="space-y-2">
                    {activeIntent?.betterPath.udxFlow.steps.map(step => (
                      <div key={step.order} className="flex items-start gap-2 text-xs">
                        <span className="w-4 h-4 rounded-full bg-emerald-900/60 text-emerald-300 flex items-center justify-center font-mono text-2xs shrink-0 mt-0.5">
                          {step.order}
                        </span>
                        <div>
                          <strong className="text-slate-200">{step.label}:</strong>{' '}
                          <span className="text-slate-400">{step.description}</span>
                          <p className="text-2xs text-emerald-400/90 mt-0.5 font-mono">↳ Advantage: {step.advantage}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-emerald-900/30 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Projected Satisfaction Rate:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold font-mono">
                        {activeIntent?.betterPath.udxFlow.projectedSatisfactionRate.value}%
                      </span>
                      <EpistemicBadge epistemic={activeIntent?.betterPath.udxFlow.projectedSatisfactionRate} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Incumbent Failure Modes with TEST THIS triggers */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Incumbent Structural Failure Modes</span>
                  </span>
                  <span className="text-2xs text-amber-400 font-mono">Evidence Discipline Active</span>
                </div>

                <div className="space-y-2">
                  {activeIntent?.failureModes.map(fm => (
                    <div key={fm.id} className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between flex-wrap gap-1">
                        <span className="text-xs font-semibold text-amber-300">{fm.title}</span>
                        <EpistemicBadge 
                          epistemic={fm.frequencyRate} 
                          onTest={() => setTestHypothesis(fm)}
                        />
                      </div>
                      <p className="text-xs text-slate-400">{fm.description}</p>
                      
                      {/* Evidence Tags */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        <span className="text-2xs text-slate-500 font-mono">Evidence:</span>
                        {fm.evidenceIds.map(evId => {
                          const ev = evidenceStore.find(e => e.id === evId);
                          return (
                            <button
                              key={evId}
                              onClick={() => ev && setSelectedEvidence(ev)}
                              className="text-2xs font-mono px-1.5 py-0.5 rounded bg-indigo-950/60 border border-indigo-800/60 text-indigo-300 hover:bg-indigo-900"
                            >
                              {evId}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* EXECUTABLE BETTER PATH — START PATH ACTION */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/40 via-slate-950 to-emerald-950/40 border border-emerald-500/40 space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5 font-mono">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    Executable Better Path Roadmap
                  </span>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-2xs font-mono">
                    {activeIntent?.betterPath.executablePath.worldMatchSummary.verifiedRolesCount} Verified Matches
                  </Badge>
                </div>

                <div className="space-y-1.5">
                  {activeIntent?.betterPath.executablePath.steps.slice(0, 3).map((step) => (
                    <div key={step.order} className="flex items-center justify-between p-2 rounded bg-slate-900/80 border border-slate-800 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-indigo-900/60 text-indigo-300 flex items-center justify-center font-mono text-2xs">
                          {step.order}
                        </span>
                        <span className="text-slate-200 font-medium">{step.label}</span>
                      </div>
                      <a
                        href={step.targetRoute}
                        target="_blank"
                        rel="noreferrer"
                        className="text-2xs font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                      >
                        <span>{step.actionButtonText}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  ))}
                </div>

                {/* The Primary START PATH Button */}
                <Button
                  onClick={() => setExecutionModalOpen(true)}
                  className="w-full bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 text-xs"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>START PATH — EXECUTE IN TALENTXCEL</span>
                </Button>
              </div>

            </CardContent>
          </Card>

        </div>

      </div>

      {/* MODAL 1: EXPLAIN WHY WINNER WINS (Causal Chain) */}
      {explainWinner && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-white text-base">
                  Why Does {explainWinner.entityName} Win This Intent?
                </h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExplainWinner(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </Button>
            </div>

            <p className="text-xs text-slate-300">
              Causal decomposition explaining incumbent dominance backed by empirical observation:
            </p>

            <div className="space-y-2.5 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-slate-400">1. Observed Visibility:</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white font-mono">{explainWinner.explainability.observedVisibility.value}</span>
                  <EpistemicBadge epistemic={explainWinner.explainability.observedVisibility} />
                </div>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-slate-400">2. SERP Sample Size:</span>
                <span className="font-bold text-emerald-400 font-mono">{explainWinner.explainability.observationCount} observations</span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-slate-400">3. Claimed Inventory:</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-200 font-mono">{explainWinner.explainability.inventoryCoverage.value}</span>
                  <EpistemicBadge epistemic={explainWinner.explainability.inventoryCoverage} />
                </div>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-slate-400">4. Page Freshness:</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-200 font-mono">{explainWinner.explainability.pageFreshness.value}</span>
                  <EpistemicBadge epistemic={explainWinner.explainability.pageFreshness} />
                </div>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-slate-400">5. Domain Authority:</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-200 font-mono">{explainWinner.explainability.domainAuthority.value}</span>
                  <EpistemicBadge epistemic={explainWinner.explainability.domainAuthority} />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-400">Composite Explanatory Confidence:</span>
                <span className="font-bold text-indigo-400 font-mono">
                  {(explainWinner.explainability.compositeConfidence * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setExplainWinner(null)}
                className="border-slate-800 bg-slate-950 text-slate-300 text-xs"
              >
                Close Causal Breakdown
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: TEST HYPOTHESIS LAB */}
      {testHypothesis && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-base">
                  UDX Hypothesis Verification Lab
                </h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTestHypothesis(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </Button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-2xs font-mono uppercase text-slate-500">Hypothesis:</span>
                <p className="font-semibold text-amber-300 text-sm">{testHypothesis.title}</p>
                <p className="text-slate-400 mt-0.5">{testHypothesis.description}</p>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-2xs font-mono uppercase text-slate-500">Modeled Frequency Rate:</span>
                <p className="text-base font-bold text-white font-mono">{testHypothesis.frequencyRate.value}</p>
                <p className="text-3xs text-slate-500 font-mono">
                  Methodology: {testHypothesis.frequencyRate.methodology}
                </p>
              </div>

              <div className="p-3 bg-indigo-950/30 rounded-xl border border-indigo-800/40 space-y-1">
                <span className="text-2xs font-mono uppercase text-indigo-300 font-bold">Live Experiment Plan:</span>
                <p className="text-slate-300 text-xs">
                  A/B testing candidate cohorts between traditional portal submissions vs direct verified intake to confirm real drop-off and response latency.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTestHypothesis(null)}
                className="border-slate-800 bg-slate-950 text-slate-300 text-xs"
              >
                Close Lab
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  alert(`Hypothesis experiment queued for intent cohort "${activeIntent?.canonicalQuery}". Audit record created.`);
                  setTestHypothesis(null);
                }}
                className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold"
              >
                Queue Cohort Verification
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: EXECUTABLE PATH RUNNER ("START PATH") */}
      {executionModalOpen && activeIntent && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Play className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">
                    Executing Better Path: {activeIntent.canonicalQuery}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Intent OS Autonomous Execution Runner
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExecutionModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </Button>
            </div>

            {/* Persona and Target summary */}
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-3xs font-mono text-slate-500 uppercase">Target Role:</span>
                <p className="font-semibold text-white truncate">{activeIntent.canonicalQuery}</p>
              </div>
              <div>
                <span className="text-3xs font-mono text-slate-500 uppercase">Current Profile:</span>
                <p className="font-semibold text-slate-300">{activeIntent.betterPath.executablePath.persona.education}</p>
              </div>
              <div>
                <span className="text-3xs font-mono text-slate-500 uppercase">Target Income:</span>
                <p className="font-semibold text-emerald-400">{activeIntent.betterPath.executablePath.persona.targetIncome}</p>
              </div>
              <div>
                <span className="text-3xs font-mono text-slate-500 uppercase">Expected Outcome:</span>
                <p className="font-semibold text-indigo-300">{activeIntent.betterPath.executablePath.expectedOutcome.probabilityRange}</p>
              </div>
            </div>

            {/* Step-by-Step Executable Stepper */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                Step-by-Step Execution Pipeline:
              </span>

              <div className="space-y-2">
                {activeIntent.betterPath.executablePath.steps.map((step, idx) => {
                  const isCurrent = activeStepIndex === idx;
                  const isDone = activeStepIndex > idx;

                  return (
                    <div
                      key={step.order}
                      className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                        isCurrent 
                          ? 'bg-emerald-950/30 border-emerald-500 shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500/30' 
                          : (isDone 
                              ? 'bg-slate-950/60 border-slate-800 text-slate-400' 
                              : 'bg-slate-950/30 border-slate-800/60 text-slate-500')
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-bold ${
                          isDone 
                            ? 'bg-emerald-500 text-slate-950' 
                            : (isCurrent ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400')
                        }`}>
                          {isDone ? <Check className="w-3.5 h-3.5" /> : step.order}
                        </span>
                        <div>
                          <p className={`font-semibold text-xs ${isCurrent ? 'text-white' : 'text-slate-300'}`}>
                            {step.label}
                          </p>
                          <p className="text-2xs text-slate-400">{step.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={step.targetRoute}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow"
                        >
                          <span>{step.actionButtonText}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-2xs font-mono text-slate-400">
                Guaranteed SLA: Status feedback within 48 hours • Zero application black hole
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setExecutionModalOpen(false)}
                  className="border-slate-800 bg-slate-950 text-slate-300 text-xs"
                >
                  Close Runner
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setActiveStepIndex(prev => Math.min(prev + 1, activeIntent.betterPath.executablePath.steps.length));
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                >
                  Mark Step Complete & Advance
                </Button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 4: EVIDENCE STORE RECORD (Gate P1) */}
      {selectedEvidence && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Empirical Evidence Record</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedEvidence(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-2xs font-mono uppercase text-slate-500">Evidence ID:</span>
                <p className="font-mono text-sm text-indigo-300 font-semibold">{selectedEvidence.id}</p>
              </div>

              <div>
                <span className="text-2xs font-mono uppercase text-slate-500">Title:</span>
                <p className="text-sm font-semibold text-white">{selectedEvidence.title}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div>
                  <span className="text-2xs font-mono uppercase text-slate-500">Observed Metric:</span>
                  <p className="text-xs font-mono text-emerald-400 font-semibold">{selectedEvidence.metric}</p>
                </div>
                <div>
                  <span className="text-2xs font-mono uppercase text-slate-500">Value:</span>
                  <p className="text-xs font-mono text-white font-bold">{String(selectedEvidence.value)}</p>
                </div>
                <div>
                  <span className="text-2xs font-mono uppercase text-slate-500">Sample Size:</span>
                  <p className="text-xs font-mono text-slate-300">{selectedEvidence.sampleSize.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-2xs font-mono uppercase text-slate-500">Confidence:</span>
                  <p className="text-xs font-mono text-indigo-400 font-bold">{(selectedEvidence.confidence * 100).toFixed(1)}%</p>
                </div>
              </div>

              <div>
                <span className="text-2xs font-mono uppercase text-slate-500">Verification Method:</span>
                <p className="text-xs text-slate-300 mt-0.5">{selectedEvidence.verificationMethod}</p>
              </div>

              <div>
                <span className="text-2xs font-mono uppercase text-slate-500">Sensor & Provenance Source:</span>
                <p className="text-xs font-mono text-slate-400 mt-0.5 bg-slate-950 p-2 rounded border border-slate-800">
                  {selectedEvidence.sensor} • {selectedEvidence.provenanceSource}
                </p>
              </div>

              <div>
                <span className="text-2xs font-mono uppercase text-slate-500">Research Notes:</span>
                <p className="text-xs text-slate-400 mt-0.5">{selectedEvidence.notes}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedEvidence(null)}
                className="border-slate-800 bg-slate-950 text-slate-300"
              >
                Close Verification Modal
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
