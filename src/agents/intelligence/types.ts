// src/agents/intelligence/types.ts
// Production Type Definitions for TalentXcel External Intelligence & Prospect Store

export type ExternalSourceCategory =
  | 'public_career_page'
  | 'permitted_job_registry'
  | 'company_announcements'
  | 'funding_expansion_signal'
  | 'startup_ecosystem'
  | 'university_placement_bulletin'
  | 'public_business_directory';

export type SignalType =
  | 'NEW_VACANCY'
  | 'HIRING_ACCELERATION'
  | 'NEW_AI_STARTUP'
  | 'EXPANSION_SIGNAL'
  | 'FUNDING_SIGNAL'
  | 'COLLEGE_PLACEMENT_SIGNAL'
  | 'RECRUITER_ACTIVITY';

export type OutreachStatus =
  | 'DISCOVERED'
  | 'VERIFIED'
  | 'QUALIFIED'
  | 'ELIGIBLE_FOR_OUTREACH'
  | 'QUEUED'
  | 'SENT'
  | 'DELIVERED'
  | 'REPLIED'
  | 'INTERESTED'
  | 'MEETING_PENDING'
  | 'CONVERTED'
  | 'SUPPRESSED'
  | 'FAILED';

export interface ExternalProspectRecord {
  id: string;
  source: ExternalSourceCategory;
  source_url: string;
  discovered_at: string;
  company_name: string;
  company_domain: string;
  company_location: string;
  signal_type: SignalType;
  signal_strength: number; // 0 - 100
  signal_timestamp: string;
  job_count: number;
  relevant_roles: string[];
  contact_name: string;
  contact_role: string;
  permitted_contact_channel: string; // e.g. "talent@domain.com"
  contact_source: string;
  opportunity_score: number; // 0 - 100
  assigned_agent: string;
  assigned_mailbox: string;
  outreach_status: OutreachStatus;
  suppression_status: 'CLEAN' | 'SUPPRESSED';
  provider_message_id?: string;
  sent_at?: string;
  inbound_reply_intent?: string;
  conversion_notes?: string;
}

export interface ExternalIntelligenceMetrics {
  sourcesConnected: number;
  sourcesHealthy: number;
  externalRecordsDiscovered: number;
  newSignalsToday: number;
  companiesDiscovered: number;
  companiesVerified: number;
  contactsDiscovered: number;
  highIntentOpportunities: number;
  eligibleForOutreach: number;
}

export interface OutreachExecutionMetrics {
  queued: number;
  sent: number; // Verified Zoho Provider Message IDs
  delivered: number;
  bounced: number;
  replies: number;
  interested: number;
  meetings: number;
  converted: number;
  revenueUSD: number;
}
