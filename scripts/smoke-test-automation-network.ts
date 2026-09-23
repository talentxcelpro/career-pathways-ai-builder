/**
 * TalentXcel Global Government Jobs Automation Network — Comprehensive Smoke Test
 * Validates all 11 core subsystems of the hardened event-driven v2.1 architecture:
 * 1. SourceScheduler: P0-P4 priority, 24h SLA, wave assignment
 * 2. SourceChangeRate: Turnover velocity & dynamic interval adjustment
 * 3. CircuitBreaker: Anomaly tripping (volume spike, duplicate collision, domain drift)
 * 4. AutomationKillSwitch: Global and granular operational overrides
 * 5. QueueManager: Priority leasing (P0 before P4), ack/nack, dead-letter routing
 * 6. WorkerManager: Rate limits and concurrency slots
 * 7. ConnectorCertification: 7-point qualification check
 * 8. GlobalLocationResolver: Multi-alias canonical resolution & confidence score
 * 9. IndustryDomainResolver: 3-layer hierarchical taxonomy classification
 * 10. JobPublicationGovernor: Canonical decision chain & directApply invariant
 * 11. GovernmentJobExpiry: Corrigendum deadline extension vs expiration
 */

import { SourceScheduler } from '../src/lib/automation/SourceScheduler';
import { SourceChangeRate } from '../src/lib/automation/SourceChangeRate';
import { CircuitBreaker } from '../src/lib/automation/CircuitBreaker';
import { AutomationKillSwitch } from '../src/lib/automation/AutomationKillSwitch';
import { QueueManager } from '../src/lib/automation/QueueManager';
import { WorkerManager } from '../src/lib/automation/WorkerManager';
import { ConnectorCertification } from '../src/lib/government/discovery/ConnectorCertification';
import { GlobalLocationResolver } from '../src/lib/jobs/globalLocationResolver';
import { IndustryDomainResolver } from '../src/lib/jobs/industryDomainResolver';
import { JobPublicationGovernor } from '../src/lib/jobs/JobPublicationGovernor';
import { handleDeadlineExtension, evaluateJobExpiry } from '../src/lib/jobs/governmentJobExpiry';
import { GlobalJob } from '../src/types/jobs/globalJob';

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, failureDetails?: string) {
  totalTests += 1;
  if (condition) {
    passedTests += 1;
    console.log(`  [PASS] Test ${totalTests}: ${testName}`);
  } else {
    console.error(`  [FAIL] Test ${totalTests}: ${testName}`);
    if (failureDetails) console.error(`         Details: ${failureDetails}`);
  }
}

