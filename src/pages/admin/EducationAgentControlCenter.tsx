import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  GraduationCap, Award, Building2, ShieldCheck, RefreshCcw,
  AlertTriangle, Clock, Zap, CheckCircle2, XCircle, Eye,
  TrendingUp, Play, RotateCcw, Database, Activity, Sparkles,
  FileWarning, Globe, FlaskConical
} from 'lucide-react';
import { toast } from 'sonner';
import {
  runEducationIntelligenceCycle,
  getAgentRunHistory,
  getRecordsDueForVerification,
  getFreshnessLabel,
  computeFreshnessStatus,
  scoreConfidence,
  CONFIDENCE_THRESHOLDS,
  AGENT_VERSION,
} from '@/services/educationIntelligenceAgent';
import { SEED_PROGRAMS, SEED_SCHOLARSHIPS } from '@/services/globalEducationService';
import { supabase } from '@/integrations/supabase/client';
import type { GlobalProgram, GlobalScholarship } from '@/types/globalEducation';

// ─────────────────────────────────────────────────────────────────────────────
// LIVE STATS QUERY
// ─────────────────────────────────────────────────────────────────────────────

async function fetchAgentStats() {
  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const [
    { count: totalPrograms },
    { count: totalScholarships },
    { count: verifiedToday },
    { count: needsReview },
    { count: next24h },
  ] = await Promise.all([
    supabase.from('global_programs').select('id', { count: 'exact', head: true }),
    supabase.from('global_scholarships').select('id', { count: 'exact', head: true }),
    supabase.from('global_programs').select('id', { count: 'exact', head: true })
      .gte('last_verified_at', new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()),
    supabase.from('global_programs').select('id', { count: 'exact', head: true })
      .eq('verification_status', 'NEEDS_REVIEW'),
    supabase.from('global_programs').select('id', { count: 'exact', head: true })
      .lte('next_check_at', in24h.toISOString()),
  ]);

  // Fall back to seed data counts if DB tables not yet populated
  const programs = totalPrograms ?? SEED_PROGRAMS.length;
  const scholarships = totalScholarships ?? SEED_SCHOLARSHIPS.length;

  // Compute per-program confidence from seed data for the "proof of concept" view
  const seedVerified   = SEED_PROGRAMS.filter(p => scoreConfidence(p as Partial<GlobalProgram>).confidence >= CONFIDENCE_THRESHOLDS.AUTO_PUBLISH_MIN).length;
  const seedNeedsReview = SEED_PROGRAMS.length - seedVerified;
  const seedChanged    = 0; // No changes yet in v1

  return {
    totalPrograms: programs,
    totalScholarships: scholarships,
    totalInstitutions: [...new Set(SEED_PROGRAMS.map(p => p.institution_name))].length,
    verifiedToday: verifiedToday ?? seedVerified,
    changed: seedChanged,
    needsReview: needsReview ?? seedNeedsReview,
    failedFetch: 0,
    next24hChecks: next24h ?? SEED_PROGRAMS.filter(p => p.access_type === 'TUITION_FREE' || p.access_type === 'FULLY_FUNDED').length,
    newDiscoveries: 0,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function EducationAgentControlCenter() {
  const queryClient = useQueryClient();
  const [lastRunResult, setLastRunResult] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['education-agent-stats'],
    queryFn: fetchAgentStats,
    refetchInterval: 60_000, // refresh every minute
  });

  const { data: runHistory, isLoading: historyLoading } = useQuery({
    queryKey: ['education-agent-runs'],
    queryFn: () => getAgentRunHistory(5),
    refetchInterval: 30_000,
  });

  const { data: dueRecords } = useQuery({
    queryKey: ['education-agent-due'],
    queryFn: () => getRecordsDueForVerification(10),
  });

  // Confidence analysis of seeded programs
  const programAnalysis = SEED_PROGRAMS.map(p => {
    const v = scoreConfidence(p as Partial<GlobalProgram>);
    return { name: p.program_title, institution: p.institution_name, confidence: v.confidence, needsReview: v.needsManualReview, evidenceSummary: v.evidenceSummary, access_type: p.access_type };
  });

  const criticalChanges = []; // Will be populated by real agent in v2
  const pendingVerification = programAnalysis.filter(p => p.needsReview);
  const highConfidence = programAnalysis.filter(p => !p.needsReview);

  const handleRunNow = async () => {
    setIsRunning(true);
    setLastRunResult(null);
    try {
      const result = await runEducationIntelligenceCycle();
      setLastRunResult(result.summary);
      toast.success(`Agent cycle complete. ${result.programsUpdated} updated, ${result.programsFlagged} flagged.`);
      queryClient.invalidateQueries({ queryKey: ['education-agent-stats'] });
      queryClient.invalidateQueries({ queryKey: ['education-agent-runs'] });
    } catch (err) {
      toast.error('Agent cycle failed. Check console.');
      setLastRunResult('Cycle failed — check console for details.');
    } finally {
      setIsRunning(false);
    }
  };

  const statCards = [
    { label: 'Programs',          value: stats?.totalPrograms ?? '—',     icon: GraduationCap, color: 'text-blue-600',   bg: 'bg-blue-50' },
    { label: 'Scholarships',      value: stats?.totalScholarships ?? '—',  icon: Award,         color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Institutions',      value: stats?.totalInstitutions ?? '—',  icon: Building2,     color: 'text-gray-600',   bg: 'bg-gray-50' },
    { label: 'Verified Today',    value: stats?.verifiedToday ?? '—',      icon: ShieldCheck,   color: 'text-green-600',  bg: 'bg-green-50' },
    { label: 'Changed',           value: stats?.changed ?? 0,              icon: Activity,      color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Needs Review',      value: stats?.needsReview ?? '—',        icon: FileWarning,   color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Failed Fetch',      value: stats?.failedFetch ?? 0,          icon: XCircle,       color: 'text-red-600',    bg: 'bg-red-50' },
    { label: 'Next 24h Checks',  value: stats?.next24hChecks ?? '—',      icon: Clock,         color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'New Discoveries',   value: stats?.newDiscoveries ?? 0,       icon: Sparkles,      color: 'text-teal-600',   bg: 'bg-teal-50' },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 rounded-lg bg-primary/10">
                <FlaskConical className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Education Intelligence</h1>
              <Badge variant="outline" className="text-xs font-mono">{AGENT_VERSION}</Badge>
            </div>
            <p className="text-muted-foreground text-sm ml-14">
              24-hour agent cycle — discover, verify, detect changes, gate publishing.
            </p>
          </div>

          <Button
            onClick={handleRunNow}
            disabled={isRunning}
            className="gap-2 bg-primary hover:bg-primary/90"
          >
            {isRunning
              ? <><RotateCcw className="h-4 w-4 animate-spin" /> Running…</>
              : <><Play className="h-4 w-4" /> Run Now</>}
          </Button>
        </div>

        {/* Last run result */}
        {lastRunResult && (
          <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-4 py-2 font-mono border border-border">
            {lastRunResult}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3">
          {statCards.map((s) => (
            <Card key={s.label} className="border border-border shadow-none">
              <CardContent className="p-3 text-center">
                <div className={`inline-flex p-2 rounded-lg ${s.bg} mb-2`}>
                  <s.icon className={`h-4 w-4 ${s.color}`} />
                </div>
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5 leading-tight">{s.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Confidence Analysis */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-green-600" />
                Confidence Analysis — Current Programs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {programAnalysis.slice(0, 8).map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">{p.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{p.institution}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-24 bg-muted rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all ${p.confidence >= 0.95 ? 'bg-green-500' : p.confidence >= 0.85 ? 'bg-blue-500' : 'bg-yellow-500'}`}
                        style={{ width: `${Math.round(p.confidence * 100)}%` }}
                      />
                    </div>
                    <span className={`text-xs font-mono w-8 text-right ${p.confidence >= 0.85 ? 'text-green-600' : 'text-yellow-600'}`}>
                      {Math.round(p.confidence * 100)}%
                    </span>
                    {p.needsReview
                      ? <Badge variant="outline" className="text-xs px-1 py-0 text-yellow-600 border-yellow-300">Review</Badge>
                      : <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t border-border flex gap-4 text-xs text-muted-foreground">
                <span className="text-green-600 font-medium">{highConfidence.length} auto-publishable</span>
                <span className="text-yellow-600 font-medium">{pendingVerification.length} need review</span>
                <span className="text-muted-foreground">Threshold: {CONFIDENCE_THRESHOLDS.AUTO_PUBLISH_MIN * 100}%</span>
              </div>
            </CardContent>
          </Card>

          {/* Critical Rules */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                Publishing Gate — Confidence Thresholds
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { label: 'FULLY_FUNDED claims',      threshold: CONFIDENCE_THRESHOLDS.FULLY_FUNDED_MIN, color: 'text-red-600',    bg: 'bg-red-50',    note: 'Highest bar — scholarship + tuition both verified' },
                  { label: 'Scholarship coverage',     threshold: CONFIDENCE_THRESHOLDS.SCHOLARSHIP_MIN,  color: 'text-orange-600', bg: 'bg-orange-50', note: 'Official scholarship URL required' },
                  { label: 'TUITION_FREE claims',      threshold: CONFIDENCE_THRESHOLDS.TUITION_FREE_MIN, color: 'text-yellow-600', bg: 'bg-yellow-50', note: 'Zero tuition + source evidence required' },
                  { label: 'General program data',     threshold: CONFIDENCE_THRESHOLDS.AUTO_PUBLISH_MIN, color: 'text-blue-600',   bg: 'bg-blue-50',   note: 'Standard publish threshold' },
                ].map(rule => (
                  <div key={rule.label} className="flex items-center gap-3">
                    <div className={`text-xs font-mono font-bold px-2 py-1 rounded ${rule.bg} ${rule.color} w-12 text-center`}>
                      {Math.round(rule.threshold * 100)}%
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-medium">{rule.label}</div>
                      <div className="text-xs text-muted-foreground">{rule.note}</div>
                    </div>
                  </div>
                ))}

                <div className="pt-2 border-t border-border">
                  <div className="text-xs text-muted-foreground font-medium mb-1">Critical rule: NEVER auto-publish if</div>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    <li className="flex items-center gap-1"><XCircle className="h-3 w-3 text-red-500" /> No official HTTPS URL</li>
                    <li className="flex items-center gap-1"><XCircle className="h-3 w-3 text-red-500" /> CRITICAL field change detected</li>
                    <li className="flex items-center gap-1"><XCircle className="h-3 w-3 text-red-500" /> Confidence below threshold</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Check Schedule */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-indigo-500" />
                Dynamic Check Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { type: 'Application deadlines', freq: 'Every 24h', priority: 'HIGH',   color: 'bg-red-500',    note: 'Deadlines within 30 days → daily regardless' },
                  { type: 'Scholarships',           freq: 'Every 24h', priority: 'HIGH',   color: 'bg-red-500',    note: 'Funding can change quickly' },
                  { type: 'Tuition costs',          freq: 'Every 7d',  priority: 'MEDIUM', color: 'bg-yellow-500', note: 'After a change → recheck in 12h then 24h' },
                  { type: 'Program descriptions',   freq: 'Every 7d',  priority: 'MEDIUM', color: 'bg-yellow-500', note: 'Level, credential, duration' },
                  { type: 'Institution metadata',   freq: 'Every 30d', priority: 'LOW',    color: 'bg-gray-400',   note: 'Rankings, accreditation, type' },
                ].map(row => (
                  <div key={row.type} className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${row.color} shrink-0`} />
                    <div className="flex-1">
                      <div className="text-xs font-medium">{row.type}</div>
                      <div className="text-xs text-muted-foreground">{row.note}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-mono font-semibold">{row.freq}</div>
                      <Badge variant="outline" className="text-xs px-1 py-0">{row.priority}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pending Verification */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Eye className="h-4 w-4 text-yellow-500" />
                Pending Verification {pendingVerification.length > 0 && (
                  <Badge className="bg-yellow-500 text-white text-xs">{pendingVerification.length}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingVerification.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p className="text-sm font-medium">All records meet the confidence threshold</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingVerification.slice(0, 5).map((p, i) => (
                    <div key={i} className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-xs font-semibold">{p.name}</div>
                          <div className="text-xs text-muted-foreground">{p.institution}</div>
                        </div>
                        <Badge variant="outline" className="text-xs text-yellow-700 border-yellow-400 shrink-0">
                          {Math.round(p.confidence * 100)}%
                        </Badge>
                      </div>
                      <p className="text-xs text-yellow-700 mt-1">{p.evidenceSummary}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Critical Changes — empty in v1, populated by real agent in v2 */}
        {criticalChanges.length > 0 && (
          <Card className="border-red-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-4 w-4" />
                Critical Changes — Requires Human Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {criticalChanges.map((c: { label: string; note: string }, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-3">
                    <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
                    <div>
                      <div className="text-xs font-semibold text-red-700">{c.label}</div>
                      <div className="text-xs text-red-600">{c.note}</div>
                    </div>
                    <Button size="sm" variant="outline" className="ml-auto text-xs h-7 border-red-300 text-red-600">
                      Review
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Agent Run History */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              Agent Run History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <div className="text-xs text-muted-foreground">Loading…</div>
            ) : !runHistory || runHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No runs recorded yet.</p>
                <p className="text-xs mt-1">Click <strong>Run Now</strong> to execute the first agent cycle.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {runHistory.map((run: Record<string, unknown>) => (
                  <div key={run.run_id as string} className="flex items-center gap-4 text-xs border border-border rounded-lg px-4 py-2">
                    <div className={`h-2 w-2 rounded-full shrink-0 ${run.status === 'COMPLETED' ? 'bg-green-500' : run.status === 'PARTIAL' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                    <span className="font-mono text-muted-foreground w-36 shrink-0 truncate">{run.run_id as string}</span>
                    <span className="text-muted-foreground shrink-0">{new Date(run.started_at as string).toLocaleString()}</span>
                    <span className="shrink-0">{run.duration_seconds as number}s</span>
                    <span className="text-green-600 shrink-0">{run.programs_updated as number} updated</span>
                    <span className="text-yellow-600 shrink-0">{run.programs_flagged as number} flagged</span>
                    <span className="text-red-600 shrink-0">{run.errors_count as number} errors</span>
                    <Badge variant="outline" className={`ml-auto text-xs ${run.status === 'COMPLETED' ? 'text-green-600 border-green-300' : run.status === 'PARTIAL' ? 'text-yellow-600 border-yellow-300' : 'text-red-600 border-red-300'}`}>
                      {run.status as string}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* V2 Roadmap note */}
        <Card className="border-dashed border-muted-foreground/30 bg-muted/30">
          <CardContent className="pt-6 pb-4">
            <div className="flex items-start gap-3">
              <Globe className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">V2 — Real-world ingestion (not yet built)</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  V2 will add a Supabase Edge Function that fetches each <code className="font-mono">official_url</code>,
                  extracts structured content, stores the raw evidence snapshot, compares against the previous snapshot,
                  and runs the full confidence + publishing gate. The goal is to prove that <strong>one program can update
                  itself correctly every day</strong> before scaling to 1,000+.
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  {['Fetch page', 'Extract facts', 'Store evidence', 'Detect changes', 'Confidence gate', 'Publish / Queue'].map(step => (
                    <span key={step} className="px-2 py-1 rounded bg-muted border border-border font-mono">{step}</span>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
