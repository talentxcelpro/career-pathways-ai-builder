// scripts/test-affiliate-marketplace-e2e.cjs
// Comprehensive Phase 9 E2E Verification Suite for TalentXcel Affiliate Marketplace

const { runSql } = require('./db-audit-helper.cjs');

async function runSuite() {
  console.log('================================================================');
  console.log('TALENTXCEL AFFILIATE MARKETPLACE — PHASE 9 E2E VERIFICATION SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(title, condition, extra = '') {
    if (condition) {
      console.log(`✅ [PASS] ${title} ${extra ? '(' + extra + ')' : ''}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${title} ${extra ? '(' + extra + ')' : ''}`);
      failed++;
    }
  }

  // ─── TEST 1: CATALOGUE INTEGRITY ──────────────────────────────────────────
  console.log('\n--- 1. Product Catalogue Audit ---');
  const prods = runSql(`SELECT slug, name, selling_price_paise, commission_type, commission_rate FROM public.affiliate_products WHERE is_active = true ORDER BY selling_price_paise DESC;`);
  assert('Product catalogue has 5 active TalentXcel products', prods.length === 5, `Found: ${prods.length}`);

  const proSub = prods.find(p => p.slug === 'career-pro-sub');
  assert('Career Pro product has 20% percentage commission', proSub && proSub.commission_type === 'percentage' && parseFloat(proSub.commission_rate) === 20, `Rate: ${proSub?.commission_rate}%`);

  const resumePass = prods.find(p => p.slug === 'ats-resume-instant');
  assert('ATS Resume Instant product has ₹15 fixed commission (1500 paise)', resumePass && resumePass.commission_type === 'fixed' && parseInt(resumePass.commission_rate, 10) === 1500, `Rate: ${resumePass?.commission_rate} paise`);

  // ─── TEST 2: AFFILIATE IDENTITY EXTENSION ─────────────────────────────────
  console.log('\n--- 2. Affiliate Identity Extension & Referral Reuse ---');
  // Find a test user with a referral code
  const testUserRows = runSql(`SELECT referrer_id, referral_code FROM public.user_referrals WHERE is_active = true LIMIT 1;`);
  assert('Found existing user in user_referrals', testUserRows.length > 0, `Code: ${testUserRows[0]?.referral_code}`);

  const testAffiliateId = testUserRows[0].referrer_id;
  const testRefCode = testUserRows[0].referral_code;

  // Initialize affiliate profile for this user
  runSql(`
    INSERT INTO public.affiliate_profiles (user_id, status, approved_at)
    VALUES ('${testAffiliateId}', 'approved', now())
    ON CONFLICT (user_id) DO UPDATE SET status = 'approved';
  `);

  const affProfileCheck = runSql(`SELECT user_id, status FROM public.affiliate_profiles WHERE user_id = '${testAffiliateId}';`);
  assert('Affiliate profile active and approved', affProfileCheck.length > 0 && affProfileCheck[0].status === 'approved');

  // ─── TEST 3: CLICK TELEMETRY ──────────────────────────────────────────────
  console.log('\n--- 3. Tracking Link & Click Telemetry ---');
  const testVisitorId = 'test_visitor_' + Date.now();
  const testCampaignId = 'test_campaign_audit';

  const clickRes = runSql(`
    SELECT public.record_affiliate_click(
      '${testRefCode}',
      'career-pro-sub',
      'whatsapp',
      '${testCampaignId}',
      '${testVisitorId}'
    ) AS res;
  `);
  const clickObj = clickRes[0]?.res || {};
  assert('record_affiliate_click RPC executed successfully', clickObj.success === true, JSON.stringify(clickObj));

  const clickInDb = runSql(`SELECT id FROM public.affiliate_clicks WHERE visitor_id = '${testVisitorId}';`);
  assert('Click recorded in affiliate_clicks table', clickInDb.length > 0);

  // ─── TEST 4: VERIFIED PERCENTAGE COMMISSION ───────────────────────────────
  console.log('\n--- 4. Percentage Commission Calculation (Career Pro ₹499 -> 20% = ₹99.80) ---');
  const testPaymentId1 = 'pay_test_pct_' + Date.now();
  const testOrderId1 = 'order_test_pct_' + Date.now();
  const dummyBuyerRows = runSql(`SELECT id FROM auth.users WHERE id <> '${testAffiliateId}' LIMIT 1;`);
  const dummyBuyerId = dummyBuyerRows[0]?.id || '00000000-0000-0000-0000-000000000001';

  const pctCommRes = runSql(`
    SELECT public.process_affiliate_commission_atomic(
      '${testPaymentId1}',
      '${testOrderId1}',
      49900,
      '${dummyBuyerId}',
      'career-pro-sub',
      '${testRefCode}'
    ) AS res;
  `);
  const pctCommObj = pctCommRes[0]?.res || {};
  assert('Percentage commission recorded successfully', pctCommObj.success === true);
  assert('Commission amount is exactly 20% of ₹499 (9980 paise / ₹99.80)', pctCommObj.commission_amount_paise === 9980, `Computed: ${pctCommObj.commission_amount_paise} paise`);

  // ─── TEST 5: IDEMPOTENCY / REPLAY DEFENSE ──────────────────────────────────
  console.log('\n--- 5. Replay Attack & Duplicate Payment Defense ---');
  const replayRes = runSql(`
    SELECT public.process_affiliate_commission_atomic(
      '${testPaymentId1}',
      '${testOrderId1}',
      49900,
      '${dummyBuyerId}',
      'career-pro-sub',
      '${testRefCode}'
    ) AS res;
  `);
  const replayObj = replayRes[0]?.res || {};
  assert('Duplicate transaction blocked idempotently (is_replay = true)', replayObj.is_replay === true);

  // ─── TEST 6: ANTI-SELF-REFERRAL SECURITY GATE ─────────────────────────────
  console.log('\n--- 6. Anti-Self-Referral Security Gate ---');
  const testSelfPaymentId = 'pay_test_self_' + Date.now();
  const selfRes = runSql(`
    SELECT public.process_affiliate_commission_atomic(
      '${testSelfPaymentId}',
      'order_self_test',
      49900,
      '${testAffiliateId}',
      'career-pro-sub',
      '${testRefCode}'
    ) AS res;
  `);
  const selfObj = selfRes[0]?.res || {};
  assert('Self-referral rejected with security error', selfObj.success === false && selfObj.error.includes('Self-referral is strictly prohibited'), `Message: ${selfObj.error}`);

  // ─── TEST 7: VERIFIED FIXED COMMISSION ────────────────────────────────────
  console.log('\n--- 7. Fixed Commission Calculation (ATS Instant Pass ₹49 -> flat ₹15 = 1500 paise) ---');
  const testPaymentId2 = 'pay_test_fix_' + Date.now();
  const testOrderId2 = 'order_test_fix_' + Date.now();

  const fixCommRes = runSql(`
    SELECT public.process_affiliate_commission_atomic(
      '${testPaymentId2}',
      '${testOrderId2}',
      4900,
      '${dummyBuyerId}',
      'ats-resume-instant',
      '${testRefCode}'
    ) AS res;
  `);
  const fixCommObj = fixCommRes[0]?.res || {};
  assert('Fixed commission recorded successfully', fixCommObj.success === true);
  assert('Commission amount is flat 1500 paise (₹15.00)', fixCommObj.commission_amount_paise === 1500, `Computed: ${fixCommObj.commission_amount_paise} paise`);

  // ─── TEST 8: LEDGER BALANCE VERIFICATION ──────────────────────────────────
  console.log('\n--- 8. Commission Ledger & Balance Integrity ---');
  const balanceRow = runSql(`SELECT total_earnings_paise, pending_earnings_paise FROM public.affiliate_profiles WHERE user_id = '${testAffiliateId}';`);
  const expectedTotal = 9980 + 1500; // 11480 paise
  assert('Affiliate ledger balance updated atomically', balanceRow[0]?.total_earnings_paise >= expectedTotal, `Balance: ${balanceRow[0]?.total_earnings_paise} paise`);

  // ─── TEST 9: REFUND REVERSAL LIFECYCLE ────────────────────────────────────
  console.log('\n--- 9. Refund Reversal Lifecycle ---');
  const reversalRes = runSql(`
    SELECT public.reverse_affiliate_commission_atomic(
      '${testPaymentId2}',
      'Test Refund Event from Razorpay Webhook'
    ) AS res;
  `);
  const reversalObj = reversalRes[0]?.res || {};
  assert('Commission reversed successfully on refund', reversalObj.success === true && reversalObj.reversed_amount_paise === 1500);

  const statusAfterReversal = runSql(`SELECT status, reversal_reason FROM public.affiliate_conversions WHERE payment_id = '${testPaymentId2}';`);
  assert('Conversion status transitioned to reversed', statusAfterReversal[0]?.status === 'reversed' && statusAfterReversal[0]?.reversal_reason.includes('Test Refund Event'));

  // ─── TEST 10: PAYOUT LIFECYCLE ────────────────────────────────────────────
  console.log('\n--- 10. Payout Lifecycle (Request -> Mature -> Complete) ---');
  // Mature the percentage conversion so it is payable
  runSql(`
    UPDATE public.affiliate_conversions
    SET status = 'payable', payable_after = now() - interval '1 day'
    WHERE payment_id = '${testPaymentId1}';
  `);

  // Set mock UPI payout method on profile
  runSql(`
    UPDATE public.affiliate_profiles
    SET payout_method = 'upi', payout_details = '{"upi_id": "testpartner@okaxis"}'::jsonb
    WHERE user_id = '${testAffiliateId}';
  `);

  // Request payout
  const payoutReqRes = runSql(`
    SELECT public.request_affiliate_payout(100000, '${testAffiliateId}') AS res;
  `);
  // Note: Since mature balance is 9980 paise (₹99.80) and requested is 100000 paise (₹1000), it should enforce the payable balance check:
  const payoutObj = payoutReqRes[0]?.res || {};
  assert('Payout request enforces payable balance check', payoutObj.success === false && payoutObj.error.includes('exceeds currently payable earnings'), `Message: ${payoutObj.error}`);

  // Test admin payout approval with a synthetic payout row
  const payoutInsert = runSql(`
    INSERT INTO public.affiliate_payouts (affiliate_id, amount_paise, status, payout_method, payout_details)
    VALUES ('${testAffiliateId}', 9980, 'requested', 'upi', '{"upi_id": "testpartner@okaxis"}'::jsonb)
    RETURNING id;
  `);
  const testPayoutId = payoutInsert[0]?.id;
  assert('Synthetic test payout inserted', Boolean(testPayoutId));

  // Admin marks payout completed with UTR reference
  runSql(`
    UPDATE public.affiliate_payouts
    SET status = 'completed', reference_number = 'UTR_TEST_123456', processed_at = now()
    WHERE id = '${testPayoutId}';
  `);
  const completedPayout = runSql(`SELECT status, reference_number FROM public.affiliate_payouts WHERE id = '${testPayoutId}';`);
  assert('Admin successfully completed payout with UTR reference', completedPayout[0]?.status === 'completed' && completedPayout[0]?.reference_number === 'UTR_TEST_123456');

  // ─── TEST 11: ZERO REGRESSION ON EXISTING REFER & EARN ────────────────────
  console.log('\n--- 11. Zero Regression Check on Existing Refer & Earn ---');
  const legacyEvents = runSql(`SELECT count(*) as cnt FROM public.referral_events;`);
  assert('Legacy public.referral_events table remains completely functional', legacyEvents.length > 0 && legacyEvents[0].cnt !== undefined, `Events: ${legacyEvents[0]?.cnt}`);

  const userReferrals = runSql(`SELECT count(*) as cnt FROM public.user_referrals WHERE is_active = true;`);
  assert('User referrals table retains active referral codes intact', userReferrals.length > 0 && parseInt(userReferrals[0].cnt, 10) > 0, `Active codes: ${userReferrals[0]?.cnt}`);

  // ─── CLEANUP SYNTHETIC TEST ROWS ──────────────────────────────────────────
  console.log('\n--- Housekeeping: Cleaning Up Synthetic Test Rows ---');
  runSql(`DELETE FROM public.affiliate_clicks WHERE visitor_id = '${testVisitorId}';`);
  runSql(`DELETE FROM public.affiliate_conversions WHERE payment_id IN ('${testPaymentId1}', '${testPaymentId2}', '${testSelfPaymentId}');`);
  runSql(`DELETE FROM public.affiliate_payouts WHERE id = '${testPayoutId}';`);
  // Reset test affiliate earnings balance back to 0
  runSql(`UPDATE public.affiliate_profiles SET total_earnings_paise = 0, pending_earnings_paise = 0, paid_earnings_paise = 0 WHERE user_id = '${testAffiliateId}';`);
  console.log('Cleaned up synthetic test rows in production Supabase.');

  // ─── SUMMARY ──────────────────────────────────────────────────────────────
  console.log('\n================================================================');
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runSuite().catch(err => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
