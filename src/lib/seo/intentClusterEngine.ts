// src/lib/seo/intentClusterEngine.ts
// Query-to-Intent Cluster Registry: Groups semantically equivalent queries into one canonical destination
// Prevents duplicate-intent page creation across the 14 TalentXcel product surfaces

import { sha256Truncated } from '@/lib/crypto/deterministicSha256';

export interface IntentCluster {
  cluster_id: string;
  primary_query: string;
  surface: string;
  canonical_url: string;
  representative_queries: string[];
  intent_category: string;
  journey_stage: 'DISCOVERY' | 'EVALUATION' | 'DECISION' | 'APPLICATION' | 'RETENTION';
  dedup_hash: string;
  estimated_cluster_volume: number | null;
  volume_note: string;
}

const STOPWORDS = new Set(['jobs', 'job', 'in', 'at', 'for', 'the', 'a', 'an', 'of', 'and', 'or', 'to', 'with']);

export function normalizeForClustering(q: string): string {
  return q
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter(w => !STOPWORDS.has(w))
    .join(' ')
    .replace(/\s+/g, ' ');
}

export function generateClusterId(normalizedQuery: string, surface: string): string {
  const hash = sha256Truncated(`${normalizedQuery}|${surface}`, 8);
  return `cls_${hash}`;
}

export function classifyJourneyStage(query: string): IntentCluster['journey_stage'] {
  const q = query.toLowerCase();
  if (/\b(apply|application|hiring|vacancy|vacancies|opening)\b/.test(q)) return 'APPLICATION';
  if (/\bjobs?\b/.test(q)) return 'APPLICATION';
  if (/\b(review|compare|vs|best|top|ranking)\b/.test(q)) return 'EVALUATION';
  if (/\b(which|should i|right for|worth)\b/.test(q)) return 'DECISION';
  if (/\b(tips|improve|advance|grow|transition)\b/.test(q)) return 'RETENTION';
  return 'DISCOVERY';
}

export function deduplicateClusters(clusters: IntentCluster[]): IntentCluster[] {
  const seen = new Set<string>();
  return clusters.filter(c => {
    if (seen.has(c.dedup_hash)) return false;
    seen.add(c.dedup_hash);
    return true;
  });
}

