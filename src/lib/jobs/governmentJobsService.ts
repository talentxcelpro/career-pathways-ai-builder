/**
 * TalentXcel Government Jobs Aggregation & Intelligence Service
 * Provides robust synchronous initial data hydration and resilient asynchronous discovery.
 * Enforces strict freshness validation and job completeness invariants.
 */

import { EmploymentNewsConnector } from './connectors/india/EmploymentNewsConnector';
import { CentralGovConnector } from './connectors/india/CentralGovConnector';
import { StateGovConnector } from './connectors/india/StateGovConnector';
import { PSUConnector } from './connectors/india/PSUConnector';
import { USAJobsConnector } from './connectors/usajobs/USAJobsConnector';
import { GlobalJob } from '@/types/jobs/globalJob';

/**
 * Validates that a job notification is fresh and contains all complete metadata.
 */
export function isJobFreshAndComplete(job: GlobalJob): boolean {
  if (!job.id || !job.title || !job.employer?.legal_name || !job.application_url) {
    return false;
  }

  // Completeness: official application URL must be valid
  if (!job.application_url.startsWith('http://') && !job.application_url.startsWith('https://')) {
    return false;
  }

  // Freshness: Closing date must not be in the past
  if (job.valid_through) {
    const closingTime = new Date(job.valid_through).getTime();
    if (!isNaN(closingTime) && closingTime < Date.now()) {
      return false; // Job is expired
    }
  }

  return true;
}

/**
 * Clean, deduplicate, and sort vacancies (newest first).
 */
function processAndSortJobs(jobs: GlobalJob[]): GlobalJob[] {
  const seen = new Set<string>();
  const validJobs: GlobalJob[] = [];

  for (const job of jobs) {
    if (!job || !job.id || seen.has(job.id)) continue;
    if (isJobFreshAndComplete(job)) {
      seen.add(job.id);
      validJobs.push(job);
    }
  }

  // Sort newest posted first
  validJobs.sort((a, b) => {
    const timeA = a.posted_at ? new Date(a.posted_at).getTime() : 0;
    const timeB = b.posted_at ? new Date(b.posted_at).getTime() : 0;
    return timeB - timeA;
  });

  return validJobs;
}

/**
 * Returns instant verified government vacancies synchronously for fast initial paint.
 */
export function getInitialGovernmentJobs(): GlobalJob[] {
  try {
    const en = new EmploymentNewsConnector();
    const upsc = new CentralGovConnector();
    const state = new StateGovConnector();
    const psu = new PSUConnector();
    const usajobs = new USAJobsConnector();

    const enRaw = en.getVerifiedAnnouncements();
    const upscRaw = upsc.getVerifiedAnnouncements();
    const stateRaw = state.getVerifiedAnnouncements();
    const psuRaw = psu.getVerifiedAnnouncements();
    const usaRaw = usajobs.getScaffoldAnnouncements();

    const rawPool: GlobalJob[] = [
      ...enRaw.map((r) => en.normalize(r)),
      ...upscRaw.map((r) => upsc.normalize(r)),
      ...stateRaw.map((r) => state.normalize(r)),
      ...psuRaw.map((r) => psu.normalize(r)),
      ...usaRaw.map((r) => usajobs.normalize(r)),
    ];

    return processAndSortJobs(rawPool);
  } catch (error) {
    console.error('Error hydrating initial government jobs:', error);
    return [];
  }
}

/**
 * Asynchronously gathers fresh vacancies across all active connectors with fault tolerance.
 */
export async function fetchAllGovernmentJobs(): Promise<GlobalJob[]> {
  const en = new EmploymentNewsConnector();
  const upsc = new CentralGovConnector();
  const state = new StateGovConnector();
  const psu = new PSUConnector();
  const usajobs = new USAJobsConnector();

  const results = await Promise.allSettled([
    en.discoverJobs().then((items) => items.map((r) => en.normalize(r))),
    upsc.discoverJobs().then((items) => items.map((r) => upsc.normalize(r))),
    state.discoverJobs().then((items) => items.map((r) => state.normalize(r))),
    psu.discoverJobs().then((items) => items.map((r) => psu.normalize(r))),
    usajobs.discoverJobs().then((items) => items.map((r) => usajobs.normalize(r))),
  ]);

  const jobs: GlobalJob[] = [];
  for (const r of results) {
    if (r.status === 'fulfilled' && Array.isArray(r.value)) {
      jobs.push(...r.value);
    } else if (r.status === 'rejected') {
      console.warn('Government connector discovery warning:', r.reason);
    }
  }

  const processed = processAndSortJobs(jobs);

  // Fallback to verified local announcements if live discovery returned empty
  if (processed.length === 0) {
    return getInitialGovernmentJobs();
  }

  return processed;
}

/**
 * Find single government vacancy by ID or slug with fallback.
 */
export async function getGovernmentJobById(id: string): Promise<GlobalJob | null> {
  const initial = getInitialGovernmentJobs();
  const localMatch = initial.find((j) => j.id === id || j.slug.includes(id));
  if (localMatch) return localMatch;

  const fresh = await fetchAllGovernmentJobs();
  return fresh.find((j) => j.id === id || j.slug.includes(id)) || null;
}
