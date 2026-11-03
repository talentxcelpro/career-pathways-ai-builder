/**
 * api/email/send.ts
 * POST /api/email/send
 *
 * Centralized Enterprise Serverless Email Dispatch Gateway for TalentXcel
 * Completely self-contained to ensure 100% reliable execution in Vercel Serverless environment.
 * 
 * Flow:
 * Validation -> Suppression Check -> Preference Check -> SES Immediate / Queue -> Audit Ledger
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { renderTemplate, escapeHtml, renderButton, baseEmailLayout } from '../../src/lib/email/templates';
export { renderTemplate, escapeHtml, renderButton, baseEmailLayout };

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURATION & CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const DOMAIN = 'talentxcel.in';
const CANONICAL_URL = 'https://talentxcel.in';
const DEFAULT_REGION = 'us-east-1';

const SUPABASE_URL =
  process.env.TX_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  'https://dthlgsnakhoftinssokm.supabase.co';

const SUPABASE_SERVICE_ROLE_KEY =
  process.env.TALENTXCEL_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  '';

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE ENGINE & HTML LAYOUT
// ─────────────────────────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'content-type, authorization');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const rawBody = req.body;
  const payload = typeof rawBody === 'string' ? JSON.parse(rawBody) : (rawBody || {});

  // Diagnostic GET for health monitoring
  if (req.method === 'GET') {
    let awsSdkAvailable = false;
    let nodemailerAvailable = false;
    try {
      await import('@aws-sdk/client-sesv2');
      awsSdkAvailable = true;
    } catch (_) {}
    try {
      await import('nodemailer');
      nodemailerAvailable = true;
    } catch (_) {}

    const emailMode = (process.env.EMAIL_MODE || 'console').toLowerCase();
    const hasAwsSdkKeys = !!((process.env.AWS_ACCESS_KEY_ID || process.env.AWS_SES_ACCESS_KEY_ID) && (process.env.AWS_SECRET_ACCESS_KEY || process.env.AWS_SES_SECRET_ACCESS_KEY));
    const hasSmtpKeys = !!((process.env.SMTP_PASS || process.env.SMTP_PASSWORD || process.env.AWS_SMTP_PASSWORD));

    return res.status(200).json({
      status: 'healthy',
      service: 'TalentXcel Email Dispatch Gateway',
      emailMode,
      hasAwsKeys: hasAwsSdkKeys || hasSmtpKeys,
      authMethod: hasAwsSdkKeys ? 'ses-sdk' : (hasSmtpKeys ? 'ses-smtp' : 'none'),
      awsSdkAvailable,
      nodemailerAvailable,
      region: process.env.AWS_REGION || DEFAULT_REGION,
      timestamp: new Date().toISOString()
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Authorization check for non-GET dispatch requests
  const authHeader = req.headers.authorization;
  const apiKeyHeader = req.headers['x-api-key'];
  const serviceKey = process.env.TALENTXCEL_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const cronSecret = process.env.CRON_SECRET;
  const isVercelCron = req.headers['x-vercel-cron'] === '1';

  // Public templates allowed without service role auth (e.g. public contact form enquiry)
  const isPublicContact = payload?.template === 'contact_enquiry';

  const isAuthorized =
    isVercelCron ||
    isPublicContact ||
    (serviceKey && (authHeader === `Bearer ${serviceKey}` || apiKeyHeader === serviceKey)) ||
    (cronSecret && authHeader === `Bearer ${cronSecret}`) ||
    (process.env.NODE_ENV === 'test' && authHeader === 'Bearer test-secret-token');

  if (!isAuthorized) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Valid service role key, API key, or cron secret required.'
    });
  }

  const startTime = Date.now();

  try {

    if (!payload?.to || !payload?.template) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: `to` and `template` are mandatory.'
      });
    }

    const cleanEmail = String(payload.to).toLowerCase().trim();
    const template = String(payload.template).trim();
    const variables = payload.variables || {};
    const priority = payload.priority ? Number(payload.priority) : 2;
    const immediate = payload.immediate === true || priority === 1;

    const serviceKey =
      process.env.TALENTXCEL_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SERVICE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.VITE_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      '';

    let supabase: any = null;
    if (serviceKey) {
      try {
        supabase = createClient(SUPABASE_URL, serviceKey, {
          auth: { persistSession: false }
        });
      } catch (err: any) {
        console.warn('⚠️ Supabase client init warning:', err?.message);
      }
    }

    // 1. Render deterministic HTML template
    const rendered = renderTemplate(template, variables, cleanEmail);

    // 2. Check suppression list (bounces / complaints)
    try {
      const { data: suppressed, error: suppErr } = supabase && await supabase.from('email_suppression_list')
        .select('id, reason, is_active')
        .eq('email_address', cleanEmail)
        .eq('is_active', true)
        .maybeSingle();

      if (suppErr) {
        console.warn('⚠️ Suppression query check error:', suppErr.message);
      } else if (suppressed) {
        return res.status(400).json({
          success: false,
          status: 'suppressed',
          error: `Recipient address ${cleanEmail} is suppressed (${suppressed.reason || 'bounce/complaint'})`
        });
      }
    } catch (suppErr: any) {
      console.warn('⚠️ Suppression check warning:', suppErr?.message);
    }

    // 3. Check user preferences for non-transactional emails
    if (rendered.category !== 'transactional') {
      try {
        const { data: prefs, error: prefErr } = supabase && await supabase.from('email_user_preferences')
          .select('unsubscribed_all_non_essential, email_marketing, email_product_updates')
          .eq('email', cleanEmail)
          .maybeSingle();

        if (prefs) {
          if (prefs.unsubscribed_all_non_essential) {
            return res.status(400).json({
              success: false,
              status: 'preference_blocked',
              error: `Recipient address ${cleanEmail} has unsubscribed from all non-essential communications`
            });
          }
          if (rendered.category === 'marketing' && prefs.email_marketing === false) {
            return res.status(400).json({
              success: false,
              status: 'preference_blocked',
              error: `Recipient address ${cleanEmail} has opted out of marketing communications`
            });
          }
        }
      } catch (prefErr: any) {
        console.warn('⚠️ Preference check warning:', prefErr?.message);
      }
    }

    // 3. Environment Resolution: Determine SES vs Console mode
    const emailMode = (process.env.EMAIL_MODE || 'console').toLowerCase();
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID || process.env.AWS_SES_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || process.env.AWS_SES_SECRET_ACCESS_KEY;
    const region = process.env.AWS_REGION || process.env.AWS_SES_REGION || DEFAULT_REGION;
    const fromAddress = payload.from?.fromEmail || `TalentXcel <noreply@${DOMAIN}>`;

    // Support both SES SDK (IAM Secret Key) and SES SMTP (SMTP Password)
    const smtpPass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD || process.env.AWS_SMTP_PASSWORD;
    const smtpUser = process.env.SMTP_USER || process.env.AWS_SMTP_USER || accessKeyId;
    const smtpHost = process.env.SMTP_HOST || `email-smtp.${region}.amazonaws.com`;
    const smtpPort = Number(process.env.SMTP_PORT) || 587;

    let dispatchResult: any = null;

    if (emailMode === 'ses' && accessKeyId && secretAccessKey) {
      // ─────────────────────────────────────────────────────────────
      // LIVE AMAZON SES DISPATCH VIA SES SDK (Production us-east-1)
      // ─────────────────────────────────────────────────────────────
      let sesSdk: any;
      try {
        sesSdk = await import('@aws-sdk/client-sesv2');
      } catch (sdkErr: any) {
        return res.status(500).json({
          success: false,
          error: `AWS SES SDK could not be loaded: ${sdkErr?.message || sdkErr}`,
          mode: 'ses'
        });
      }
      const { SESv2Client, SendEmailCommand } = sesSdk;

      const sesClient = new SESv2Client({
        region,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });

      const command = new SendEmailCommand({
        FromEmailAddress: fromAddress,
        Destination: {
          ToAddresses: [cleanEmail],
        },
        ReplyToAddresses: payload.replyTo ? [payload.replyTo] : [`support@${DOMAIN}`],
        Content: {
          Simple: {
            Subject: {
              Data: rendered.subject,
              Charset: 'UTF-8',
            },
            Body: {
              Html: {
                Data: rendered.html,
                Charset: 'UTF-8',
              },
              Text: {
                Data: rendered.plainText,
                Charset: 'UTF-8',
              },
            },
          },
        },
        EmailTags: [
          { Name: 'Category', Value: rendered.category },
          { Name: 'Template', Value: template },
          { Name: 'Platform', Value: 'TalentXcel' },
        ],
      });

      const sesResponse = await sesClient.send(command);
      const durationMs = Date.now() - startTime;

      dispatchResult = {
        success: true,
        status: 'sent',
        mode: 'ses-sdk',
        messageId: sesResponse.MessageId,
        recipient: cleanEmail,
        subject: rendered.subject,
        durationMs,
        timestamp: new Date().toISOString()
      };

      // Record in audit ledger
      try {
        supabase && await supabase.from('email_audit_ledger').insert({
          event_type: 'sent',
          recipient_email: cleanEmail,
          category: rendered.category,
          template_name: template,
          provider_message_id: sesResponse.MessageId,
          delivery_status: 'delivered',
          metadata: {
            priority,
            mode: 'ses-sdk',
            durationMs,
            subject: rendered.subject
          },
          created_at: new Date().toISOString()
        });
      } catch (ledgerErr: any) {
        console.warn('⚠️ Audit ledger logging non-fatal warning:', ledgerErr?.message);
      }

      return res.status(200).json(dispatchResult);

    } else if (emailMode === 'ses' && smtpUser && smtpPass) {
      // ─────────────────────────────────────────────────────────────
      // LIVE AMAZON SES DISPATCH VIA SES SMTP (Production us-east-1)
      // ─────────────────────────────────────────────────────────────
      let nodemailer: any;
      try {
        const mod = await import('nodemailer');
        nodemailer = mod.default || mod;
      } catch (smtpErr: any) {
        return res.status(500).json({
          success: false,
          error: `Nodemailer could not be loaded: ${smtpErr?.message || smtpErr}`,
          mode: 'ses-smtp'
        });
      }

      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: false, // port 587 uses STARTTLS
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const mailOptions = {
        from: fromAddress,
        to: cleanEmail,
        replyTo: payload.replyTo || `support@${DOMAIN}`,
        subject: rendered.subject,
        html: rendered.html,
        text: rendered.plainText,
        headers: {
          'X-SES-CONFIGURATION-SET': 'talentxcel-production',
          'X-TalentXcel-Category': rendered.category,
          'X-TalentXcel-Template': template
        }
      };

      const info = await transporter.sendMail(mailOptions);
      const durationMs = Date.now() - startTime;

      dispatchResult = {
        success: true,
        status: 'sent',
        mode: 'ses-smtp',
        messageId: info.messageId,
        recipient: cleanEmail,
        subject: rendered.subject,
        durationMs,
        timestamp: new Date().toISOString()
      };

      // Record in audit ledger
      try {
        supabase && await supabase.from('email_audit_ledger').insert({
          event_type: 'sent',
          recipient_email: cleanEmail,
          category: rendered.category,
          template_name: template,
          provider_message_id: info.messageId,
          delivery_status: 'delivered',
          metadata: {
            priority,
            mode: 'ses-smtp',
            durationMs,
            subject: rendered.subject
          },
          created_at: new Date().toISOString()
        });
      } catch (ledgerErr: any) {
        console.warn('⚠️ Audit ledger logging non-fatal warning:', ledgerErr?.message);
      }

      return res.status(200).json(dispatchResult);

    } else if (emailMode === 'ses') {
      // Config error: ses requested but both SDK keys and SMTP keys are missing
      return res.status(500).json({
        success: false,
        error: 'EMAIL_MODE=ses is configured, but credentials are missing. Provide either AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY or SMTP_USER + SMTP_PASS.',
        emailMode
      });

    } else {
      // ─────────────────────────────────────────────────────────────
      // CONSOLE / DEV / QUEUE FALLBACK MODE
      // ─────────────────────────────────────────────────────────────
      const fakeMessageId = `console_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const durationMs = Date.now() - startTime;

      // Enqueue to database queue for record
      let queueId = null;
      try {
        const { data: queued } = await supabase
          .from('email_automation_queue')
          .insert({
            trigger_type: template,
            recipient_email: cleanEmail,
            recipient_name: payload.recipientName || 'User',
            template_data: variables,
            category: rendered.category,
            priority,
            status: immediate ? 'sent' : 'pending',
            created_at: new Date().toISOString()
          })
          .select('id')
          .maybeSingle();

        if (queued) queueId = queued.id;
      } catch (_) {}

      return res.status(200).json({
        success: true,
        status: immediate ? 'sent' : 'pending',
        mode: 'console',
        messageId: fakeMessageId,
        queueId,
        recipient: cleanEmail,
        subject: rendered.subject,
        durationMs,
        note: 'EMAIL_MODE is set to console. Set EMAIL_MODE=ses with AWS keys in Vercel to dispatch live SES.'
      });
    }

  } catch (err: any) {
    console.error('❌ Email dispatch gateway error:', err?.message);
    return res.status(500).json({
      success: false,
      error: err?.message || 'Internal Email Gateway Error',
      durationMs: Date.now() - startTime
    });
  }
}
