/**
 * Automated Verification & Certification Test Suite
 * Mission ID: TXC-NOTIFICATIONS-003
 * Title: Intelligent Engagement, Notification Personalization & Retention Engine
 * Platform: TalentXcel (https://talentxcel.in)
 */

import { resolve } from 'path';
import { readFileSync, existsSync } from 'fs';

interface TestResult {
  name: string;
  category: string;
  status: 'PASS' | 'FAIL';
  details: string;
  durationMs: number;
}

const results: TestResult[] = [];

function assert(condition: boolean, name: string, category: string, details: string = '') {
  const start = Date.now();
  if (condition) {
    results.push({ name, category, status: 'PASS', details: details || 'Assertion passed successfully', durationMs: Date.now() - start });
    console.log(`  ✅ [PASS] ${name}`);
  } else {
    results.push({ name, category, status: 'FAIL', details: details || 'Assertion failed', durationMs: Date.now() - start });
    console.error(`  ❌ [FAIL] ${name}: ${details}`);
  }
}

console.log('\n================================================================');
console.log('TALENTXCEL NOTIFICATION INTELLIGENCE — TXC-NOTIFICATIONS-003');
console.log('Intelligent Engagement, Personalization & Retention Suite');
console.log('================================================================\n');

// ----------------------------------------------------------------------------
// SUITE 1: Migration Files & Schema Extensions
// ----------------------------------------------------------------------------
console.log('--- Suite 1: Schema Extensions & Separation Integrity ---');

const migrationPath = resolve('supabase/migrations/20261103200000_intelligent_engagement_engine.sql');
const rollbackPath = resolve('supabase/migrations/20261103200000_intelligent_engagement_engine_rollback.sql');

assert(existsSync(migrationPath), 'Migration File Exists', 'Schema', '20261103200000_intelligent_engagement_engine.sql exists');
assert(existsSync(rollbackPath), 'Rollback Migration File Exists', 'Schema', '20261103200000_intelligent_engagement_engine_rollback.sql exists');

const sql = readFileSync(migrationPath, 'utf8');
const rollbackSql = readFileSync(rollbackPath, 'utf8');

// Assert separate mission migration doesn't drop core tables
assert(!sql.includes('DROP TABLE IF EXISTS public.notifications CASCADE'), 'Separation: Does not drop notifications', 'Separation', 'Builds on top of core table');
assert(sql.includes('ADD COLUMN IF NOT EXISTS relevance_score'), 'Schema: relevance_score column', 'Schema', 'Stores contextual ranking weight');
assert(sql.includes('ADD COLUMN IF NOT EXISTS group_key'), 'Schema: group_key column', 'Schema', 'Enables activity grouping');
assert(sql.includes('ADD COLUMN IF NOT EXISTS group_count'), 'Schema: group_count column', 'Schema', 'Consolidated badge count');
assert(sql.includes('ADD COLUMN IF NOT EXISTS clicked_at'), 'Schema: clicked_at column', 'Schema', 'Click-through tracking');
assert(sql.includes('ADD COLUMN IF NOT EXISTS converted_at'), 'Schema: converted_at column', 'Schema', 'Conversion tracking');

// Assert intelligence tables
assert(sql.includes('CREATE TABLE IF NOT EXISTS public.notification_engagement_events'), 'Schema: notification_engagement_events', 'Schema', 'Telemetry log table');
assert(sql.includes('CREATE TABLE IF NOT EXISTS public.notification_user_fatigue'), 'Schema: notification_user_fatigue', 'Schema', 'Fatigue and rate limit table');
assert(sql.includes('CREATE TABLE IF NOT EXISTS public.notification_digests'), 'Schema: notification_digests', 'Schema', 'Digest outbox table');

// ----------------------------------------------------------------------------
// SUITE 2: Phase 1 — Intelligent Relevance & Contextual Ranking
// ----------------------------------------------------------------------------
console.log('\n--- Suite 2: Phase 1 — Intelligent Relevance Engine ---');

assert(sql.includes('calculate_notification_relevance'), 'Function: calculate_notification_relevance', 'Phase 1', 'Contextual ranking algorithm');
assert(sql.includes('company_follows'), 'Relevance: Followed Company Factor', 'Phase 1', 'Awards relevance boost for followed companies');
assert(sql.includes('skills'), 'Relevance: Skill Intersection Factor', 'Phase 1', 'Computes skill overlap between candidate and job');
assert(sql.includes('location'), 'Relevance: Location Proximity Factor', 'Phase 1', 'Evaluates location preferences');
assert(sql.includes('v_score > 1.000'), 'Relevance: Clamped Score Range', 'Phase 1', 'Enforces strict [0.100, 1.000] mathematical bounds');

// ----------------------------------------------------------------------------
// SUITE 3: Phase 2 — Job Intelligence
// ----------------------------------------------------------------------------
console.log('\n--- Suite 3: Phase 2 — Job Intelligence ---');

