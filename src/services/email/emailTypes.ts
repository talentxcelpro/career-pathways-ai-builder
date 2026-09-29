// src/services/email/emailTypes.ts
/**
 * Production-grade Email Infrastructure Type Definitions for TalentXcel
 * SES Limits: 50,000 emails/day, 14 emails/second
 * Domain: talentxcel.in (us-east-1)
 */

export type EmailCategory = 
  | 'transactional'           // Essential: Verification, Password Reset, Security, Applications
  | 'product_notification'    // Matches, alerts, recruiter/candidate communications
  | 'engagement'              // Recommendations, progress, digests
  | 'marketing';             // Announcements, promotions (strict unsubscribe mandatory)

export enum EmailPriority {
  CRITICAL = 1,  // Password reset, OTP, security breaches, immediate auth
  HIGH = 2,      // Application status change, urgent recruiter response
  NORMAL = 3,    // Job match notifications, daily digest
  LOW = 4,       // Weekly digest, product updates, general marketing
}

export type EmailStatus = 
  | 'pending'
  | 'processing'
  | 'sent'
  | 'failed'
  | 'suppressed'
  | 'rate_limited'
  | 'frequency_capped'
  | 'preference_blocked'
  | 'bounced'
  | 'complained'
  | 'cancelled';

export interface EmailSenderConfig {
  fromEmail: string;
  fromName: string;
  replyTo?: string;
}

export interface EmailJobPayload {
  to: string;
  recipientName?: string;
  template: string;
  variables: Record<string, any>;
  category: EmailCategory;
  priority?: EmailPriority;
  from?: EmailSenderConfig;
  replyTo?: string;
  idempotencyKey?: string;
  userId?: string;
  scheduledAt?: Date;
  metadata?: Record<string, any>;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  status: EmailStatus;
  mode?: 'ses' | 'console';
  error?: string;
  attempts?: number;
  statusCode?: number;
  durationMs?: number;
}

export interface RenderedEmail {
  subject: string;
  html: string;
  plainText: string;
  headers?: Record<string, string>;
}

export interface UserEmailPreferences {
  userId: string;
  email: string;
  email_job_alerts: boolean;
  email_job_matches: boolean;
  email_application_updates: boolean;
  email_career_recommendations: boolean;
  email_product_updates: boolean;
  email_marketing: boolean;
  email_weekly_digest: boolean;
  frequency_cap_daily: number;
  unsubscribed_all_non_essential: boolean;
  unsubscribe_token?: string;
  unsubscribed_at?: string;
}

export interface SuppressionRecord {
  email: string;
  suppressionType: 'bounce' | 'complaint' | 'manual';
  reason?: string;
  bounceType?: string;
  bounceSubtype?: string;
  isActive: boolean;
  createdAt: string;
}

export interface EmailAuditEntry {
  recipientEmail: string;
  userId?: string;
  category: EmailCategory;
  templateName: string;
  subject: string;
  priority: EmailPriority;
  status: EmailStatus;
  providerMessageId?: string;
  errorMessage?: string;
  idempotencyKey?: string;
  metadata?: Record<string, any>;
}

export interface FrequencyCheckResult {
  allowed: boolean;
  reason?: string;
  shouldAggregate?: boolean;
  aggregatedPayload?: EmailJobPayload;
}

export interface SESEventNotification {
  eventType: 'Send' | 'Delivery' | 'Bounce' | 'Complaint' | 'Reject' | 'Open' | 'Click';
  mail: {
    messageId: string;
    source: string;
    destination: string[];
    timestamp: string;
  };
  bounce?: {
    bounceType: 'Undetermined' | 'Permanent' | 'Transient';
    bounceSubType: string;
    bouncedRecipients: Array<{
      emailAddress: string;
      action?: string;
      status?: string;
      diagnosticCode?: string;
    }>;
    timestamp: string;
    feedbackId: string;
  };
  complaint?: {
    complainedRecipients: Array<{
      emailAddress: string;
    }>;
    complaintFeedbackType?: string;
    complaintSubType?: string;
    timestamp: string;
    feedbackId: string;
  };
  delivery?: {
    timestamp: string;
    processingTimeMillis: number;
    recipients: string[];
    smtpResponse: string;
  };
}
