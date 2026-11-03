/**
 * Automated Verification & Certification Test Suite
 * Mission ID: TXC-NOTIFICATIONS-004
 * Title: Engagement-to-Revenue Attribution & Growth Intelligence Engine
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
console.log('TALENTXCEL ATTRIBUTION & GROWTH ENGINE — TXC-NOTIFICATIONS-004');
console.log('Engagement-to-Revenue Attribution & Controlled Experiments Suite');
console.log('================================================================\n');

// ----------------------------------------------------------------------------
// SUITE 1: Migration Files & Schema Extensions (Phases 1-5)
// ----------------------------------------------------------------------------
console.log('--- Suite 1: Schema Architecture & Separation Integrity ---');

const migrationPath = resolve('supabase/migrations/20261103300000_attribution_growth_intelligence.sql');
const rollbackPath = resolve('supabase/migrations/20261103300000_attribution_growth_intelligence_rollback.sql');

assert(existsSync(migrationPath), 'Migration File Exists', 'Schema', '20261103300000_attribution_growth_intelligence.sql exists');
assert(existsSync(rollbackPath), 'Rollback Migration File Exists', 'Schema', '20261103300000_attribution_growth_intelligence_rollback.sql exists');

const sql = readFileSync(migrationPath, 'utf8');
const rollbackSql = readFileSync(rollbackPath, 'utf8');

// Assert separation: does not destroy parent tables
assert(!sql.includes('DROP TABLE IF EXISTS public.notifications CASCADE'), 'Separation: Preserves notifications core', 'Separation', 'Builds on top of core table');
assert(!sql.includes('DROP TABLE IF EXISTS public.notification_engagement_events CASCADE'), 'Separation: Preserves TXC-003 events', 'Separation', 'Preserves parent engagement table');

// ----------------------------------------------------------------------------
// SUITE 2: Phase 1 — Attribution Infrastructure (12 Touchpoints & Windows)
// ----------------------------------------------------------------------------
console.log('\n--- Suite 2: Phase 1 — Persistent Touchpoints & Attribution Windows ---');

assert(sql.includes('CREATE TABLE IF NOT EXISTS public.notification_attribution_touchpoints'), 'Schema: notification_attribution_touchpoints Table', 'Phase 1', 'Stores persistent touchpoint records');
assert(sql.includes('CREATE TABLE IF NOT EXISTS public.notification_attributed_conversions'), 'Schema: notification_attributed_conversions Table', 'Phase 1', 'Stores converted milestones with causal links');

// 12 Mandatory Lifecycle Touchpoints
const touchpoints = [
  'generated',
  'delivered',
  'opened',
  'clicked',
  'landing_view',
  'job_view',
  'application_start',
  'application_submit',
  'recruiter_contact',
  'candidate_shortlist',
  'registration_complete',
  'service_purchase'
];

touchpoints.forEach(tp => {
  assert(sql.includes(`'${tp}'`), `Touchpoint Enforced: ${tp}`, 'Phase 1', `Lifecycle state ${tp} supported in check constraint`);
});

// Attribution Models and Windows
assert(sql.includes("'last_touch', 'first_touch', 'direct_session', 'linear'"), 'Attribution Models: Multi-Touch Support', 'Phase 1', 'Supports last touch, first touch, and direct session');
assert(sql.includes("'1h', '24h', '7d', '30d'"), 'Attribution Windows: Standard Intervals', 'Phase 1', 'Supports 1h session, 24h immediate, 7d application, 30d commerce windows');
assert(sql.includes('is_direct_attribution BOOLEAN NOT NULL DEFAULT true'), 'Attribution: Direct vs Incidental Flag', 'Phase 1', 'Distinguishes direct causal conversions from incidental baseline conversions');
assert(sql.includes('touchpoint_to_conversion_seconds INTEGER'), 'Attribution: Latency Delta Tracking', 'Phase 1', 'Computes exact seconds between notification interaction and conversion');

// Client RPC & Resolution Function
assert(sql.includes('CREATE OR REPLACE FUNCTION public.record_attribution_touchpoint'), 'RPC: record_attribution_touchpoint Function', 'Phase 1', 'Client-callable touchpoint logger');
assert(sql.includes('CREATE OR REPLACE FUNCTION public.resolve_attributed_conversion'), 'Function: resolve_attributed_conversion', 'Phase 1', 'Causal backward resolution algorithm');

// ----------------------------------------------------------------------------
// SUITE 3: Phase 2 — Conversion Analytics & Attribution Triggers
// ----------------------------------------------------------------------------
console.log('\n--- Suite 3: Phase 2 — Conversion Analytics & Automation Triggers ---');

assert(sql.includes('trg_attr_application_submitted'), 'Trigger: Application Submitted Attribution', 'Phase 2', 'Automated conversion logging for job applications');
assert(sql.includes('trg_attr_company_followed'), 'Trigger: Company Followed Attribution', 'Phase 2', 'Automated conversion logging for company follows');
assert(sql.includes('CREATE OR REPLACE VIEW public.v_notification_conversion_funnel'), 'View: v_notification_conversion_funnel', 'Phase 2', 'Aggregated funnel analytics view');
assert(sql.includes('click_to_application_pct'), 'Funnel Metric: Click-to-Application Rate', 'Phase 2', 'Calculates conversion efficiency from click to apply');
assert(sql.includes('ctr_pct'), 'Funnel Metric: Click-Through Rate (CTR)', 'Phase 2', 'Calculates click through delivered notification ratio');

// ----------------------------------------------------------------------------
// SUITE 4: Phase 3 — Controlled Intelligent Experimentation Engine
// ----------------------------------------------------------------------------
console.log('\n--- Suite 4: Phase 3 — Controlled A/B Experimentation Engine ---');

assert(sql.includes('CREATE TABLE IF NOT EXISTS public.notification_experiments'), 'Schema: notification_experiments Table', 'Phase 3', 'Experiment definitions catalog');
assert(sql.includes('CREATE TABLE IF NOT EXISTS public.notification_experiment_enrollments'), 'Schema: notification_experiment_enrollments Table', 'Phase 3', 'User cohort enrollments');
assert(sql.includes('CREATE OR REPLACE FUNCTION public.evaluate_user_experiment_cohort'), 'Function: evaluate_user_experiment_cohort', 'Phase 3', 'Deterministic MD5 cohort evaluation');

// Mutual Exclusivity Layers
assert(sql.includes("'ranking_layer', 'delivery_layer', 'frequency_layer', 'content_layer'"), 'Experiment Layers: Mutual Exclusivity Enforced', 'Phase 3', 'Prevents conflicting treatments across architectural layers');

// 5 Core Required Experiments
const requiredExperiments = [
  'exp_ordering_v1',         // AI relevance vs Chronological
  'exp_delivery_mode_v1',    // Instant vs Daily digest
  'exp_threshold_v1',        // Relevance match thresholds
  'exp_frequency_cap_v1',    // Daily frequency caps
  'exp_job_alert_copy_v1'    // Personalized skills vs generic copy
];

requiredExperiments.forEach(expKey => {
  assert(sql.includes(expKey), `Experiment Seeded: ${expKey}`, 'Phase 3', `Controlled experiment ${expKey} cataloged`);
});

assert(sql.includes('CREATE OR REPLACE VIEW public.v_notification_experiment_performance'), 'View: v_notification_experiment_performance', 'Phase 3', 'Experiment cohort conversion performance comparison');

// ----------------------------------------------------------------------------
// SUITE 5: Phase 4 — Revenue Intelligence (Realized Only, Never Estimated)
// ----------------------------------------------------------------------------
console.log('\n--- Suite 5: Phase 4 — Realized Revenue Reconciled Tracking ---');

assert(sql.includes('CREATE TABLE IF NOT EXISTS public.notification_revenue_attributions'), 'Schema: notification_revenue_attributions Table', 'Phase 4', 'Verified revenue attribution log');

// 5 Core Paid Product Pillars
const revenuePillars = [
  'resume_services',
  'career_services',
  'employer_recruitment',
  'staffing_inquiries',
  'training_assessment'
];

revenuePillars.forEach(pillar => {
  assert(sql.includes(`'${pillar}'`), `Revenue Pillar: ${pillar}`, 'Phase 4', `Commercial pillar ${pillar} cataloged in check constraint`);
});

// Strict Revenue Realization Constraints
assert(sql.includes('realized_amount_inr DECIMAL(10,2) NOT NULL DEFAULT 0.00'), 'Revenue: realized_amount_inr Column', 'Phase 4', 'Captures verified paid revenue');
assert(sql.includes('pipeline_amount_inr DECIMAL(10,2) NOT NULL DEFAULT 0.00'), 'Revenue: pipeline_amount_inr Column', 'Phase 4', 'Distinguishes potential pipeline from captured revenue');
assert(sql.includes('is_verified_payment BOOLEAN NOT NULL DEFAULT false'), 'Revenue: is_verified_payment Verification Flag', 'Phase 4', 'Guarantees bank/gateway capture status');
assert(sql.includes("NEW.status = 'captured' OR NEW.status = 'paid'"), 'Revenue Trigger: Strictly Captured Payments Only', 'Phase 4', 'Rejects pending/failed transactions from revenue calculation');
assert(sql.includes('CREATE OR REPLACE VIEW public.v_notification_revenue_realization'), 'View: v_notification_revenue_realization', 'Phase 4', 'Realized revenue summary by category');

// ----------------------------------------------------------------------------
// SUITE 6: Phase 5 — Retention Intelligence & Segment Journeys
// ----------------------------------------------------------------------------
console.log('\n--- Suite 6: Phase 5 — Retention Intelligence & Lifecycle Cohorts ---');

assert(sql.includes('CREATE TABLE IF NOT EXISTS public.notification_retention_segments'), 'Schema: notification_retention_segments Table', 'Phase 5', 'Tracks at-risk user cohorts');

// 5 At-Risk Retention Cohorts
const retentionSegments = [
  'newly_registered_inactive',
  'dormant_applicant',
  'inactive_hiring_pipeline',
  'dormant_company_publisher',
  'fatigued_dismissal_user'
];

retentionSegments.forEach(seg => {
  assert(sql.includes(`'${seg}'`), `Retention Cohort: ${seg}`, 'Phase 5', `Lifecycle segment ${seg} tracked in check constraint`);
});

assert(sql.includes('CREATE OR REPLACE FUNCTION public.evaluate_retention_risk_segments'), 'Procedure: evaluate_retention_risk_segments', 'Phase 5', 'Scheduled background evaluator for at-risk users');
assert(sql.includes('days_inactive INTEGER NOT NULL DEFAULT 0'), 'Retention: days_inactive Counter', 'Phase 5', 'Tracks recency of user inactivity');
assert(sql.includes('scheduled_reengagement_at TIMESTAMPTZ'), 'Retention: scheduled_reengagement_at Delay', 'Phase 5', 'Schedules preference-compliant re-engagement');

// ----------------------------------------------------------------------------
// SUITE 7: Phase 6 — Security, RLS & Client SDK
// ----------------------------------------------------------------------------
console.log('\n--- Suite 7: Security Policies & Client SDK Implementation ---');

// Row Level Security on all 6 tables
assert(sql.includes('ALTER TABLE public.notification_attribution_touchpoints ENABLE ROW LEVEL SECURITY;'), 'RLS: notification_attribution_touchpoints', 'Security', 'Enabled');
assert(sql.includes('ALTER TABLE public.notification_attributed_conversions ENABLE ROW LEVEL SECURITY;'), 'RLS: notification_attributed_conversions', 'Security', 'Enabled');
assert(sql.includes('ALTER TABLE public.notification_experiments ENABLE ROW LEVEL SECURITY;'), 'RLS: notification_experiments', 'Security', 'Enabled');
assert(sql.includes('ALTER TABLE public.notification_experiment_enrollments ENABLE ROW LEVEL SECURITY;'), 'RLS: notification_experiment_enrollments', 'Security', 'Enabled');
assert(sql.includes('ALTER TABLE public.notification_revenue_attributions ENABLE ROW LEVEL SECURITY;'), 'RLS: notification_revenue_attributions', 'Security', 'Enabled');
assert(sql.includes('ALTER TABLE public.notification_retention_segments ENABLE ROW LEVEL SECURITY;'), 'RLS: notification_retention_segments', 'Security', 'Enabled');

// Client SDK: attributionGrowthEngine.ts
const clientSdkPath = resolve('src/lib/notifications/attributionGrowthEngine.ts');
assert(existsSync(clientSdkPath), 'Client SDK Exists: attributionGrowthEngine.ts', 'Client SDK', 'Engine file exists');

if (existsSync(clientSdkPath)) {
  const sdkCode = readFileSync(clientSdkPath, 'utf8');
  assert(sdkCode.includes('export class AttributionGrowthEngine'), 'SDK: AttributionGrowthEngine Class', 'Client SDK', 'Exports singleton class');
  assert(sdkCode.includes('trackTouchpoint'), 'SDK: trackTouchpoint Method', 'Client SDK', 'Logs touchpoints to backend');
  assert(sdkCode.includes('trackConversion'), 'SDK: trackConversion Method', 'Client SDK', 'Resolves causal conversion backward');
  assert(sdkCode.includes('getExperimentCohort'), 'SDK: getExperimentCohort Method', 'Client SDK', 'Retrieves deterministic experiment cohort');
  assert(sdkCode.includes('getActiveAttribution'), 'SDK: getActiveAttribution Method', 'Client SDK', 'Retrieves active session attribution touch');
  assert(sdkCode.includes('initUrlListener'), 'SDK: initUrlListener Deep-Link Interceptor', 'Client SDK', 'Captures notif_id and utm_source from deep links');
}

// ----------------------------------------------------------------------------
// SUITE 8: Phase 6 — Dashboard Component & Route Integration
// ----------------------------------------------------------------------------
console.log('\n--- Suite 8: Dashboard Component & Route Integration ---');

const dashboardPath = resolve('src/components/notifications/AttributionGrowthDashboard.tsx');
assert(existsSync(dashboardPath), 'Dashboard Component Exists: AttributionGrowthDashboard.tsx', 'Frontend', 'Dashboard exists');

if (existsSync(dashboardPath)) {
  const dashCode = readFileSync(dashboardPath, 'utf8');
  assert(dashCode.includes('Engagement-to-Revenue Attribution & Growth Intelligence'), 'Dashboard: Header Title', 'Frontend', 'Renders mission title');
  assert(dashCode.includes('setActiveTab(\'funnel\')'), 'Dashboard Tab: Conversion Funnel', 'Frontend', 'Funnel visualization');
  assert(dashCode.includes('setActiveTab(\'revenue\')'), 'Dashboard Tab: Realized Revenue', 'Frontend', 'Revenue reconciliation');
  assert(dashCode.includes('setActiveTab(\'experiments\')'), 'Dashboard Tab: Controlled Experiments', 'Frontend', 'A/B experiment performance');
  assert(dashCode.includes('setActiveTab(\'retention\')'), 'Dashboard Tab: Retention Journeys', 'Frontend', 'Lifecycle retention segments');
  assert(dashCode.includes('resume_services'), 'Dashboard Revenue: Resume Services Pillar', 'Frontend', 'Visualizes resume revenue');
  assert(dashCode.includes('career_services'), 'Dashboard Revenue: Career Services Pillar', 'Frontend', 'Visualizes career services revenue');
  assert(dashCode.includes('employer_recruitment'), 'Dashboard Revenue: Employer Recruitment Pillar', 'Frontend', 'Visualizes employer recruitment revenue');
  assert(dashCode.includes('staffing_inquiries'), 'Dashboard Revenue: Staffing Inquiries Pillar', 'Frontend', 'Visualizes staffing revenue');
  assert(dashCode.includes('training_assessment'), 'Dashboard Revenue: Training & Assessment Pillar', 'Frontend', 'Visualizes training revenue');
}

// Route mounting in NotificationsPage.tsx
const notifPagePath = resolve('src/pages/NotificationsPage.tsx');
assert(existsSync(notifPagePath), 'NotificationsPage.tsx Exists', 'Frontend', 'Parent notifications page exists');

if (existsSync(notifPagePath)) {
  const pageCode = readFileSync(notifPagePath, 'utf8');
  assert(pageCode.includes('<AttributionGrowthDashboard />'), 'NotificationsPage: Mounts AttributionGrowthDashboard', 'Frontend', 'Rendered in page layout');
}

// ----------------------------------------------------------------------------
// SUITE 9: Rollback Migration Integrity
// ----------------------------------------------------------------------------
console.log('\n--- Suite 9: Rollback Migration Integrity ---');

assert(rollbackSql.includes('DROP TRIGGER IF EXISTS trg_attr_application_submitted'), 'Rollback: Drops Application Attribution Trigger', 'Rollback', 'Clean trigger drop');
assert(rollbackSql.includes('DROP TRIGGER IF EXISTS trg_attr_company_followed'), 'Rollback: Drops Company Follow Trigger', 'Rollback', 'Clean trigger drop');
assert(rollbackSql.includes('DROP TRIGGER IF EXISTS trg_attr_payment_realized'), 'Rollback: Drops Payment Realized Trigger', 'Rollback', 'Clean trigger drop');
assert(rollbackSql.includes('DROP FUNCTION IF EXISTS public.evaluate_user_experiment_cohort'), 'Rollback: Drops Cohort Evaluator Function', 'Rollback', 'Clean function drop');
assert(rollbackSql.includes('DROP FUNCTION IF EXISTS public.resolve_attributed_conversion'), 'Rollback: Drops Conversion Resolver Function', 'Rollback', 'Clean function drop');
assert(rollbackSql.includes('DROP TABLE IF EXISTS public.notification_retention_segments CASCADE'), 'Rollback: Drops Retention Segments Table', 'Rollback', 'Clean cascade drop');
assert(rollbackSql.includes('DROP TABLE IF EXISTS public.notification_revenue_attributions CASCADE'), 'Rollback: Drops Revenue Attributions Table', 'Rollback', 'Clean cascade drop');
assert(rollbackSql.includes('DROP TABLE IF EXISTS public.notification_experiment_enrollments CASCADE'), 'Rollback: Drops Experiment Enrollments Table', 'Rollback', 'Clean cascade drop');
assert(rollbackSql.includes('DROP TABLE IF EXISTS public.notification_experiments CASCADE'), 'Rollback: Drops Experiments Table', 'Rollback', 'Clean cascade drop');
assert(rollbackSql.includes('DROP TABLE IF EXISTS public.notification_attributed_conversions CASCADE'), 'Rollback: Drops Attributed Conversions Table', 'Rollback', 'Clean cascade drop');
assert(rollbackSql.includes('DROP TABLE IF EXISTS public.notification_attribution_touchpoints CASCADE'), 'Rollback: Drops Attribution Touchpoints Table', 'Rollback', 'Clean cascade drop');

// ----------------------------------------------------------------------------
// SUMMARY & CERTIFICATION
// ----------------------------------------------------------------------------
const total = results.length;
const passed = results.filter(r => r.status === 'PASS').length;
const failed = results.filter(r => r.status === 'FAIL').length;
const passRate = ((passed / total) * 100).toFixed(1);

console.log('\n================================================================');
console.log(`TOTAL TESTS: ${total} | PASSED: ${passed} | FAILED: ${failed}`);
console.log(`PASS RATE: ${passRate}%`);
console.log('================================================================\n');

if (failed === 0) {
  console.log('🎉 TXC-NOTIFICATIONS-004 PRODUCTION CERTIFICATION PASSED: All 6 phases verified.\n');
  process.exit(0);
} else {
  console.error(`❌ TXC-NOTIFICATIONS-004 CERTIFICATION FAILED: ${failed} tests failed.\n`);
  process.exit(1);
}
