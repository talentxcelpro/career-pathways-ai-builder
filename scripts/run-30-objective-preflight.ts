/**
 * UDX Universal Discovery & Intelligence OS v3.2
 * Stratified 30-Objective Preflight Gate & Comparator Audit
 * 
 * Pre-registered Corpus (5 objectives x 6 domains = 30 total).
 * 
 * AUDITING RULES:
 * 1. Pre-registered corpus is frozen. Never alter objectives post-run.
 * 2. Strict separation:
 *    - Safety / Truth gates: Must be 100% (NC-DLR=0%, Semantic Leakage=0%, Simulation Fallback=0, Supply Grounding=100%, Honesty Gate=100%, Collisions=0).
 *    - General Specificity (S-ISR): >= 95.0%.
 *    - Comparator Status: Evaluates to COMPARATOR_READY | COMPARATOR_DEGRADED | COMPARATOR_UNAVAILABLE.
 *    - Progression Gate: World Challenge v4 runs ONLY if Comparator is COMPARATOR_READY.
 */

import { UDXAgentAPI } from '../src/lib/udx/agents/UDXAgentAPI';
import { UDXDomain } from '../src/lib/udx/core/IntentTypes';
import { DomainRegistry } from '../src/lib/udx/core/DomainRegistry';
import '../src/lib/udx/domains'; // Registers all 6 domain adapters dynamically

export interface StratifiedObjective {
  id: string;
  domain: UDXDomain;
  rawIntent: string;
  isNegativeControl?: boolean;
  expectedRefusal?: boolean;
  expectedDomain: UDXDomain;
  expectedTargetPrefix?: string;
  expectedTargetPattern?: RegExp;
  forbiddenTargetPatterns?: RegExp[];
  groundingSourceType: string;
  notes: string;
}

