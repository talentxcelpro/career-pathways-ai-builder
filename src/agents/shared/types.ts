// src/agents/shared/types.ts
// Core Type Definitions for the TalentXcel Autonomous Business OS Kernel

export type AgentStatus = 'IDLE' | 'RUNNING' | 'WAITING' | 'PAUSED' | 'ERROR';

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
  // Candidate & Student Events
  | 'CANDIDATE_REGISTERED'
  | 'RESUME_CREATED'
  | 'PASSPORT_VERIFIED'
  | 'APPLICATION_SUBMITTED'
  // College Events
  | 'COLLEGE_PARTNERSHIP_INITIATED'
  | 'COLLEGE_MOU_SIGNED'
  | 'STUDENT_COHORT_ONBOARDED'
  // Revenue & Marketing Events
  | 'REVENUE_COLLECTED'
  | 'CAMPAIGN_EXECUTED'
  | 'OUTREACH_SENT'
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
  status: 'ACTIVE' | 'ACHIEVED' | 'MISSED';
}

export interface AgentAuditRecord {
  id: string;
  agentName: string;
  action: string;
  details: Record<string, any>;
  timestamp: string;
  success: boolean;
  error?: string;
}

export interface GuardrailConfig {
  maxDailyOutreach: number;
  maxContactsPerProspect: number;
  requireHumanApprovalForSpend: boolean;
  maxAutonomousBidAmountINR: number;
  rateLimitPerMinute: number;
}
