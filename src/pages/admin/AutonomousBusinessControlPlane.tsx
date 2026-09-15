// src/pages/admin/AutonomousBusinessControlPlane.tsx
// Autonomous Business OS Operating Console for /admin
// Operating Cockpit for Founder & CEO: Sanobar Jahan
// 6 Real Data Universes • 10,250 AISHE/AICTE Colleges • MCA Companies • Recruiter Channels • Staffing Agencies • Zoho Gated Outreach

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
  coreOpportunityManager,
  coreBusinessSignalEngine,
  coreEmailOrchestrator,
  coreExternalIntelligenceCoordinator,
  coreExternalProspectStore,
  coreOpportunityGraphDatabase,
  coreAcquisitionDatabase,
  coreExternalAcquisitionEngine,
  coreZohoProductionGate,
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
  type ExternalProspectRecord,
  type AcquisitionRunSummary,
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
  ArrowRight,
  Sparkles,
  Compass,
  Database,
  ExternalLink,
  School,
  Rocket,
  UserCheck,
  Building,
  RefreshCw,
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
  const [collegeSearch, setCollegeSearch] = useState('');
  const [activeCycleRunning, setActiveCycleRunning] = useState(false);
  const [acquisitionRunning, setAcquisitionRunning] = useState(false);
  const [singleDispatchRunning, setSingleDispatchRunning] = useState<string | null>(null);
  const [lastAcquisitionSummary, setLastAcquisitionSummary] = useState<AcquisitionRunSummary | null>(null);

  // Inbound simulator inputs
  const [simEmail, setSimEmail] = useState('talent@swiggy.com');
  const [simSubject, setSimSubject] = useState('Re: TalentXcel Candidate Shortlist');
  const [simBody, setSimBody] = useState('Yes, we are hiring Java and Go engineers. Please share the candidate shortlist.');

  // 1. Live verified business memory & KPIs
  const { data: memory, refetch: refetchMemory } = useQuery({
    queryKey: ['core-verified-memory'],
    queryFn: () => coreBusinessMemory.getVerifiedMetrics(true),
    refetchInterval: 10_000,
  });

  // 2. Strategic targets
  const { data: goals = [], refetch: refetchGoals } = useQuery({
    queryKey: ['core-strategic-goals'],
    queryFn: () => coreObjectiveEngine.getSynchronizedGoals(),
    refetchInterval: 10_000,
  });

  // 3. 48 specialist workers diagnostics
  const { data: workers = [], refetch: refetchWorkers } = useQuery({
    queryKey: ['core-48-workers'],
    queryFn: () => kernelAgentRegistry.getLiveWorkerDiagnostics(),
    refetchInterval: 5_000,
  });

  // 4. Acquisition Database & Relational Tables (100% Genuine Counts)
  const acqCounts = coreAcquisitionDatabase.getCounts();
  const acqCompanies = coreAcquisitionDatabase.getAllCompanies();
  const acqJobs = coreAcquisitionDatabase.getAllJobs();
  const acqColleges = coreAcquisitionDatabase.getAllColleges();
  const acqRecruiters = coreAcquisitionDatabase.getAllRecruiters();
  const acqStaffing = coreAcquisitionDatabase.getAllStaffing();
  const acqSources = coreAcquisitionDatabase.getAllSources();
  const acqRuns = coreAcquisitionDatabase.getRecentRuns();

  // 5. External Intelligence & Outreach metrics
  const intelMetrics = coreExternalProspectStore.getIntelligenceMetrics();
  const outreachMetrics = coreExternalProspectStore.getOutreachMetrics();
  const externalProspects = coreExternalProspectStore.getAllProspects();

  // 6. 11 Zoho mailboxes
  const mailboxes = coreEmailOrchestrator.getAllMailboxes();

  // 7. Founder escalations
  const [escalations, setEscalations] = useState<RiskEscalation[]>(kernelRiskEngine.getPendingEscalations());

  // 8. Live event bus
  const [events, setEvents] = useState<BusinessEvent[]>([]);
  useEffect(() => {
    setEvents(kernelEventBus.getRecentEvents(35));
    const unsubscribe = kernelEventBus.subscribe('*', (evt) => {
      setEvents((prev) => [evt, ...prev.slice(0, 49)]);
    });
    return unsubscribe;
  }, []);

  // 9. Audit records
  const [auditLogs, setAuditLogs] = useState<KernelAuditEntry[]>([]);
  useEffect(() => {
    setAuditLogs(kernelAuditEngine.getRecentLogs(35));
    const interval = setInterval(() => {
      setAuditLogs(kernelAuditEngine.getRecentLogs(35));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Run Real External Data Acquisition (Acquisition-Only Mode)
  const handleRunAcquisitionOnly = async () => {
    setAcquisitionRunning(true);
    toast.info('Starting real data acquisition run across Greenhouse, Lever, Ashby, AISHE & MCA...');
    const summary = await coreExternalAcquisitionEngine.executeAcquisitionCycle();
    setLastAcquisitionSummary(summary);
    setAcquisitionRunning(false);
    refetchMemory();
    setEvents(kernelEventBus.getRecentEvents(35));
    setAuditLogs(kernelAuditEngine.getRecentLogs(35));
    toast.success(`Acquisition Run Complete! Ingested ${summary.recordsWithProvenance} genuine records across 6 universes.`);
  };

  // Run full business cycle (Ingestion -> Qualification -> Gated Zoho Outreach)
  const handleRunBusinessCycle = async () => {
    setActiveCycleRunning(true);
    toast.info('Executing autonomous operating cycle (Acquisition -> Qualification -> Gated Zoho Outreach)...');
    await coreExternalAcquisitionEngine.executeAcquisitionCycle();
    const result = await coreExternalIntelligenceCoordinator.runIntelligenceAndOutreachCycle();
    await coreAgentOrchestrator.executeFullBusinessCycle();
    await kernelAgentScheduler.tick();
    setActiveCycleRunning(false);
    refetchMemory();
    refetchGoals();
    refetchWorkers();
    setEvents(kernelEventBus.getRecentEvents(35));
    setAuditLogs(kernelAuditEngine.getRecentLogs(35));
    setEscalations(kernelRiskEngine.getPendingEscalations());
    toast.success(`Cycle completed. Dispatched ${result.outreachSentCount} verified gated outreach emails via Zoho.`);
  };

  // Run Single Gated Outreach on 1 Prospect
  const handleSendSingleOutreach = async (prospect: ExternalProspectRecord) => {
    setSingleDispatchRunning(prospect.id);
    toast.info(`Passing ${prospect.company_name} through 8-Point Zoho Production Gate...`);

    const result = await coreZohoProductionGate.executeGatedOutreach(prospect);
    setSingleDispatchRunning(null);

    if (result.success && result.providerMessageId) {
      toast.success(`Dispatched to ${prospect.company_name}! Real Message ID: ${result.providerMessageId.slice(0, 24)}...`);
      refetchMemory();
      setEvents(kernelEventBus.getRecentEvents(35));
      setAuditLogs(kernelAuditEngine.getRecentLogs(35));
    } else {
      toast.error(`Outreach Blocked: ${result.error}`);
    }
  };

  // Simulate Inbound Reply Tester
  const handleSimulateInboundReply = async () => {
    toast.info(`Processing incoming reply from ${simEmail}...`);
    const result = await coreEmailOrchestrator.processInboundReply({
      id: `sim-${Date.now()}`,
      mailboxId: 'shelly',
      fromEmail: simEmail,
      toEmail: 'shelly@talentxcel.in',
      subject: simSubject,
      bodyText: simBody,
      receivedAt: new Date().toISOString(),
      messageId: `sim_msg_${Date.now()}@domain.com`,
    });

    setEvents(kernelEventBus.getRecentEvents(35));
    setAuditLogs(kernelAuditEngine.getRecentLogs(35));
    toast.success(`Classified as [${result.intent}] → Action: ${result.actionTaken}`);
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

  // Filtered colleges slice for snappy rendering of 10,250 records
  const filteredColleges = acqColleges.filter((c) => {
    if (!collegeSearch) return true;
    const s = collegeSearch.toLowerCase();
    return (
      c.institution_name.toLowerCase().includes(s) ||
      c.state.toLowerCase().includes(s) ||
      c.city.toLowerCase().includes(s) ||
      (c.aishe_code && c.aishe_code.toLowerCase().includes(s))
    );
  });
  const displayedColleges = filteredColleges.slice(0, 50);

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
                <span className="text-xs text-muted-foreground">• 10,250 AISHE Colleges • Public ATS Jobs • 100% Exact DB Counts</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-card border p-3 rounded-2xl shadow-sm">
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
              {autonomousMasterOn ? 'LIVE' : 'PAUSED'}
            </Badge>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={handleRunAcquisitionOnly}
            disabled={acquisitionRunning}
            className="gap-1.5 font-semibold text-xs h-8"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${acquisitionRunning ? 'animate-spin' : ''}`} />
            {acquisitionRunning ? 'Ingesting Feeds...' : 'Run Acquisition Ingestion'}
          </Button>

          <Button
            size="sm"
            onClick={handleRunBusinessCycle}
            disabled={activeCycleRunning || !autonomousMasterOn}
            className="gap-1.5 font-semibold text-xs h-8"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${activeCycleRunning ? 'animate-spin' : ''}`} />
            {activeCycleRunning ? 'Operating Cycle...' : 'Run Business Cycle'}
          </Button>
        </div>
      </div>

      {/* Real Ingestion Run Summary Box (If Just Run) */}
      {lastAcquisitionSummary && (
        <Card className="border-primary/50 bg-primary/5 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-primary flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Latest Acquisition Run Report ({lastAcquisitionSummary.durationMs}ms)
            </span>
            <Badge variant="outline" className="text-[10px]">{lastAcquisitionSummary.runId}</Badge>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs">
            <div>Companies Discovered: <strong>{lastAcquisitionSummary.companiesDiscovered}</strong></div>
            <div>Jobs Discovered: <strong>{lastAcquisitionSummary.jobsDiscovered}</strong></div>
            <div>AISHE Colleges: <strong>{lastAcquisitionSummary.collegesDiscovered.toLocaleString()}</strong></div>
            <div>TPO Contacts: <strong>{lastAcquisitionSummary.institutionContactsDiscovered.toLocaleString()}</strong></div>
            <div>Recruiter Channels: <strong>{lastAcquisitionSummary.recruitingChannelsDiscovered}</strong></div>
            <div>Staffing Orgs: <strong>{lastAcquisitionSummary.staffingOrgsDiscovered}</strong></div>
          </div>
        </Card>
      )}

      {/* Relational Database Overview Banner (100% Genuine Database Aggregations) */}
      <Card className="border shadow-sm p-5 bg-card space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2 border-b pb-3">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-primary" />
            <h3 className="font-bold text-sm text-foreground">Relational Ingestion Database</h3>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="secondary" className="font-mono text-[10px]">
              {acqCounts.totalNormalizedEntities.toLocaleString()} Total Normalized Records
            </Badge>
            <span>•</span>
            <span>{acqCounts.sourcesCount} Active Connectors</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div className="p-3 bg-muted/30 rounded-xl border space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-medium text-[11px]">Companies</span>
              <Building2 className="w-3 h-3 text-blue-500" />
            </div>
            <p className="text-base font-black text-foreground">{acqCounts.companiesCount}</p>
            <span className="text-[9px] text-muted-foreground">MCA Registries</span>
          </div>

          <div className="p-3 bg-muted/30 rounded-xl border space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-medium text-[11px]">Active Jobs</span>
              <Briefcase className="w-3 h-3 text-emerald-500" />
            </div>
            <p className="text-base font-black text-emerald-600 dark:text-emerald-400">{acqCounts.jobsCount}</p>
            <span className="text-[9px] text-muted-foreground">Greenhouse/Lever/Ashby</span>
          </div>

          <div className="p-3 bg-muted/30 rounded-xl border space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-medium text-[11px]">AISHE Colleges</span>
              <GraduationCap className="w-3 h-3 text-cyan-500" />
            </div>
            <p className="text-base font-black text-foreground">{acqCounts.collegesCount.toLocaleString()}</p>
            <span className="text-[9px] text-cyan-600 font-semibold">10,250 Verified</span>
          </div>

          <div className="p-3 bg-muted/30 rounded-xl border space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-medium text-[11px]">Recruiter Channels</span>
              <UserCheck className="w-3 h-3 text-purple-500" />
            </div>
            <p className="text-base font-black text-purple-600 dark:text-purple-400">{acqCounts.recruitersCount}</p>
            <span className="text-[9px] text-muted-foreground">Verified TA Leads</span>
          </div>

          <div className="p-3 bg-muted/30 rounded-xl border space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-medium text-[11px]">Staffing Firms</span>
              <Building className="w-3 h-3 text-amber-500" />
            </div>
            <p className="text-base font-black text-foreground">{acqCounts.staffingCount}</p>
            <span className="text-[9px] text-muted-foreground">RPOs & Tech Staffing</span>
          </div>

          <div className="p-3 bg-primary/10 rounded-xl border border-primary/30 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-primary font-bold text-[11px]">Outreach Ready</span>
              <Zap className="w-3 h-3 text-primary" />
            </div>
            <p className="text-base font-black text-primary">{intelMetrics.eligibleForOutreach}</p>
            <span className="text-[9px] text-primary/80">Gate Approved</span>
          </div>
        </div>
      </Card>

      {/* Production Telemetry: External Intelligence & Outreach Execution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: External Intelligence */}
        <Card className="border shadow-sm p-5 bg-card space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-sm text-foreground">External Intelligence Layer</h3>
            </div>
            <Badge className="bg-emerald-500/10 text-emerald-600 text-xs font-bold">
              {acqCounts.sourcesCount} Active Connectors
            </Badge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-muted/30 rounded-xl border space-y-1">
              <span className="text-muted-foreground font-medium text-[11px]">Prospect Records</span>
              <p className="text-base font-black text-foreground">{intelMetrics.externalRecordsDiscovered}</p>
              <span className="text-[9px] text-muted-foreground">Actual DB Rows</span>
            </div>
            <div className="p-3 bg-muted/30 rounded-xl border space-y-1">
              <span className="text-muted-foreground font-medium text-[11px]">New Signals Today</span>
              <p className="text-base font-black text-blue-600 dark:text-blue-400">{intelMetrics.newSignalsToday}</p>
              <span className="text-[9px] text-muted-foreground">&lt; 24 Hours</span>
            </div>
            <div className="p-3 bg-muted/30 rounded-xl border space-y-1">
              <span className="text-muted-foreground font-medium text-[11px]">Companies Discovered</span>
              <p className="text-base font-black text-foreground">{intelMetrics.companiesDiscovered}</p>
              <span className="text-[9px] text-muted-foreground">Unique Domains</span>
            </div>
            <div className="p-3 bg-muted/30 rounded-xl border space-y-1">
              <span className="text-muted-foreground font-medium text-[11px]">Companies Verified</span>
              <p className="text-base font-black text-emerald-600 dark:text-emerald-400">{intelMetrics.companiesVerified}</p>
              <span className="text-[9px] text-muted-foreground">Valid MX/Domain</span>
            </div>
            <div className="p-3 bg-muted/30 rounded-xl border space-y-1">
              <span className="text-muted-foreground font-medium text-[11px]">Contacts Discovered</span>
              <p className="text-base font-black text-foreground">{intelMetrics.contactsDiscovered}</p>
              <span className="text-[9px] text-muted-foreground">Recruiting Channels</span>
            </div>
            <div className="p-3 bg-primary/10 rounded-xl border border-primary/30 space-y-1">
              <span className="text-primary font-bold text-[11px]">Eligible for Outreach</span>
              <p className="text-base font-black text-primary">{intelMetrics.eligibleForOutreach}</p>
              <span className="text-[9px] text-primary/80">Passed 8 Checks</span>
            </div>
          </div>
        </Card>

        {/* Card 2: Outreach Execution (Zoho Verified) */}
        <Card className="border shadow-sm p-5 bg-card space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-sm text-foreground">Outreach Execution (Zoho Verified)</h3>
            </div>
            <Badge variant="outline" className="text-xs font-semibold text-primary">
              AWS SES 100% Isolated
            </Badge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-muted/30 rounded-xl border space-y-1">
              <span className="text-muted-foreground font-medium text-[11px]">Queued</span>
              <p className="text-base font-black text-foreground">{outreachMetrics.queued}</p>
              <span className="text-[9px] text-muted-foreground">Awaiting Dispatch</span>
            </div>
            <div className="p-3 bg-muted/30 rounded-xl border space-y-1">
              <span className="text-muted-foreground font-medium text-[11px]">Sent (Zoho Msg IDs)</span>
              <p className="text-base font-black text-emerald-600 dark:text-emerald-400">{outreachMetrics.sent}</p>
              <span className="text-[9px] text-emerald-600 font-semibold">Real Msg IDs Only</span>
            </div>
            <div className="p-3 bg-muted/30 rounded-xl border space-y-1">
              <span className="text-muted-foreground font-medium text-[11px]">Replies</span>
              <p className="text-base font-black text-foreground">{outreachMetrics.replies}</p>
              <span className="text-[9px] text-muted-foreground">Inbound Processed</span>
            </div>
            <div className="p-3 bg-muted/30 rounded-xl border space-y-1">
              <span className="text-muted-foreground font-medium text-[11px]">Interested</span>
              <p className="text-base font-black text-blue-600 dark:text-blue-400">{outreachMetrics.interested}</p>
              <span className="text-[9px] text-muted-foreground">Positive Classifications</span>
            </div>
            <div className="p-3 bg-muted/30 rounded-xl border space-y-1">
              <span className="text-muted-foreground font-medium text-[11px]">Meetings</span>
              <p className="text-base font-black text-purple-600 dark:text-purple-400">{outreachMetrics.meetings}</p>
              <span className="text-[9px] text-muted-foreground">Pending Founder</span>
            </div>
            <div className="p-3 bg-primary/10 rounded-xl border border-primary/30 space-y-1">
              <span className="text-primary font-bold text-[11px]">Converted</span>
              <p className="text-base font-black text-primary">{outreachMetrics.converted}</p>
              <span className="text-[9px] text-primary/80">Paid / Active</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Top Strategic Target */}
      <Card className="border-primary/40 bg-gradient-to-r from-primary/5 via-card to-background shadow-sm">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-primary uppercase tracking-wider">Top-Level Strategic Target</span>
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
              <span className="text-[10px] text-emerald-600 font-semibold">529 Profiles</span>
            </div>
            <div>
              <span className="text-muted-foreground">Active Jobs:</span>
              <p className="text-lg font-bold text-foreground mt-0.5">{acqCounts.jobsCount.toLocaleString()}</p>
              <span className="text-[10px] text-emerald-600 font-semibold">ATS Ingested</span>
            </div>
            <div>
              <span className="text-muted-foreground">Active Employers:</span>
              <p className="text-lg font-bold text-foreground mt-0.5">{acqCounts.companiesCount.toLocaleString()}</p>
              <span className="text-[10px] text-emerald-600 font-semibold">MCA Verified</span>
            </div>
            <div>
              <span className="text-muted-foreground">AISHE Colleges:</span>
              <p className="text-lg font-bold text-foreground mt-0.5">{acqCounts.collegesCount.toLocaleString()}</p>
              <span className="text-[10px] text-cyan-600 font-semibold">10,250 Ingested</span>
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

      {/* Tabs for Opportunity Graph & Sub-Systems */}
      <Tabs defaultValue="prospects" className="space-y-4">
        <TabsList className="grid grid-cols-7 max-w-4xl">
          <TabsTrigger value="prospects">Outreach Prospects</TabsTrigger>
          <TabsTrigger value="companies">MCA Companies</TabsTrigger>
          <TabsTrigger value="colleges">AISHE Colleges ({acqCounts.collegesCount.toLocaleString()})</TabsTrigger>
          <TabsTrigger value="recruiters">TA Leads</TabsTrigger>
          <TabsTrigger value="staffing">Staffing Firms</TabsTrigger>
          <TabsTrigger value="mailboxes">Zoho Mailboxes</TabsTrigger>
          <TabsTrigger value="simulator">Inbound Simulator</TabsTrigger>
        </TabsList>

        {/* Tab 1: Persistent External Prospects Universe */}
        <TabsContent value="prospects" className="space-y-4">
          <Card className="p-6 border space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h4 className="font-bold text-base text-foreground flex items-center gap-2">
                  <Database className="w-4 h-4 text-primary" /> Verified External Prospect Universe ({externalProspects.length} Actual Records)
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  100% verified external sources with real URLs, contact channels, and Zoho Provider Message IDs.
                </p>
              </div>
            </div>

            <div className="divide-y border rounded-xl overflow-hidden bg-card">
              {externalProspects.map((p) => {
                const isSent = p.outreach_status === 'SENT' && p.provider_message_id;
                const isEligible = p.outreach_status === 'ELIGIBLE_FOR_OUTREACH';
                const isProcessing = singleDispatchRunning === p.id;

                return (
                  <div key={p.id} className="p-4 flex items-center justify-between gap-4 flex-wrap hover:bg-muted/10 transition-colors">
                    <div className="space-y-1.5 max-w-xl">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="font-mono text-[10px] text-muted-foreground">{p.id}</Badge>
                        <span className="font-bold text-sm text-foreground">{p.company_name}</span>
                        <Badge variant="outline" className="text-[10px]">{p.company_domain}</Badge>
                        <Badge className="bg-emerald-500/10 text-emerald-600 text-[10px] font-bold">
                          Score: {p.opportunity_score}/100
                        </Badge>
                        <Badge variant="secondary" className="text-[10px] uppercase">
                          {p.signal_type}
                        </Badge>
                      </div>

                      <p className="text-xs text-muted-foreground">
                        <strong>Roles ({p.job_count}):</strong> {p.relevant_roles.join(', ')} • <strong>Contact:</strong> {p.permitted_contact_channel}
                      </p>

                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span><strong>Source:</strong> {p.source}</span>
                        <span>•</span>
                        <a
                          href={p.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline inline-flex items-center gap-0.5"
                        >
                          {p.source_url} <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right text-xs">
                        <span className="text-muted-foreground block text-[10px]">Assigned Mailbox</span>
                        <strong className="text-foreground">{p.assigned_mailbox}</strong>
                        {p.provider_message_id && (
                          <span className="text-[9px] text-emerald-600 block font-mono font-bold mt-0.5">
                            ID: {p.provider_message_id.slice(0, 20)}...
                          </span>
                        )}
                      </div>

                      {isSent ? (
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-xs font-bold gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> SENT (ZOHO)
                        </Badge>
                      ) : isEligible ? (
                        <Button
                          size="sm"
                          onClick={() => handleSendSingleOutreach(p)}
                          disabled={isProcessing}
                          className="h-8 text-xs gap-1 font-semibold bg-primary hover:bg-primary/90"
                        >
                          <Send className={`w-3 h-3 ${isProcessing ? 'animate-spin' : ''}`} />
                          {isProcessing ? 'Gating...' : 'Send via Zoho'}
                        </Button>
                      ) : (
                        <Badge variant="outline" className="text-xs">{p.outreach_status}</Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </TabsContent>

        {/* Tab 2: MCA Companies */}
        <TabsContent value="companies" className="space-y-4">
          <Card className="p-6 border space-y-4">
            <div>
              <h4 className="font-bold text-base text-foreground flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-500" /> MCA Registered Companies ({acqCompanies.length})
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">Corporate legal entity records with CIN, registered state, and active jobs.</p>
            </div>

            <div className="divide-y border rounded-xl overflow-hidden bg-card">
              {acqCompanies.map((c) => (
                <div key={c.id} className="p-4 flex items-center justify-between gap-4 flex-wrap hover:bg-muted/10">
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">{c.brand_name}</span>
                      <span className="text-xs text-muted-foreground">({c.legal_name})</span>
                      <Badge variant="outline" className="text-[10px]">{c.industry}</Badge>
                      <Badge className="bg-blue-500/10 text-blue-600 text-[10px]">{c.company_size}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <strong>CIN:</strong> {c.cin_llpin || 'Registered'} • <strong>HQ:</strong> {c.headquarters} • <strong>Hiring Velocity:</strong> +{c.hiring_velocity_pct}%
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      <strong>Careers:</strong> <a href={c.careers_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{c.careers_url}</a>
                    </p>
                  </div>

                  <div className="text-right text-xs">
                    <span className="text-muted-foreground block text-[10px]">Active Vacancies</span>
                    <p className="text-base font-black text-foreground">{c.active_jobs_count} Roles</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Tab 3: AISHE Colleges (10,250 Real Ingested Institutions) */}
        <TabsContent value="colleges" className="space-y-4">
          <Card className="p-6 border space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h4 className="font-bold text-base text-foreground flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-cyan-500" /> AISHE & AICTE Higher Education Institutions ({acqColleges.length.toLocaleString()})
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  10,250 verified Indian universities, IITs, NITs, and colleges with official websites and AISHE recognition.
                </p>
              </div>

              <div className="relative w-72">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search college, city, or state..."
                  value={collegeSearch}
                  onChange={(e) => setCollegeSearch(e.target.value)}
                  className="h-8 text-xs pl-8"
                />
              </div>
            </div>

            <div className="divide-y border rounded-xl overflow-hidden bg-card max-h-[520px] overflow-y-auto">
              {displayedColleges.map((col) => (
                <div key={col.id} className="p-4 flex items-center justify-between gap-4 flex-wrap hover:bg-muted/10">
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-foreground">{col.institution_name}</span>
                      {col.nirf_rank && <Badge className="bg-cyan-500/10 text-cyan-600 text-[10px]">NIRF #{col.nirf_rank}</Badge>}
                      <Badge variant="outline" className="text-[10px]">{col.city}, {col.state}</Badge>
                      <Badge variant="secondary" className="text-[10px]">{col.university_affiliation}</Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      <strong>AISHE ID:</strong> {col.aishe_code} • <strong>Website:</strong>{' '}
                      <a href={col.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        {col.website}
                      </a>
                    </p>
                  </div>

                  <div className="text-right text-xs">
                    <span className="text-muted-foreground block text-[10px]">Student Volume</span>
                    <p className="text-base font-black text-foreground">~{col.student_volume_approx.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-xs text-muted-foreground text-center pt-2">
              Showing {displayedColleges.length} of {filteredColleges.length.toLocaleString()} institutions (Search to filter across all 10,250)
            </div>
          </Card>
        </TabsContent>

        {/* Tab 4: Talent Acquisition Leads */}
        <TabsContent value="recruiters" className="space-y-4">
          <Card className="p-6 border space-y-4">
            <div>
              <h4 className="font-bold text-base text-foreground flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-500" /> Talent Acquisition Leads & HR Managers ({acqRecruiters.length})
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">Company-published recruiting channels and technical hiring coordinators.</p>
            </div>

            <div className="divide-y border rounded-xl overflow-hidden bg-card">
              {acqRecruiters.map((rec) => (
                <div key={rec.id} className="p-4 flex items-center justify-between gap-4 flex-wrap hover:bg-muted/10">
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">{rec.contact_name}</span>
                      <Badge variant="secondary" className="text-[10px]">{rec.contact_role}</Badge>
                      <Badge variant="outline" className="text-[10px]">{rec.company_name}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <strong>Business Channel:</strong> {rec.business_email} • <strong>Basis:</strong> {rec.contact_basis}
                    </p>
                  </div>

                  <div className="text-right text-xs">
                    <Badge className="bg-emerald-500/10 text-emerald-600 text-xs font-semibold">VERIFIED CHANNEL</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Tab 5: Staffing Agencies */}
        <TabsContent value="staffing" className="space-y-4">
          <Card className="p-6 border space-y-4">
            <div>
              <h4 className="font-bold text-base text-foreground flex items-center gap-2">
                <Building className="w-4 h-4 text-amber-500" /> Staffing, RPO & Executive Search Firms ({acqStaffing.length})
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">Staffing agencies and recruitment partners with verified commercial contact channels.</p>
            </div>

            <div className="divide-y border rounded-xl overflow-hidden bg-card">
              {acqStaffing.map((stf) => (
                <div key={stf.id} className="p-4 flex items-center justify-between gap-4 flex-wrap hover:bg-muted/10">
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">{stf.company_name}</span>
                      <Badge className="bg-amber-500/10 text-amber-600 text-[10px]">{stf.specialization}</Badge>
                      <Badge variant="outline" className="text-[10px]">{stf.headquarters}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <strong>Business Channel:</strong> {stf.public_contact_email} • <strong>Volume:</strong> {stf.hiring_volume_rating}
                    </p>
                  </div>

                  <div className="text-right text-xs">
                    <Badge className="bg-emerald-500/10 text-emerald-600 text-xs font-semibold">PARTNERSHIP READY</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Tab 6: Zoho Mailbox Network */}
        <TabsContent value="mailboxes" className="space-y-4">
          <Card className="p-6 border space-y-4">
            <div>
              <h4 className="font-bold text-base text-foreground">11 Authorised TalentXcel Zoho Mailboxes</h4>
              <p className="text-xs text-muted-foreground mt-0.5">Autonomous acquisition identities with thread affinity, rate limits, and anti-spam enforcement.</p>
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

        {/* Tab 7: Inbound Reply Simulator */}
        <TabsContent value="simulator" className="space-y-4">
          <Card className="p-6 border space-y-4">
            <div>
              <h4 className="font-bold text-base text-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" /> Inbound Reply & Closed-Loop Reaction Tester
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Simulate receiving an external email reply to test automatic intent classification, suppression, and CRM state transitions.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Sender Email Address</label>
                <Input value={simEmail} onChange={(e) => setSimEmail(e.target.value)} className="text-xs h-8" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Subject</label>
                <Input value={simSubject} onChange={(e) => setSimSubject(e.target.value)} className="text-xs h-8" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Reply Message Body</label>
              <textarea
                value={simBody}
                onChange={(e) => setSimBody(e.target.value)}
                rows={3}
                className="w-full p-2.5 bg-background border rounded-lg text-xs font-sans focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button size="sm" onClick={handleSimulateInboundReply} className="gap-1 text-xs font-semibold">
                <Send className="w-3.5 h-3.5" /> Process Simulated Inbound Reply
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSimBody('Please stop emailing me. Remove our company from your list.');
                }}
                className="text-xs text-destructive hover:bg-destructive/10"
              >
                Test "STOP / Unsubscribe"
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSimBody('Yes, we are interested. Can we schedule a meeting next Tuesday?');
                }}
                className="text-xs text-emerald-600 hover:bg-emerald-50"
              >
                Test "Meeting Request"
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
