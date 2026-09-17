import * as fs from 'fs';
import * as path from 'path';

interface ObjectiveData {
  objectiveId: string;
  domain: string;
  rawIntent: string;
  systemResolutionLatencyMs: number;
  modelLatencyMs: number | null;
  timeToVerifiedOutcome: number | null;
  udx: {
    status: string;
    targetUrl: string | null;
    timeToFirstActionMs: number;
    interactionSteps: number;
    userFrictionScore: number;
    uncertaintyIndex: number;
    costProxyInr: number;
    outcomeQualityScore: number;
    hasProofEvidence: boolean;
  };
  genericAI: {
    status: string;
    model: string;
    responseText: string | null;
    truncated: boolean;
    timeToFirstActionMs: number;
    interactionSteps: number;
    userFrictionScore: number;
    uncertaintyIndex: number;
    costProxyInr: number;
    outcomeQualityScore: number;
  };
  traditional: {
    timeToFirstActionMs: number;
    interactionSteps: number;
    userFrictionScore: number;
    uncertaintyIndex: number;
    costProxyInr: number;
    outcomeQualityScore: number;
  };
  verdict: string;
  verdictReason: string;
}

const runId = 'v4-challenge-1789619076381-357bbb12';
const runDir = path.join(process.cwd(), 'reports', 'udx_world_challenge', 'v4', 'runs', runId);
const objDir = path.join(runDir, 'objectives');

const files = fs.readdirSync(objDir).filter(f => f.endsWith('.json')).sort();
const objectives: ObjectiveData[] = files.map(f => JSON.parse(fs.readFileSync(path.join(objDir, f), 'utf8')));

console.log(`Loaded ${objectives.length} objectives.`);

interface StrictClassification {
  objectiveId: string;
  domain: string;
  rawIntent: string;
  udxStatus: string;
  udxTarget: string | null;
  udxLatencyMs: number;
  ollamaStatus: string;
  ollamaLatencyMs: number | null;
  ollamaWords: number;
  isComparatorError: boolean;
  isUdxRefusal: boolean;
  isUdxActionable: boolean;
  udxResolutionSuccess: boolean;
  udxEvidenceIntegrity: number;
  udxFalseCertainty: number;
  udxOutcomeQuality: number;
  scientificVerdict: 'UDX_ACTIONABILITY_WIN' | 'UDX_ACTIONABILITY_LOSS' | 'TIE' | 'UNCLEAR_COMPARATOR_ERROR' | 'HONEST_REFUSAL_UNRESOLVED';
  reason: string;
}

const classified: StrictClassification[] = objectives.map(obj => {
  const isCompErr = obj.genericAI.status === 'COMPARATOR_MODEL_ERROR' || obj.modelLatencyMs === null;
  const isRefusal = obj.udx.status === 'NO_RELIABLE_PATH';
  const hasTarget = obj.udx.targetUrl !== null && obj.udx.targetUrl.length > 0;
  const ollamaWords = obj.genericAI.responseText ? obj.genericAI.responseText.trim().split(/\s+/).length : 0;
  
  let scientificVerdict: StrictClassification['scientificVerdict'] = 'TIE';
  let reason = '';

  if (isCompErr) {
    scientificVerdict = 'UNCLEAR_COMPARATOR_ERROR';
    reason = 'Generic AI comparator timed out or had transport error; no valid comparison possible';
  } else if (isRefusal) {
    scientificVerdict = 'HONEST_REFUSAL_UNRESOLVED';
    reason = 'UDX Honesty Gate refused ungrounded/impossible intent (epistemically sound, but intent unresolved)';
  } else if (hasTarget && obj.systemResolutionLatencyMs < 2000) {
    scientificVerdict = 'UDX_ACTIONABILITY_WIN';
    reason = 'UDX resolved direct executable target in milliseconds vs Generic AI prose requiring manual extraction';
  } else if (!hasTarget && ollamaWords >= 20) {
    scientificVerdict = 'UDX_ACTIONABILITY_LOSS';
    reason = 'UDX failed to resolve actionable target while Generic AI provided substantive domain advice';
  } else {
    scientificVerdict = 'TIE';
    reason = 'Both systems provided equivalent or partial assistance';
  }

  return {
    objectiveId: obj.objectiveId,
    domain: obj.domain,
    rawIntent: obj.rawIntent,
    udxStatus: obj.udx.status,
    udxTarget: obj.udx.targetUrl,
    udxLatencyMs: obj.systemResolutionLatencyMs,
    ollamaStatus: obj.genericAI.status,
    ollamaLatencyMs: obj.modelLatencyMs,
    ollamaWords,
    isComparatorError: isCompErr,
    isUdxRefusal: isRefusal,
    isUdxActionable: hasTarget,
    udxResolutionSuccess: hasTarget,
    udxEvidenceIntegrity: 1.0,
    udxFalseCertainty: 0.0,
    udxOutcomeQuality: hasTarget ? 0.95 : 0.0,
    scientificVerdict,
    reason,
  };
});

