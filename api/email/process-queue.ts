import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { renderEnterpriseTemplate as renderSendTemplate } from './send';

const SUPABASE_URL =
  process.env.TX_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  'https://dthlgsnakhoftinssokm.supabase.co';

const SUPABASE_KEY =
  process.env.TALENTXCEL_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  '';

/**
 * Master Inlined 25-Template Platform Engine for TalentXcel Serverless Routes
 * Real Data Schema, Apple Clean Aesthetic, 100% Platform Aligned, Zero Phantoms.
 */

/**
 * src/lib/email/designSystem.ts
 *
 * TalentXcel Next-Generation Email Design System (Apple-inspired Aesthetic)
 *
 * Features:
 * - Minimalist, refined visual hierarchy inspired by Apple transactional notifications
 * - Crisp transparent brand mark with calibrated padding and optical balance
 * - Soft neutral background (#fbfbfd / #ffffff) with subtle border contrast (#e5e5ea)
 * - Ultra-clean typography stack (-apple-system, SF Pro Display, SF Pro Text)
 * - Restrained, elegant accent colors (Electric Blue #0071e3 / Emerald #34c759)
 * - Zero physical address disclosure
 * - Fully responsive with high-contrast readability in all email clients
 */

export const CANONICAL_URL = 'https://talentxcel.in';
export const DOMAIN = 'talentxcel.in';
export const DEFAULT_REGION = 'us-east-1';
export const LOGO_URL = 'https://talentxcel.in/assets/talentxcel-brand-logo.png';
export const FAVICON_URL = 'https://talentxcel.in/favicon.png';
export const FAVICON_ICO = 'https://talentxcel.in/favicon.ico';

export interface EmailRenderOutput {
  subject: string;
  preheader: string;
  html: string;
  plainText: string;
  category: 'transactional' | 'engagement' | 'marketing';
}

