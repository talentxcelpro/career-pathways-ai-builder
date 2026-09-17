/**
 * UDX Universal Discovery & Intelligence OS v3.3
 * Ollama-Only Blind Generic AI Comparator Qualification Suite
 *
 * POLICY (HARD):
 *   - Only Ollama at http://localhost:11434.
 *   - NO cloud LLMs, NO public APIs, NO Gemini, NO OpenAI, NO paid inference.
 *   - COMPARATOR_UNAVAILABLE ≠ GENERIC_AI_SCORE = 0 ≠ UDX_WIN.
 *   - Blinding Invariant: payload to Ollama = { rawIntent } only.
 *   - Any BlindingViolationError → immediate abort of entire qualification run.
 *   - Domain label is NEVER transmitted to Ollama.
 *
 * SEQUENCE (HARD — do not skip steps):
 *   7-stage handshake
 *       ↓
 *   5-objective smoke + 10-check smoke gate
 *       ↓
 *   30-objective blind qualification (checkpointed, resumable)
 *       ↓
 *   COMPARATOR_QUALIFIED
 *
 * CHECKPOINTING:
 *   - Each objective result is persisted immediately after completion.
 *   - Resumable by --resume <runId>: already-completed objectives are skipped.
 *   - A single Ollama timeout does NOT invalidate the entire run.
 *
 * CORPUS: FROZEN (from UDX v3.2 preflight, commit 8588e70a). Never alter post-run.
 *
 * OUTPUT: reports/udx_world_challenge/v4/comparator_qualification/runs/<runId>/
 */

import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';
import {
  runComparatorHandshake,
  runObjectiveQualification,
  BlindingViolationError,
  NUM_PREDICT,
  TEMPERATURE,
  GENERATE_TIMEOUT_MS,
} from '../src/lib/udx/comparator/ComparatorGate';
import type {
  ComparatorGateResult,
  ComparatorObjectiveResult,
  ComparatorModelMetadata,
  ComparatorStatus,
} from '../src/lib/udx/comparator/ComparatorGate';
import { PRE_REGISTERED_30_OBJECTIVES } from './run-30-objective-preflight';
import type { StratifiedObjective } from './run-30-objective-preflight';

// ─── Phase 1: Smoke Test Corpus (1 per domain) ───────────────────────────────

const SMOKE_TEST_IDS = ['CAR-01', 'EDU-01', 'BUS-01', 'FIN-01', 'LOC-01'];

const SMOKE_OBJECTIVES: StratifiedObjective[] = PRE_REGISTERED_30_OBJECTIVES.filter(
  o => SMOKE_TEST_IDS.includes(o.id)
);

// ─── Directory Layout ─────────────────────────────────────────────────────────

const BASE_OUTPUT_DIR = path.join(
  process.cwd(), 'reports', 'udx_world_challenge', 'v4', 'comparator_qualification', 'runs'
);

function getRunDir(runId: string): string {
  return path.join(BASE_OUTPUT_DIR, runId);
}
function getSmokeDir(runId: string): string {
  return path.join(getRunDir(runId), 'smoke');
}
function getPhase2Dir(runId: string): string {
  return path.join(getRunDir(runId), 'phase2');
}

// ─── Checkpoint I/O ──────────────────────────────────────────────────────────

function ensureRunDirs(runId: string): void {
  fs.mkdirSync(getRunDir(runId), { recursive: true });
  fs.mkdirSync(getSmokeDir(runId), { recursive: true });
  fs.mkdirSync(getPhase2Dir(runId), { recursive: true });
}

function checkpointExists(runId: string, phase: 'smoke' | 'phase2', objectiveId: string): boolean {
  const dir = phase === 'smoke' ? getSmokeDir(runId) : getPhase2Dir(runId);
  return fs.existsSync(path.join(dir, `${objectiveId}.json`));
}

function loadCheckpoint(runId: string, phase: 'smoke' | 'phase2', objectiveId: string): ComparatorObjectiveResult | null {
  const dir = phase === 'smoke' ? getSmokeDir(runId) : getPhase2Dir(runId);
  const file = path.join(dir, `${objectiveId}.json`);
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8')) as ComparatorObjectiveResult;
  } catch {
    return null;
  }
}

function saveCheckpoint(runId: string, phase: 'smoke' | 'phase2', result: ComparatorObjectiveResult): void {
  const dir = phase === 'smoke' ? getSmokeDir(runId) : getPhase2Dir(runId);
  const file = path.join(dir, `${result.objectiveId}.json`);
  fs.writeFileSync(file, JSON.stringify(result, null, 2), 'utf8');
}

function saveHandshake(runId: string, handshake: ComparatorGateResult): void {
  fs.writeFileSync(
    path.join(getRunDir(runId), 'handshake.json'),
    JSON.stringify(handshake, null, 2),
    'utf8'
  );
}

function saveRunMetadata(runId: string, meta: Record<string, unknown>): void {
  fs.writeFileSync(
    path.join(getRunDir(runId), 'metadata.json'),
    JSON.stringify(meta, null, 2),
    'utf8'
  );
}

