/**
 * Authoritative TypeScript live-job check (matches SQL view `public.jobs_live`).
 * `expiry_date` is intentionally EXCLUDED per Decision 2 policy.
 */
export interface JobLiveCandidate {
  is_active?: boolean | null;
  job_status?: string | null;
  status?: string | null;
  expires_at?: string | null;
  application_deadline?: string | null;
}

export function isJobLive(job: JobLiveCandidate | null | undefined, nowMs: number = Date.now()): boolean {
  if (!job) return false;
  if (job.is_active !== true) return false;

  const jobStatus = (job.job_status ?? '').trim().toLowerCase();
  if (jobStatus === 'closed' || jobStatus === 'expired') return false;

  const status = (job.status ?? '').trim().toLowerCase();
  if (status === 'expired' || status === 'closed' || status === 'filled') return false;

  for (const col of ['expires_at', 'application_deadline'] as const) {
    const raw = job[col];
    if (raw) {
      const ts = new Date(raw).getTime();
      if (!Number.isNaN(ts) && ts <= nowMs) {
        return false;
      }
    }
  }

  return true;
}
