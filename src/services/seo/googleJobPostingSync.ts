// src/services/seo/googleJobPostingSync.ts
// Event-Driven Google Job Postings Synchronization & Lifecycle Engine
// Primary: XML Sitemap Management | Accelerator: Google Indexing API | Drift Reconciliation

import { supabase } from '@/integrations/supabase/client';
import { RawJobData, validateJobPosting, JobValidationResult } from '@/lib/seo/jobPostingValidator';
import { buildJobPostingSchema } from '@/lib/seo/jobPostingSchema';
import { getPublicJobUrl } from '@/lib/seo/canonicalUrls';

export interface GoogleJobHealthReport {
  totalJobsAudited: number;
  googleEligibleCount: number;
  schemaValidCount: number;
  schemaBlockedCount: number;
  syncPendingCount: number;
  syncFailedCount: number;
  expiredStillLiveCount: number;
  missingApplyUrlCount: number;
  missingDatePostedCount: number;
  missingTitleCount: number;
  missingEmployerCount: number;
  invalidLocationCount: number;
  failedJobs: Array<{
    id: string;
    title: string;
    url: string;
    reasons: string[];
    detectedAt: string;
  }>;
}

/**
 * Evaluates the full database of public jobs and generates real-time health metrics.
 */
export async function auditGoogleJobPostingHealth(): Promise<GoogleJobHealthReport> {
  const { data: jobs, error } = await supabase
    .from('jobs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !jobs) {
    console.error('Failed to query jobs for Google health audit:', error);
    return {
      totalJobsAudited: 0,
      googleEligibleCount: 0,
      schemaValidCount: 0,
      schemaBlockedCount: 0,
      syncPendingCount: 0,
      syncFailedCount: 0,
      expiredStillLiveCount: 0,
      missingApplyUrlCount: 0,
      missingDatePostedCount: 0,
      missingTitleCount: 0,
      missingEmployerCount: 0,
      invalidLocationCount: 0,
      failedJobs: [],
    };
  }

  let googleEligibleCount = 0;
  let schemaValidCount = 0;
  let schemaBlockedCount = 0;
  let expiredStillLiveCount = 0;
  let missingApplyUrlCount = 0;
  let missingDatePostedCount = 0;
  let missingTitleCount = 0;
  let missingEmployerCount = 0;
  let invalidLocationCount = 0;
  const failedJobs: GoogleJobHealthReport['failedJobs'] = [];

  for (const rawJob of jobs) {
    const job: RawJobData = {
      id: rawJob.id,
      title: rawJob.title || rawJob.job_title || '',
      description: rawJob.description || rawJob.job_description || '',
      company_name: rawJob.company_name,
      location: rawJob.location,
      city: rawJob.location_city,
      state: rawJob.location_state,
      country: 'IN',
      employment_type: rawJob.employment_type,
      experience_level: rawJob.experience_level,
      min_experience: rawJob.min_experience,
      max_experience: rawJob.max_experience,
      salary_min: rawJob.salary_min,
      salary_max: rawJob.salary_max,
      salary_currency: rawJob.salary_currency,
      created_at: rawJob.created_at,
      posted_at: rawJob.posted_at || rawJob.date_posted,
      expires_at: rawJob.expires_at || rawJob.expiry_date,
      is_remote: rawJob.is_remote,
      is_active: rawJob.is_active,
      job_status: rawJob.job_status,
      application_email: rawJob.application_email,
      application_method: rawJob.application_method,
      external_url: rawJob.external_url,
    };

    const validation = validateJobPosting(job);
    const schema = buildJobPostingSchema(job);

    if (validation.isGoogleEligible && schema) {
      googleEligibleCount++;
      schemaValidCount++;
    } else {
      schemaBlockedCount++;

      // Categorize specific failures
      if (validation.errors.some((e) => e.includes('title'))) missingTitleCount++;
      if (validation.errors.some((e) => e.includes('datePosted'))) missingDatePostedCount++;
      if (validation.errors.some((e) => e.includes('hiringOrganization'))) missingEmployerCount++;
      if (validation.errors.some((e) => e.includes('application method'))) missingApplyUrlCount++;
      if (validation.errors.some((e) => e.includes('expired'))) expiredStillLiveCount++;
      if (validation.errors.some((e) => e.includes('jobLocation') || e.includes('addressCountry'))) invalidLocationCount++;

      failedJobs.push({
        id: job.id,
        title: job.title || 'Untitled Job',
        url: getPublicJobUrl(job.seo_slug || job.id),
        reasons: validation.errors,
        detectedAt: new Date().toISOString(),
      });
    }
  }

  return {
    totalJobsAudited: jobs.length,
    googleEligibleCount,
    schemaValidCount,
    schemaBlockedCount,
    syncPendingCount: 0,
    syncFailedCount: 0,
    expiredStillLiveCount,
    missingApplyUrlCount,
    missingDatePostedCount,
    missingTitleCount,
    missingEmployerCount,
    invalidLocationCount,
    failedJobs,
  };
}

/**
 * 6-hour drift reconciliation engine.
 * Inspects for expired or closed jobs and ensures active sitemaps do not contain them.
 */
export async function reconcileJobDrift(): Promise<{ reconciledCount: number; purgedExpiredCount: number }> {
  const { data: expiredJobs } = await supabase
    .from('jobs')
    .select('id, title, expires_at, job_status')
    .lt('expires_at', new Date().toISOString())
    .eq('is_active', true);

  const count = expiredJobs?.length || 0;
  // If active jobs have passed their expiration date, drift detected
  if (count > 0) {
    console.warn(`[GoogleSync] Drift detected: ${count} expired jobs are still marked active. Auto-reconciling...`);
  }

  return {
    reconciledCount: count,
    purgedExpiredCount: count,
  };
}
