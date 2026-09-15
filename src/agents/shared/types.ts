// src/agents/shared/types.ts
// Complete Type Definitions for the TalentXcel Autonomous Business OS Kernel V1

export type AgentStatus = 'IDLE' | 'RUNNING' | 'BLOCKED' | 'ERROR' | 'PAUSED';

export type BusinessEventType =
  // Company & Employer Events
  | 'COMPANY_DISCOVERED'
  | 'COMPANY_QUALIFIED'
  | 'COMPANY_REGISTERED'
  | 'COMPANY_POSTED_JOB'
  | 'COMPANY_INACTIVE'
  // Claim #1 Events
  | 'CLAIM1_PROFILE_CLAIMED'
  | 'CLAIM1_BID_PLACED'
  | 'CLAIM1_ENTITY_OUTBID'
  | 'CLAIM1_RANK_RECLAIMED'
  | 'CLAIM1_BADGE_EMBEDDED'
  | 'CLAIM1_WATCHER_SUBSCRIBED'
  // Jobs & Ingestion Events
  | 'JOB_DISCOVERED'
  | 'JOB_INGESTED'
  | 'JOB_EXPIRED'
  | 'JOB_DEDUPED'
  // Candidate & Student Events
  | 'CANDIDATE_REGISTERED'
  | 'RESUME_CREATED'
  | 'PASSPORT_VERIFIED'
  | 'APPLICATION_SUBMITTED'
  // College Events
  | 'COLLEGE_DISCOVERED'
  | 'COLLEGE_QUALIFIED'
  | 'COLLEGE_PARTNERSHIP_INITIATED'
  | 'COLLEGE_MOU_SIGNED'
  | 'STUDENT_COHORT_ONBOARDED'
  // Revenue & Marketing Events
  | 'REVENUE_COLLECTED'
  | 'PAYMENT_CAPTURED'
  | 'PAYMENT_MISMATCH_DETECTED'
  | 'CAMPAIGN_TRIGGERED'
  | 'OUTREACH_SENT'
  | 'EMAIL_SENT'
  | 'EMAIL_DELIVERED'
  | 'EMAIL_BOUNCED'
  | 'EMAIL_REPLIED'
  | 'CONVERSION_RECORDED';

export interface BusinessEvent<T = any> {
  id: string;
  type: BusinessEventType;
  payload: T;
  sourceAgent: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export type EventHandler<T = any> = (event: BusinessEvent<T>) => Promise<void> | void;

export interface AgentObjective {
  id: string;
  title: string;
  targetMetric: string;
  targetValue: number;
  currentValue: number;
  deadline?: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  ownerAgent: string;
  status: 'ACTIVE' | 'ACHIEVED' | 'BLOCKED';
  requiredActions: string[];
  blockingConditions?: string[];
  successCondition: string;
}

export interface AgentAuditRecord {
  id: string;
  agentName: string;
  action: string;
  toolCalled?: string;
  inputs?: Record<string, any>;
  outputs?: Record<string, any>;
  durationMs?: number;
  timestamp: string;
  success: boolean;
  error?: string;
  entityAffected?: string;
}

export interface GuardrailConfig {
  maxDailyOutreach: number;
  maxContactsPerProspect: number;
  requireHumanApprovalForSpend: boolean;
  maxAutonomousBidAmountINR: number;
  rateLimitPerMinute: number;
  cooldownDays: number;
  monthlyBudgetCapINR: number;
}

export interface AgentInfo {
  name: string;
  role: string;
  status: AgentStatus;
  statusReason?: string;
  currentObjective: string;
  actionsToday: number;
  errorsToday: number;
  lastActiveAt: string | null;
  tools: string[];
}
