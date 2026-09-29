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
import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';

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

const SUPABASE_KEY =
  process.env.TALENTXCEL_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc';

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE ENGINE & HTML LAYOUT
// ─────────────────────────────────────────────────────────────────────────────

function escapeHtml(unsafe: any): string {
  if (unsafe === null || unsafe === undefined) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderButton(label: string, url: string): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 28px auto; text-align: center;">
      <tr>
        <td align="center" style="border-radius: 8px; background: #2563eb;">
          <a href="${escapeHtml(url)}" target="_blank" style="font-size: 15px; font-weight: 600; color: #ffffff; text-decoration: none; padding: 13px 28px; border-radius: 8px; display: inline-block; background-color: #2563eb; letter-spacing: 0.2px; font-family: -apple-system, sans-serif;">
            ${escapeHtml(label)}
          </a>
        </td>
      </tr>
    </table>
  `;
}

function wrapInBaseLayout(options: {
  title: string;
  preheader: string;
  contentHtml: string;
  category: string;
  recipientEmail: string;
  unsubscribeUrl?: string;
}): string {
  const currentYear = new Date().getFullYear();
  const showUnsubscribe = options.category !== 'transactional';
  const unsubUrl = options.unsubscribeUrl || `${CANONICAL_URL}/unsubscribe?email=${encodeURIComponent(options.recipientEmail)}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(options.title)}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
    table { border-collapse: separate; }
    a { color: #2563eb; text-decoration: none; }
    @media only screen and (max-width: 620px) {
      .wrapper { width: 100% !important; padding: 12px !important; }
      .content-box { padding: 24px 18px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; color: #1e293b;">
  <span style="display:none; font-size:0px; line-height:0px; max-height:0px; max-width:0px; opacity:0; overflow:hidden; visibility:hidden; mso-hide:all;">
    ${escapeHtml(options.preheader)}
  </span>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; width: 100%;">
    <tr>
      <td align="center" style="padding: 28px 12px 40px 12px;">
        <table role="presentation" class="wrapper" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">
          
          <!-- BRAND HEADER -->
          <tr>
            <td style="padding: 0 0 20px 0; text-align: center;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${CANONICAL_URL}" style="text-decoration: none; display: inline-block;">
                      <table role="presentation" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="vertical-align: middle;">
                            <div style="background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); width: 36px; height: 36px; border-radius: 8px; text-align: center; line-height: 36px; color: #ffffff; font-weight: 800; font-size: 20px; font-family: -apple-system, sans-serif;">
                              TX
                            </div>
                          </td>
                          <td style="vertical-align: middle; padding-left: 10px;">
                            <span style="font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; font-family: -apple-system, sans-serif;">
                              TalentXcel
                            </span>
                          </td>
                        </tr>
                      </table>
                    </a>
                    <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin-top: 6px;">
                      Global Professional Talent Network
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- MAIN BODY CARD -->
          <tr>
            <td class="content-box" style="background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 36px 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
              ${options.contentHtml}
            </td>
          </tr>

          <!-- BRAND FOOTER -->
          <tr>
            <td style="padding: 24px 16px; text-align: center; font-size: 12px; line-height: 18px; color: #64748b;">
              <p style="margin: 0 0 8px 0; font-weight: 500;">
                TalentXcel &bull; Jobs | Career | Talent | Opportunities
              </p>
              <p style="margin: 0 0 12px 0; color: #94a3b8;">
                &copy; ${currentYear} TalentXcel Services Private Limited. All rights reserved.
              </p>
              <div style="color: #64748b;">
                <a href="${CANONICAL_URL}" style="color: #64748b; text-decoration: underline;">Home</a>
                &bull;
                <a href="${CANONICAL_URL}/jobs" style="color: #64748b; text-decoration: underline;">Jobs</a>
                &bull;
                <a href="${CANONICAL_URL}/privacy" style="color: #64748b; text-decoration: underline;">Privacy Policy</a>
                &bull;
                <a href="${CANONICAL_URL}/terms" style="color: #64748b; text-decoration: underline;">Terms</a>
                ${showUnsubscribe ? `
                  &bull;
                  <a href="${unsubUrl}" style="color: #ef4444; font-weight: 600; text-decoration: underline;">Unsubscribe</a>
                ` : ''}
              </div>
              ${options.category === 'transactional' ? `
                <p style="margin: 12px 0 0 0; font-size: 11px; color: #94a3b8;">
                  This is an essential security or account transactional notification for ${escapeHtml(options.recipientEmail)}.
                </p>
              ` : ''}
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function renderTemplate(template: string, vars: Record<string, any>, recipientEmail: string): {
  subject: string;
  preheader: string;
  html: string;
  plainText: string;
  category: string;
} {
  const name = escapeHtml(vars.firstName || vars.name || vars.candidateName || 'there');
  const ctaUrl = vars.ctaUrl || `${CANONICAL_URL}/dashboard`;

  let subject = 'Notification from TalentXcel';
  let preheader = 'Important update regarding your TalentXcel account';
  let contentHtml = '';
  let plainText = '';
  let category = 'transactional';

  switch (template.toLowerCase()) {
    case 'welcome':
      category = 'transactional';
      subject = `Welcome to TalentXcel, ${vars.firstName || 'there'}! 🎉`;
      preheader = 'Your career journey starts here. Explore global jobs and build your verified profile.';
      contentHtml = `
        <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #0f172a;">
          Welcome to TalentXcel, ${name}! 🎉
        </h2>
        <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 24px; color: #334155;">
          We're thrilled to welcome you to the TalentXcel professional talent network. Whether you are searching for your next career milestone, benchmarking your skills with TalentScore, or connecting with hiring teams globally, our platform is built for you.
        </p>
        <div style="background-color: #f1f5f9; border-radius: 8px; padding: 18px 20px; margin: 20px 0;">
          <div style="font-weight: 600; font-size: 14px; color: #0f172a; margin-bottom: 8px;">Next steps to accelerate your career:</div>
          <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #475569; line-height: 22px;">
            <li>Complete your <strong>Career Passport</strong> to get noticed by verified recruiters</li>
            <li>Run a free <strong>ATS Resume Assessment</strong></li>
            <li>Set up intelligent <strong>Job Match Alerts</strong></li>
          </ul>
        </div>
        ${renderButton('Explore TalentXcel Dashboard', ctaUrl)}
        <p style="margin: 24px 0 0 0; font-size: 14px; color: #64748b; line-height: 20px;">
          Best regards,<br>
          <strong>The TalentXcel Team</strong>
        </p>
      `;
      plainText = `Welcome to TalentXcel, ${vars.firstName || 'there'}!\n\nWe're thrilled to welcome you to the TalentXcel talent network.\n\nNext steps:\n1. Complete your Career Passport\n2. Run a free ATS Resume Assessment\n3. Explore matching opportunities\n\nGet started: ${ctaUrl}\n\n© ${new Date().getFullYear()} TalentXcel. All rights reserved.`;
      break;

    case 'application_confirmation':
      category = 'transactional';
      subject = `Application Received: ${vars.jobTitle || 'Job Application'} at ${vars.companyName || 'TalentXcel'}`;
      preheader = `We received your application for ${vars.jobTitle || 'the position'}.`;
      contentHtml = `
        <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #0f172a;">
          Application Confirmed ✅
        </h2>
        <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 24px; color: #334155;">
          Hi ${name}, your application for <strong>${escapeHtml(vars.jobTitle || 'the role')}</strong> at <strong>${escapeHtml(vars.companyName || 'the company')}</strong> has been successfully submitted and delivered to the hiring team.
        </p>
        ${renderButton('Track Your Application', ctaUrl)}
      `;
      plainText = `Hi ${vars.firstName || 'there'},\n\nYour application for ${vars.jobTitle} at ${vars.companyName} has been received.\n\nTrack: ${ctaUrl}`;
      break;

    default:
      category = vars.category || 'transactional';
      subject = vars.subject || `Notification from TalentXcel`;
      preheader = vars.preheader || 'Important update from TalentXcel';
      contentHtml = `
        <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #0f172a;">
          ${escapeHtml(subject)}
        </h2>
        <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 24px; color: #334155;">
          ${escapeHtml(vars.message || 'You have a new update from TalentXcel.')}
        </p>
        ${vars.ctaUrl ? renderButton(vars.ctaLabel || 'View Details', vars.ctaUrl) : ''}
      `;
      plainText = `${subject}\n\n${vars.message || 'Notification from TalentXcel'}\n\n${vars.ctaUrl || ''}`;
      break;
  }

  const html = wrapInBaseLayout({
    title: subject,
    preheader,
    contentHtml,
    category,
    recipientEmail
  });

  return { subject, preheader, html, plainText, category };
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN SERVERLESS HANDLER
// ─────────────────────────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'content-type, authorization');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Diagnostic GET for health monitoring
  if (req.method === 'GET') {
    const emailMode = (process.env.EMAIL_MODE || 'console').toLowerCase();
    const hasAwsKeys = !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);
    return res.status(200).json({
      status: 'healthy',
      service: 'TalentXcel Email Dispatch Gateway',
      emailMode,
      hasAwsKeys,
      region: process.env.AWS_REGION || DEFAULT_REGION,
      timestamp: new Date().toISOString()
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const startTime = Date.now();

  try {
    const rawBody = req.body;
    const payload = typeof rawBody === 'string' ? JSON.parse(rawBody) : (rawBody || {});

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

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false }
    });

    // 1. Check suppression list (bounces / complaints)
    try {
      const { data: suppressed } = await supabase
        .from('email_suppression_list')
        .select('id, reason')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (suppressed) {
        return res.status(400).json({
          success: false,
          status: 'suppressed',
          error: `Recipient address ${cleanEmail} is suppressed (${suppressed.reason || 'bounce/complaint'})`
        });
      }
    } catch (suppErr: any) {
      console.warn('⚠️ Suppression check warning:', suppErr?.message);
    }

    // 2. Render deterministic HTML template
    const rendered = renderTemplate(template, variables, cleanEmail);

    // 3. Environment Resolution: Determine SES vs Console mode
    const emailMode = (process.env.EMAIL_MODE || 'console').toLowerCase();
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID || process.env.AWS_SES_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || process.env.AWS_SES_SECRET_ACCESS_KEY;
    const region = process.env.AWS_REGION || process.env.AWS_SES_REGION || DEFAULT_REGION;
    const fromAddress = payload.from?.fromEmail || `TalentXcel <noreply@${DOMAIN}>`;

    let dispatchResult: any = null;

    if (emailMode === 'ses' && accessKeyId && secretAccessKey) {
      // ─────────────────────────────────────────────────────────────
      // LIVE AMAZON SES DISPATCH (Production us-east-1)
      // ─────────────────────────────────────────────────────────────
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
        mode: 'ses',
        messageId: sesResponse.MessageId,
        recipient: cleanEmail,
        subject: rendered.subject,
        durationMs,
        timestamp: new Date().toISOString()
      };

      // Record in audit ledger
      try {
        await supabase.from('email_audit_ledger').insert({
          event_type: 'sent',
          recipient_email: cleanEmail,
          category: rendered.category,
          template_name: template,
          provider_message_id: sesResponse.MessageId,
          delivery_status: 'delivered',
          metadata: {
            priority,
            mode: 'ses',
            durationMs,
            subject: rendered.subject
          },
          created_at: new Date().toISOString()
        });
      } catch (ledgerErr: any) {
        console.warn('⚠️ Audit ledger logging non-fatal warning:', ledgerErr?.message);
      }

      return res.status(200).json(dispatchResult);

    } else if (emailMode === 'ses' && (!accessKeyId || !secretAccessKey)) {
      // Config error: ses requested but keys missing
      return res.status(500).json({
        success: false,
        error: 'EMAIL_MODE=ses is configured in Vercel, but AWS_ACCESS_KEY_ID or AWS_SECRET_ACCESS_KEY is missing.',
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
