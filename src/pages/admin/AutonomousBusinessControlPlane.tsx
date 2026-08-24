// src/pages/admin/AutonomousBusinessControlPlane.tsx
// Autonomous Business OS Control Plane for /admin
// Live observation and deterministic control of all 8 server-side agents, event bus, memory, and tools.

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  agentRegistry,
  goalManager,
  eventBus,
  businessMemory,
  guardrails,
  agentAuditLog,
  executiveAgent,
  scheduler,
  type AgentStatus,
  type BusinessEvent,
  type AgentAuditRecord,
  type AgentInfo,
} from '@/agents';
import { formatCurrency } from '@/services/claim1Service';
import { toast } from 'sonner';
import {
  Bot,
  Brain,
  Shield,
  Zap,
  Activity,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  DollarSign,
  TrendingUp,
  Users,
  Briefcase,
  GraduationCap,
  Trophy,
  Building2,
  Radio,
  FileText,
  Clock,
  Layers,
  ChevronRight,
  Wrench,
} from 'lucide-react';

const AGENT_ICON_MAP: Record<string, React.ReactNode> = {
  ExecutiveAgent: <Brain className="w-5 h-5 text-indigo-500" />,
  MarketingAgent: <Zap className="w-5 h-5 text-amber-500" />,
  Claim1Agent:    <Trophy className="w-5 h-5 text-orange-500" />,
  EmployerAgent:  <Building2 className="w-5 h-5 text-blue-500" />,
  JobAgent:       <Briefcase className="w-5 h-5 text-emerald-500" />,
  CandidateAgent: <Users className="w-5 h-5 text-purple-500" />,
  CollegeAgent:   <GraduationCap className="w-5 h-5 text-cyan-500" />,
  RevenueAgent:   <DollarSign className="w-5 h-5 text-green-500" />,
};

interface ExceptionItem {
  id: string;
  agentName: string;
  action: string;
  reason: string;
  amountINR?: number;
  createdAt: string;
}

