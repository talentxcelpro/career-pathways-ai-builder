// src/agents/kernel/types.ts
// TalentXcel Autonomous Business OS Kernel: Complete Type Definitions
// Founder & CEO: Sanobar Jahan

export type DepartmentId =
  | 'executive'
  | 'growth_marketing'
  | 'employer'
  | 'jobs'
  | 'candidates'
  | 'colleges'
  | 'claim1'
  | 'revenue'
  | 'product_engineering';

export type WorkerStatus = 'IDLE' | 'RUNNING' | 'BLOCKED' | 'ERROR' | 'PAUSED';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface AgentCapabilityProfile {
  id: string;
  name: string;
  department: DepartmentId;
  role: string;
  mission: string;
  authorizedTools: string[];
  permissions: string[];
  dailyActionLimit: number;
  monthlyBudgetCINR: number;
  requiresHumanApproval: string[];
  cooldownDays: number;
  riskCeiling: RiskLevel;
}

export type BusinessEventType =
  // Company & Employer Events
  | 'COMPANY_DISCOVERED'
  | 'COMPANY_QUALIFIED'
  | 'COMPANY_REGISTERED'
  | 'COMPANY_VERIFIED'
  | 'COMPANY_POSTED_JOB'
  | 'COMPANY_INACTIVE'
  // Claim #1 Events
  | 'CLAIM1_PROFILE_CLAIMED'
  | 'CLAIM1_BID_PLACED'
  | 'CLAIM1_POSITION_CHANGED'
  | 'CLAIM1_ENTITY_OUTBID'
  | 'CLAIM1_RANK_RECLAIMED'
  | 'CLAIM1_BADGE_EMBEDDED'
  | 'CLAIM1_WATCHER_SUBSCRIBED'
  // Jobs Events
  | 'JOB_DISCOVERED'
  | 'JOB_INGESTED'
  | 'JOB_DEDUPED'
  | 'JOB_VERIFIED'
  | 'JOB_EXPIRED'
  | 'JOB_SEO_PAGE_GENERATED'
  // Candidate & Career Events
  | 'CANDIDATE_ACQUIRED'
  | 'CANDIDATE_REGISTERED'
  | 'RESUME_CREATED'
  | 'ATS_OPTIMIZATION_COMPLETED'
  | 'PASSPORT_VERIFIED'
  | 'CANDIDATE_MATCHED'
  | 'APPLICATION_SUBMITTED'
  // College Events
  | 'COLLEGE_DISCOVERED'
  | 'COLLEGE_QUALIFIED'
  | 'COLLEGE_PARTNERSHIP_INITIATED'
  | 'COLLEGE_PARTNERSHIP_CREATED'
  | 'STUDENT_COHORT_ONBOARDED'
  // Marketing & Growth Events
  | 'PROSPECT_DISCOVERED'
  | 'PROSPECT_QUALIFIED'
  | 'CAMPAIGN_CREATED'
  | 'OUTREACH_DISPATCHED'
  | 'EMAIL_SENT'
  | 'EMAIL_DELIVERED'
  | 'EMAIL_OPENED'
  | 'EMAIL_CLICKED'
  | 'EMAIL_REPLIED'
  | 'SOCIAL_POST_SCHEDULED'
  | 'SEO_OPPORTUNITY_IDENTIFIED'
  | 'CONVERSION_RECORDED'
  // Revenue & Commercial Events
  | 'REVENUE_GENERATED'
  | 'PAYMENT_AUTHORIZED'
  | 'PAYMENT_CAPTURED'
  | 'PAYMENT_MISMATCH_DETECTED'
  | 'PAYMENT_RECONCILED'
  | 'REFUND_PROCESSED'
  // System & Security Events
  | 'EXCEPTION_RAISED'
  | 'GUARDRAIL_BLOCKED'
  | 'SECURITY_EVENT_DETECTED'
  | 'RELIABILITY_HEALTH_CHECK';

export interface BusinessEvent<T = any> {
  id: string;
  type: BusinessEventType;
  payload: T;
  sourceAgent: string;
  department: DepartmentId;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface StrategicObjective {
  id: string;
  title: string;
  department: DepartmentId;
  ownerAgent: string;
  targetMetric: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline?: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  status: 'ACTIVE' | 'ACHIEVED' | 'BLOCKED';
  requiredActions: string[];
  successCondition: string;
}

export interface WorkerDiagnostic {
  id: string;
  name: string;
  department: DepartmentId;
  role: string;
  status: WorkerStatus;
  statusReason?: string;
  currentMission: string;
  actionsToday: number;
  errorsToday: number;
  lastActiveAt: string | null;
  authorizedToolsCount: number;
  riskLevel: RiskLevel;
}

export interface KnowledgeGraphNode {
  id: string;
  type: 'company' | 'user' | 'candidate' | 'job' | 'college' | 'claim1_listing' | 'campaign';
  label: string;
  attributes: Record<string, any>;
  updatedAt: string;
}

export interface KnowledgeGraphEdge {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  relation: string;
  weight?: number;
  timestamp: string;
}

export interface RiskEscalation {
  id: string;
  agentId: string;
  department: DepartmentId;
  actionTitle: string;
  reason: string;
  riskLevel: RiskLevel;
  financialAmountINR?: number;
  payload: Record<string, any>;
  status: 'PENDING_FOUNDER_APPROVAL' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}
