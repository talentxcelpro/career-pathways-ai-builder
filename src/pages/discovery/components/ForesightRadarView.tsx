import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Radar, 
  TrendingUp, 
  Radio, 
  Clock, 
  ArrowUpRight, 
  ShieldAlert, 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  Zap,
  Target,
  ChevronRight,
  Activity
} from 'lucide-react';
import { ForecastHorizon, IntentTrajectory } from '@/lib/udx/foresight/types';
import { UDXForesightEngine } from '@/lib/udx/foresight/UDXForesightEngine';
import { EpistemicEngine } from '@/lib/udx/evidence/EpistemicEngine';
import { UDXIntent } from '@/lib/udx/core/IntentTypes';

interface ForesightRadarViewProps {
  intents?: UDXIntent[];
}

export const ForesightRadarView: React.FC<ForesightRadarViewProps> = ({ intents }) => {
  const [selectedHorizon, setSelectedHorizon] = useState<ForecastHorizon | 'ALL'>('ALL');
  const [selectedTrajectory, setSelectedTrajectory] = useState<IntentTrajectory | null>(null);

  const liveIntents = intents || [];

  if (liveIntents.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-900 border border-purple-800/30 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Radar className="w-5 h-5 text-purple-400 animate-pulse" />
              <span className="text-xs font-mono uppercase tracking-widest text-purple-400 font-semibold">
                PILLAR 3: FUTURE (FORESIGHT RADAR)
              </span>
              <Badge variant="outline" className="bg-amber-950/60 text-amber-300 border-amber-800/50 text-2xs font-mono">
                TELEMETRY_INGESTING...
              </Badge>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white mt-1">
              Weak Signal Detection & Opportunity-Before-Demand
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl mt-0.5">
              Live foresight modeling active under MODE_B_REALITY. Awaiting canonical intent telemetry from World Observatory.
            </p>
          </div>
        </div>

        <Card className="bg-slate-900/60 border-slate-800 p-12 text-center">
          <CardContent className="space-y-4">
            <Radio className="w-10 h-10 text-amber-400 mx-auto animate-pulse" />
            <div className="space-y-1">
              <h3 className="text-lg font-bold font-mono text-slate-200">NO_VERIFIED_DATA / TELEMETRY_INGESTING...</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto font-mono">
                Zero synthetic seed intents permitted under MODE_B_REALITY. Foresight trajectories require live canonical intents ingested via GSC telemetry and World Observatory.
              </p>
            </div>
            <Badge variant="outline" className="text-3xs font-mono bg-slate-950 border-slate-700 text-slate-400">
              AWAITING GSC_TELEMETRY INGESTION
            </Badge>
          </CardContent>
        </Card>
      </div>
    );
  }

  const radarSummary = UDXForesightEngine.generateRadar(liveIntents, selectedHorizon);
  const activeTraj = selectedTrajectory || radarSummary.trajectories[0];

  const getStageBadgeClass = (stage: string) => {
    switch (stage) {
      case 'WEAK_SIGNAL':
        return 'bg-cyan-950/80 text-cyan-300 border-cyan-800/60';
      case 'EMERGING_INTENT':
        return 'bg-indigo-950/80 text-indigo-300 border-indigo-800/60';
      case 'RAPID_ACCELERATION':
        return 'bg-purple-950/80 text-purple-300 border-purple-800/60';
      case 'MAINSTREAM_SATURATION':
        return 'bg-amber-950/80 text-amber-300 border-amber-800/60';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Pillar Header Banner */}
      <div className="bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-900 border border-purple-800/30 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Radar className="w-5 h-5 text-purple-400 animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-widest text-purple-400 font-semibold">
              PILLAR 3: FUTURE (FORESIGHT RADAR)
            </span>
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/40 text-2xs font-mono">
              Intent Lead Time Engine
            </Badge>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white mt-1">
            Weak Signal Detection & Opportunity-Before-Demand
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-3xl">
            Detects emerging intent trajectories weeks before mainstream search recognition.
            Allows UDX to build supply, verify pathways, and stake authority before legacy search engines realize the shift.
          </p>
        </div>

        {/* Horizon Filter */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 p-1 rounded-xl self-start md:self-auto">
          {(['ALL', 'NEXT_7_DAYS', 'NEXT_30_DAYS', 'NEXT_90_DAYS'] as const).map(horizon => (
            <button
              key={horizon}
              onClick={() => setSelectedHorizon(horizon)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                selectedHorizon === horizon
                  ? 'bg-purple-600 text-white font-semibold shadow-md shadow-purple-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {horizon.replace('NEXT_', '+').replace('_DAYS', 'd')}
            </button>
          ))}
        </div>
      </div>

      {/* Foresight Telemetry KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900/70 border-slate-800/90">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs uppercase font-mono tracking-wider text-slate-400 flex items-center justify-between">
              <span>Portfolio Lead Time</span>
              <Clock className="w-3.5 h-3.5 text-purple-400" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-purple-300 font-mono">
              +{radarSummary.averageIntentLeadTimeDays} Days
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-xs text-slate-400">
              Active trajectory avg (+38d peak emergent signal)
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/70 border-slate-800/90">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs uppercase font-mono tracking-wider text-slate-400 flex items-center justify-between">
              <span>Avg Acceleration</span>
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-400 font-mono">
              +{radarSummary.averageAccelerationVelocity}%
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-xs text-slate-400">
              Composite trajectory growth velocity
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/70 border-slate-800/90">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs uppercase font-mono tracking-wider text-slate-400 flex items-center justify-between">
              <span>Weak Signals Monitored</span>
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-cyan-300 font-mono">
              {radarSummary.monitoredWeakSignalsCount}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-xs text-slate-400">
              Multi-surface vocabulary & query anomalies
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/70 border-slate-800/90">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs uppercase font-mono tracking-wider text-slate-400 flex items-center justify-between">
              <span>Opportunity Window</span>
              <Zap className="w-3.5 h-3.5 text-amber-400" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-amber-300 font-mono">
              PREEMPTIVE
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-xs text-slate-400">
              Supply established before query saturation
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Opportunity Before Demand Timeline Diagram */}
      <Card className="bg-slate-900/80 border-slate-800">
        <CardHeader className="p-4 md:p-6 pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base md:text-lg font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-400" />
                The Opportunity-Before-Demand Timeline
              </CardTitle>
              <CardDescription className="text-xs text-slate-400 mt-1">
                Why UDX Foresight renders legacy search engine ranking secondary
              </CardDescription>
            </div>
            <Badge variant="outline" className="border-indigo-500/40 text-indigo-300 font-mono text-2xs">
              Anticipation &gt; Reaction
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative">
            <div className="bg-slate-950/70 border border-cyan-800/40 rounded-xl p-3 relative">
              <div className="text-2xs font-mono text-cyan-400 font-semibold mb-1">STAGE 1: DAY 0</div>
              <h4 className="text-xs font-bold text-white">Weak Signal Anomaly</h4>
              <p className="text-2xs text-slate-400 mt-1">
                UDX detects subtle shifts in vocabulary, employer specs, and cross-engine AI queries.
              </p>
              <div className="mt-2 text-2xs font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                Google/SEO: 0 Recognition
              </div>
            </div>

            <div className="bg-slate-950/70 border border-purple-800/40 rounded-xl p-3 relative">
              <div className="text-2xs font-mono text-purple-400 font-semibold mb-1">STAGE 2: DAY 10–14</div>
              <h4 className="text-xs font-bold text-white">UDX Preemptive Pathway</h4>
              <p className="text-2xs text-slate-400 mt-1">
                UDX seeds verified first-party supply, tools, and intake paths before demand peaks.
              </p>
              <div className="mt-2 text-2xs font-mono text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/40">
                Emergent Lead: +38 Days (Empirical Signal)
              </div>
            </div>

            <div className="bg-slate-950/70 border border-indigo-800/40 rounded-xl p-3 relative">
              <div className="text-2xs font-mono text-indigo-400 font-semibold mb-1">STAGE 3: DAY 38</div>
              <h4 className="text-xs font-bold text-white">Mainstream Acceleration</h4>
              <p className="text-2xs text-slate-400 mt-1">
                Query search volume surges on Google/Naukri. Users arrive to find UDX already verified.
              </p>
              <div className="mt-2 text-2xs font-mono text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/40">
                Instant Resolution Ready
              </div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 relative">
              <div className="text-2xs font-mono text-slate-400 font-semibold mb-1">STAGE 4: DAY 60+</div>
              <h4 className="text-xs font-bold text-slate-300">Incumbent Saturation</h4>
              <p className="text-2xs text-slate-400 mt-1">
                Aggregators produce scrapers and ads. By then, UDX owns the closed-loop verified resolution.
              </p>
              <div className="mt-2 text-2xs font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                Moat Established
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trajectory Explorer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Trajectory List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
            <span>ACTIVE INTENT TRAJECTORIES ({radarSummary.trajectories.length})</span>
            <span>VELOCITY</span>
          </div>

          <div className="space-y-2">
            {radarSummary.trajectories.map(traj => {
              const isSelected = activeTraj?.trajectoryId === traj.trajectoryId;
              return (
                <div
                  key={traj.trajectoryId}
                  onClick={() => setSelectedTrajectory(traj)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-purple-950/40 border-purple-600/70 shadow-lg shadow-purple-950/50 ring-1 ring-purple-500/40'
                      : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge variant="outline" className={`font-mono text-2xs px-2 py-0.2 ${getStageBadgeClass(traj.currentStage)}`}>
                          {traj.currentStage.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline" className="border-slate-800 text-slate-400 font-mono text-2xs">
                          {traj.forecastHorizon.replace('NEXT_', '+').replace('_DAYS', 'd')}
                        </Badge>
                      </div>
                      <h4 className="text-xs font-bold text-white leading-snug">
                        {traj.canonicalIntent}
                      </h4>
                      <p className="text-2xs text-slate-400 line-clamp-1">
                        {traj.epistemicChain.detectedAnomaly}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-emerald-400 font-mono block">
                        +{traj.velocity}%
                      </span>
                      <span className="text-2xs font-mono text-purple-300">
                        +{traj.intentLeadTimeDays}d lead
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Trajectory Deep Dive */}
        <div className="lg:col-span-7">
          {activeTraj ? (
            <Card className="bg-slate-900/90 border-slate-800 h-full flex flex-col justify-between">
              <div>
                <CardHeader className="p-5 pb-3 border-b border-slate-800">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-purple-600 text-white font-mono text-xs">
                        {activeTraj.domain}
                      </Badge>
                      <Badge variant="outline" className={`font-mono text-xs ${getStageBadgeClass(activeTraj.currentStage)}`}>
                        {activeTraj.currentStage}
                      </Badge>
                    </div>
                    <div className="text-xs font-mono text-purple-300 bg-purple-950/60 px-2.5 py-1 rounded-lg border border-purple-800/40">
                      Intent Lead Time: <span className="font-bold">+{activeTraj.intentLeadTimeDays} Days</span>
                    </div>
                  </div>
                  <CardTitle className="text-lg font-bold text-white mt-2">
                    {activeTraj.canonicalIntent}
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400">
                    Projected inflection date: <span className="text-slate-200 font-mono">{activeTraj.projectedTrajectory.inflectionDate}</span> • Confidence: <span className="text-emerald-400 font-mono">{(activeTraj.projectedTrajectory.confidenceScore * 100).toFixed(0)}%</span>
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-5 space-y-4">
                  {/* Epistemic Reasoning Chain */}
                  <div>
                    <h5 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
                      <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
                      Audited Epistemic Chain (Zero Prediction Theater)
                    </h5>
                    <div className="space-y-2 text-xs">
                      <div className="p-2.5 bg-slate-950/80 border border-slate-800/80 rounded-lg flex items-start gap-2.5">
                        <Badge variant="outline" className="border-emerald-700/60 text-emerald-400 font-mono text-2xs shrink-0">
                          OBSERVED
                        </Badge>
                        <span className="text-slate-300 text-2xs">
                          {activeTraj.epistemicChain.observedBaseline}
                        </span>
                      </div>

                      <div className="p-2.5 bg-slate-950/80 border border-slate-800/80 rounded-lg flex items-start gap-2.5">
                        <Badge variant="outline" className="border-cyan-700/60 text-cyan-400 font-mono text-2xs shrink-0">
                          DETECTED
                        </Badge>
                        <span className="text-slate-300 text-2xs">
                          {activeTraj.epistemicChain.detectedAnomaly}
                        </span>
                      </div>

                      <div className="p-2.5 bg-slate-950/80 border border-slate-800/80 rounded-lg flex items-start gap-2.5">
                        <Badge variant="outline" className="border-indigo-700/60 text-indigo-400 font-mono text-2xs shrink-0">
                          MODELED
                        </Badge>
                        <span className="text-slate-300 text-2xs">
                          {activeTraj.epistemicChain.modelExplanation}
                        </span>
                      </div>

                      <div className="p-2.5 bg-slate-950/80 border border-slate-800/80 rounded-lg flex items-start gap-2.5">
                        <Badge variant="outline" className="border-purple-700/60 text-purple-400 font-mono text-2xs shrink-0">
                          FORECAST
                        </Badge>
                        <span className="text-slate-300 text-2xs">
                          {activeTraj.epistemicChain.forecastProjection}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Preemptive Actions Trigger */}
                  <div>
                    <h5 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      Preemptive Actions (Opportunity Before Demand)
                    </h5>
                    <div className="space-y-2">
                      {activeTraj.recommendedActions.map(action => (
                        <div
                          key={action.actionId}
                          className="p-3 bg-purple-950/30 border border-purple-800/40 rounded-xl flex items-center justify-between gap-3"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-purple-600/30 text-purple-300 border-none font-mono text-2xs">
                                {action.actionType}
                              </Badge>
                              <span className="text-xs font-bold text-white">{action.title}</span>
                            </div>
                            <p className="text-2xs text-slate-400 mt-0.5">
                              {action.leadAdvantage} • {action.rationale}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            className="bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs shrink-0"
                            onClick={() => window.open(action.targetRoute, '_blank')}
                          >
                            {action.actionText}
                            <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </div>

              <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between text-2xs font-mono text-slate-400">
                <span>Trajectory ID: {activeTraj.trajectoryId}</span>
                <span>Signal Strength: {activeTraj.signalStrength}/100</span>
              </div>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
};