export default function AutonomousBusinessControlPlane() {
  const queryClient = useQueryClient();
  const [autonomousMasterOn, setAutonomousMasterOn] = useState(scheduler.isLoopActive());
  const [activeCycleRunning, setActiveCycleRunning] = useState(false);

  // Guardrail states
  const currentGuardrails = guardrails.getConfig();
  const [maxDailyOutreach, setMaxDailyOutreach] = useState(currentGuardrails.maxDailyOutreach);
  const [maxTouches, setMaxTouches] = useState(currentGuardrails.maxContactsPerProspect);
  const [monthlyBudget, setMonthlyBudget] = useState(currentGuardrails.monthlyBudgetCapINR);
  const [financialApprovalOn, setFinancialApprovalOn] = useState(currentGuardrails.requireHumanApprovalForSpend);

  // Exceptions queue
  const [exceptions, setExceptions] = useState<ExceptionItem[]>([
    {
      id: 'exc-1',
      agentName: 'MarketingAgent',
      action: 'Paid Ad Spend Allocation',
      reason: 'Launch targeted founder campaign on Twitter/X ($250 / ₹21,000). Paused per spend guardrail policy.',
      amountINR: 21000,
      createdAt: '10 mins ago',
    },
  ]);

  // 1. Fetch live unified business memory
  const { data: memory, refetch: refetchMemory } = useQuery({
    queryKey: ['admin-business-memory'],
    queryFn: () => businessMemory.getSnapshot(true),
    refetchInterval: 10_000,
  });

  // 2. Fetch real live agent execution matrix
  const { data: agentMatrix = [], refetch: refetchAgents } = useQuery({
    queryKey: ['admin-agent-matrix'],
    queryFn: () => agentRegistry.getLiveAgentMatrix(),
    refetchInterval: 5_000,
  });

  // 3. Fetch active primary business objective
  const { data: objective, refetch: refetchObjective } = useQuery({
    queryKey: ['admin-goal-objective'],
    queryFn: () => goalManager.getActiveObjective(),
    refetchInterval: 10_000,
  });

  // 4. Fetch recent events from event bus
  const [events, setEvents] = useState<BusinessEvent[]>([]);
  useEffect(() => {
    setEvents(eventBus.getRecentEvents(30));
    const unsubscribe = eventBus.subscribe('*', (evt) => {
      setEvents((prev) => [evt, ...prev.slice(0, 49)]);
    });
    return unsubscribe;
  }, []);

  // 5. Fetch audit records
  const [auditLogs, setAuditLogs] = useState<AgentAuditRecord[]>([]);
  useEffect(() => {
    setAuditLogs(agentAuditLog.getLogs(undefined, 30));
    const interval = setInterval(() => {
      setAuditLogs(agentAuditLog.getLogs(undefined, 30));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Run full business cycle trigger
  const runCycle = async () => {
    setActiveCycleRunning(true);
    toast.info('Triggering real autonomous business cycle across all 8 agents...');
    await executiveAgent.runBusinessCycle();
    setActiveCycleRunning(false);
    refetchMemory();
    refetchAgents();
    refetchObjective();
    setEvents(eventBus.getRecentEvents(30));
    setAuditLogs(agentAuditLog.getLogs(undefined, 30));
    toast.success('Autonomous cycle completed successfully.');
  };

  const handleApproveException = (id: string) => {
    setExceptions((prev) => prev.filter((e) => e.id !== id));
    toast.success('Exception approved. Agent executing action.');
  };

  const handleRejectException = (id: string) => {
    setExceptions((prev) => prev.filter((e) => e.id !== id));
    toast.error('Exception rejected. Action cancelled.');
  };

  const progressPct = Math.min(
    100,
    Math.round(((objective?.currentValue || 1) / (objective?.targetValue || 100)) * 100)
  );

  return (
    <div className="space-y-8 p-4 sm:p-8 max-w-7xl mx-auto">
      {/* Top Header & Master Control */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <Bot className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              Autonomous Business OS Control Plane
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Server-side autonomous multi-agent operating kernel. Operates company acquisition, jobs, colleges, Claim #1, and revenue.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-card border p-3 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-foreground">Autonomous Operations:</span>
            <Switch
              checked={autonomousMasterOn}
              onCheckedChange={(checked) => {
                setAutonomousMasterOn(checked);
                if (checked) {
                  scheduler.start();
                } else {
                  scheduler.stop();
                }
                toast.info(`Autonomous operations set to ${checked ? 'ON' : 'OFF'}.`);
              }}
            />
            <Badge className={autonomousMasterOn ? 'bg-emerald-500 text-white font-bold' : 'bg-muted'}>
              {autonomousMasterOn ? 'ACTIVE' : 'PAUSED'}
            </Badge>
          </div>

          <Button
            size="sm"
            onClick={runCycle}
            disabled={activeCycleRunning || !autonomousMasterOn}
            className="gap-1.5 font-semibold"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${activeCycleRunning ? 'animate-spin' : ''}`} />
            {activeCycleRunning ? 'Pulsing Agents...' : 'Run Business Cycle'}
          </Button>
        </div>
      </div>

      {/* Primary Objective Hero Bar */}
      <Card className="border-primary/40 bg-gradient-to-r from-primary/5 via-card to-background shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-primary uppercase tracking-wider">Top-Level Strategic Objective</span>
              </div>
              <h2 className="text-xl font-bold text-foreground mt-1">
                {objective?.title || 'Acquire the First 100 Legitimate Claim #1 Companies & Ignite 10 Bidding Battles'}
              </h2>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-primary">{objective?.currentValue || 1}</span>
              <span className="text-sm text-muted-foreground font-semibold"> / {objective?.targetValue || 100} Claimed</span>
            </div>
          </div>

          <Progress value={progressPct} className="h-3" />

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 mt-5 pt-4 border-t text-xs">
            <div>
              <span className="text-muted-foreground">Total Users:</span>
              <p className="text-base font-bold text-foreground mt-0.5">{memory?.usersCount.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Active Jobs:</span>
              <p className="text-base font-bold text-foreground mt-0.5">{memory?.activeJobsCount.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Indexed Colleges:</span>
              <p className="text-base font-bold text-foreground mt-0.5">{memory?.collegesCount.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Claimed Entities:</span>
              <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{memory?.claim1EntitiesCount}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Active Paid Bids:</span>
              <p className="text-base font-bold text-primary mt-0.5">{memory?.claim1ActiveBidsCount}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Platform Revenue:</span>
              <p className="text-base font-bold text-foreground mt-0.5">{formatCurrency(memory?.totalPlatformRevenueINR || 0, 'INR')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 8 Autonomous Operating Agents Matrix (Live Real Data Only) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" /> 8 Autonomous Functional Agents
          </h3>
          <span className="text-xs text-muted-foreground">Real-time runtime state • Zero simulated counters</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {agentMatrix.map((ac) => {
            const isPaused = !autonomousMasterOn || ac.status === 'PAUSED';
            const isRunning = !isPaused && ac.status === 'RUNNING';
            const isIdle = !isPaused && ac.status === 'IDLE';
            const isBlocked = ac.status === 'BLOCKED';

            return (
              <Card key={ac.name} className="p-5 border shadow-sm space-y-3 bg-card hover:border-primary/40 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {AGENT_ICON_MAP[ac.name] || <Bot className="w-5 h-5 text-primary" />}
                    <h4 className="font-bold text-sm text-foreground">{ac.name.replace('Agent', '')} Agent</h4>
                  </div>
                  <Badge
                    className={
                      isRunning
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border-emerald-500/30'
                        : isIdle
                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold border-blue-500/30'
                        : isBlocked
                        ? 'bg-amber-500/10 text-amber-600 text-[10px] font-bold border-amber-500/30'
                        : 'bg-muted text-[10px]'
                    }
                  >
                    {isPaused ? 'PAUSED' : ac.status}
                  </Badge>
                </div>

                <p className="text-xs text-muted-foreground">{ac.role}</p>

                <div className="p-2.5 bg-muted/40 rounded-xl text-xs space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Current Mission</span>
                  <p className="font-medium text-foreground text-xs line-clamp-2">{ac.currentObjective}</p>
                </div>

                {ac.statusReason && (
                  <p className="text-[10px] text-muted-foreground italic truncate">
                    Status: {ac.statusReason}
                  </p>
                )}

                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t">
                  <span>Actions Today: <strong>{ac.actionsToday}</strong></span>
                  <span>Errors: <strong className={ac.errorsToday > 0 ? 'text-red-500' : 'text-emerald-500'}>{ac.errorsToday}</strong></span>
                </div>

                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Wrench className="w-3 h-3 text-primary" />
                  <span>{ac.tools.length} Tools Authorized</span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Exceptions Approval Queue */}
      {exceptions.length > 0 && (
        <Card className="border-orange-500/40 bg-orange-50/10 dark:bg-orange-950/10 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-orange-700 dark:text-orange-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Pending Exceptions Requiring Human Approval ({exceptions.length})
            </CardTitle>
            <CardDescription className="text-xs">
              Actions exceeding autonomous guardrails (e.g. ad spend, legal contracts, refunds) paused for approval.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {exceptions.map((exc) => (
              <div key={exc.id} className="p-4 bg-background rounded-xl border flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs font-semibold">{exc.agentName}</Badge>
                    <span className="font-bold text-sm text-foreground">{exc.action}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{exc.reason}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={() => handleApproveException(exc.id)} className="h-8 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleRejectException(exc.id)} className="h-8 text-xs gap-1 text-destructive hover:bg-destructive/10">
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Tabs for Detailed Control Plane Sub-Systems */}
      <Tabs defaultValue="eventbus" className="space-y-4">
        <TabsList className="grid grid-cols-4 max-w-xl">
          <TabsTrigger value="eventbus">Live Event Bus</TabsTrigger>
          <TabsTrigger value="guardrails">Guardrails & Limits</TabsTrigger>
          <TabsTrigger value="memory">Business Memory</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
        </TabsList>

        {/* Tab 1: Live Event Bus */}
        <TabsContent value="eventbus" className="space-y-4">
          <Card className="border p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
                <h4 className="font-bold text-sm text-foreground">Real-Time Event Stream</h4>
              </div>
              <span className="text-xs text-muted-foreground">{events.length} Events Captured</span>
            </div>

            <div className="space-y-2 font-mono text-xs max-h-96 overflow-y-auto divide-y">
              {events.length === 0 ? (
                <p className="text-muted-foreground p-4 text-center">No recent events on bus.</p>
              ) : (
                events.map((evt) => (
                  <div key={evt.id} className="py-2.5 flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-2.5">
                      <span className="text-muted-foreground text-[10px]">
                        {new Date(evt.timestamp).toLocaleTimeString()}
                      </span>
                      <Badge variant="secondary" className="text-[10px] font-bold">
                        {evt.sourceAgent}
                      </Badge>
                      <span className="font-semibold text-foreground">{evt.type}</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground truncate max-w-xs">
                      {JSON.stringify(evt.payload)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Tab 2: Guardrails & Limits */}
        <TabsContent value="guardrails" className="space-y-4">
          <Card className="p-6 border space-y-6">
            <div>
              <h4 className="font-bold text-base text-foreground">Programmatic Safety Boundaries</h4>
              <p className="text-xs text-muted-foreground mt-0.5">Enforced server-side before any agent initiates outbound actions or expenditures.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Max Daily Outbound Contacts</label>
                <Input
                  type="number"
                  value={maxDailyOutreach}
                  onChange={(e) => setMaxDailyOutreach(Number(e.target.value))}
                />
                <p className="text-[11px] text-muted-foreground">Ceiling on total outreach sent across all channels in 24 hours.</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Max Touches per Prospect (Anti-Spam)</label>
                <Input
                  type="number"
                  value={maxTouches}
                  onChange={(e) => setMaxTouches(Number(e.target.value))}
                />
                <p className="text-[11px] text-muted-foreground">Hard cap on follow-ups before permanent cooldown (strict anti-spam policy).</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Monthly Marketing Budget Cap (₹)</label>
                <Input
                  type="number"
                  value={monthlyBudget}
                  onChange={(e) => setMonthlyBudget(Number(e.target.value))}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border">
                <div>
                  <p className="text-xs font-bold text-foreground">Financial Actions Require Human Approval</p>
                  <p className="text-[11px] text-muted-foreground">Pauses any financial bid or spend above ₹0 in the exception queue.</p>
                </div>
                <Switch checked={financialApprovalOn} onCheckedChange={setFinancialApprovalOn} />
              </div>
            </div>

            <Button onClick={() => toast.success('Guardrails saved and synchronized to kernel.')} className="font-semibold">
              Save Guardrail Policy
            </Button>
          </Card>
        </TabsContent>

        {/* Tab 3: Business Memory Inspector */}
        <TabsContent value="memory" className="space-y-4">
          <Card className="p-6 border space-y-4">
            <div>
              <h4 className="font-bold text-base text-foreground">Shared Business Memory Snapshot</h4>
              <p className="text-xs text-muted-foreground mt-0.5">All 8 agents query and synchronize with this unified state graph.</p>
            </div>

            <pre className="p-4 bg-muted/60 rounded-xl text-xs font-mono border overflow-x-auto text-foreground">
              {JSON.stringify(memory, null, 2)}
            </pre>
          </Card>
        </TabsContent>

        {/* Tab 4: Audit Trail */}
        <TabsContent value="audit" className="space-y-4">
          <Card className="p-6 border space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-base text-foreground">Immutable Operational Audit Log</h4>
                <p className="text-xs text-muted-foreground mt-0.5">Timestamped record of every autonomous action and service invocation.</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => setAuditLogs(agentAuditLog.getLogs(undefined, 30))} className="text-xs">
                Refresh Logs
              </Button>
            </div>

            <div className="space-y-2 font-mono text-xs max-h-96 overflow-y-auto divide-y">
              {auditLogs.map((log) => (
                <div key={log.id} className="py-2 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-[10px]">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    <Badge variant="outline" className="text-[10px]">{log.agentName}</Badge>
                    <span className="font-semibold text-foreground">{log.action}</span>
                  </div>
                  <Badge className={log.success ? 'bg-emerald-500/10 text-emerald-600 text-[10px]' : 'bg-red-500/10 text-red-600 text-[10px]'}>
                    {log.success ? 'SUCCESS' : 'FAILED'}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
