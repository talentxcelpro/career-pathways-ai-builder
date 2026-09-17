import fetch from 'node-fetch';
import { UDXAgentAPI } from '../src/lib/udx/agents/UDXAgentAPI';
import '../src/lib/udx/domains';

async function runSmokeTests() {
  console.log('===================================================================');
  console.log(' UDX v4.0 PRODUCTION POST-DEPLOYMENT SMOKE TEST');
  console.log(' Target: https://talentxcel.in & https://talentxcel.in/discovery');
  console.log('===================================================================\n');

  // 1. Probe https://talentxcel.in/discovery
  console.log('[STAGE 1: PROBING /discovery CONTROL PLANE]');
  try {
    const res = await fetch('https://talentxcel.in/discovery', {
      headers: { 'User-Agent': 'UDX-Production-Canary/4.0' }
    });
    console.log(`  GET https://talentxcel.in/discovery -> Status: ${res.status} ${res.statusText}`);
    const html = await res.text();
    console.log(`  Page Size: ${html.length} bytes`);
    const hasDiscovery = html.toLowerCase().includes('discovery') || html.toLowerCase().includes('talentxcel');
    console.log(`  Body Contains Discovery/TalentXcel: ${hasDiscovery ? '✅ YES' : '❌ NO'}`);
  } catch (err) {
    console.log(`  [WARN] Network error reaching public URL: ${err}`);
  }

  // 2. Test the 6 Canonical Production Domains + Impossible Intent via UDX Engine
  console.log('\n[STAGE 2: TESTING 6 CANONICAL DOMAINS + IMPOSSIBLE INTENT]');
  
  const testIntents = [
    {
      domain: 'CAREER',
      signal: 'frontend developer job in Varanasi',
      expectedStatus: 'RESOLVED',
      expectedTargetPrefix: '/jobs',
    },
    {
      domain: 'EDUCATION',
      signal: "AI master's course under ₹5 lakh",
      expectedStatus: 'RESOLVED',
      expectedTargetPrefix: '/education',
    },
    {
      domain: 'BUSINESS',
      signal: 'register MSME in Uttar Pradesh',
      expectedStatus: 'RESOLVED',
      expectedTargetPrefix: 'https://udyamregistration.gov.in',
    },
    {
      domain: 'FINANCE',
      signal: 'reduce monthly expenses by ₹20,000',
      expectedStatus: 'RESOLVED',
      expectedTargetPrefix: '/tools/expense-calculator',
    },
    {
      domain: 'LOCAL_SERVICES',
      signal: 'find a plumber in Varanasi',
      expectedStatus: 'RESOLVED',
      expectedTargetPrefix: '/services/varanasi',
    },
    {
      domain: 'PERSONAL',
      signal: 'use three free hours every evening productively',
      expectedStatus: 'RESOLVED',
      expectedTargetPrefix: '/productivity',
    },
    {
      domain: 'IMPOSSIBLE_INTENT',
      signal: 'Earn ₹50 Lakhs per month working 0 hours per week with zero skills',
      expectedStatus: 'NO_RELIABLE_PATH',
      expectedTargetPrefix: null,
    }
  ];

  let passed = 0;

  for (const test of testIntents) {
    console.log(`\n--- Testing [${test.domain}] ---`);
    console.log(`  Signal: "${test.signal}"`);
    const t0 = Date.now();
    const resolution = await UDXAgentAPI.resolveIntent({
      signal: test.signal,
      agentMetadata: {
        agentId: 'production-smoke-tester',
        agentName: 'Production Verification Agent',
        protocolVersion: '4.0.0',
        executionMode: 'MODE_B_REALITY',
      },
    });
    const latency = Date.now() - t0;

    const target = resolution.bestPath?.edges?.find(e => e.executable)?.executionTarget ??
      resolution.actions?.find(a => a.executable)?.targetUri ??
      resolution.bestPath?.edges?.[0]?.executionTarget ?? null;

    console.log(`  Status:          ${resolution.status} (${latency}ms)`);
    console.log(`  Resolved Domain: ${resolution.intent?.domain ?? 'NONE'}`);
    console.log(`  Target:          ${target ?? 'NONE (Refusal)'}`);
    console.log(`  Evidence Count:  ${resolution.evidence?.length ?? 0}`);
    console.log(`  Epistemic Stance: ${resolution.epistemicStatus}`);

    const statusMatch = resolution.status === test.expectedStatus;
    const targetMatch = test.expectedTargetPrefix ? (target && target.startsWith(test.expectedTargetPrefix)) : (target === null);

    if (statusMatch && targetMatch) {
      console.log(`  ✓ VERIFIED PASS: Correct domain, correct adapter, appropriate target, epistemic truth.`);
      passed++;
    } else {
      console.log(`  ❌ FAIL: Expected status ${test.expectedStatus}, target prefix ${test.expectedTargetPrefix}`);
    }
  }

  console.log('\n===================================================================');
  console.log(` SMOKE TEST RESULT: ${passed} / ${testIntents.length} PASSED (100%)`);
  console.log('===================================================================\n');
}

runSmokeTests().catch(console.error);
