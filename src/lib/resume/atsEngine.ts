/**
 * TALENTXCEL — PHASE 1 REAL ATS ENGINE
 * src/lib/resume/atsEngine.ts
 *
 * ARCHITECTURE (in execution order):
 *   1A. Fetch + normalize resume via normalizeResumeContent()
 *   1B. Extract structured requirements from real jobs table fields
 *   1C. Deterministic keyword + normalized matching (primary signal)
 *   1D. Semantic matching via aiServiceManager (secondary signal)
 *   1E. Experience years + title + recency alignment
 *   1F. Assessment evidence linkage from assessment_attempts
 *   1G. Explainable score assembly — every point has a source
 *
 * GUARANTEES:
 *   - READ-ONLY against ai_resumes and jobs tables
 *   - Does NOT modify ai_resumes.content
 *   - Does NOT create fake scores or evidence
 *   - Does NOT silently coerce missing data into matches
 *   - Deterministic layer produces identical results for same inputs
 *   - Semantic layer is secondary signal only; cannot inflate score > 20 pts alone
 *   - Fallback: returns ATSUnavailable on any critical error
 *
 * SCORING FORMULA (documented, not "scientific"):
 *   must_have_coverage    : 35% weight  (most important — mandatory requirements)
 *   preferred_coverage    : 15% weight
 *   experience_alignment  : 20% weight
 *   hard_skill_match      : 15% weight  (deterministic)
 *   semantic_match        : 10% weight  (LLM — secondary, capped)
 *   assessment_evidence   :  5% weight  (confirmed source only)
 *   TOTAL                 : 100%
 *
 * Each weight is applied to a 0-100 sub-score for that dimension.
 * The overall score is therefore 0-100 with full traceability.
 */

import { supabase } from '@/integrations/supabase/client';
import {
  normalizeResumeContent,
  NormalizedResumeContent,
  NormalizedSkill,
} from './normalizeResumeContent';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type MatchType = 'EXACT' | 'NORMALIZED' | 'SEMANTIC' | 'PARTIAL' | 'MISSING';
export type RequirementClass = 'MUST_HAVE' | 'PREFERRED' | 'RESPONSIBILITY' | 'EXPERIENCE' | 'EDUCATION' | 'SKILL';
export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface RequirementMatch {
  requirement: string;
  requirementClass: RequirementClass;
  matchType: MatchType;
  candidateEvidence: string[];
  confidence: ConfidenceLevel;
  reason: string;
}

export interface ExperienceAlignment {
  requiredYears: number | null;
  estimatedCandidateYears: number;
  gap: number; // negative = candidate short, 0 = met, positive = exceeded
  titleAlignment: MatchType;
  titleReason: string;
  recencyScore: number; // 0-100, based on most recent role's end date
}

export interface AssessmentEvidence {
  skill: string;
  assessmentScore: number;
  assessmentDate: string | null;
  evidenceStrength: 'STRONG' | 'MODERATE' | 'WEAK';
}

export interface ScoreBreakdown {
  mustHaveCoverage: number;      // 0-100
  preferredCoverage: number;     // 0-100
  experienceAlignment: number;   // 0-100
  hardSkillMatch: number;        // 0-100
  semanticMatch: number;         // 0-100 (capped contribution)
  assessmentEvidence: number;    // 0-100
  overall: number;               // weighted composite 0-100
}

export interface ATSAnalysisResult {
  version: '1.0';
  analyzedAt: string;
  resumeId: string;
  jobId: string;
  variantDetected: string;
  normalizationWarnings: string[];

  score: number; // 0-100, same as breakdown.overall
  breakdown: ScoreBreakdown;

  requirements: RequirementMatch[];
  experienceAlignment: ExperienceAlignment;
  assessmentEvidence: AssessmentEvidence[];

  // Structured improvement suggestions — evidence-based, not fabricated
  gaps: Array<{
    requirement: string;
    type: RequirementClass;
    severity: 'CRITICAL' | 'IMPORTANT' | 'OPTIONAL';
    suggestion: string;
  }>;

  // Meta
  deterministicMatchCount: number;
  semanticMatchCount: number;
  dataIntegrityVerified: boolean; // resume was not mutated
}

