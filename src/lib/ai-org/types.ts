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
  | 'ENTITY_INTELLIGENCE'   // 2. Professional Search Graph & Entity Intelligence Agent
  | 'SEO_OPPORTUNITY'       // 3. Programmatic SEO Opportunity Agent
  | 'CONTENT_ENGINE'        // 4. Educational & Career Content Agent
  | 'EMPLOYER_ACQUISITION'  // 5. Employer Multi-Location Acquisition Agent
  | 'COLLEGE_ACQUISITION'   // 6. College Placement & Campus Institutional Agent
  | 'TRAINING_ACQUISITION'  // 7. Training Company & Vocational Partner Agent
  | 'USER_ACQUISITION'      // 8. Visitor-to-Signup User Acquisition Agent
  | 'CONVERSION_ENGINE'     // 9. Cross-Module Conversion & Activation Agent
  | 'SOCIAL_DISTRIBUTION'   // 10. External Marketing & Social Distribution Agent
  | 'JOBS_GROWTH';          // 11. 100K Location Job Inventory & GSC Health Agent

export const ALL_AGENT_IDS: AgentId[] = [
  'EXECUTIVE_CEO',
  'GSC_INTELLIGENCE',
  'ENTITY_INTELLIGENCE',
  'SEO_OPPORTUNITY',
  'CONTENT_ENGINE',
  'EMPLOYER_ACQUISITION',
  'COLLEGE_ACQUISITION',
  'TRAINING_ACQUISITION',
  'USER_ACQUISITION',
  'CONVERSION_ENGINE',
  'SOCIAL_DISTRIBUTION',
  'JOBS_GROWTH',
];

export const TOTAL_AGENTS_COUNT = ALL_AGENT_IDS.length; // Exactly 12 (1 CEO + 11 Specialists)

export type ActionType =
  | 'READ_DATA'                 // Read search, inventory, or analytics data
  | 'ANALYZE'                   // Compute opportunities, gaps, K-factors
  | 'CREATE_DRAFT'              // Generate uncommitted page or post drafts
  | 'CREATE_SEO_PAGE'           // Build indexable programmatic landing page
  | 'PUBLISH_PAGE'              // Deploy page to live site & XML sitemap
  | 'PUBLISH_SOCIAL_POST'       // Distribute content to external social channel
  | 'SEND_EMAIL'                // Dispatch email outreach to employers/users
  | 'OUTREACH_LEAD'             // B2B employer outreach on verified hiring signal
  | 'CHANGE_SEO_METADATA'       // Optimize titles, meta descriptions, JSON-LD
  | 'MUTATE_GRAPH_RELATIONSHIP' // Add or refresh derived entity edge
  | 'AUDIT_ENTITY_QUALITY'      // Compute profile quality score & indexability
  | 'DELETE_PAGE'               // STRICTLY FORBIDDEN to AI agents
  | 'SPEND_MONEY';              // STRICTLY FORBIDDEN without human multi-sig

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

export interface RegionalMarketPlan {
  market: 'INDIA' | 'UAE' | 'UK' | 'USA' | 'EUROPE' | 'REST_OF_WORLD';
  marketName: string;
  strategicFocus: string;
  growthPriority: 'HIGH' | 'MEDIUM' | 'EMERGING' | 'MAINTENANCE';
  allocatedAgents: AgentId[];
  topOpportunityQuery: string;
  projectedPipelineValue: number;
  currency: string;
}

export interface GrowthExpansionOpportunity {
  rank: number;
  market: 'INDIA' | 'UAE' | 'UK' | 'USA' | 'EUROPE' | 'REST_OF_WORLD';
  title: string;
  targetQuery: string;
  score: number;
  valueTier: 'HIGH' | 'MEDIUM' | 'EMERGING';
  projectedImpact: string;
}

export interface AiCeoGrowthReport {
  search: {
    impressions: number;
    clicks: number;
    ctr: number;
    averagePosition: number;
    emergingDemand: string[];
  };
  audiences: {
    jobSeekers: number;
    students: number;
    professionals: number;
    employers: number;
    companies: number;
    colleges: number;
    trainingPartners: number;
  };
  acquisition: {
    signups: number;
    verification: number;
    activation: number;
    leads: number;
    customers: number;
  };
  products: Record<string, { visitors: number; conversions: number; rate: number }>;
  b2b: {
    employers: { leads: number; signups: number; jobsPosted: number };
    companies: { claimed: number; active: number };
    colleges: { leads: number; onboarded: number; studentsReached: number };
    training: { leads: number; activePartners: number };
  };
  kpiHierarchyAlert: string;
  whereToGrowNext: GrowthExpansionOpportunity[];
  regionalBreakdown: Record<string, {
    impressions: number;
    clicks: number;
    leads: number;
    pipeline: number;
    currency: string;
  }>;
}

export interface DailyOperatingPlan {
  planId: string;
  generatedAt: string;
  globalStrategy: string;
  priorities: Array<{
    rank: number;
    title: string;
    telemetryTrigger: string;
    proposedAction: string;
    delegatedAgentId: AgentId;
    impactScore: number;
  }>;
  overallTargetNotes: string;
  regionalPlans?: Record<string, RegionalMarketPlan>;
  growthReport?: AiCeoGrowthReport;
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
