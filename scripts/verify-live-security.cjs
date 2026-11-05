// scripts/verify-live-security.cjs
// Live Production Verification of Hardened Supabase Edge Functions
// Target: https://dthlgsnakhoftinssokm.supabase.co/functions/v1

const https = require('https');

const BASE_URL = 'https://dthlgsnakhoftinssokm.supabase.co/functions/v1';

function request(method, path, headers, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${BASE_URL}/${path}`);
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers
    };

    const req = https.request(url, {
      method,
      headers: reqHeaders,
      timeout: 10000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let parsed = null;
        try { parsed = JSON.parse(data); } catch (_) { parsed = data; }
        resolve({ status: res.statusCode, data: parsed, headers: res.headers });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timed out'));
    });

    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runLiveTests() {
  console.log('🌐 Starting Live Supabase Edge Function Security Verification...\n');
  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     Reason: ${err.message}`);
      failed++;
    }
  }

  // 1. Unauthorized Payment Order Creation
  await test('LIVE-SEC-001: razorpay-create-order rejects unauthenticated callers with 401', async () => {
    const res = await request('POST', 'razorpay-create-order', {}, {
      amount: 199,
      tier: 'Starter'
    });
    if (res.status !== 401) {
      throw new Error(`Expected HTTP 401 Unauthorized, got HTTP ${res.status}: ${JSON.stringify(res.data)}`);
    }
  });

  // 2. Unauthorized Payment Verification
  await test('LIVE-SEC-002: razorpay-verify-payment rejects unauthenticated client checkouts with 401', async () => {
    const res = await request('POST', 'razorpay-verify-payment', {}, {
      razorpay_order_id: 'order_fake_123',
      razorpay_payment_id: 'pay_fake_123',
      razorpay_signature: 'sig_fake_123'
    });
    if (res.status !== 401) {
      throw new Error(`Expected HTTP 401 Unauthorized, got HTTP ${res.status}: ${JSON.stringify(res.data)}`);
    }
  });

  // 3. Webhook Invalid Signature Rejection
  await test('LIVE-SEC-003: razorpay-verify-payment rejects forged webhook signatures with 400', async () => {
    const res = await request('POST', 'razorpay-verify-payment', {
      'x-razorpay-signature': '0000000000000000000000000000000000000000000000000000000000000000'
    }, {
      event: 'payment.captured',
      payload: { payment: { entity: { id: 'pay_test', amount: 100 } } }
    });
    if (res.status !== 400) {
      throw new Error(`Expected HTTP 400 Bad Request, got HTTP ${res.status}: ${JSON.stringify(res.data)}`);
    }
  });

  // 4. Unauthorized Email Relay Block
  await test('LIVE-SEC-004: send-email-notification rejects unauthenticated open relay with 401', async () => {
    const res = await request('POST', 'send-email-notification', {}, {
      recipient_email: 'victim@external.com',
      event_name: 'test_email',
      data: { subject: 'Spam' }
    });
    if (res.status !== 401) {
      throw new Error(`Expected HTTP 401 Unauthorized, got HTTP ${res.status}: ${JSON.stringify(res.data)}`);
    }
  });

  // 5. Unauthorized Campaign Dispatch
  await test('LIVE-SEC-005: send-campaign rejects unauthenticated mass triggers with 401', async () => {
    const res = await request('POST', 'send-campaign', {}, {
      campaign_id: '00000000-0000-0000-0000-000000000000'
    });
    if (res.status !== 401) {
      throw new Error(`Expected HTTP 401 Unauthorized, got HTTP ${res.status}: ${JSON.stringify(res.data)}`);
    }
  });

  // 6. Unauthorized Email Queue Processing
  await test('LIVE-SEC-006: process-email-queue rejects callers without cron/service secret with 401', async () => {
    const res = await request('POST', 'process-email-queue', {}, {});
    if (res.status !== 401) {
      throw new Error(`Expected HTTP 401 Unauthorized, got HTTP ${res.status}: ${JSON.stringify(res.data)}`);
    }
  });

  // 7. Unauthorized TXC Reward Mining
  await test('LIVE-SEC-007: earn-txc rejects unauthenticated reward calls with 401', async () => {
    const res = await request('POST', 'earn-txc', {}, {
      action: 'daily_login'
    });
    if (res.status !== 401) {
      throw new Error(`Expected HTTP 401 Unauthorized, got HTTP ${res.status}: ${JSON.stringify(res.data)}`);
    }
  });

  // 8. Unauthorized AI Chat Access
  await test('LIVE-SEC-008: ai-chat rejects unauthenticated OpenAI calls with 401', async () => {
    const res = await request('POST', 'ai-chat', {}, {
      message: 'Hello'
    });
    if (res.status !== 401) {
      throw new Error(`Expected HTTP 401 Unauthorized, got HTTP ${res.status}: ${JSON.stringify(res.data)}`);
    }
  });

  console.log('\n======================================================');
  console.log(`Live Verification Summary: ${passed} Passed, ${failed} Failed`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runLiveTests().catch(err => {
  console.error('Fatal live test error:', err);
  process.exit(1);
});
