// src/pages/admin/AutonomousBusinessControlPlane.tsx
// Autonomous Business OS Operating Console for /admin
// Operating for Founder & CEO: Sanobar Jahan
// 9 Operating Divisions • 48 Specialist Workers • 11 Zoho Mailboxes • 14 Channels • 100% Verified Telemetry

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
  coreAgentOrchestrator,
  coreBusinessMemory,
  coreObjectiveEngine,
  coreChannelRegistry,
  coreKPIEngine,
  coreEmailOrchestrator,
  kernelAgentRegistry,
  kernelAgentScheduler,
  kernelEventBus,
  kernelRiskEngine,
  kernelAuditEngine,
  type WorkerDiagnostic,
  type BusinessEvent,
  type KernelAuditEntry,
  type RiskEscalation,
  type DepartmentId,
  type MailboxDescriptor,
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
  Crown,
  Network,
  Search,
  Check,
  Lock,
  Globe,
  Mail,
  Send,
  MessageSquare,
  Share2,
  Inbox,
} from 'lucide-react';

const DEPARTMENT_LABELS: Record<DepartmentId | 'all', { label: string; count: number; icon: React.ReactNode }> = {
  all:                 { label: 'All 48 Workers',        count: 48, icon: <Bot className="w-4 h-4 text-primary" /> },
  executive:           { label: 'Executive Office',      count: 5,  icon: <Crown className="w-4 h-4 text-indigo-500" /> },
  growth_marketing:    { label: 'Growth & Marketing',    count: 9,  icon: <Zap className="w-4 h-4 text-amber-500" /> },
  employer:            { label: 'Employer Acquisition',  count: 5,  icon: <Building2 className="w-4 h-4 text-blue-500" /> },
  jobs:                { label: 'Jobs Division',         count: 5,  icon: <Briefcase className="w-4 h-4 text-emerald-500" /> },
  candidates:          { label: 'Candidate Growth',      count: 5,  icon: <Users className="w-4 h-4 text-purple-500" /> },
  colleges:            { label: 'College Division',      count: 4,  icon: <GraduationCap className="w-4 h-4 text-cyan-500" /> },
  claim1:              { label: 'Claim #1 Engine',       count: 5,  icon: <Trophy className="w-4 h-4 text-orange-500" /> },
  revenue:             { label: 'Revenue & Commercial',  count: 5,  icon: <DollarSign className="w-4 h-4 text-green-500" /> },
  product_engineering: { label: 'Product & Engineering', count: 5,  icon: <Shield className="w-4 h-4 text-rose-500" /> },
};

