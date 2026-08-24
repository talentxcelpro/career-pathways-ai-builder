// src/agents/core/types.ts
// Production Types for TalentXcel Autonomous Business OS Core
// Operating for Founder & CEO: Sanobar Jahan

export type DepartmentType =
  | 'executive'
  | 'growth_marketing'
  | 'employer'
  | 'jobs'
  | 'candidates'
  | 'colleges'
  | 'claim1'
  | 'revenue'
  | 'product_engineering';

export type WorkerLifecycleStatus =
  | 'RUNNING'
  | 'IDLE'
  | 'WAITING'
  | 'BLOCKED'
  | 'WAITING_FOR_AUTH'
  | 'WAITING_FOR_HUMAN'
  | 'ERROR'
  | 'DISABLED';

export type AuthorityLevel =
  | 0 // Level 0: Safe internal operations (dedup, hygiene, scoring, indexing)
  | 1 // Level 1: Automatic outbound with strict limits (email, notifications)
  | 2 // Level 2: Founder approval required (ad spend, discounts, refunds)
  | 3; // Level 3: Human only (legal agreements, MOUs, sensitive changes)

export type ChannelStatus = 'ACTIVE' | 'DEMO' | 'BLOCKED' | 'MANUAL_REQUIRED' | 'DISABLED';

export interface ChannelDescriptor {
  id: string;
  name: string;
  category: 'direct_outreach' | 'search' | 'social' | 'community' | 'payment' | 'internal';
  status: ChannelStatus;
  statusDetails: string;
  rateLimitPerHour: number;
  dailyBudgetCapINR: number;
  requiresFounderApproval: boolean;
  requiredSecrets: string[];
  missingSecrets: string[];
  allowedAgents: string[];
}

export interface BusinessKPIState {
  usersTotal: number;
  usersAcquiredToday: number;
  employersTotal: number;
  employersAcquiredToday: number;
  companiesTotal: number;
  jobsActiveTotal: number;
  jobsAddedToday: number;
  collegesTotal: number;
  claim1ClaimedCount: number;
  claim1ActiveBids: number;
  claim1ReclaimRate48hPct: number;
  platformRevenueINR: number;
  revenueGeneratedTodayINR: number;
  mrrINR: number;
  cacINR: number;
  ltvINR: number;
  actionsTodayCount: number;
  successfulActionsCount: number;
  failedActionsCount: number;
  blockedActionsCount: number;
  founderEscalationsCount: number;
}

export interface StrategicGoal {
  id: string;
  title: string;
  department: DepartmentType;
  targetMetric: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  deadlineIso: string;
  status: 'ON_TRACK' | 'AT_RISK' | 'BEHIND' | 'COMPLETED';
}

export interface AttributionRecord {
  id: string;
  userId?: string;
  entityId?: string;
  agentId: string;
  department: DepartmentType;
  channelId: string;
  utmSource?: string;
  utmCampaign?: string;
  conversionType: 'REGISTRATION' | 'JOB_APPLICATION' | 'PROFILE_CLAIM' | 'BID_PLACED' | 'PAYMENT' | 'PARTNERSHIP';
  revenueAmountINR: number;
  timestamp: string;
}
