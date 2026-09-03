// src/lib/ai-org/aiOrganizationScheduler.ts
// Autonomous Scheduler & Background Worker Engine for TalentXcel AI Growth Organization
// Periodically wakes the organization, audits server-authoritative state, runs the AI CEO plan, and dispatches agent tasks

import { supabase } from '@/integrations/supabase/client';
import { getAuthoritativeLifecycleState } from './aiOrganizationState';
import { runExecutiveDirectorCycle } from './executiveDirectorAgent';
import {
  runGscIntelligenceRoutine,
  runEntityIntelligenceRoutine,
  runSeoOpportunityRoutine,
  runContentEngineRoutine,
  runEmployerAcquisitionRoutine,
  runUserAcquisitionRoutine,
  runConversionEngineRoutine,
  runSocialDistributionRoutine,
  runJobsGrowthRoutine,
  type SpecialistAgentExecutionSummary,
} from './specialistAgents';
import type { DailyOperatingPlan } from './types';

export interface FullOrganizationCycleReport {
  timestamp: string;
  lifecycleStatusAtStart: string;
  dailyOperatingPlan: DailyOperatingPlan;
  agentSummaries: SpecialistAgentExecutionSummary[];
  totalExecuted: number;
  totalPendingReview: number;
  totalBlocked: number;
}

let schedulerTimer: NodeJS.Timeout | null = null;
let isCycleRunning = false;

/**
 * Runs a complete autonomous organization operating cycle
 * Can be triggered automatically by the scheduler worker or manually by the Admin UI
 */
export async function runFullOrganizationCycle(): Promise<FullOrganizationCycleReport> {
  if (isCycleRunning) {
    throw new Error('A cycle is already currently running.');
  }

  isCycleRunning = true;
  const now = new Date();

  try {
    // 1. Check Server-Authoritative Organization Lifecycle State
    const orgState = await getAuthoritativeLifecycleState();

    // 2. Run Executive AI CEO Planning Cycle
    const dailyPlan = await runExecutiveDirectorCycle();

    // 3. Dispatch Tasks to the 8 Department Specialist Agents
    const summaries: SpecialistAgentExecutionSummary[] = [];

    summaries.push(await runGscIntelligenceRoutine());
    summaries.push(await runEntityIntelligenceRoutine());
    summaries.push(await runSeoOpportunityRoutine());
    summaries.push(await runContentEngineRoutine());
    summaries.push(await runEmployerAcquisitionRoutine());
    summaries.push(await runUserAcquisitionRoutine());
    summaries.push(await runConversionEngineRoutine());
    summaries.push(await runSocialDistributionRoutine());
    summaries.push(await runJobsGrowthRoutine());

    // 4. Record execution stats
    const totalExecuted = summaries.filter((s) => s.status === 'EXECUTED').length;
    const totalPendingReview = summaries.filter((s) => s.status === 'PENDING_REVIEW').length;
    const totalBlocked = summaries.filter((s) => s.status === 'BLOCKED_OFF' || s.status === 'BLOCKED_PERMISSION').length;

    // Update last run time in Supabase state table
    try {
      await supabase
        .from('ai_organization_state' as any)
        .update({
          last_cycle_run_at: now.toISOString(),
          updated_at: now.toISOString(),
        })
        .eq('id', 'master');
    } catch {
      // Non-blocking
    }

    return {
      timestamp: now.toISOString(),
      lifecycleStatusAtStart: orgState,
      dailyOperatingPlan: dailyPlan,
      agentSummaries: summaries,
      totalExecuted,
      totalPendingReview,
      totalBlocked,
    };
  } finally {
    isCycleRunning = false;
  }
}

/**
 * Starts the automated scheduler background worker
 */
export function startScheduler(intervalMinutes: number = 60) {
  if (schedulerTimer) {
    clearInterval(schedulerTimer);
  }

  const intervalMs = Math.max(10, intervalMinutes) * 60 * 1000;
  schedulerTimer = setInterval(() => {
    runFullOrganizationCycle().catch((err) => {
      console.warn('[AI Scheduler Worker] Cycle error:', err);
    });
  }, intervalMs);

  console.log(`[AI Scheduler Worker] Background worker initialized. Interval: ${intervalMinutes} mins.`);
}

/**
 * Halts the automated scheduler background worker
 */
export function stopScheduler() {
  if (schedulerTimer) {
    clearInterval(schedulerTimer);
    schedulerTimer = null;
  }
  console.log('[AI Scheduler Worker] Background worker stopped.');
}

export function isSchedulerRunning(): boolean {
  return schedulerTimer !== null;
}
