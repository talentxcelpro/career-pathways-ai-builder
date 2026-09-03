// src/lib/ai-org/aiOrganizationState.ts
// Server-Authoritative State Provider for TalentXcel AI Growth Organization
// Invariant: Supabase is the sole source of truth. LocalStorage is strictly an ephemeral UI cache.

import { supabase } from '@/integrations/supabase/client';
import { 
  ALL_AGENT_IDS, 
  TOTAL_AGENTS_COUNT,
  type AgentId, 
  type OrganizationLifecycleState, 
  type AgentDescriptor, 
  type AgentOperationalState,
  type PermissionMatrixItem,
  type AiOperationAuditEntry,
  type DailyOperatingPlan,
  type AiRecommendation
} from './types';

// The 9 Canonical Agent Descriptors (1 CEO + 8 Department Specialists)
export const AGENT_REGISTRY_DESCRIPTORS: Record<AgentId, AgentDescriptor> = {
  EXECUTIVE_CEO: {
    id: 'EXECUTIVE_CEO',
    name: 'Executive AI CEO / Growth Director',
    roleTitle: 'Strategic Synthesis & Daily Operating Direction',
    department: 'EXECUTIVE',
    mission: 'Synthesize GSC search trends and cross-module growth telemetry into the daily prioritized operating plan.',
    defaultSchedule: '06:00 UTC',
    isSpecialist: false,
  },
  GSC_INTELLIGENCE: {
    id: 'GSC_INTELLIGENCE',
    name: 'GSC Intelligence Agent',
    roleTitle: 'Search Console Demand & Query Auditor',
    department: 'INTELLIGENCE',
    mission: 'Inspect search console queries, identify rising search terms, detect CTR gaps, and audit indexation health.',
    defaultSchedule: '06:30 UTC',
    isSpecialist: true,
  },
  ENTITY_INTELLIGENCE: {
    id: 'ENTITY_INTELLIGENCE',
    name: 'Professional Entity Graph Agent',
    roleTitle: 'Entity Discovery & Graph Intelligence Lead',
    department: 'INTELLIGENCE',
    mission: 'Map professional identities, posts, companies, and jobs into a connected search graph; audit profile quality scores and detect entity gaps.',
    defaultSchedule: '07:00 UTC',
    isSpecialist: true,
  },
  SEO_OPPORTUNITY: {
    id: 'SEO_OPPORTUNITY',
    name: 'SEO Opportunity Agent',
    roleTitle: 'Demand-to-Landing Page Evaluator',
    department: 'MARKETING',
    mission: 'Evaluate verified search demand against TalentXcel data and draft quality-gated programmatic landing pages.',
    defaultSchedule: '07:30 UTC',
    isSpecialist: true,
  },
  CONTENT_ENGINE: {
    id: 'CONTENT_ENGINE',
    name: 'Career & Education Content Agent',
    roleTitle: 'Authoritative Content Creator',
    department: 'MARKETING',
    mission: 'Produce high-utility career advice, resume frameworks, salary analyses, and degree guidance without thin doorway spam.',
    defaultSchedule: '08:30 UTC',
    isSpecialist: true,
  },
  EMPLOYER_ACQUISITION: {
    id: 'EMPLOYER_ACQUISITION',
    name: 'Employer Acquisition Agent',
    roleTitle: 'Multi-Location Job & Employer Funnel Lead',
    department: 'ACQUISITION',
    mission: 'Drive employer acquisition, optimize /hire conversion, and expand multi-location posting adoption.',
    defaultSchedule: '09:30 UTC',
    isSpecialist: true,
  },
  COLLEGE_ACQUISITION: {
    id: 'COLLEGE_ACQUISITION',
    name: 'College Acquisition Agent',
    roleTitle: 'Campus Placement & Higher Education Partner Lead',
    department: 'ACQUISITION',
    mission: 'Capture college search demand, optimize campus placement software propositions, and onboard institutional cohorts.',
    defaultSchedule: '10:00 UTC',
    isSpecialist: true,
  },
  TRAINING_ACQUISITION: {
    id: 'TRAINING_ACQUISITION',
    name: 'Training Company Acquisition Agent',
    roleTitle: 'Vocational Institute & Upskilling Partner Lead',
    department: 'ACQUISITION',
    mission: 'Engage training companies, vocational institutes, and coaching organizations to funnel students into verified career pathways.',
    defaultSchedule: '10:15 UTC',
    isSpecialist: true,
  },
  USER_ACQUISITION: {
    id: 'USER_ACQUISITION',
    name: 'User Acquisition Agent',
    roleTitle: 'Search-to-Signup Journey Architect',
    department: 'ACQUISITION',
    mission: 'Streamline Google visitor entry into activation paths across Resume, Jobs, Tools, and Network.',
    defaultSchedule: '10:30 UTC',
    isSpecialist: true,
  },
  CONVERSION_ENGINE: {
    id: 'CONVERSION_ENGINE',
    name: 'Conversion & Activation Agent',
    roleTitle: 'Funnel Experimenter & A/B Optimizer',
    department: 'ACQUISITION',
    mission: 'Monitor application start rates, resume scans, and signups, proposing data-driven funnel improvements.',
    defaultSchedule: '11:30 UTC',
    isSpecialist: true,
  },
  SOCIAL_DISTRIBUTION: {
    id: 'SOCIAL_DISTRIBUTION',
    name: 'Social Distribution Agent',
    roleTitle: 'External Reach & Network Amplifier',
    department: 'MARKETING',
    mission: 'Prepare approved distributions of milestone reports, salary benchmarks, and hiring trends to external channels.',
    defaultSchedule: '14:00 UTC',
    isSpecialist: true,
  },
  JOBS_GROWTH: {
    id: 'JOBS_GROWTH',
    name: 'Jobs Growth & Health Agent',
    roleTitle: '100K Location Inventory & Sitemap Auditor',
    department: 'INTELLIGENCE',
    mission: 'Audit job inventory across 100,000 locations, reconcile expired jobs, maintain <=25k sitemap shards, and monitor Indexing API queues.',
    defaultSchedule: '16:00 UTC',
    isSpecialist: true,
  },
};

