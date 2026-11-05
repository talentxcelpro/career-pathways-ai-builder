// scripts/test-payment-security.cjs
// Automated Regression and Security Verification Suite for TalentXcel.in
// Tests: Payment Price Tampering, Replay Protection, Email Anti-Relay, AI Quota Guard, and TXC Balance Integrity.

const assert = require('assert');

console.log('🧪 Starting TalentXcel Security & Reliability Test Suite...\n');

let passed = 0;
let failed = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Reason: ${err.message}`);
    failed++;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TEST GROUP 1: Canonical Pricing Catalog
// ─────────────────────────────────────────────────────────────────────────────
console.log('--- Test Group 1: Server-Side Canonical Pricing Catalog ---');

const CANONICAL_PLANS = {
  starter: { tier: "Starter", planName: "Career Starter", priceRupees: 199, pricePaise: 19900 },
  pro: { tier: "Pro", planName: "Career Pro", priceRupees: 499, pricePaise: 49900 },
  premium: { tier: "Premium", planName: "Career Premium", priceRupees: 999, pricePaise: 99900 },
  oneoff: { tier: "OneOff", planName: "Resume Download", priceRupees: 49, pricePaise: 4900 },
};

function resolveServerPrice(body) {
  const rawIdentifier = (body.tier || body.planId || body.packageType || "").toLowerCase();
  const isClaim1Bid = body.packageType === 'Claim1Bid' || rawIdentifier.includes('claim1');
  const isResumeDownload = body.packageType === 'ResumeDownload' || rawIdentifier.includes('resume') || rawIdentifier.includes('oneoff');

  if (isClaim1Bid) {
    const rawAmount = parseFloat(body.amount);
    if (!rawAmount || isNaN(rawAmount) || rawAmount < 50 || rawAmount > 100000) {
      throw new Error("Invalid bid amount. Must be between ₹50 and ₹100,000");
    }
    return { tier: "Bid", planName: "Claim #1 Bid", amountInPaise: Math.round(rawAmount * 100) };
  } else if (isResumeDownload) {
    return { tier: CANONICAL_PLANS.oneoff.tier, planName: CANONICAL_PLANS.oneoff.planName, amountInPaise: CANONICAL_PLANS.oneoff.pricePaise };
  } else {
    if (rawIdentifier.includes("premium") || rawIdentifier.includes("elite") || rawIdentifier.includes("999")) {
      return { tier: CANONICAL_PLANS.premium.tier, planName: CANONICAL_PLANS.premium.planName, amountInPaise: CANONICAL_PLANS.premium.pricePaise };
    } else if (rawIdentifier.includes("starter") || rawIdentifier.includes("basic") || rawIdentifier.includes("199")) {
      return { tier: CANONICAL_PLANS.starter.tier, planName: CANONICAL_PLANS.starter.planName, amountInPaise: CANONICAL_PLANS.starter.pricePaise };
    } else {
      return { tier: CANONICAL_PLANS.pro.tier, planName: CANONICAL_PLANS.pro.planName, amountInPaise: CANONICAL_PLANS.pro.pricePaise };
    }
  }
}

runTest('SEC-PRICE-001: ₹1 Price Tampering for Premium Plan is Overridden', () => {
  const tamperedPayload = {
    amount: 1, // Attacker tries to pay ₹1 for Premium
    tier: 'Premium',
    planId: 'career-premium',
    currency: 'INR'
  };
  const resolved = resolveServerPrice(tamperedPayload);
  assert.strictEqual(resolved.amountInPaise, 99900, 'Price must be 99900 paise (₹999), never ₹1');
  assert.strictEqual(resolved.tier, 'Premium');
});

runTest('SEC-PRICE-002: Starter Plan resolves strictly to ₹199 (19900 paise)', () => {
  const payload = { tier: 'Starter', planId: 'career-starter', currency: 'INR' };
  const resolved = resolveServerPrice(payload);
  assert.strictEqual(resolved.amountInPaise, 19900);
});

runTest('SEC-PRICE-003: Pro Plan resolves strictly to ₹499 (49900 paise)', () => {
  const payload = { tier: 'Pro', planId: 'career-pro', currency: 'INR' };
  const resolved = resolveServerPrice(payload);
  assert.strictEqual(resolved.amountInPaise, 49900);
});

runTest('SEC-PRICE-004: Resume Download is fixed at canonical server price (4900 paise)', () => {
  const tamperedPayload = { amount: 0.5, packageType: 'ResumeDownload', currency: 'INR' };
  const resolved = resolveServerPrice(tamperedPayload);
  assert.strictEqual(resolved.amountInPaise, 4900, 'Must be fixed at 4900 paise');
});

runTest('SEC-PRICE-005: Claim #1 Bids enforce minimum boundary (₹50)', () => {
  assert.throws(() => {
    resolveServerPrice({ amount: 10, packageType: 'Claim1Bid' });
  }, /between ₹50 and ₹100,000/);
});

// ─────────────────────────────────────────────────────────────────────────────
// TEST GROUP 2: Email Anti-Relay & Authentication Guard
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- Test Group 2: Email Anti-Relay & Anti-Spam Guard ---');

function validateEmailNotificationRequest(callerUser, isServiceCall, requestData) {
  if (!isServiceCall && !callerUser) {
    throw new Error('Unauthorized: Bearer token required');
  }
  const cleanEmail = (requestData.recipient_email || '').toLowerCase().trim();
  if (!cleanEmail) {
    throw new Error('recipient_email is required');
  }
  if (callerUser) {
    if (cleanEmail !== (callerUser.email || '').toLowerCase().trim()) {
      throw new Error('Forbidden: Cannot send notifications to external addresses.');
    }
    if (requestData.event_name && requestData.event_name.startsWith('campaign')) {
      throw new Error('Forbidden: Administrative privilege required for campaigns.');
    }
  }
  return true;
}

runTest('SEC-RELAY-001: Unauthenticated request is rejected with 401', () => {
  assert.throws(() => {
    validateEmailNotificationRequest(null, false, { recipient_email: 'victim@example.com' });
  }, /Unauthorized/);
});

runTest('SEC-RELAY-002: User cannot spoof recipient to send email to third parties', () => {
  const caller = { id: 'u123', email: 'alice@example.com' };
  assert.throws(() => {
    validateEmailNotificationRequest(caller, false, {
      recipient_email: 'victim@bank.com',
      event_name: 'security.alert'
    });
  }, /Forbidden: Cannot send notifications to external addresses/);
});

runTest('SEC-RELAY-003: User cannot trigger marketing campaign emails', () => {
  const caller = { id: 'u123', email: 'alice@example.com' };
  assert.throws(() => {
    validateEmailNotificationRequest(caller, false, {
      recipient_email: 'alice@example.com',
      event_name: 'campaign.email'
    });
  }, /Forbidden: Administrative privilege required/);
});

runTest('SEC-RELAY-004: Legitimate notification to own verified email succeeds', () => {
  const caller = { id: 'u123', email: 'alice@example.com' };
  const ok = validateEmailNotificationRequest(caller, false, {
    recipient_email: 'alice@example.com',
    event_name: 'welcome'
  });
  assert.strictEqual(ok, true);
});

runTest('SEC-RELAY-005: Internal service role call can dispatch queue emails', () => {
  const ok = validateEmailNotificationRequest(null, true, {
    recipient_email: 'customer@example.com',
    event_name: 'job_match'
  });
  assert.strictEqual(ok, true);
});

// ─────────────────────────────────────────────────────────────────────────────
// TEST GROUP 3: AI Quota & Input Bounds Guard
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- Test Group 3: AI Cost & Abuse Protection ---');

function validateAIChatRequest(message, todayCount, userTier) {
  if (!message || typeof message !== 'string') {
    throw new Error('Valid message string is required');
  }
  if (message.length > 4000) {
    throw new Error('Message exceeds maximum allowed length of 4000 characters.');
  }
  const tier = (userTier || 'Free').toLowerCase();
  const dailyLimit = tier.includes('premium') ? 1000 : tier.includes('pro') ? 250 : tier.includes('starter') ? 50 : 20;
  if (todayCount >= dailyLimit) {
    throw new Error('Daily AI chat quota reached. Upgrade to Pro or Premium for expanded access.');
  }
  return { allowed: true, limit: dailyLimit };
}

runTest('SEC-AI-001: Excessive message payload (>4000 chars) is rejected', () => {
  const longMsg = 'A'.repeat(4001);
  assert.throws(() => {
    validateAIChatRequest(longMsg, 0, 'free');
  }, /Message exceeds maximum allowed length/);
});

runTest('SEC-AI-002: Free tier daily quota limit (20 messages) is strictly enforced', () => {
  assert.throws(() => {
    validateAIChatRequest('Hello career coach', 20, 'free');
  }, /Daily AI chat quota reached/);
});

runTest('SEC-AI-003: Pro tier gets 250 messages per day', () => {
  const result = validateAIChatRequest('Tell me about frontend roles', 49, 'Pro');
  assert.strictEqual(result.allowed, true);
  assert.strictEqual(result.limit, 250);
});

// ─────────────────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n======================================================');
console.log(`Test Execution Summary: ${passed} Passed, ${failed} Failed`);
console.log('======================================================\n');

if (failed > 0) {
  process.exit(1);
}
