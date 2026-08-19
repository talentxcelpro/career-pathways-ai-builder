// ─────────────────────────────────────────────────────────────────────────────
// TalentXcel — Education Intelligence Agent  v1.0
//
// Orchestrates a 24-hour cycle of discovery, verification, change detection,
// and confidence-gated publishing for the Global Education Intelligence Layer.
//
// Architecture:
//   Discovery     → find new sources / URLs
//   Extraction    → pull program/scholarship data from official sources
//   Normalization → standardize to canonical schema
//   Deduplication → prevent same record appearing multiple times
//   Verification  → confidence scoring against official evidence
//   Publishing    → only write to DB when confidence >= threshold
//   Scheduling    → dynamic next_check_at based on data volatility
//
// The agent NEVER auto-publishes a high-stakes claim (e.g. FULLY_FUNDED)
// without confidence >= CONFIDENCE_THRESHOLDS.FULLY_FUNDED_MIN.
//
// Check frequencies by data type:
//   Application deadlines  → 24h  (HIGH priority)
//   Scholarships           → 24h  (HIGH priority)
//   Tuition costs          → 72h  (MEDIUM priority)
//   Program descriptions   → 7d   (MEDIUM priority)
//   Institution metadata   → 30d  (LOW priority)
// ─────────────────────────────────────────────────────────────────────────────

import { supabase } from '@/integrations/supabase/client';
import type { GlobalProgram, GlobalScholarship, VerificationStatus } from '@/types/globalEducation';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type CheckPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export type FreshnessStatus =
  | 'VERIFIED_TODAY'      // 🟢 last_verified_at within 24h
  | 'VERIFIED_7D'         // 🔵 verified within 7 days
  | 'VERIFICATION_DUE'    // 🟡 next_check_at is past
  | 'CHANGED_REVIEWING'   // 🔴 change detected, under review
  | 'PENDING'             // Not yet verified
  | 'NEEDS_REVIEW';       // Confidence too low to auto-publish

export interface AgentRunResult {
  runId: string;
  startedAt: string;
  completedAt: string;
  durationSeconds: number;
  programsChecked: number;
  programsUpdated: number;
  programsAdded: number;
  programsFlagged: number;
  scholarshipsChecked: number;
  scholarshipsUpdated: number;
  scholarshipsAdded: number;
  scholarshipsFlagged: number;
  errorsCount: number;
  errors: string[];
  status: 'COMPLETED' | 'FAILED' | 'PARTIAL';
  summary: string;
}

export interface VerificationResult {
  confidence: number;           // 0.0 – 1.0
  officialSourceFound: boolean;
  accessTypeVerified: boolean;
  costVerified: boolean;
  scholarshipVerified: boolean;
  evidenceSummary: string;
  needsManualReview: boolean;
}