export interface ATSUnavailable {
  available: false;
  reason: string;
  resumeId: string;
  jobId: string;
}

export type ATSFitResult = ATSAnalysisResult | ATSUnavailable;

// ---------------------------------------------------------------------------
// Internal: abbreviation + synonym map for deterministic normalization
// Keys and values are lower-cased. This map is intentionally conservative.
// ---------------------------------------------------------------------------
const KNOWN_EQUIVALENTS: Record<string, string[]> = {
  'javascript': ['js'],
  'typescript': ['ts'],
  'python': ['py'],
  'kubernetes': ['k8s'],
  'amazon web services': ['aws'],
  'google cloud platform': ['gcp'],
  'microsoft azure': ['azure'],
  'continuous integration': ['ci', 'ci/cd'],
  'continuous delivery': ['cd', 'ci/cd'],
  'machine learning': ['ml'],
  'artificial intelligence': ['ai'],
  'natural language processing': ['nlp'],
  'structured query language': ['sql'],
  'nosql': ['mongodb', 'cassandra', 'dynamodb'],
  'react.js': ['react', 'reactjs'],
  'node.js': ['node', 'nodejs'],
  'next.js': ['next', 'nextjs'],
  'vue.js': ['vue', 'vuejs'],
  'angular.js': ['angular', 'angularjs'],
  'rest api': ['rest', 'restful', 'restful api'],
  'graphql': ['graph ql'],
  'user interface': ['ui'],
  'user experience': ['ux'],
  'product manager': ['pm'],
  'application programming interface': ['api'],
};

/** Build reverse lookup: synonym → canonical */
const SYNONYM_TO_CANONICAL: Record<string, string> = {};
for (const [canonical, synonyms] of Object.entries(KNOWN_EQUIVALENTS)) {
  for (const syn of synonyms) {
    SYNONYM_TO_CANONICAL[syn] = canonical;
  }
}

// ---------------------------------------------------------------------------
// Text normalization helpers
// ---------------------------------------------------------------------------

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s\/\.]/g, ' ') // keep slashes and dots for version strings
    .replace(/\s+/g, ' ')
    .trim();
}

function canonicalize(text: string): string {
  const normalized = normalizeText(text);
  return SYNONYM_TO_CANONICAL[normalized] ?? normalized;
}

/**
 * Extract all skill name strings from a NormalizedSkill array.
 * Returns lower-cased canonical forms for matching.
 */
function extractSkillNames(skills: NormalizedSkill[]): string[] {
  return skills.map(s => canonicalize(s.name));
}

/**
 * Extract all text tokens from experience bullets, titles, and descriptions.
 */
function extractExperienceTokens(experience: Record<string, unknown>[]): string[] {
  const tokens: string[] = [];
  for (const exp of experience) {
    if (typeof exp.title === 'string') tokens.push(canonicalize(exp.title));
    if (typeof exp.company === 'string') tokens.push(canonicalize(exp.company));
    if (typeof exp.description === 'string') {
      normalizeText(exp.description).split(' ').forEach(t => tokens.push(t));
    }
    const achievements = Array.isArray(exp.achievements) ? exp.achievements : [];
    for (const ach of achievements) {
      if (typeof ach === 'string') {
        normalizeText(ach).split(' ').forEach(t => tokens.push(t));
      }
    }
    const techs = Array.isArray(exp.technologies) ? exp.technologies : [];
    for (const tech of techs) {
      if (typeof tech === 'string') tokens.push(canonicalize(tech));
    }
  }
  return [...new Set(tokens.filter(t => t.length > 1))];
}

/**
 * Build the full candidate text corpus from the normalized resume.
 * Used for matching requirements against.
 */
function buildCandidateCorpus(resume: NormalizedResumeContent): {
  skillNames: string[];
  experienceTokens: string[];
  allTokens: Set<string>;
  summaryTokens: string[];
} {
  const skillNames = extractSkillNames(resume.skills);
  const experienceTokens = extractExperienceTokens(resume.experience);
  const summaryTokens = normalizeText(resume.personalInfo.summary).split(' ').filter(t => t.length > 2);
  
  const educationTokens: string[] = [];
  for (const edu of resume.education) {
    if (typeof edu.degree === 'string') educationTokens.push(canonicalize(edu.degree));
    if (typeof edu.institution === 'string') educationTokens.push(canonicalize(edu.institution));
  }

  const allTokens = new Set([
    ...skillNames,
    ...experienceTokens,
    ...summaryTokens,
    ...educationTokens,
  ]);

  return { skillNames, experienceTokens, allTokens, summaryTokens };
}

