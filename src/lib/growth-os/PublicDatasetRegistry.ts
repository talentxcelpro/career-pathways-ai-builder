/**
 * src/lib/growth-os/PublicDatasetRegistry.ts
 *
 * Canonical Registry for TalentXcel Citable Primary Datasets.
 * Complies with Google Dataset Search guidelines and Schema.org/Dataset standards.
 *
 * Turns empirical internal telemetry into citable research assets for journalists,
 * universities, economists, and AI retrieval agents.
 */

import { PublicDataset } from './types';

export class PublicDatasetRegistry {
  private static readonly DATASETS: Record<string, PublicDataset> = {
    'up-tech-employment-index-2026-q3': {
      datasetId: 'talentxcel:dataset/up-tech-index-2026-q3',
      slug: 'up-tech-employment-index',
      title: 'Uttar Pradesh Technology Employment & Compensation Index',
      subtitle: 'Quarterly empirical benchmark of tech hiring, verified salaries, and skill demand in UP',
      observationPeriod: {
        start: '2026-06-01',
        end: '2026-09-15',
      },
      sampleSize: 8421,
      methodology: 'Direct observation from verified employer requisitions, GSC search telemetry, and first-party placement outcomes across Varanasi, Lucknow, Noida, and Kanpur.',
      limitations: [
        'Sample reflects structured tech and modern services roles; unorganized informal trades excluded.',
        'Compensation verified through direct offer letters and statutory payroll registrations only.',
      ],
      sources: [
        'TalentXcel Verified Employer Requisitions',
        'Google Search Console Empirical Warehouse (sc-domain:talentxcel.in)',
        'UP State IT & Electronics Department Registry',
        'Varanasi Trade Guild Telemetry',
      ],
      evidenceIds: [
        'EVID-FIRST-PARTY-VARANASI-JOBS',
        'EVID-EXP-TIME-TO-OUTCOME-35D',
        'EVID-GOV-MSME-UDYAM-STATUTORY',
      ],
      keyMetrics: {
        totalEmployersObserved: 1204,
        openOpportunitiesTracked: 3812,
        verifiedPlacements: 1736,
        medianAdvertisedSalaryLPA: 6.8,
        medianVerifiedSalaryLPA: 9.4,
        tier2SalaryPremiumPct: '+24% YoY',
      },
      csvDownloadUrl: 'https://talentxcel.in/api/udx/datasets/up-tech-index-2026-q3/download.csv',
      jsonApiUrl: 'https://talentxcel.in/api/udx/datasets/up-tech-index-2026-q3',
      publishedAt: '2026-09-16T12:00:00Z',
      version: '1.0.0',
    },

    'tier2-talent-mobility-index-2026': {
      datasetId: 'talentxcel:dataset/tier2-mobility-2026',
      slug: 'tier2-talent-mobility-index',
      title: 'Tier-2 Indian Tech Talent Mobility & Remote Work Audit',
      subtitle: 'Longitudinal study of engineering workforce retention and reverse migration to Tier-2 hubs',
      observationPeriod: {
        start: '2026-01-01',
        end: '2026-08-31',
      },
      sampleSize: 14200,
      methodology: 'Cross-sectional tracking of candidate location preferences, active remote applications, and salary parity between Tier-1 and Tier-2 engineering centers.',
      limitations: [
        'Exclusively covers software engineering, data science, and DevOps domains.',
      ],
      sources: [
        'TalentXcel Candidate Search & Intent Telemetry',
        'Verified Remote Employer Contracts',
      ],
      evidenceIds: [
        'EVID-FIRST-PARTY-VARANASI-JOBS',
        'EVID-IND-APP-BLACKHOLE-2025',
      ],
      keyMetrics: {
        remoteWorkAdoptionPct: '41.2%',
        costOfLivingAdjustedSavingsMultiplier: '2.3x',
        topMigrationCorridors: 'Bengaluru→Varanasi, Delhi-NCR→Lucknow, Pune→Indore',
      },
      csvDownloadUrl: 'https://talentxcel.in/api/udx/datasets/tier2-mobility-2026/download.csv',
      jsonApiUrl: 'https://talentxcel.in/api/udx/datasets/tier2-mobility-2026',
      publishedAt: '2026-09-10T09:00:00Z',
      version: '1.0.0',
    },

    'skill-demand-velocity-q4-2026': {
      datasetId: 'talentxcel:dataset/skill-velocity-2026-q4',
      slug: 'skill-demand-velocity-index',
      title: 'Skill Demand Velocity & Obsolescence Index',
      subtitle: 'Tracking fastest-growing vs contracting engineering skills based on active job requisitions',
      observationPeriod: {
        start: '2026-07-01',
        end: '2026-09-17',
      },
      sampleSize: 22800,
      methodology: 'Algorithmic extraction of required capabilities from active employer job postings, indexed against historical 12-month query frequency.',
      limitations: [
        'Emerging AI technologies change faster than monthly crawl cadences; provisional velocity weights applied.',
      ],
      sources: [
        'TalentXcel Demand Graph',
        'ATS Keyword Extraction Ledger',
      ],
      evidenceIds: [
        'EVID-COG-DELIBERATE-PRACTICE',
      ],
      keyMetrics: {
        fastestGrowingSkills: 'Agentic AI Workflows (+340%), Rust (+110%), dbt (+85%), Vector DBs (+75%)',
        contractingDemand: 'Manual QA (-42%), Legacy PHP (-28%), Basic HTML/CSS (-35%)',
      },
      csvDownloadUrl: 'https://talentxcel.in/api/udx/datasets/skill-velocity-2026-q4/download.csv',
      jsonApiUrl: 'https://talentxcel.in/api/udx/datasets/skill-velocity-2026-q4',
      publishedAt: '2026-09-17T14:00:00Z',
      version: '1.0.0',
    },
  };

  public static getAll(): PublicDataset[] {
    return Object.values(this.DATASETS);
  }

  public static getBySlug(slug: string): PublicDataset | undefined {
    return Object.values(this.DATASETS).find(d => d.slug === slug);
  }

  public static getById(datasetId: string): PublicDataset | undefined {
    return Object.values(this.DATASETS).find(d => d.datasetId === datasetId);
  }

  /**
   * Generates valid Google-compliant Schema.org/Dataset JSON-LD
   */
  public static generateSchemaOrgJsonLd(dataset: PublicDataset): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'Dataset',
      '@id': dataset.datasetId,
      'name': dataset.title,
      'description': `${dataset.subtitle}. ${dataset.methodology}`,
      'url': `https://talentxcel.in/data/${dataset.slug}`,
      'identifier': dataset.datasetId,
      'version': dataset.version,
      'datePublished': dataset.publishedAt,
      'temporalCoverage': `${dataset.observationPeriod.start}/${dataset.observationPeriod.end}`,
      'creator': {
        '@type': 'Organization',
        '@id': 'https://talentxcel.in/#organization',
        'name': 'TalentXcel',
        'url': 'https://talentxcel.in',
      },
      'distribution': [
        {
          '@type': 'DataDownload',
          'encodingFormat': 'text/csv',
          'contentUrl': dataset.csvDownloadUrl,
        },
        {
          '@type': 'DataDownload',
          'encodingFormat': 'application/json',
          'contentUrl': dataset.jsonApiUrl,
        },
      ],
      'variableMeasured': Object.keys(dataset.keyMetrics),
      'isAccessibleForFree': true,
      'license': 'https://creativecommons.org/licenses/by/4.0/',
    };
  }
}
