/**
 * TalentXcel Fresher & Entry-Level Intelligence Engine
 * Deep qualification classifier evaluating titles, descriptions, experience brackets,
 * degree criteria, and apprenticeship markers.
 */

import { FresherAssessment } from '@/types/jobs/globalJob';

const FRESHER_POSITIVE_PATTERNS = [
  /\bfresher(s)?\b/i,
  /\bentry[\s-]level\b/i,
  /\b0[\s-]*(to|-)*[\s-]*1\s*(year|yr|yrs)?\b/i,
  /\bno\s+experience\s+(required|needed)\b/i,
  /\bgraduate\s+(trainee|engineer|program|recruitment|scheme)\b/i,
  /\bmanagement\s+trainee\b/i,
  /\bexecutive\s+trainee\b/i,
  /\bapprentice(ship)?\b/i,
  /\bintern(ship)?\b/i,
  /\bcollege\s+(graduates|students)\b/i,
  /\brecent\s+graduates?\b/i,
  /\bbatch\s+of\s+20\d\d\b/i,
  /\bcampus\s+(hiring|recruitment|drive)\b/i,
  /\bassociate\s+trainee\b/i,
];

const FRESHER_NEGATIVE_PATTERNS = [
  /\b(2|3|4|5|6|7|8|9|10)\+?\s*(years?|yrs?)\s+(of\s+)?experience\b/i,
  /\bminimum\s+[2-9]\s*years?\b/i,
  /\bsenior\b/i,
  /\blead\b/i,
  /\bprincipal\b/i,
  /\barchitect\b/i,
  /\bdirector\b/i,
  /\bmanager\s+with\s+[2-9]\b/i,
];

export function evaluateFresherEligibility(job: {
  title?: string;
  description?: string;
  experience_level?: string;
  minimum_experience_months?: number;
  years_of_experience?: string | number | null;
  is_fresher_eligible?: boolean;
}): FresherAssessment {
  // If explicitly flagged
  if (job.is_fresher_eligible === true) {
    return {
      is_fresher_eligible: true,
      confidence: 1.0,
      reasons: ['Explicitly marked as Fresher Eligible by posting employer or official notification.'],
      graduate_eligible: true,
    };
  }

  const title = job.title || '';
  const desc = job.description || '';
  const expLevel = (job.experience_level || '').toLowerCase();
  const text = `${title} ${desc}`.toLowerCase();

  const reasons: string[] = [];
  let score = 0;

  // 1. Direct experience level checks
  if (expLevel.includes('fresher')) {
    score += 0.5;
    reasons.push('Experience level designated as "Fresher".');
  } else if (expLevel.includes('entry') || expLevel.includes('0-1')) {
    score += 0.4;
    reasons.push('Experience level designated as "Entry Level (0-1 yrs)".');
  }

  if (job.minimum_experience_months === 0) {
    score += 0.3;
    reasons.push('Minimum required experience is 0 months.');
  } else if (job.minimum_experience_months && job.minimum_experience_months > 12) {
    score -= 0.6;
    reasons.push(`Requires at least ${Math.round(job.minimum_experience_months / 12)} years experience.`);
  }

  // 2. Title pattern checks
  for (const pat of FRESHER_POSITIVE_PATTERNS) {
    if (pat.test(title)) {
      score += 0.4;
      reasons.push(`Job title matches fresher pattern: "${title}".`);
      break;
    }
  }

  // 3. Negative pattern checks
  for (const pat of FRESHER_NEGATIVE_PATTERNS) {
    if (pat.test(title)) {
      score -= 0.7;
      reasons.push('Job title indicates senior or experienced role.');
      break;
    }
    if (pat.test(desc.slice(0, 500))) {
      score -= 0.4;
      reasons.push('Description stipulates prior multi-year experience requirements.');
      break;
    }
  }

  const confidence = Math.max(0, Math.min(1.0, score));
  const isEligible = confidence >= 0.5;

  return {
    is_fresher_eligible: isEligible,
    confidence,
    reasons: reasons.length > 0 ? reasons : ['No conclusive fresher indicators identified.'],
    graduate_eligible: isEligible,
    student_eligible: text.includes('intern') || text.includes('apprentice') || text.includes('final year'),
  };
}