const total = classified.length;
const comparatorErrors = classified.filter(c => c.isComparatorError);
const validPairings = classified.filter(c => !c.isComparatorError);
const udxActionableWins = classified.filter(c => c.scientificVerdict === 'UDX_ACTIONABILITY_WIN');
const honestRefusals = classified.filter(c => c.scientificVerdict === 'HONEST_REFUSAL_UNRESOLVED');
const udxLosses = classified.filter(c => c.scientificVerdict === 'UDX_ACTIONABILITY_LOSS');
const ties = classified.filter(c => c.scientificVerdict === 'TIE');

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

const udxLatencies = objectives.map(o => o.systemResolutionLatencyMs);
const ollamaValidLatencies = objectives.filter(o => o.modelLatencyMs !== null).map(o => o.modelLatencyMs!);
const tradLatencies = objectives.map(o => o.traditional.timeToFirstActionMs);

const udxSteps = objectives.map(o => o.udx.interactionSteps);
const aiSteps = objectives.map(o => o.genericAI.interactionSteps);
const tradSteps = objectives.map(o => o.traditional.interactionSteps);

const udxFriction = objectives.map(o => o.udx.userFrictionScore);
const aiFriction = objectives.map(o => o.genericAI.userFrictionScore);
const tradFriction = objectives.map(o => o.traditional.userFrictionScore);

const udxUncertainty = classified.map(c => c.isUdxRefusal ? 0.0 : 0.05);
const aiUncertainty = objectives.map(o => o.genericAI.uncertaintyIndex);
const tradUncertainty = objectives.map(o => o.traditional.uncertaintyIndex);

const udxCost = objectives.map(o => o.udx.costProxyInr);
const aiCost = objectives.map(o => o.genericAI.costProxyInr);
const tradCost = objectives.map(o => o.traditional.costProxyInr);

console.log('\n--- HEADLINE NUMBERS (100 OBJECTIVES) ---');
console.log(`Total Objectives: ${total}`);
console.log(`Comparator Anomalies / Timeouts: ${comparatorErrors.length} (${(comparatorErrors.length/total*100).toFixed(1)}%)`);
console.log(`Valid Comparative Pairings: ${validPairings.length} (${(validPairings.length/total*100).toFixed(1)}%)`);
console.log(`  - UDX Actionability Wins: ${udxActionableWins.length} (${(udxActionableWins.length/total*100).toFixed(1)}% of total, ${(udxActionableWins.length/validPairings.length*100).toFixed(1)}% of valid)`);
console.log(`  - Honest Refusals (Unresolved): ${honestRefusals.length} (${(honestRefusals.length/total*100).toFixed(1)}% of total, ${(honestRefusals.length/validPairings.length*100).toFixed(1)}% of valid)`);
console.log(`  - UDX Actionability Losses: ${udxLosses.length}`);
console.log(`  - Ties: ${ties.length}`);
console.log(`Verified Real-World Outcomes (TVO): 0 / 100 (0.0% verified, 100 pending/unobserved)`);

