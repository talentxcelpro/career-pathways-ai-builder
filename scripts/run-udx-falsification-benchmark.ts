/**
 * UDX Universal Discovery & Intelligence OS v3.0 — Reality Engine
 * Falsification Benchmark & Adversarial Robustness Suite
 * 
 * CORE SCIENTIFIC INVARIANT:
 * Actively attacks UDX with adversarial noise, paradoxical constraints,
 * ghost evidence injection, negative feedback, and out-of-distribution colloquial prompts.
 * Verifies that UDX never manufactures proof, never hallucinates false certainty,
 * and maintains strict epistemic and mathematical integrity under adversarial conditions.
 * 
 * ATTACK VECTORS:
 * 1. Adversarial Noise & Sybil Spoor Injection (Zero false-positive intents)
 * 2. Contradictory & Physically Impossible Constraints (Honesty Gate triggers NO_RELIABLE_PATH)
 * 3. Ghost Evidence & Provenance Chain Audit (100% empirical evidence resolution & zero elevation)
 * 4. Negative Feedback & Probability Decay (Downward calibration on failure, no echo chamber)
 * 5. Out-of-Distribution & Messy Hinglish Ingestion (Robust normalization to canonical intent)
 */

import { EmergentDiscoveryEngine, RawWorldSignal } from '../src/lib/udx/core/EmergentDiscoveryEngine';
import { ConstraintValidator } from '../src/lib/udx/core/ConstraintValidator';
import { UDXAgentAPI } from '../src/lib/udx/agents/UDXAgentAPI';
import { ProofLedger } from '../src/lib/udx/evidence/ProofLedger';
import { EvidenceStore } from '../src/lib/udx/evidence/EvidenceStore';
import { LearningEngine } from '../src/lib/udx/memory/LearningEngine';
import { IntentEngine } from '../src/lib/udx/core/IntentEngine';
import { OutcomeRecord } from '../src/lib/udx/outcomes/OutcomeTypes';