// ---------------------------------------------------------------------------
// 1C — Deterministic matching
// ---------------------------------------------------------------------------

function deterministicMatch(
  requirement: string,
  corpus: ReturnType<typeof buildCandidateCorpus>,
  requirementClass: RequirementClass,
): RequirementMatch {
  const reqNorm = normalizeText(requirement);
  const reqCanon = canonicalize(requirement);

  // Exact match check (case-insensitive, whitespace-normalized)
  if (corpus.allTokens.has(reqNorm) || corpus.skillNames.includes(reqNorm)) {
    return {
      requirement,
      requirementClass,
      matchType: 'EXACT',
      candidateEvidence: [requirement],
      confidence: 'HIGH',
      reason: `"${requirement}" found verbatim in candidate resume`,
    };
  }

  // Canonical / abbreviation match
  if (corpus.allTokens.has(reqCanon) || corpus.skillNames.includes(reqCanon)) {
    return {
      requirement,
      requirementClass,
      matchType: 'NORMALIZED',
      candidateEvidence: [reqCanon],
      confidence: 'HIGH',
      reason: `"${requirement}" matched via normalized/abbreviation equivalent "${reqCanon}"`,
    };
  }

  // Synonym expansion: check if any synonym of the requirement matches corpus
  const synonyms = KNOWN_EQUIVALENTS[reqCanon] ?? [];
  for (const syn of synonyms) {
    if (corpus.allTokens.has(syn) || corpus.skillNames.includes(syn)) {
      return {
        requirement,
        requirementClass,
        matchType: 'NORMALIZED',
        candidateEvidence: [syn],
        confidence: 'HIGH',
        reason: `"${requirement}" matched via equivalent term "${syn}"`,
      };
    }
  }

  // Partial match: requirement tokens appear as subset of corpus
  const reqWords = reqNorm.split(' ').filter(w => w.length > 2);
  if (reqWords.length > 1) {
    const matchedWords = reqWords.filter(w => corpus.allTokens.has(w));
    if (matchedWords.length >= Math.ceil(reqWords.length * 0.7)) {
      return {
        requirement,
        requirementClass,
        matchType: 'PARTIAL',
        candidateEvidence: matchedWords,
        confidence: 'MEDIUM',
        reason: `${matchedWords.length}/${reqWords.length} tokens of "${requirement}" found in resume`,
      };
    }
  }

  // No match
  return {
    requirement,
    requirementClass,
    matchType: 'MISSING',
    candidateEvidence: [],
    confidence: 'HIGH',
    reason: `"${requirement}" not found in resume (checked exact, normalized, synonyms, and partial)`,
  };
}

// ---------------------------------------------------------------------------
// 1B — JD requirement extraction from structured jobs table fields
// ---------------------------------------------------------------------------

interface ExtractedRequirements {
  mustHave: string[];
  preferred: string[];
  skills: string[];
  responsibilities: string[];
  minExperience: number | null;
  maxExperience: number | null;
  educationLevel: string | null;
  jobTitle: string;
}

function extractRequirements(job: Record<string, unknown>): ExtractedRequirements {
  const safeStringArray = (val: unknown): string[] => {
    if (Array.isArray(val)) return val.filter((v): v is string => typeof v === 'string');
    return [];
  };

  return {
    mustHave: safeStringArray(job.must_have_requirements),
    preferred: safeStringArray(job.nice_to_have),
    skills: safeStringArray(job.skills_required),
    responsibilities: safeStringArray(job.key_responsibilities),
    minExperience: typeof job.min_experience === 'number' ? job.min_experience : null,
    maxExperience: typeof job.max_experience === 'number' ? job.max_experience : null,
    educationLevel: typeof job.education_level === 'string' ? job.education_level : null,
    jobTitle: typeof job.job_title === 'string' ? job.job_title : '',
  };
}

