import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  GitFork, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  AlertTriangle, 
  TrendingUp, 
  Compass, 
  ExternalLink,
  ChevronRight,
  BarChart3
} from 'lucide-react';
import { CareerPossibilities } from '@/lib/udx/domains/career/CareerPossibilities';
import { PossibilityPath, BestPathResolution } from '@/lib/udx/possibility/types';
import { BestPathResolver } from '@/lib/udx/possibility/BestPathResolver';

interface PossibilityGraphViewProps {
  initialLocation?: string;
}

export const PossibilityGraphView: React.FC<PossibilityGraphViewProps> = ({ initialLocation = 'Varanasi' }) => {
  const [activeIntentKey, setActiveIntentKey] = useState<'VARANASI_FRONTEND' | 'REMOTE_AI' | 'FRESHER_ANALYST'>('VARANASI_FRONTEND');
  const [selectedPathId, setSelectedPathId] = useState<string>('path-direct-verified-local');

  const intentProfiles = {
    VARANASI_FRONTEND: {
      id: 'intent-vns-fe-101',
      title: 'Frontend Developer in Varanasi (GSC Anchor: 1,036 Impressions)',
      location: 'Varanasi',
      description: 'Human intent seeking verified engineering roles in Varanasi ecosystem without aggregator spam or ghosting.',
      domain: 'CAREER',
    },
    REMOTE_AI: {
      id: 'intent-remote-ai-102',
      title: 'AI Agent Developer Remote Arbitrage',
      location: 'Remote',
      description: 'Living in Tier-2/Tier-3 ecosystem while capturing Tier-1 Bangalore/Silicon Valley compensation.',
      domain: 'CAREER',
    },
    FRESHER_ANALYST: {
      id: 'intent-fresher-da-103',
      title: 'Data Analyst Fresher (Zero Experience Bypass)',
      location: 'NCR / Lucknow',
      description: 'Bypassing generic 2+ year requirement filters through verified portfolio and skills intake.',
      domain: 'CAREER',
    }
  };

  const currentIntent = intentProfiles[activeIntentKey];
  const paths: PossibilityPath[] = CareerPossibilities.generateCareerPaths(currentIntent.id, currentIntent.location);

  // Compute best path resolution using the UDX Multi-Factor Reasoning Function
  const resolution: BestPathResolution = BestPathResolver.resolveBestPath(paths, {
    maxDurationDays: 14,
    minSuccessProbability: 0.8,
    requireVerifiedSuppliers: true,
  });

  const activePath = paths.find(p => p.pathId === selectedPathId) || resolution.recommendedPath;

  const handleActionClick = (target?: string) => {
    if (target) {
      window.open(target, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      {/* Pillar Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-indigo-950/30 to-slate-900 border border-emerald-800/30 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <GitFork className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold">
              PILLAR 4: ACTION (POSSIBILITY GRAPH & BEST PATH)
            </span>
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-2xs font-mono">
              Resolution Advantage: +31.5 Days Saved
            </Badge>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white mt-1">
            Organizing Possible Paths from Intent to Real-World Outcomes
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-3xl">
            Legacy search returns 10 blue links and leaves you to navigate 35 days of aggregator forms and ghosting.
            UDX models the entire possibility space and executes the verified Best Path in hours.
          </p>
        </div>

        {/* Intent Selector Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 p-1 rounded-xl self-start md:self-auto flex-wrap">
          {(Object.keys(intentProfiles) as (keyof typeof intentProfiles)[]).map(key => (
            <button
              key={key}
              onClick={() => {
                setActiveIntentKey(key);
                setSelectedPathId('path-direct-verified-local');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                activeIntentKey === key
                  ? 'bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {key.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Resolution Advantage Comparison Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-slate-900/70 border-slate-800/90">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs uppercase font-mono tracking-wider text-slate-400 flex items-center justify-between">
              <span>Time to Outcome</span>
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
            </CardDescription>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-emerald-400 font-mono">
                {activePath.estimatedDurationDays} Days
              </span>
              <span className="text-xs text-slate-500 line-through font-mono">
                35.0 Days (Legacy)
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-xs text-emerald-400/90 font-medium">
              +{resolution.advantage.timeReductionDays} Days Resolution Advantage
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/70 border-slate-800/90">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs uppercase font-mono tracking-wider text-slate-400 flex items-center justify-between">
              <span>Success Probability</span>
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            </CardDescription>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-indigo-300 font-mono">
                {(activePath.successProbability * 100).toFixed(0)}%
              </span>
              <span className="text-xs text-slate-500 line-through font-mono">
                14% (Aggregators)
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-xs text-indigo-300/90 font-medium">
              Zero ghosting; guaranteed 48-hour verified SLA
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/70 border-slate-800/90">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs uppercase font-mono tracking-wider text-slate-400 flex items-center justify-between">
              <span>Friction Score</span>
              <Zap className="w-3.5 h-3.5 text-amber-400" />
            </CardDescription>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-amber-300 font-mono">
                {activePath.frictionScore} / 100
              </span>
              <span className="text-xs text-slate-500 line-through font-mono">
                88 / 100 (Forms)
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-xs text-amber-300/90 font-medium">
              -{resolution.advantage.frictionReductionPoints} Friction Points reduction
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Candidate Paths Evaluation */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
          <span>SYNTHESIZED CANDIDATE PATHS IN POSSIBILITY SPACE ({paths.length})</span>
          <span>SELECT PATH TO TRAVERSE</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {paths.map(path => {
            const isSelected = activePath.pathId === path.pathId;
            const isRecommended = path.isRecommended;
            return (
              <div
                key={path.pathId}
                onClick={() => setSelectedPathId(path.pathId)}
                className={`p-4 rounded-xl border cursor-pointer transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-emerald-950/30 border-emerald-500/80 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/40'
                    : isRecommended
                    ? 'bg-slate-900/80 border-slate-700 hover:border-slate-600'
                    : 'bg-slate-900/50 border-slate-800/80 opacity-75 hover:opacity-100'
                }`}
              >
                {isRecommended && (
                  <Badge className="absolute -top-2.5 right-3 bg-emerald-600 text-white font-mono text-2xs px-2 py-0.2 shadow">
                    RECOMMENDED BEST PATH
                  </Badge>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Duration: {path.estimatedDurationDays}d</span>
                    <span className={`font-bold ${path.successProbability > 0.7 ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {(path.successProbability * 100).toFixed(0)}% Prob
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white leading-snug">
                    {path.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2">
                    {path.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-2xs font-mono text-slate-400">
                    Quality: <strong className="text-white">{path.outcomeQualityScore}/100</strong>
                  </span>
                  <span className="text-2xs font-mono text-emerald-400 flex items-center gap-1 font-semibold">
                    {isSelected ? 'ACTIVE VIEW' : 'INSPECT'} <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Traversal Visualizer: Node Checkpoints & Executable Edges */}
      <Card className="bg-slate-900/90 border-slate-800">
        <CardHeader className="p-5 pb-3 border-b border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Badge className={activePath.isRecommended ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-200'}>
                  {activePath.isRecommended ? 'BEST PATH EXECUTION' : 'ALTERNATIVE PATH'}
                </Badge>
                <span className="text-xs font-mono text-slate-400">
                  {activePath.nodes.length} Checkpoints • {activePath.edges.length} Transitions
                </span>
              </div>
              <CardTitle className="text-lg font-bold text-white mt-1">
                {activePath.title}
              </CardTitle>
            </div>

            <div className="text-xs font-mono text-emerald-300 bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-800/40">
              Expected Outcome: <span className="font-bold text-white">{activePath.expectedOutcome}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 md:p-6 space-y-6">
          <div className="space-y-4">
            {activePath.edges.map((edge, idx) => {
              const fromNode = activePath.nodes.find(n => n.nodeId === edge.fromNode);
              const toNode = activePath.nodes.find(n => n.nodeId === edge.toNode);

              return (
                <div key={edge.edgeId} className="relative">
                  {/* Step Container */}
                  <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-2xs font-mono text-slate-400 uppercase">
                            Transition {idx + 1} of {activePath.edges.length}
                          </span>
                          <span className="text-2xs font-mono text-emerald-400">
                            Duration: {edge.durationDays}d
                          </span>
                          <span className="text-2xs font-mono text-indigo-300">
                            Probability: {(edge.probability * 100).toFixed(0)}%
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-white">
                          {edge.action}
                        </h4>

                        <p className="text-xs text-slate-400">
                          From: <span className="text-slate-300">{fromNode?.state}</span> → To: <span className="text-emerald-300 font-medium">{toNode?.state}</span>
                        </p>

                        {edge.advantageSummary && (
                          <p className="text-2xs text-emerald-400/90 font-mono bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/40 inline-block mt-1">
                            Advantage: {edge.advantageSummary}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Edge Action Button */}
                    <div className="shrink-0 flex items-center gap-2 self-end md:self-center">
                      {edge.executable && edge.executionTarget ? (
                        <Button
                          size="sm"
                          onClick={() => handleActionClick(edge.executionTarget)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs px-4 py-2 rounded-xl shadow-lg shadow-emerald-600/20 flex items-center gap-1.5"
                        >
                          <span>{edge.actionButtonText || 'Execute Step'}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                      ) : (
                        <div className="text-2xs font-mono text-slate-500 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                          Autonomous Transition
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Downward connector between steps */}
                  {idx < activePath.edges.length - 1 && (
                    <div className="flex justify-center my-1">
                      <div className="w-0.5 h-4 bg-slate-800"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Reasoning & Multi-Factor Trade-offs Box */}
          <div className="p-4 bg-indigo-950/20 border border-indigo-800/30 rounded-xl space-y-2">
            <h5 className="text-xs font-mono uppercase tracking-wider text-indigo-400 flex items-center gap-2 font-semibold">
              <Compass className="w-4 h-4" />
              UDX Reasoning Engine Rationale
            </h5>
            <p className="text-xs text-slate-300 leading-relaxed">
              {resolution.reasoning}
            </p>
            <div className="pt-2 border-t border-indigo-900/30 flex items-center gap-4 text-2xs font-mono text-slate-400 flex-wrap">
              <span>Selected Policy Class: <strong className="text-emerald-400">AUTO_RECOMMEND</strong></span>
              <span>•</span>
              <span>Outcome Moat Logging: <strong className="text-indigo-300">APPEND_ONLY ACTIVE</strong></span>
              <span>•</span>
              <span>Verification SLA: <strong className="text-purple-300">48-HOUR GUARANTEE</strong></span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