function saveSmokeGate(runId: string, gate: SmokeGateResult): void {
  fs.writeFileSync(
    path.join(getRunDir(runId), 'SMOKE_GATE.json'),
    JSON.stringify(gate, null, 2),
    'utf8'
  );
}

function saveQualificationResult(runId: string, result: Record<string, unknown>): void {
  fs.writeFileSync(
    path.join(getRunDir(runId), 'QUALIFICATION_RESULT.json'),
    JSON.stringify(result, null, 2),
    'utf8'
  );
}

// ─── Ollama Response Quality Evaluation ──────────────────────────────────────

export interface OllamaResponseEval {
  nonEmpty: boolean;
  minWordCount: boolean;       // ≥ 10 words
  notRefusal: boolean;         // No "I cannot", "As an AI", etc.
  containsActionablePattern: boolean;
  truncationAffectsEval: boolean; // True if truncated AND less than minWordCount
  overallPass: boolean;
}

export function evaluateOllamaResponse(text: string | null, truncated: boolean): OllamaResponseEval {
  if (!text || text.trim().length === 0) {
    return {
      nonEmpty: false, minWordCount: false, notRefusal: false,
      containsActionablePattern: false, truncationAffectsEval: false, overallPass: false,
    };
  }

  const words = text.trim().split(/\s+/);
  const nonEmpty = true;
  const minWordCount = words.length >= 10;

  const refusalPatterns = [
    /i cannot/i, /i can't/i, /as an ai/i, /i am unable/i,
    /i'm not able/i, /i don't have access/i, /i'm just an/i,
    /i lack the ability/i,
  ];
  const notRefusal = !refusalPatterns.some(p => p.test(text));

  const actionablePatterns = [
    /you (can|should|could|may|might|need to|must|have to)/i,
    /consider|recommend|suggest|try|start|apply|visit|register|enroll|look|search|explore/i,
    /step \d|first|next|then|finally|option \d/i,
    /go to|click|navigate|fill out|submit/i,
  ];
  const containsActionablePattern = actionablePatterns.some(p => p.test(text));

  // Truncation only affects evaluation if the response was cut AND didn't meet word threshold
  const truncationAffectsEval = truncated && !minWordCount;

  // A truncated response that still has >= 10 words is not penalized
  const overallPass = nonEmpty && minWordCount && notRefusal && !truncationAffectsEval;

  return { nonEmpty, minWordCount, notRefusal, containsActionablePattern, truncationAffectsEval, overallPass };
}

// ─── 10-Check Smoke Gate ──────────────────────────────────────────────────────

interface SmokeGateCheck {
  id: string;
  description: string;
  passed: boolean;
  detail: string;
}

export interface SmokeGateResult {
  allPassed: boolean;
  checks: SmokeGateCheck[];
  failures: string[];
}

