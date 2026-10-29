/**
 * api/email/process-queue.ts
 * POST / GET /api/email/process-queue
 *
 * Serverless worker to process the prioritized email queue.
 * Dispatches pending emails strictly respecting rate limiting, authentication, suppression, and retries.
 * Completely self-contained for 100% reliable execution in Vercel Serverless environment.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { renderTemplate } from './_send';

const DOMAIN = 'talentxcel.in';
const DEFAULT_REGION = 'us-east-1';

const SUPABASE_URL =
  process.env.TX_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  'https://dthlgsnakhoftinssokm.supabase.co';

const SUPABASE_KEY =
  process.env.TALENTXCEL_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  '';

export const config = { maxDuration: 60 };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'content-type, authorization');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // 1. Mandatory Authorization Check (Cron Secret, Vercel Cron, or Service Role Key)
  const authHeader = req.headers.authorization;
  const isVercelCron = req.headers['x-vercel-cron'] === '1';
  const expectedSecret = process.env.CRON_SECRET;
  const serviceKey = process.env.TALENTXCEL_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  const isAuthorized =
    isVercelCron ||
    (expectedSecret && authHeader === `Bearer ${expectedSecret}`) ||
    (serviceKey && authHeader === `Bearer ${serviceKey}`) ||
    (process.env.NODE_ENV === 'test' && authHeader === 'Bearer test-secret-token');

  if (!isAuthorized) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Missing or invalid queue processor authorization token'
    });
  }

  const startTime = Date.now();
  const batchSize = req.query?.batchSize ? parseInt(req.query.batchSize as string, 10) : 25;

  const emailMode = (process.env.EMAIL_MODE || 'console').toLowerCase();
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID || process.env.AWS_SES_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || process.env.AWS_SES_SECRET_ACCESS_KEY;
  const region = process.env.AWS_REGION || process.env.AWS_SES_REGION || DEFAULT_REGION;

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false }
    });

    const nowIso = new Date().toISOString();
    const { data: pendingJobs, error } = await supabase
      .from('email_automation_queue')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_at', nowIso)
      .lt('retry_count', 3)
      .order('priority', { ascending: true })
      .order('created_at', { ascending: true })
      .limit(Math.min(batchSize, 50));

    if (error) {
      return res.status(500).json({
        success: false,
        error: `Failed to query queue: ${error.message}`,
        durationMs: Date.now() - startTime
      });
    }

    if (!pendingJobs || pendingJobs.length === 0) {
      return res.status(200).json({
        success: true,
        processed: 0,
        sent: 0,
        suppressed: 0,
        preferenceBlocked: 0,
        failed: 0,
        durationMs: Date.now() - startTime,
        message: 'Queue is currently empty.'
      });
    }

    let sent = 0;
    let suppressedCount = 0;
    let preferenceBlockedCount = 0;
    let failed = 0;

    let sesClient: any = null;
    let SendEmailCommand: any = null;

    if (emailMode === 'ses' && accessKeyId && secretAccessKey) {
      try {
        const sesSdk = await import('@aws-sdk/client-sesv2');
        sesClient = new sesSdk.SESv2Client({
          region,
          credentials: { accessKeyId, secretAccessKey }
        });
        SendEmailCommand = sesSdk.SendEmailCommand;
      } catch (err: any) {
        console.warn('⚠️ Could not load AWS SES SDK in worker:', err?.message);
      }
    }

    for (let i = 0; i < pendingJobs.length; i++) {
      const job = pendingJobs[i];
      const cleanEmail = (job.recipient_email || '').toLowerCase().trim();

      // Paced rate limiting: 125ms delay between consecutive requests (max 8/sec)
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 125));
      }

      try {
        // Mark as processing
        await supabase
          .from('email_automation_queue')
          .update({ status: 'processing', updated_at: new Date().toISOString() })
          .eq('id', job.id);

        // Pre-send check 1: Active Suppression List
        const { data: suppressed } = await supabase
          .from('email_suppression_list')
          .select('id, reason')
          .eq('email_address', cleanEmail)
          .eq('is_active', true)
          .maybeSingle();

        if (suppressed) {
          await supabase
            .from('email_automation_queue')
            .update({
              status: 'suppressed',
              error_message: `Recipient is in active suppression list (${suppressed.reason || 'bounce/complaint'})`,
              updated_at: new Date().toISOString()
            })
            .eq('id', job.id);

          try {
            await supabase.from('email_audit_ledger').insert({
              recipient_email: cleanEmail,
              user_id: job.user_id,
              category: job.category || 'transactional',
              template_name: job.trigger_type,
              subject: job.template_data?.subject || job.trigger_type,
              priority: job.priority || 3,
              status: 'suppressed',
              error_message: 'Recipient is in active suppression list',
              idempotency_key: job.idempotency_key,
              metadata: job.template_data || {}
            });
          } catch (_) {}

          suppressedCount++;
          continue;
        }

        // Pre-send check 2: User Email Preferences for non-transactional emails
        const category = job.category || 'transactional';
        if (category !== 'transactional') {
          const { data: prefs } = await supabase
            .from('email_user_preferences')
            .select('unsubscribed_all_non_essential, email_marketing')
            .eq('email', cleanEmail)
            .maybeSingle();

          if (prefs?.unsubscribed_all_non_essential || (category === 'marketing' && prefs?.email_marketing === false)) {
            await supabase
              .from('email_automation_queue')
              .update({
                status: 'preference_blocked',
                error_message: 'Recipient opted out of non-essential communications',
                updated_at: new Date().toISOString()
              })
              .eq('id', job.id);

            try {
              await supabase.from('email_audit_ledger').insert({
                recipient_email: cleanEmail,
                user_id: job.user_id,
                category,
                template_name: job.trigger_type,
                subject: job.template_data?.subject || job.trigger_type,
                priority: job.priority || 3,
                status: 'preference_blocked',
                error_message: 'Recipient preferences blocked dispatch',
                idempotency_key: job.idempotency_key,
                metadata: job.template_data || {}
              });
            } catch (_) {}

            preferenceBlockedCount++;
            continue;
          }
        }

        // Render full dynamic template
        const rendered = renderTemplate(job.trigger_type, job.template_data || {}, cleanEmail);

        let messageId = `console_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

        if (sesClient && SendEmailCommand && emailMode === 'ses') {
          const fromAddress = `TalentXcel <noreply@${DOMAIN}>`;
          const command = new SendEmailCommand({
            FromEmailAddress: fromAddress,
            Destination: { ToAddresses: [cleanEmail] },
            ReplyToAddresses: [`support@${DOMAIN}`],
            Content: {
              Simple: {
                Subject: { Data: rendered.subject, Charset: 'UTF-8' },
                Body: {
                  Html: { Data: rendered.html, Charset: 'UTF-8' },
                  Text: { Data: rendered.plainText, Charset: 'UTF-8' }
                }
              }
            },
            EmailTags: [
              { Name: 'Category', Value: rendered.category },
              { Name: 'Template', Value: job.trigger_type },
              { Name: 'Platform', Value: 'TalentXcel' }
            ]
          });
          const response = await sesClient.send(command);
          messageId = response.MessageId;
        }

        // Mark as sent
        await supabase
          .from('email_automation_queue')
          .update({
            status: 'sent',
            provider_message_id: messageId,
            sent_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', job.id);

        // Record in ledger
        try {
          await supabase.from('email_audit_ledger').insert({
            recipient_email: cleanEmail,
            user_id: job.user_id,
            category: rendered.category,
            template_name: job.trigger_type,
            subject: rendered.subject,
            priority: job.priority || 3,
            status: 'sent',
            provider_message_id: messageId,
            idempotency_key: job.idempotency_key,
            metadata: {
              mode: emailMode,
              processedAt: new Date().toISOString()
            }
          });
        } catch (_) {}

        sent++;
      } catch (jobErr: any) {
        failed++;
        const nextRetry = (job.retry_count || 0) + 1;
        const newStatus = nextRetry >= 3 ? 'failed' : 'pending';
        // Exponential backoff delay for retries: 5 mins, 20 mins
        const delayMinutes = nextRetry === 1 ? 5 : 20;

        await supabase
          .from('email_automation_queue')
          .update({
            status: newStatus,
            last_error: jobErr?.message,
            retry_count: nextRetry,
            scheduled_at: new Date(Date.now() + delayMinutes * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', job.id);
      }
    }

    return res.status(200).json({
      success: true,
      processed: pendingJobs.length,
      sent,
      suppressed: suppressedCount,
      preferenceBlocked: preferenceBlockedCount,
      failed,
      emailMode,
      durationMs: Date.now() - startTime,
      timestamp: new Date().toISOString()
    });

  } catch (err: any) {
    console.error('❌ Queue processing worker error:', err?.message);
    return res.status(500).json({
      success: false,
      error: err?.message,
      durationMs: Date.now() - startTime
    });
  }
}
