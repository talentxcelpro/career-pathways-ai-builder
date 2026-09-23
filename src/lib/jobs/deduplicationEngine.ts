/**
 * TalentXcel Multi-Source Vacancy Deduplication Engine
 * Identifies duplicate job postings across portals (e.g. state portal + Employment News + aggregator)
 * and merges them into a single canonical GlobalJob entity with multi-source attribution.
 */

import { GlobalJob } from '@/types/jobs/globalJob';

export interface DeduplicationCluster {
  canonicalJob: GlobalJob;
  sourceReferences: Array<{
    sourceId: string;
    sourceName: string;
    externalId: string;
    sourceUrl: string;
    applicationUrl: string;
  }>;
  confidenceScore: number;
}

/**
 * Generates a normalized signature fingerprint for fuzzy vacancy matching
 */
export function generateVacancyFingerprint(job: Partial<GlobalJob>): string {
  const normTitle = (job.title || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 40);

  const normOrg = (job.employer?.legal_name || job.employer?.display_name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 30);

  const normLoc = (job.city || job.region_name || job.country_code || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

  const advt = (job.advt_number || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

  // If both have official advertisement numbers, that is the primary cluster key
  if (advt.length >= 4) {
    return `advt:${advt}:${normOrg}`;
  }

  return `sig:${normOrg}:${normTitle}:${normLoc}`;
}

/**
 * Evaluates match similarity between two job postings (0.0 to 1.0)
 */
export function calculateJobSimilarity(a: GlobalJob, b: GlobalJob): number {
  if (a.advt_number && b.advt_number && a.advt_number.toLowerCase() === b.advt_number.toLowerCase()) {
    return 1.0;
  }

  const fpA = generateVacancyFingerprint(a);
  const fpB = generateVacancyFingerprint(b);

  if (fpA === fpB) return 0.95;

  // Title token overlap
  const tokensA = new Set(a.title.toLowerCase().split(/\s+/).filter((t) => t.length > 2));
  const tokensB = new Set(b.title.toLowerCase().split(/\s+/).filter((t) => t.length > 2));

  let common = 0;
  for (const t of tokensA) {
    if (tokensB.has(t)) common++;
  }

  const totalTokens = Math.max(tokensA.size, tokensB.size);
  const tokenOverlap = totalTokens > 0 ? common / totalTokens : 0;

  const sameCountry = a.country_code === b.country_code;
  const sameOrg = a.employer.legal_name.toLowerCase() === b.employer.legal_name.toLowerCase();

  let similarity = tokenOverlap * 0.5;
  if (sameOrg) similarity += 0.35;
  if (sameCountry) similarity += 0.15;

  return similarity;
}

/**
 * Deduplicates a collection of jobs, grouping duplicates under the most authoritative source
 */
export function deduplicateJobs(jobs: GlobalJob[], threshold = 0.85): DeduplicationCluster[] {
  const clusters: DeduplicationCluster[] = [];

  for (const job of jobs) {
    let matchedCluster: DeduplicationCluster | null = null;

    for (const cluster of clusters) {
      const sim = calculateJobSimilarity(job, cluster.canonicalJob);
      if (sim >= threshold) {
        matchedCluster = cluster;
        break;
      }
    }

    if (matchedCluster) {
      matchedCluster.sourceReferences.push({
        sourceId: job.provenance.source_id,
        sourceName: job.provenance.source_name,
        externalId: job.provenance.external_job_id,
        sourceUrl: job.provenance.source_url,
        applicationUrl: job.application_url,
      });
      // Prefer government / official source as the canonical representation
      if (job.is_government && !matchedCluster.canonicalJob.is_government) {
        matchedCluster.canonicalJob = job;
      }
    } else {
      clusters.push({
        canonicalJob: job,
        sourceReferences: [
          {
            sourceId: job.provenance.source_id,
            sourceName: job.provenance.source_name,
            externalId: job.provenance.external_job_id,
            sourceUrl: job.provenance.source_url,
            applicationUrl: job.application_url,
          },
        ],
        confidenceScore: 1.0,
      });
    }
  }

  return clusters;
}