export function runSmokeGate(
  handshake: ComparatorGateResult,
  smokeResults: ComparatorObjectiveResult[]
): SmokeGateResult {
  const checks: SmokeGateCheck[] = [];

  // Check 1: COMPARATOR_READY
  checks.push({
    id: 'COMPARATOR_READY',
    description: 'Handshake status is COMPARATOR_READY',
    passed: handshake.status === 'COMPARATOR_READY',
    detail: `Status: ${handshake.status}`,
  });

  // Check 2: 5/5 smoke objectives completed
  const completed = smokeResults.filter(r => r.status !== undefined).length;
  checks.push({
    id: 'SMOKE_COMPLETE',
    description: '5/5 smoke objectives completed (no transport drops)',
    passed: completed === SMOKE_OBJECTIVES.length,
    detail: `${completed}/${SMOKE_OBJECTIVES.length} completed`,
  });

  // Check 3: 5/5 responses substantive
  const substantive = smokeResults.filter(r => {
    const e = evaluateOllamaResponse(r.responseText, r.truncated);
    return e.overallPass;
  }).length;
  checks.push({
    id: 'RESPONSES_SUBSTANTIVE',
    description: '5/5 responses substantive (non-empty, ≥10 words, no refusal)',
    passed: substantive === SMOKE_OBJECTIVES.length,
    detail: `${substantive}/${SMOKE_OBJECTIVES.length} substantive`,
  });

  // Check 4: 0 blinding violations
  const blindingViolations = smokeResults.filter(r => r.status === 'COMPARATOR_BLINDING_VIOLATION').length;
  checks.push({
    id: 'ZERO_BLINDING_VIOLATIONS',
    description: '0 blinding violations',
    passed: blindingViolations === 0,
    detail: `${blindingViolations} violations`,
  });

  // Check 5: 0 transport/model errors
  const transportErrors = smokeResults.filter(r => r.status === 'COMPARATOR_MODEL_ERROR').length;
  checks.push({
    id: 'ZERO_TRANSPORT_ERRORS',
    description: '0 transport/model errors',
    passed: transportErrors === 0,
    detail: `${transportErrors} errors`,
  });

  // Check 6: 0 truncated responses affecting evaluation
  const truncationAffected = smokeResults.filter(r => {
    const e = evaluateOllamaResponse(r.responseText, r.truncated);
    return e.truncationAffectsEval;
  }).length;
  checks.push({
    id: 'ZERO_TRUNCATION_AFFECTING_EVAL',
    description: '0 truncated responses that affect evaluation quality',
    passed: truncationAffected === 0,
    detail: `${truncationAffected} truncated-and-affecting`,
  });

  // Check 7: 0 synthetic comparator results (every result has a real rawTranscript)
  const synthetic = smokeResults.filter(r => !r.rawTranscript).length;
  checks.push({
    id: 'ZERO_SYNTHETIC_RESULTS',
    description: '0 synthetic results (every result has a raw Ollama transcript)',
    passed: synthetic === 0,
    detail: `${synthetic} missing transcripts`,
  });

  // Check 8: exact model + digest recorded
  const digestRecorded = handshake.modelMetadata?.digest != null;
  checks.push({
    id: 'MODEL_DIGEST_RECORDED',
    description: 'Exact model name and SHA digest recorded',
    passed: digestRecorded,
    detail: digestRecorded
      ? `${handshake.modelMetadata!.name} @ ${handshake.modelMetadata!.digest!.substring(0, 12)}`
      : 'Digest is null',
  });

  // Check 9: latency recorded for every objective
  const latencyMissing = smokeResults.filter(r => !r.tvo || r.tvo.OLLAMA_RESPONSE_LATENCY <= 0).length;
  checks.push({
    id: 'LATENCY_RECORDED',
    description: 'Latency recorded for every smoke objective',
    passed: latencyMissing === 0,
    detail: `${latencyMissing} missing latency values`,
  });

  // Check 10: raw transcripts persisted (in-memory check — disk persistence is by runner)
  const transcriptsMissing = smokeResults.filter(r => !r.rawTranscript?.response || r.rawTranscript.response.length === 0).length;
  checks.push({
    id: 'TRANSCRIPTS_PERSISTED',
    description: 'Raw Ollama transcripts persisted for every smoke objective',
    passed: transcriptsMissing === 0,
    detail: `${transcriptsMissing} missing transcripts`,
  });

  const failures = checks.filter(c => !c.passed).map(c => `[${c.id}] ${c.description} — ${c.detail}`);

  return {
    allPassed: failures.length === 0,
    checks,
    failures,
  };
}

// ─── TVO Aggregate ────────────────────────────────────────────────────────────

interface TVOAggregate {
  objectives: number;
  avgOllamaLatencyMs: number;
  avgTTFUA: number;
  avgProxyTTO: number;
  avgEvalTokenCount: number | null;
  truncatedCount: number;
  truncationAffectingEvalCount: number;
  verifiedTTO: 'NOT_VERIFIED — benchmark data only';
}

function computeTVOAggregate(results: ComparatorObjectiveResult[]): TVOAggregate | null {
  const withTVO = results.filter(r => r.tvo !== null);
  if (withTVO.length === 0) return null;

  const avgOllamaLatencyMs = withTVO.reduce((a, r) => a + r.tvo!.OLLAMA_RESPONSE_LATENCY, 0) / withTVO.length;
  const avgTTFUA = withTVO.reduce((a, r) => a + r.tvo!.TIME_TO_FIRST_USEFUL_ACTION, 0) / withTVO.length;
  const avgProxyTTO = withTVO.reduce((a, r) => a + r.tvo!.PROXY_TIME_TO_OUTCOME, 0) / withTVO.length;

  const tokenResults = withTVO.filter(r => r.tvo!.evalTokenCount !== null);
  const avgEvalTokenCount = tokenResults.length > 0
    ? tokenResults.reduce((a, r) => a + r.tvo!.evalTokenCount!, 0) / tokenResults.length
    : null;

  const truncatedCount = results.filter(r => r.truncated).length;
  const truncationAffectingEvalCount = results.filter(r => {
    const e = evaluateOllamaResponse(r.responseText, r.truncated);
    return e.truncationAffectsEval;
  }).length;

  return {
    objectives: withTVO.length,
    avgOllamaLatencyMs,
    avgTTFUA,
    avgProxyTTO,
    avgEvalTokenCount,
    truncatedCount,
    truncationAffectingEvalCount,
    verifiedTTO: 'NOT_VERIFIED — benchmark data only',
  };
}

// ─── Report Writer ────────────────────────────────────────────────────────────