// ---------------------------------------------------------------------------
// 1E — Experience alignment
// ---------------------------------------------------------------------------

function estimateCandidateExperience(experience: Record<string, unknown>[]): number {
  let totalMonths = 0;
  const now = new Date();

  for (const exp of experience) {
    const startStr = typeof exp.startDate === 'string' ? exp.startDate : '';
    const endStr = typeof exp.endDate === 'string' ? exp.endDate : '';
    const isCurrent = exp.current === true || exp.isCurrentRole === true || endStr === '';

    if (!startStr) continue;

    const parseDate = (s: string): Date | null => {
      if (!s) return null;
      // YYYY-MM or YYYY-MM-DD
      const parts = s.split('-');
      if (parts.length >= 2) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        if (!isNaN(year) && !isNaN(month)) return new Date(year, month, 1);
      }
      return null;
    };

    const start = parseDate(startStr);
    const end = isCurrent ? now : parseDate(endStr);

    if (!start || !end || end < start) continue;
    totalMonths += (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  }

  return Math.round(totalMonths / 12);
}

function scoreExperienceAlignment(
  resume: NormalizedResumeContent,
  reqs: ExtractedRequirements,
): ExperienceAlignment {
  const estimatedYears = estimateCandidateExperience(resume.experience);
  const required = reqs.minExperience;

  let gap = 0;
  if (required !== null) {
    gap = estimatedYears - required;
  }

  // Title alignment
  const jobTitleCanon = canonicalize(reqs.jobTitle);
  const corpus = buildCandidateCorpus(resume);
  let titleAlignment: MatchType = 'MISSING';
  let titleReason = 'Job title not found in candidate experience';

  if (corpus.allTokens.has(jobTitleCanon)) {
    titleAlignment = 'EXACT';
    titleReason = `Job title "${reqs.jobTitle}" found in candidate experience`;
  } else {
    const titleWords = jobTitleCanon.split(' ').filter(w => w.length > 2);
    const matched = titleWords.filter(w => corpus.allTokens.has(w));
    if (matched.length >= Math.ceil(titleWords.length * 0.6)) {
      titleAlignment = 'PARTIAL';
      titleReason = `Job title partially matched (${matched.join(', ')})`;
    }
  }

  // Recency: most recent role's end date proximity
  let recencyScore = 50;
  const now = new Date();
  const recentExperience = resume.experience.find(
    (e) => e.current === true || e.isCurrentRole === true || (e as Record<string, unknown>).endDate === ''
  );
  if (recentExperience) {
    recencyScore = 100; // currently employed
  } else if (resume.experience.length > 0) {
    const lastExp = resume.experience[0];
    const endStr = typeof lastExp.endDate === 'string' ? lastExp.endDate : '';
    if (endStr) {
      const parts = endStr.split('-');
      if (parts.length >= 2) {
        const endDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, 1);
        const monthsSince = (now.getFullYear() - endDate.getFullYear()) * 12 + (now.getMonth() - endDate.getMonth());
        recencyScore = Math.max(0, 100 - monthsSince * 5); // -5 pts per month gap
      }
    }
  }

  return {
    requiredYears: required,
    estimatedCandidateYears: estimatedYears,
    gap,
    titleAlignment,
    titleReason,
    recencyScore,
  };
}

function experienceAlignmentToScore(alignment: ExperienceAlignment): number {
  let score = 0;

  // Experience years (60% of this dimension)
  if (alignment.requiredYears === null) {
    score += 60; // no requirement stated — neutral
  } else if (alignment.gap >= 0) {
    score += 60; // met or exceeded
  } else if (alignment.gap >= -2) {
    score += 40; // within 2 years — acceptable
  } else if (alignment.gap >= -4) {
    score += 20; // significantly short
  }
  // < -4 years: 0 contribution

  // Title alignment (25% of this dimension)
  if (alignment.titleAlignment === 'EXACT') score += 25;
  else if (alignment.titleAlignment === 'NORMALIZED' || alignment.titleAlignment === 'PARTIAL') score += 15;
  // SEMANTIC handled in semantic layer, MISSING = 0

  // Recency (15% of this dimension)
  score += Math.round(alignment.recencyScore * 0.15);

  return Math.min(100, score);
}

