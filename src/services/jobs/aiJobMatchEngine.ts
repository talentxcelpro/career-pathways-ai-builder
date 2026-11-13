// src/services/jobs/aiJobMatchEngine.ts
// Production AI JobMatch Engine for JobMatch OS (jobs.talentxcel.in)
// Evaluates real candidate skills, experience, and role parameters against vacancy requirements.

export interface CandidateProfileData {
  id?: string;
  fullName: string;
  title: string;
  skills: string[];
  experienceYears: number;
  currentLocation: string;
  openToRemote: boolean;
  expectedCtcLakhs?: number;
  education?: string;
  bio?: string;
}

export interface JobMatchResult {
  jobId: string;
  score: number; // 0 - 100
  tier: 'Exceptional Match' | 'Strong Fit' | 'Moderate Fit' | 'Potential Stretch';
  skillsMatchPct: number;
  experienceMatchPct: number;
  locationMatchPct: number;
  matchedSkills: string[];
  missingSkills: string[];
  matchReasons: string[];
  improvementTips: string[];
}

export interface InterviewPrepQuestion {
  category: 'Technical Core' | 'Architecture & Design' | 'Behavioral & Leadership';
  question: string;
  context: string;
  suggestedFramework: string;
}

// Synonyms and normalization map
const SKILL_SYNONYMS: Record<string, string[]> = {
  react: ['reactjs', 'react.js', 'react native', 'frontend'],
  nodejs: ['node.js', 'node', 'express', 'backend'],
  typescript: ['ts', 'javascript', 'js'],
  python: ['django', 'fastapi', 'flask', 'py'],
  aws: ['cloud', 'amazon web services', 's3', 'ec2'],
  kubernetes: ['k8s', 'containers', 'docker', 'devops'],
  sql: ['postgresql', 'postgres', 'mysql', 'database', 'rdbms'],
  system_design: ['distributed systems', 'architecture', 'microservices', 'high concurrency'],
  analytics: ['product analytics', 'metrics', 'mixpanel', 'posthog', 'sql'],
  product_management: ['prd', 'agile', 'scrum', 'user stories', 'roadmap']
};

function normalizeSkill(s: string): string {
  return (s || '').toLowerCase().trim().replace(/[\.-]/g, '');
}

function skillsOverlap(candidateSkills: string[], requiredSkills: string[]): { matched: string[]; missing: string[] } {
  const normCandidate = candidateSkills.map(normalizeSkill);
  const matched: string[] = [];
  const missing: string[] = [];

  for (const req of requiredSkills) {
    const normReq = normalizeSkill(req);
    const hasDirect = normCandidate.some(c => c.includes(normReq) || normReq.includes(c));
    
    // Check synonym family
    const synKey = Object.keys(SKILL_SYNONYMS).find(k => k === normReq || (SKILL_SYNONYMS[k] || []).includes(normReq));
    const hasSynonym = synKey ? normCandidate.some(c => c === synKey || (SKILL_SYNONYMS[synKey] || []).includes(c)) : false;

    if (hasDirect || hasSynonym) {
      matched.push(req);
    } else {
      missing.push(req);
    }
  }

  return { matched, missing };
}

/**
 * Calculates deterministic compatibility score between a candidate and a vacancy
 */
export function calculateJobMatch(
  candidate: CandidateProfileData,
  job: {
    id: string;
    title: string;
    skills_required?: string[];
    min_experience?: number | null;
    max_experience?: number | null;
    location?: string;
    is_remote?: boolean;
    work_mode?: string;
    salary_min?: number | null;
    salary_max?: number | null;
    job_summary?: string | null;
    department?: string | null;
  }
): JobMatchResult {
  const required = job.skills_required && job.skills_required.length > 0
    ? job.skills_required
    : ['Software Development', 'System Architecture', 'Communication'];

  const { matched, missing } = skillsOverlap(candidate.skills || [], required);

  // 1. Skills Component (50%)
  const skillsRatio = required.length > 0 ? matched.length / required.length : 0.8;
  const skillsMatchPct = Math.round(skillsRatio * 100);

  // 2. Experience Component (25%)
  const minExp = job.min_experience ?? 2;
  const maxExp = job.max_experience ?? 8;
  const candExp = candidate.experienceYears ?? 3;
  let experienceMatchPct = 80;

  if (candExp >= minExp && candExp <= maxExp + 2) {
    experienceMatchPct = 100;
  } else if (candExp < minExp) {
    const diff = minExp - candExp;
    experienceMatchPct = Math.max(40, 100 - diff * 20);
  } else {
    // Overqualified slightly
    experienceMatchPct = 90;
  }

  // 3. Location & Work Mode Component (15%)
  let locationMatchPct = 70;
  const jobLoc = (job.location || '').toLowerCase();
  const candLoc = (candidate.currentLocation || '').toLowerCase();
  const isRemote = job.is_remote || (job.work_mode || '').toLowerCase().includes('remote') || jobLoc.includes('remote');

  if (isRemote || candidate.openToRemote) {
    locationMatchPct = 100;
  } else if (candLoc && jobLoc.includes(candLoc)) {
    locationMatchPct = 100;
  } else {
    locationMatchPct = 50;
  }

  // 4. Role Title Component (10%)
  const normTitle = (job.title || '').toLowerCase();
  const normCandTitle = (candidate.title || '').toLowerCase();
  let titleMatchPct = 70;

  const titleKeywords = normCandTitle.split(/\s+/).filter(w => w.length > 3);
  if (titleKeywords.some(k => normTitle.includes(k))) {
    titleMatchPct = 100;
  }

  // Weighted Total (0 - 100)
  const rawScore = (skillsMatchPct * 0.50) + (experienceMatchPct * 0.25) + (locationMatchPct * 0.15) + (titleMatchPct * 0.10);
  const score = Math.min(99, Math.max(35, Math.round(rawScore)));

  let tier: JobMatchResult['tier'] = 'Moderate Fit';
  if (score >= 90) tier = 'Exceptional Match';
  else if (score >= 78) tier = 'Strong Fit';
  else if (score < 60) tier = 'Potential Stretch';

  // Construct transparent reasons
  const matchReasons: string[] = [];
  if (matched.length > 0) {
    matchReasons.push(`Direct verification across ${matched.length} core competencies (${matched.slice(0, 3).join(', ')}).`);
  }
  if (experienceMatchPct >= 90) {
    matchReasons.push(`Your ${candExp} years of experience aligns with the target seniority bracket (${minExp}–${maxExp} yrs).`);
  }
  if (locationMatchPct === 100) {
    matchReasons.push(isRemote ? 'Position offers remote/distributed flexibility matching your work mode.' : `Location aligns directly with your primary preference (${job.location}).`);
  }

  // Actionable tips
  const improvementTips: string[] = [];
  if (missing.length > 0) {
    improvementTips.push(`Add portfolio proof or project links demonstrating proficiency in: ${missing.slice(0, 3).join(', ')}.`);
  }
  if (score < 80) {
    improvementTips.push('Tailor your ResumeStudio summary to highlight quantifiable impact matching this specific role description.');
  }

  return {
    jobId: job.id,
    score,
    tier,
    skillsMatchPct,
    experienceMatchPct,
    locationMatchPct,
    matchedSkills: matched,
    missingSkills: missing,
    matchReasons,
    improvementTips
  };
}