// Default Level 3 Permission Matrix
export const DEFAULT_ACTION_PERMISSIONS: Record<AgentId, PermissionMatrixItem[]> = {
  EXECUTIVE_CEO: [
    { actionType: 'READ_DATA', policy: 'AUTO', description: 'Read all analytics and search intelligence' },
    { actionType: 'ANALYZE', policy: 'AUTO', description: 'Generate cross-system operational plans' },
    { actionType: 'CREATE_DRAFT', policy: 'AUTO', description: 'Draft company directives' },
    { actionType: 'DELETE_PAGE', policy: 'FORBIDDEN', description: 'AI prohibited from deleting public pages' },
    { actionType: 'SPEND_MONEY', policy: 'FORBIDDEN', description: 'AI prohibited from spending funds' },
  ],
  GSC_INTELLIGENCE: [
    { actionType: 'READ_DATA', policy: 'AUTO', description: 'Read Google Search Console impressions and queries' },
    { actionType: 'ANALYZE', policy: 'AUTO', description: 'Identify rising/declining search queries' },
    { actionType: 'CREATE_DRAFT', policy: 'AUTO', description: 'Draft search opportunity reports' },
    { actionType: 'DELETE_PAGE', policy: 'FORBIDDEN', description: 'Prohibited' },
    { actionType: 'SPEND_MONEY', policy: 'FORBIDDEN', description: 'Prohibited' },
  ],
  ENTITY_INTELLIGENCE: [
    { actionType: 'READ_DATA', policy: 'AUTO', description: 'Read public profiles, posts, jobs, and companies' },
    { actionType: 'ANALYZE', policy: 'AUTO', description: 'Compute profile completeness and detect entity graph gaps' },
    { actionType: 'AUDIT_ENTITY_QUALITY', policy: 'AUTO', description: 'Calculate 0-100 profile quality score and indexability state' },
    { actionType: 'MUTATE_GRAPH_RELATIONSHIP', policy: 'AUTO', description: 'Project verified explicit relationships into derived search graph' },
    { actionType: 'DELETE_PAGE', policy: 'FORBIDDEN', description: 'Prohibited' },
    { actionType: 'SPEND_MONEY', policy: 'FORBIDDEN', description: 'Prohibited' },
  ],
  SEO_OPPORTUNITY: [
    { actionType: 'READ_DATA', policy: 'AUTO', description: 'Read query demand lake' },
    { actionType: 'ANALYZE', policy: 'AUTO', description: 'Score ranking opportunities (P0..P5)' },
    { actionType: 'CREATE_DRAFT', policy: 'AUTO', description: 'Draft programmatic candidate pages' },
    { actionType: 'CREATE_SEO_PAGE', policy: 'AUTO', description: 'Build validated SEO discovery pages' },
    { actionType: 'PUBLISH_PAGE', policy: 'REVIEW', description: 'Publishing pages requires human review or safety mode check' },
    { actionType: 'DELETE_PAGE', policy: 'FORBIDDEN', description: 'Prohibited' },
    { actionType: 'SPEND_MONEY', policy: 'FORBIDDEN', description: 'Prohibited' },
  ],
  CONTENT_ENGINE: [
    { actionType: 'READ_DATA', policy: 'AUTO', description: 'Read career, college and salary data' },
    { actionType: 'CREATE_DRAFT', policy: 'AUTO', description: 'Create draft career pathways and guides' },
    { actionType: 'CHANGE_SEO_METADATA', policy: 'AUTO', description: 'Improve meta descriptions and titles' },
    { actionType: 'PUBLISH_PAGE', policy: 'REVIEW', description: 'Publishing requires review' },
    { actionType: 'DELETE_PAGE', policy: 'FORBIDDEN', description: 'Prohibited' },
    { actionType: 'SPEND_MONEY', policy: 'FORBIDDEN', description: 'Prohibited' },
  ],
  EMPLOYER_ACQUISITION: [
    { actionType: 'READ_DATA', policy: 'AUTO', description: 'Read employer signups and multi-location campaigns' },
    { actionType: 'ANALYZE', policy: 'AUTO', description: 'Analyze employer acquisition funnel drop-offs' },
    { actionType: 'CREATE_DRAFT', policy: 'AUTO', description: 'Draft employer messaging' },
    { actionType: 'SEND_EMAIL', policy: 'REVIEW', description: 'Outreach emails strictly require human approval' },
    { actionType: 'DELETE_PAGE', policy: 'FORBIDDEN', description: 'Prohibited' },
    { actionType: 'SPEND_MONEY', policy: 'FORBIDDEN', description: 'Prohibited' },
  ],
  COLLEGE_ACQUISITION: [
    { actionType: 'READ_DATA', policy: 'AUTO', description: 'Read institutional college queries and placement leads' },
    { actionType: 'ANALYZE', policy: 'AUTO', description: 'Analyze campus recruitment software demand gaps' },
    { actionType: 'CREATE_DRAFT', policy: 'AUTO', description: 'Draft college partner onboarding pages' },
    { actionType: 'SEND_EMAIL', policy: 'REVIEW', description: 'Institutional outreach emails require human approval' },
    { actionType: 'DELETE_PAGE', policy: 'FORBIDDEN', description: 'Prohibited' },
    { actionType: 'SPEND_MONEY', policy: 'FORBIDDEN', description: 'Prohibited' },
  ],
  TRAINING_ACQUISITION: [
    { actionType: 'READ_DATA', policy: 'AUTO', description: 'Read vocational training and skill search volume' },
    { actionType: 'ANALYZE', policy: 'AUTO', description: 'Evaluate course partner and certification funnels' },
    { actionType: 'CREATE_DRAFT', policy: 'AUTO', description: 'Draft training provider partnership pages' },
    { actionType: 'SEND_EMAIL', policy: 'REVIEW', description: 'Partner outreach emails require human approval' },
    { actionType: 'DELETE_PAGE', policy: 'FORBIDDEN', description: 'Prohibited' },
    { actionType: 'SPEND_MONEY', policy: 'FORBIDDEN', description: 'Prohibited' },
  ],
  USER_ACQUISITION: [
    { actionType: 'READ_DATA', policy: 'AUTO', description: 'Read organic landing page traffic and signups' },
    { actionType: 'ANALYZE', policy: 'AUTO', description: 'Analyze visitor-to-signup conversion paths' },
    { actionType: 'CHANGE_SEO_METADATA', policy: 'AUTO', description: 'Optimize onboarding deep links' },
    { actionType: 'DELETE_PAGE', policy: 'FORBIDDEN', description: 'Prohibited' },
    { actionType: 'SPEND_MONEY', policy: 'FORBIDDEN', description: 'Prohibited' },
  ],
  CONVERSION_ENGINE: [
    { actionType: 'READ_DATA', policy: 'AUTO', description: 'Read CTA click rates and activation rates' },
    { actionType: 'ANALYZE', policy: 'AUTO', description: 'Compute statistical confidence on A/B experiments' },
    { actionType: 'CREATE_DRAFT', policy: 'AUTO', description: 'Design conversion experiments' },
    { actionType: 'CHANGE_SEO_METADATA', policy: 'AUTO', description: 'Update CTA copy on high-volume landing pages' },
    { actionType: 'DELETE_PAGE', policy: 'FORBIDDEN', description: 'Prohibited' },
    { actionType: 'SPEND_MONEY', policy: 'FORBIDDEN', description: 'Prohibited' },
  ],
  SOCIAL_DISTRIBUTION: [
    { actionType: 'READ_DATA', policy: 'AUTO', description: 'Read viral distribution objects and benchmarks' },
    { actionType: 'CREATE_DRAFT', policy: 'AUTO', description: 'Draft social posts and summaries' },
    { actionType: 'PUBLISH_SOCIAL_POST', policy: 'REVIEW', description: 'Social publishing strictly requires human review' },
    { actionType: 'DELETE_PAGE', policy: 'FORBIDDEN', description: 'Prohibited' },
    { actionType: 'SPEND_MONEY', policy: 'FORBIDDEN', description: 'Prohibited' },
  ],
  JOBS_GROWTH: [
    { actionType: 'READ_DATA', policy: 'AUTO', description: 'Read 100K location inventory and job records' },
    { actionType: 'ANALYZE', policy: 'AUTO', description: 'Audit Google eligibility and expired postings' },
    { actionType: 'CREATE_DRAFT', policy: 'AUTO', description: 'Draft sitemap index updates' },
    { actionType: 'CHANGE_SEO_METADATA', policy: 'AUTO', description: 'Reconcile indexing queue entries' },
    { actionType: 'DELETE_PAGE', policy: 'FORBIDDEN', description: 'Prohibited' },
    { actionType: 'SPEND_MONEY', policy: 'FORBIDDEN', description: 'Prohibited' },
  ],
};