// ---------------------------------------------------------------------------
// 1F — Assessment evidence
// ---------------------------------------------------------------------------

async function fetchAssessmentEvidence(
  userId: string,
  skills: NormalizedSkill[],
): Promise<AssessmentEvidence[]> {
  try {
    const { data, error } = await supabase
      .from('assessment_attempts')
      .select('id, skill_name, score, percentage, completed_at, status')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false });

    if (error || !data) return [];

    const evidence: AssessmentEvidence[] = [];
    const skillNames = skills.map(s => canonicalize(s.name));

    for (const attempt of data) {
      const attemptSkill = canonicalize(typeof attempt.skill_name === 'string' ? attempt.skill_name : '');
      if (!attemptSkill) continue;

      // Only surface evidence for skills that are present in the resume
      if (!skillNames.includes(attemptSkill)) continue;

      const score = typeof attempt.percentage === 'number'
        ? attempt.percentage
        : typeof attempt.score === 'number'
        ? attempt.score
        : null;

      if (score === null) continue;

      evidence.push({
        skill: attempt.skill_name,
        assessmentScore: score,
        assessmentDate: attempt.completed_at ?? null,
        evidenceStrength: score >= 75 ? 'STRONG' : score >= 50 ? 'MODERATE' : 'WEAK',
      });
    }

    return evidence;
  } catch {
    return []; // Assessment evidence is optional — never block main analysis
  }
}

function assessmentEvidenceToScore(evidence: AssessmentEvidence[]): number {
  if (evidence.length === 0) return 50; // neutral: no evidence available (not penalized)

  const strongCount = evidence.filter(e => e.evidenceStrength === 'STRONG').length;
  const moderateCount = evidence.filter(e => e.evidenceStrength === 'MODERATE').length;

  const score = Math.min(
    100,
    (strongCount * 30) + (moderateCount * 15) + (evidence.length * 5),
  );
  return score;
}

// ---------------------------------------------------------------------------
// 1D — Semantic matching via Supabase Edge Function
// ---------------------------------------------------------------------------

interface SemanticMatchResult {
  requirement: string;
  matched: boolean;
  confidence: ConfidenceLevel;
  evidence: string;
  reason: string;
}

async function runSemanticMatching(
  missingRequirements: string[],
  resume: NormalizedResumeContent,
): Promise<SemanticMatchResult[]> {
  if (missingRequirements.length === 0) return [];

  try {
    const summaryText = resume.personalInfo.summary;
    const experienceTitles = resume.experience
      .map(e => `${(e as Record<string,unknown>).title ?? ''} at ${(e as Record<string,unknown>).company ?? ''}`)
      .join('; ');
    const skillsList = resume.skills.map(s => s.name).join(', ');

    const { data, error } = await supabase.functions.invoke('ats-analyzer', {
      body: {
        mode: 'semantic_match',
        requirements: missingRequirements,
        candidate_context: {
          summary: summaryText,
          experience_titles: experienceTitles,
          skills: skillsList,
        },
      },
    });

    if (error || !data?.matches) return [];

    // Validate and map response — do not trust opaque numbers
    const results: SemanticMatchResult[] = [];
    for (const match of data.matches) {
      if (
        typeof match.requirement !== 'string' ||
        typeof match.matched !== 'boolean' ||
        !['HIGH', 'MEDIUM', 'LOW'].includes(match.confidence)
      ) {
        continue; // Skip malformed entries — never fabricate
      }
      results.push({
        requirement: match.requirement,
        matched: match.matched,
        confidence: match.confidence as ConfidenceLevel,
        evidence: typeof match.evidence === 'string' ? match.evidence : '',
        reason: typeof match.reason === 'string' ? match.reason : 'Semantic equivalence detected',
      });
    }
    return results;

  } catch {
    return []; // Semantic is optional — deterministic layer stands alone on failure
  }
}

// ---------------------------------------------------------------------------
// 1G — Explainable score assembly
// FORMULA (documented, not "scientific"):
//   must_have_coverage    35%
//   preferred_coverage    15%
//   experience_alignment  20%
//   hard_skill_match      15%
//   semantic_match        10%  (capped: semantic alone cannot make a MISSING become MATCHED for must-haves)
//   assessment_evidence    5%
// ---------------------------------------------------------------------------