/**
 * Natural Language Query Parser for Conversational Job Search
 */
export function parseNaturalLanguageQuery(query: string): {
  parsedKeywords: string[];
  cityFilter: string;
  workModeFilter: string;
  minSalaryLakhs: number | null;
  experienceTier: string;
} {
  const q = (query || '').toLowerCase().trim();
  
  // Work Mode detection
  let workModeFilter = 'all';
  if (q.includes('remote') || q.includes('wfh') || q.includes('work from home')) {
    workModeFilter = 'remote';
  } else if (q.includes('hybrid')) {
    workModeFilter = 'hybrid';
  }

  // City detection
  let cityFilter = 'all';
  const cities = ['bangalore', 'bengaluru', 'hyderabad', 'pune', 'noida', 'mumbai', 'delhi', 'chennai', 'kolkata', 'gurgaon', 'gurugram'];
  for (const c of cities) {
    if (q.includes(c)) {
      cityFilter = c === 'bengaluru' ? 'bangalore' : (c === 'gurugram' ? 'noida' : c);
      break;
    }
  }

  // Salary detection
  let minSalaryLakhs: number | null = null;
  const lpaMatch = q.match(/(\d+)\s*(lpa|lakh|lakhs|l)/);
  if (lpaMatch) {
    minSalaryLakhs = parseInt(lpaMatch[1], 10);
  }

  // Experience tier detection
  let experienceTier = 'all';
  if (q.includes('fresher') || q.includes('entry') || q.includes('intern') || q.includes('graduate')) {
    experienceTier = 'fresher';
  } else if (q.includes('senior') || q.includes('lead') || q.includes('staff') || q.includes('principal') || q.includes('architect')) {
    experienceTier = 'senior';
  }

  // Extract clean keywords
  const stopWords = ['find', 'me', 'job', 'jobs', 'role', 'roles', 'for', 'in', 'at', 'with', 'paying', 'over', 'more', 'than', 'a', 'the', 'and', 'or'];
  const tokens = q.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/);
  const parsedKeywords = tokens.filter(t => t.length > 2 && !stopWords.includes(t) && !cities.includes(t));

  return {
    parsedKeywords,
    cityFilter,
    workModeFilter,
    minSalaryLakhs,
    experienceTier
  };
}

/**
 * Generates tailored interview preparation questions for any role
 */
export function generateInterviewPrep(jobTitle: string, skills: string[], companyName?: string): InterviewPrepQuestion[] {
  const primarySkill = skills[0] || 'System Architecture';
  const secondarySkill = skills[1] || 'Scalability';
  const company = companyName || 'the hiring company';

  return [
    {
      category: 'Technical Core',
      question: `How would you architect a production workflow using ${primarySkill} ensuring fault tolerance, telemetry, and sub-100ms response times?`,
      context: `Tests hands-on depth in ${primarySkill} and understanding of edge cases under concurrency.`,
      suggestedFramework: `1. Detail data models and caching. 2. Address error handling and fallbacks. 3. Quantify latency bottlenecks and p99 mitigation.`
    },
    {
      category: 'Architecture & Design',
      question: `If ${company}'s user volume grew 10x over the next 6 months, which layer in your ${secondarySkill} stack would fail first, and how would you redesign it?`,
      context: `Assesses scalability instincts, database bottlenecks, and horizontal partitioning strategies.`,
      suggestedFramework: `1. Identify single points of failure (DB locks, memory pressure). 2. Propose sharding or read-replicas. 3. Explain async queuing via Kafka/RabbitMQ.`
    },
    {
      category: 'Behavioral & Leadership',
      question: `Tell me about a time you had to push back on a critical product deadline because of technical debt or architectural compromises. How did you align stakeholders?`,
      context: `Evaluates communication maturity, cross-functional collaboration, and pragmatic engineering trade-offs.`,
      suggestedFramework: `Use the STAR method (Situation, Task, Action, Result). Highlight how you quantified the business risk and proposed a staged compromise.`
    }
  ];
}
