// src/lib/seo/demandDataLake/competitorGapHarvester.ts
// Competitor Ranking Gap Analysis & Content Gap Harvester

export interface CompetitorGapRecord {
  competitorDomain: string;
  competitorUrl: string;
  rankingQuery: string;
  competitorEstimatedPosition: number;
  searchVolumeEstimate: string;
  intentCategory: string;
  talentxcelMatchingUrl: string | null;
  gapStatus: 'FULL_GAP_CREATE_ASSET' | 'PARTIAL_GAP_ENRICH_EXISTING' | 'COVERED_AWAITING_RANK';
  recommendedAssetType: string;
}

export const TOP_COMPETITOR_GAPS: CompetitorGapRecord[] = [
  {
    competitorDomain: 'naukri.com',
    competitorUrl: 'https://www.naukri.com/python-developer-jobs-in-bangalore',
    rankingQuery: 'python developer jobs in bangalore',
    competitorEstimatedPosition: 1,
    searchVolumeEstimate: 'HIGH',
    intentCategory: 'JOB_SEARCH',
    talentxcelMatchingUrl: 'https://talentxcel.in/jobs/python-developer/bangalore',
    gapStatus: 'COVERED_AWAITING_RANK',
    recommendedAssetType: 'Role x Location Hub',
  },
  {
    competitorDomain: 'resumeworded.com',
    competitorUrl: 'https://resumeworded.com/ats-resume-scanner',
    rankingQuery: 'free online ats resume scanner india',
    competitorEstimatedPosition: 2,
    searchVolumeEstimate: 'VERY_HIGH',
    intentCategory: 'TRANSACTIONAL_TOOL',
    talentxcelMatchingUrl: 'https://talentxcel.in/resume',
    gapStatus: 'PARTIAL_GAP_ENRICH_EXISTING',
    recommendedAssetType: 'Interactive ATS Tool',
  },
  {
    competitorDomain: 'shiksha.com',
    competitorUrl: 'https://www.shiksha.com/engineering/articles/top-engineering-colleges-in-india-ranking-fees-placements',
    rankingQuery: 'top engineering colleges in india with placement ctc',
    competitorEstimatedPosition: 3,
    searchVolumeEstimate: 'VERY_HIGH',
    intentCategory: 'INFORMATIONAL_EDUCATION',
    talentxcelMatchingUrl: 'https://talentxcel.in/colleges',
    gapStatus: 'PARTIAL_GAP_ENRICH_EXISTING',
    recommendedAssetType: 'Higher Ed Colleges Hub',
  },
  {
    competitorDomain: 'turbohire.co',
    competitorUrl: 'https://turbohire.co/ai-recruitment-platform',
    rankingQuery: 'ai recruitment software for enterprise india',
    competitorEstimatedPosition: 2,
    searchVolumeEstimate: 'HIGH',
    intentCategory: 'COMMERCIAL_B2B',
    talentxcelMatchingUrl: 'https://talentxcel.in/services/ai-recruitment',
    gapStatus: 'COVERED_AWAITING_RANK',
    recommendedAssetType: 'Commercial Service Landing Page',
  },
  {
    competitorDomain: 'producthunt.com',
    competitorUrl: 'https://www.producthunt.com/topics/ai',
    rankingQuery: 'ai products leaderboard rankings',
    competitorEstimatedPosition: 1,
    searchVolumeEstimate: 'HIGH',
    intentCategory: 'COMMERCIAL_DIRECTORY',
    talentxcelMatchingUrl: 'https://talentxcel.in/rankings/ai-products',
    gapStatus: 'COVERED_AWAITING_RANK',
    recommendedAssetType: 'Live Product Ranking Hub',
  },
];