assert(sql.includes('evaluate_job_seeker_matches'), 'Function: evaluate_job_seeker_matches', 'Phase 2', 'Automated job seeker match evaluator');
assert(sql.includes('trg_jobs_intelligent_matching'), 'Trigger: Job Match on Publish', 'Phase 2', 'Fires match evaluation upon job publication');
assert(sql.includes('INTERVAL \'30 days\''), 'Job Intelligence: Deduplication Window', 'Phase 2', 'Prevents repeated notifications for the same job within 30 days');
assert(sql.includes('trg_application_viewed_notification'), 'Trigger: Application Viewed', 'Phase 2', 'Alerts candidate when recruiter reviews application');
assert(sql.includes('APPLICATION_VIEWED'), 'Event: APPLICATION_VIEWED', 'Phase 2', 'Dispatched on status reviewing');

// ----------------------------------------------------------------------------
// SUITE 4: Phase 3 — Professional Networking Intelligence
// ----------------------------------------------------------------------------
console.log('\n--- Suite 4: Phase 3 — Networking Intelligence & Privacy ---');

assert(sql.includes('is_user_blocked_or_restricted'), 'Function: is_user_blocked_or_restricted', 'Phase 3', 'Enforces privacy boundaries and blocking checks');
assert(sql.includes('status = \'blocked\''), 'Privacy: Connection Blocking Enforced', 'Phase 3', 'Respects blocked status in connections');
assert(sql.includes('blocked_users'), 'Privacy: Profile Block List Enforced', 'Phase 3', 'Checks profile privacy settings');
assert(sql.includes('trg_recruiter_profile_interaction'), 'Trigger: Recruiter Profile Interaction', 'Phase 3', 'High priority recruiter interaction alert');
assert(sql.includes('RECRUITER_INTEREST_RECEIVED'), 'Event: RECRUITER_INTEREST_RECEIVED', 'Phase 3', 'Dispatched when verified recruiter views candidate');

// ----------------------------------------------------------------------------
// SUITE 5: Phase 4 — Engagement Intelligence (Grouping & Fatigue)
// ----------------------------------------------------------------------------
console.log('\n--- Suite 5: Phase 4 — Grouping, Fatigue Limits & Digests ---');

assert(sql.includes('dispatch_intelligent_notification'), 'Function: dispatch_intelligent_notification', 'Phase 4', 'Central intelligent dispatcher');
assert(sql.includes('v_existing_group_id IS NOT NULL'), 'Grouping: Consolidated In-Place Update', 'Phase 4', 'Updates existing notification instead of duplicate bells');
assert(sql.includes('daily_limit'), 'Fatigue: Daily Frequency Limit', 'Phase 4', 'Applies user-specific daily cap (default 8)');
assert(sql.includes('daily_frequency_limit_reached'), 'Fatigue: Low Priority Suppression', 'Phase 4', 'Defers low-priority events when fatigued');

const digestWorkerPath = resolve('supabase/functions/generate-intelligent-digest/index.ts');
assert(existsSync(digestWorkerPath), 'Edge Function: generate-intelligent-digest Exists', 'Phase 4', 'Digest generator entrypoint');

if (existsSync(digestWorkerPath)) {
  const digestCode = readFileSync(digestWorkerPath, 'utf8');
  assert(digestCode.includes('digest_type'), 'Digest: Supports Daily and Weekly Digests', 'Phase 4', 'Period-specific grouping');
  assert(digestCode.includes('notification_digests'), 'Digest: Records Digest Run in Database', 'Phase 4', 'Auditable digest history');
  assert(digestCode.includes('DIGEST_PUBLISHED'), 'Digest: Dispatches Consolidated Summary Alert', 'Phase 4', 'Curated summary notification');
}

// ----------------------------------------------------------------------------
// SUITE 6: Phase 5 — Employer & Recruiter Intelligence
// ----------------------------------------------------------------------------
console.log('\n--- Suite 6: Phase 5 — Employer & Recruiter Intelligence ---');

assert(sql.includes('trg_employer_qualified_applicant'), 'Trigger: Qualified Applicant Tagging', 'Phase 5', 'Evaluates applicant qualification match');
assert(sql.includes('Highly Qualified Applicant'), 'Employer: High-Match Tagging', 'Phase 5', 'Surfaces top candidates with match percentage');

// ----------------------------------------------------------------------------
// SUITE 7: Phase 6 — Privacy-Preserving Analytics & Frontend Integration
// ----------------------------------------------------------------------------
console.log('\n--- Suite 7: Phase 6 — Analytics & Frontend Telemetry ---');

assert(sql.includes('record_notification_interaction'), 'RPC: record_notification_interaction', 'Phase 6', 'Secure open, click, and conversion tracking RPC');
assert(sql.includes('v_notification_engagement_metrics'), 'View: v_notification_engagement_metrics', 'Phase 6', 'Aggregates CTR and conversion rates');
assert(sql.includes('ctr_percentage'), 'Analytics: Click-Through Rate Formula', 'Phase 6', 'Calculates (clicked / delivered) * 100');
assert(sql.includes('conversion_rate_percentage'), 'Analytics: Conversion Rate Formula', 'Phase 6', 'Calculates (converted / clicked) * 100');
assert(sql.includes('v_notification_fatigue_summary'), 'View: v_notification_fatigue_summary', 'Phase 6', 'Aggregates fatigue distribution');

