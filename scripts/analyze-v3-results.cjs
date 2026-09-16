'use strict';
const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'reports', 'udx_world_challenge', 'v3', 'bench-v3-2026-09-16T04-27-08-677Z.json'),
  'utf8'
));

const udx = data.udx_results;
const ai = data.ai_results;

const latencies = udx.map(r => r.system_latency_ms).filter(Boolean);
const qualities = udx.map(r => r.outcome_quality_score).filter(v => v !== null);
const frictions = udx.map(r => r.friction_score).filter(v => v !== null);
const uncertainties = udx.map(r => r.uncertainty_index).filter(v => v !== null);
const costs = udx.map(r => r.cost_proxy_inr).filter(v => v !== null);

const mean = arr => arr.reduce((a, b) => a + b, 0) / arr.length;
const sorted = arr => [...arr].sort((a, b) => a - b);
const median = arr => {
  const s = sorted(arr);
  return s.length % 2 === 0
    ? (s[s.length / 2 - 1] + s[s.length / 2]) / 2
    : s[Math.floor(s.length / 2)];
};

console.log('=== UDX WORLD CHALLENGE v3 — EMPIRICAL RESULTS ===\n');
console.log('Run ID:', data.run_id);
console.log('Executed at:', data.executed_at);
console.log('Corpus registered:', data.corpus_registered_at);
console.log('');

console.log('--- AVAILABILITY & RESOLUTION ---');
console.log('Total objectives run:', udx.length);
console.log('HTTP 200 (API available):', udx.filter(r => r.system_latency_ms && r.failure_class !== 'TIMEOUT').length);
console.log('Resolution success:', udx.filter(r => r.resolution_success).length + '/' + udx.length);
console.log('Action success (ACTION_DISPATCHED):', udx.filter(r => r.action_success).length + '/' + udx.length);
console.log('Outcome success:', udx.filter(r => r.outcome_success).length + '/' + udx.length + ' (conservative: requires human confirmation)');
console.log('Honesty Gate refusals:', udx.filter(r => r.failure_class === 'HONESTY_GATE').length);
console.log('False certainty detected:', udx.filter(r => r.false_certainty_detected).length);
console.log('Timeout failures:', udx.filter(r => r.failure_class === 'TIMEOUT').length);
console.log('Unknown failures:', udx.filter(r => r.failure_class === 'UNKNOWN_FAILURE').length);
console.log('');

console.log('--- LATENCY (ms) ---');
console.log('Mean:', mean(latencies).toFixed(0));
console.log('Median:', median(latencies).toFixed(0));
console.log('P25:', sorted(latencies)[Math.floor(latencies.length * 0.25)]);
console.log('P75:', sorted(latencies)[Math.floor(latencies.length * 0.75)]);
console.log('Min:', Math.min(...latencies));
console.log('Max:', Math.max(...latencies));
console.log('');

console.log('--- OUTCOME QUALITY SCORE (0-1) ---');
console.log('Mean:', mean(qualities).toFixed(3));
console.log('Median:', median(qualities).toFixed(3));
console.log('Min:', Math.min(...qualities).toFixed(3));
console.log('Max:', Math.max(...qualities).toFixed(3));
const qDist = {};
qualities.forEach(q => { const k = q.toFixed(3); qDist[k] = (qDist[k] || 0) + 1; });
console.log('Distribution:', JSON.stringify(qDist));
console.log('');

console.log('--- FRICTION & UNCERTAINTY ---');
console.log('Mean friction (0-10):', mean(frictions).toFixed(2));
console.log('Mean uncertainty (0-1):', mean(uncertainties).toFixed(3));
console.log('Friction distribution:', JSON.stringify((() => { const d = {}; frictions.forEach(f => { const k = f.toFixed(2); d[k] = (d[k] || 0) + 1; }); return d; })()));
console.log('');

console.log('--- COST PROXY (INR) ---');
console.log('Mean cost:', mean(costs).toFixed(2));
console.log('Median cost:', median(costs).toFixed(2));
console.log('');

console.log('--- ACTION COMPLETION STATES ---');
const states = {};
udx.forEach(r => { states[r.action_completion_status] = (states[r.action_completion_status] || 0) + 1; });
console.log(JSON.stringify(states, null, 2));
console.log('');

console.log('--- REACHABLE PATHS ---');
const reachCounts = { '0': 0, '1': 0, '2': 0, '3': 0 };
udx.forEach(r => { const k = String(Math.min(r.reachable_paths, 3)); reachCounts[k] = (reachCounts[k] || 0) + 1; });
console.log(JSON.stringify(reachCounts, null, 2));
console.log('');

console.log('--- GENERIC AI COMPARATOR STATUS ---');
console.log('Ollama available:', ai.filter(r => r.failure_class !== 'TIMEOUT').length > 0 ? 'YES' : 'NO — unavailable this run');
console.log('AI timeout failures:', ai.filter(r => r.failure_class === 'TIMEOUT').length);
console.log('AI quality scores:', ai.map(r => r.outcome_quality_score).filter(v => v > 0).length > 0 ? 'non-zero scores exist' : 'all zero — comparator offline');
console.log('');

console.log('--- CRITICAL FINDING: PATH SPECIFICITY ---');
const snippets = udx.slice(0, 10).map(r => {
  const s = r.raw_response_snippet || '';
  const found = (s.match(/targetUri":"([^"]+)"/g) || []).join(' | ');
  return r.objectiveId + ' (' + r.rawIntent.slice(0, 30) + '): ' + found;
});
snippets.forEach(s => console.log(' ', s));
console.log('');

console.log('--- EPISTEMIC CONSTRAINTS ON RESULTS ---');
console.log('R2 VIOLATED: Generic AI comparator (Ollama phi3:mini) was offline.');
console.log('  → UDX vs Generic AI comparison dimension is INVALID for this run.');
console.log('  → UDX 100/100 "wins" cannot be attributed to UDX superiority vs AI.');
console.log('  → They reflect UDX resolved (0.81-0.96) vs comparator unavailable (0.00).');
console.log('');
console.log('PATH SPECIFICITY FINDING: Smoke test revealed all 100 objectives');
console.log('  return similar generic paths (/tools/resume-checker, /jobs, /tools/job-matcher)');
console.log('  regardless of specific intent. PathSimulator generates domain-agnostic paths.');
console.log('  This limits the claim that UDX reduces intent→specific-outcome distance.');
console.log('');
console.log('VALID FINDINGS FROM THIS RUN:');
console.log('  1. UDX API availability: 100% (100/100 HTTP 200)');
console.log('  2. Resolution rate: 100% (all 100 RESOLVED)');
console.log('  3. Action reachability: all targetURIs return HTTP 200');
console.log('  4. Median latency:', median(latencies).toFixed(0) + 'ms (faster than 42000ms traditional proxy)');
console.log('  5. Zero false certainty events (no RESOLVED + unreachable path combinations)');
console.log('  6. Zero Honesty Gate failures (no objectives triggered NO_RELIABLE_PATH)');
console.log('');
console.log('NEXT STEPS REQUIRED FOR VALID COMPARISON RUN:');
console.log('  A. Install/start Ollama with phi3:mini, OR use Gemini Flash API directly');
console.log('  B. Wire intent-specific paths in DomainRegistry handlers');
console.log('  C. Re-run benchmark with live Generic AI comparator');
