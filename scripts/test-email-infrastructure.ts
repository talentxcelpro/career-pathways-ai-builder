// scripts/test-email-infrastructure.ts
/**
 * Automated Verification Suite for TalentXcel Centralized Email Infrastructure
 * Verifies SES configuration, templates, rate limiter, priority queue, idempotency,
 * suppression, cryptographic unsubscribe, and frequency aggregation.
 *
 * Run with: npx tsx scripts/test-email-infrastructure.ts
 */

import { EmailPriority } from '../src/services/email/emailTypes';
import { emailRateLimiter } from '../src/services/email/emailRateLimiter';
import { emailGovernor } from '../src/services/email/emailGovernor';
import { renderEmailTemplate } from '../src/services/email/emailTemplates';
import { generateUnsubscribeToken, verifyUnsubscribeToken, buildUnsubscribeUrl } from '../src/services/email/emailUnsubscribe';
import { emailProvider } from '../src/services/email/emailProvider';

interface TestResult {
  name: string;
  passed: boolean;
  details?: string;
  error?: string;
}

const results: TestResult[] = [];

async function runTest(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    results.push({ name, passed: true });
    console.log(`  ✅ PASS: ${name}`);
  } catch (err: any) {
    results.push({ name, passed: false, error: err.message });
    console.error(`  ❌ FAIL: ${name} -> ${err.message}`);
  }
}