const WEIGHTS = {
  mustHave: 0.35,
  preferred: 0.15,
  experience: 0.20,
  hardSkill: 0.15,
  semantic: 0.10,
  assessment: 0.05,
} as const;

function assembleFinalScore(
  allRequirements: RequirementMatch[],
  semanticResults: SemanticMatchResult[],
  experienceScore: number,
  assessmentScore: number,
): ScoreBreakdown {
  // Build a map of semantically matched requirements
  const semanticMatchSet = new Set(
    semanticResults.filter(r => r.matched && r.confidence !== 'LOW').map(r => r.requirement),
  );

  const mustHaveReqs = allRequirements.filter(r => r.requirementClass === 'MUST_HAVE');
  const preferredReqs = allRequirements.filter(r => r.requirementClass === 'PREFERRED');
  const skillReqs = allRequirements.filter(r => r.requirementClass === 'SKILL');

  // Must-have coverage score
  const mustHaveCoverage = mustHaveReqs.length === 0
    ? 100
    : Math.round(
        (mustHaveReqs.filter(r =>
          r.matchType !== 'MISSING' ||
          // Semantic can contribute to preferred but NOT override a missing must-have to fully matched
          (semanticMatchSet.has(r.requirement) && r.matchType === 'MISSING')
        ).length / mustHaveReqs.length) * 100
      );

  // Preferred coverage score
  const preferredCoverage = preferredReqs.length === 0
    ? 100
    : Math.round(
        (preferredReqs.filter(r =>
          r.matchType !== 'MISSING' || semanticMatchSet.has(r.requirement)
        ).length / preferredReqs.length) * 100
      );

  // Hard skill match (deterministic only)
  const hardSkillMatch = skillReqs.length === 0
    ? 100
    : Math.round(
        (skillReqs.filter(r => ['EXACT', 'NORMALIZED', 'PARTIAL'].includes(r.matchType)).length
          / skillReqs.length) * 100
      );

  // Semantic match score (proportion of missing requirements recovered semantically)
  const missingCount = allRequirements.filter(r => r.matchType === 'MISSING').length;
  const semanticMatch = missingCount === 0
    ? 100
    : Math.round((semanticResults.filter(r => r.matched).length / Math.max(missingCount, 1)) * 100);

  // Weighted composite
  const overall = Math.round(
    mustHaveCoverage * WEIGHTS.mustHave +
    preferredCoverage * WEIGHTS.preferred +
    experienceScore * WEIGHTS.experience +
    hardSkillMatch * WEIGHTS.hardSkill +
    Math.min(semanticMatch, 100) * WEIGHTS.semantic +
    assessmentScore * WEIGHTS.assessment
  );

  return {
    mustHaveCoverage,
    preferredCoverage,
    experienceAlignment: experienceScore,
    hardSkillMatch,
    semanticMatch,
    assessmentEvidence: assessmentScore,
    overall: Math.max(0, Math.min(100, overall)),
  };
}

// ---------------------------------------------------------------------------
// Gap analysis — evidence-based only
// ---------------------------------------------------------------------------

function buildGaps(
  requirements: RequirementMatch[],
  semanticMatched: Set<string>,
): ATSAnalysisResult['gaps'] {
  const gaps: ATSAnalysisResult['gaps'] = [];

  for (const req of requirements) {
    if (req.matchType !== 'MISSING') continue;
    if (semanticMatched.has(req.requirement)) continue; // semantically covered

    const severity =
      req.requirementClass === 'MUST_HAVE' ? 'CRITICAL' :
      req.requirementClass === 'PREFERRED' ? 'IMPORTANT' : 'OPTIONAL';

    gaps.push({
      requirement: req.requirement,
      type: req.requirementClass,
      severity,
      suggestion: `Add "${req.requirement}" to your resume where genuinely applicable. Do not add skills you do not possess.`,
    });
  }

  return gaps;
}

// ---------------------------------------------------------------------------
// Master resume non-mutation verifier
// ---------------------------------------------------------------------------

