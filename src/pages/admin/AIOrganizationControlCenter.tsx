// src/pages/admin/AIOrganizationControlCenter.tsx
// Master Control Plane for TalentXcel AI Growth Organization (/admin/ai-organization)
// Features 5-State Server-Authoritative Kill Switch, 9-Agent Grid (1 CEO + 8 Specialists), AI CEO Daily Plan & Audit Stream

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Bot,
  Power,
  Play,
  Pause,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Search,
  CheckCircle2,
  Clock,
  Send,
  Sparkles,
  TrendingUp,
  Globe2,
  RefreshCw,
  Users,
  Building2,
  Lock,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  getAuthoritativeLifecycleState,
  setAuthoritativeLifecycleState,
  getCachedAgentStates,
  setAgentEnabledLocally,
  AGENT_REGISTRY_DESCRIPTORS,
  DEFAULT_ACTION_PERMISSIONS
} from '@/lib/ai-org/aiOrganizationState';
import {
  runFullOrganizationCycle,
  isSchedulerRunning,
  startScheduler,
  stopScheduler,
  type FullOrganizationCycleReport
} from '@/lib/ai-org/aiOrganizationScheduler';
import {
  getActiveDailyOperatingPlan,
  runExecutiveDirectorCycle
} from '@/lib/ai-org/executiveDirectorAgent';
import { LOCAL_AUDIT_STREAM } from '@/lib/ai-org/executionGateway';
import { 
  ALL_AGENT_IDS, 
  TOTAL_AGENTS_COUNT, 
  type AgentId, 
  type OrganizationLifecycleState,
  type DailyOperatingPlan
} from '@/lib/ai-org/types';

