// src/hooks/useEmailService.ts
/**
 * React Hook for TalentXcel Centralized Email Service
 * Routes all client-triggered emails through the centralized email architecture.
 * Ensures zero credentials exposed in browser, checks suppressions/preferences,
 * and maintains audit integrity.
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { EmailPriority, type EmailCategory, type EmailJobPayload } from '@/services/email/emailTypes';

export interface SendEmailOptions {
  to: string;
  template: string;
  category?: EmailCategory;
  priority?: EmailPriority;
  variables?: Record<string, any>;
  recipientName?: string;
  idempotencyKey?: string;
  userId?: string;
}

export const useEmailService = () => {
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Enqueues or dispatches an email via the centralized API Gateway
   */
  const sendEmail = useCallback(async (options: SendEmailOptions): Promise<boolean> => {
    setIsLoading(true);
    const cleanEmail = options.to?.toLowerCase().trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      toast.error('Please provide a valid recipient email address');
      setIsLoading(false);
      return false;
    }

    const payload: EmailJobPayload = {
      to: cleanEmail,
      recipientName: options.recipientName || 'User',
      template: options.template,
      category: options.category || 'transactional',
      priority: options.priority || EmailPriority.NORMAL,
      variables: options.variables || {},
      idempotencyKey: options.idempotencyKey,
      userId: options.userId,
    };

    try {
      // 1. Primary: Dispatch via Serverless Gateway (/api/email/send)
      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.status === 'suppressed') {
          toast.warning('Recipient is in the suppression list (bounced/complaint).');
          return false;
        }
        if (data.status === 'preference_blocked') {
          console.log('Recipient has opted out of this category.');
          return false;
        }
        return true;
      }

      // 2. Fallback: Direct Database RPC enqueue if API route is unreachable
      console.warn('⚠️ Serverless email endpoint unreachable, falling back to database queue RPC');
      const { data: queueId, error: rpcError } = await supabase.rpc('enqueue_idempotent_email', {
        p_trigger_type: payload.template,
        p_recipient_email: payload.to,
        p_recipient_name: payload.recipientName,
        p_template_data: payload.variables,
        p_category: payload.category,
        p_priority: payload.priority || 3,
        p_idempotency_key: payload.idempotencyKey || null,
        p_user_id: payload.userId || null,
      });

      if (rpcError) {
        console.error('❌ Database fallback queue error:', rpcError.message);
        throw rpcError;
      }

      return !!queueId;
    } catch (err: any) {
      console.error('❌ Email dispatch error:', err.message);
      toast.error(err.message || 'Failed to dispatch email');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    sendEmail,
    isLoading,
  };
};

/**
 * Common high-level email triggers
 */
export const emailUtils = {
  welcomeEmail: async (userEmail: string, userName: string, userId?: string) => {
    try {
      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: userEmail,
          recipientName: userName,
          template: 'welcome',
          category: 'transactional',
          priority: EmailPriority.HIGH,
          userId,
          idempotencyKey: `welcome_${userId || userEmail}`,
          variables: { firstName: userName },
        }),
      });
      return res.ok;
    } catch (_) {
      return false;
    }
  },

  jobMatchEmail: async (
    userEmail: string,
    job: { title: string; company: string; location?: string; salary?: string },
    userName?: string,
    userId?: string
  ) => {
    try {
      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: userEmail,
          recipientName: userName,
          template: 'job_match',
          category: 'product_notification',
          priority: EmailPriority.NORMAL,
          userId,
          variables: {
            firstName: userName || 'there',
            jobTitle: job.title,
            companyName: job.company,
            location: job.location,
            salaryRange: job.salary,
          },
        }),
      });
      return res.ok;
    } catch (_) {
      return false;
    }
  },

  applicationConfirmation: async (
    userEmail: string,
    jobTitle: string,
    companyName: string,
    applicationId: string,
    userName?: string,
    userId?: string
  ) => {
    try {
      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: userEmail,
          recipientName: userName,
          template: 'application_confirmation',
          category: 'transactional',
          priority: EmailPriority.HIGH,
          userId,
          idempotencyKey: `app_conf_${applicationId}`,
          variables: {
            candidateName: userName || 'there',
            jobTitle,
            companyName,
            applicationId,
          },
        }),
      });
      return res.ok;
    } catch (_) {
      return false;
    }
  },
};