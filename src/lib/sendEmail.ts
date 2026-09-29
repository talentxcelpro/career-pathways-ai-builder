// src/lib/sendEmail.ts
/**
 * DEPRECATED: Legacy Email Dispatch Bridge
 * Redirects legacy sendTemplateEmail and sendImmediateTemplateEmail calls to the centralized
 * TalentXcel email infrastructure (/api/email/send & emailService).
 * Nodemailer and direct browser SMTP dependencies have been removed.
 */

import { emailService } from '@/services/email/emailService';
import type { EmailCategory } from '@/services/email/emailTypes';

interface TemplateEmailOptions {
  to: string;
  template_name: string;
  template_data?: Record<string, any>;
  from?: string;
  replyTo?: string;
}

interface QueueEmailOptions {
  to: string;
  subject: string;
  template: string;
  data?: Record<string, any>;
}

export async function sendTemplateEmail({ to, template_name, template_data = {} }: TemplateEmailOptions): Promise<boolean> {
  try {
    if (!to || !template_name) {
      throw new Error('Recipient and template name are required.');
    }

    const result = await emailService.send({
      to,
      recipientName: template_data?.name || template_data?.recipient_name || 'User',
      template: template_name,
      category: (template_data?._meta?.category as EmailCategory) || 'transactional',
      variables: template_data,
      priority: template_data?._meta?.priority || 2,
    });

    return result.success;
  } catch (error) {
    console.error('Legacy sendTemplateEmail error, redirected to centralized service:', error);
    return false;
  }
}

export async function queueTemplateEmail({ to, subject, template, data = {} }: QueueEmailOptions): Promise<boolean> {
  return sendTemplateEmail({
    to,
    template_name: template,
    template_data: { subject, ...data }
  });
}

export async function sendImmediateTemplateEmail({ to, subject, template, data = {} }: QueueEmailOptions): Promise<boolean> {
  return sendTemplateEmail({
    to,
    template_name: template,
    template_data: { subject, ...data }
  });
}

// DEPRECATED: Raw email sending functions
export const sendEmail = () => {
  throw new Error('DEPRECATED: Raw sendEmail() is disabled. All emails must route through centralized emailService.');
};

export const sendImmediateEmail = () => {
  throw new Error('DEPRECATED: Raw sendImmediateEmail() is disabled. All emails must route through centralized emailService.');
};