export const SAMPLE_INTENT_CLUSTERS: IntentCluster[] = [
  // JOBS surface - 4 clusters
  {
    cluster_id: generateClusterId('software engineer bangalore', 'JOBS'),
    primary_query: 'software engineer jobs in bangalore',
    surface: 'JOBS',
    canonical_url: 'https://talentxcel.in/jobs/software-engineer/bangalore',
    representative_queries: ['software engineer jobs in bangalore', 'software developer jobs bangalore', 'software engineering jobs bengaluru', 'SE jobs bangalore', 'software developer openings bangalore'],
    intent_category: 'TRANSACTIONAL_JOB',
    journey_stage: 'APPLICATION',
    dedup_hash: sha256Truncated('software engineer bangalore JOBS', 16),
    estimated_cluster_volume: 45000,
    volume_note: 'Aggregated across semantically equivalent queries; source: Google Keyword Planner estimate',
  },
  {
    cluster_id: generateClusterId('data analyst delhi', 'JOBS'),
    primary_query: 'data analyst jobs in delhi',
    surface: 'JOBS',
    canonical_url: 'https://talentxcel.in/jobs/data-analyst/delhi',
    representative_queries: ['data analyst jobs delhi', 'data analyst vacancy delhi', 'data analyst openings delhi ncr', 'data analyst hiring delhi'],
    intent_category: 'TRANSACTIONAL_JOB',
    journey_stage: 'APPLICATION',
    dedup_hash: sha256Truncated('data analyst delhi JOBS', 16),
    estimated_cluster_volume: 22000,
    volume_note: 'Aggregated from Keyword Planner and GSC impressions',
  },
  {
    cluster_id: generateClusterId('content writer noida', 'JOBS'),
    primary_query: 'content writer jobs noida',
    surface: 'JOBS',
    canonical_url: 'https://talentxcel.in/jobs/content-writer-chatr-charchat-talentxcel-services-noida-uttar-pradesh-india-1',
    representative_queries: ['content writer jobs noida', 'content writer vacancy noida', 'copywriter jobs noida', 'content writing jobs noida up'],
    intent_category: 'TRANSACTIONAL_JOB',
    journey_stage: 'APPLICATION',
    dedup_hash: sha256Truncated('content writer noida JOBS', 16),
    estimated_cluster_volume: 8500,
    volume_note: 'GSC observed: 180 impressions/month at position 6.4',
  },
  {
    cluster_id: generateClusterId('marketing executive noida', 'JOBS'),
    primary_query: 'marketing executive jobs noida',
    surface: 'JOBS',
    canonical_url: 'https://talentxcel.in/jobs/marketing-executive-chatr-charchat-talentxcel-services-noida-uttar-pradesh-india-1',
    representative_queries: ['marketing executive jobs noida', 'marketing manager jobs noida', 'digital marketing jobs noida', 'marketing jobs noida up'],
    intent_category: 'TRANSACTIONAL_JOB',
    journey_stage: 'APPLICATION',
    dedup_hash: sha256Truncated('marketing executive noida JOBS', 16),
    estimated_cluster_volume: 12000,
    volume_note: 'GSC observed: 160 impressions/month at position 7.2',
  },
  // RESUME_ATS surface - 2 clusters
  {
    cluster_id: generateClusterId('free ats resume scanner india', 'RESUME_ATS'),
    primary_query: 'free ats resume scanner india',
    surface: 'RESUME_ATS',
    canonical_url: 'https://talentxcel.in/resume',
    representative_queries: ['free ats resume scanner india', 'ats resume checker free', 'ats friendly resume builder india', 'resume ats score checker', 'ats resume test free online india'],
    intent_category: 'TRANSACTIONAL_TOOL',
    journey_stage: 'DECISION',
    dedup_hash: sha256Truncated('ats resume scanner RESUME_ATS', 16),
    estimated_cluster_volume: 28000,
    volume_note: 'High commercial intent; competitor resumeworded.com ranks P2',
  },
  {
    cluster_id: generateClusterId('resume builder for software engineers', 'RESUME_ATS'),
    primary_query: 'ats resume builder for software engineers',
    surface: 'RESUME_ATS',
    canonical_url: 'https://talentxcel.in/resume',
    representative_queries: ['ats resume builder for software engineers', 'resume builder for tech professionals', 'software engineer resume template ats', 'ats resume template developer'],
    intent_category: 'TRANSACTIONAL_TOOL',
    journey_stage: 'DECISION',
    dedup_hash: sha256Truncated('resume builder software engineer RESUME_ATS', 16),
    estimated_cluster_volume: 15000,
    volume_note: 'GSC observed at position 11.2; approaching page 1',
  },
  // COLLEGES surface - 2 clusters
  {
    cluster_id: generateClusterId('top engineering colleges india placement', 'COLLEGES'),
    primary_query: 'top engineering colleges in india with placement',
    surface: 'COLLEGES',
    canonical_url: 'https://talentxcel.in/colleges',
    representative_queries: ['top engineering colleges india placement', 'best engineering colleges india ctc', 'top iit nit colleges india salary', 'engineering college rankings india placements 2026'],
    intent_category: 'INFORMATIONAL_EDUCATION',
    journey_stage: 'EVALUATION',
    dedup_hash: sha256Truncated('engineering colleges india placement COLLEGES', 16),
    estimated_cluster_volume: 85000,
    volume_note: 'Very high demand; Shiksha.com dominant at P3',
  },
  {
    cluster_id: generateClusterId('mba colleges bangalore fees', 'COLLEGES'),
    primary_query: 'top mba colleges bangalore fees',
    surface: 'COLLEGES',
    canonical_url: 'https://talentxcel.in/colleges/bangalore/mba',
    representative_queries: ['top mba colleges bangalore fees', 'best mba colleges bangalore 2026', 'mba admission bangalore colleges', 'pgdm colleges bangalore fees placement'],
    intent_category: 'INFORMATIONAL_EDUCATION',
    journey_stage: 'EVALUATION',
    dedup_hash: sha256Truncated('mba colleges bangalore COLLEGES', 16),
    estimated_cluster_volume: 35000,
    volume_note: 'Evidenced from Shiksha and Careers360 benchmarks',
  },
  // PROFESSIONAL_NETWORK surface
  {
    cluster_id: generateClusterId('professional networking platform india', 'PROFESSIONAL_NETWORK'),
    primary_query: 'professional networking platform india',
    surface: 'PROFESSIONAL_NETWORK',
    canonical_url: 'https://talentxcel.in/network',
    representative_queries: ['professional networking platform india', 'linkedin alternative india', 'career networking site india', 'professional network india free'],
    intent_category: 'COMMERCIAL_B2B',
    journey_stage: 'EVALUATION',
    dedup_hash: sha256Truncated('professional networking india PROFESSIONAL_NETWORK', 16),
    estimated_cluster_volume: 18000,
    volume_note: 'Competitor gap: LinkedIn dominant but TalentXcel uniquely India-focused',
  },
  // ROLE_GUIDES surface - 2 clusters
  {
    cluster_id: generateClusterId('how to become data scientist india', 'ROLE_GUIDES'),
    primary_query: 'how to become a data scientist in india',
    surface: 'ROLE_GUIDES',
    canonical_url: 'https://talentxcel.in/roles/data-scientist',
    representative_queries: ['how to become a data scientist india', 'data scientist career path india', 'data scientist roadmap india', 'become data scientist 2026 india', 'data science career guide india'],
    intent_category: 'CAREER_GUIDANCE',
    journey_stage: 'DISCOVERY',
    dedup_hash: sha256Truncated('data scientist career india ROLE_GUIDES', 16),
    estimated_cluster_volume: 32000,
    volume_note: 'High discovery intent; Google ranks career blogs at P1-3',
  },
  {
    cluster_id: generateClusterId('product manager salary india', 'ROLE_GUIDES'),
    primary_query: 'product manager salary india',
    surface: 'ROLE_GUIDES',
    canonical_url: 'https://talentxcel.in/roles/product-manager',
    representative_queries: ['product manager salary india', 'pm salary india 2026', 'product manager ctc india', 'product manager salary bangalore mumbai'],
    intent_category: 'INFORMATIONAL_EDUCATION',
    journey_stage: 'EVALUATION',
    dedup_hash: sha256Truncated('product manager salary india ROLE_GUIDES', 16),
    estimated_cluster_volume: 42000,
    volume_note: 'Very high demand; AmbitionBox dominant at P1',
  },
  // SKILLS surface
  {
    cluster_id: generateClusterId('python programming course free india', 'SKILLS'),
    primary_query: 'python programming course free india',
    surface: 'SKILLS',
    canonical_url: 'https://talentxcel.in/skills/python',
    representative_queries: ['python programming course free india', 'learn python online free india', 'python tutorial hindi', 'best python course india 2026'],
    intent_category: 'INFORMATIONAL_EDUCATION',
    journey_stage: 'DISCOVERY',
    dedup_hash: sha256Truncated('python course india SKILLS', 16),
    estimated_cluster_volume: 55000,
    volume_note: 'High volume; Coursera/Udemy/NPTEL dominate P1-3',
  },
  // LOCATIONS surface
  {
    cluster_id: generateClusterId('it jobs hyderabad 2026', 'LOCATIONS'),
    primary_query: 'it jobs in hyderabad 2026',
    surface: 'LOCATIONS',
    canonical_url: 'https://talentxcel.in/jobs/hyderabad',
    representative_queries: ['it jobs hyderabad 2026', 'tech jobs hyderabad', 'software jobs hyderabad', 'it company jobs hyderabad'],
    intent_category: 'TRANSACTIONAL_JOB',
    journey_stage: 'APPLICATION',
    dedup_hash: sha256Truncated('it jobs hyderabad LOCATIONS', 16),
    estimated_cluster_volume: 68000,
    volume_note: 'Hyderabad is 2nd largest IT hub after Bangalore',
  },
  // COMPANIES surface
  {
    cluster_id: generateClusterId('infosys interview questions', 'COMPANIES'),
    primary_query: 'infosys interview questions 2026',
    surface: 'COMPANIES',
    canonical_url: 'https://talentxcel.in/companies/infosys',
    representative_queries: ['infosys interview questions 2026', 'infosys technical interview prep', 'infosys hiring process', 'infosys interview experience'],
    intent_category: 'CAREER_GUIDANCE',
    journey_stage: 'DECISION',
    dedup_hash: sha256Truncated('infosys interview COMPANIES', 16),
    estimated_cluster_volume: 25000,
    volume_note: 'High intent pre-application; glassdoor/ambitionbox rank P1-2',
  },
  // LEARNING_COURSES surface
  {
    cluster_id: generateClusterId('digital marketing course india certification', 'LEARNING_COURSES'),
    primary_query: 'digital marketing course india with certification',
    surface: 'LEARNING_COURSES',
    canonical_url: 'https://talentxcel.in/learning/digital-marketing',
    representative_queries: ['digital marketing course india certification', 'digital marketing certification india 2026', 'best digital marketing course india', 'online digital marketing certification india'],
    intent_category: 'TRANSACTIONAL_TOOL',
    journey_stage: 'DECISION',
    dedup_hash: sha256Truncated('digital marketing course LEARNING_COURSES', 16),
    estimated_cluster_volume: 48000,
    volume_note: 'Very high demand; IIDE/Simplilearn dominate P1-4',
  },
  // CAREER_MAP surface
  {
    cluster_id: generateClusterId('career change from developer to product manager', 'CAREER_MAP'),
    primary_query: 'career transition developer to product manager india',
    surface: 'CAREER_MAP',
    canonical_url: 'https://talentxcel.in/career-map',
    representative_queries: ['career transition developer to product manager india', 'how to move from engineering to product management', 'developer become product manager path', 'tech to pm career switch india'],
    intent_category: 'CAREER_GUIDANCE',
    journey_stage: 'DISCOVERY',
    dedup_hash: sha256Truncated('dev to pm career switch CAREER_MAP', 16),
    estimated_cluster_volume: 12000,
    volume_note: 'Growing segment; low competition from incumbents',
  },
  // CAREER_PASSPORT surface
  {
    cluster_id: generateClusterId('verified digital work portfolio india', 'CAREER_PASSPORT'),
    primary_query: 'verified digital portfolio for job seekers india',
    surface: 'CAREER_PASSPORT',
    canonical_url: 'https://talentxcel.in/passport',
    representative_queries: ['verified digital portfolio job seekers india', 'digital credential portfolio india', 'professional portfolio verification india', 'career passport india jobs'],
    intent_category: 'TRANSACTIONAL_TOOL',
    journey_stage: 'EVALUATION',
    dedup_hash: sha256Truncated('verified digital portfolio CAREER_PASSPORT', 16),
    estimated_cluster_volume: 5500,
    volume_note: 'Emerging category with very low competition; TalentXcel has first-mover advantage',
  },
  // MO1_BUSINESS_OS surface
  {
    cluster_id: generateClusterId('ai recruitment software india enterprise', 'MO1_BUSINESS_OS'),
    primary_query: 'ai recruitment software for enterprise india',
    surface: 'MO1_BUSINESS_OS',
    canonical_url: 'https://talentxcel.in/mo1',
    representative_queries: ['ai recruitment software enterprise india', 'ai hiring platform india b2b', 'enterprise recruitment automation india', 'ai talent acquisition software india'],
    intent_category: 'COMMERCIAL_B2B',
    journey_stage: 'EVALUATION',
    dedup_hash: sha256Truncated('ai recruitment enterprise COMMERCIAL_B2B', 16),
    estimated_cluster_volume: 9200,
    volume_note: 'High CPC intent; TurboHire/Keka compete at P2-4',
  },
  // BIDDER_RANKINGS surface
  {
    cluster_id: generateClusterId('ai products leaderboard india', 'BIDDER_RANKINGS'),
    primary_query: 'ai products leaderboard rankings india',
    surface: 'BIDDER_RANKINGS',
    canonical_url: 'https://talentxcel.in/rankings',
    representative_queries: ['ai products leaderboard india', 'top ai tools india ranking 2026', 'ai product rankings india', 'best ai products list india'],
    intent_category: 'INFORMATIONAL_EDUCATION',
    journey_stage: 'EVALUATION',
    dedup_hash: sha256Truncated('ai products leaderboard BIDDER_RANKINGS', 16),
    estimated_cluster_volume: 7800,
    volume_note: 'Unique content type; ProductHunt global but no India-specific equivalent',
  },
  // CAREER_TOOLS surface
  {
    cluster_id: generateClusterId('salary calculator india 2026', 'CAREER_TOOLS'),
    primary_query: 'salary calculator india 2026',
    surface: 'CAREER_TOOLS',
    canonical_url: 'https://talentxcel.in/tools/salary-calculator',
    representative_queries: ['salary calculator india 2026', 'in hand salary calculator india', 'monthly salary take home calculator india', 'salary calculator india with tax'],
    intent_category: 'TRANSACTIONAL_TOOL',
    journey_stage: 'DECISION',
    dedup_hash: sha256Truncated('salary calculator india CAREER_TOOLS', 16),
    estimated_cluster_volume: 120000,
    volume_note: 'Very high volume; ClearTax/AmbitionBox rank P1-3 but tool quality varies',
  },
  // Additional JOBS clusters to round to 25
  {
    cluster_id: generateClusterId('freshers jobs 2026 india', 'JOBS'),
    primary_query: 'freshers jobs 2026 india',
    surface: 'JOBS',
    canonical_url: 'https://talentxcel.in/jobs/freshers',
    representative_queries: ['freshers jobs 2026 india', 'entry level jobs india 2026', 'campus hiring india 2026', 'graduate jobs india 2026', 'first job india graduates'],
    intent_category: 'TRANSACTIONAL_JOB',
    journey_stage: 'APPLICATION',
    dedup_hash: sha256Truncated('freshers jobs 2026 JOBS', 16),
    estimated_cluster_volume: 95000,
    volume_note: 'Massive segment; Naukri/Apna dominant but highly competitive',
  },
  {
    cluster_id: generateClusterId('remote jobs india work from home', 'JOBS'),
    primary_query: 'remote jobs india work from home 2026',
    surface: 'JOBS',
    canonical_url: 'https://talentxcel.in/jobs/remote',
    representative_queries: ['remote jobs india work from home 2026', 'wfh jobs india 2026', 'work from home jobs india', 'remote it jobs india', 'online jobs india work from home'],
    intent_category: 'TRANSACTIONAL_JOB',
    journey_stage: 'APPLICATION',
    dedup_hash: sha256Truncated('remote work from home jobs JOBS', 16),
    estimated_cluster_volume: 180000,
    volume_note: 'Post-2020 mega-trend; extremely high demand segment',
  },
  {
    cluster_id: generateClusterId('internship 2026 india engineering', 'JOBS'),
    primary_query: 'engineering internship 2026 india',
    surface: 'JOBS',
    canonical_url: 'https://talentxcel.in/jobs/internships',
    representative_queries: ['engineering internship 2026 india', 'summer internship india engineering students', 'paid internship india 2026', 'internship bangalore 2026', 'internship for btech students india'],
    intent_category: 'TRANSACTIONAL_JOB',
    journey_stage: 'APPLICATION',
    dedup_hash: sha256Truncated('engineering internship india JOBS', 16),
    estimated_cluster_volume: 75000,
    volume_note: 'Strong seasonal spikes Feb-May and Nov-Jan',
  },
  {
    cluster_id: generateClusterId('interview questions common india', 'ROLE_GUIDES'),
    primary_query: 'most common interview questions india 2026',
    surface: 'ROLE_GUIDES',
    canonical_url: 'https://talentxcel.in/roles/interview-prep',
    representative_queries: ['most common interview questions india 2026', 'hr interview questions answers india', 'technical interview questions india', 'job interview preparation india'],
    intent_category: 'CAREER_GUIDANCE',
    journey_stage: 'DECISION',
    dedup_hash: sha256Truncated('interview questions india ROLE_GUIDES', 16),
    estimated_cluster_volume: 210000,
    volume_note: 'Extremely high volume; AmbitionBox/Glassdoor dominate; quality differentiation possible',
  },
  {
    cluster_id: generateClusterId('linkedin profile optimization india', 'PROFESSIONAL_NETWORK'),
    primary_query: 'how to optimize linkedin profile india',
    surface: 'PROFESSIONAL_NETWORK',
    canonical_url: 'https://talentxcel.in/network/profile-guide',
    representative_queries: ['how to optimize linkedin profile india', 'linkedin profile tips india 2026', 'professional profile linkedin india', 'make linkedin profile stand out india'],
    intent_category: 'CAREER_GUIDANCE',
    journey_stage: 'EVALUATION',
    dedup_hash: sha256Truncated('linkedin profile optimize PROFESSIONAL_NETWORK', 16),
    estimated_cluster_volume: 38000,
    volume_note: 'High crossover opportunity — drives Network surface signups',
  },
];
