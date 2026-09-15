// src/agents/email/types.ts
// Production Type Definitions for TalentXcel Zoho Email Infrastructure
// Operating across 11 Authorised Mailboxes for Founder & CEO: Sanobar Jahan

export type ZohoMailboxId =
  | 'talentxcel'
  | 'admin'
  | 'support'
  | 'shelly'
  | 'sana'
  | 'raj'
  | 'arjun'
  | 'nikki'
  | 'meera'
  | 'ishaan'
  | 'zoya';

export type MailboxHealthStatus =
  | 'HEALTHY'
  | 'WARMING_UP'
  | 'RATE_LIMITED'
  | 'AUTH_REQUIRED'
  | 'PAUSED';

export interface MailboxDescriptor {
  id: ZohoMailboxId;
  email: string;
  displayName: string;
  department: string;
  autonomousRole: string;
  dailyLimit: number;
  sentTodayCount: number;
  hourlyLimit: number;
  sentThisHourCount: number;
  healthStatus: MailboxHealthStatus;
  bounceRatePct: number;
  activeThreadsCount: number;
  authorizedAgents: string[];
}

export type ReplyIntent =
  | 'INTERESTED'
  | 'NOT_INTERESTED'
  | 'UNSUBSCRIBE_STOP'
  | 'MEETING_REQUESTED'
  | 'PAYMENT_INTENT'
  | 'SUPPORT_REQUEST'
  | 'OUT_OF_OFFICE'
  | 'NEUTRAL_INQUIRY';

export interface OutboundEmailRequest {
  department: string;
  agentId: string;
  campaignId?: string;
  recipientEmail: string;
  recipientName?: string;
  companyName?: string;
  subject: string;
  htmlContent?: string;
  plainTextContent?: string;
  templateName?: string;
  templateVariables?: Record<string, any>;
  preferredMailbox?: ZohoMailboxId;
  threadId?: string;
  inReplyToMessageId?: string;
}

export interface InboundEmailMessage {
  id: string;
  mailboxId: ZohoMailboxId;
  fromEmail: string;
  fromName?: string;
  toEmail: string;
  subject: string;
  bodyText: string;
  bodyHtml?: string;
  receivedAt: string;
  messageId: string;
  inReplyToMessageId?: string;
  threadId?: string;
}

export interface EmailThread {
  id: string;
  recipientEmail: string;
  assignedMailbox: ZohoMailboxId;
  department: string;
  subject: string;
  messageCount: number;
  lastContactAt: string;
  status: 'ACTIVE' | 'CLOSED' | 'SUPPRESSED' | 'CONVERTED';
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  mailboxUsed: ZohoMailboxId;
  recipientEmail: string;
  timestamp: string;
  error?: string;
  providerResponse?: any;
}

export interface EmailAuditRecord {
  id: string;
  agentId: string;
  department: string;
  campaignId?: string;
  mailboxId: ZohoMailboxId;
  recipientEmail: string;
  subject: string;
  direction: 'OUTBOUND' | 'INBOUND';
  status: 'SENT' | 'DELIVERED' | 'REPLIED' | 'BOUNCED' | 'FAILED' | 'SUPPRESSED';
  classifiedIntent?: ReplyIntent;
  messageId?: string;
  timestamp: string;
  providerResponse?: any;
}