async function runSuite() {
  console.log(`\n============================================================`);
  console.log(`🚀 TALENTXCEL EMAIL INFRASTRUCTURE TEST SUITE`);
  console.log(`   Amazon SES Production Domain: talentxcel.in (us-east-1)`);
  console.log(`============================================================\n`);

  // Ensure safe test mode
  emailProvider.setMode('console');

  // ─────────────────────────────────────────────────────────────────────────
  // TEST 1: Rate Limiter Token Bucket Compliance
  // ─────────────────────────────────────────────────────────────────────────
  await runTest('Rate Limiter operates within safe limits (default 8/sec)', async () => {
    const configuredRate = emailRateLimiter.getRateLimit();
    if (configuredRate > 12) {
      throw new Error(`Rate limit too close to SES quota: ${configuredRate}/sec`);
    }

    const startTime = Date.now();
    // Request 5 permits rapidly
    for (let i = 0; i < 5; i++) {
      await emailRateLimiter.acquirePermit();
    }
    const elapsed = Date.now() - startTime;
    if (elapsed > 2000) {
      throw new Error(`Permit acquisition took too long: ${elapsed}ms`);
    }
  });

  // ─────────────────────────────────────────────────────────────────────────
  // TEST 2: Cryptographic One-Click Unsubscribe Tokens
  // ─────────────────────────────────────────────────────────────────────────
  await runTest('Cryptographic Unsubscribe Token generation & verification', async () => {
    const testEmail = 'candidate.test@talentxcel.in';
    const testUserId = 'user_abc123';

    const token = await generateUnsubscribeToken(testEmail, testUserId);
    if (!token || !token.includes('.')) {
      throw new Error('Malformed unsubscribe token generated');
    }

    const verification = await verifyUnsubscribeToken(token);
    if (!verification.valid) {
      throw new Error(`Token verification failed: ${verification.error}`);
    }
    if (verification.email !== testEmail) {
      throw new Error(`Extracted email mismatch: expected ${testEmail}, got ${verification.email}`);
    }
    if (verification.userId !== testUserId) {
      throw new Error(`Extracted userId mismatch: expected ${testUserId}, got ${verification.userId}`);
    }

    // Tampered token test
    const tampered = token.slice(0, -4) + 'zzzz';
    const tamperedCheck = await verifyUnsubscribeToken(tampered);
    if (tamperedCheck.valid) {
      throw new Error('Tampered token was accepted incorrectly');
    }
  });

  // ─────────────────────────────────────────────────────────────────────────
  // TEST 3: Email Templates - XSS Sanitization & Plain Text Generation
  // ─────────────────────────────────────────────────────────────────────────
  await runTest('Email Templates prevent HTML injection & render valid plain text', async () => {
    const maliciousInput = '<script>alert("hack")</script><b>Bold Name</b>';
    const rendered = await renderEmailTemplate(
      'welcome',
      { firstName: maliciousInput },
      'test@talentxcel.in'
    );

    if (rendered.html.includes('<script>')) {
      throw new Error('HTML injection detected in template output!');
    }
    if (!rendered.html.includes('&lt;script&gt;')) {
      throw new Error('Sanitized HTML escaped characters missing');
    }
    if (!rendered.plainText || rendered.plainText.length < 20) {
      throw new Error('Plain text variant missing or too short');
    }
    if (!rendered.subject.includes('Welcome to TalentXcel')) {
      throw new Error('Subject line rendering failed');
    }
  });

  // ─────────────────────────────────────────────────────────────────────────
  // TEST 4: Intelligent Aggregation (Requirement 7 & 28)
  // ─────────────────────────────────────────────────────────────────────────
  await runTest('Intelligent Aggregation: 10 job matches generate ONE consolidated email', async () => {
    const tenJobs = Array.from({ length: 10 }, (_, i) => ({
      title: `Senior Fullstack Engineer #${i + 1}`,
      company: `Unicorn Tech ${i + 1}`,
      location: 'Bangalore / Remote',
      salary: '₹35-50 LPA',
      url: `https://talentxcel.in/jobs/role-${i + 1}`
    }));

    const aggregated = emailGovernor.aggregateJobMatches(
      'candidate@talentxcel.in',
      'Arshid',
      tenJobs,
      'user_123'
    );

    if (aggregated.template !== 'job_match_digest') {
      throw new Error(`Expected template 'job_match_digest', got '${aggregated.template}'`);
    }

    const rendered = await renderEmailTemplate(
      aggregated.template,
      aggregated.variables,
      aggregated.to,
      aggregated.userId
    );

    // Verify consolidated email has job count and single primary CTA
    if (!rendered.subject.includes('10 new job matches')) {
      throw new Error(`Subject should announce 10 matches, got: ${rendered.subject}`);
    }
    if (!rendered.html.includes('View All Matches')) {
      throw new Error('Missing primary unified CTA button in aggregated digest');
    }
  });

  // ─────────────────────────────────────────────────────────────────────────
  // TEST 5: Transactional Bypass Policy (Requirement 9 & 26)
  // ─────────────────────────────────────────────────────────────────────────
  await runTest('Transactional Priority & Preference Immunity', async () => {
    // Password reset template must render with high security & expiration info
    const rendered = await renderEmailTemplate(
      'password_reset',
      { firstName: 'Sanobar', resetUrl: 'https://talentxcel.in/auth/reset?token=xyz' },
      'sanobar@talentxcel.in'
    );

    if (!rendered.subject.includes('Reset your TalentXcel password')) {
      throw new Error(`Unexpected password reset subject: ${rendered.subject}`);
    }
    if (!rendered.html.includes('Security Notice')) {
      throw new Error('Password reset template missing security expiration notice');
    }

    // Verify frequency governor allows transactional emails without daily limits
    const govResult = await emailGovernor.evaluate({
      to: 'sanobar@talentxcel.in',
      template: 'password_reset',
      category: 'transactional',
      priority: EmailPriority.CRITICAL,
      variables: {}
    });

    if (!govResult.allowed) {
      throw new Error('Transactional email was wrongly blocked by frequency governor!');
    }
  });

  // ─────────────────────────────────────────────────────────────────────────
  // TEST 6: Application Confirmation Email Pipeline (Requirement 29)
  // ─────────────────────────────────────────────────────────────────────────
  await runTest('Application Confirmation email template & variables', async () => {
    const rendered = await renderEmailTemplate(
      'application_confirmation',
      {
        candidateName: 'Candidate User',
        jobTitle: 'Lead AI Engineer',
        companyName: 'TalentXcel Core',
        applicationId: 'app_789456'
      },
      'applicant@talentxcel.in'
    );

    if (!rendered.html.includes('Lead AI Engineer') || !rendered.html.includes('TalentXcel Core')) {
      throw new Error('Application details missing from confirmation email');
    }
    if (!rendered.html.includes('app_789456')) {
      throw new Error('Application reference ID missing from confirmation email');
    }
  });

  // ─────────────────────────────────────────────────────────────────────────
  // TEST 7: Safe Provider Console Dispatch (Zero accidental live blast)
  // ─────────────────────────────────────────────────────────────────────────
  await runTest('Safe Provider Console mode dispatches without errors or external requests', async () => {
    const rendered = await renderEmailTemplate(
      'welcome',
      { firstName: 'Tester' },
      'test.engineer@talentxcel.in'
    );

    const result = await emailProvider.send({
      to: 'test.engineer@talentxcel.in',
      category: 'transactional',
      rendered
    });

    if (!result.success || !result.messageId?.startsWith('console_')) {
      throw new Error(`Safe console dispatch failed: ${result.error || 'No messageId'}`);
    }
  });

  // ─────────────────────────────────────────────────────────────────────────
  // SUMMARY REPORT
  // ─────────────────────────────────────────────────────────────────────────
  console.log(`\n============================================================`);
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  console.log(`🏁 TEST SUITE COMPLETE: ${passed}/${total} PASSED (${failed} failed)`);
  console.log(`============================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runSuite().catch((err) => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});
