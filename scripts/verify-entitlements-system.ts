// scripts/verify-entitlements-system.ts
// Automated Test Suite for TalentXcel Career Accelerator Entitlements & Razorpay Infrastructure

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://dthlgsnakhoftinssokm.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface TestResult {
  name: string;
  passed: boolean;
  detail: string;
}

const results: TestResult[] = [];

function record(name: string, passed: boolean, detail: string) {
  results.push({ name, passed, detail });
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} [${passed ? 'PASS' : 'FAIL'}] ${name}: ${detail}`);
}

async function runTests() {
  console.log('================================================================');
  console.log('🧪 TALENTXCEL CAREER ACCELERATOR SUITE: LIVE VERIFICATION');
  console.log(`Target: ${SUPABASE_URL}`);
  console.log('================================================================\n');

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. Edge Functions Auth Gating (Unauthenticated requests MUST fail closed)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('--- 1. Testing AI Edge Functions Auth Gates (Must Fail Closed with 401) ---');

  const edgeFunctionsToTest = [
    { name: 'ats-analyzer', body: { resumeData: {} } },
    { name: 'comprehensive-ats-analyzer', body: { resumeData: {} } },
    { name: 'enhance-resume', body: { action: 'enhance_section', content: 'test' } },
    { name: 'generate-interview-prep', body: { resumeData: {}, jobTitle: 'Developer' } },
  ];

  for (const fn of edgeFunctionsToTest) {
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/${fn.name}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          // Intentionally omitting Authorization Bearer header
        },
        body: JSON.stringify(fn.body)
      });

      const bodyText = await res.text();
      let parsed: any = {};
      try { parsed = JSON.parse(bodyText); } catch (_) {}

      if (res.status === 401 && (bodyText.includes('Authentication required') || parsed.code === 'UNAUTHENTICATED')) {
        record(
          `Edge Function Auth Gate: ${fn.name}`,
          true,
          `HTTP ${res.status} returned as expected. Body: "${parsed.error || bodyText.slice(0, 60)}"`
        );
      } else if (res.status === 401) {
        record(
          `Edge Function Auth Gate: ${fn.name}`,
          true,
          `HTTP 401 Unauthorized confirmed.`
        );
      } else {
        record(
          `Edge Function Auth Gate: ${fn.name}`,
          false,
          `Expected HTTP 401, got HTTP ${res.status}. Response: ${bodyText.slice(0, 100)}`
        );
      }
    } catch (err: any) {
      record(`Edge Function Auth Gate: ${fn.name}`, false, `Network error: ${err.message}`);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. Razorpay Edge Functions Gating
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n--- 2. Testing Razorpay Edge Functions Gating ---');

  // Test razorpay-create-order without user token
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/razorpay-create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ amount: 199, currency: 'INR', planId: 'career-starter' })
    });
    const body = await res.json();
    if (res.status >= 400 && body.error?.includes('authorization header')) {
      record('razorpay-create-order unauth check', true, `Correctly rejected: "${body.error}" (HTTP ${res.status})`);
    } else {
      record('razorpay-create-order unauth check', false, `Status: ${res.status}, body: ${JSON.stringify(body)}`);
    }
  } catch (err: any) {
    record('razorpay-create-order unauth check', false, err.message);
  }

  // Test razorpay-verify-payment without user token
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/razorpay-verify-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ razorpay_order_id: 'test', razorpay_payment_id: 'test' })
    });
    const body = await res.json();
    if (res.status === 401 && body.error?.includes('Authentication required')) {
      record('razorpay-verify-payment unauth check', true, `Correctly rejected: "${body.error}" (HTTP 401)`);
    } else {
      record('razorpay-verify-payment unauth check', false, `Status: ${res.status}, body: ${JSON.stringify(body)}`);
    }
  } catch (err: any) {
    record('razorpay-verify-payment unauth check', false, err.message);
  }

  // Test razorpay webhook mode without signature
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/razorpay-verify-payment?mode=webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ event: 'subscription.charged' })
    });
    const bodyText = await res.text();
    if (res.status === 400 && bodyText.includes('signature')) {
      record('Razorpay Webhook Mode: Missing Signature Check', true, `Correctly rejected missing signature (HTTP 400): ${bodyText.slice(0, 60)}`);
    } else {
      record('Razorpay Webhook Mode: Missing Signature Check', false, `Status: ${res.status}, body: ${bodyText.slice(0, 100)}`);
    }
  } catch (err: any) {
    record('Razorpay Webhook Mode: Missing Signature Check', false, err.message);
  }

  // Test razorpay webhook mode with invalid signature
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/razorpay-verify-payment?mode=webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'x-razorpay-signature': 'invalid_forged_signature_hex'
      },
      body: JSON.stringify({ event: 'subscription.charged' })
    });
    const bodyText = await res.text();
    if (res.status === 400 && bodyText.includes('Invalid webhook signature')) {
      record('Razorpay Webhook Mode: Forged Signature Check', true, `Correctly rejected forged signature (HTTP 400): ${bodyText.slice(0, 60)}`);
    } else if (res.status === 500 && bodyText.includes('Webhook secret not configured')) {
      record('Razorpay Webhook Mode: Security Fail-Closed', true, `Correctly fails closed (HTTP 500) until RAZORPAY_WEBHOOK_SECRET is configured in Supabase Secrets.`);
    } else {
      record('Razorpay Webhook Mode: Forged Signature Check', false, `Status: ${res.status}, body: ${bodyText.slice(0, 100)}`);
    }
  } catch (err: any) {
    record('Razorpay Webhook Mode: Forged Signature Check', false, err.message);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. Database Migration RPC Health
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n--- 3. Testing Database Migration RPCs (subscribers & quotas) ---');

  // Test check_user_subscription (legacy RPC that reads subscribers)
  const dummyUserId = '00000000-0000-0000-0000-000000000000';
  try {
    const { data, error } = await supabase.rpc('check_user_subscription', { user_uuid: dummyUserId });
    if (!error) {
      record('Database RPC: check_user_subscription', true, `Function exists and executed cleanly. Returned: ${JSON.stringify(data)}`);
    } else {
      record('Database RPC: check_user_subscription', false, `RPC error: ${error.message}`);
    }
  } catch (err: any) {
    record('Database RPC: check_user_subscription', false, err.message);
  }

  // Test resolve_subscription_tier
  try {
    const { data, error } = await supabase.rpc('resolve_subscription_tier', { p_user_id: dummyUserId });
    if (!error) {
      record('Database RPC: resolve_subscription_tier', true, `Function exists. Resolved tier: "${data}" (free expected for dummy UUID)`);
    } else if (error.message.includes('does not exist')) {
      record('Database RPC: resolve_subscription_tier', false, `MIGRATION NEEDED: Function 'resolve_subscription_tier' not yet applied in Supabase.`);
    } else {
      record('Database RPC: resolve_subscription_tier', false, `Error: ${error.message}`);
    }
  } catch (err: any) {
    record('Database RPC: resolve_subscription_tier', false, err.message);
  }

  // Test tier_quota_limit
  try {
    const { data: limitStarter, error: errStarter } = await supabase.rpc('tier_quota_limit', {
      p_tier: 'starter',
      p_feature_type: 'ats_check'
    });
    const { data: limitPro, error: errPro } = await supabase.rpc('tier_quota_limit', {
      p_tier: 'pro',
      p_feature_type: 'ats_check'
    });

    if (!errStarter && !errPro && limitStarter === 5 && limitPro === -1) {
      record('Database RPC: tier_quota_limit', true, `Starter limit = ${limitStarter}, Pro limit = ${limitPro} (unlimited) as defined`);
    } else if (errStarter?.message.includes('does not exist')) {
      record('Database RPC: tier_quota_limit', false, `MIGRATION NEEDED: Function 'tier_quota_limit' not yet applied in Supabase.`);
    } else {
      record('Database RPC: tier_quota_limit', false, `Returned: starter=${limitStarter}, pro=${limitPro}, error=${errStarter?.message || errPro?.message}`);
    }
  } catch (err: any) {
    record('Database RPC: tier_quota_limit', false, err.message);
  }

  // Test get_user_entitlement
  try {
    const { data, error } = await supabase.rpc('get_user_entitlement', { p_user_id: dummyUserId });
    if (!error && data) {
      record('Database RPC: get_user_entitlement', true, `Snapshot generated successfully. Tier: ${data.tier}, Features: ${Object.keys(data.usage || {}).join(', ')}`);
    } else if (error?.message.includes('does not exist')) {
      record('Database RPC: get_user_entitlement', false, `MIGRATION NEEDED: Function 'get_user_entitlement' not yet applied in Supabase.`);
    } else {
      record('Database RPC: get_user_entitlement', false, `Error: ${error?.message}`);
    }
  } catch (err: any) {
    record('Database RPC: get_user_entitlement', false, err.message);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Summary
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n================================================================');
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = total - passed;
  console.log(`TEST SUMMARY: ${passed}/${total} PASSED (${failed} FAILED)`);
  console.log('================================================================');

  if (failed > 0) {
    process.exitCode = 1;
  }
}

runTests();