function writeReport(
  runId: string,
  handshake: ComparatorGateResult,
  smokeResults: ComparatorObjectiveResult[],
  smokeGate: SmokeGateResult | null,
  phase2Results: ComparatorObjectiveResult[],
  phase2Status: string,
  finalStatus: string,
  rejectionReasons: string[],
  runTimestamp: string
): string {
  const mm = handshake.modelMetadata;
  const lines: string[] = [];

  lines.push('# UDX v3.3 — Ollama Blind Comparator Qualification Report');
  lines.push('');
  lines.push(`**Run ID:** \`${runId}\``);
  lines.push(`**Run Timestamp:** ${runTimestamp}`);
  lines.push('');
  lines.push('## Comparator Identity');
  lines.push('');
  lines.push('| Field | Value |');
  lines.push('|-------|-------|');
  lines.push(`| Model | \`${mm?.name ?? handshake.modelUsed ?? 'N/A'}\` |`);
  lines.push(`| Digest | \`${mm?.digest ? mm.digest.substring(0, 24) + '…' : 'not recorded'}\` |`);
  lines.push(`| Quantization | \`${mm?.quantizationLevel ?? 'unknown'}\` |`);
  lines.push(`| Parameter Size | \`${mm?.parameterSize ?? 'unknown'}\` |`);
  lines.push(`| num_predict | \`${mm?.numPredict ?? NUM_PREDICT}\` |`);
  lines.push(`| temperature | \`${mm?.temperature ?? TEMPERATURE}\` |`);
  lines.push(`| request_timeout | \`${mm?.requestTimeoutMs ?? GENERATE_TIMEOUT_MS}ms\` |`);
  lines.push(`| Endpoint | \`${handshake.endpoint}\` |`);
  lines.push('');

  lines.push('---');
  lines.push('');
  lines.push('## 7-Stage Handshake');
  lines.push('');
  const stageNames = ['CONNECTIVITY','MODEL_AVAILABLE','MODEL_RESPONDS','RAW_INTENT_ONLY_PAYLOAD_VERIFIED','LATENCY_CAPTURED','RESPONSE_PARSES','RESULT_STORED'];
  lines.push('| Stage | Name | Result |');
  lines.push('|-------|------|--------|');
  for (let i = 1; i <= 7; i++) {
    const passed = handshake.stagesCompleted >= i;
    const failed = handshake.failedAtStage === i;
    lines.push(`| ${i} | ${stageNames[i-1]} | ${failed ? '❌ FAILED' : passed ? '✅ PASSED' : '— SKIPPED'} |`);
  }
  lines.push('');
  lines.push(`**Final Handshake Status:** \`${handshake.status}\``);
  if (handshake.warmupLatencyMs) lines.push(`**Warm-up Latency:** ${handshake.warmupLatencyMs}ms`);
  lines.push('');

  // Smoke Test
  lines.push('---');
  lines.push('');
  lines.push('## Phase 1 — 5-Objective Smoke Test');
  lines.push('');

  if (smokeResults.length > 0) {
    lines.push('| ID | Intent | Latency | Tokens | Done | Truncated | Actionable | Pass |');
    lines.push('|----|--------|---------|--------|------|-----------|------------|------|');
    for (const r of smokeResults) {
      const e = evaluateOllamaResponse(r.responseText, r.truncated);
      const latency = r.tvo ? `${r.tvo.OLLAMA_RESPONSE_LATENCY}ms` : 'N/A';
      const tokens = r.tvo?.evalTokenCount ?? 'N/A';
      const doneReason = r.tvo?.doneReason ?? 'N/A';
      const pass = r.status === 'OBJECTIVE_PASSED' && e.overallPass ? '✅' : '❌';
      lines.push(`| ${r.objectiveId} | ${r.rawIntent.substring(0,38)}… | ${latency} | ${tokens} | \`${doneReason}\` | ${r.truncated ? '⚠️' : '—'} | ${e.containsActionablePattern ? '✅' : '❌'} | ${pass} |`);
    }
    lines.push('');
  }

  // Smoke Gate
  if (smokeGate) {
    lines.push('### 10-Check Smoke Gate');
    lines.push('');
    lines.push('| # | Check | Result | Detail |');
    lines.push('|---|-------|--------|--------|');
    smokeGate.checks.forEach((c, i) => {
      lines.push(`| ${i+1} | ${c.description} | ${c.passed ? '✅' : '❌'} | ${c.detail} |`);
    });
    lines.push('');
    lines.push(`**Smoke Gate:** ${smokeGate.allPassed ? '✅ ALL 10 CHECKS PASSED — Phase 2 unlocked' : '❌ FAILED — Phase 2 blocked'}`);
    if (!smokeGate.allPassed) {
      smokeGate.failures.forEach(f => lines.push(`> - ${f}`));
    }
    lines.push('');
  }

  // Phase 2
  lines.push('---');
  lines.push('');
  lines.push('## Phase 2 — 30-Objective Blind Qualification Suite');
  lines.push('');
  lines.push(`**Status:** ${phase2Status}`);
  lines.push('');

  if (phase2Results.length > 0) {
    const tvo = computeTVOAggregate(phase2Results);

    lines.push('| # | ID | Domain | Latency | Tokens | Truncated | Pass |');
    lines.push('|---|-------|--------|---------|--------|-----------|------|');
    phase2Results.forEach((r, i) => {
      const e = evaluateOllamaResponse(r.responseText, r.truncated);
      const latency = r.tvo ? `${r.tvo.OLLAMA_RESPONSE_LATENCY}ms` : 'N/A';
      const tokens = r.tvo?.evalTokenCount ?? 'N/A';
      const obj = PRE_REGISTERED_30_OBJECTIVES.find(o => o.id === r.objectiveId);
      const pass = r.status === 'OBJECTIVE_PASSED' && e.overallPass ? '✅' : '❌';
      lines.push(`| ${i+1} | ${r.objectiveId} | ${obj?.domain ?? '?'} | ${latency} | ${tokens} | ${r.truncated ? '⚠️' : '—'} | ${pass} |`);
    });
    lines.push('');

    if (tvo) {
      lines.push('### TVO Aggregate (Phase 2)');
      lines.push('');
      lines.push('| Metric | Value |');
      lines.push('|--------|-------|');
      lines.push(`| Objectives evaluated | ${tvo.objectives} |`);
      lines.push(`| Avg OLLAMA_RESPONSE_LATENCY | ${tvo.avgOllamaLatencyMs.toFixed(0)}ms |`);
      lines.push(`| Avg TIME_TO_FIRST_USEFUL_ACTION | ${tvo.avgTTFUA.toFixed(0)}ms |`);
      lines.push(`| Avg PROXY_TIME_TO_OUTCOME | ${tvo.avgProxyTTO.toFixed(0)}ms |`);
      lines.push(`| Avg eval token count | ${tvo.avgEvalTokenCount?.toFixed(0) ?? 'N/A'} |`);
      lines.push(`| Truncated responses | ${tvo.truncatedCount} |`);
      lines.push(`| Truncations affecting eval | ${tvo.truncationAffectingEvalCount} |`);
      lines.push(`| VERIFIED_TIME_TO_OUTCOME | ${tvo.verifiedTTO} |`);
      lines.push('');
    }
  }

  // Final Verdict
  lines.push('---');
  lines.push('');
  lines.push('## Final Qualification Verdict');
  lines.push('');
  lines.push('```');
  lines.push(finalStatus);
  if (rejectionReasons.length > 0) {
    lines.push('');
    lines.push('Rejection reasons:');
    rejectionReasons.forEach(r => lines.push(`  - ${r}`));
  }
  lines.push('```');
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('> **POLICY REMINDER:** `COMPARATOR_UNAVAILABLE` ≠ `GENERIC_AI_SCORE = 0` ≠ `UDX_WIN`.');
  lines.push('> UDX cannot claim "beats Generic AI" unless the comparator was live, qualified, and ran the same objectives.');
  lines.push('> This result is from: **`' + (mm?.name ?? 'unknown') + '`**');

  return lines.join('\n');
}

