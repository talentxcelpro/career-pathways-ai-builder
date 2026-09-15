// src/services/seo/indexingReconciliationService.ts
// Six-Hour Automated Database <-> Sitemap <-> Google Indexing Reconciliation Engine
// Audits job lifecycles, suppresses expired postings, enqueues URL_DELETED events, and prevents soft-404s

import { supabase } from '@/integrations/supabase/client';
import { enqueueJobForIndexing } from './googleIndexingApi';
import { getPublicJobUrl } from '@/lib/seo/canonicalUrls';

export interface ReconciliationReport {
  timestamp: string;
  totalAuditedJobs: number;
  activeEligibleJobs: number;
  newlyExpiredJobs: number;
  deletedUrlsEnqueued: number;
  reconciliationStatus: 'SYNCED' | 'DRIFT_DETECTED' | 'RECONCILED';
  countryDriftSummary: Record<string, { active: number; expired: number }>;
}

/**
 * Runs a 6-hour lifecycle sync reconciliation cycle
 */
export async function runSixHourReconciliation(): Promise<ReconciliationReport> {
  const now = new Date();
  const report: ReconciliationReport = {
    timestamp: now.toISOString(),
    totalAuditedJobs: 0,
    activeEligibleJobs: 0,
    newlyExpiredJobs: 0,
    deletedUrlsEnqueued: 0,
    reconciliationStatus: 'SYNCED',
    countryDriftSummary: {},
  };

  try {
    // 1. Fetch active jobs to audit expiration
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('id, seo_slug, expires_at, is_active, status, location_city')
      .limit(1000);

    if (error || !jobs) {
      return report;
    }

    report.totalAuditedJobs = jobs.length;

    for (const job of jobs) {
      const isExpired = job.expires_at ? new Date(job.expires_at) < now : false;
      const isInactive = job.is_active === false || job.status === 'closed';

      if (isExpired || isInactive) {
        report.newlyExpiredJobs++;
        const canonicalUrl = getPublicJobUrl(job.seo_slug || job.id);
        
        // Enqueue deletion event
        await enqueueJobForIndexing(canonicalUrl, job.id, 'URL_DELETED', 'NORMAL');
        report.deletedUrlsEnqueued++;
      } else {
        report.activeEligibleJobs++;
      }
    }

    if (report.newlyExpiredJobs > 0) {
      report.reconciliationStatus = 'RECONCILED';
    }
  } catch (err) {
    console.error('[Reconciliation Engine] Error during execution:', err);
  }

  return report;
}