async function runAutomationSmokeTests() {
  console.log('\n================================================================');
  console.log('TalentXcel Global Government Jobs Automation Network — Test Suite');
  console.log('================================================================\n');

  // Test 1: SourceScheduler
  console.log('--- 1. SourceScheduler & SLA Evaluation ---');
  const due = SourceScheduler.getDueSources();
  assert(due.length > 0, 'SourceScheduler identifies due active sources');
  const usajobs = due.find((s) => s.sourceId === 'us-usajobs' || s.sourceId === 'usajobs');
  assert(usajobs?.priorityTier === 'P0', 'USAJOBS assigned P0 priority tier', `Tier: ${usajobs?.priorityTier}`);
  assert(usajobs?.wave === 'AMERICAS', 'USAJOBS correctly assigned to Americas wave');
  const empNews = due.find((s) => s.sourceId === 'in-employment-news');
  assert(empNews?.wave === 'INDIA_MIDDLE_EAST', 'Employment News assigned to India/Middle East wave');

  // Test 2: SourceChangeRate
  console.log('\n--- 2. SourceChangeRate Dynamic Velocity ---');
  const highVelocity = SourceChangeRate.recordSyncDelta('high-vol-source', 8000, 3000, 1000);
  assert(highVelocity.computedIntervalHours === 2, 'High velocity (>=10K/day) tunes interval to 2 hours', `Computed: ${highVelocity.computedIntervalHours}h`);
  const lowVelocity = SourceChangeRate.recordSyncDelta('low-vol-source', 5, 2, 1);
  assert(lowVelocity.computedIntervalHours === 24, 'Low velocity sources cap interval at 24-hour maximum SLA ceiling', `Computed: ${lowVelocity.computedIntervalHours}h`);

  // Test 3: CircuitBreaker Anomaly Tripping
  console.log('\n--- 3. CircuitBreaker Anomaly Detection ---');
  CircuitBreaker.resetAll();
  const trippedVol = CircuitBreaker.checkVolumeAnomaly('spike-source', 600, 100);
  assert(trippedVol, 'CircuitBreaker trips on 6x volume spike');
  assert(CircuitBreaker.isSourceTripped('spike-source'), 'Source is paused by circuit breaker');
  const drift = CircuitBreaker.checkDomainDrift('hijack-source', 'gov.in', 'malicious-phishing.com');
  assert(drift, 'CircuitBreaker trips on destination domain mutation');
  CircuitBreaker.resetSource('spike-source');
  assert(!CircuitBreaker.isSourceTripped('spike-source'), 'CircuitBreaker resets paused source on resolution');

  // Test 4: AutomationKillSwitch
  console.log('\n--- 4. AutomationKillSwitch Overrides ---');
  AutomationKillSwitch.resetAll();
  assert(AutomationKillSwitch.isIngestionAllowed('test-source'), 'Ingestion initially allowed');
  AutomationKillSwitch.pauseSource('errant-source');
  assert(!AutomationKillSwitch.isIngestionAllowed('errant-source'), 'Individual errant source can be paused');
  assert(AutomationKillSwitch.isIngestionAllowed('healthy-source'), 'Other sources remain unblocked');
  AutomationKillSwitch.setGlobalPause(true);
  assert(!AutomationKillSwitch.isIngestionAllowed('healthy-source'), 'Global pause halts all sources');
  AutomationKillSwitch.resetAll();

  // Test 5: QueueManager Priority Leasing & Dead-Letter
  console.log('\n--- 5. QueueManager Priority & Dead-Letter ---');
  QueueManager.resetAll();
  await QueueManager.enqueue('INGESTION', 'JOB_A', { title: 'Low priority job' }, 'P4');
  await QueueManager.enqueue('INGESTION', 'JOB_B', { title: 'Emergency job' }, 'P0');
  const leased = await QueueManager.dequeueBatch('INGESTION', 2, 'test-worker');
  assert(leased.length === 2, 'QueueManager dequeues available batch');
  assert(leased[0].priority === 'P0', 'P0 emergency job leased before P4 job', `First leased priority: ${leased[0].priority}`);
  await QueueManager.ack(leased[0].id);
  // Test failure escalation to dead-letter
  await QueueManager.nack(leased[1].id, 'Failure 1', 'src-1');
  await QueueManager.nack(leased[1].id, 'Failure 2', 'src-1');
  const dlResult = await QueueManager.nack(leased[1].id, 'Failure 3', 'src-1');
  assert(dlResult === 'DEAD_LETTER', 'Exhausted attempts route payload to dead-letter queue');

  // Test 6: WorkerManager Rate Limiting
  console.log('\n--- 6. WorkerManager Concurrency & Rate Limits ---');
  WorkerManager.resetAll();
  WorkerManager.setSourceLimits('throttled-source', 2, 10, 1);
  assert(WorkerManager.acquireSlot('throttled-source'), 'Worker acquires first available slot');
  assert(!WorkerManager.acquireSlot('throttled-source'), 'Worker rejects second concurrent request when concurrency=1');
  WorkerManager.releaseSlot('throttled-source');
  assert(WorkerManager.acquireSlot('throttled-source'), 'Slot becomes available after release');
  WorkerManager.releaseSlot('throttled-source');

  // Test 7: ConnectorCertification Gate
  console.log('\n--- 7. ConnectorCertification Qualification Gate ---');
  const sampleBatch: Partial<GlobalJob>[] = [
    { title: 'Junior Assistant', description: 'Detailed public service job description with responsibilities...', employer: { display_name: 'Staff Commission' } as any, posted_at: '2026-09-01', country_code: 'IN', city: 'New Delhi', industry_id: 'government', occupation_id: 'clerk', application_url: 'https://ssc.nic.in/apply' },
    { title: 'Section Officer', description: 'Detailed administrative duties in ministry...', employer: { display_name: 'Union Commission' } as any, posted_at: '2026-09-02', country_code: 'IN', city: 'New Delhi', industry_id: 'government', occupation_id: 'officer', application_url: 'https://upsc.gov.in/apply' },
    { title: 'Apprentice', description: 'Technical apprenticeship description...', employer: { display_name: 'IOCL' } as any, posted_at: '2026-09-03', country_code: 'IN', city: 'Mumbai', industry_id: 'government', occupation_id: 'apprentice', application_url: 'https://iocl.com/apply' },
    { title: 'Staff Nurse', description: 'Hospital nursing vacancy...', employer: { display_name: 'AIIMS' } as any, posted_at: '2026-09-04', country_code: 'IN', city: 'New Delhi', industry_id: 'healthcare', occupation_id: 'nurse', application_url: 'https://aiims.edu/apply' },
    { title: 'Probationary Officer', description: 'Banking probationary officer...', employer: { display_name: 'SBI' } as any, posted_at: '2026-09-05', country_code: 'IN', city: 'Mumbai', industry_id: 'finance', occupation_id: 'po', application_url: 'https://sbi.co.in/apply' },
  ];
  const certResult = ConnectorCertification.certifyConnector('test-connector', sampleBatch, true, true);
  assert(certResult.certified, 'Connector passes 7-point certification check', `Score: ${certResult.overallScore}`);

  // Test 8: GlobalLocationResolver Multi-Alias & Confidence
  console.log('\n--- 8. GlobalLocationResolver Hierarchical Resolution ---');
  const locBombay = GlobalLocationResolver.resolve('Bombay, India');
  assert(locBombay.city === 'Mumbai', 'Resolves historical alias "Bombay" to canonical "Mumbai"');
  assert(locBombay.locationConfidence === 1.0, 'City-level match assigns 1.00 confidence');
  assert(locBombay.isCityLevelVerified, 'Verified for city-level discovery page');

  const locRemote = GlobalLocationResolver.resolve('All India Nationwide Remote');
  assert(locRemote.locationConfidence === 0.60, 'Country-wide match assigns 0.60 confidence');
  assert(!locRemote.isCityLevelVerified, 'Country-only confidence strictly prevents thin city-level page indexing');

  // Test 9: IndustryDomainResolver 3-Layer Classification
  console.log('\n--- 9. IndustryDomainResolver 3-Layer Classification ---');
  const indUPSC = IndustryDomainResolver.resolve({ title: 'Assistant Section Officer', organization: 'Union Public Service Commission (UPSC)' });
  assert(indUPSC.industryDomainId === 'gov-civil-services', 'Layer 2 Entity Knowledge resolves UPSC to Civil Services Domain', `Domain: ${indUPSC.industryDomainId}`);
  assert(indUPSC.confidence >= 0.90, 'Entity resolution provides high confidence (>=0.90)');

  const indTech = IndustryDomainResolver.resolve({ title: 'Senior Backend Developer (Node.js & Python APIs)' });
  assert(indTech.industryDomainId === 'tech-backend', 'Layer 1 Dictionary resolves tech title to Backend Engineering', `Domain: ${indTech.industryDomainId}`);

  // Test 10: JobPublicationGovernor
  console.log('\n--- 10. JobPublicationGovernor Master Decision Chain ---');
  const validGovJob: GlobalJob = {
    id: 'gov-job-test-1',
    slug: 'upsc-section-officer-new-delhi',
    title: 'Assistant Section Officer',
    summary: 'Central secretariat service posting in New Delhi.',
    description: 'A comprehensive detailed job description exceeding 400 characters outlining responsibilities, eligibility, age limit, examination pattern, and government pay level 7 matrix.',
    provenance: {
      source_id: 'in-employment-news',
      source_name: 'Employment News',
      source_url: 'https://employmentnews.gov.in',
      external_job_id: 'EN-2026-4401',
      ingestion_timestamp: new Date().toISOString(),
      last_verified_at: new Date().toISOString(),
      original_posted_at: new Date().toISOString(),
      official_notification_pdf_url: 'https://employmentnews.gov.in/notices/EN-4401.pdf',
      attribution_required: true,
      attribution_text: 'Employment News / Ministry of I&B',
    },
    employer: {
      id: 'org-upsc',
      legal_name: 'Union Public Service Commission',
      display_name: 'UPSC',
      website: 'https://upsc.gov.in',
      country_code: 'IN',
      organization_type: 'GOVERNMENT',
      verification_status: 'GOVERNMENT_VERIFIED',
    },
    industry_id: 'government',
    occupation_id: 'gov-civil-services',
    skills: ['Public Administration', 'File Management', 'Office Procedure'],
    experience_level: 'ENTRY_LEVEL',
    minimum_experience_months: 0,
    accepts_freshers: true,
    requires_experience: false,
    country_code: 'IN',
    country_name: 'India',
    region_code: 'DL',
    region_name: 'Delhi',
    city: 'New Delhi',
    workplace_type: 'ON_SITE',
    salary: {
      currency: 'INR',
      minimum: 531000,
      maximum: 1100000,
      period: 'YEAR',
      original_display: 'Pay Matrix Level 7 (₹44,900 - ₹1,42,400)',
    },
    employment_type: 'FULL_TIME',
    application_method: 'OFFICIAL_GOVERNMENT',
    application_url: 'https://upsconline.nic.in/apply',
    is_government: true,
    government_level: 'FEDERAL',
    posted_at: new Date().toISOString(),
    valid_through: new Date(Date.now() + 20 * 24 * 3600 * 1000).toISOString(),
    status: 'VERIFIED',
    quality_score: 92,
    is_google_eligible: true,
    schema_validation_passed: true,
  };

  const decision = JobPublicationGovernor.evaluate(validGovJob);
  assert(decision.action === 'PUBLISH', 'Governor approves compliant government vacancy for PUBLISH', `Action: ${decision.action}`);
  assert(decision.isGoogleEligible, 'Governor confirms Google JobPosting schema eligibility');
  assert(!decision.canDirectApply, 'Hard invariant: directApply is FALSE for external official government applications');

  // Test 11: handleDeadlineExtension vs evaluateJobExpiry
  console.log('\n--- 11. Corrigenda & Deadline Extension ---');
  const extendedDate = new Date(Date.now() + 40 * 24 * 3600 * 1000).toISOString();
  const { updatedJob, corrigendum } = handleDeadlineExtension(validGovJob, extendedDate, 'https://upsc.gov.in/corrigendum-1.pdf');
  assert(updatedJob.valid_through === extendedDate, 'Deadline extension successfully updates valid_through');
  assert(corrigendum.update_type === 'DEADLINE_EXTENSION', 'Recorded DEADLINE_EXTENSION corrigendum event');
  const expiryCheck = evaluateJobExpiry(updatedJob);
  assert(!expiryCheck.isExpired, 'Extended job is not expired and retains active status');

  console.log(`\n================================================================`);
  console.log(`Automation Test Results: ${passedTests}/${totalTests} Passed (${Math.round((passedTests/totalTests)*100)}%)`);
  console.log(`================================================================\n`);

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runAutomationSmokeTests().catch((err) => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});