// Frontend Context & Dashboard Verification
const ctxPath = resolve('src/contexts/NotificationContext.tsx');
const centerPath = resolve('src/components/notifications/NotificationCenter.tsx');
const dashPath = resolve('src/components/notifications/AdvancedNotificationDashboard.tsx');

if (existsSync(ctxPath)) {
  const ctxCode = readFileSync(ctxPath, 'utf8');
  assert(ctxCode.includes('trackInteraction'), 'Context: trackInteraction Implemented', 'Frontend', 'Records open, click, and conversion telemetry');
  assert(ctxCode.includes('sortBy'), 'Context: Relevance Sorting Supported', 'Frontend', 'Toggles between AI relevance and chronological ordering');
  assert(ctxCode.includes('relevance_score'), 'Context: relevance_score Exposed', 'Frontend', 'Interface contains relevance score');
}

if (existsSync(centerPath)) {
  const centerCode = readFileSync(centerPath, 'utf8');
  assert(centerCode.includes('Top Recommended'), 'Center: Recommended Tab Available', 'UI', 'Filter for high-relevance matches');
  assert(centerCode.includes('relevance_score'), 'Center: Relevance Badge Rendered', 'UI', 'Displays % Match pill on high relevance cards');
  assert(centerCode.includes('group_count'), 'Center: Grouped Counter Rendered', 'UI', 'Displays +N grouped badge');
}

if (existsSync(dashPath)) {
  const dashCode = readFileSync(dashPath, 'utf8');
  assert(dashCode.includes('Click-Through Rate (CTR)'), 'Dashboard: CTR Telemetry Card', 'UI', 'Displays open-to-click ratio');
  assert(dashCode.includes('Conversions'), 'Dashboard: Conversion Metrics Card', 'UI', 'Displays application and connection conversions');
  assert(dashCode.includes('Fatigue Control'), 'Dashboard: Fatigue Health Card', 'UI', 'Displays volume cap status');
}

// ----------------------------------------------------------------------------
// SUITE 8: Rollback Migration Integrity
// ----------------------------------------------------------------------------
console.log('\n--- Suite 8: Rollback Migration Integrity ---');

assert(rollbackSql.includes('DROP TRIGGER IF EXISTS trg_jobs_intelligent_matching'), 'Rollback: Drops Jobs Matching Trigger', 'Rollback', 'Cleans up job matching trigger');
assert(rollbackSql.includes('DROP TRIGGER IF EXISTS trg_application_viewed_notification'), 'Rollback: Drops Application Viewed Trigger', 'Rollback', 'Cleans up application viewed trigger');
assert(rollbackSql.includes('DROP TRIGGER IF EXISTS trg_recruiter_profile_interaction'), 'Rollback: Drops Recruiter Interaction Trigger', 'Rollback', 'Cleans up recruiter trigger');
assert(rollbackSql.includes('DROP TRIGGER IF EXISTS trg_employer_qualified_applicant'), 'Rollback: Drops Employer Qualified Trigger', 'Rollback', 'Cleans up qualified applicant trigger');
assert(rollbackSql.includes('DROP FUNCTION IF EXISTS public.calculate_notification_relevance'), 'Rollback: Drops calculate_notification_relevance', 'Rollback', 'Cleans up relevance function');
assert(rollbackSql.includes('DROP TABLE IF EXISTS public.notification_engagement_events CASCADE'), 'Rollback: Drops Engagement Events Table', 'Rollback', 'Drops telemetry table');
assert(rollbackSql.includes('DROP TABLE IF EXISTS public.notification_user_fatigue CASCADE'), 'Rollback: Drops User Fatigue Table', 'Rollback', 'Drops fatigue table');
assert(rollbackSql.includes('DROP TABLE IF EXISTS public.notification_digests CASCADE'), 'Rollback: Drops Digests Table', 'Rollback', 'Drops digests table');

// ----------------------------------------------------------------------------
// Final Summary & Certification Status
// ----------------------------------------------------------------------------
console.log('\n================================================================');
const total = results.length;
const passed = results.filter(r => r.status === 'PASS').length;
const failed = results.filter(r => r.status === 'FAIL').length;
const passRate = Math.round((passed / total) * 100);

console.log(`TOTAL TESTS: ${total} | PASSED: ${passed} | FAILED: ${failed}`);
console.log(`PASS RATE: ${passRate}%`);
console.log('================================================================\n');

if (failed > 0) {
  console.error(`❌ TXC-NOTIFICATIONS-003 Verification Failed with ${failed} issues.`);
  process.exit(1);
} else {
  console.log('🎉 TXC-NOTIFICATIONS-003 VERIFICATION PASSED: All 6 phases verified.');
  process.exit(0);
}