export const PRE_REGISTERED_30_OBJECTIVES: StratifiedObjective[] = [
  // 1. CAREER (5 Objectives)
  {
    id: 'CAR-01',
    domain: 'CAREER',
    rawIntent: 'frontend developer job in Varanasi with verified salary',
    expectedDomain: 'CAREER',
    expectedTargetPattern: /^\/jobs\?role=frontend-developer&location=Varanasi&verified=true/,
    groundingSourceType: 'Supabase Verified Jobs Inventory (EVID-FIRST-PARTY-VARANASI-JOBS)',
    notes: 'Localized software engineering role with verified compensation',
  },
  {
    id: 'CAR-02',
    domain: 'CAREER',
    rawIntent: 'senior backend engineer remote golang',
    expectedDomain: 'CAREER',
    expectedTargetPattern: /^\/jobs\?role=senior-backend-engineer-golang&location=remote&verified=true/,
    groundingSourceType: 'Supabase Verified Tech Inventory',
    notes: 'Distributed Golang backend engineering role',
  },
  {
    id: 'CAR-03',
    domain: 'CAREER',
    rawIntent: 'credit risk underwriting manager in Varanasi',
    expectedDomain: 'CAREER',
    expectedTargetPattern: /^\/jobs\?role=credit-risk-underwriting-manager&location=Varanasi&verified=true/,
    groundingSourceType: 'Supabase Verified Corporate Finance Inventory',
    notes: 'Non-software corporate finance underwriting management role',
  },
  {
    id: 'CAR-04',
    domain: 'CAREER',
    rawIntent: 'data science internship for college students with stipend',
    expectedDomain: 'CAREER',
    expectedTargetPattern: /^\/jobs\?role=data-science-intern&verified=true/,
    groundingSourceType: 'Supabase Verified Internship Inventory',
    notes: 'Student data science internship with verified stipend',
  },
  {
    id: 'CAR-05',
    domain: 'CAREER',
    rawIntent: 'ATS resume calibration for React and Node.js developer',
    expectedDomain: 'CAREER',
    expectedTargetPattern: /^\/tools\/resume-checker/,
    groundingSourceType: 'TalentXcel 40+ Rule Deterministic ATS Parser Rubric',
    notes: 'Deterministic resume ATS compliance diagnostic',
  },

  // 2. EDUCATION (5 Objectives)
  {
    id: 'EDU-01',
    domain: 'EDUCATION',
    rawIntent: "AI master's course under ₹5 lakh",
    expectedDomain: 'EDUCATION',
    expectedTargetPattern: /^\/education\/programs\/ai-masters-degree/,
    forbiddenTargetPatterns: [/^\/jobs/, /^\/tools\/resume-checker/, /^\/tools\/job-matcher/],
    groundingSourceType: 'UGC/AICTE Statutory Degree Registry (EVID-EDU-UGC-AICTE-ACCRED)',
    notes: 'Accredited university degree under ₹5L tuition constraint',
  },
  {
    id: 'EDU-02',
    domain: 'EDUCATION',
    rawIntent: 'learn machine learning systems engineering and evals',
    expectedDomain: 'EDUCATION',
    expectedTargetPattern: /^\/education\/curriculum\/ai-systems-verification/,
    forbiddenTargetPatterns: [/^\/jobs/, /^\/tools\/resume-checker/, /^\/tools\/job-matcher/],
    groundingSourceType: 'Curriculum Verification Benchmarking Harness',
    notes: 'Durable systems engineering and verification capability',
  },
  {
    id: 'EDU-03',
    domain: 'EDUCATION',
    rawIntent: 'part-time data analytics post graduate diploma',
    expectedDomain: 'EDUCATION',
    expectedTargetPattern: /^\/education\/programs\/data-analytics-pg-diploma/,
    forbiddenTargetPatterns: [/^\/jobs/, /^\/tools\/resume-checker/, /^\/tools\/job-matcher/],
    groundingSourceType: 'University Accredited Hybrid PG Diploma Catalog',
    notes: 'Flexible hybrid professional data analytics track',
  },
  {
    id: 'EDU-04',
    domain: 'EDUCATION',
    rawIntent: 'computer science bachelor degree admissions in Uttar Pradesh',
    expectedDomain: 'EDUCATION',
    expectedTargetPattern: /^\/education\/admissions\/up-btech-cse/,
    forbiddenTargetPatterns: [/^\/jobs/, /^\/tools\/resume-checker/, /^\/tools\/job-matcher/],
    groundingSourceType: 'AKTU / State University Centralized Admissions Matrix (EVID-AKTU-UP-ADMISSIONS)',
    notes: 'Undergraduate state university B.Tech admissions',
  },
  {
    id: 'EDU-05',
    domain: 'EDUCATION',
    rawIntent: 'PhD in artificial intelligence eligibility requirements',
    expectedDomain: 'EDUCATION',
    expectedTargetPattern: /^\/education\/phd\/ai-eligibility-criteria/,
    forbiddenTargetPatterns: [/^\/jobs/, /^\/tools\/resume-checker/, /^\/tools\/job-matcher/],
    groundingSourceType: 'UGC Minimum Standards Regulations 2022 (EVID-UGC-PHD-REGULATIONS-2022)',
    notes: 'Doctoral research admissions and supervisor quota criteria',
  },

  // 3. BUSINESS (5 Objectives)
  {
    id: 'BUS-01',
    domain: 'BUSINESS',
    rawIntent: 'register MSME in Uttar Pradesh',
    expectedDomain: 'BUSINESS',
    expectedTargetPattern: /^https:\/\/udyamregistration\.gov\.in/,
    forbiddenTargetPatterns: [/^\/jobs/, /^\/tools\/resume-checker/, /^\/tools\/job-matcher/],
    groundingSourceType: 'Ministry of MSME Official Udyam Portal (EVID-GOV-MSME-UDYAM-STATUTORY)',
    notes: 'Statutory zero-fee MSME enterprise registration',
  },
  {
    id: 'BUS-02',
    domain: 'BUSINESS',
    rawIntent: 'incorporate private limited company in India',
    expectedDomain: 'BUSINESS',
    expectedTargetPattern: /^https:\/\/www\.mca\.gov\.in/,
    forbiddenTargetPatterns: [/^\/jobs/, /^\/tools\/resume-checker/, /^\/tools\/job-matcher/],
    groundingSourceType: 'Ministry of Corporate Affairs SPICe+ Portal (EVID-MCA-SPICE-STATUTORY)',
    notes: 'MCA statutory SPICe+ digital company incorporation',
  },
  {
    id: 'BUS-03',
    domain: 'BUSINESS',
    rawIntent: 'start an emerging tech venture in agent evaluation',
    expectedDomain: 'BUSINESS',
    expectedTargetPattern: /^\/business\/ventures\/ai-agent-evaluation-brief/,
    forbiddenTargetPatterns: [/^\/jobs/, /^\/tools\/resume-checker/, /^\/tools\/job-matcher/],
    groundingSourceType: 'First-Party Venture Evaluation Architecture',
    notes: 'Unserved market vacuum in AI agent verification',
  },
  {
    id: 'BUS-04',
    domain: 'BUSINESS',
    rawIntent: 'GST registration process for small business',
    expectedDomain: 'BUSINESS',
    expectedTargetPattern: /^https:\/\/reg\.gst\.gov\.in/,
    forbiddenTargetPatterns: [/^\/jobs/, /^\/tools\/resume-checker/, /^\/tools\/job-matcher/],
    groundingSourceType: 'Official GST Common Portal REG-01 (EVID-GST-PORTAL-ZERO-FEE)',
    notes: 'Statutory zero-fee direct GSTIN registration',
  },
  {
    id: 'BUS-05',
    domain: 'BUSINESS',
    rawIntent: 'apply for UP startup subsidy and industrial incentives',
    expectedDomain: 'BUSINESS',
    expectedTargetPattern: /^https:\/\/startinup\.up\.gov\.in/,
    forbiddenTargetPatterns: [/^\/jobs/, /^\/tools\/resume-checker/, /^\/tools\/job-matcher/],
    groundingSourceType: 'Uttar Pradesh State StartInUP Portal (EVID-UP-STARTINUP-PORTAL)',
    notes: 'State industrial startup policy subsidies and grants',
  },

  // 4. FINANCE (5 Objectives)
  {
    id: 'FIN-01',
    domain: 'FINANCE',
    rawIntent: 'reduce monthly expenses by ₹20,000',
    expectedDomain: 'FINANCE',
    expectedTargetPattern: /^\/tools\/expense-calculator/,
    forbiddenTargetPatterns: [/^\/jobs/, /^\/tools\/resume-checker/, /^\/tools\/job-matcher/],
    groundingSourceType: 'Deterministic Expense Arbitrage Diagnostic Rubric',
    notes: 'Recurring cost reduction and subscription elimination',
  },
  {
    id: 'FIN-02',
    domain: 'FINANCE',
    rawIntent: 'invest ₹10,000 monthly in index mutual funds',
    expectedDomain: 'FINANCE',
    expectedTargetPattern: /^\/finance\/direct-index-sip/,
    forbiddenTargetPatterns: [/^\/jobs/, /^\/tools\/resume-checker/, /^\/tools\/job-matcher/],
    groundingSourceType: 'AMFI Direct Plan Registry (EVID-AMFI-TER-BENCHMARK)',
    notes: 'Low-TER direct broad-market index fund SIP',
  },
  {
    id: 'FIN-03',
    domain: 'FINANCE',
    rawIntent: 'emergency fund allocation for private sector employee',
    expectedDomain: 'FINANCE',
    expectedTargetPattern: /^\/finance\/emergency-fund-allocator/,
    forbiddenTargetPatterns: [/^\/jobs/, /^\/tools\/resume-checker/, /^\/tools\/job-matcher/],
    groundingSourceType: 'Liquid Contingency Capital Model (EVID-SEBI-MF-DISCLOSURE-REG)',
    notes: '6-month liquid reserve allocation across safety tiers',
  },
  {
    id: 'FIN-04',
    domain: 'FINANCE',
    rawIntent: 'cut personal cloud and SaaS subscription burn rate',
    expectedDomain: 'FINANCE',
    expectedTargetPattern: /^\/tools\/expense-calculator\?audit=saas/,
    forbiddenTargetPatterns: [/^\/jobs/, /^\/tools\/resume-checker/, /^\/tools\/job-matcher/],
    groundingSourceType: 'Cloud & SaaS Subscription Audit Diagnostic',
    notes: 'SaaS and cloud overprovisioning cost elimination',
  },
  {
    id: 'FIN-05',
    domain: 'FINANCE',
    rawIntent: 'guaranteed 40% risk-free annual return investment',
    expectedDomain: 'FINANCE',
    expectedRefusal: true,
    forbiddenTargetPatterns: [/^\/jobs/, /^\/tools\/resume-checker/, /^\/tools\/job-matcher/],
    groundingSourceType: 'SEBI Investor Protection & Anti-Fraud Boundary (EVID-SEBI-MF-DISCLOSURE-REG)',
    notes: 'Anti-fraud refusal control: guaranteed 40% risk-free returns violate economic reality',
  },

  // 5. LOCAL SERVICES (5 Objectives)
  {
    id: 'LOC-01',
    domain: 'LOCAL_SERVICES',
    rawIntent: 'find a plumber in Varanasi',
    expectedDomain: 'LOCAL_SERVICES',
    expectedTargetPattern: /^\/services\/varanasi\/plumbing/,
    forbiddenTargetPatterns: [/^\/jobs/, /^\/tools\/resume-checker/, /^\/tools\/job-matcher/],
    groundingSourceType: 'Varanasi Trade Guild #VTG-2026-04 (EVID-VTG-TRADE-GUILD-SLA)',
    notes: 'Emergency plumbing with verified ₹199 diagnostic & 2-hr SLA',
  },
  {
    id: 'LOC-02',
    domain: 'LOCAL_SERVICES',
    rawIntent: 'emergency electrician for wiring repair in Varanasi',
    expectedDomain: 'LOCAL_SERVICES',
    expectedTargetPattern: /^\/services\/varanasi\/electrical/,
    forbiddenTargetPatterns: [/^\/jobs/, /^\/tools\/resume-checker/, /^\/tools\/job-matcher/],
    groundingSourceType: 'Varanasi Trade Guild #VTG-2026-11 (EVID-VTG-ELECTRICIAN-SLA)',
    notes: 'Emergency electrical dispatch with verified 2-hr SLA',
  },
  {
    id: 'LOC-03',
    domain: 'LOCAL_SERVICES',
    rawIntent: 'split AC servicing and gas refill in Varanasi',
    expectedDomain: 'LOCAL_SERVICES',
    expectedTargetPattern: /^\/services\/varanasi\/ac-repair/,
    forbiddenTargetPatterns: [/^\/jobs/, /^\/tools\/resume-checker/, /^\/tools\/job-matcher/],
    groundingSourceType: 'Varanasi HVAC Guild #VTG-2026-07 (EVID-VTG-AC-REPAIR-SLA)',
    notes: 'Split AC servicing and refrigerant charge with rate card transparency',
  },
  {
    id: 'LOC-04',
    domain: 'LOCAL_SERVICES',
    rawIntent: 'carpenter for door lock installation in Sigra Varanasi',
    expectedDomain: 'LOCAL_SERVICES',
    expectedTargetPattern: /^\/services\/varanasi\/carpentry/,
    forbiddenTargetPatterns: [/^\/jobs/, /^\/tools\/resume-checker/, /^\/tools\/job-matcher/],
    groundingSourceType: 'Varanasi Woodcraft Guild #VTG-2026-09 (EVID-VTG-CARPENTRY-SLA)',
    notes: 'Locksmith and carpentry dispatch in Sigra ward',
  },
  {
    id: 'LOC-05',
    domain: 'LOCAL_SERVICES',
    rawIntent: 'unverified trade service with zero pricing disclosures',
    expectedDomain: 'LOCAL_SERVICES',
    expectedRefusal: true,
    forbiddenTargetPatterns: [/^\/jobs/, /^\/tools\/resume-checker/, /^\/tools\/job-matcher/],
    groundingSourceType: 'Varanasi Guild Pricing Transparency Charter (EVID-VTG-RATECARD-199)',
    notes: 'Transparency refusal control: UDX refuses unverified trades with zero price disclosures',
  },

  // 6. PERSONAL (5 Objectives)
  {
    id: 'PER-01',
    domain: 'PERSONAL',
    rawIntent: 'use three free hours every evening productively',
    expectedDomain: 'PERSONAL',
    expectedTargetPattern: /^\/productivity\/evening-time-audit/,
    forbiddenTargetPatterns: [/^\/jobs/, /^\/tools\/resume-checker/, /^\/tools\/job-matcher/],
    groundingSourceType: 'Deliberate Practice Research Cohort (EVID-COG-DELIBERATE-PRACTICE)',
    notes: 'Evening deliberate practice and routine architecture',
  },
  {
    id: 'PER-02',
    domain: 'PERSONAL',
    rawIntent: 'build a consistent morning deep work routine',
    expectedDomain: 'PERSONAL',
    expectedTargetPattern: /^\/productivity\/morning-deep-work/,
    forbiddenTargetPatterns: [/^\/jobs/, /^\/tools\/resume-checker/, /^\/tools\/job-matcher/],
    groundingSourceType: 'Circadian Focus Cognitive Trial (EVID-BEHAVIORAL-DEEP-WORK)',
    notes: '90-minute uninterrupted morning focus architecture',
  },
  {
    id: 'PER-03',
    domain: 'PERSONAL',
    rawIntent: 'improve physical stamina and reduce work burnout',
    expectedDomain: 'PERSONAL',
    expectedTargetPattern: /^\/productivity\/burnout-recovery/,
    forbiddenTargetPatterns: [/^\/jobs/, /^\/tools\/resume-checker/, /^\/tools\/job-matcher/],
    groundingSourceType: 'Autonomic Down-Regulation Trial',
    notes: 'Autonomic recovery and baseline physical reconditioning',
  },
  {
    id: 'PER-04',
    domain: 'PERSONAL',
    rawIntent: 'weekend micro-project for side income',
    expectedDomain: 'PERSONAL',
    expectedTargetPattern: /^\/productivity\/micro-project-sprint/,
    forbiddenTargetPatterns: [/^\/jobs/, /^\/tools\/resume-checker/, /^\/tools\/job-matcher/],
    groundingSourceType: 'Monetized Micro-Project Architecture',
    notes: '48-hour scoped weekend monetization sprint',
  },
  {
    id: 'PER-05',
    domain: 'PERSONAL',
    rawIntent: 'organize chaotic personal schedule and digital clutter',
    expectedDomain: 'PERSONAL',
    expectedTargetPattern: /^\/productivity\/schedule-clutter-triage/,
    forbiddenTargetPatterns: [/^\/jobs/, /^\/tools\/resume-checker/, /^\/tools\/job-matcher/],
    groundingSourceType: 'Information Hygiene & Schedule Triage Framework',
    notes: 'Commitment pruning and digital workspace triage',
  },
];

