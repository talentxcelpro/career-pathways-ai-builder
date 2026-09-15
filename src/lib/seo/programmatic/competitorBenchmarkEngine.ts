// src/lib/seo/programmatic/competitorBenchmarkEngine.ts
// Apna / Naukri / Indeed Competitor SERP Benchmarking Engine

export interface CompetitorBenchmarkRecord {
  query: string;
  cluster: string;
  intent: 'transactional' | 'informational' | 'commercial' | 'navigational';
  location: string;
  role: string;
  volume: number;
  competition: 'low' | 'medium' | 'high';
  cpc: number;
  apna_position: number | null;
  naukri_position: number | null;
  indeed_position: number | null;
  talentxcel_position: number | null;
  talentxcel_url: string;
  best_competitor_url: string;
  gap_type: 'ranking' | 'content_gap' | 'authority_gap' | 'talentxcel_winning';
  business_value: number; // 0.0 - 1.0
  page_exists: boolean;
  action: 'OPTIMIZE' | 'CREATE_HIGH_VALUE' | 'DEFEND' | 'CONSOLIDATE';
  priority: 'P0' | 'P1' | 'P2' | 'P3';
}

export const APNA_NAUKRI_BENCHMARK_RECORDS: CompetitorBenchmarkRecord[] = [
  {
    query: 'software engineer jobs in bangalore',
    cluster: 'jobs',
    intent: 'transactional',
    location: 'Bangalore',
    role: 'software-engineer',
    volume: 18000,
    competition: 'high',
    cpc: 85,
    apna_position: 2,
    naukri_position: 1,
    indeed_position: 3,
    talentxcel_position: 47,
    talentxcel_url: 'https://talentxcel.in/jobs/software-engineer/bangalore',
    best_competitor_url: 'https://apna.co/jobs/title_software_engineer-jobs-in-bengaluru',
    gap_type: 'ranking',
    business_value: 0.95,
    page_exists: true,
    action: 'OPTIMIZE',
    priority: 'P0',
  },
  {
    query: 'content writer jobs in noida',
    cluster: 'jobs',
    intent: 'transactional',
    location: 'Noida',
    role: 'content-writer',
    volume: 3200,
    competition: 'medium',
    cpc: 45,
    apna_position: 4,
    naukri_position: 2,
    indeed_position: 5,
    talentxcel_position: 6,
    talentxcel_url: 'https://talentxcel.in/jobs/content-writer-chatr-charchat-talentxcel-services-noida-uttar-pradesh-india-1',
    best_competitor_url: 'https://www.naukri.com/content-writer-jobs-in-noida',
    gap_type: 'ranking',
    business_value: 0.92,
    page_exists: true,
    action: 'OPTIMIZE',
    priority: 'P0',
  },
  {
    query: 'marketing executive jobs in noida',
    cluster: 'jobs',
    intent: 'transactional',
    location: 'Noida',
    role: 'marketing-executive',
    volume: 2800,
    competition: 'medium',
    cpc: 40,
    apna_position: 3,
    naukri_position: 1,
    indeed_position: 4,
    talentxcel_position: 7,
    talentxcel_url: 'https://talentxcel.in/jobs/marketing-executive-chatr-charchat-talentxcel-services-noida-uttar-pradesh-india-1',
    best_competitor_url: 'https://apna.co/jobs/marketing_executive-jobs-in-noida',
    gap_type: 'ranking',
    business_value: 0.90,
    page_exists: true,
    action: 'OPTIMIZE',
    priority: 'P0',
  },
  {
    query: 'jobs in srinagar',
    cluster: 'locations',
    intent: 'transactional',
    location: 'Srinagar',
    role: 'all',
    volume: 6400,
    competition: 'low',
    cpc: 25,
    apna_position: 1,
    naukri_position: 3,
    indeed_position: 2,
    talentxcel_position: 22,
    talentxcel_url: 'https://talentxcel.in/locations/srinagar',
    best_competitor_url: 'https://apna.co/jobs/jobs-in-srinagar',
    gap_type: 'authority_gap',
    business_value: 0.88,
    page_exists: true,
    action: 'OPTIMIZE',
    priority: 'P1',
  },
  {
    query: 'jobs in jammu',
    cluster: 'locations',
    intent: 'transactional',
    location: 'Jammu',
    role: 'all',
    volume: 5800,
    competition: 'low',
    cpc: 25,
    apna_position: 2,
    naukri_position: 1,
    indeed_position: 3,
    talentxcel_position: 26,
    talentxcel_url: 'https://talentxcel.in/locations/jammu',
    best_competitor_url: 'https://apna.co/jobs/jobs-in-jammu',
    gap_type: 'authority_gap',
    business_value: 0.88,
    page_exists: true,
    action: 'OPTIMIZE',
    priority: 'P1',
  },
  {
    query: 'ats resume score checker online',
    cluster: 'tools',
    intent: 'transactional',
    location: 'India',
    role: 'software-engineer',
    volume: 14000,
    competition: 'high',
    cpc: 95,
    apna_position: null, // Apna lacks ATS tools
    naukri_position: 8,
    indeed_position: null,
    talentxcel_position: 11,
    talentxcel_url: 'https://talentxcel.in/resources/ats-resume-guide-2026',
    best_competitor_url: 'https://resumeworded.com/score',
    gap_type: 'ranking',
    business_value: 0.98,
    page_exists: true,
    action: 'OPTIMIZE',
    priority: 'P0',
  },
  {
    query: 'ai recruitment software india',
    cluster: 'services',
    intent: 'commercial',
    location: 'India',
    role: 'recruiter',
    volume: 4500,
    competition: 'medium',
    cpc: 120,
    apna_position: null,
    naukri_position: 6,
    indeed_position: null,
    talentxcel_position: 8,
    talentxcel_url: 'https://talentxcel.in/services/ai-recruitment',
    best_competitor_url: 'https://turbohire.co',
    gap_type: 'ranking',
    business_value: 0.99,
    page_exists: true,
    action: 'OPTIMIZE',
    priority: 'P0',
  },
];