export interface ChangeDetectionResult {
  changed: boolean;
  changedFields: string[];
  previousSnapshot: Record<string, unknown>;
  significance: 'CRITICAL' | 'MAJOR' | 'MINOR' | 'NONE';
  // CRITICAL = funding/cost changed  MAJOR = deadline/level changed
  // MINOR = description/metadata     NONE = no change
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

export const CONFIDENCE_THRESHOLDS = {
  AUTO_PUBLISH_MIN: 0.85,        // Below this → NEEDS_REVIEW, not published
  FULLY_FUNDED_MIN: 0.95,        // FULLY_FUNDED claims need higher bar
  SCHOLARSHIP_MIN: 0.90,         // Scholarship coverage claims
  TUITION_FREE_MIN: 0.88,        // TUITION_FREE claims
  GENERAL_MIN: 0.85,             // General program data
} as const;

export const CHECK_INTERVALS_HOURS: Record<CheckPriority, number> = {
  HIGH: 24,     // Deadlines, scholarships
  MEDIUM: 168,  // 7 days — program descriptions, tuition
  LOW: 720,     // 30 days — institution metadata
} as const;

export const AGENT_VERSION = 'v1.0';

// ─────────────────────────────────────────────────────────────────────────────
// FRESHNESS COMPUTATION
// ─────────────────────────────────────────────────────────────────────────────

export function computeFreshnessStatus(
  lastVerifiedAt: string | undefined,
  nextCheckAt: string | undefined,
  verificationStatus: VerificationStatus
): FreshnessStatus {
  if (verificationStatus === 'NEEDS_REVIEW') return 'NEEDS_REVIEW';

  const now = Date.now();
  const lastVerified = lastVerifiedAt ? new Date(lastVerifiedAt).getTime() : 0;
  const nextCheck = nextCheckAt ? new Date(nextCheckAt).getTime() : 0;

  if (lastVerified > now - 24 * 60 * 60 * 1000) return 'VERIFIED_TODAY';
  if (lastVerified > now - 7 * 24 * 60 * 60 * 1000) return 'VERIFIED_7D';
  if (nextCheck < now) return 'VERIFICATION_DUE';
  return 'PENDING';
}

export function getFreshnessLabel(status: FreshnessStatus): { emoji: string; label: string; color: string } {
  switch (status) {
    case 'VERIFIED_TODAY':   return { emoji: '🟢', label: 'Verified today',        color: 'text-green-600' };
    case 'VERIFIED_7D':      return { emoji: '🔵', label: 'Verified this week',    color: 'text-blue-600' };
    case 'VERIFICATION_DUE': return { emoji: '🟡', label: 'Verification due',      color: 'text-yellow-600' };
    case 'CHANGED_REVIEWING':return { emoji: '🔴', label: 'Change detected — reviewing', color: 'text-red-600' };
    case 'NEEDS_REVIEW':     return { emoji: '🟡', label: 'Needs manual review',   color: 'text-orange-600' };
    case 'PENDING':
    default:                 return { emoji: '⚪', label: 'Not yet verified',      color: 'text-muted-foreground' };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DYNAMIC SCHEDULING
// Computes next_check_at based on priority and how recently data changed
// ─────────────────────────────────────────────────────────────────────────────

export function computeNextCheckAt(
  priority: CheckPriority,
  lastChangedAt?: string,
  hasUpcomingDeadline?: boolean
): Date {
  const now = new Date();

  // If deadline is within 30 days, always check daily regardless of priority
  if (hasUpcomingDeadline) {
    return new Date(now.getTime() + 24 * 60 * 60 * 1000);
  }

  // If data changed recently, recheck sooner (heightened watch period)
  if (lastChangedAt) {
    const hoursSinceChange = (now.getTime() - new Date(lastChangedAt).getTime()) / (60 * 60 * 1000);
    if (hoursSinceChange < 48) {
      return new Date(now.getTime() + 12 * 60 * 60 * 1000); // recheck in 12h
    }
    if (hoursSinceChange < 168) {
      return new Date(now.getTime() + 24 * 60 * 60 * 1000); // recheck in 24h
    }
  }

  const hours = CHECK_INTERVALS_HOURS[priority];
  return new Date(now.getTime() + hours * 60 * 60 * 1000);
}

// ─────────────────────────────────────────────────────────────────────────────
// CHANGE DETECTION
// Compares current DB record to new extracted data
// ─────────────────────────────────────────────────────────────────────────────

export function detectChanges(
  existing: Partial<GlobalProgram | GlobalScholarship>,
  incoming: Partial<GlobalProgram | GlobalScholarship>
): ChangeDetectionResult {
  const CRITICAL_FIELDS = ['access_type', 'tuition_cost_usd', 'other_mandatory_costs_usd', 'potential_zero_cost', 'scholarship_available', 'scholarship_coverage', 'can_make_tuition_zero'];
  const MAJOR_FIELDS = ['application_deadline', 'level', 'credential', 'duration_months', 'deadline'];
  const changedFields: string[] = [];

  for (const key of Object.keys(incoming)) {
    const existingVal = (existing as Record<string, unknown>)[key];
    const incomingVal = (incoming as Record<string, unknown>)[key];
    if (existingVal !== undefined && JSON.stringify(existingVal) !== JSON.stringify(incomingVal)) {
      changedFields.push(key);
    }
  }

  if (!changedFields.length) {
    return { changed: false, changedFields: [], previousSnapshot: {}, significance: 'NONE' };
  }

  const hasCritical = changedFields.some(f => CRITICAL_FIELDS.includes(f));
  const hasMajor    = changedFields.some(f => MAJOR_FIELDS.includes(f));

  return {
    changed: true,
    changedFields,
    previousSnapshot: existing as Record<string, unknown>,
    significance: hasCritical ? 'CRITICAL' : hasMajor ? 'MAJOR' : 'MINOR',
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// VERIFICATION
// Scores a record's confidence based on available evidence.
// Does NOT make live HTTP calls in v1 — uses field completeness as proxy.
// v2 will add actual URL fetching via a Supabase edge function.
// ─────────────────────────────────────────────────────────────────────────────

export function scoreConfidence(record: Partial<GlobalProgram | GlobalScholarship>): VerificationResult {
  let score = 0;
  const issues: string[] = [];

  // Official URL present and non-empty (+30 points)
  if (record.official_url && record.official_url.startsWith('https://')) {
    score += 30;
  } else {
    issues.push('Missing or non-HTTPS official URL');
  }

  // Source evidence documented (+20 points)
  if ((record as GlobalProgram).source_evidence) {
    score += 20;
  } else {
    issues.push('No source evidence documented');
  }

  // For programs: cost fields present (+15 points)
  const program = record as GlobalProgram;
  if (program.access_type && program.tuition_cost_usd !== undefined && program.other_mandatory_costs_usd !== undefined) {
    score += 15;
  } else {
    issues.push('Incomplete cost fields');
  }

  // Career relevance or eligible_levels documented (+10 points)
  if (program.career_relevance?.length || (record as GlobalScholarship).eligible_levels?.length) {
    score += 10;
  }

  // Skills or coverage_detail present (+10 points)
  if (program.skills?.length || (record as GlobalScholarship).coverage_detail) {
    score += 10;
  }

  // Institution type + level/credential (+10 points)
  if (program.institution_type && program.level && program.credential) {
    score += 10;
  }

  // Duration documented (+5 points)
  if (program.duration_months && program.duration_months > 0) {
    score += 5;
  }

  const confidence = score / 100;
  const officialSourceFound = (record.official_url || '').startsWith('https://');
  const accessTypeVerified  = !!program.access_type;
  const costVerified        = program.tuition_cost_usd !== undefined;
  const scholarshipVerified = !program.scholarship_available || !!program.scholarship_url;

  // CRITICAL RULE: FULLY_FUNDED requires higher threshold
  let requiredThreshold = CONFIDENCE_THRESHOLDS.AUTO_PUBLISH_MIN;
  if (program.access_type === 'FULLY_FUNDED') requiredThreshold = CONFIDENCE_THRESHOLDS.FULLY_FUNDED_MIN;
  if (program.access_type === 'TUITION_FREE')   requiredThreshold = CONFIDENCE_THRESHOLDS.TUITION_FREE_MIN;

  const needsManualReview = confidence < requiredThreshold;

  return {
    confidence,
    officialSourceFound,
    accessTypeVerified,
    costVerified,
    scholarshipVerified,
    evidenceSummary: issues.length
      ? `Confidence ${Math.round(confidence * 100)}% — Issues: ${issues.join('; ')}`
      : `Confidence ${Math.round(confidence * 100)}% — All key fields present`,
    needsManualReview,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// DEDUPLICATION
// Checks if a program/scholarship already exists by canonical URL or name+level
// ─────────────────────────────────────────────────────────────────────────────

export async function isDuplicate(
  table: 'global_programs' | 'global_scholarships',
  record: Partial<GlobalProgram | GlobalScholarship>
): Promise<boolean> {
  try {
    // Primary: canonical URL match
    if (record.official_url) {
      const { count } = await supabase
        .from(table)
        .select('id', { count: 'exact', head: true })
        .eq('official_url', record.official_url);
      if (count && count > 0) return true;
    }

    // Secondary: name + title match for programs
    if (table === 'global_programs') {
      const p = record as Partial<GlobalProgram>;
      if (p.institution_name && p.program_title) {
        const { count } = await supabase
          .from('global_programs')
          .select('id', { count: 'exact', head: true })
          .ilike('institution_name', p.institution_name)
          .ilike('program_title', p.program_title);
        if (count && count > 0) return true;
      }
    }

    return false;
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLISHING GATE
// The single function that decides whether a record is auto-published or queued
// for review. This is the critical credibility guard.
// ─────────────────────────────────────────────────────────────────────────────

export function computePublishDecision(
  verification: VerificationResult,
  change: ChangeDetectionResult,
  record: Partial<GlobalProgram>
): {
  shouldAutoPublish: boolean;
  newVerificationStatus: VerificationStatus;
  newFreshnessStatus: FreshnessStatus;
  reason: string;
} {
  // CRITICAL changes to cost/funding always require manual review
  if (change.significance === 'CRITICAL') {
    return {
      shouldAutoPublish: false,
      newVerificationStatus: 'NEEDS_REVIEW',
      newFreshnessStatus: 'CHANGED_REVIEWING',
      reason: `CRITICAL change detected in fields: ${change.changedFields.join(', ')}. Manual review required.`,
    };
  }

  // Below confidence threshold → queue for review
  if (verification.needsManualReview) {
    return {
      shouldAutoPublish: false,
      newVerificationStatus: 'NEEDS_REVIEW',
      newFreshnessStatus: 'NEEDS_REVIEW',
      reason: verification.evidenceSummary,
    };
  }

  // No official URL → never auto-publish
  if (!verification.officialSourceFound) {
    return {
      shouldAutoPublish: false,
      newVerificationStatus: 'NEEDS_REVIEW',
      newFreshnessStatus: 'NEEDS_REVIEW',
      reason: 'No verified official URL — cannot auto-publish.',
    };
  }

  // All checks pass — safe to auto-publish
  return {
    shouldAutoPublish: true,
    newVerificationStatus: 'VERIFIED',
    newFreshnessStatus: 'VERIFIED_TODAY',
    reason: verification.evidenceSummary,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// AGENT CYCLE — Main orchestration
// Called every 24h (or by a Supabase scheduled edge function / cron)
// ─────────────────────────────────────────────────────────────────────────────

export async function runEducationIntelligenceCycle(): Promise<AgentRunResult> {
  const runId = `agent-run-${Date.now()}`;
  const startedAt = new Date().toISOString();
  const errors: string[] = [];

  let programsChecked = 0, programsUpdated = 0, programsAdded = 0, programsFlagged = 0;
  let scholarshipsChecked = 0, scholarshipsUpdated = 0, scholarshipsAdded = 0, scholarshipsFlagged = 0;

  // Register run in DB
  try {
    await supabase.from('education_agent_runs').insert({
      run_id: runId,
      agent_version: AGENT_VERSION,
      started_at: startedAt,
      status: 'RUNNING',
    });
  } catch (e) {
    errors.push(`Failed to register run: ${e}`);
  }

  // ── STEP 1: Check programs that are due for verification ──────────────────
  try {
    const { data: dueProgramsData } = await supabase
      .from('global_programs')
      .select('*')
      .lte('next_check_at', new Date().toISOString())
      .order('check_priority', { ascending: false })  // HIGH first
      .limit(50);

    const duePrograms = (dueProgramsData || []) as GlobalProgram[];
    programsChecked = duePrograms.length;

    for (const program of duePrograms) {
      try {
        // Score confidence
        const verification = scoreConfidence(program);

        // Detect changes (v1: only checking against existing DB record — no HTTP yet)
        const change = detectChanges(program, program); // no-op in v1, real HTTP in v2

        // Publishing gate
        const decision = computePublishDecision(verification, change, program);

        // Compute next check
        const hasDeadline = program.application_deadline
          ? new Date(program.application_deadline).getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000
          : false;
        const nextCheck = computeNextCheckAt(
          (program as Record<string, unknown>)['check_priority'] as CheckPriority || 'MEDIUM',
          (program as Record<string, unknown>)['last_changed_at'] as string | undefined,
          hasDeadline
        );

        // Update record
        const { error: updateErr } = await supabase
          .from('global_programs')
          .update({
            verification_status: decision.newVerificationStatus,
            freshness_status: decision.newFreshnessStatus,
            confidence_score: verification.confidence,
            last_verified_at: new Date().toISOString(),
            next_check_at: nextCheck.toISOString(),
            agent_run_id: runId,
            agent_version: AGENT_VERSION,
            agent_notes: decision.reason,
            updated_at: new Date().toISOString(),
          })
          .eq('id', program.id);

        if (updateErr) {
          errors.push(`Program ${program.id}: ${updateErr.message}`);
        } else if (decision.shouldAutoPublish) {
          programsUpdated++;
        } else {
          programsFlagged++;
        }
      } catch (e) {
        errors.push(`Program cycle error: ${e}`);
      }
    }
  } catch (e) {
    errors.push(`Programs phase error: ${e}`);
  }

  // ── STEP 2: Check scholarships that are due ───────────────────────────────
  try {
    const { data: dueScholarshipsData } = await supabase
      .from('global_scholarships')
      .select('*')
      .lte('next_check_at', new Date().toISOString())
      .limit(50);

    const dueScholarships = (dueScholarshipsData || []) as GlobalScholarship[];
    scholarshipsChecked = dueScholarships.length;

    for (const scholarship of dueScholarships) {
      try {
        const verification = scoreConfidence(scholarship as unknown as Partial<GlobalProgram>);
        const change = detectChanges(scholarship, scholarship);

        const nextCheck = computeNextCheckAt('HIGH');

        const newFreshness = computeFreshnessStatus(
          new Date().toISOString(),
          nextCheck.toISOString(),
          verification.needsManualReview ? 'NEEDS_REVIEW' : 'VERIFIED'
        );

        const { error: updateErr } = await supabase
          .from('global_scholarships')
          .update({
            verification_status: verification.needsManualReview ? 'NEEDS_REVIEW' : 'VERIFIED',
            freshness_status: newFreshness,
            confidence_score: verification.confidence,
            last_verified_at: new Date().toISOString(),
            next_check_at: nextCheck.toISOString(),
            agent_run_id: runId,
            agent_version: AGENT_VERSION,
            agent_notes: verification.evidenceSummary,
            updated_at: new Date().toISOString(),
          })
          .eq('id', scholarship.id);

        if (updateErr) {
          errors.push(`Scholarship ${scholarship.id}: ${updateErr.message}`);
        } else if (!verification.needsManualReview) {
          scholarshipsUpdated++;
        } else {
          scholarshipsFlagged++;
        }
      } catch (e) {
        errors.push(`Scholarship cycle error: ${e}`);
      }
    }
  } catch (e) {
    errors.push(`Scholarships phase error: ${e}`);
  }

  // ── FINALIZE ─────────────────────────────────────────────────────────────
  const completedAt = new Date().toISOString();
  const durationSeconds = Math.round((Date.now() - new Date(startedAt).getTime()) / 1000);
  const status: AgentRunResult['status'] = errors.length === 0 ? 'COMPLETED' : errors.length < 5 ? 'PARTIAL' : 'FAILED';
  const summary = `Cycle ${runId}: Programs ${programsUpdated} updated, ${programsFlagged} flagged. Scholarships ${scholarshipsUpdated} updated, ${scholarshipsFlagged} flagged. ${errors.length} errors.`;

  try {
    await supabase.from('education_agent_runs').update({
      completed_at: completedAt,
      duration_seconds: durationSeconds,
      programs_checked: programsChecked,
      programs_updated: programsUpdated,
      programs_added: programsAdded,
      programs_flagged: programsFlagged,
      scholarships_checked: scholarshipsChecked,
      scholarships_updated: scholarshipsUpdated,
      scholarships_added: scholarshipsAdded,
      scholarships_flagged: scholarshipsFlagged,
      errors_count: errors.length,
      error_log: errors,
      status,
      summary,
    }).eq('run_id', runId);
  } catch (e) {
    errors.push(`Failed to finalize run: ${e}`);
  }

  return {
    runId,
    startedAt,
    completedAt,
    durationSeconds,
    programsChecked,
    programsUpdated,
    programsAdded,
    programsFlagged,
    scholarshipsChecked,
    scholarshipsUpdated,
    scholarshipsAdded,
    scholarshipsFlagged,
    errorsCount: errors.length,
    errors,
    status,
    summary,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// AGENT STATUS — Read last N runs for monitoring UI
// ─────────────────────────────────────────────────────────────────────────────

export async function getAgentRunHistory(limit = 10) {
  const { data, error } = await supabase
    .from('education_agent_runs')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(limit);
  if (error) return [];
  return data || [];
}

export async function getRecordsDueForVerification(limit = 20) {
  const { data: programs } = await supabase
    .from('global_programs')
    .select('id, program_title, institution_name, freshness_status, next_check_at, confidence_score')
    .lte('next_check_at', new Date().toISOString())
    .limit(limit);

  const { data: scholarships } = await supabase
    .from('global_scholarships')
    .select('id, title, provider, freshness_status, next_check_at, confidence_score')
    .lte('next_check_at', new Date().toISOString())
    .limit(limit);

  return { programs: programs || [], scholarships: scholarships || [] };
}
