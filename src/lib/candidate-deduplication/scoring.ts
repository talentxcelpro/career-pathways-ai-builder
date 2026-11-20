/**
 * Candidate Duplicate Scoring & Classification Engine
 */

import {
  normalizeEmail,
  normalizePhone,
  normalizeName,
  calculateNameSimilarity,
  calculateContentSimilarity,
  calculateSkillsSimilarity
} from './normalizers';

export type DuplicateClassification = 'CONFIRMED_DUPLICATE' | 'LIKELY_DUPLICATE' | 'POSSIBLE_MATCH' | 'UNIQUE';

export interface IdentityMatchSignal {
  layer: 'email' | 'phone' | 'file_hash' | 'cv_content' | 'name' | 'skills' | 'resume_url' | 'title';
  weight: number;
  score: number;
  evidence: string;
}

export interface CandidateComparisonInput {
  id?: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  resume_url?: string | null;
  cv_hash?: string | null;
  cv_text?: string | null;
  skills?: string[] | null;
  title?: string | null;
  experience_years?: number | null;
}

export interface DuplicateEvaluationResult {
  candidateA: CandidateComparisonInput;
  candidateB: CandidateComparisonInput;
  totalScore: number;
  classification: DuplicateClassification;
  signals: IdentityMatchSignal[];
  isDuplicate: boolean;
  recommendedAction: 'MERGE' | 'FLAG_FOR_REVIEW' | 'KEEP_SEPARATE';
}

/**
 * Weights configuration for duplicate signals
 */
export const SCORING_WEIGHTS = {
  EXACT_EMAIL: 100,
  EXACT_FILE_HASH: 100,
  EXACT_RESUME_URL: 95,
  EXACT_PHONE: 95,
  CV_CONTENT_HIGH: 90,
  NAME_STRONG: 35,
  TITLE_MATCH: 15,
  SKILLS_OVERLAP: 10
};

/**
 * Evaluates duplicate confidence between two candidate records
 */
export function evaluateDuplicateConfidence(
  candA: CandidateComparisonInput,
  candB: CandidateComparisonInput
): DuplicateEvaluationResult {
  const signals: IdentityMatchSignal[] = [];

  // Layer 1: Email Match
  const emailA = normalizeEmail(candA.email);
  const emailB = normalizeEmail(candB.email);
  if (emailA && emailB && emailA === emailB) {
    signals.push({
      layer: 'email',
      weight: SCORING_WEIGHTS.EXACT_EMAIL,
      score: 100,
      evidence: `Exact normalized email match: "${emailA}"`
    });
  }

  // Layer 2: Phone Match
  const phoneA = normalizePhone(candA.phone);
  const phoneB = normalizePhone(candB.phone);
  if (phoneA && phoneB && phoneA === phoneB) {
    signals.push({
      layer: 'phone',
      weight: SCORING_WEIGHTS.EXACT_PHONE,
      score: 95,
      evidence: `Exact normalized phone match: "${phoneA}"`
    });
  }

  // Layer 3: File Hash Match
  if (candA.cv_hash && candB.cv_hash && candA.cv_hash === candB.cv_hash) {
    signals.push({
      layer: 'file_hash',
      weight: SCORING_WEIGHTS.EXACT_FILE_HASH,
      score: 100,
      evidence: `Identical SHA-256 document fingerprint: ${candA.cv_hash.slice(0, 12)}...`
    });
  }

  // Layer 4: Exact Resume Storage URL Match
  if (
    candA.resume_url &&
    candB.resume_url &&
    candA.resume_url.trim().toLowerCase() === candB.resume_url.trim().toLowerCase()
  ) {
    signals.push({
      layer: 'resume_url',
      weight: SCORING_WEIGHTS.EXACT_RESUME_URL,
      score: 95,
      evidence: 'Both candidates reference the identical resume storage URL'
    });
  }

  // Layer 5: CV Content Shingle Similarity
  if (candA.cv_text && candB.cv_text) {
    const contentSim = calculateContentSimilarity(candA.cv_text, candB.cv_text);
    if (contentSim >= 0.85) {
      signals.push({
        layer: 'cv_content',
        weight: SCORING_WEIGHTS.CV_CONTENT_HIGH,
        score: Math.round(contentSim * 95),
        evidence: `Extracted CV text is ${(contentSim * 100).toFixed(1)}% identical`
      });
    }
  }

  // Layer 6: Name Similarity
  const nameSim = calculateNameSimilarity(candA.name, candB.name);
  if (nameSim >= 0.85) {
    signals.push({
      layer: 'name',
      weight: SCORING_WEIGHTS.NAME_STRONG,
      score: Math.round(nameSim * 35),
      evidence: `Candidate names are ${(nameSim * 100).toFixed(1)}% similar ("${candA.name}" vs "${candB.name}")`
    });
  } else if (nameSim >= 0.7 && (emailA === emailB || phoneA === phoneB)) {
    signals.push({
      layer: 'name',
      weight: 20,
      score: 20,
      evidence: `Name variant confirmed with contact match: "${candA.name}" vs "${candB.name}"`
    });
  }

  // Layer 7: Title / Role Match
  if (candA.title && candB.title) {
    const tA = candA.title.trim().toLowerCase();
    const tB = candB.title.trim().toLowerCase();
    if (tA === tB || tA.includes(tB) || tB.includes(tA)) {
      signals.push({
        layer: 'title',
        weight: SCORING_WEIGHTS.TITLE_MATCH,
        score: 15,
        evidence: `Matching professional title: "${candA.title}"`
      });
    }
  }

  // Layer 8: Skills Overlap
  if (candA.skills && candB.skills && candA.skills.length > 0 && candB.skills.length > 0) {
    const skillsSim = calculateSkillsSimilarity(candA.skills, candB.skills);
    if (skillsSim >= 0.6) {
      signals.push({
        layer: 'skills',
        weight: SCORING_WEIGHTS.SKILLS_OVERLAP,
        score: Math.round(skillsSim * 10),
        evidence: `${(skillsSim * 100).toFixed(0)}% skills overlap between candidate profiles`
      });
    }
  }

  // Calculate Cumulative Confidence Score capped at 100
  // If an exact email, exact file hash, or exact resume URL matched, base score is guaranteed >= 95
  let maxDirectSignal = 0;
  for (const s of signals) {
    if (['email', 'file_hash', 'resume_url'].includes(s.layer)) {
      maxDirectSignal = Math.max(maxDirectSignal, s.score);
    }
  }

  let totalScore = 0;
  if (maxDirectSignal >= 95) {
    totalScore = maxDirectSignal;
  } else {
    // Sum secondary signals
    const rawSum = signals.reduce((sum, s) => sum + s.score, 0);
    totalScore = Math.min(100, rawSum);
  }

  // Classify Confidence Level
  let classification: DuplicateClassification = 'UNIQUE';
  let recommendedAction: 'MERGE' | 'FLAG_FOR_REVIEW' | 'KEEP_SEPARATE' = 'KEEP_SEPARATE';

  if (totalScore >= 90) {
    classification = 'CONFIRMED_DUPLICATE';
    recommendedAction = 'MERGE';
  } else if (totalScore >= 60) {
    classification = 'LIKELY_DUPLICATE';
    recommendedAction = 'FLAG_FOR_REVIEW';
  } else if (totalScore >= 35) {
    classification = 'POSSIBLE_MATCH';
    recommendedAction = 'FLAG_FOR_REVIEW';
  }

  return {
    candidateA: candA,
    candidateB: candB,
    totalScore,
    classification,
    signals,
    isDuplicate: totalScore >= 60,
    recommendedAction
  };
}