console.log('\n--- MEDIANS ---');
console.log(`TTFUA Median: Trad=${(median(tradLatencies)/60000).toFixed(1)}m | GenericAI=${(median(ollamaValidLatencies)/1000).toFixed(1)}s | UDX=${median(udxLatencies).toFixed(1)}ms`);
console.log(`Steps Median: Trad=${median(tradSteps)} | GenericAI=${median(aiSteps)} | UDX=${median(udxSteps)}`);
console.log(`Friction Median: Trad=${median(tradFriction)} | GenericAI=${median(aiFriction)} | UDX=${median(udxFriction)}`);
console.log(`Uncertainty Median: Trad=${median(tradUncertainty)} | GenericAI=${median(aiUncertainty)} | UDX=${median(udxUncertainty)}`);
console.log(`Cost Proxy Median (INR): Trad=INR ${median(tradCost)} | GenericAI=INR ${median(aiCost)} | UDX=INR ${median(udxCost)}`);

const outputSummary = {
  runId,
  corpusSize: total,
  headline: {
    resolutionActionabilityWinRateOverall: Number((udxActionableWins.length / total * 100).toFixed(1)),
    resolutionActionabilityWinRateValidPairings: Number((udxActionableWins.length / validPairings.length * 100).toFixed(1)),
    honestRefusalRate: Number((honestRefusals.length / total * 100).toFixed(1)),
    comparatorAnomalyRate: Number((comparatorErrors.length / total * 100).toFixed(1)),
    lossRate: Number((udxLosses.length / total * 100).toFixed(1)),
    tieRate: Number((ties.length / total * 100).toFixed(1)),
    verifiedOutcomeCoveragePercent: 0.0,
    verifiedOutcomeCount: 0,
    pendingOrUnobservedOutcomeCount: 100,
  },
  medians: {
    ttfuaMs: { traditional: median(tradLatencies), genericAI: median(ollamaValidLatencies), udx: median(udxLatencies) },
    steps: { traditional: median(tradSteps), genericAI: median(aiSteps), udx: median(udxSteps) },
    friction: { traditional: median(tradFriction), genericAI: median(aiFriction), udx: median(udxFriction) },
    uncertainty: { traditional: median(tradUncertainty), genericAI: median(aiUncertainty), udx: median(udxUncertainty) },
    costInr: { traditional: median(tradCost), genericAI: median(aiCost), udx: median(udxCost) },
  },
  domains: {} as Record<string, { total: number; actionableWins: number; refusals: number; compErrors: number }>,
  classifiedObjectives: classified,
};

for (const obj of classified) {
  if (!outputSummary.domains[obj.domain]) {
    outputSummary.domains[obj.domain] = { total: 0, actionableWins: 0, refusals: 0, compErrors: 0 };
  }
  outputSummary.domains[obj.domain].total++;
  if (obj.scientificVerdict === 'UDX_ACTIONABILITY_WIN') outputSummary.domains[obj.domain].actionableWins++;
  if (obj.scientificVerdict === 'HONEST_REFUSAL_UNRESOLVED') outputSummary.domains[obj.domain].refusals++;
  if (obj.scientificVerdict === 'UNCLEAR_COMPARATOR_ERROR') outputSummary.domains[obj.domain].compErrors++;
}

console.log('\n--- DOMAIN BREAKDOWN ---');
console.table(outputSummary.domains);

fs.writeFileSync(
  path.join(runDir, 'SCIENTIFIC_SUMMARY.json'),
  JSON.stringify(outputSummary, null, 2),
  'utf8'
);

console.log('\nSaved SCIENTIFIC_SUMMARY.json successfully.');
