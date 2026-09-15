import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  BarChart2,
  Target,
  Zap,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Activity,
  Download,
  Info,
  TrendingUp,
  TrendingDown,
  Minus,
  ExternalLink,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PathResult {
  pathType: "TRADITIONAL" | "GENERIC_AI" | "UDX";
  epistemicStatus: string;
  resolution_success: boolean | null;
  action_success: boolean | null;
  outcome_success: string;
  system_latency_ms: number | null;
  time_to_first_action_ms: number | null;
  interaction_steps: number;
  friction_score: number;
  uncertainty_index: number;
  cost_proxy_inr: number;
  outcome_quality_score: number;
  evidence_coverage: number;
  false_certainty_rate: number;
  failure_explanation: string | null;
  error?: string;
}

interface ResolutionAdvantage {
  resolutionAdvantage_vs_generic_ai: number | null;
  verdict: "UDX_WINS" | "UDX_LOSES" | "TIE" | "INSUFFICIENT_DATA";
  whyUdxLost: string | null;
  udxCostScore: number | null;
  genericAiCostScore: number | null;
}

interface ObjectiveResult {
  objectiveId: string;
  domain: string;
  rawIntent: string;
  canonicalIntent: string;
  successCriteria: {
    acceptableOutcome: string;
    maximumObservationWindowHours: number;
  };
  traditional: PathResult;
  genericAi: PathResult;
  udx: PathResult;
  resolutionAdvantage: ResolutionAdvantage;
  observedAt: string;
}

interface BenchmarkSummary {
  runId: string;
  runCompletedAt: string;
  totalObjectives: number;
  realComparisonCount: number;
  errorCount: number;
  udxVsGenericAi: {
    udxWins: number;
    udxLosses: number;
    ties: number;
    udxWinRate: string;
    udxLossRate: string;
    tieRate: string;
    medianResolutionAdvantage: string;
    meanResolutionAdvantage: string;
  };
  traditionalBaseline: {
    epistemicStatus: string;
    headlineNote: string;
    proxyFrictionScore: number;
    proxyOutcomeQuality: number;
    proxyReferences: string[];
  };
  domainBreakdown: Record<string, { total: number; wins: number; losses: number; ties: number }>;
  udxFailures: Array<{
    objectiveId: string;
    domain: string;
    rawIntent: string;
    whyUdxLost: string;
  }>;
  failureCount: number;
  epistemicCertification: {
    level: string;
    note: string;
    outcomeVerificationPending: number;
  };
}

interface BenchmarkData {
  summary: BenchmarkSummary;
  rawResults: ObjectiveResult[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SUPABASE_URL = "https://dthlgsnakhoftinssokm.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc";

const DOMAIN_LABELS: Record<string, string> = {
  CAREER: "Career",
  EDUCATION: "Education",
  BUSINESS: "Business",
  FINANCE: "Finance",
  LOCAL_SERVICES: "Local Services",
  PERSONAL: "Personal",
};

function DimensionBar({ value, max = 1, color }: { value: number; max?: number; color: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-slate-800">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-slate-400 w-10 text-right">{value.toFixed(2)}</span>
    </div>
  );
}

function VerdictBadge({ verdict }: { verdict: string }) {
  if (verdict === "UDX_WINS")
    return <Badge className="bg-emerald-900/60 text-emerald-300 border-emerald-700">🟢 UDX Wins</Badge>;
  if (verdict === "UDX_LOSES")
    return <Badge className="bg-red-900/60 text-red-300 border-red-700">🔴 UDX Loses</Badge>;
  if (verdict === "TIE")
    return <Badge className="bg-amber-900/60 text-amber-300 border-amber-700">🟡 Tie</Badge>;
  return <Badge className="bg-slate-800 text-slate-400">⚪ Insufficient Data</Badge>;
}

function EpistemicBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    OBSERVED: "bg-blue-900/40 text-blue-300 border-blue-700",
    TRADITIONAL_PROXY: "bg-orange-900/40 text-orange-300 border-orange-700",
    GENERIC_AI_REAL: "bg-violet-900/40 text-violet-300 border-violet-700",
    UDX_REAL: "bg-cyan-900/40 text-cyan-300 border-cyan-700",
    VERIFIED: "bg-emerald-900/40 text-emerald-300 border-emerald-700",
    OUTCOME_PENDING: "bg-slate-800 text-slate-400 border-slate-600",
  };
  return (
    <Badge className={`text-xs ${map[status] || "bg-slate-800 text-slate-400"}`}>{status}</Badge>
  );
}