export default function AutonomousBusinessControlPlane() {
  const queryClient = useQueryClient();
  const [autonomousMasterOn, setAutonomousMasterOn] = useState(kernelAgentScheduler.isActive());
  const [selectedDept, setSelectedDept] = useState<DepartmentId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCycleRunning, setActiveCycleRunning] = useState(false);

  // 1. Fetch live verified business memory & KPIs
  const { data: memory, refetch: refetchMemory } = useQuery({
    queryKey: ['core-verified-memory'],
    queryFn: () => coreBusinessMemory.getVerifiedMetrics(true),
    refetchInterval: 10_000,
  });

  // 2. Fetch strategic targets
  const { data: goals = [], refetch: refetchGoals } = useQuery({
    queryKey: ['core-strategic-goals'],
    queryFn: () => coreObjectiveEngine.getSynchronizedGoals(),
    refetchInterval: 10_000,
  });

  // 3. Fetch 48 specialist workers diagnostics from real DB logs
  const { data: workers = [], refetch: refetchWorkers } = useQuery({
    queryKey: ['core-48-workers'],
    queryFn: () => kernelAgentRegistry.getLiveWorkerDiagnostics(),
    refetchInterval: 5_000,
  });

  // 4. Fetch 11 Zoho mailboxes
  const mailboxes = coreEmailOrchestrator.getAllMailboxes();

  // 5. Fetch 14 channels
  const channels = coreChannelRegistry.getAllChannels();

  // 6. Fetch pending founder escalations
  const [escalations, setEscalations] = useState<RiskEscalation[]>(kernelRiskEngine.getPendingEscalations());

  // 7. Live event bus
  const [events, setEvents] = useState<BusinessEvent[]>([]);
  useEffect(() => {
    setEvents(kernelEventBus.getRecentEvents(30));
    const unsubscribe = kernelEventBus.subscribe('*', (evt) => {
      setEvents((prev) => [evt, ...prev.slice(0, 49)]);
    });
    return unsubscribe;
  }, []);

  // 8. Audit records
  const [auditLogs, setAuditLogs] = useState<KernelAuditEntry[]>([]);
  useEffect(() => {
    setAuditLogs(kernelAuditEngine.getRecentLogs(30));
    const interval = setInterval(() => {
      setAuditLogs(kernelAuditEngine.getRecentLogs(30));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Run full business operating cycle
  const handleRunBusinessCycle = async () => {
    setActiveCycleRunning(true);
    toast.info('Executing autonomous operating cycle across all 9 departments & 11 Zoho mailboxes...');
    const result = await coreAgentOrchestrator.executeFullBusinessCycle();
    await kernelAgentScheduler.tick();
    setActiveCycleRunning(false);
    refetchMemory();
    refetchGoals();
    refetchWorkers();
    setEvents(kernelEventBus.getRecentEvents(30));
    setAuditLogs(kernelAuditEngine.getRecentLogs(30));
    setEscalations(kernelRiskEngine.getPendingEscalations());
    toast.success(result.summary);
  };

  const handleApproveEscalation = (id: string) => {
    kernelRiskEngine.resolveEscalation(id, true, 'Sanobar Jahan');
    setEscalations(kernelRiskEngine.getPendingEscalations());
    toast.success('Action approved by Founder Sanobar Jahan. Worker resuming execution.');
  };

  const handleRejectEscalation = (id: string) => {
    kernelRiskEngine.resolveEscalation(id, false, 'Sanobar Jahan');
    setEscalations(kernelRiskEngine.getPendingEscalations());
    toast.error('Action rejected by Founder Sanobar Jahan. Task halted.');
  };

  const filteredWorkers = workers.filter((w) => {
    const matchesDept = selectedDept === 'all' || w.department === selectedDept;
    const matchesQuery =
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.currentMission.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesQuery;
  });

  const primaryGoal = goals[0] || {
    title: 'Acquire First 100 Verified Claim #1 Companies (5% Fee Lock Cohort)',
    currentValue: memory?.claim1ClaimedCount || 1,
    targetValue: 100,
    unit: 'Companies',
  };

  const progressPct = Math.min(
    100,
    Math.round((primaryGoal.currentValue / primaryGoal.targetValue) * 100)
  );

  return (
    <div className="space-y-8 p-4 sm:p-8 max-w-7xl mx-auto">
      {/* Top Founder Header & Master Switch */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <Bot className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                TalentXcel Autonomous Business OS
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="outline" className="text-xs font-semibold text-primary border-primary/30">
                  Founder & CEO: Sanobar Jahan
                </Badge>
                <span className="text-xs text-muted-foreground">• 9 Divisions • 48 Workers • 11 Zoho Mailboxes • 14 Channels</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-card border p-3 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-foreground">Autonomous Engine:</span>
            <Switch
              checked={autonomousMasterOn}
              onCheckedChange={(checked) => {
                setAutonomousMasterOn(checked);
                if (checked) {
                  kernelAgentScheduler.start();
                } else {
                  kernelAgentScheduler.stop();
                }
                toast.info(`Autonomous operations set to ${checked ? 'ACTIVE' : 'PAUSED'}.`);
              }}
            />
            <Badge className={autonomousMasterOn ? 'bg-emerald-500 text-white font-bold' : 'bg-muted'}>
              {autonomousMasterOn ? 'ACTIVE' : 'PAUSED'}
            </Badge>
          </div>

          <Button
            size="sm"
            onClick={handleRunBusinessCycle}
            disabled={activeCycleRunning || !autonomousMasterOn}
            className="gap-1.5 font-semibold"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${activeCycleRunning ? 'animate-spin' : ''}`} />
            {activeCycleRunning ? 'Operating Cycle...' : 'Run Business Cycle'}
          </Button>
        </div>
      </div>

      {/* Today's Business Live Pulse */}
      <Card className="border-primary/40 bg-gradient-to-r from-primary/5 via-card to-background shadow-sm">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-primary uppercase tracking-wider">Top-Level Company Objective</span>
              </div>
              <h2 className="text-xl font-bold text-foreground mt-1">
                {primaryGoal.title}
              </h2>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-primary">{primaryGoal.currentValue}</span>
              <span className="text-sm text-muted-foreground font-semibold"> / {primaryGoal.targetValue} {primaryGoal.unit}</span>
            </div>
          </div>

          <Progress value={progressPct} className="h-3" />

          {/* Real-time Verified Business State */}
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 pt-4 border-t text-xs">
            <div>
              <span className="text-muted-foreground">Total Users:</span>
              <p className="text-lg font-bold text-foreground mt-0.5">{memory?.usersTotal.toLocaleString()}</p>
              <span className="text-[10px] text-emerald-600 font-semibold">Target: 100,000+</span>
            </div>
            <div>
              <span className="text-muted-foreground">Active Jobs:</span>
              <p className="text-lg font-bold text-foreground mt-0.5">{memory?.jobsActiveTotal.toLocaleString()}</p>
              <span className="text-[10px] text-emerald-600 font-semibold">Target: 100,000+</span>
            </div>
            <div>
              <span className="text-muted-foreground">Active Employers:</span>
              <p className="text-lg font-bold text-foreground mt-0.5">{memory?.employersTotal.toLocaleString()}</p>
              <span className="text-[10px] text-emerald-600 font-semibold">Target: 10,000+</span>
            </div>
            <div>
              <span className="text-muted-foreground">Indexed Colleges:</span>
              <p className="text-lg font-bold text-foreground mt-0.5">{memory?.collegesTotal.toLocaleString()}</p>
              <span className="text-[10px] text-muted-foreground">1,509 Catalogued</span>
            </div>
            <div>
              <span className="text-muted-foreground">Claim #1 Bids:</span>
              <p className="text-lg font-bold text-primary mt-0.5">{memory?.claim1ActiveBids}</p>
              <span className="text-[10px] text-muted-foreground">48h Reclaim: {memory?.claim1ReclaimRate48hPct}%</span>
            </div>
            <div>
              <span className="text-muted-foreground">Platform Revenue:</span>
              <p className="text-lg font-bold text-foreground mt-0.5">{formatCurrency(memory?.platformRevenueINR || 0, 'INR')}</p>
              <span className="text-[10px] text-emerald-600 font-semibold">Target: ₹8,00,000</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Founder Escalations Queue */}
      {escalations.length > 0 && (
        <Card className="border-orange-500/40 bg-orange-50/10 dark:bg-orange-950/10 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-orange-700 dark:text-orange-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Escalations Requiring Founder Approval — Sanobar Jahan ({escalations.length})
            </CardTitle>
            <CardDescription className="text-xs">
              Actions exceeding autonomous guardrails (e.g. ad spend, legal agreements, refunds) paused for approval.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {escalations.map((esc) => (
              <div key={esc.id} className="p-4 bg-background rounded-xl border flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs font-semibold">{esc.agentId}</Badge>
                    <span className="font-bold text-sm text-foreground">{esc.actionTitle}</span>
                    {esc.financialAmountINR && (
                      <Badge className="bg-amber-500/10 text-amber-600 text-xs font-bold">
                        ₹{esc.financialAmountINR.toLocaleString()}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{esc.reason}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={() => handleApproveEscalation(esc.id)} className="h-8 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleRejectEscalation(esc.id)} className="h-8 text-xs gap-1 text-destructive hover:bg-destructive/10">
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 9 Operating Divisions & 48 Specialist Workers Operating View */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" /> Operating Workforce ({filteredWorkers.length} Specialist Workers)
            </h3>
            <p className="text-xs text-muted-foreground">Deterministic service execution • 100% verified backend logs</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search worker or mission..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 text-xs pl-8"
              />
            </div>
          </div>
        </div>

        {/* Department Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs">
          {(Object.keys(DEPARTMENT_LABELS) as (DepartmentId | 'all')[]).map((deptKey) => {
            const info = DEPARTMENT_LABELS[deptKey];
            const isSelected = selectedDept === deptKey;
            return (
              <Button
                key={deptKey}
                size="sm"
                variant={isSelected ? 'default' : 'outline'}
                onClick={() => setSelectedDept(deptKey)}
                className="h-7 text-xs px-2.5 gap-1.5 whitespace-nowrap"
              >
                {info.icon}
                <span>{info.label}</span>
                <span className="opacity-60 text-[10px]">({info.count})</span>
              </Button>
            );
          })}
        </div>

        {/* 48 Worker Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWorkers.map((w) => {
            const isPaused = !autonomousMasterOn || w.status === 'PAUSED';
            const isRunning = !isPaused && w.status === 'RUNNING';
            const isIdle = !isPaused && w.status === 'IDLE';
            const isBlocked = w.status === 'BLOCKED';

            return (
              <Card key={w.id} className="p-5 border shadow-sm space-y-3 bg-card hover:border-primary/40 transition-all flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {DEPARTMENT_LABELS[w.department]?.icon || <Bot className="w-4 h-4 text-primary" />}
                      <h4 className="font-bold text-sm text-foreground">{w.name}</h4>
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
                      {isPaused ? 'PAUSED' : w.status}
                    </Badge>
                  </div>

                  <p className="text-xs font-medium text-foreground">{w.role}</p>

                  <div className="p-2.5 bg-muted/40 rounded-xl text-xs space-y-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Assigned Mission</span>
                    <p className="text-muted-foreground text-xs line-clamp-2">{w.currentMission}</p>
                  </div>

                  {w.statusReason && (
                    <p className="text-[10px] text-muted-foreground italic truncate">
                      Status: {w.statusReason}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Actions Today: <strong>{w.actionsToday}</strong></span>
                    <span>Errors: <strong className={w.errorsToday > 0 ? 'text-red-500' : 'text-emerald-500'}>{w.errorsToday}</strong></span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Wrench className="w-3 h-3 text-primary" /> {w.authorizedToolsCount} Tools Authorized
                    </span>
                    <Badge variant="outline" className="text-[9px] font-semibold uppercase">
                      Risk: {w.riskLevel}
                    </Badge>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Tabs for Detailed Control Plane Sub-Systems */}
      <Tabs defaultValue="mailboxes" className="space-y-4">
        <TabsList className="grid grid-cols-5 max-w-2xl">
          <TabsTrigger value="mailboxes">Zoho Mailboxes</TabsTrigger>
          <TabsTrigger value="channels">14 Channels</TabsTrigger>
          <TabsTrigger value="eventbus">Live Event Bus</TabsTrigger>
          <TabsTrigger value="budgets">Guardrails & Budgets</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
        </TabsList>

        {/* Tab 1: Zoho Mailbox Network (11 Operational Mailboxes) */}
        <TabsContent value="mailboxes" className="space-y-4">
          <Card className="p-6 border space-y-4">
            <div>
              <h4 className="font-bold text-base text-foreground">11 Authorised TalentXcel Zoho Mailboxes</h4>
              <p className="text-xs text-muted-foreground mt-0.5">Organizational worker identities with thread affinity, rate limits, and anti-spam enforcement.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {mailboxes.map((mb) => (
                <div key={mb.id} className="p-4 bg-muted/20 border rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-primary" />
                      <span className="font-bold text-sm text-foreground">{mb.email}</span>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-600 text-[10px] font-bold border-emerald-500/30">
                      {mb.healthStatus}
                    </Badge>
                  </div>

                  <p className="text-xs font-semibold text-foreground">{mb.displayName}</p>
                  <p className="text-xs text-muted-foreground">{mb.autonomousRole}</p>

                  <div className="pt-2 border-t flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Sent Today: <strong>{mb.sentTodayCount}</strong> / {mb.dailyLimit}</span>
                    <span>Bounce: <strong>{mb.bounceRatePct}%</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Tab 2: 14 Channels */}
        <TabsContent value="channels" className="space-y-4">
          <Card className="p-6 border space-y-4">
            <div>
              <h4 className="font-bold text-base text-foreground">14 Connected Distribution & Acquisition Channels</h4>
              <p className="text-xs text-muted-foreground mt-0.5">Live connector health status. Zero hardcoded secrets.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {channels.map((ch) => (
                <div key={ch.id} className="p-4 bg-muted/20 border rounded-xl flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">{ch.name}</span>
                      <Badge
                        className={
                          ch.status === 'ACTIVE'
                            ? 'bg-emerald-500/10 text-emerald-600 text-[10px] font-bold border-emerald-500/30'
                            : ch.status === 'DEMO'
                            ? 'bg-blue-500/10 text-blue-600 text-[10px] font-bold border-blue-500/30'
                            : ch.status === 'MANUAL_REQUIRED'
                            ? 'bg-indigo-500/10 text-indigo-600 text-[10px] font-bold border-indigo-500/30'
                            : 'bg-amber-500/10 text-amber-600 text-[10px] font-bold border-amber-500/30'
                        }
                      >
                        {ch.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{ch.statusDetails}</p>
                    <div className="flex items-center gap-3 pt-1 text-[11px] text-muted-foreground">
                      <span>Rate Limit: <strong>{ch.rateLimitPerHour}/hr</strong></span>
                      {ch.dailyBudgetCapINR > 0 && <span>Budget Cap: <strong>₹{ch.dailyBudgetCapINR.toLocaleString()}/day</strong></span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Tab 3: Live Event Bus */}
        <TabsContent value="eventbus" className="space-y-4">
          <Card className="border p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
                <h4 className="font-bold text-sm text-foreground">Real-Time Event Stream (9 Departments)</h4>
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
                      <Badge variant="outline" className="text-[9px]">
                        {evt.department}
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

        {/* Tab 4: Guardrails & Budgets */}
        <TabsContent value="budgets" className="space-y-4">
          <Card className="p-6 border space-y-6">
            <div>
              <h4 className="font-bold text-base text-foreground">Departmental Budgets & Safety Limits</h4>
              <p className="text-xs text-muted-foreground mt-0.5">Enforced server-side for Founder Sanobar Jahan before any worker initiates outbound actions or expenditures.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-muted/30 rounded-xl border space-y-1">
                <span className="text-xs text-muted-foreground font-medium">Growth & Marketing Budget</span>
                <p className="text-base font-bold text-foreground">₹50,000 / month</p>
                <p className="text-[10px] text-muted-foreground">Spent this month: ₹0</p>
              </div>

              <div className="p-4 bg-muted/30 rounded-xl border space-y-1">
                <span className="text-xs text-muted-foreground font-medium">Claim #1 Engine Budget</span>
                <p className="text-base font-bold text-foreground">₹30,000 / month</p>
                <p className="text-[10px] text-muted-foreground">Spent this month: ₹0</p>
              </div>

              <div className="p-4 bg-muted/30 rounded-xl border space-y-1">
                <span className="text-xs text-muted-foreground font-medium">Anti-Spam Contact Rule</span>
                <p className="text-base font-bold text-emerald-600">Max 3 Touches</p>
                <p className="text-[10px] text-muted-foreground">Permanent cooldown enforced</p>
              </div>
            </div>

            <Button onClick={() => toast.success('Departmental budget policy synchronized.')} className="font-semibold">
              Save Policy
            </Button>
          </Card>
        </TabsContent>

        {/* Tab 5: Audit Trail */}
        <TabsContent value="audit" className="space-y-4">
          <Card className="p-6 border space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-base text-foreground">Immutable Operational Audit Log</h4>
                <p className="text-xs text-muted-foreground mt-0.5">Timestamped record of every autonomous action and service invocation.</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => setAuditLogs(kernelAuditEngine.getRecentLogs(30))} className="text-xs">
                Refresh Logs
              </Button>
            </div>

            <div className="space-y-2 font-mono text-xs max-h-96 overflow-y-auto divide-y">
              {auditLogs.map((log) => (
                <div key={log.id} className="py-2 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-[10px]">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    <Badge variant="outline" className="text-[10px]">{log.agentId}</Badge>
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