export default function AIOrganizationControlCenter() {
  const [lifecycleState, setLifecycleState] = useState<OrganizationLifecycleState>('ONLINE');
  const [isUpdatingState, setIsUpdatingState] = useState(false);
  const [isRunningCycle, setIsRunningCycle] = useState(false);
  const [agentStates, setAgentStates] = useState(getCachedAgentStates());
  const [dailyPlan, setDailyPlan] = useState<DailyOperatingPlan | null>(getActiveDailyOperatingPlan());
  const [lastReport, setLastReport] = useState<FullOrganizationCycleReport | null>(null);
  const [schedulerActive, setSchedulerActive] = useState<boolean>(isSchedulerRunning());

  // Load server-authoritative state on mount
  useEffect(() => {
    loadServerState();
    // Default boot AI CEO plan if empty
    if (!dailyPlan) {
      runExecutiveDirectorCycle().then((plan) => setDailyPlan(plan));
    }
  }, []);

  const loadServerState = async () => {
    const serverState = await getAuthoritativeLifecycleState();
    setLifecycleState(serverState);
    setAgentStates(getCachedAgentStates());
  };

  const handleToggleLifecycle = async (targetState: OrganizationLifecycleState) => {
    setIsUpdatingState(true);
    try {
      const ok = await setAuthoritativeLifecycleState(targetState, 'SuperAdmin');
      if (ok) {
        setLifecycleState(targetState);
        toast.success(`AI Organization state updated to ${targetState} (Server Authoritative)`);
      } else {
        toast.error('Failed to update server-authoritative state.');
      }
    } catch {
      toast.error('Network error updating lifecycle state.');
    } finally {
      setIsUpdatingState(false);
    }
  };

  const handleAgentToggle = (agentId: AgentId, enabled: boolean) => {
    setAgentEnabledLocally(agentId, enabled);
    setAgentStates({ ...getCachedAgentStates() });
    toast.info(`Agent ${AGENT_REGISTRY_DESCRIPTORS[agentId].name} is now ${enabled ? 'ENABLED' : 'DISABLED'}`);
  };

  const handleRunFullCycle = async () => {
    setIsRunningCycle(true);
    try {
      const report = await runFullOrganizationCycle();
      setLastReport(report);
      setDailyPlan(report.dailyOperatingPlan);
      setAgentStates(getCachedAgentStates());
      
      if (report.totalBlocked > 0 && report.totalExecuted === 0) {
        toast.warning(`Cycle completed: ${report.totalBlocked} actions BLOCKED by Execution Gateway (Org state: ${report.lifecycleStatusAtStart}).`);
      } else {
        toast.success(`Cycle completed! ${report.totalExecuted} actions executed, ${report.totalPendingReview} queued for human review.`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to execute organization cycle.');
    } finally {
      setIsRunningCycle(false);
    }
  };

  const handleToggleScheduler = () => {
    if (schedulerActive) {
      stopScheduler();
      setSchedulerActive(false);
      toast.info('Autonomous scheduler worker paused.');
    } else {
      startScheduler(60);
      setSchedulerActive(true);
      toast.success('Autonomous scheduler worker running (60-minute heartbeat).');
    }
  };

  const isOnline = lifecycleState === 'ONLINE';
  const isEmergencyStop = lifecycleState === 'EMERGENCY_STOP';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      <Helmet>
        <title>TalentXcel AI Growth Organization | Admin Control Plane</title>
      </Helmet>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Breadcrumb Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/30">
                <Bot className="w-3.5 h-3.5 mr-1" /> Autonomous Growth OS
              </Badge>
              <Badge variant="outline" className="text-slate-400 border-slate-800 text-[11px]">
                Server-Authoritative (Supabase Synchronized)
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              TalentXcel AI Growth Organization
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              1 Executive AI CEO + 8 Department Specialist Agents ({TOTAL_AGENTS_COUNT} Total) · Server-Authoritative Kill Switch · Closed GSC Feedback Loop
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleScheduler}
              className={`text-xs border-slate-800 ${
                schedulerActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-slate-900 text-slate-400'
              }`}
            >
              <Clock className="w-3.5 h-3.5 mr-1.5" />
              Scheduler: {schedulerActive ? 'Worker Active (60m)' : 'Paused'}
            </Button>
            <Button
              size="sm"
              onClick={handleRunFullCycle}
              disabled={isRunningCycle}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
            >
              <Play className={`w-3.5 h-3.5 mr-1.5 ${isRunningCycle ? 'animate-spin' : ''}`} />
              Run Full Daily Operating Cycle
            </Button>
          </div>
        </div>

        {/* Master Kill Switch Banner (Level 1 Control) */}
        <div
          className={`p-6 sm:p-8 rounded-3xl border transition-all ${
            isOnline
              ? 'bg-gradient-to-r from-emerald-950/50 via-slate-900 to-slate-900 border-emerald-500/40 shadow-xl shadow-emerald-950/20'
              : isEmergencyStop
              ? 'bg-gradient-to-r from-red-950/80 via-slate-900 to-slate-900 border-red-500/60 shadow-xl shadow-red-950/30'
              : 'bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900 border-rose-500/40 shadow-xl shadow-rose-950/20'
          }`}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                <span
                  className={`w-2.5 h-2.5 rounded-full animate-pulse ${
                    isOnline ? 'bg-emerald-400' : isEmergencyStop ? 'bg-red-500' : 'bg-rose-400'
                  }`}
                />
                <span className={isOnline ? 'text-emerald-400' : isEmergencyStop ? 'text-red-400' : 'text-rose-400'}>
                  ORGANIZATION {lifecycleState}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                {isOnline
                  ? 'Autonomous Operations Online'
                  : isEmergencyStop
                  ? 'Emergency Stop Engaged'
                  : 'Autonomous Operations Offline'}
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">
                {isOnline
                  ? 'All 9 agents are authorized to execute their daily operating cycles within strict Level-3 permission boundaries. GSC demand is actively synthesized.'
                  : isEmergencyStop
                  ? 'CRITICAL SAFEGUARD: All autonomous mutations, publishing, indexing, and outreach are unconditionally frozen.'
                  : 'All autonomous execution is strictly blocked at the Execution Gateway. Scheduled agents cannot publish, mutate, or enqueue actions.'}
              </p>
            </div>

            {/* Master Control Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              {isOnline ? (
                <Button
                  size="lg"
                  variant="destructive"
                  onClick={() => handleToggleLifecycle('OFFLINE')}
                  disabled={isUpdatingState}
                  className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-6 py-5 shadow-lg shadow-rose-600/30"
                >
                  <Power className="w-4 h-4 mr-2" />
                  Turn Organization OFF
                </Button>
              ) : (
                <Button
                  size="lg"
                  onClick={() => handleToggleLifecycle('ONLINE')}
                  disabled={isUpdatingState}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-5 shadow-lg shadow-emerald-600/30"
                >
                  <Power className="w-4 h-4 mr-2" />
                  Turn Organization ON
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleToggleLifecycle(isEmergencyStop ? 'OFFLINE' : 'EMERGENCY_STOP')}
                disabled={isUpdatingState}
                className="text-xs border-red-800 bg-red-950/50 hover:bg-red-900 text-red-300"
              >
                <ShieldAlert className="w-3.5 h-3.5 mr-1 text-red-400" />
                {isEmergencyStop ? 'Disengage Emergency Stop' : 'Emergency Stop'}
              </Button>
            </div>
          </div>
        </div>

        {/* AI CEO Daily Operating Plan */}
        {dailyPlan && (
          <Card className="bg-slate-900/90 border-slate-800 text-slate-100">
            <CardHeader className="border-b border-slate-800/80 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="bg-sky-500/10 text-sky-400 border-sky-500/30 text-xs">
                      <Sparkles className="w-3 h-3 mr-1" /> Executive Director Synthesis
                    </Badge>
                    <span className="text-xs text-slate-500">Plan ID: {dailyPlan.planId}</span>
                  </div>
                  <CardTitle className="text-lg font-bold text-white">
                    Today&apos;s Strategic Growth Priorities
                  </CardTitle>
                </div>
                <Badge variant="outline" className="text-slate-400 border-slate-800 text-xs self-start sm:self-auto">
                  Generated: {new Date(dailyPlan.generatedAt).toLocaleTimeString()}
                </Badge>
              </div>
              <CardDescription className="text-slate-400 text-xs mt-1">
                {dailyPlan.overallTargetNotes}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {dailyPlan.priorities.map((p) => (
                <div
                  key={p.rank}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-600/20 border border-blue-500/40 text-blue-400 text-[11px] font-bold flex items-center justify-center">
                        {p.rank}
                      </span>
                      <h4 className="text-sm font-semibold text-white">{p.title}</h4>
                      <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/30 text-[10px]">
                        {p.delegatedAgentId}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 pl-7">{p.telemetryTrigger}</p>
                    <p className="text-xs text-emerald-400/90 pl-7 flex items-center gap-1 font-mono">
                      <ArrowRight className="w-3 h-3" /> {p.proposedAction}
                    </p>
                  </div>
                  <div className="text-right shrink-0 pl-7 md:pl-0">
                    <div className="text-xs font-mono text-slate-400">Impact Score</div>
                    <div className="text-base font-extrabold text-blue-400">{p.impactScore}/100</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Level 2: 9 Agents Grid (1 Executive CEO + 8 Department Specialists) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                Active Agent Roster (1 AI CEO + 8 Department Specialists = {TOTAL_AGENTS_COUNT} Total)
              </h3>
              <p className="text-xs sm:text-sm text-slate-400">
                Granular enable/disable controls per agent. Disabled agents are blocked from execution even when the organization is online.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ALL_AGENT_IDS.map((agentId) => {
              const meta = AGENT_REGISTRY_DESCRIPTORS[agentId];
              const state = agentStates[agentId] || { enabled: true, status: 'IDLE', totalActionsExecuted: 0 };

              return (
                <Card
                  key={agentId}
                  className={`border transition-all ${
                    state.enabled
                      ? 'bg-slate-900/90 border-slate-800'
                      : 'bg-slate-950/60 border-slate-900 opacity-60'
                  }`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <Badge
                          variant="outline"
                          className="text-[10px] uppercase font-semibold text-slate-400 border-slate-700"
                        >
                          {meta.department}
                        </Badge>
                        <CardTitle className="text-sm font-bold text-white leading-snug">
                          {meta.name}
                        </CardTitle>
                      </div>
                      <Switch
                        checked={state.enabled}
                        onCheckedChange={(val) => handleAgentToggle(agentId, val)}
                      />
                    </div>
                    <div className="text-xs text-blue-400 font-medium">{meta.roleTitle}</div>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs">
                    <p className="text-slate-400 line-clamp-2">{meta.mission}</p>
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-slate-400 font-mono">
                      <span>Schedule: {meta.defaultSchedule}</span>
                      <span className="text-emerald-400 font-bold">{state.totalActionsExecuted} Actions</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Level 3: Action Permissions Matrix & Safety Boundaries */}
        <Card className="bg-slate-900/90 border-slate-800 text-slate-100">
          <CardHeader>
            <CardTitle className="text-base font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-yellow-400" />
              Level 3 Action Permissions Matrix &amp; Safety Policy
            </CardTitle>
            <CardDescription className="text-slate-400 text-xs">
              Strict execution boundaries. Actions marked REVIEW require explicit human authorization. Actions marked FORBIDDEN are permanently hard-locked against AI agents.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-slate-800 overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-2.5 px-4">Action Type</th>
                    <th className="py-2.5 px-4">Policy</th>
                    <th className="py-2.5 px-4">Enforcement Mechanism</th>
                    <th className="py-2.5 px-4">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300">
                  <tr>
                    <td className="py-2.5 px-4 font-mono font-semibold text-white">READ_DATA / ANALYZE</td>
                    <td className="py-2.5 px-4"><Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">AUTO</Badge></td>
                    <td className="py-2.5 px-4 text-slate-400">Autonomous when Org is ONLINE</td>
                    <td className="py-2.5 px-4 text-slate-400">Read-only intelligence, demand clustering, and opportunity scoring.</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-mono font-semibold text-white">CREATE_SEO_PAGE</td>
                    <td className="py-2.5 px-4"><Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">AUTO</Badge></td>
                    <td className="py-2.5 px-4 text-slate-400">Quality-Gated programmatic drafts</td>
                    <td className="py-2.5 px-4 text-slate-400">Permitted only when search demand passes the strict 0-doorway inventory check.</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-mono font-semibold text-white">PUBLISH_PAGE</td>
                    <td className="py-2.5 px-4"><Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30">REVIEW</Badge></td>
                    <td className="py-2.5 px-4 text-amber-400">Human Approval Queue</td>
                    <td className="py-2.5 px-4 text-slate-400">Requires human review before publishing to live site and sitemaps.</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-mono font-semibold text-white">PUBLISH_SOCIAL_POST</td>
                    <td className="py-2.5 px-4"><Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30">REVIEW</Badge></td>
                    <td className="py-2.5 px-4 text-amber-400">Human Approval Queue</td>
                    <td className="py-2.5 px-4 text-slate-400">Drafts are queued for founder/growth marketing approval before dispatch.</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-mono font-semibold text-white">SEND_EMAIL</td>
                    <td className="py-2.5 px-4"><Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30">REVIEW</Badge></td>
                    <td className="py-2.5 px-4 text-amber-400">Human Approval Queue</td>
                    <td className="py-2.5 px-4 text-slate-400">Outreach emails strictly require human confirmation.</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-mono font-semibold text-red-400">DELETE_PAGE</td>
                    <td className="py-2.5 px-4"><Badge variant="destructive">FORBIDDEN</Badge></td>
                    <td className="py-2.5 px-4 text-red-400 font-bold">Hard-Locked Block</td>
                    <td className="py-2.5 px-4 text-slate-400">AI agents are strictly forbidden from deleting public canonical pages.</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-mono font-semibold text-red-400">SPEND_MONEY</td>
                    <td className="py-2.5 px-4"><Badge variant="destructive">FORBIDDEN</Badge></td>
                    <td className="py-2.5 px-4 text-red-400 font-bold">Hard-Locked Block</td>
                    <td className="py-2.5 px-4 text-slate-400">Financial allocation requires 2-Super-Admin multi-sig dual control.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Live AI Operations Audit Stream */}
        <Card className="bg-slate-900/90 border-slate-800 text-slate-100">
          <CardHeader>
            <CardTitle className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              Live AI Operations Audit Stream
            </CardTitle>
            <CardDescription className="text-slate-400 text-xs">
              Every autonomous action, recommendation, or block is immutably logged with telemetry provenance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-slate-800 overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-2.5 px-4">Time</th>
                    <th className="py-2.5 px-4">Agent</th>
                    <th className="py-2.5 px-4">Action</th>
                    <th className="py-2.5 px-4">Target Surface</th>
                    <th className="py-2.5 px-4">Telemetry Trigger</th>
                    <th className="py-2.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-300">
                  {LOCAL_AUDIT_STREAM.slice(0, 10).map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-4 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                        {new Date(entry.createdAt).toLocaleTimeString()}
                      </td>
                      <td className="py-2.5 px-4 font-medium text-white">{entry.agentId}</td>
                      <td className="py-2.5 px-4 font-mono text-blue-400">{entry.actionType}</td>
                      <td className="py-2.5 px-4 text-slate-300">{entry.targetSurface || 'System'}</td>
                      <td className="py-2.5 px-4 text-slate-400 max-w-xs truncate">{entry.telemetryTrigger || 'Routine schedule'}</td>
                      <td className="py-2.5 px-4">
                        <Badge
                          className={
                            entry.status === 'EXECUTED'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : entry.status === 'PENDING_REVIEW'
                              ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          }
                        >
                          {entry.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
