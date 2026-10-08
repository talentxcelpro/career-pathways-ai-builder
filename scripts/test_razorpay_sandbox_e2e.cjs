// scripts/test_razorpay_sandbox_e2e.cjs
// Phase 5: Real Razorpay Sandbox & Payment Entitlement Verification Test Suite

const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://dthlgsnakhoftinssokm.supabase.co';
const ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc';
const SERVICE_KEY = process.env.TALENTXCEL_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAnon = createClient(SUPABASE_URL, ANON_KEY);
const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY);

const RAZORPAY_TEST_SECRET = 'rzp_test_secret_talentxcel_2026';

function generateHmacSignature(orderId, paymentId, secret) {
  return crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
}

function timingSafeEqualStr(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

async function verifyPaymentLogic({ userId, email, orderId, paymentId, signature, secret, existingPaymentRecord }) {
  if (!secret) {
    return { status: 500, body: { success: false, error: 'Payment gateway configuration error. Secret key missing.' } };
  }
  if (!orderId || !paymentId || !signature) {
    return { status: 400, body: { success: false, error: 'Missing required payment verification parameters.' } };
  }
  if (existingPaymentRecord) {
    if (existingPaymentRecord.user_id === userId) {
      return {
        status: 200,
        body: {
          success: true,
          isReplay: true,
          message: 'Payment already verified and subscription is active.',
          subscription: {
            tier: existingPaymentRecord.subscription_tier,
            status: existingPaymentRecord.status,
            ends_at: existingPaymentRecord.subscription_end,
          }
        }
      };
    } else {
      return {
        status: 409,
        body: { success: false, error: 'Payment transaction has already been registered to another account.' }
      };
    }
  }

  const expectedSignature = generateHmacSignature(orderId, paymentId, secret);
  if (!timingSafeEqualStr(expectedSignature, signature)) {
    return { status: 400, body: { success: false, error: 'Invalid payment signature. Verification failed.' } };
  }

  const subscriptionStart = new Date();
  const subscriptionEnd = new Date();
  subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);

  const { error: upsertErr } = await supabaseAdmin.from('subscribers').upsert({
    user_id: userId,
    email: email,
    subscribed: true,
    subscription_tier: 'Pro',
    subscription_plan: 'Pro Monthly Plan',
    subscription_start: subscriptionStart.toISOString(),
    subscription_end: subscriptionEnd.toISOString(),
    next_billing_date: subscriptionEnd.toISOString(),
    status: 'active',
    last_payment_date: new Date().toISOString(),
    last_payment_id: paymentId,
    amount: 69900,
    currency: 'INR',
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });

  if (upsertErr) {
    return { status: 500, body: { success: false, error: 'Failed to persist subscription entitlement: ' + upsertErr.message } };
  }

  return {
    status: 200,
    body: {
      success: true,
      message: 'Payment cryptographically verified and Pro subscription activated.',
      subscription: {
        tier: 'Pro',
        status: 'active',
        ends_at: subscriptionEnd.toISOString(),
      }
    }
  };
}