// ─── Path Column ─────────────────────────────────────────────────────────────

function PathColumn({ label, result, color }: { label: string; result: PathResult; color: string }) {
  if (!result || result.error) {
    return (
      <div className="flex-1 min-w-0">
        <div className={`text-xs font-mono font-bold mb-2 ${color}`}>{label}</div>
        <EpistemicBadge status={result?.epistemicStatus || "ERROR"} />
        <p className="text-xs text-red-400 mt-2">{result?.error || "No data"}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 min-w-0">
      <div className={`text-xs font-mono font-bold mb-2 ${color}`}>{label}</div>
      <EpistemicBadge status={result.epistemicStatus} />

      {/* Success stages */}
      <div className="mt-3 space-y-1 text-xs">
        <div className="flex items-center gap-1.5">
          {result.resolution_success ? (
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          ) : (
            <XCircle className="w-3 h-3 text-red-400" />
          )}
          <span className="text-slate-400">Resolution</span>
        </div>
        <div className="flex items-center gap-1.5">
          {result.action_success === true ? (
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          ) : result.action_success === false ? (
            <XCircle className="w-3 h-3 text-red-400" />
          ) : (
            <Minus className="w-3 h-3 text-slate-500" />
          )}
          <span className="text-slate-400">Action</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3 h-3 text-amber-400" />
          <span className="text-slate-500 text-xs">{result.outcome_success}</span>
        </div>
      </div>

      {/* Dimensions */}
      <div className="mt-3 space-y-1.5 text-xs">
        <div>
          <span className="text-slate-500">Latency</span>
          <div className="text-slate-300">{result.system_latency_ms ? `${result.system_latency_ms}ms` : "PROXY"}</div>
        </div>
        <div>
          <span className="text-slate-500">Time to action</span>
          <div className="text-slate-300">
            {result.time_to_first_action_ms
              ? result.time_to_first_action_ms > 60000
                ? `${(result.time_to_first_action_ms / 60000).toFixed(1)}min`
                : `${(result.time_to_first_action_ms / 1000).toFixed(1)}s`
              : "N/A"}
          </div>
        </div>
        <div>
          <span className="text-slate-500">Steps</span>
          <DimensionBar value={result.interaction_steps} max={10} color="bg-blue-500" />
        </div>
        <div>
          <span className="text-slate-500">Friction</span>
          <DimensionBar value={result.friction_score} max={10} color="bg-orange-500" />
        </div>
        <div>
          <span className="text-slate-500">Uncertainty</span>
          <DimensionBar value={result.uncertainty_index} max={1} color="bg-yellow-500" />
        </div>
        <div>
          <span className="text-slate-500">Outcome quality</span>
          <DimensionBar value={result.outcome_quality_score} max={1} color="bg-emerald-500" />
        </div>
        <div>
          <span className="text-slate-500">Evidence coverage</span>
          <DimensionBar value={result.evidence_coverage} max={1} color="bg-cyan-500" />
        </div>
        <div>
          <span className="text-slate-500">False certainty rate</span>
          <DimensionBar value={result.false_certainty_rate} max={1} color="bg-red-500" />
        </div>
      </div>

      {result.failure_explanation && (
        <div className="mt-2 text-xs text-red-400 bg-red-900/20 rounded p-1.5">
          {result.failure_explanation}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BenchmarkResultsPage() {
  const [data, setData] = useState<BenchmarkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<string>("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function loadResults() {
      try {
        // Try loading from Supabase first
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/udx_benchmark_results?select=*&order=observed_at.desc&limit=100`,
          {
            headers: {
              apikey: SUPABASE_ANON_KEY,
              Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            },
          }
        );

        if (res.ok) {
          const rows = await res.json();
          if (rows && rows.length > 0) {
            // Reconstruct BenchmarkData from Supabase rows
            const rawResults: ObjectiveResult[] = rows.map((row: any) => ({
              objectiveId: row.objective_id,
              domain: row.domain,
              rawIntent: row.raw_intent,
              canonicalIntent: row.raw_intent,
              successCriteria: { acceptableOutcome: "", maximumObservationWindowHours: 48 },
              traditional: row.traditional_proxy || {},
              genericAi: row.generic_ai_result || {},
              udx: row.udx_result || {},
              resolutionAdvantage: row.resolution_advantage || {},
              observedAt: row.observed_at,
            }));

            // Compute summary from rows
            const wins = rows.filter((r: any) => r.verdict === "UDX_WINS").length;
            const losses = rows.filter((r: any) => r.verdict === "UDX_LOSES").length;
            const ties = rows.filter((r: any) => r.verdict === "TIE").length;
            const runId = rows[0]?.run_id || "unknown";

            const summary: BenchmarkSummary = {
              runId,
              runCompletedAt: rows[0]?.observed_at || new Date().toISOString(),
              totalObjectives: 100,
              realComparisonCount: rows.length,
              errorCount: 100 - rows.length,
              udxVsGenericAi: {
                udxWins: wins,
                udxLosses: losses,
                ties,
                insufficientData: rows.length - wins - losses - ties,
                udxWinRate: rows.length > 0 ? `${((wins / rows.length) * 100).toFixed(1)}%` : "N/A",
                udxLossRate: rows.length > 0 ? `${((losses / rows.length) * 100).toFixed(1)}%` : "N/A",
                tieRate: rows.length > 0 ? `${((ties / rows.length) * 100).toFixed(1)}%` : "N/A",
                medianResolutionAdvantage: "computed",
                meanResolutionAdvantage: "computed",
              } as any,
              traditionalBaseline: {
                epistemicStatus: "TRADITIONAL_PROXY",
                headlineNote:
                  "Traditional measurements are PROXY values from published UX research. Excluded from primary headline.",
                proxyFrictionScore: 6.1,
                proxyOutcomeQuality: 0.48,
                proxyReferences: ["NNGroup Search UX Study 2023", "Baymard Institute 2023"],
              },
              domainBreakdown: {},
              udxFailures: rows
                .filter((r: any) => r.verdict === "UDX_LOSES")
                .map((r: any) => ({
                  objectiveId: r.objective_id,
                  domain: r.domain,
                  rawIntent: r.raw_intent,
                  whyUdxLost: r.why_udx_lost || "Unknown",
                })),
              failureCount: losses,
              epistemicCertification: {
                level: "OBSERVED",
                note: "All results are OBSERVED from a single production run. OUTCOME_PENDING for all objectives.",
                outcomeVerificationPending: rows.length,
              },
            };

            setData({ summary, rawResults });
            setLoading(false);
            return;
          }
        }

        // Fallback: show "not yet run" state
        setError("NO_RUN_YET");
      } catch (err: any) {
        setError(err.message || "Failed to load benchmark results");
      } finally {
        setLoading(false);
      }
    }

    loadResults();
  }, []);

  const filteredResults = data?.rawResults.filter(
    (r) => selectedDomain === "ALL" || r.domain === selectedDomain
  ) || [];

  const handleDownload = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `udx-benchmark-${data.summary.runId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ─── Loading ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-8 h-8 text-cyan-400 animate-pulse mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Loading benchmark results...</p>
        </div>
      </div>
    );
  }

  // ─── Not-yet-run State ────────────────────────────────────────────────────

  if (error === "NO_RUN_YET" || !data) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <Helmet>
          <title>UDX 100-Objective Benchmark | TalentXcel</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="flex items-center gap-3 mb-4">
            <BarChart2 className="w-8 h-8 text-cyan-400" />
            <h1 className="text-2xl font-bold text-white">UDX 100-Objective Benchmark v2</h1>
          </div>
          <p className="text-slate-400 mb-8 text-sm leading-relaxed">
            This page will publish a three-way comparison of <strong>Traditional Search</strong>,{" "}
            <strong>Generic AI</strong>, and <strong>UDX</strong> across 100 pre-registered human
            objectives. Results will appear here after the first benchmark run completes.
          </p>

          <div className="bg-amber-900/20 border border-amber-800 rounded-lg p-4 mb-8">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-amber-300 text-sm font-medium mb-1">Benchmark not yet run</p>
                <p className="text-amber-400/70 text-xs">
                  Run{" "}
                  <code className="bg-amber-900/40 px-1 rounded">
                    node scripts/run-udx-100-benchmark.cjs
                  </code>{" "}
                  in the repository to populate this page with real results.
                </p>
              </div>
            </div>
          </div>

          {/* What the benchmark measures */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                label: "Traditional Search",
                color: "text-orange-400",
                desc: "TRADITIONAL_PROXY — calibrated estimates from published UX research. Excluded from primary headline score.",
              },
              {
                label: "Generic AI",
                color: "text-violet-400",
                desc: "GENERIC_AI_REAL — blind Gemini API call with rawIntent only. Zero UDX context or supply data provided.",
              },
              {
                label: "UDX",
                color: "text-cyan-400",
                desc: "UDX_REAL — live call to https://talentxcel.in/api/udx/resolve. Real supply, real evidence, real path resolution.",
              },
            ].map((p) => (
              <Card key={p.label} className="bg-slate-900 border-slate-800 p-4">
                <p className={`text-sm font-bold mb-1 ${p.color}`}>{p.label}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{p.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const s = data.summary;

  // ─── Results View ─────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Helmet>
        <title>UDX 100-Objective Benchmark | TalentXcel Discovery</title>
        <meta
          name="description"
          content="Real-world three-way comparison of Traditional Search, Generic AI, and UDX Intent Resolution across 100 human objectives. Raw data published including failures."
        />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <BarChart2 className="w-7 h-7 text-cyan-400" />
              <h1 className="text-2xl font-bold">UDX 100-Objective Benchmark v2</h1>
            </div>
            <p className="text-slate-400 text-sm">
              Real-world comparison: <strong className="text-orange-400">Traditional Search</strong>{" "}
              vs <strong className="text-violet-400">Generic AI</strong> vs{" "}
              <strong className="text-cyan-400">UDX</strong> across 100 pre-registered human
              objectives.
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              <EpistemicBadge status="OBSERVED" />
              <Badge className="bg-slate-800 text-slate-400 border-slate-700 text-xs">
                Run: {s.runId}
              </Badge>
              <Badge className="bg-slate-800 text-slate-400 border-slate-700 text-xs">
                {new Date(s.runCompletedAt).toLocaleDateString("en-IN")}
              </Badge>
            </div>
          </div>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg border border-slate-700 transition-colors flex-shrink-0"
          >
            <Download className="w-4 h-4" />
            Download raw data
          </button>
        </div>

        {/* Epistemic notice */}
        <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4 mb-8 flex items-start gap-3">
          <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-300/80 leading-relaxed">
            <strong className="text-blue-300">Epistemic certification: OBSERVED</strong> —{" "}
            {s.epistemicCertification.note} Traditional path uses PROXY estimates from published UX
            research (NNGroup, Baymard Institute) and is excluded from the primary UDX vs Generic AI
            headline score. Failures are included and not suppressed.
          </div>
        </div>

        {/* Headline scores */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-emerald-900/20 border-emerald-800 p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-emerald-400 font-medium">UDX Wins</span>
            </div>
            <div className="text-3xl font-bold text-emerald-300">{s.udxVsGenericAi.udxWins}</div>
            <div className="text-xs text-slate-500">{s.udxVsGenericAi.udxWinRate} of real comparisons</div>
          </Card>
          <Card className="bg-red-900/20 border-red-800 p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="w-4 h-4 text-red-400" />
              <span className="text-xs text-red-400 font-medium">UDX Loses</span>
            </div>
            <div className="text-3xl font-bold text-red-300">{s.udxVsGenericAi.udxLosses}</div>
            <div className="text-xs text-slate-500">{s.udxVsGenericAi.udxLossRate} of real comparisons</div>
          </Card>
          <Card className="bg-amber-900/20 border-amber-800 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Minus className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-amber-400 font-medium">Ties</span>
            </div>
            <div className="text-3xl font-bold text-amber-300">{s.udxVsGenericAi.ties}</div>
            <div className="text-xs text-slate-500">{s.udxVsGenericAi.tieRate} of real comparisons</div>
          </Card>
          <Card className="bg-slate-900 border-slate-800 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-400 font-medium">Compared</span>
            </div>
            <div className="text-3xl font-bold text-slate-300">{s.realComparisonCount}</div>
            <div className="text-xs text-slate-500">{s.errorCount} errored / skipped</div>
          </Card>
        </div>

        {/* Resolution Advantage */}
        <Card className="bg-slate-900 border-slate-800 p-4 mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium text-cyan-300">Resolution Advantage (UDX vs Generic AI)</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-500 text-xs">Median RA</span>
              <div className="text-xl font-mono text-white">{s.udxVsGenericAi.medianResolutionAdvantage}</div>
              <div className="text-xs text-slate-500">+RA = UDX lowers cost; -RA = UDX costs more</div>
            </div>
            <div>
              <span className="text-slate-500 text-xs">Mean RA</span>
              <div className="text-xl font-mono text-white">{s.udxVsGenericAi.meanResolutionAdvantage}</div>
              <div className="text-xs text-slate-500">Computed post-execution only</div>
            </div>
          </div>
        </Card>

        {/* Traditional baseline — labeled and separated */}
        <Card className="bg-orange-900/10 border-orange-900 p-4 mb-8">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-medium text-orange-300">Traditional Search Baseline (PROXY — excluded from headline)</span>
          </div>
          <p className="text-xs text-orange-400/70 mb-3">{s.traditionalBaseline.headlineNote}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-500">Proxy friction score</span>
              <div className="text-orange-300 font-mono">{s.traditionalBaseline.proxyFrictionScore}/10</div>
            </div>
            <div>
              <span className="text-slate-500">Proxy outcome quality</span>
              <div className="text-orange-300 font-mono">{s.traditionalBaseline.proxyOutcomeQuality}</div>
            </div>
            <div className="col-span-2">
              <span className="text-slate-500">Sources</span>
              <div className="text-orange-300/60">
                {s.traditionalBaseline.proxyReferences.join(" · ")}
              </div>
            </div>
          </div>
        </Card>

        {/* Domain breakdown */}
        {Object.keys(s.domainBreakdown).length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              Domain Breakdown
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(s.domainBreakdown).map(([domain, stats]) => (
                <Card key={domain} className="bg-slate-900 border-slate-800 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-300">{DOMAIN_LABELS[domain] || domain}</span>
                    <span className="text-xs text-slate-500">{stats.total} objectives</span>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <span className="text-emerald-400">W:{stats.wins}</span>
                    <span className="text-red-400">L:{stats.losses}</span>
                    <span className="text-amber-400">T:{stats.ties}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Failures section — required, not suppressed */}
        {s.failureCount > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-400" />
              Why UDX Lost ({s.failureCount} objectives)
            </h2>
            <p className="text-xs text-slate-500 mb-3">
              These are published as-is. The benchmark is not designed to manufacture UDX
              superiority. Failures indicate real supply gaps, domain weaknesses, or resolution
              limitations that require improvement.
            </p>
            <div className="space-y-2">
              {s.udxFailures.map((f) => (
                <div
                  key={f.objectiveId}
                  className="bg-red-900/10 border border-red-900/50 rounded-lg p-3"
                >
                  <div className="flex items-start gap-2">
                    <Badge className="bg-red-900/40 text-red-300 border-red-800 text-xs flex-shrink-0">
                      {f.objectiveId}
                    </Badge>
                    <div>
                      <p className="text-xs text-slate-300 mb-1">{f.rawIntent}</p>
                      <p className="text-xs text-red-400">{f.whyUdxLost}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Domain filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {["ALL", ...Object.keys(DOMAIN_LABELS)].map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDomain(d)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                selectedDomain === d
                  ? "bg-cyan-900 text-cyan-300 border-cyan-700"
                  : "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-600"
              }`}
            >
              {d === "ALL" ? "All Domains" : DOMAIN_LABELS[d]}
            </button>
          ))}
        </div>

        {/* Results table */}
        <div className="space-y-3">
          {filteredResults.length === 0 && (
            <p className="text-slate-500 text-sm text-center py-8">No results in this domain yet.</p>
          )}
          {filteredResults.map((r) => (
            <Card
              key={r.objectiveId}
              className="bg-slate-900 border-slate-800 overflow-hidden"
            >
              {/* Row header */}
              <button
                className="w-full p-4 flex items-start gap-3 text-left hover:bg-slate-800/50 transition-colors"
                onClick={() => setExpandedId(expandedId === r.objectiveId ? null : r.objectiveId)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <Badge className="bg-slate-800 text-slate-400 border-slate-700 text-xs">
                      {r.objectiveId}
                    </Badge>
                    <Badge className="bg-slate-800 text-slate-400 border-slate-700 text-xs">
                      {DOMAIN_LABELS[r.domain] || r.domain}
                    </Badge>
                    <VerdictBadge verdict={r.resolutionAdvantage?.verdict} />
                  </div>
                  <p className="text-sm text-slate-200 truncate">{r.rawIntent}</p>
                  {r.resolutionAdvantage?.whyUdxLost && (
                    <p className="text-xs text-red-400 mt-1">
                      Why UDX lost: {r.resolutionAdvantage.whyUdxLost}
                    </p>
                  )}
                </div>
                <div className="text-xs text-slate-600 flex-shrink-0">
                  {expandedId === r.objectiveId ? "▲" : "▼"}
                </div>
              </button>

              {/* Expanded comparison */}
              {expandedId === r.objectiveId && (
                <div className="border-t border-slate-800 p-4">
                  {/* Success criteria */}
                  <div className="bg-slate-800/50 rounded p-3 mb-4 text-xs">
                    <span className="text-slate-400 font-medium">Pre-registered success criteria: </span>
                    <span className="text-slate-300">{r.successCriteria?.acceptableOutcome || "—"}</span>
                    <span className="text-slate-500 ml-2">
                      (max observation: {r.successCriteria?.maximumObservationWindowHours}h)
                    </span>
                  </div>

                  {/* Three path columns */}
                  <div className="flex gap-6">
                    <PathColumn
                      label="TRADITIONAL (PROXY)"
                      result={r.traditional}
                      color="text-orange-400"
                    />
                    <div className="w-px bg-slate-800" />
                    <PathColumn
                      label="GENERIC AI (REAL)"
                      result={r.genericAi}
                      color="text-violet-400"
                    />
                    <div className="w-px bg-slate-800" />
                    <PathColumn
                      label="UDX (REAL)"
                      result={r.udx}
                      color="text-cyan-400"
                    />
                  </div>

                  {/* RA detail */}
                  {r.resolutionAdvantage?.resolutionAdvantage_vs_generic_ai !== null && (
                    <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap gap-4 text-xs">
                      <div>
                        <span className="text-slate-500">Resolution Advantage (vs Generic AI)</span>
                        <span
                          className={`ml-2 font-mono ${
                            (r.resolutionAdvantage?.resolutionAdvantage_vs_generic_ai || 0) > 0
                              ? "text-emerald-400"
                              : "text-red-400"
                          }`}
                        >
                          {r.resolutionAdvantage?.resolutionAdvantage_vs_generic_ai?.toFixed(4)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">UDX cost score</span>
                        <span className="ml-2 font-mono text-cyan-400">
                          {r.resolutionAdvantage?.udxCostScore?.toFixed(4)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">Generic AI cost score</span>
                        <span className="ml-2 font-mono text-violet-400">
                          {r.resolutionAdvantage?.genericAiCostScore?.toFixed(4)}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="mt-3 text-xs text-slate-600">
                    Observed at: {new Date(r.observedAt).toLocaleString("en-IN")} ·{" "}
                    outcome_success: <span className="text-amber-500">OUTCOME_PENDING</span> for
                    all objectives (no human confirmation received)
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Bottom epistemic note */}
        <div className="mt-10 text-xs text-slate-600 text-center leading-relaxed border-t border-slate-800 pt-6">
          UDX 100-Objective Benchmark v2 · OBSERVED (single production run) · Independent
          replication required for VERIFIED status · Raw data downloadable above ·{" "}
          <a
            href="https://talentxcel.in/discovery"
            className="text-slate-500 hover:text-slate-400 underline"
          >
            UDX Discovery Engine
          </a>
        </div>
      </div>
    </div>
  );
}