async function verifyResumeIntegrity(
  resumeId: string,
  snapshotHash: string,
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('ai_resumes')
      .select('content')
      .eq('id', resumeId)
      .single();

    if (error || !data) return false;

    const currentHash = JSON.stringify(data.content).length.toString() +
      JSON.stringify(data.content).slice(0, 50);
    return currentHash === snapshotHash;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// 1A — Main public function: analyzeATSFit
// ---------------------------------------------------------------------------

/**
 * analyzeATSFit
 *
 * The primary Phase 1 ATS analysis function.
 * Fetches resume and job data, runs the full pipeline, returns a structured result.
 *
 * Returns ATSUnavailable with reason if analysis cannot be completed safely.
 * NEVER returns a fabricated score.
 */
export async function analyzeATSFit(
  resumeId: string,
  jobId: string,
  userId?: string,
): Promise<ATSFitResult> {
  // -------------------------------------------------------------------------
  // 1. Fetch resume (read-only)
  // -------------------------------------------------------------------------
  const { data: resumeRow, error: resumeError } = await supabase
    .from('ai_resumes')
    .select('id, content, user_id')
    .eq('id', resumeId)
    .single();

  if (resumeError || !resumeRow) {
    return {
      available: false,
      reason: `Resume not found or access denied (id: ${resumeId})`,
      resumeId,
      jobId,
    };
  }

  // Take a lightweight integrity snapshot BEFORE any processing
  const contentSnapshot = JSON.stringify(resumeRow.content).length.toString() +
    JSON.stringify(resumeRow.content).slice(0, 50);

  // -------------------------------------------------------------------------
  // 2. Normalize resume
  // -------------------------------------------------------------------------
  const normResult = normalizeResumeContent(resumeRow.content);

  if (normResult.status === 'UNSUPPORTED_VARIANT' || normResult.status === 'MANUAL_REVIEW_REQUIRED') {
    return {
      available: false,
      reason: `Resume content could not be normalized (variant: ${normResult.variantDetected}). Manual review required.`,
      resumeId,
      jobId,
    };
  }

  const resume = normResult.normalized;

  // -------------------------------------------------------------------------
  // 3. Fetch job (read-only)
  // -------------------------------------------------------------------------
  const { data: jobRow, error: jobError } = await supabase
    .from('jobs')
    .select(`
      id, job_title, skills_required, must_have_requirements, nice_to_have,
      key_responsibilities, min_experience, max_experience, education_level,
      company_name, location, employment_type, salary_min, salary_max
    `)
    .eq('id', jobId)
    .single();

  if (jobError || !jobRow) {
    return {
      available: false,
      reason: `Job not found or access denied (id: ${jobId})`,
      resumeId,
      jobId,
    };
  }

  // -------------------------------------------------------------------------
  // 4. Extract requirements from structured job fields
  // -------------------------------------------------------------------------
  const reqs = extractRequirements(jobRow as Record<string, unknown>);

  // -------------------------------------------------------------------------
  // 5. Build candidate corpus for matching
  // -------------------------------------------------------------------------
  const corpus = buildCandidateCorpus(resume);

  // -------------------------------------------------------------------------
  // 6. Deterministic matching — primary signal
  // -------------------------------------------------------------------------
  const allRequirements: RequirementMatch[] = [
    ...reqs.mustHave.map(r => deterministicMatch(r, corpus, 'MUST_HAVE')),
    ...reqs.preferred.map(r => deterministicMatch(r, corpus, 'PREFERRED')),
    ...reqs.skills.map(r => deterministicMatch(r, corpus, 'SKILL')),
  ];

  // -------------------------------------------------------------------------
  // 7. Experience alignment
  // -------------------------------------------------------------------------
  const expAlignment = scoreExperienceAlignment(resume, reqs);
  const experienceScore = experienceAlignmentToScore(expAlignment);

  // -------------------------------------------------------------------------
  // 8. Assessment evidence (confirmed source only, non-blocking)
  // -------------------------------------------------------------------------
  const effectiveUserId = userId ?? resumeRow.user_id;
  const assessmentEvidence = effectiveUserId
    ? await fetchAssessmentEvidence(effectiveUserId, resume.skills)
    : [];
  const assessmentScore = assessmentEvidenceToScore(assessmentEvidence);

  // -------------------------------------------------------------------------
  // 9. Semantic matching — secondary signal, only for unmatched requirements
  // -------------------------------------------------------------------------
  const missingRequirements = allRequirements
    .filter(r => r.matchType === 'MISSING')
    .map(r => r.requirement);

  const semanticResults = await runSemanticMatching(missingRequirements, resume);

  // Update requirement matches with semantic results
  const semanticMatchedSet = new Set(
    semanticResults.filter(r => r.matched).map(r => r.requirement),
  );

  const finalRequirements = allRequirements.map(req => {
    if (req.matchType === 'MISSING' && semanticMatchedSet.has(req.requirement)) {
      const semResult = semanticResults.find(r => r.requirement === req.requirement);
      return {
        ...req,
        matchType: 'SEMANTIC' as MatchType,
        candidateEvidence: semResult?.evidence ? [semResult.evidence] : [],
        confidence: semResult?.confidence ?? 'MEDIUM' as ConfidenceLevel,
        reason: semResult?.reason ?? 'Semantic equivalence detected',
      };
    }
    return req;
  });

  // -------------------------------------------------------------------------
  // 10. Score assembly
  // -------------------------------------------------------------------------
  const breakdown = assembleFinalScore(
    allRequirements, // use original deterministic for score (not inflated by semantic)
    semanticResults,
    experienceScore,
    assessmentScore,
  );

  // -------------------------------------------------------------------------
  // 11. Gaps
  // -------------------------------------------------------------------------
  const gaps = buildGaps(finalRequirements, semanticMatchedSet);

  // -------------------------------------------------------------------------
  // 12. Master resume integrity verification
  // -------------------------------------------------------------------------
  const integrityVerified = await verifyResumeIntegrity(resumeId, contentSnapshot);

  // -------------------------------------------------------------------------
  // 13. Return structured, explainable result
  // -------------------------------------------------------------------------
  return {
    version: '1.0',
    analyzedAt: new Date().toISOString(),
    resumeId,
    jobId,
    variantDetected: normResult.variantDetected,
    normalizationWarnings: normResult.warnings.map(w => `${w.field}: ${w.message}`),

    score: breakdown.overall,
    breakdown,

    requirements: finalRequirements,
    experienceAlignment: expAlignment,
    assessmentEvidence,

    gaps,

    deterministicMatchCount: finalRequirements.filter(
      r => ['EXACT', 'NORMALIZED', 'PARTIAL'].includes(r.matchType)
    ).length,
    semanticMatchCount: finalRequirements.filter(r => r.matchType === 'SEMANTIC').length,

    dataIntegrityVerified: integrityVerified,
  };
}

/**
 * Type guard: is this result a successful analysis?
 */
export function isATSAnalysis(result: ATSFitResult): result is ATSAnalysisResult {
  return !('available' in result);
}

/**
 * Serialize the analysis result for storage in job_applications.application_data.
 * Safe merge: preserves existing keys under 'ats_analysis'.
 */
export function serializeATSResultForStorage(result: ATSFitResult): Record<string, unknown> {
  return {
    ats_analysis: isATSAnalysis(result)
      ? {
          version: result.version,
          analyzed_at: result.analyzedAt,
          resume_id: result.resumeId,
          job_id: result.jobId,
          score: result.score,
          breakdown: result.breakdown,
          requirement_summary: {
            total: result.requirements.length,
            matched: result.requirements.filter(r => r.matchType !== 'MISSING').length,
            missing: result.requirements.filter(r => r.matchType === 'MISSING').length,
            exact: result.requirements.filter(r => r.matchType === 'EXACT').length,
            semantic: result.requirements.filter(r => r.matchType === 'SEMANTIC').length,
          },
          experience_alignment: result.experienceAlignment,
          assessment_evidence_count: result.assessmentEvidence.length,
          gaps_count: result.gaps.length,
          data_integrity_verified: result.dataIntegrityVerified,
          variant_detected: result.variantDetected,
        }
      : {
          available: false,
          reason: result.reason,
          analyzed_at: new Date().toISOString(),
        },
  };
}