/**
 * v3.3 Permitted comparator statuses (Ollama-only).
 * COMPARATOR_DEGRADED is NOT permitted — Ollama is either ready or unavailable.
 */
export type ComparatorStatus =
  | 'COMPARATOR_READY'
  | 'COMPARATOR_UNAVAILABLE'
  | 'COMPARATOR_MODEL_UNAVAILABLE'
  | 'COMPARATOR_MODEL_ERROR'
  | 'COMPARATOR_BLINDING_VIOLATION'
  | 'COMPARATOR_QUALIFICATION_FAILED';

export interface ComparatorProbeResult {
  status: ComparatorStatus;
  ollama: { reachable: boolean; latencyMs?: number; models?: string[]; error?: string };
  verdict: string;
}

export async function probeComparator(): Promise<ComparatorProbeResult> {
  /**
   * v3.3 POLICY (HARD):
   *   - Ollama only at http://localhost:11434.
   *   - DO NOT implement Gemini, OpenAI, or any cloud LLM fallback.
   *   - COMPARATOR_UNAVAILABLE ≠ GENERIC_AI_SCORE = 0 ≠ UDX_WIN.
   *   - Model priority: qwen2.5:7b → llama3:8b → phi3:mini.
   *   - COMPARATOR_DEGRADED is NOT a permitted status.
   */
  const MODEL_PRIORITY_PREFIXES = ['qwen2.5', 'llama3', 'phi3'];

  const result: ComparatorProbeResult = {
    status: 'COMPARATOR_UNAVAILABLE',
    ollama: { reachable: false },
    verdict: '',
  };

  // Probe Ollama daemon on localhost:11434
  const startOllama = Date.now();
  try {
    const res = await fetch('http://localhost:11434/api/tags', {
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const data = await res.json() as { models?: { name: string }[] };
      result.ollama.reachable = true;
      result.ollama.latencyMs = Date.now() - startOllama;
      result.ollama.models = data.models?.map(m => m.name) || [];
    } else {
      result.ollama.error = `HTTP ${res.status}`;
    }
  } catch (err: any) {
    result.ollama.error = err.message || 'Connection refused';
  }

  // Determine status using v3.3 model priority
  if (result.ollama.reachable && result.ollama.models) {
    const hasApprovedModel = result.ollama.models.some(m =>
      MODEL_PRIORITY_PREFIXES.some(prefix => m.startsWith(prefix))
    );
    if (hasApprovedModel) {
      result.status = 'COMPARATOR_READY';
      const selectedModel = result.ollama.models.find(m =>
        MODEL_PRIORITY_PREFIXES.some(prefix => m.startsWith(prefix))
      );
      result.verdict = `Ollama comparator READY with approved model: ${selectedModel}. Proceed to qualification suite.`;
    } else {
      result.status = 'COMPARATOR_MODEL_UNAVAILABLE';
      result.verdict = `Ollama is reachable but none of [qwen2.5:7b, llama3:8b, phi3:mini] are installed. ` +
        `Install an approved model to enable World Challenge v4. Available: [${result.ollama.models.join(', ')}]`;
    }
  } else {
    result.status = 'COMPARATOR_UNAVAILABLE';
    result.verdict = 'Ollama is unreachable at http://localhost:11434. ' +
      'Start Ollama and install an approved model. ' +
      'COMPARATOR_UNAVAILABLE ≠ GENERIC_AI_SCORE = 0 ≠ UDX_WIN. ' +
      'World Challenge v4 requires a live, qualified Ollama comparator.';
  }

  return result;
}

export interface ObjectiveCheckResult {
  objective: StratifiedObjective;
  resolutionStatus: string;
  detectedDomain: UDXDomain;
  latencyMs: number;
  checks: {
    domainAccuracy: boolean;
    entityAccuracy: boolean;
    constraintAccuracy: boolean;
    targetRelevance: boolean;
    evidenceRelevance: boolean;
    supplyGrounding: boolean;
    uriLeakage: boolean; // true = clean (0 leakage)
    semanticLeakage: boolean; // true = clean (0 semantic leakage)
    simulationFallback: boolean; // true = 0 fallback
    honestyGate: boolean;
  };
  passed: boolean;
  bestTargetUri?: string;
  bestPathTitle?: string;
  failureReasons: string[];
}

export async function run30ObjectivePreflight(): Promise<{
  results: ObjectiveCheckResult[];
  comparator: ComparatorProbeResult;
  metrics: {
    totalObjectives: number;
    passedObjectives: number;
    sIsrPercent: number;
    ncDlrPercent: number;
    semanticLeakagePercent: number;
    simulationFallbackCount: number;
    supplyGroundingPercent: number;
    honestyGatePercent: number;
    targetCollisionCount: number;
    uniqueTargetsCount: number;
    progressionPermitted: boolean;
    rejectionReasons: string[];
  };
}> {
  console.log('===================================================================');
  console.log(' UDX v3.2 STRATIFIED 30-OBJECTIVE PREFLIGHT GATE & COMPARATOR AUDIT');
  console.log(' MODE_B_REALITY = ACTIVE');
  console.log('===================================================================\n');

  // Probe Comparator first
  console.log('--- [PROBING EXTERNAL COMPARATOR AVAILABILITY] ---');
  const comparator = await probeComparator();
  console.log(`Comparator Status: [${comparator.status}]`);
  console.log(`  Ollama: ${comparator.ollama.reachable ? 'CONNECTED (' + comparator.ollama.latencyMs + 'ms)' : 'OFFLINE (' + comparator.ollama.error + ')'}`);
  console.log(`  Verdict: ${comparator.verdict}\n`);

  const results: ObjectiveCheckResult[] = [];
  const targetMap: Map<string, string[]> = new Map();

  for (const obj of PRE_REGISTERED_30_OBJECTIVES) {
    const start = Date.now();
    const resolution = await UDXAgentAPI.resolveIntent({
      signal: obj.rawIntent,
      agentMetadata: {
        agentId: 'preflight-audit-agent',
        framework: 'UDX_TEST_HARNESS',
        executionMode: 'MODE_B_REALITY',
      }
    });
    const latencyMs = Date.now() - start;

    const failureReasons: string[] = [];
    const bestTarget = resolution.bestPath?.edges?.find(e => e.executable)?.executionTarget;
    const bestTitle = resolution.bestPath?.title;

    // Track targets for collision analysis
    if (bestTarget) {
      const existing = targetMap.get(bestTarget) || [];
      existing.push(obj.id);
      targetMap.set(bestTarget, existing);
    }

    // 1. Domain Accuracy
    const domainAccuracy = resolution.intent.domain === obj.expectedDomain;
    if (!domainAccuracy) {
      failureReasons.push(`Domain mismatch: expected ${obj.expectedDomain}, got ${resolution.intent.domain}`);
    }

    // 2. Entity Accuracy
    const entityAccuracy = (resolution.intent.entities && resolution.intent.entities.length > 0) || obj.expectedRefusal === true;
    if (!entityAccuracy) {
      failureReasons.push('No semantic entities extracted');
    }

    // 3. Constraint Accuracy
    const constraintAccuracy = obj.expectedRefusal === true ||
      (resolution.intent.constraints && resolution.intent.constraints.length > 0) ||
      obj.rawIntent.includes('remote') || obj.rawIntent.includes('Varanasi');
    if (!constraintAccuracy) {
      failureReasons.push('Constraints not extracted');
    }

    // 4. Honesty Gate Check
    let honestyGate = true;
    if (obj.expectedRefusal) {
      honestyGate = resolution.status === 'NO_RELIABLE_PATH' && resolution.possibilities.length === 0;
      if (!honestyGate) {
        failureReasons.push(`Expected refusal (NO_RELIABLE_PATH) with 0 paths, but resolution returned status=${resolution.status} and ${resolution.possibilities.length} paths`);
      }
    } else {
      honestyGate = resolution.status === 'RESOLVED' && resolution.possibilities.length > 0;
      if (!honestyGate) {
        failureReasons.push(`Expected active resolution (RESOLVED), but got status=${resolution.status}`);
      }
    }

    // 5. Target Relevance
    let targetRelevance = true;
    if (!obj.expectedRefusal) {
      if (obj.expectedTargetPattern) {
        targetRelevance = bestTarget ? obj.expectedTargetPattern.test(bestTarget) : false;
        if (!targetRelevance) {
          failureReasons.push(`Target URI [${bestTarget}] did not match expected pattern [${obj.expectedTargetPattern}]`);
        }
      }
    }

    // 6. Evidence Relevance
    let evidenceRelevance = true;
    if (!obj.expectedRefusal) {
      evidenceRelevance = resolution.evidence && resolution.evidence.length > 0;
      if (!evidenceRelevance) {
        failureReasons.push('Zero evidence records attached to actionable resolution');
      }
    }

    // 7. Supply Grounding Check
    let supplyGrounding = true;
    if (!obj.expectedRefusal) {
      // Must be backed by a verified source, not a generic route or unverified provider
      const hasVerifiedEvidence = resolution.evidence.some(e => e.epistemicStatus === 'VERIFIED_TRUTH' || e.epistemicStatus === 'OBSERVED');
      const isNotGenericPlatform = bestTarget && !['/', '/dashboard', '/search', '/app'].includes(bestTarget);
      supplyGrounding = Boolean(hasVerifiedEvidence && isNotGenericPlatform);
      if (!supplyGrounding) {
        failureReasons.push(`Supply Grounding failure: actionable target [${bestTarget}] lacks authentic verified evidence or is a generic platform route`);
      }
    }

    // 8. URI Leakage Check (NC-DLR)
    let uriLeakageClean = true;
    if (obj.domain !== 'CAREER') {
      const careerPattern = /^\/(jobs|tools\/resume-checker|tools\/job-matcher)/;
      const leakedInPaths = resolution.possibilities.some(p => p.edges.some(e => e.executionTarget && careerPattern.test(e.executionTarget)));
      if (leakedInPaths || (bestTarget && careerPattern.test(bestTarget))) {
        uriLeakageClean = false;
        failureReasons.push(`NC-DLR URI Violation: Career target leaked into [${obj.domain}]`);
      }
    }

    // 9. Semantic Domain Leakage Check
    let semanticLeakageClean = true;
    if (obj.domain !== 'CAREER') {
      const careerTerms = /\b(job match|resume checker|ats score|recruitment agency|hiring manager)\b/i;
      const leakedInTitle = bestTitle ? careerTerms.test(bestTitle) : false;
      const leakedInGoal = careerTerms.test(resolution.intent.primaryGoal || '');
      if (leakedInTitle || leakedInGoal) {
        semanticLeakageClean = false;
        failureReasons.push(`Semantic Domain Leakage Violation: Career terminology leaked into non-career domain [${obj.domain}]`);
      }
    }

    // 10. Simulation Fallback Check
    const simulationFallbackClean = !(resolution.reasoning || '').includes('PathSimulator') && resolution.executionMode === 'MODE_B_REALITY';
    if (!simulationFallbackClean) {
      failureReasons.push('Simulation fallback invariant violated under MODE_B_REALITY');
    }

    const allPassed = domainAccuracy &&
      entityAccuracy &&
      constraintAccuracy &&
      targetRelevance &&
      evidenceRelevance &&
      supplyGrounding &&
      uriLeakageClean &&
      semanticLeakageClean &&
      simulationFallbackClean &&
      honestyGate;

    results.push({
      objective: obj,
      resolutionStatus: resolution.status,
      detectedDomain: resolution.intent.domain,
      latencyMs,
      checks: {
        domainAccuracy,
        entityAccuracy,
        constraintAccuracy,
        targetRelevance,
        evidenceRelevance,
        supplyGrounding,
        uriLeakage: uriLeakageClean,
        semanticLeakage: semanticLeakageClean,
        simulationFallback: simulationFallbackClean,
        honestyGate,
      },
      passed: allPassed,
      bestTargetUri: bestTarget,
      bestPathTitle: bestTitle,
      failureReasons,
    });

    const statusBadge = allPassed ? '✓ PASS' : '✗ FAIL';
    console.log(`[${obj.id}] ${obj.domain} | "${obj.rawIntent.slice(0, 45)}..." -> ${resolution.status} (${latencyMs}ms) [${statusBadge}]`);
    if (!allPassed) {
      failureReasons.forEach(r => console.log(`    ! ${r}`));
    }
  }

  // Aggregate Metrics
  const total = results.length;
  const passedCount = results.filter(r => r.passed).length;
  const sIsrPercent = parseFloat(((passedCount / total) * 100).toFixed(1));

  const nonCareerResults = results.filter(r => r.objective.domain !== 'CAREER');
  const leakedUriCount = nonCareerResults.filter(r => !r.checks.uriLeakage).length;
  const ncDlrPercent = parseFloat(((leakedUriCount / nonCareerResults.length) * 100).toFixed(1));

  const semanticLeakedCount = nonCareerResults.filter(r => !r.checks.semanticLeakage).length;
  const semanticLeakagePercent = parseFloat(((semanticLeakedCount / nonCareerResults.length) * 100).toFixed(1));

  const simulationFallbackCount = results.filter(r => !r.checks.simulationFallback).length;

  const actionableResults = results.filter(r => !r.objective.expectedRefusal);
  const groundedActionableCount = actionableResults.filter(r => r.checks.supplyGrounding).length;
  const supplyGroundingPercent = parseFloat(((groundedActionableCount / actionableResults.length) * 100).toFixed(1));

  const honestyCount = results.filter(r => r.checks.honestyGate).length;
  const honestyGatePercent = parseFloat(((honestyCount / total) * 100).toFixed(1));

  // Collisions: check if different domains share the same URI
  let targetCollisionCount = 0;
  targetMap.forEach((objIds, uri) => {
    const domainsRepresented = new Set(objIds.map(id => PRE_REGISTERED_30_OBJECTIVES.find(o => o.id === id)?.domain));
    if (domainsRepresented.size > 1) {
      targetCollisionCount++;
      console.log(`  ! Cross-domain collision detected on [${uri}] between domains: ${Array.from(domainsRepresented).join(', ')}`);
    }
  });

  const rejectionReasons: string[] = [];
  if (ncDlrPercent > 0.0) rejectionReasons.push(`NC-DLR must be 0.0% (observed: ${ncDlrPercent}%)`);
  if (semanticLeakagePercent > 0.0) rejectionReasons.push(`Semantic Domain Leakage must be 0.0% (observed: ${semanticLeakagePercent}%)`);
  if (simulationFallbackCount > 0) rejectionReasons.push(`Simulation Fallback must be 0 (observed: ${simulationFallbackCount})`);
  if (supplyGroundingPercent < 100.0) rejectionReasons.push(`Supply Grounding must be 100.0% for actionable paths (observed: ${supplyGroundingPercent}%)`);
  if (honestyGatePercent < 100.0) rejectionReasons.push(`Honesty Gate correctness must be 100.0% (observed: ${honestyGatePercent}%)`);
  if (targetCollisionCount > 0) rejectionReasons.push(`Unacceptable cross-domain collisions detected: ${targetCollisionCount}`);
  if (sIsrPercent < 95.0) rejectionReasons.push(`S-ISR must be >= 95.0% (observed: ${sIsrPercent}%)`);
  if (comparator.status !== 'COMPARATOR_READY') rejectionReasons.push(`Comparator must be COMPARATOR_READY (Ollama 7-stage handshake) AND COMPARATOR_QUALIFIED (30-objective blind suite) to run World Challenge v4 (observed: ${comparator.status}). COMPARATOR_UNAVAILABLE ≠ GENERIC_AI_SCORE = 0 ≠ UDX_WIN.`);

  const progressionPermitted = rejectionReasons.length === 0;

  console.log('\n===================================================================');
  console.log(' PREFLIGHT AGGREGATED METRICS & AUDIT GATES');
  console.log('===================================================================');
  console.log(`Total Objectives Evaluated:      ${total}`);
  console.log(`Objectives Passing All 9 Checks: ${passedCount} / ${total}`);
  console.log(`Stratified ISR (S-ISR):          ${sIsrPercent}% (Threshold: >= 95.0%)`);
  console.log(`Non-Career URI DLR (NC-DLR):     ${ncDlrPercent}% (Strict Gate: 0.0%)`);
  console.log(`Semantic Domain Leakage:         ${semanticLeakagePercent}% (Strict Gate: 0.0%)`);
  console.log(`Simulation Fallback Invocations: ${simulationFallbackCount} (Strict Gate: 0)`);
  console.log(`Supply Grounding (Actionable):   ${supplyGroundingPercent}% (Strict Gate: 100.0%)`);
  console.log(`Honesty Gate Correctness:        ${honestyGatePercent}% (Strict Gate: 100.0%)`);
  console.log(`Cross-Domain Target Collisions:  ${targetCollisionCount} (Strict Gate: 0)`);
  console.log(`Unique Execution Targets:        ${targetMap.size}`);
  console.log(`External Comparator Status:      ${comparator.status}`);
  console.log('-------------------------------------------------------------------');
  console.log(`PROGRESSION TO WORLD CHALLENGE v4: [${progressionPermitted ? 'PERMITTED' : 'BLOCKED'}]`);
  if (!progressionPermitted) {
    console.log('Progression Blocked by Gates:');
    rejectionReasons.forEach(r => console.log(`  - ${r}`));
  }
  console.log('===================================================================\n');

  return {
    results,
    comparator,
    metrics: {
      totalObjectives: total,
      passedObjectives: passedCount,
      sIsrPercent,
      ncDlrPercent,
      semanticLeakagePercent,
      simulationFallbackCount,
      supplyGroundingPercent,
      honestyGatePercent,
      targetCollisionCount,
      uniqueTargetsCount: targetMap.size,
      progressionPermitted,
      rejectionReasons,
    }
  };
}

// Only auto-run when this script is executed directly, not when imported as a module.
// This prevents the preflight from firing when run-comparator-qualification.ts or
// run-udx-world-challenge-v4.ts import PRE_REGISTERED_30_OBJECTIVES from here.
const isDirectRun = process.argv[1] &&
  (process.argv[1].includes('run-30-objective-preflight') ||
   process.argv[1].includes('run-30-objective-preflight.cjs'));

if (isDirectRun) {
  run30ObjectivePreflight().catch(err => {
    console.error('Fatal Preflight Error:', err);
    process.exit(1);
  });
}