// ─── Main Qualification Runner ────────────────────────────────────────────────

async function runComparatorQualification(): Promise<void> {
  const runTimestamp = new Date().toISOString();

  // Check for resume mode
  const resumeArg = process.argv.indexOf('--resume');
  let runId: string;
  let resuming = false;

  if (resumeArg !== -1 && process.argv[resumeArg + 1]) {
    runId = process.argv[resumeArg + 1];
    resuming = true;
    console.log(`\n[RESUME MODE] Resuming qualification run: ${runId}`);
    if (!fs.existsSync(getRunDir(runId))) {
      console.error(`[ERROR] Run directory not found: ${getRunDir(runId)}`);
      process.exit(1);
    }
  } else {
    runId = `q-${Date.now()}-${randomUUID().substring(0, 8)}`;
  }

  console.log('\n===================================================================');
  console.log(' UDX v3.3 — OLLAMA-ONLY BLIND COMPARATOR QUALIFICATION SUITE');
  console.log('===================================================================');
  console.log(` Run ID:   ${runId}`);
  console.log(' POLICY:   Ollama only. No Gemini. No OpenAI. No cloud APIs.');
  console.log(' BLINDING: Payload = { rawIntent } only. Domain label NOT sent.');
  console.log(`${resuming ? ' MODE:     RESUMING from checkpoint' : ' MODE:     FRESH RUN'}`);
  console.log('===================================================================\n');

  ensureRunDirs(runId);

  const rejectionReasons: string[] = [];
  let phase1SmokeStatus: 'PASSED' | 'FAILED' | 'ABORTED' = 'FAILED';
  let phase2Status: 'PASSED' | 'FAILED' | 'SKIPPED' | 'ABORTED' | 'PARTIAL' = 'SKIPPED';
  let smokeGate: SmokeGateResult | null = null;
  const smokeResults: ComparatorObjectiveResult[] = [];
  const phase2Results: ComparatorObjectiveResult[] = [];

  // ── 7-Stage Handshake ──────────────────────────────────────────────────────
  console.log('── Step 1: 7-Stage Hard Handshake ──\n');
  let handshake: ComparatorGateResult;

  if (resuming && fs.existsSync(path.join(getRunDir(runId), 'handshake.json'))) {
    handshake = JSON.parse(fs.readFileSync(path.join(getRunDir(runId), 'handshake.json'), 'utf8'));
    console.log(`[RESUME] Loaded cached handshake — status: ${handshake.status}`);
    // Re-run handshake even on resume to confirm Ollama is still up
    console.log('[RESUME] Re-running handshake to confirm Ollama is still reachable...');
  }

  try {
    handshake = await runComparatorHandshake();
  } catch (err: unknown) {
    if (err instanceof BlindingViolationError) {
      console.error('\n[FATAL] Blinding violation during handshake. Qualification ABORTED.');
      handshake = {
        status: 'COMPARATOR_BLINDING_VIOLATION',
        endpoint: 'http://localhost:11434',
        modelUsed: null, modelMetadata: null, modelsAvailable: [], stagesCompleted: 3,
        failedAtStage: 4, failureReason: err.message,
        connectivityLatencyMs: null, warmupLatencyMs: null, warmupResponseText: null,
        timestamp: runTimestamp,
      };
      saveHandshake(runId, handshake);
      const report = writeReport(runId, handshake, [], null, [], 'ABORTED', 'COMPARATOR_BLINDING_VIOLATION', [err.message], runTimestamp);
      fs.writeFileSync(path.join(getRunDir(runId), 'REPORT.md'), report, 'utf8');
      saveQualificationResult(runId, { status: 'COMPARATOR_BLINDING_VIOLATION', runId, rejectionReasons: [err.message] });
      process.exit(1);
    }
    throw err;
  }

  saveHandshake(runId, handshake);

  // Save run metadata
  saveRunMetadata(runId, {
    runId,
    runTimestamp,
    resuming,
    comparator: {
      model: handshake.modelUsed,
      endpoint: handshake.endpoint,
      metadata: handshake.modelMetadata,
      num_predict: NUM_PREDICT,
      temperature: TEMPERATURE,
      request_timeout_ms: GENERATE_TIMEOUT_MS,
    },
    corpus: {
      frozen: true,
      source: 'UDX v3.2 preflight, commit 8588e70a',
      objectives: PRE_REGISTERED_30_OBJECTIVES.length,
    },
  });

  if (handshake.status !== 'COMPARATOR_READY') {
    rejectionReasons.push(`Handshake failed at stage ${handshake.failedAtStage}: ${handshake.failureReason}`);
    phase1SmokeStatus = 'ABORTED';
    phase2Status = 'ABORTED';

    const report = writeReport(runId, handshake, [], null, [], 'ABORTED', handshake.status, rejectionReasons, runTimestamp);
    fs.writeFileSync(path.join(getRunDir(runId), 'REPORT.md'), report, 'utf8');
    saveQualificationResult(runId, { status: handshake.status, runId, rejectionReasons });

    console.log('\n===================================================================');
    console.log(' QUALIFICATION ABORTED — COMPARATOR NOT READY');
    console.log(`  Status: ${handshake.status}`);
    console.log(`  Reason: ${handshake.failureReason}`);
    console.log('\nNOTE: COMPARATOR_UNAVAILABLE ≠ GENERIC_AI_SCORE = 0 ≠ UDX_WIN');
    console.log(`  Run dir: ${getRunDir(runId)}`);
    console.log('===================================================================\n');
    return;
  }

  const modelUsed = handshake.modelUsed!;

  // ── Phase 1: Smoke Test (5 objectives, checkpointed) ──────────────────────
  console.log('\n── Step 2: 5-Objective Smoke Test ──\n');
  console.log('Domains: Career, Education, Business, Finance, Local Services');
  console.log(`Blinding: Domain label NOT sent. Payload = { rawIntent } only.\n`);

  let smokeFailures = 0;

  for (const obj of SMOKE_OBJECTIVES) {
    // Check checkpoint
    const cached = loadCheckpoint(runId, 'smoke', obj.id);
    if (cached) {
      const e = evaluateOllamaResponse(cached.responseText, cached.truncated);
      const pass = cached.status === 'OBJECTIVE_PASSED' && e.overallPass;
      const latency = cached.tvo ? `${cached.tvo.OLLAMA_RESPONSE_LATENCY}ms` : 'N/A';
      console.log(`  [${obj.id}] [CACHED] ${pass ? '✅' : '❌'} [${latency}]`);
      smokeResults.push(cached);
      if (!pass) smokeFailures++;
      continue;
    }

    process.stdout.write(`  [${obj.id}] "${obj.rawIntent.substring(0, 48)}"... `);
    let objResult: ComparatorObjectiveResult;
    try {
      objResult = await runObjectiveQualification(obj.id, obj.rawIntent, modelUsed);
    } catch (err: unknown) {
      if (err instanceof BlindingViolationError) {
        console.error(`\n[FATAL] Blinding violation on ${obj.id}. Qualification ABORTED.`);
        saveQualificationResult(runId, { status: 'COMPARATOR_BLINDING_VIOLATION', runId, objectiveId: obj.id, error: err.message });
        process.exit(1);
      }
      throw err;
    }

    const e = evaluateOllamaResponse(objResult.responseText, objResult.truncated);
    const passed = objResult.status === 'OBJECTIVE_PASSED' && e.overallPass;
    if (!passed) smokeFailures++;

    const latency = objResult.tvo ? `${objResult.tvo.OLLAMA_RESPONSE_LATENCY}ms` : 'N/A';
    const tokenStr = objResult.tvo?.evalTokenCount ? ` [${objResult.tvo.evalTokenCount}tok]` : '';
    const truncStr = objResult.truncated ? ' [TRUNC⚠️]' : '';
    console.log(`${passed ? '✅' : '❌'} [${latency}]${tokenStr}${truncStr}`);

    // Persist checkpoint immediately
    saveCheckpoint(runId, 'smoke', objResult);
    smokeResults.push(objResult);
  }

  phase1SmokeStatus = smokeFailures === 0 ? 'PASSED' : 'FAILED';
  console.log(`\nSmoke Test: ${SMOKE_OBJECTIVES.length - smokeFailures}/${SMOKE_OBJECTIVES.length} passed`);

  // ── 10-Check Smoke Gate ────────────────────────────────────────────────────
  console.log('\n── Step 3: 10-Check Smoke Gate ──\n');
  smokeGate = runSmokeGate(handshake, smokeResults);
  saveSmokeGate(runId, smokeGate);

  smokeGate.checks.forEach((c, i) => {
    console.log(`  [${String(i+1).padStart(2,' ')}] ${c.passed ? '✅' : '❌'} ${c.description}`);
    if (!c.passed) console.log(`         → ${c.detail}`);
  });
  console.log('');

  if (!smokeGate.allPassed) {
    phase2Status = 'SKIPPED';
    const finalStatus = 'COMPARATOR_QUALIFICATION_FAILED';
    rejectionReasons.push(...smokeGate.failures);

    const report = writeReport(runId, handshake, smokeResults, smokeGate, [], 'SKIPPED', finalStatus, rejectionReasons, runTimestamp);
    fs.writeFileSync(path.join(getRunDir(runId), 'REPORT.md'), report, 'utf8');
    saveQualificationResult(runId, { status: finalStatus, runId, rejectionReasons });

    console.log('===================================================================');
    console.log(' QUALIFICATION FAILED — SMOKE GATE DID NOT PASS');
    console.log('  Phase 2 (30-objective suite) was NOT run.');
    console.log('  Resume with: npx tsx scripts/run-comparator-qualification.ts --resume ' + runId);
    console.log(`  Run dir: ${getRunDir(runId)}`);
    console.log('===================================================================\n');
    return;
  }

  console.log('✅ All 10 smoke gate checks passed. Phase 2 unlocked.\n');

  // ── Phase 2: 30-Objective Blind Qualification Suite (checkpointed) ─────────
  console.log('── Step 4: 30-Objective Blind Qualification Suite ──\n');
  console.log('Corpus: frozen 30 objectives from UDX v3.2 preflight (6 domains × 5)');
  console.log(`Model:  ${modelUsed}`);
  console.log(`Config: num_predict=${NUM_PREDICT}, temperature=${TEMPERATURE}, timeout=${GENERATE_TIMEOUT_MS}ms`);
  console.log('Blinding: Domain label NOT transmitted. Payload = { rawIntent } only.\n');

  let phase2Failures = 0;
  let completedCount = 0;

  for (let i = 0; i < PRE_REGISTERED_30_OBJECTIVES.length; i++) {
    const obj = PRE_REGISTERED_30_OBJECTIVES[i];
    const seq = `[${String(i + 1).padStart(2, '0')}/30]`;

    // Check checkpoint
    const cached = loadCheckpoint(runId, 'phase2', obj.id);
    if (cached) {
      const e = evaluateOllamaResponse(cached.responseText, cached.truncated);
      const pass = cached.status === 'OBJECTIVE_PASSED' && e.overallPass;
      const latency = cached.tvo ? `${cached.tvo.OLLAMA_RESPONSE_LATENCY}ms` : 'N/A';
      console.log(`  ${seq} [${obj.id}] [CACHED] ${pass ? '✅' : '❌'} [${latency}]`);
      phase2Results.push(cached);
      if (!pass) phase2Failures++;
      completedCount++;
      continue;
    }

    process.stdout.write(`  ${seq} [${obj.id}] "${obj.rawIntent.substring(0, 42)}"... `);

    let objResult: ComparatorObjectiveResult;
    try {
      objResult = await runObjectiveQualification(obj.id, obj.rawIntent, modelUsed);
    } catch (err: unknown) {
      if (err instanceof BlindingViolationError) {
        console.error(`\n[FATAL] Blinding violation on ${obj.id}. Qualification ABORTED.`);
        saveQualificationResult(runId, {
          status: 'COMPARATOR_BLINDING_VIOLATION', runId,
          objectiveId: obj.id, completedBefore: completedCount, error: (err as Error).message,
        });
        process.exit(1);
      }
      throw err;
    }

    const e = evaluateOllamaResponse(objResult.responseText, objResult.truncated);
    const passed = objResult.status === 'OBJECTIVE_PASSED' && e.overallPass;
    if (!passed) phase2Failures++;
    completedCount++;

    const latency = objResult.tvo ? `${objResult.tvo.OLLAMA_RESPONSE_LATENCY}ms` : 'N/A';
    const tokenStr = objResult.tvo?.evalTokenCount ? ` [${objResult.tvo.evalTokenCount}tok]` : '';
    const truncStr = objResult.truncated ? ' [TRUNC⚠️]' : '';
    console.log(`${passed ? '✅' : '❌'} [${latency}]${tokenStr}${truncStr}`);

    // Persist checkpoint immediately — a subsequent timeout does NOT lose this result
    saveCheckpoint(runId, 'phase2', objResult);
    phase2Results.push(objResult);
  }

  // ── Final Verdict ──────────────────────────────────────────────────────────
  const phase2PassRate = ((PRE_REGISTERED_30_OBJECTIVES.length - phase2Failures) / PRE_REGISTERED_30_OBJECTIVES.length) * 100;
  const phase2Passed = phase2Failures === 0;
  phase2Status = phase2Passed ? 'PASSED' : 'FAILED';

  let finalStatus: string;
  if (phase2Passed) {
    finalStatus = 'COMPARATOR_QUALIFIED';
  } else {
    finalStatus = 'COMPARATOR_QUALIFICATION_FAILED';
    rejectionReasons.push(
      `Phase 2 qualification failed: ${phase2Failures}/30 objectives did not meet response quality bar (${phase2PassRate.toFixed(1)}% pass rate)`
    );
  }

  // TVO aggregate
  const tvo = computeTVOAggregate(phase2Results);

  // Write report and result
  const report = writeReport(runId, handshake, smokeResults, smokeGate, phase2Results, phase2Status, finalStatus, rejectionReasons, runTimestamp);
  fs.writeFileSync(path.join(getRunDir(runId), 'REPORT.md'), report, 'utf8');
  saveQualificationResult(runId, {
    status: finalStatus,
    runId,
    model: modelUsed,
    modelDigest: handshake.modelMetadata?.digest ?? null,
    quantizationLevel: handshake.modelMetadata?.quantizationLevel ?? null,
    num_predict: NUM_PREDICT,
    temperature: TEMPERATURE,
    phase2PassRate,
    phase2Failures,
    tvoAggregate: tvo,
    rejectionReasons,
    timestamp: runTimestamp,
  });

  console.log('\n===================================================================');
  console.log(' COMPARATOR QUALIFICATION — FINAL VERDICT');
  console.log('===================================================================');
  console.log(`Model:               ${modelUsed}`);
  console.log(`Digest:              ${handshake.modelMetadata?.digest?.substring(0, 24) ?? 'not recorded'}`);
  console.log(`Quantization:        ${handshake.modelMetadata?.quantizationLevel ?? 'unknown'}`);
  console.log(`num_predict:         ${NUM_PREDICT}`);
  console.log(`Phase 1 Smoke:       ${phase1SmokeStatus}`);
  console.log(`Smoke Gate (10/10):  ${smokeGate.allPassed ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Phase 2 Pass Rate:   ${phase2PassRate.toFixed(1)}% (${PRE_REGISTERED_30_OBJECTIVES.length - phase2Failures}/30)`);
  if (tvo) {
    console.log(`Avg Ollama Latency:  ${tvo.avgOllamaLatencyMs.toFixed(0)}ms`);
    console.log(`Avg Proxy TTO:       ${tvo.avgProxyTTO.toFixed(0)}ms`);
    console.log(`Avg Eval Tokens:     ${tvo.avgEvalTokenCount?.toFixed(0) ?? 'N/A'}`);
    console.log(`Truncated Responses: ${tvo.truncatedCount} (${tvo.truncationAffectingEvalCount} affecting eval)`);
    console.log(`Verified TTO:        ${tvo.verifiedTTO}`);
  }
  console.log('-------------------------------------------------------------------');
  console.log(`COMPARATOR STATUS:   ${finalStatus}`);
  console.log(`World Challenge v4:  ${phase2Passed ? 'GATE PASSED ✅' : 'GATE BLOCKED ❌'}`);
  if (!phase2Passed) {
    rejectionReasons.forEach(r => console.log(`  ↳ ${r}`));
    console.log('');
    console.log(`To resume: npx tsx scripts/run-comparator-qualification.ts --resume ${runId}`);
  }
  console.log('===================================================================');
  console.log(`\nRun dir: ${getRunDir(runId)}`);
  console.log(`Report:  ${path.join(getRunDir(runId), 'REPORT.md')}\n`);
}

runComparatorQualification().catch(err => {
  console.error('\n[FATAL] Qualification runner crashed:', err);
  process.exit(1);
});