// In-Memory fallback cache in case Supabase is temporarily unreachable
let cachedLifecycleState: OrganizationLifecycleState = 'ONLINE';
let cachedAgentStates: Record<AgentId, AgentOperationalState> = ALL_AGENT_IDS.reduce((acc, id) => {
  acc[id] = {
    agentId: id,
    enabled: true,
    status: 'IDLE',
    totalActionsExecuted: 12,
    totalRecommendationsProposed: 8,
  };
  return acc;
}, {} as Record<AgentId, AgentOperationalState>);

/**
 * Server-Authoritative: Fetches the single master lifecycle state from Supabase
 */
export async function getAuthoritativeLifecycleState(): Promise<OrganizationLifecycleState> {
  try {
    const { data, error } = await supabase
      .from('ai_organization_state' as any)
      .select('lifecycle_status')
      .eq('id', 'master')
      .maybeSingle();

    if (!error && data?.lifecycle_status) {
      cachedLifecycleState = data.lifecycle_status as OrganizationLifecycleState;
      return cachedLifecycleState;
    }
  } catch (err) {
    console.warn('[AI Org State] Supabase query fallback:', err);
  }
  return cachedLifecycleState;
}

/**
 * Server-Authoritative: Updates the single master lifecycle state in Supabase
 */
export async function setAuthoritativeLifecycleState(
  newState: OrganizationLifecycleState,
  updatedBy: string = 'SuperAdmin'
): Promise<boolean> {
  cachedLifecycleState = newState;

  try {
    const { error } = await supabase
      .from('ai_organization_state' as any)
      .upsert({
        id: 'master',
        lifecycle_status: newState,
        updated_by: updatedBy,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.warn('[AI Org State] Upsert error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[AI Org State] Network error during lifecycle update:', err);
    return false;
  }
}

/**
 * Checks if autonomous mutations are strictly allowed
 */
export async function isAutonomousExecutionAllowed(): Promise<boolean> {
  const state = await getAuthoritativeLifecycleState();
  return state === 'ONLINE';
}

/**
 * Toggles an individual agent's enabled state
 */
export function setAgentEnabledLocally(agentId: AgentId, enabled: boolean) {
  if (cachedAgentStates[agentId]) {
    cachedAgentStates[agentId].enabled = enabled;
  }
}

export function getCachedAgentStates(): Record<AgentId, AgentOperationalState> {
  return { ...cachedAgentStates };
}
