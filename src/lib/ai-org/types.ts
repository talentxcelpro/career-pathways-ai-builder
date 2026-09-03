// src/lib/ai-org/types.ts
// Authoritative Type System for TalentXcel AI Growth Organization & Control Plane
// Structure: 1 Executive AI CEO + 8 Specialist Department Agents = 9 Total Agents

export type OrganizationLifecycleState = 
  | 'OFFLINE'         // Nothing autonomous executes
  | 'STARTING'        // Boot sequence and dependency checks
  | 'ONLINE'          // Scheduled operations allowed within policy
  | 'PAUSED'          // Complete in-flight safe tasks, dispatch nothing new
  | 'EMERGENCY_STOP'; // Immediate unconditional freeze of all mutations

export type AgentId =
  | 'EXECUTIVE_CEO'         // AI CEO & Growth Director
  | 'GSC_INTELLIGENCE'      // 1. Google Search Console Intelligence Agent
  | 'SEO_OPPORTUNITY'       // 2. Programmatic SEO Opportunity Agent
  | 'CONTENT_ENGINE'        // 3. Educational & Career Content Agent
  | 'EMPLOYER_ACQUISITION'  // 4. Employer Multi-Location Acquisition Agent
  | 'USER_ACQUISITION'      // 5. Visitor-to-Signup User Acquisition Agent
  | 'CONVERSION_ENGINE'     // 6. Cross-Module Conversion & Activation Agent
  | 'SOCIAL_DISTRIBUTION'   // 7. External Marketing & Social Distribution Agent
  | 'JOBS_GROWTH';          // 8. 100K Location Job Inventory & GSC Health Agent

export const ALL_AGENT_IDS: AgentId[] = [
  'EXECUTIVE_CEO',
  'GSC_INTELLIGENCE',
  'SEO_OPPORTUNITY',
  'CONTENT_ENGINE',
  'EMPLOYER_ACQUISITION',
  'USER_ACQUISITION',
  'CONVERSION_ENGINE',
  'SOCIAL_DISTRIBUTION',
  'JOBS_GROWTH',
];

export const TOTAL_AGENTS_COUNT = ALL_AGENT_IDS.length; // Exactly 9

export type ActionType =
  | 'READ_DATA'             // Read search, inventory, or analytics data
  | 'ANALYZE'               // Compute opportunities, gaps, K-factors
  | 'CREATE_DRAFT'          // Generate uncommitted page or post drafts
  | 'CREATE_SEO_PAGE'       // Build indexable programmatic landing page
  | 'PUBLISH_PAGE'          // Deploy page to live site & XML sitemap
  | 'PUBLISH_SOCIAL_POST'   // Distribute content to external social channel
  | 'SEND_EMAIL'            // Dispatch email outreach to employers/users
  | 'CHANGE_SEO_METADATA'   // Optimize titles, meta descriptions, JSON-LD
  | 'DELETE_PAGE'           // STRICTLY FORBIDDEN to AI agents
  | 'SPEND_MONEY';          // STRICTLY FORBIDDEN without human multi-sig

export type ExecutionPolicy = 'AUTO' | 'REVIEW' | 'FORBIDDEN';

export type DecisionStage = 'DISCOVER' | 'ANALYZE' | 'RECOMMEND' | 'QUALITY_GATE' | 'EXECUTION_POLICY';

export interface AgentDescriptor {
  id: AgentId;
  name: string;
  roleTitle: string;
  department: 'EXECUTIVE' | 'INTELLIGENCE' | 'MARKETING' | 'ACQUISITION';
  mission: string;
  defaultSchedule: string; // e.g. "06:00 UTC"
  isSpecialist: boolean;
}

export interface AgentOperationalState {
  agentId: AgentId;
  enabled: boolean;
  status: 'IDLE' | 'RUNNING' | 'PAUSED' | 'BLOCKED';
  lastCycleAt?: string;
  totalActionsExecuted: number;
  totalRecommendationsProposed: number;
  lastActionSummary?: string;
}

export interface PermissionMatrixItem {
  actionType: ActionType;
  policy: ExecutionPolicy;
  description: string;
}

export interface AiRecommendation {
  id: string;
  agentId: AgentId;
  actionType: ActionType;
  title: string;
  description: string;
  targetUrl?: string;
  surface?: string;
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  status: 'PROPOSED' | 'APPROVED' | 'REJECTED' | 'EXECUTED';
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface DailyOperatingPlan {
  planId: string;
  generatedAt: string;
  priorities: Array<{
    rank: number;
    title: string;
    telemetryTrigger: string;
    proposedAction: string;
    delegatedAgentId: AgentId;
    impactScore: number;
  }>;
  overallTargetNotes: string;
}

export interface AiOperationAuditEntry {
  id: string;
  agentId: AgentId;
  actionType: ActionType;
  executionPolicy: ExecutionPolicy;
  status: 'EXECUTED' | 'BLOCKED_OFF' | 'BLOCKED_PERMISSION' | 'PENDING_REVIEW' | 'REJECTED';
  targetSurface?: string;
  telemetryTrigger?: string;
  payload?: Record<string, any>;
  createdAt: string;
}