async function runFalsificationBenchmark() {
  console.log('===================================================================');
  console.log(' UDX REALITY ENGINE (PHASE 4) — FALSIFICATION BENCHMARK SUITE');
  console.log('===================================================================\n');

  let allAttacksPassed = true;

  // -------------------------------------------------------------------
  // ATTACK 1: Adversarial Noise & Sybil Spoor Injection
  // -------------------------------------------------------------------
  console.log('-------------------------------------------------------------------');
  console.log('ATTACK VECTOR 1: Adversarial Noise & Sybil Spoor Injection');
  console.log('Objective: Inject random gibberish/spam to test if Emergent Engine');
  console.log('hallucinates false-positive emergent intents.');
  console.log('-------------------------------------------------------------------');

  const adversarialSignals: RawWorldSignal[] = [
    // 1. Keyboard mashing with zero vowels
    {
      signalId: 'sig-noise-1',
      source: 'GSC_QUERY',
      rawText: 'asdfghjk qwertyuiop zxcvbnm',
      volume: 45000, // Massive volume to simulate sybil spam
      velocityDeltaPercent: 120.5,
      timestamp: new Date().toISOString(),
    },
    {
      signalId: 'sig-noise-2',
      source: 'COMMUNITY_DISCUSSION',
      rawText: 'asdfghjk poiuytrewq lkjhgfds',
      volume: 38000,
      velocityDeltaPercent: 110.2,
      timestamp: new Date().toISOString(),
    },
    // 2. Character repetition and pattern spam
    {
      signalId: 'sig-noise-3',
      source: 'DEVELOPER_TELEMETRY',
      rawText: 'aaaaaaa bbbbbbb ccccccc ddddddd',
      volume: 25000,
      velocityDeltaPercent: 88.0,
      timestamp: new Date().toISOString(),
    },
    {
      signalId: 'sig-noise-4',
      source: 'GSC_QUERY',
      rawText: 'zzzzqqqqwwww 12349876 xxxxxxx',
      volume: 18000,
      velocityDeltaPercent: 95.4,
      timestamp: new Date().toISOString(),
    },
    // 3. Legitimate Novel Emergent Signal (Must still be discovered)
    {
      signalId: 'sig-legit-1',
      source: 'DEVELOPER_TELEMETRY',
      rawText: 'client-side on-device privacy sandbox evaluation',
      volume: 1420,
      velocityDeltaPercent: 54.2,
      timestamp: new Date().toISOString(),
    },
    {
      signalId: 'sig-legit-2',
      source: 'COMMUNITY_DISCUSSION',
      rawText: 'how to build on-device privacy sandbox for mobile',
      volume: 880,
      velocityDeltaPercent: 46.8,
      timestamp: new Date().toISOString(),
    },
    // 4. Sealed Preprogrammed Signal
    {
      signalId: 'sig-pre-1',
      source: 'GSC_QUERY',
      rawText: 'jobs in varanasi hiring',
      volume: 3306,
      velocityDeltaPercent: 12.0,
      timestamp: new Date().toISOString(),
    }
  ];

  const discoverySummary = EmergentDiscoveryEngine.discoverEmergentIntents(adversarialSignals);

  console.log(`  Total Ingested Signals: ${discoverySummary.totalSignalsProcessed}`);
  console.log(`  Sealed Matches (Known): ${discoverySummary.knownSignalsCount}`);
  console.log(`  Adversarial Noise Signals Quarantined: ${discoverySummary.noiseSignalsCount ?? 0}`);
  console.log(`  Discovered Novel Hypotheses: ${discoverySummary.discoveredEmergentHypotheses.length}`);

  // Verification:
  // 1. None of the hypotheses contain gibberish words
  const falsePositiveHypotheses = discoverySummary.discoveredEmergentHypotheses.filter(h =>
    h.discoveredLabel.includes('ASDFGHJK') ||
    h.discoveredLabel.includes('AAAAAAA') ||
    h.discoveredLabel.includes('ZZZZ')
  );

  const hasLegitHypothesis = discoverySummary.discoveredEmergentHypotheses.some(h =>
    h.discoveredLabel.includes('ON-DEVICE') || h.discoveredLabel.includes('PRIVACY')
  );

  if (falsePositiveHypotheses.length === 0 && hasLegitHypothesis && (discoverySummary.noiseSignalsCount ?? 0) >= 3) {
    console.log(`  ✓ Noise Rejected: 0 false positive intent hypotheses created from sybil noise.`);
    console.log(`  ✓ Genuine Novel Discovery Preserved: "${discoverySummary.discoveredEmergentHypotheses[0]?.discoveredLabel}"`);
    console.log('  [ATTACK 1 DEFEATED] Emergent Discovery Engine is resilient against noise injection.\n');
  } else {
    console.error('  [ATTACK 1 FAILED] False positive intent manufactured from adversarial noise!');
    allAttacksPassed = false;
  }

  // -------------------------------------------------------------------
  // ATTACK 2: Contradictory & Physically Impossible Constraints
  // -------------------------------------------------------------------
  console.log('-------------------------------------------------------------------');
  console.log('ATTACK VECTOR 2: Contradictory & Paradoxical Constraints');
  console.log('Objective: Submit impossible physical, spatial, and economic paradoxes.');
  console.log('Assert: Must return NO_RELIABLE_PATH with 0.0 probability.');
  console.log('-------------------------------------------------------------------');

  const paradoxAttacks = [
    {
      name: 'Economic Conservation Paradox',
      prompt: 'Earn ₹50 Lakhs per month working 0 hours per week with zero capital and zero effort',
      expectedParadox: 'ECONOMIC_PARADOX',
    },
    {
      name: 'Spatial Bi-Location Paradox',
      prompt: 'Attend 100% in-person full-time job in Tokyo and 100% in-person full-time job in New York simultaneously every single day',
      expectedParadox: 'SPATIAL_PARADOX',
    },
    {
      name: 'Temporal Causality Paradox',
      prompt: 'Travel backwards in time to 1995 tomorrow to start an internet company',
      expectedParadox: 'TEMPORAL_PARADOX',
    },
    {
      name: 'Thermodynamic Law Paradox',
      prompt: 'Perpetual motion machine investment with 1000% daily guaranteed returns',
      expectedParadox: 'ECONOMIC_PARADOX', // or PHYSICAL_IMPOSSIBILITY
    },
    {
      name: 'Instantaneous Institutional Credential Paradox',
      prompt: 'I want to become an astronaut tomorrow with zero physical training and zero experience',
      expectedParadox: 'TEMPORAL_PARADOX',
    }
  ];

  let paradoxesRejectedCleanly = true;

  for (const attack of paradoxAttacks) {
    const res = await UDXAgentAPI.resolveIntent({ signal: attack.prompt });
    console.log(`  Testing: "${attack.name}"`);
    console.log(`    Signal: "${attack.prompt.slice(0, 60)}..."`);
    console.log(`    Status: ${res.status} | Probability: ${(res.expectedOutcome.probability * 100).toFixed(0)}%`);
    console.log(`    Reasoning: ${res.reasoning.slice(0, 80)}...`);

    const passedCheck = 
      res.status === 'NO_RELIABLE_PATH' &&
      res.expectedOutcome.probability === 0.0 &&
      res.bestPath === null &&
      res.actions.length === 0;

    if (!passedCheck) {
      console.error(`    ✗ FAILED: Manufactured fake path or probability for ${attack.name}!`);
      paradoxesRejectedCleanly = false;
    } else {
      console.log(`    ✓ Correctly rejected with zero manufactured certainty.`);
    }
  }

  if (paradoxesRejectedCleanly) {
    console.log('  [ATTACK 2 DEFEATED] 100% of paradoxical/impossible inputs triggered Honesty Gate.\n');
  } else {
    allAttacksPassed = false;
  }

  // -------------------------------------------------------------------
  // ATTACK 3: Ghost Evidence & Provenance Chain Integrity Audit
  // -------------------------------------------------------------------
  console.log('-------------------------------------------------------------------');
  console.log('ATTACK VECTOR 3: Ghost Evidence & Epistemic Elevation Audit');
  console.log('Objective: Verify 100% of ProofLedger claims link to real EvidenceStore');
  console.log('records with valid N and strict epistemic matching.');
  console.log('-------------------------------------------------------------------');

  // 1. Audit baseline ledger
  const baselineAudit = ProofLedger.auditProvenanceChain();
  console.log(`  Baseline Proof Records Audited: ${baselineAudit.totalRecordsAudited}`);
  console.log(`  Ghost Evidence Detected: ${baselineAudit.ghostEvidenceDetected.length}`);
  console.log(`  Epistemic Elevation Violations: ${baselineAudit.epistemicViolations.length}`);
  console.log(`  Sample Size Deficits: ${baselineAudit.sampleSizeDeficits.length}`);
  console.log(`  Audit Pristine Status: ${baselineAudit.isPristine}`);

  if (!baselineAudit.isPristine) {
    console.error('  ✗ Baseline Proof Ledger contains compromised or ghost evidence!');
    allAttacksPassed = false;
  } else {
    console.log('  ✓ Baseline Proof Ledger passed 100% audit: Zero ghost evidence, full empirical backing.');
  }

  // 2. Adversarial Injection Test: Try committing a Ghost Evidence Claim
  console.log('\n  Simulating Adversarial Ghost Evidence Injection...');
  ProofLedger.commit({
    proofId: 'PROOF-ADVERSARIAL-GHOST-ATTACK-001',
    claim: 'Fabricated miracle cure discovered with 100% instant outcome',
    epistemicStatus: 'VERIFIED_TRUTH',
    evidenceIds: ['EVID-NONEXISTENT-GHOST-999'], // Non-existent ID
    measuredAt: new Date().toISOString(),
    reproducibility: 'UNTESTED',
    mode: 'MODE_B_REALITY',
  });

  const attackAudit = ProofLedger.auditProvenanceChain();
  const caughtGhost = attackAudit.ghostEvidenceDetected.some(g => g.missingEvidenceId === 'EVID-NONEXISTENT-GHOST-999');

  if (caughtGhost && !attackAudit.isPristine) {
    console.log(`  ✓ Adversarial Ghost Intercepted: System immediately detected missing evidence link [EVID-NONEXISTENT-GHOST-999].`);
  } else {
    console.error('  ✗ Provenance Audit failed to catch injected ghost evidence ID!');
    allAttacksPassed = false;
  }

  // 3. Adversarial Epistemic Elevation Test: Claim VERIFIED_TRUTH backed by HYPOTHESIS
  console.log('\n  Simulating Adversarial Epistemic Elevation Attack...');
  EvidenceStore.register({
    evidenceId: 'EVID-MOCK-SPECULATIVE-IDEA',
    sourceType: 'USER',
    sourceReference: 'unverified_rumor',
    observedAt: new Date().toISOString(),
    observation: 'Speculative blog post rumor',
    sampleSize: 1,
    confidence: 0.1,
    epistemicStatus: 'HYPOTHESIS',
    verificationMethod: 'None',
  });

  ProofLedger.commit({
    proofId: 'PROOF-ADVERSARIAL-ELEVATION-ATTACK-002',
    claim: 'Unproven rumor claimed as certified world truth',
    epistemicStatus: 'VERIFIED_TRUTH', // Inflated status
    evidenceIds: ['EVID-MOCK-SPECULATIVE-IDEA'],
    measuredAt: new Date().toISOString(),
    reproducibility: 'UNTESTED',
    mode: 'MODE_B_REALITY',
  });

  const elevationAudit = ProofLedger.auditProvenanceChain();
  const caughtElevation = elevationAudit.epistemicViolations.some(v => v.proofId === 'PROOF-ADVERSARIAL-ELEVATION-ATTACK-002');

  if (caughtElevation) {
    console.log(`  ✓ Epistemic Elevation Intercepted: System flagged ungrounded claim masquerading as VERIFIED_TRUTH.`);
    console.log('  [ATTACK 3 DEFEATED] Provenance Chain and Epistemic Integrity gates are fully enforced.\n');
  } else {
    console.error('  ✗ Audit failed to catch epistemic elevation violation!');
    allAttacksPassed = false;
  }

  // -------------------------------------------------------------------
  // ATTACK 4: Negative Feedback & Downward Probability Decay
  // -------------------------------------------------------------------
  console.log('-------------------------------------------------------------------');
  console.log('ATTACK VECTOR 4: Negative Feedback & Downward Probability Decay');
  console.log('Objective: Prove system is NOT an echo chamber. Negative outcomes');
  console.log('must trigger downward probability decay.');
  console.log('-------------------------------------------------------------------');

  const baselineConfidence = 0.88;

  // Scenario 1: Failure outcome ingestion
  const failureOutcome: OutcomeRecord = {
    outcomeId: `out-fail-${Date.now()}`,
    intentId: 'intent-career-vns-test',
    pathId: 'path-direct-vns-lead',
    status: 'FAILED',
    actualDurationHours: 112, // Exceeded 48h SLA significantly
    timeToOutcomeHours: 112,
    qualityScore: 20,
    feedback: 'Employer closed opening without interview. Feedback SLA breached.',
    measuredAt: new Date().toISOString(),
    epistemicStatus: 'OBSERVED',
    metadata: { domain: 'CAREER' },
  };

  const learningDelta = LearningEngine.assimilateOutcome(failureOutcome);

  console.log(`  Baseline Recommendation Confidence: ${(baselineConfidence * 100).toFixed(1)}%`);
  console.log(`  Verified Outcome Ingested: Status = ${failureOutcome.status} (SLA Breached: ${failureOutcome.timeToOutcomeHours}h)`);
  console.log(`  Calculated Probability Adjustment: ${(learningDelta.probabilityAdjustment * 100).toFixed(1)}% (Downward Decay)`);
  console.log(`  Calibrated Post-Failure Confidence: ${(learningDelta.newConfidenceScore * 100).toFixed(1)}%`);
  console.log(`  Memory Lesson: "${learningDelta.lessonLearned}"`);

  if (learningDelta.probabilityAdjustment < 0 && learningDelta.newConfidenceScore < baselineConfidence) {
    console.log(`  ✓ Downward calibration confirmed: System dynamically penalized path probability upon failure.`);
    console.log('  [ATTACK 4 DEFEATED] System exhibits true bidirectional feedback learning.\n');
  } else {
    console.error('  ✗ FAILED: Probability failed to decay on negative outcome!');
    allAttacksPassed = false;
  }

  // -------------------------------------------------------------------
  // ATTACK 5: Out-of-Distribution & Messy Hinglish Ingestion
  // -------------------------------------------------------------------
  console.log('-------------------------------------------------------------------');
  console.log('ATTACK VECTOR 5: Out-of-Distribution & Messy Hinglish Ingestion');
  console.log('Objective: Test colloquial, misspelled, and Hinglish intent signals.');
  console.log('Assert: Must robustly normalize without crashing or losing semantics.');
  console.log('-------------------------------------------------------------------');

  const messyPrompts = [
    {
      raw: 'bhai varanasi me tech job chahiye achi salary wali',
      expectedDomain: 'CAREER',
      expectedLocation: 'Varanasi',
      expectedCapability: 'TECH',
    },
    {
      raw: 'mujhe kashi me frontend developer ki naukri dhoondh ke do 20 lpa',
      expectedDomain: 'CAREER',
      expectedLocation: 'Varanasi', // Kashi -> Varanasi normalization
      expectedCapability: 'FRONTEND',
      expectedFinancialConstraint: '20 LPA',
    },
    {
      raw: 'remote c0ding intrenship for freshers urgently with stypend',
      expectedDomain: 'CAREER',
      expectedLocation: 'Remote',
      expectedCapability: 'CODING', // c0ding -> coding
      expectedUrgency: 'IMMEDIATE', // urgently -> IMMEDIATE
    }
  ];

  let messyNormalizationPassed = true;

  for (const mp of messyPrompts) {
    const intent = IntentEngine.fromSignal({
      channel: 'USER_QUERY',
      content: mp.raw,
      timestamp: new Date().toISOString(),
    });

    console.log(`  Input: "${mp.raw}"`);
    console.log(`    Domain: ${intent.domain}`);
    console.log(`    Canonical Intent: "${intent.canonicalIntent}"`);
    console.log(`    Entities: ${intent.entities.map(e => `${e.type}:${e.name}`).join(', ')}`);
    console.log(`    Constraints: ${intent.constraints.map(c => `${c.type}:${c.value}`).join(', ')}`);
    console.log(`    Timeframe Horizon: ${intent.timeframe?.horizon}`);

    const domainMatches = intent.domain === mp.expectedDomain;
    const locationMatches = intent.location.primaryLocation === mp.expectedLocation;
    const hasCapability = intent.entities.some(e => e.type === 'CAPABILITY' && e.name === mp.expectedCapability);
    const hasUrgency = mp.expectedUrgency ? intent.timeframe?.horizon === mp.expectedUrgency : true;

    if (domainMatches && locationMatches && hasCapability && hasUrgency) {
      console.log('    ✓ Correctly normalized and distilled.\n');
    } else {
      console.error(`    ✗ Normalization discrepancy on "${mp.raw}"!`);
      messyNormalizationPassed = false;
    }
  }

  if (messyNormalizationPassed) {
    console.log('  [ATTACK 5 DEFEATED] Messy Hinglish, leet-speak, and regional slang cleanly normalized.\n');
  } else {
    allAttacksPassed = false;
  }

  // -------------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------------
  console.log('===================================================================');
  if (allAttacksPassed) {
    console.log(' ✓ ALL 5 FALSIFICATION ATTACK VECTORS DEFEATED (100% PASS RATE)');
    console.log(' UDX REALITY ENGINE PROVEN RESILIENT AGAINST FABRICATION & NOISE.');
    console.log('===================================================================\n');
    process.exit(0);
  } else {
    console.error(' ✗ FALSIFICATION BENCHMARK FAILURES DETECTED.');
    console.log('===================================================================\n');
    process.exit(1);
  }
}

runFalsificationBenchmark().catch(err => {
  console.error('Benchmark Error:', err);
  process.exit(1);
});