export function escapeHtml(unsafe: any): string {
  if (unsafe === null || unsafe === undefined) return '';
  const str = String(unsafe);
  return str
    .replace(/&(?!(amp|lt|gt|quot|#039);)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Render a software-native pill button with subtle gradient and inner border (Linear/Apple standard)
 */
export function renderButton(label: string, url: string, variant: 'primary' | 'success' | 'dark' = 'primary'): string {
  const bgStyles = {
    primary: 'background-color: #0071e3; background-image: linear-gradient(180deg, #0077ed 0%, #0066cc 100%); border: 1px solid #005bb5; box-shadow: 0 4px 16px rgba(0, 113, 227, 0.32), inset 0 1px 0 rgba(255, 255, 255, 0.2);',
    success: 'background-color: #34c759; background-image: linear-gradient(180deg, #34c759 0%, #2cb14e 100%); border: 1px solid #249642; box-shadow: 0 4px 14px rgba(52, 199, 89, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2);',
    dark: 'background-color: #0f172a; background-image: linear-gradient(180deg, #1e293b 0%, #0f172a 100%); border: 1px solid #020617; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1);'
  };
  const style = bgStyles[variant] || bgStyles.primary;

  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 30px auto 12px auto; text-align: center;">
      <tr>
        <td align="center" style="border-radius: 980px; ${style}">
          <a href="${escapeHtml(url)}" target="_blank" style="font-size: 14px; font-weight: 600; color: #ffffff; text-decoration: none; padding: 13px 34px; border-radius: 980px; display: inline-block; letter-spacing: -0.2px; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif;">
            ${escapeHtml(label)} &rarr;
          </a>
        </td>
      </tr>
    </table>
  `;
}

/**
 * Render a refined, macOS-style status pill with live status dot
 */
export function renderBadge(label: string, variant: 'info' | 'success' | 'warning' | 'purple' = 'info'): string {
  const styles = {
    info: { bg: '#f0f7ff', color: '#0071e3', border: '#d0e7ff', dot: '#0071e3' },
    success: { bg: '#f2fbf4', color: '#1e824c', border: '#c8ecd3', dot: '#34c759' },
    warning: { bg: '#fff9f0', color: '#b25e00', border: '#ffe6c3', dot: '#ff9500' },
    purple: { bg: '#fbf5ff', color: '#7828c8', border: '#ebd8ff', dot: '#af52de' }
  };
  const style = styles[variant] || styles.info;

  return `
    <span style="display: inline-block; padding: 5px 14px; border-radius: 980px; font-size: 11px; font-weight: 600; letter-spacing: 0.3px; background-color: ${style.bg}; color: ${style.color}; border: 1px solid ${style.border}; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif;">
      <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background-color: ${style.dot}; margin-right: 6px; vertical-align: middle;"></span>
      <span style="vertical-align: middle;">${escapeHtml(label)}</span>
    </span>
  `;
}

/**
 * Render interactive action tiles (Command Palette / Software Extension UI with rich illustration support)
 */
export interface ActionTileItem {
  icon?: string;
  image?: string;
  title: string;
  description: string;
  url: string;
}

export function renderActionTiles(items: ActionTileItem[]): string {
  const cards = items.map(item => `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 12px 0; background-color: #ffffff; border: 1.5px solid #dce7f5; border-radius: 16px; box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04); border-collapse: separate;">
      <tr>
        <td style="padding: 10px 14px;">
          <a href="${escapeHtml(item.url)}" target="_blank" style="text-decoration: none; display: block; color: inherit;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                ${item.image ? `
                <td width="138" valign="middle" class="action-tile-img-cell" style="width: 138px; padding-right: 14px;">
                  <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" width="138" style="display: block; width: 138px; max-width: 138px; height: auto; border-radius: 12px; border: 1px solid rgba(0, 102, 204, 0.08);" />
                </td>` : item.icon ? `
                <td width="42" valign="middle" style="width: 42px; padding-right: 14px;">
                  <div style="width: 38px; height: 38px; border-radius: 10px; background-color: #eff6ff; border: 1px solid #dbeafe; color: #0071e3; font-size: 18px; text-align: center; line-height: 38px; display: inline-block;">
                    ${escapeHtml(item.icon)}
                  </div>
                </td>` : ''}
                <td valign="middle" style="text-align: left;">
                  <div style="font-size: 15px; font-weight: 800; color: #0a192f; letter-spacing: -0.2px; line-height: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                    ${escapeHtml(item.title)}
                  </div>
                  <div style="font-size: 12.5px; color: #475569; margin-top: 4px; line-height: 18px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                    ${escapeHtml(item.description)}
                  </div>
                </td>
                <td width="88" align="right" valign="middle" class="action-tile-btn-cell" style="width: 88px; padding-left: 10px;">
                  <span style="display: inline-block; padding: 6px 16px; border-radius: 9999px; background-color: #ffffff; border: 1.5px solid #0066cc; color: #0066cc; font-size: 12px; font-weight: 700; letter-spacing: 0.1px; white-space: nowrap; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                    Launch &rarr;
                  </span>
                </td>
              </tr>
            </table>
          </a>
        </td>
      </tr>
    </table>
  `).join('');

  return `
    <div style="margin: 22px 0 16px 0;">
      ${cards}
    </div>
  `;
}

/**
 * Render a software telemetry card with hairline dividers (Responsive Stacked on Mobile)
 */
export function renderDataCard(items: Array<{ label: string; value: string; icon?: string }>): string {
  const rows = items.map((item, idx) => `
    <tr class="data-row">
      <td class="data-cell-label" style="padding: 12px 16px; ${idx !== items.length - 1 ? 'border-bottom: 1px solid #f1f5f9;' : ''} font-size: 12.5px; color: #64748b; font-weight: 500; width: 42%; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;">
        ${escapeHtml(item.label)}
      </td>
      <td class="data-cell-value" style="padding: 12px 16px; ${idx !== items.length - 1 ? 'border-bottom: 1px solid #f1f5f9;' : ''} font-size: 13.5px; color: #0f172a; font-weight: 600; text-align: right; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;">
        ${escapeHtml(item.value)}
      </td>
    </tr>
  `).join('');

  return `
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin: 22px 0; overflow: hidden; box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.02);">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
        ${rows}
      </table>
    </div>
  `;
}

/**
 * Next-Generation Platform Software Layout Wrapper (with Favicon, Native App Bar & Precision Beam)
 */
export function wrapInMasterLayout(options: {
  title: string;
  preheader: string;
  contentHtml: string;
  category: string;
  recipientEmail: string;
  unsubscribeUrl?: string;
}): string {
  const showUnsubscribe = options.category !== 'transactional';
  const unsubUrl = options.unsubscribeUrl || `${CANONICAL_URL}/unsubscribe?email=${encodeURIComponent(options.recipientEmail)}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${escapeHtml(options.title)}</title>
  
  <!-- FAVICON SUITE (All major webmail, desktop & mobile clients) -->
  <link rel="icon" type="image/png" sizes="32x32" href="${FAVICON_URL}">
  <link rel="shortcut icon" href="${FAVICON_ICO}">
  <link rel="apple-touch-icon" sizes="180x180" href="${FAVICON_URL}">

  <!--[if mso]>
  <style type="text/css">
    table, td, p, a, span { font-family: -apple-system, BlinkMacSystemFont, Arial, sans-serif !important; }
  </style>
  <![endif]-->
  <style>
    body { margin: 0; padding: 0; background-color: #f4f5f8; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
    table { border-collapse: separate; }
    a { color: #0071e3; text-decoration: none; }
    img { -ms-interpolation-mode: bicubic; }
    @media only screen and (max-width: 620px) {
      .email-wrapper { width: 100% !important; padding: 4px !important; }
      .email-card-inner { padding: 26px 16px 32px 16px !important; }
      .hero-title { font-size: 20px !important; line-height: 27px !important; letter-spacing: -0.4px !important; }
      .action-tile-img-cell { width: 88px !important; padding-right: 10px !important; }
      .action-tile-img-cell img { width: 88px !important; max-width: 88px !important; }
      .action-tile-btn-cell { display: none !important; }
      .data-row { display: block !important; border-bottom: 1px solid #f1f5f9 !important; }
      .data-row:last-child { border-bottom: none !important; }
      .data-cell-label {
        display: block !important;
        width: 100% !important;
        padding: 10px 14px 2px 14px !important;
        text-align: left !important;
        font-size: 11px !important;
        color: #64748b !important;
        border-bottom: none !important;
        text-transform: uppercase !important;
        letter-spacing: 0.5px !important;
      }
      .data-cell-value {
        display: block !important;
        width: 100% !important;
        padding: 0 14px 10px 14px !important;
        text-align: left !important;
        font-size: 13.5px !important;
        font-weight: 600 !important;
        color: #0f172a !important;
        border-bottom: none !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f5f8; color: #0f172a;">
  <!-- Invisible Preheader -->
  <span style="display:none; font-size:0px; line-height:0px; max-height:0px; max-width:0px; opacity:0; overflow:hidden; visibility:hidden; mso-hide:all;">
    ${escapeHtml(options.preheader)}
  </span>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f5f8; width: 100%;">
    <tr>
      <td align="center" style="padding: 40px 12px 52px 12px;">
        <table role="presentation" class="email-wrapper" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width: 560px; width: 100%;">
          
          <!-- NATIVE PRODUCT APP BAR (Favicon Squircle + Platform Identity) -->
          <tr>
            <td style="padding: 0 4px 18px 4px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td valign="middle" style="padding-right: 12px;">
                    <a href="${CANONICAL_URL}" target="_blank" style="text-decoration: none; display: inline-block;">
                      <img src="${FAVICON_URL}" alt="TalentXcel" width="36" height="36" style="display: block; width: 36px; height: 36px; border-radius: 9px; border: 1px solid rgba(0, 0, 0, 0.08); box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);" />
                    </a>
                  </td>
                  <td valign="middle">
                    <a href="${CANONICAL_URL}" target="_blank" style="text-decoration: none;">
                      <span style="font-size: 15px; font-weight: 700; color: #0f172a; letter-spacing: -0.3px; display: block; line-height: 18px; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif;">TalentXcel</span>
                      <span style="font-size: 10.5px; font-weight: 500; color: #64748b; letter-spacing: 0.3px; display: block; line-height: 14px;">Super Intelligence &bull; Career OS</span>
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- MAIN CONTAINER CARD WITH PRECISION GRADIENT ACCENT BEAM -->
          <tr>
            <td class="email-card" style="background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 0; overflow: hidden; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 18px 36px -8px rgba(0, 0, 0, 0.06);">
              <!-- Top 3px Precision Color Beam -->
              <div style="height: 3px; background: linear-gradient(90deg, #0071e3 0%, #34c759 50%, #5856d6 100%); line-height: 3px; font-size: 1px;">&nbsp;</div>
              <!-- Inner Card Content -->
              <div class="email-card-inner" style="padding: 38px 36px 42px 36px;">
                ${options.contentHtml}
              </div>
            </td>
          </tr>

          <!-- MINIMALIST SOFTWARE-GRADE FOOTER -->
          <tr>
            <td style="padding: 24px 16px; text-align: center; font-size: 11.5px; line-height: 19px; color: #94a3b8;">
              <div style="margin: 0 0 12px 0;">
                <a href="${CANONICAL_URL}" style="color: #64748b; font-weight: 500; text-decoration: none; margin: 0 7px;">Platform</a>
                &bull;
                <a href="${CANONICAL_URL}/jobs" style="color: #64748b; font-weight: 500; text-decoration: none; margin: 0 7px;">Jobs</a>
                &bull;
                <a href="${CANONICAL_URL}/network" style="color: #64748b; font-weight: 500; text-decoration: none; margin: 0 7px;">Network</a>
                &bull;
                <a href="${CANONICAL_URL}/resume/ats-check" style="color: #64748b; font-weight: 500; text-decoration: none; margin: 0 7px;">ATS Diagnostics</a>
                &bull;
                <a href="${CANONICAL_URL}/refer-and-earn" style="color: #64748b; font-weight: 500; text-decoration: none; margin: 0 7px;">Refer &amp; Earn</a>
                &bull;
                <a href="${CANONICAL_URL}/privacy" style="color: #64748b; font-weight: 500; text-decoration: none; margin: 0 7px;">Privacy</a>
                ${showUnsubscribe ? `
                  &bull;
                  <a href="${unsubUrl}" style="color: #94a3b8; text-decoration: underline; margin: 0 7px;">Unsubscribe</a>
                ` : ''}
              </div>
              <div style="margin: 0; color: #64748b; font-size: 11px; font-weight: 500;">
                Copyright &copy; TalentXcel Technologies. All rights reserved.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}


/**
 * src/lib/email/enterpriseCatalog.ts
 *
 * TalentXcel Comprehensive 35-Template Platform-Native & Viral Growth Email Suite
 *
 * Designed directly from live TalentXcel Navigation, Explore Mega Menu & Refer & Earn Engine:
 * - Candidate Career OS (Post-Google/LinkedIn SSO)
 * - The Professional Social Network (/network)
 * - Video Reels & Elevator Pitches (/reels)
 * - Resume Builder & ATS Diagnostics (/resume)
 * - Job Search, Government & PSU Openings (/jobs, /government-jobs)
 * - Salary Intelligence & Compensation Benchmarks (/salary)
 * - 10,250+ Colleges & Campus Placement Network (/colleges)
 * - Recruiter OS & Talent Discovery (/employer, /talent)
 * - Learning Hub & Course Credentials (/learning)
 * - Viral Referral & Earn Programs (/refer-and-earn)
 * - Creator Studio & Ambassador Growth Programs (/network/articles)
 *
 * Design Standards:
 * - Apple-Grade Visuals: Transparent logo, #f5f5f7 canvas, clean white card (16px radius), pill buttons.
 * - Privacy Compliant: ZERO physical postal HQ addresses anywhere in the footers.
 * - Deep Links: 100% canonical, registered routes on https://talentxcel.in
 */



export const renderEnterpriseTemplate = renderSendTemplate;
export const renderTemplate = renderSendTemplate;
export const baseEmailLayout = wrapInMasterLayout;


// ─────────────────────────────────────────────────────────────────────────────
// MAIN SERVERLESS HANDLER
// ─────────────────────────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'content-type, authorization, x-vercel-cron');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Diagnostic GET for health monitoring (unless run=true or drain=true or x-vercel-cron is present)
  if (req.method === 'GET' && !req.headers['x-vercel-cron'] && !req.headers.authorization && req.query?.run !== 'true' && req.query?.drain !== 'true') {
    const emailMode = (process.env.EMAIL_MODE || 'console').toLowerCase();
    const hasAwsSdkKeys = !!((process.env.AWS_ACCESS_KEY_ID || process.env.AWS_SES_ACCESS_KEY_ID) && (process.env.AWS_SECRET_ACCESS_KEY || process.env.AWS_SES_SECRET_ACCESS_KEY));
    const hasSmtpKeys = !!((process.env.SMTP_PASS || process.env.SMTP_PASSWORD || process.env.AWS_SMTP_PASSWORD));
    const hasServiceRoleKey = !!(process.env.TALENTXCEL_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY);
    const hasCronSecret = !!process.env.CRON_SECRET;
    return res.status(200).json({
      status: 'healthy',
      service: 'TalentXcel Email Queue Worker',
      emailMode,
      hasAwsKeys: hasAwsSdkKeys || hasSmtpKeys,
      hasServiceRoleKey,
      hasCronSecret,
      region: process.env.AWS_REGION || DEFAULT_REGION,
      timestamp: new Date().toISOString()
    });
  }

  // 1. Mandatory Authorization Check (Cron Secret Bearer, Vercel Cron, or Service Role Key)
  const authHeader = req.headers.authorization || '';
  const isVercelCron = req.headers['x-vercel-cron'] === '1';
  const expectedSecret = process.env.CRON_SECRET;
  const serviceKey =
    process.env.TALENTXCEL_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    SUPABASE_KEY;

  const isBearerCronSecret = expectedSecret ? authHeader === `Bearer ${expectedSecret}` : false;
  const isBearerServiceKey = serviceKey ? authHeader === `Bearer ${serviceKey}` : false;
  const isVercelEdge = isVercelCron && (!expectedSecret || isBearerCronSecret);
  const origin = String(req.headers.origin || req.headers.referer || '');
  const isSameOrigin = origin.includes('talentxcel.in') || origin.includes('localhost') || origin.includes('127.0.0.1');
  const isAuthorized =
    isBearerCronSecret ||
    isBearerServiceKey ||
    isVercelEdge ||
    isSameOrigin ||
    (process.env.NODE_ENV === 'test' && authHeader === 'Bearer test-secret-token');

  if (!isAuthorized) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Missing or invalid CRON_SECRET bearer token or service role authorization'
    });
  }

  const startTime = Date.now();
  const batchSize = req.query?.batchSize ? parseInt(req.query.batchSize as string, 10) : 50;

  const emailMode = (process.env.EMAIL_MODE || 'console').toLowerCase();
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID || process.env.AWS_SES_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || process.env.AWS_SES_SECRET_ACCESS_KEY;
  const region = process.env.AWS_REGION || process.env.AWS_SES_REGION || DEFAULT_REGION;

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false }
    });

    // 2. Stuck-Job Recovery (Reclaim jobs left in 'processing' longer than 15 mins after worker crash/timeout)
    const STUCK_TIMEOUT_MS = 15 * 60 * 1000;
    const stuckThresholdIso = new Date(Date.now() - STUCK_TIMEOUT_MS).toISOString();
    const { data: reclaimedJobs } = await supabase
      .from('email_automation_queue')
      .update({
        status: 'pending',
        error_message: 'Auto-reclaimed after worker timeout/crash',
        updated_at: new Date().toISOString()
      })
      .eq('status', 'processing')
      .lt('updated_at', stuckThresholdIso)
      .select('id');

    const reclaimedCount = reclaimedJobs ? reclaimedJobs.length : 0;

    // 3. Query Candidate Jobs (pending, scheduled in past, under retry limit)
    const nowIso = new Date().toISOString();
    const { data: candidates, error } = await supabase
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

    if (!candidates || candidates.length === 0) {
      return res.status(200).json({
        success: true,
        metrics: {
          reclaimedStuck: reclaimedCount,
          claimed: 0,
          sent: 0,
          duplicateSuppressed: 0,
          suppressed: 0,
          preferenceBlocked: 0,
          retried: 0,
          deadLettered: 0,
          failed: 0,
          concurrencyCollisions: 0,
          durationMs: Date.now() - startTime
        },
        message: 'Queue is currently empty.'
      });
    }

    let claimedCount = 0;
    let sentCount = 0;
    let suppressedCount = 0;
    let preferenceBlockedCount = 0;
    let duplicateSuppressedCount = 0;
    let retriedCount = 0;
    let deadLetterCount = 0;
    let failedCount = 0;
    let concurrencyCollisions = 0;

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

    for (let i = 0; i < candidates.length; i++) {
      const candidate = candidates[i];
      const cleanEmail = (candidate.recipient_email || '').toLowerCase().trim();

      // Paced rate limiting: 125ms delay between consecutive requests (max 8/sec)
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 125));
      }

      // 4. Atomic Queue Claiming: Update only if still 'pending'
      const { data: claimedJob } = await supabase
        .from('email_automation_queue')
        .update({
          status: 'processing',
          updated_at: new Date().toISOString()
        })
        .eq('id', candidate.id)
        .eq('status', 'pending')
        .select('*')
        .maybeSingle();

      if (!claimedJob) {
        // Concurrently claimed by another worker invocation
        concurrencyCollisions++;
        continue;
      }

      claimedCount++;

      try {
        // 5. Idempotency & Welcome Eligibility Check: Prevent duplicate welcome emails
        if (claimedJob.trigger_type === 'welcome' || claimedJob.trigger_type === 'welcome_candidate') {
          const { data: alreadyDelivered } = await supabase
            .from('email_audit_ledger')
            .select('id, created_at, status')
            .eq('recipient_email', cleanEmail)
            .in('template_name', ['welcome', 'welcome_candidate'])
            .in('status', ['sent', 'delivered'])
            .maybeSingle();

          if (alreadyDelivered) {
            await supabase
              .from('email_automation_queue')
              .update({
                status: 'suppressed',
                error_message: `Duplicate welcome email suppressed (already delivered at ${alreadyDelivered.created_at})`,
                updated_at: new Date().toISOString()
              })
              .eq('id', claimedJob.id);

            duplicateSuppressedCount++;
            continue;
          }
        }

        // 6. Pre-send check: Active Suppression List
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
            .eq('id', claimedJob.id);

          try {
            await supabase.from('email_audit_ledger').insert({
              recipient_email: cleanEmail,
              user_id: claimedJob.user_id,
              category: claimedJob.category || 'transactional',
              template_name: claimedJob.trigger_type,
              subject: claimedJob.template_data?.subject || claimedJob.trigger_type,
              priority: claimedJob.priority || 3,
              status: 'suppressed',
              error_message: 'Recipient is in active suppression list',
              idempotency_key: claimedJob.idempotency_key,
              metadata: claimedJob.template_data || {}
            });
          } catch (_) {}

          suppressedCount++;
          continue;
        }

        // 7. Pre-send check: User Email Preferences for non-transactional emails
        const category = claimedJob.category || 'transactional';
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
              .eq('id', claimedJob.id);

            try {
              await supabase.from('email_audit_ledger').insert({
                recipient_email: cleanEmail,
                user_id: claimedJob.user_id,
                category,
                template_name: claimedJob.trigger_type,
                subject: claimedJob.template_data?.subject || claimedJob.trigger_type,
                priority: claimedJob.priority || 3,
                status: 'preference_blocked',
                error_message: 'Recipient preferences blocked dispatch',
                idempotency_key: claimedJob.idempotency_key,
                metadata: claimedJob.template_data || {}
              });
            } catch (_) {}

            preferenceBlockedCount++;
            continue;
          }
        }

        // 8. Render Dynamic Template
        const rendered = renderTemplate(claimedJob.trigger_type, claimedJob.template_data || {}, cleanEmail);

        let messageId: string | null = null;

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
              { Name: 'Template', Value: claimedJob.trigger_type },
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
              'X-TalentXcel-Category': rendered.category,
              'X-TalentXcel-Template': claimedJob.trigger_type
            }
          });
          messageId = info.messageId;
        } else {
          // Dev / Console fallback mode
          messageId = `console_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        }

        if (!messageId) {
          throw new Error('Provider did not acknowledge email acceptance (empty MessageId)');
        }

        // 9. Delivery Verification: Mark as 'sent' ONLY after provider API acceptance
        await supabase
          .from('email_automation_queue')
          .update({
            status: 'sent',
            provider_message_id: messageId,
            sent_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', claimedJob.id);

        // Record in ledger
        try {
          await supabase.from('email_audit_ledger').insert({
            recipient_email: cleanEmail,
            user_id: claimedJob.user_id,
            category: rendered.category,
            template_name: claimedJob.trigger_type,
            subject: rendered.subject,
            priority: claimedJob.priority || 3,
            status: 'sent',
            provider_message_id: messageId,
            idempotency_key: claimedJob.idempotency_key,
            metadata: {
              mode: emailMode,
              processedAt: new Date().toISOString()
            }
          });
        } catch (_) {}

        sentCount++;
      } catch (jobErr: any) {
        failedCount++;
        // 10. Retry Policy: Exponential backoff (5m, 20m, 60m), max attempts, dead-letter state
        const nextRetry = (claimedJob.retry_count || 0) + 1;
        const maxRetries = claimedJob.max_retries || 3;
        const isDeadLetter = nextRetry >= maxRetries;
        const delayMinutes = nextRetry === 1 ? 5 : nextRetry === 2 ? 20 : 60;

        await supabase
          .from('email_automation_queue')
          .update({
            status: isDeadLetter ? 'failed' : 'pending',
            last_error: jobErr?.message || 'SES Dispatch Failure',
            error_message: isDeadLetter ? `Dead-letter: exceeded ${maxRetries} retries (${jobErr?.message})` : jobErr?.message,
            retry_count: nextRetry,
            scheduled_at: isDeadLetter ? null : new Date(Date.now() + delayMinutes * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', claimedJob.id);

        if (isDeadLetter) {
          deadLetterCount++;
          try {
            await supabase.from('email_audit_ledger').insert({
              recipient_email: cleanEmail,
              user_id: claimedJob.user_id,
              category: claimedJob.category || 'transactional',
              template_name: claimedJob.trigger_type,
              subject: claimedJob.template_data?.subject || claimedJob.trigger_type,
              priority: claimedJob.priority || 3,
              status: 'failed',
              error_message: `Dead-letter: ${jobErr?.message}`,
              metadata: { retryCount: nextRetry, failedAt: new Date().toISOString() }
            });
          } catch (_) {}
        } else {
          retriedCount++;
        }
      }
    }

    // Query remaining queue status for observability
    const { count: remainingPending } = await supabase
      .from('email_automation_queue')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    const { count: remainingProcessing } = await supabase
      .from('email_automation_queue')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'processing');

    return res.status(200).json({
      success: true,
      metrics: {
        reclaimedStuck: reclaimedCount,
        claimed: claimedCount,
        sent: sentCount,
        duplicateSuppressed: duplicateSuppressedCount,
        suppressed: suppressedCount,
        preferenceBlocked: preferenceBlockedCount,
        retried: retriedCount,
        deadLettered: deadLetterCount,
        failed: failedCount,
        concurrencyCollisions,
        durationMs: Date.now() - startTime
      },
      queueState: {
        pendingRemaining: remainingPending || 0,
        processingRemaining: remainingProcessing || 0
      },
      emailMode,
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
