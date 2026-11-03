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
export function escapeHtml(unsafe: any): string {
  if (unsafe === null || unsafe === undefined) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function renderButton(label: string, url: string): string {
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

export function wrapInBaseLayout(options: {
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

export function renderTemplate(template: string, vars: Record<string, any>, recipientEmail: string): {
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

    case 'activation_network_intro':
      category = 'engagement';
      subject = vars.subject || `Discover verified career opportunities on TalentXcel`;
      preheader = vars.preheader || 'Explore curated roles, benchmark your ATS resume score, and connect with top teams.';
      contentHtml = `
        <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #0f172a;">
          Discover Verified Career Opportunities on TalentXcel
        </h2>
        <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 24px; color: #334155;">
          Hi ${name}, welcome to TalentXcel — India's verified professional network and career discovery platform.
        </p>
        <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 24px; color: #334155;">
          Over 2,200+ active roles from verified hiring organizations are live on our platform. Here is how you can accelerate your job search:
        </p>
        <div style="background-color: #f1f5f9; border-radius: 8px; padding: 18px 20px; margin: 20px 0;">
          <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #475569; line-height: 22px;">
            <li><strong>Verified open positions</strong> with real salary benchmarks and requirements</li>
            <li><strong>Instant ATS Resume Scoring</strong> to test keyword compatibility</li>
            <li><strong>Career Passport</strong> to gain direct visibility with verified recruiters</li>
          </ul>
        </div>
        ${renderButton('Explore Live Opportunities', ctaUrl)}
        <p style="margin: 24px 0 0 0; font-size: 14px; color: #64748b; line-height: 20px;">
          Best regards,<br>
          <strong>The TalentXcel Team</strong>
        </p>
      `;
      plainText = `Discover Verified Career Opportunities on TalentXcel\n\nHi ${name},\n\nExplore 2,200+ verified roles, benchmark your ATS resume score, and connect with hiring teams.\n\nExplore now: ${ctaUrl}\n\nUnsubscribe: ${CANONICAL_URL}/unsubscribe?email=${encodeURIComponent(recipientEmail)}`;
      break;

    case 'activation_profile_claim':
      category = 'engagement';
      subject = vars.subject || `Action required: Review and claim your TalentXcel profile`;
      preheader = vars.preheader || 'Confirm your professional details and unlock direct recruiter matching.';
      contentHtml = `
        <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #0f172a;">
          Claim Your Professional Profile on TalentXcel
        </h2>
        <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 24px; color: #334155;">
          Hi ${name}, a professional profile draft has been prepared for your review on the TalentXcel Network.
        </p>
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px 20px; margin: 20px 0;">
          <div style="font-weight: 600; font-size: 14px; color: #0f172a; margin-bottom: 6px;">Your Reserved Profile Preview:</div>
          <div style="font-size: 14px; color: #475569;">Target Role: <strong>${escapeHtml(vars.headline || vars.role || 'Professional')}</strong></div>
          ${vars.skills ? `<div style="font-size: 14px; color: #475569; margin-top: 4px;">Skills: <strong>${escapeHtml(Array.isArray(vars.skills) ? vars.skills.join(', ') : vars.skills)}</strong></div>` : ''}
        </div>
        <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 22px; color: #64748b;">
          <strong>Security Notice:</strong> Your information is completely private and is not published until you verify and explicitly approve your details. This link expires in 14 days.
        </p>
        ${renderButton('Review & Claim Profile', vars.claimUrl || ctaUrl)}
        <p style="margin: 20px 0 0 0; font-size: 12px; color: #94a3b8; text-align: center;">
          Not your profile? <a href="${vars.optOutUrl || `${CANONICAL_URL}/unsubscribe?email=${encodeURIComponent(recipientEmail)}`}" style="color: #64748b; text-decoration: underline;">Opt-out and delete this record</a>.
        </p>
      `;
      plainText = `Claim Your Professional Profile on TalentXcel\n\nHi ${name},\n\nA profile draft has been prepared for your review.\n\nReview & claim: ${vars.claimUrl || ctaUrl}\n\nOpt-out / delete: ${vars.optOutUrl || `${CANONICAL_URL}/unsubscribe?email=${encodeURIComponent(recipientEmail)}`}`;
      break;

    case 'activation_claim_followup':
      category = 'engagement';
      subject = vars.subject || `Reminder: Your TalentXcel profile invitation expires soon`;
      preheader = vars.preheader || 'New hiring teams and matching opportunities were added this week.';
      contentHtml = `
        <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #0f172a;">
          Your Profile Invitation Expires Soon
        </h2>
        <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 24px; color: #334155;">
          Hi ${name}, this is a gentle reminder that your reservation to claim your profile on TalentXcel will expire shortly.
        </p>
        <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 24px; color: #334155;">
          Claiming your profile gives you full control over your career visibility, verified recruiter matching, and free ATS assessment tools.
        </p>
        ${renderButton('Claim Your Profile Now', vars.claimUrl || ctaUrl)}
      `;
      plainText = `Reminder: Your TalentXcel profile invitation expires soon\n\nHi ${name},\n\nClaim your profile before the invitation expires: ${vars.claimUrl || ctaUrl}\n\nUnsubscribe: ${CANONICAL_URL}/unsubscribe?email=${encodeURIComponent(recipientEmail)}`;
      break;
    case 'contact_enquiry':
      category = 'transactional';
      subject = 'New Contact Form Message: ' + (vars.subject || 'Enquiry');
      preheader = 'Enquiry from ' + (vars.senderName || 'Visitor') + ' (' + (vars.senderEmail || 'No email') + ')';
      contentHtml = '<h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #0f172a;">New Contact Enquiry 📩</h2>' +
        '<div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px 20px; margin: 16px 0;">' +
        '<p style="margin: 0 0 6px 0; font-size: 14px; color: #334155;"><strong>From:</strong> ' + escapeHtml(vars.senderName) + ' &lt;' + escapeHtml(vars.senderEmail) + '&gt;</p>' +
        '<p style="margin: 0; font-size: 14px; color: #334155;"><strong>Subject:</strong> ' + escapeHtml(vars.subject) + '</p>' +
        '</div>' +
        '<div style="font-size: 15px; line-height: 24px; color: #1e293b; padding: 12px 0;">' + escapeHtml(vars.message) + '</div>';
      plainText = 'New Enquiry from ' + vars.senderName + ' (' + vars.senderEmail + ')\nSubject: ' + vars.subject + '\n\n' + vars.message;
      break;

    case 'recruiter_outreach':
      category = 'engagement';
      subject = vars.subject || 'Career Opportunity via TalentXcel';
      preheader = 'A recruiter reached out to you on TalentXcel';
      contentHtml = '<h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #0f172a;">' + escapeHtml(subject) + '</h2>' +
        '<div style="font-size: 15px; line-height: 24px; color: #334155; margin: 16px 0;">' + escapeHtml(vars.message) + '</div>' +
        renderButton('Respond to Recruiter', vars.ctaUrl || (CANONICAL_URL + '/messages'));
      plainText = subject + '\n\n' + vars.message + '\n\nRespond: ' + (vars.ctaUrl || (CANONICAL_URL + '/messages'));
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

  // Diagnostic GET for health monitoring
  if (req.method === 'GET' && !req.headers['x-vercel-cron'] && !req.headers.authorization) {
    const emailMode = (process.env.EMAIL_MODE || 'console').toLowerCase();
    const hasAwsSdkKeys = !!((process.env.AWS_ACCESS_KEY_ID || process.env.AWS_SES_ACCESS_KEY_ID) && (process.env.AWS_SECRET_ACCESS_KEY || process.env.AWS_SES_SECRET_ACCESS_KEY));
    const hasSmtpKeys = !!((process.env.SMTP_PASS || process.env.SMTP_PASSWORD || process.env.AWS_SMTP_PASSWORD));
    return res.status(200).json({
      status: 'healthy',
      service: 'TalentXcel Email Queue Worker',
      emailMode,
      hasAwsKeys: hasAwsSdkKeys || hasSmtpKeys,
      region: process.env.AWS_REGION || DEFAULT_REGION,
      timestamp: new Date().toISOString()
    });
  }

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
    let nodemailerTransporter: any = null;

    const smtpPass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD || process.env.AWS_SMTP_PASSWORD;
    const smtpUser = process.env.SMTP_USER || process.env.AWS_SMTP_USER || accessKeyId;
    const smtpHost = process.env.SMTP_HOST || `email-smtp.${region}.amazonaws.com`;
    const smtpPort = Number(process.env.SMTP_PORT) || 587;

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
    } else if (emailMode === 'ses' && smtpUser && smtpPass) {
      try {
        const mod = await import('nodemailer');
        const nodemailer = mod.default || mod;
        nodemailerTransporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: false,
          auth: { user: smtpUser, pass: smtpPass }
        });
      } catch (err: any) {
        console.warn('⚠️ Could not load Nodemailer in worker:', err?.message);
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
        } else if (nodemailerTransporter && emailMode === 'ses') {
          const info = await nodemailerTransporter.sendMail({
            from: `TalentXcel <noreply@${DOMAIN}>`,
            to: cleanEmail,
            replyTo: `support@${DOMAIN}`,
            subject: rendered.subject,
            html: rendered.html,
            text: rendered.plainText,
            headers: {
              'X-SES-CONFIGURATION-SET': 'talentxcel-production',
              'X-TalentXcel-Category': rendered.category,
              'X-TalentXcel-Template': job.trigger_type
            }
          });
          messageId = info.messageId;
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