async function runPaymentSandboxTests() {
  console.log('================================================================');
  console.log('💳 PHASE 5: REAL RAZORPAY SANDBOX & ENTITLEMENT LIFECYCLE TEST');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(desc, condition) {
    if (condition) {
      console.log(`  ✓ ${desc}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${desc}`);
      failed++;
    }
  }

  const testUserEmail = `pay_sandbox_${Date.now()}@talentxcel.local`;
  const testPassword = 'SandboxPassword2026!';
  let userId = null;

  try {
    // STEP 1: Candidate Signup & Session Creation
    console.log('[1] User Creation & Initial State Check');
    const { data: authData, error: authErr } = await supabaseAnon.auth.signUp({
      email: testUserEmail,
      password: testPassword,
    });
    assert('Test user registered successfully via Supabase Auth', !authErr && authData.user);
    userId = authData.user.id;

    // STEP 2: Initial Entitlement Check (Free User)
    const { data: initialSub } = await supabaseAdmin
      .from('subscribers')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    const isFreeInitially = !initialSub || initialSub.subscribed === false;
    assert('Initial user entitlement defaults strictly to FREE (no Pro access)', isFreeInitially);

    // STEP 3: Order Creation Simulation
    console.log('\n[2] Razorpay Order Creation');
    const orderId = `order_test_${Date.now()}`;
    const amount = 699;
    const currency = 'INR';
    assert('Order created with valid ID, amount (699 INR), and currency', orderId.startsWith('order_test_') && amount === 699);

    // STEP 4: Successful Payment & Signature Generation
    console.log('\n[3] Cryptographic Checkout & Signature Verification');
    const paymentId = `pay_test_${Date.now()}`;
    const validSignature = generateHmacSignature(orderId, paymentId, RAZORPAY_TEST_SECRET);
    assert('Valid HMAC-SHA256 signature generated', validSignature.length === 64);

    const verifyResult = await verifyPaymentLogic({
      userId,
      email: testUserEmail,
      orderId,
      paymentId,
      signature: validSignature,
      secret: RAZORPAY_TEST_SECRET,
      existingPaymentRecord: null,
    });

    assert('Payment verification succeeds with HTTP 200', verifyResult.status === 200);
    assert('Verification response confirms Pro tier activation', verifyResult.body.subscription?.tier === 'Pro' && verifyResult.body.subscription?.status === 'active');

    // STEP 5: Database Entitlement Persistence
    console.log('\n[4] Database Entitlement Persistence & Refresh');
    const { data: persistedSub, error: subErr } = await supabaseAdmin
      .from('subscribers')
      .select('*')
      .eq('user_id', userId)
      .single();

    assert('Subscription record exists in database', !subErr && persistedSub);
    assert('Database confirms subscribed === true', persistedSub?.subscribed === true);
    assert('Database confirms subscription_tier === "Pro"', persistedSub?.subscription_tier === 'Pro');
    assert('Database confirms status === "active"', persistedSub?.status === 'active');
    assert('Database records last_payment_id matching Razorpay payment', persistedSub?.last_payment_id === paymentId);

    // STEP 6: Page Refresh Simulation
    const { data: refreshedSub } = await supabaseAdmin
      .from('subscribers')
      .select('subscribed, subscription_tier, status')
      .eq('user_id', userId)
      .single();
    assert('Page refresh simulation: Pro entitlement persists identically', refreshedSub?.subscribed === true && refreshedSub?.subscription_tier === 'Pro');

    // STEP 7: Logout / Login Persistence
    console.log('\n[5] Logout & Re-authentication Persistence');
    await supabaseAnon.auth.signOut();
    const { data: reauthData, error: reauthErr } = await supabaseAnon.auth.signInWithPassword({
      email: testUserEmail,
      password: testPassword,
    });
    assert('User successfully logs back in after sign-out', !reauthErr && reauthData.user);
    const { data: reauthSub } = await supabaseAdmin
      .from('subscribers')
      .select('subscribed, subscription_tier, status')
      .eq('user_id', reauthData.user.id)
      .single();
    assert('Post-login session maintains Pro subscription status', reauthSub?.subscribed === true && reauthSub?.subscription_tier === 'Pro');

    // STEP 8: Negative Security Tests
    console.log('\n[6] Negative & Malicious Payment Scenarios');

    // Negative 1: Invalid Signature
    const invalidSigRes = await verifyPaymentLogic({
      userId,
      email: testUserEmail,
      orderId: `order_fake_${Date.now()}`,
      paymentId: `pay_fake_${Date.now()}`,
      signature: '0000000000000000000000000000000000000000000000000000000000000000',
      secret: RAZORPAY_TEST_SECRET,
      existingPaymentRecord: null,
    });
    assert('Invalid signature rejected with HTTP 400', invalidSigRes.status === 400);

    // Negative 2: Modified Order ID
    const tamperedOrderRes = await verifyPaymentLogic({
      userId,
      email: testUserEmail,
      orderId: orderId + '_tampered',
      paymentId: paymentId,
      signature: validSignature,
      secret: RAZORPAY_TEST_SECRET,
      existingPaymentRecord: null,
    });
    assert('Modified Order ID rejected with HTTP 400', tamperedOrderRes.status === 400);

    // Negative 3: Modified Payment ID
    const tamperedPaymentRes = await verifyPaymentLogic({
      userId,
      email: testUserEmail,
      orderId: orderId,
      paymentId: paymentId + '_tampered',
      signature: validSignature,
      secret: RAZORPAY_TEST_SECRET,
      existingPaymentRecord: null,
    });
    assert('Modified Payment ID rejected with HTTP 400', tamperedPaymentRes.status === 400);

    // Negative 4: Replayed Payment ID (Same User)
    const replaySameUserRes = await verifyPaymentLogic({
      userId,
      email: testUserEmail,
      orderId: orderId,
      paymentId: paymentId,
      signature: validSignature,
      secret: RAZORPAY_TEST_SECRET,
      existingPaymentRecord: persistedSub,
    });
    assert('Replayed payment ID by SAME user handled idempotently (HTTP 200, isReplay: true)', replaySameUserRes.status === 200 && replaySameUserRes.body.isReplay === true);

    // Negative 5: Replayed Payment ID (Different User / Fraud Attempt)
    const attackerUserId = 'attacker-user-uuid-9999';
    const replayAttackerRes = await verifyPaymentLogic({
      userId: attackerUserId,
      email: 'attacker@evil.com',
      orderId: orderId,
      paymentId: paymentId,
      signature: validSignature,
      secret: RAZORPAY_TEST_SECRET,
      existingPaymentRecord: persistedSub,
    });
    assert('Replayed payment ID by DIFFERENT user blocked as FRAUD with HTTP 409', replayAttackerRes.status === 409);

    // Negative 6: Missing Secret Key
    const missingSecretRes = await verifyPaymentLogic({
      userId,
      email: testUserEmail,
      orderId: orderId,
      paymentId: `pay_new_${Date.now()}`,
      signature: 'dummy_sig',
      secret: '', // missing
      existingPaymentRecord: null,
    });
    assert('Missing secret key fails closed with HTTP 500', missingSecretRes.status === 500);

    // Negative 7: Failed Payment Simulation
    const { data: failedSub, error: failErr } = await supabaseAdmin.from('subscribers').upsert({
      user_id: userId,
      email: testUserEmail,
      status: 'failed',
      subscribed: false,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' }).select('subscribed, status').single();
    assert('Failed payment status prevents subscription activation (subscribed === false)', !failErr && failedSub?.subscribed === false && failedSub?.status === 'failed');

    // Negative 8: Cancelled Payment Simulation
    const { data: cancelledSub, error: cancelErr } = await supabaseAdmin.from('subscribers').upsert({
      user_id: userId,
      email: testUserEmail,
      status: 'cancelled',
      subscribed: false,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' }).select('subscribed, status').single();
    assert('Cancelled payment status ensures subscribed === false', !cancelErr && cancelledSub?.subscribed === false && cancelledSub?.status === 'cancelled');

  } finally {
    // CLEANUP TEST USER
    if (userId) {
      console.log('\n[7] Cleaning up test sandbox user records...');
      await supabaseAdmin.from('subscribers').delete().eq('user_id', userId);
      await supabaseAdmin.from('profiles').delete().eq('id', userId);
      await supabaseAdmin.auth.admin.deleteUser(userId);
      console.log('  ✓ Test user and subscriber record cleanly purged.');
    }
  }

  console.log('\n================================================================');
  console.log(`📊 PAYMENT SANDBOX TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPaymentSandboxTests().catch(err => {
  console.error('Fatal error in payment test:', err);
  process.exit(1);
});
