import type { VercelRequest, VercelResponse } from '@vercel/node';

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



export function renderEnterpriseTemplate(
  templateName: string,
  vars: Record<string, any>,
  recipientEmail: string
): EmailRenderOutput {
  const t = templateName.toLowerCase().trim();
  const name = escapeHtml(vars.name || vars.firstName || vars.candidateName || vars.recipient_name || 'there');
  const email = escapeHtml(recipientEmail);

  let subject = 'Notification from TalentXcel';
  let preheader = 'Important career update from TalentXcel';
  let contentHtml = '';
  let plainText = '';
  let category: 'transactional' | 'engagement' | 'marketing' = 'transactional';

  switch (t) {
    // ═════════════════════════════════════════════════════════════════════════
    // 1. CANDIDATE CAREER OS (1 - 5)
    // ═════════════════════════════════════════════════════════════════════════

    case 'welcome':
    case 'welcome_candidate': {
      category = 'transactional';
      subject = `Welcome to TalentXcel. Your next career chapter starts here.`;
      preheader = 'Your account is active. Access your connected professional ecosystem to build your identity, unlock opportunities and accelerate your career.';

      contentHtml = `
        <div style="margin-bottom: 24px;">
          <div style="font-size: 15px; font-weight: 600; color: #64748b; margin-bottom: 8px;">
            Hi ${name},
          </div>
          <h1 class="hero-title" style="margin: 0 0 14px 0; font-size: 25px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px; line-height: 32px;">
            Welcome to TalentXcel.<br>Your next career chapter starts here.
          </h1>
          <p style="margin: 0 0 12px 0; font-size: 14.5px; line-height: 23px; color: #334155;">
            Your account is now active, and you have access to a connected professional ecosystem designed to help you build your identity, unlock opportunities and accelerate your career.
          </p>
          <p style="margin: 0 0 12px 0; font-size: 14.5px; line-height: 23px; color: #334155; font-style: italic;">
            The world of work is evolving. Your professional journey should evolve with it.
          </p>
          <p style="margin: 0; font-size: 14.5px; line-height: 23px; color: #475569;">
            TalentXcel combines AI-powered career intelligence, professional networking, digital career credentials, job discovery and continuous skill development to help you stay prepared, visible and connected.
          </p>
        </div>

        <div style="margin: 28px 0 14px 0; border-top: 1px solid #e2e8f0; padding-top: 22px;">
          <h2 style="margin: 0 0 4px 0; font-size: 16px; font-weight: 700; color: #0f172a; letter-spacing: -0.3px;">
            Everything You Need to Move Your Career Forward
          </h2>
        </div>

        ${renderActionTiles([
          {
            image: `${CANONICAL_URL}/assets/email/welcome-feature-1.png`,
            title: '01. Build a Stronger Resume',
            description: 'Create professional resumes, analyse ATS compatibility, identify skill and keyword gaps, and tailor your profile to the roles you want.',
            url: 'https://talentxcel.in/resume/ats-check'
          },
          {
            image: `${CANONICAL_URL}/assets/email/welcome-feature-2.png`,
            title: '02. Create Your Career Passport',
            description: 'Go beyond a traditional CV. Build your digital professional identity with your experience, skills, projects, achievements and certifications.',
            url: 'https://talentxcel.in/passport'
          },
          {
            image: `${CANONICAL_URL}/assets/email/welcome-feature-3.png`,
            title: '03. Discover Your Next Opportunity',
            description: 'Explore job opportunities across industries, discover relevant roles and take meaningful steps towards your next career move.',
            url: 'https://talentxcel.in/jobs'
          },
          {
            image: `${CANONICAL_URL}/assets/email/welcome-feature-4.png`,
            title: '04. Navigate Your Career with AI',
            description: 'Get intelligent career guidance, personalised roadmaps, skill-gap analysis, job matching and technical assessments.',
            url: 'https://careers.talentxcel.in/ai-career-hub'
          },
          {
            image: `${CANONICAL_URL}/assets/email/welcome-feature-5.png`,
            title: '05. Know Your Professional Worth',
            description: 'Explore salary benchmarks, compensation insights and market intelligence to make informed career decisions.',
            url: 'https://salary.talentxcel.in/index-salary.html'
          },
          {
            image: `${CANONICAL_URL}/assets/email/welcome-feature-6.png`,
            title: '06. Connect with the Professional World',
            description: 'Build meaningful connections with professionals, industry experts, founders and emerging talent. Share knowledge, publish articles and participate in professional discussions.',
            url: 'https://talentxcel.in/network/articles'
          },
          {
            image: `${CANONICAL_URL}/assets/email/welcome-feature-7.png`,
            title: '07. Prepare. Perform. Progress.',
            description: 'Strengthen your interview skills, improve your professional presentation and build the capabilities needed for long-term career success.',
            url: 'https://talentxcel.in/dashboard'
          }
        ])}

        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 22px 20px; margin: 26px 0 22px 0;">
          <div style="font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">
            Make Your First Move
          </div>
          <p style="margin: 0 0 12px 0; font-size: 13.5px; color: #475569; line-height: 20px;">
            Your TalentXcel journey begins with three simple actions:
          </p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 12px;">
            <tr>
              <td style="padding: 4px 0; font-size: 13.5px; color: #1e293b; line-height: 20px;">
                <strong style="color: #0071e3;">1.</strong> Complete your professional profile.
              </td>
            </tr>
            <tr>
              <td style="padding: 4px 0; font-size: 13.5px; color: #1e293b; line-height: 20px;">
                <strong style="color: #0071e3;">2.</strong> Run your first ATS resume assessment.
              </td>
            </tr>
            <tr>
              <td style="padding: 4px 0; font-size: 13.5px; color: #1e293b; line-height: 20px;">
                <strong style="color: #0071e3;">3.</strong> Create your Career Passport.
              </td>
            </tr>
          </table>
          <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 19px;">
            These steps will help you establish a stronger professional presence and get more value from the TalentXcel ecosystem.
          </p>
        </div>

        <div style="text-align: center; margin: 26px 0 8px 0;">
          <p style="margin: 0; font-size: 15px; font-weight: 600; color: #0f172a; line-height: 23px; letter-spacing: -0.2px;">
            Think beyond the resume. Build your professional identity.<br>
            Discover your potential. Create your next opportunity.
          </p>
        </div>

        ${renderButton('GET STARTED WITH TALENTXCEL', `${CANONICAL_URL}/dashboard`)}

        <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #f1f5f9; font-size: 13.5px; line-height: 22px; color: #475569;">
          <p style="margin: 0 0 12px 0;">
            We look forward to being part of your journey.<br>
            <strong style="color: #0f172a;">Team TalentXcel</strong><br>
            <a href="https://talentxcel.in" target="_blank" style="color: #0071e3; text-decoration: none; font-weight: 500;">www.talentxcel.in</a>
          </p>
          <p style="margin: 12px 0 0 0; font-size: 12px; font-weight: 600; color: #64748b; letter-spacing: 0.3px;">
            Your Career. Your Identity. Your Next Opportunity.
          </p>
          <p style="margin: 6px 0 0 0; font-size: 11px; color: #94a3b8; line-height: 16px;">
            This is an automated account welcome email. You received this message because an account was created on TalentXcel.
          </p>
        </div>
      `;

      plainText = `Hi ${name},\n\nWelcome to TalentXcel. Your next career chapter starts here.\n\nYour account is now active, and you have access to a connected professional ecosystem designed to help you build your identity, unlock opportunities and accelerate your career.\n\nThe world of work is evolving. Your professional journey should evolve with it.\n\nTalentXcel combines AI-powered career intelligence, professional networking, digital career credentials, job discovery and continuous skill development to help you stay prepared, visible and connected.\n\nEverything You Need to Move Your Career Forward:\n\n01. Build a Stronger Resume: https://talentxcel.in/resume/ats-check\n02. Create Your Career Passport: https://talentxcel.in/passport\n03. Discover Your Next Opportunity: https://talentxcel.in/jobs\n04. Navigate Your Career with AI: https://careers.talentxcel.in/ai-career-hub\n05. Know Your Professional Worth: https://salary.talentxcel.in/index-salary.html\n06. Connect with the Professional World: https://talentxcel.in/network/articles\n07. Prepare. Perform. Progress.: https://talentxcel.in/dashboard\n\nMake Your First Move:\n1. Complete your professional profile.\n2. Run your first ATS resume assessment.\n3. Create your Career Passport.\n\nThink beyond the resume. Build your professional identity. Discover your potential. Create your next opportunity.\n\nGET STARTED WITH TALENTXCEL: https://talentxcel.in/dashboard\n\nWe look forward to being part of your journey.\nTeam TalentXcel\nwww.talentxcel.in\n\nYour Career. Your Identity. Your Next Opportunity.\nThis is an automated account welcome email.`;
      break;
    }

    case 'profile_incomplete':
    case 'profile_completion_reminder': {
      category = 'engagement';
      const completeness = escapeHtml(vars.completeness || '65%');
      const missingSection = escapeHtml(vars.missingSection || 'Portfolio, Key Projects & Work Highlights');
      subject = `Complete your TalentXcel profile to unlock 3x recruiter search visibility`;
      preheader = `Your profile is at ${completeness}. Adding ${missingSection} gives you priority visibility with top hiring managers and recruiters.`;

      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 class="hero-title" style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">
            Your profile is ${completeness} complete, ${name}.
          </h1>
          <p style="margin: 0; font-size: 15px; color: #6e6e73;">
            Candidates with completed Career Passports receive 3.4x more recruiter profile views and direct connection requests.
          </p>
        </div>

        ${renderActionTiles([
          {
            image: `${CANONICAL_URL}/assets/email/welcome-feature-2.png`,
            title: 'Complete Your Career Passport',
            description: 'Add verified achievements, project case studies, and certifications to reach 100% completeness.',
            url: `${CANONICAL_URL}/passport`
          }
        ])}

        ${renderDataCard([
          { label: 'Current Completeness', value: completeness },
          { label: 'Recommended Next Step', value: missingSection },
          { label: 'Est. Completion Time', value: '2 Minutes' },
          { label: 'Search Visibility Impact', value: '+240% Priority Rank' }
        ])}

        ${renderButton('Complete Your Profile', `${CANONICAL_URL}/profile/edit`)}
      `;

      plainText = `Hi ${name}, your TalentXcel profile is ${completeness} complete. Complete ${missingSection} to boost recruiter views: ${CANONICAL_URL}/profile/edit`;
      break;
    }

    case 'career_map_ready': {
      category = 'engagement';
      const targetRole = escapeHtml(vars.targetRole || 'Strategy & Operations Director');
      const timeHorizon = escapeHtml(vars.timeHorizon || '3-5 Years');
      const skillGaps = escapeHtml(vars.skillGaps || 'Enterprise Cross-Functional Leadership, P&L Modeling, Growth Strategy');
      const ctcCorridor = escapeHtml(vars.ctcCorridor || '₹35L - ₹55L PA');
      subject = `Your AI Career Pathway Roadmap is Ready: ${targetRole} 🧭`;
      preheader = `We analyzed 10,000+ career trajectories to chart your fastest path to ${targetRole}.`;

      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 class="hero-title" style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">
            Your Career Pathway to ${targetRole}
          </h1>
          <p style="margin: 0; font-size: 15px; color: #6e6e73;">
            Our Career Pathway intelligence engine generated a milestone-by-milestone roadmap for your skills.
          </p>
        </div>

        ${renderActionTiles([
          {
            image: `${CANONICAL_URL}/assets/email/welcome-feature-4.png`,
            title: 'Explore AI Milestone Roadmap',
            description: 'View personalized skill bridges, execution milestones, and compensation benchmark corridors.',
            url: `${CANONICAL_URL}/ai-career-map`
          }
        ])}

        ${renderDataCard([
          { label: 'Target Role', value: targetRole },
          { label: 'Target Horizon', value: timeHorizon },
          { label: 'Core Skill Gaps', value: skillGaps },
          { label: 'Target CTC Corridor', value: ctcCorridor }
        ])}

        ${renderButton('Explore Your AI Career Roadmap', `${CANONICAL_URL}/ai-career-map`)}
      `;

      plainText = `Hi ${name}, your AI Career Roadmap to ${targetRole} is ready. View milestones: ${CANONICAL_URL}/ai-career-map`;
      break;
    }

    case 'career_passport_verified': {
      category = 'transactional';
      const badgeTitle = escapeHtml(vars.badgeTitle || 'Professional Domain Excellence & Leadership');
      const passportId = escapeHtml(vars.passportId || 'TXC-PASS-84920');
      subject = `Career Passport Verified: ${badgeTitle} ✅`;
      preheader = 'Your verified credentials, achievements and skill benchmarks are active on TalentXcel.';

      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 class="hero-title" style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">
            Career Passport Verified
          </h1>
          <p style="margin: 0; font-size: 15px; color: #6e6e73;">
            Congratulations, ${name}. Your career profile and achievements have received an authenticated verification badge.
          </p>
        </div>

        ${renderActionTiles([
          {
            image: `${CANONICAL_URL}/assets/email/welcome-feature-2.png`,
            title: 'Cryptographic Career Passport',
            description: 'Your verified credentials and achievements are tamper-proof and shareable directly with hiring leaders.',
            url: `${CANONICAL_URL}/passport`
          }
        ])}

        ${renderDataCard([
          { label: 'Passport Credential ID', value: passportId },
          { label: 'Verified Competency', value: badgeTitle },
          { label: 'Verification Standard', value: 'Proof-of-Work & Peer Audit' },
          { label: 'Recruiter Badge Status', value: 'Active on Network' }
        ])}

        ${renderButton('View Verified Career Passport', `${CANONICAL_URL}/passport`)}
      `;

      plainText = `Hi ${name}, your Career Passport (${passportId}) is verified for ${badgeTitle}. View: ${CANONICAL_URL}/passport`;
      break;
    }

    case 'weekly_summary':
    case 'weekly_candidate_digest': {
      category = 'engagement';
      const views = escapeHtml(vars.views || '48');
      const appearances = escapeHtml(vars.appearances || '134');
      const matches = escapeHtml(vars.matches || '12');
      subject = `Your TalentXcel Weekly Network & Career Digest 📊`;
      preheader = `${views} recruiter views, ${appearances} search appearances, and ${matches} new matching jobs this week.`;

      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 class="hero-title" style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">
            Your Weekly Activity Summary
          </h1>
          <p style="margin: 0; font-size: 15px; color: #6e6e73;">
            Here is how your profile and network performed across TalentXcel this past week:
          </p>
        </div>

        ${renderDataCard([
          { label: 'Recruiter Profile Views', value: `${views} Views` },
          { label: 'Talent Search Appearances', value: `${appearances} Times` },
          { label: 'New Curated Role Matches', value: `${matches} Verified Jobs` },
          { label: 'Most In-Demand Stack', value: 'Go, PostgreSQL, Kubernetes' }
        ])}

        ${renderButton('Open Your Career Dashboard', `${CANONICAL_URL}/dashboard`)}
      `;

      plainText = `Hi ${name}, here is your weekly summary:\n- Recruiter Views: ${views}\n- Search Appearances: ${appearances}\n- New Matches: ${matches}\n\nView details: ${CANONICAL_URL}/dashboard`;
      break;
    }

    // ═════════════════════════════════════════════════════════════════════════
    // 2. THE PROFESSIONAL SOCIAL NETWORK (/network) (6 - 13)
    // ═════════════════════════════════════════════════════════════════════════

    case 'connection_request':
    case 'new_connection': {
      category = 'engagement';
      const sender = escapeHtml(vars.senderName || vars.requester_name || 'Vikram Rao');
      const senderTitle = escapeHtml(vars.senderTitle || vars.requester_title || 'Lead Architect at Razorpay');
      subject = `${sender} wants to connect with you on TalentXcel 🤝`;
      preheader = `${sender} (${senderTitle}) sent you a connection request.`;

      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 class="hero-title" style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">
            New Connection Request
          </h1>
          <p style="margin: 0; font-size: 15px; color: #6e6e73;">
            <strong>${sender}</strong> would like to connect with you on the TalentXcel professional network.
          </p>
        </div>

        ${renderDataCard([
          { label: 'Member', value: sender },
          { label: 'Current Role', value: senderTitle },
          { label: 'Mutual Tech Focus', value: 'Cloud Infrastructure & High-Scale APIs' },
          { label: 'Network Location', value: 'Bengaluru, India' }
        ])}

        ${renderButton('View & Respond to Request', `${CANONICAL_URL}/network/requests`)}
      `;

      plainText = `${sender} (${senderTitle}) wants to connect with you on TalentXcel: ${CANONICAL_URL}/network/requests`;
      break;
    }

    case 'connection_accepted': {
      category = 'engagement';
      const connectionName = escapeHtml(vars.connectionName || vars.name || 'Sneha Roy');
      const connectionTitle = escapeHtml(vars.connectionTitle || 'Director of Commercial Growth & Operations');
      subject = `${connectionName} accepted your connection request! 🎉`;
      preheader = `You and ${connectionName} are now connected on TalentXcel. Start a conversation.`;

      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 class="hero-title" style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">
            Connection Request Accepted
          </h1>
          <p style="margin: 0; font-size: 15px; color: #6e6e73;">
            <strong>${connectionName}</strong> has accepted your connection request. Your professional network just expanded.
          </p>
        </div>

        ${renderDataCard([
          { label: 'Connected With', value: connectionName },
          { label: 'Role', value: connectionTitle },
          { label: 'Network Access', value: 'Direct Messaging & Profile Collaboration' }
        ])}

        ${renderButton('Send a Message', `${CANONICAL_URL}/network/messages`)}
      `;

      plainText = `Hi ${name}, ${connectionName} accepted your connection request! Send a message: ${CANONICAL_URL}/network/messages`;
      break;
    }

    case 'direct_message':
    case 'message_notification': {
      category = 'engagement';
      const sender = escapeHtml(vars.senderName || 'Rahul Deshmukh');
      const preview = escapeHtml(vars.messagePreview || 'Hi! Loved your recent insights on market expansion and leadership roadmaps. Would love to collaborate and exchange notes...');
      subject = `New message from ${sender} on TalentXcel 💬`;
      preheader = `"${preview.slice(0, 80)}..."`;

      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 class="hero-title" style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">
            You have a new message
          </h1>
          <p style="margin: 0; font-size: 15px; color: #6e6e73;">
            <strong>${sender}</strong> sent you a direct message on TalentXcel.
          </p>
        </div>

        <div style="background-color: #f5f5f7; border-left: 4px solid #0071e3; border-radius: 8px; padding: 18px 20px; margin: 24px 0; font-size: 14px; line-height: 22px; color: #1d1d1f; font-style: italic;">
          "${preview}"
        </div>

        ${renderButton('Reply to Message', `${CANONICAL_URL}/network/messages`)}
      `;

      plainText = `New message from ${sender}: "${preview}"\n\nReply here: ${CANONICAL_URL}/network/messages`;
      break;
    }

    case 'mention_notification': {
      category = 'engagement';
      const author = escapeHtml(vars.authorName || 'Karthik Raja');
      const postTitle = escapeHtml(vars.postTitle || 'Navigating Industry Transformations & High-Impact Execution');
      subject = `${author} mentioned you in a discussion on TalentXcel 📣`;
      preheader = `${author} tagged you in "${postTitle}". Join the conversation.`;

      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 class="hero-title" style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">
            You were mentioned by ${author}
          </h1>
          <p style="margin: 0; font-size: 15px; color: #6e6e73;">
            ${author} mentioned you in a professional post: <strong>"${postTitle}"</strong>.
          </p>
        </div>

        ${renderDataCard([
          { label: 'Post Discussion', value: postTitle },
          { label: 'Mentioned By', value: author },
          { label: 'Channel', value: escapeHtml(vars.channel || 'Industry Leadership & Strategic Discussions') }
        ])}

        ${renderButton('View Discussion & Reply', `${CANONICAL_URL}/network/posts`)}
      `;

      plainText = `${author} mentioned you in "${postTitle}". View post: ${CANONICAL_URL}/network/posts`;
      break;
    }

    case 'event_invitation': {
      category = 'engagement';
      const eventTitle = escapeHtml(vars.eventTitle || 'Global Leadership Roundtable: Navigating Industry Evolution');
      const host = escapeHtml(vars.hostName || 'TalentXcel Executive Network');
      const eventDate = escapeHtml(vars.eventDate || 'Saturday, 14 Nov 2026, 6:00 PM IST');
      subject = `Event Invitation: ${eventTitle} 🗓️`;
      preheader = `You're invited to join ${eventTitle} hosted by ${host}.`;

      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 class="hero-title" style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">
            ${eventTitle}
          </h1>
          <p style="margin: 0; font-size: 15px; color: #6e6e73;">
            You are invited to an interactive live roundtable and AMA hosted by ${host}.
          </p>
        </div>

        ${renderDataCard([
          { label: 'Event', value: eventTitle },
          { label: 'Date & Time', value: eventDate },
          { label: 'Format', value: 'Live Virtual Session & Interactive Q&A' },
          { label: 'Host', value: host }
        ])}

        ${renderButton('RSVP & Reserve Your Seat', `${CANONICAL_URL}/network/events`)}
      `;

      plainText = `You're invited to "${eventTitle}" on ${eventDate}. RSVP here: ${CANONICAL_URL}/network/events`;
      break;
    }

    case 'community_invite': {
      category = 'engagement';
      const communityName = escapeHtml(vars.communityName || 'Global Strategy & Operations Leadership Guild');
      const memberCount = escapeHtml(vars.memberCount || '3,420 Verified Professionals');
      subject = `You're invited to join ${communityName} 👥`;
      preheader = `Connect with ${memberCount} sharing industry insights and leadership opportunities.`;

      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 class="hero-title" style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">
            Join ${communityName}
          </h1>
          <p style="margin: 0; font-size: 15px; color: #6e6e73;">
            Based on your professional profile and credentials, you've been invited to join this private leadership circle.
          </p>
        </div>

        ${renderDataCard([
          { label: 'Community', value: communityName },
          { label: 'Members', value: memberCount },
          { label: 'Primary Topics', value: escapeHtml(vars.primaryTopics || 'Strategic Leadership, Market Expansion, Operational Excellence') },
          { label: 'Moderation', value: 'Verified Industry Leaders Only' }
        ])}

        ${renderButton('Accept Community Invite', `${CANONICAL_URL}/network/communities`)}
      `;

      plainText = `You're invited to join ${communityName}. Join here: ${CANONICAL_URL}/network/communities`;
      break;
    }

    case 'skill_swap_request': {
      category = 'engagement';
      const peerName = escapeHtml(vars.peerName || 'Ananya Sen');
      const offeringSkill = escapeHtml(vars.offeringSkill || 'Brand Strategy & Commercial Growth');
      const seekingSkill = escapeHtml(vars.seekingSkill || 'Executive Financial Modeling & Analytics');
      subject = `Skill Swap Request from ${peerName}: ${offeringSkill} ⇄ ${seekingSkill} 🔄`;
      preheader = `${peerName} wants to swap 1-on-1 professional knowledge sessions with you.`;

      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 class="hero-title" style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">
            New Skill Swap Request
          </h1>
          <p style="margin: 0; font-size: 15px; color: #6e6e73;">
            <strong>${peerName}</strong> noticed your expertise in <strong>${seekingSkill}</strong> and would like to exchange professional insights.
          </p>
        </div>

        ${renderDataCard([
          { label: 'Peer Member', value: peerName },
          { label: 'Offers Knowledge In', value: offeringSkill },
          { label: 'Interested in Learning', value: seekingSkill },
          { label: 'Format', value: '45-Min Peer Exchange Session' }
        ])}

        ${renderButton('Review Skill Swap Request', `${CANONICAL_URL}/network/skill-swap`)}
      `;

      plainText = `${peerName} wants to swap skills (${offeringSkill} for ${seekingSkill}). Review: ${CANONICAL_URL}/network/skill-swap`;
      break;
    }

    case 'post_trending': {
      category = 'engagement';
      const postTitle = escapeHtml(vars.postTitle || 'Frameworks for Scaling High-Performing Multi-Disciplinary Teams');
      const impressionCount = escapeHtml(vars.impressionCount || '8,920 Impressions');
      subject = `Your post is trending on TalentXcel! 🔥`;
      preheader = `"${postTitle}" just passed ${impressionCount} across the professional feed.`;

      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 class="hero-title" style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">
            Your post is gaining traction!
          </h1>
          <p style="margin: 0; font-size: 15px; color: #6e6e73;">
            Your publication <strong>"${postTitle}"</strong> has been featured on the network homepage.
          </p>
        </div>

        ${renderDataCard([
          { label: 'Publication', value: postTitle },
          { label: 'Total Reach', value: impressionCount },
          { label: 'Community Reactions', value: '430+ Endorsements & 84 Comments' },
          { label: 'New Followers Gained', value: '+38 Industry Peers' }
        ])}

        ${renderButton('View Post & Engage with Readers', `${CANONICAL_URL}/network/posts`)}
      `;

      plainText = `Your post "${postTitle}" is trending with ${impressionCount}. View analytics: ${CANONICAL_URL}/network/posts`;
      break;
    }

    // ═════════════════════════════════════════════════════════════════════════
    // 3. REELS & VIDEO INTROS (/reels) (14)
    // ═════════════════════════════════════════════════════════════════════════

    case 'reel_activity_alert': {
      category = 'engagement';
      const company = escapeHtml(vars.companyName || 'Atlassian India');
      const reelTitle = escapeHtml(vars.reelTitle || '30-Sec Pitch: Distributed Systems & Raft Consensus');
      const watchTime = escapeHtml(vars.watchTime || '100% Full Watch');
      subject = `A recruiter from ${company} watched your Video Reel 🎬`;
      preheader = `${company} reviewed your 30-second elevator pitch on TalentXcel Reels.`;

      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 class="hero-title" style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">
            Recruiter Watched Your Reel
          </h1>
          <p style="margin: 0; font-size: 15px; color: #6e6e73;">
            A verified hiring team from <strong>${company}</strong> watched your video elevator pitch: <strong>"${reelTitle}"</strong>.
          </p>
        </div>

        ${renderDataCard([
          { label: 'Interested Company', value: company },
          { label: 'Reel Highlight', value: reelTitle },
          { label: 'Engagement Level', value: watchTime },
          { label: 'Recruiter Action', value: 'Saved to Candidate Shortlist' }
        ])}

        ${renderButton('Manage Your Reels & Pitches', `${CANONICAL_URL}/reels`)}
      `;

      plainText = `A recruiter from ${company} watched your video reel "${reelTitle}". Manage reels: ${CANONICAL_URL}/reels`;
      break;
    }

    // ═════════════════════════════════════════════════════════════════════════
    // 4. RESUME BUILDER & ATS DIAGNOSTICS (/resume) (15 - 17)
    // ═════════════════════════════════════════════════════════════════════════

    case 'resume_created': {
      category = 'transactional';
      const resumeTitle = escapeHtml(vars.resumeTitle || 'Senior Backend Engineer (Go/Distributed Systems)');
      subject = `Resume Created Successfully: ${resumeTitle} 📄`;
      preheader = 'Your ATS-optimized resume has been generated and is ready to download.';

      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 class="hero-title" style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">
            Resume Created Successfully
          </h1>
          <p style="margin: 0; font-size: 15px; color: #6e6e73;">
            Your resume <strong>${resumeTitle}</strong> is saved and formatted with clean parsing typography for company applicant tracking systems.
          </p>
        </div>

        ${renderDataCard([
          { label: 'Resume Name', value: resumeTitle },
          { label: 'Format Compatibility', value: 'PDF & Clean Text Parsing' },
          { label: 'ATS Optimization Status', value: 'Scored & Ready' }
        ])}

        ${renderButton('Edit & Download Resume', `${CANONICAL_URL}/resume/builder`)}
      `;

      plainText = `Your resume "${resumeTitle}" is ready. Download it here: ${CANONICAL_URL}/resume/builder`;
      break;
    }

    case 'ats_score_ready':
    case 'resume_feedback': {
      category = 'transactional';
      const score = escapeHtml(vars.score || '88/100');
      const targetRole = escapeHtml(vars.targetRole || 'Senior Operations & Strategy Lead');
      subject = `ATS Resume Diagnostic Ready: ${score} Score for ${targetRole} 🎯`;
      preheader = `Detailed keyword parse analysis, formatting check, and suggestions are ready.`;

      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 class="hero-title" style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">
            ATS Diagnostic Score: ${score}
          </h1>
          <p style="margin: 0; font-size: 15px; color: #6e6e73;">
            Here is how your resume parsed against current hiring benchmarks for <strong>${targetRole}</strong>:
          </p>
        </div>

        ${renderActionTiles([
          {
            image: `${CANONICAL_URL}/assets/email/welcome-feature-1.png`,
            title: 'Deep ATS Diagnostic & Keyword Optimizer',
            description: 'Review parsing integrity, skill gap analysis, and tailored recommendations for target roles.',
            url: `${CANONICAL_URL}/resume/ats-check`
          }
        ])}

        ${renderDataCard([
          { label: 'Overall Score', value: score },
          { label: 'Keyword Alignment', value: escapeHtml(vars.keywordAlignment || 'Strong (P&L Management, Strategic Planning, Operations)') },
          { label: 'Missing High-Value Tags', value: escapeHtml(vars.missingTags || 'Cross-Functional Governance, Financial Modeling, OKRs') },
          { label: 'Parse Integrity', value: '100% Machine-Readable' }
        ])}

        ${renderButton('View Full ATS Breakdown', `${CANONICAL_URL}/resume/ats-check`)}
      `;

      plainText = `Your ATS Resume score for ${targetRole} is ${score}. View diagnostic breakdown: ${CANONICAL_URL}/resume/ats-check`;
      break;
    }

    case 'resume_viewed':
    case 'resume_viewed_alert': {
      category = 'engagement';
      const company = escapeHtml(vars.companyName || 'PhonePe');
      const location = escapeHtml(vars.location || 'Bengaluru');
      const targetDomain = escapeHtml(vars.targetDomain || 'leadership & specialist');
      subject = `A recruiter from ${company} viewed your Career Profile 👀`;
      preheader = `Your resume appeared in a recruiter candidate search for senior ${targetDomain} roles.`;

      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 class="hero-title" style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">
            Recruiter Profile View
          </h1>
          <p style="margin: 0; font-size: 15px; color: #6e6e73;">
            A verified hiring team member from <strong>${company}</strong> (${location}) inspected your Career Passport and resume.
          </p>
        </div>

        ${renderDataCard([
          { label: 'Interested Company', value: company },
          { label: 'Search Corridor', value: location },
          { label: 'Primary Match Domain', value: escapeHtml(vars.matchDomain || 'Commercial Growth & Operations Leadership') },
          { label: 'Activity Time', value: 'Today' }
        ])}

        ${renderButton('View Profile Insights & Analytics', `${CANONICAL_URL}/network/analytics`)}
      `;

      plainText = `A recruiter from ${company} viewed your Career Profile. View analytics: ${CANONICAL_URL}/network/analytics`;
      break;
    }

    // ═════════════════════════════════════════════════════════════════════════
    // 5. JOBS, GOVERNMENT & DIRECT APPLICATIONS (18 - 21)
    // ═════════════════════════════════════════════════════════════════════════

    case 'job_match_alert':
    case 'job_opening': {
      category = 'engagement';
      const role = escapeHtml(vars.role || 'Senior Growth & Commercial Director');
      const company = escapeHtml(vars.company || 'Razorpay');
      const salary = escapeHtml(vars.salary || '₹40L - ₹55L PA');
      subject = `New Job Match: ${role} at ${company} 💼`;
      preheader = `Matches 92% of your verified skills. View verified compensation benchmarks.`;

      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 class="hero-title" style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">
            ${role}
          </h1>
          <p style="margin: 0; font-size: 15px; color: #6e6e73;">
            A new role matching your professional background and domain expertise was published by <strong>${company}</strong>.
          </p>
        </div>

        ${renderActionTiles([
          {
            image: `${CANONICAL_URL}/assets/email/welcome-feature-3.png`,
            title: 'Curated Opportunity & Fast-Track Application',
            description: 'Direct recruiter pipeline with priority review for candidates with completed Career Passports.',
            url: `${CANONICAL_URL}/jobs`
          }
        ])}

        ${renderDataCard([
          { label: 'Company', value: company },
          { label: 'Compensation Band', value: salary },
          { label: 'Location', value: 'Bengaluru / Hybrid' },
          { label: 'Skill Match Score', value: '92% Compatibility' }
        ])}

        ${renderButton('View Job & Apply Directly', `${CANONICAL_URL}/jobs`)}
      `;

      plainText = `Job Match: ${role} at ${company} (${salary}). View and apply: ${CANONICAL_URL}/jobs`;
      break;
    }

    case 'gov_job_alert': {
      category = 'engagement';
      const org = escapeHtml(vars.org || 'ISRO / Department of Space');
      const post = escapeHtml(vars.post || 'Scientist / Engineer ‘SC’ (Computer Science)');
      const payScale = escapeHtml(vars.payScale || 'Level 10 (₹56,100 - ₹1,77,500)');
      const lastDate = escapeHtml(vars.lastDate || '28 Nov 2026');
      subject = `Government Job Alert: ${post} at ${org} 🏛️`;
      preheader = `New PSU / Central Technical notification released. Applications close ${lastDate}.`;

      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 class="hero-title" style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">
            ${post}
          </h1>
          <p style="margin: 0; font-size: 15px; color: #6e6e73;">
            A new official technical recruitment notification has been published by <strong>${org}</strong>.
          </p>
        </div>

        ${renderDataCard([
          { label: 'Organization', value: org },
          { label: 'Cadre / Role', value: post },
          { label: 'Pay Band / Scale', value: payScale },
          { label: 'Application Deadline', value: lastDate }
        ])}

        ${renderButton('View Official Notification & Syllabus', `${CANONICAL_URL}/government-jobs`)}
      `;

      plainText = `Government Job Alert: ${post} at ${org}. Deadline: ${lastDate}. View: ${CANONICAL_URL}/government-jobs`;
      break;
    }

    case 'application_confirmation':
    case 'application_received': {
      category = 'transactional';
      const role = escapeHtml(vars.role || 'Lead Frontend Architect');
      const company = escapeHtml(vars.company || 'CRED');
      const appId = escapeHtml(vars.applicationId || 'TXC-APP-99412');
      subject = `Application Submitted: ${role} at ${company} ✅`;
      preheader = `Application ID: ${appId}. Your profile has been sent to the hiring team.`;

      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 class="hero-title" style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">
            Application Confirmed
          </h1>
          <p style="margin: 0; font-size: 15px; color: #6e6e73;">
            Your application for <strong>${role}</strong> at <strong>${company}</strong> was delivered directly to the employer workspace.
          </p>
        </div>

        ${renderDataCard([
          { label: 'Role Applied', value: role },
          { label: 'Company', value: company },
          { label: 'Application ID', value: appId },
          { label: 'Status', value: 'Under Review by Hiring Team' }
        ])}

        ${renderButton('Track Your Applications', `${CANONICAL_URL}/jobs/my-applications`)}
      `;

      plainText = `Your application for ${role} at ${company} was submitted. Application ID: ${appId}. Track: ${CANONICAL_URL}/jobs/my-applications`;
      break;
    }

    case 'saved_job_reminder':
    case 'saved_job_closing_soon': {
      category = 'engagement';
      const role = escapeHtml(vars.role || 'Senior Growth & Commercial Director');
      const company = escapeHtml(vars.company || 'Groww');
      const deadline = escapeHtml(vars.deadline || '48 Hours');
      subject = `Saved Job Closing Soon: ${role} at ${company} ⏰`;
      preheader = `Applications close in ${deadline}. Don't miss this opportunity.`;

      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 class="hero-title" style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">
            Application Closing Soon
          </h1>
          <p style="margin: 0; font-size: 15px; color: #6e6e73;">
            Your saved opening for <strong>${role}</strong> at <strong>${company}</strong> is closing soon.
          </p>
        </div>

        ${renderDataCard([
          { label: 'Position', value: role },
          { label: 'Company', value: company },
          { label: 'Deadline Remaining', value: deadline },
          { label: 'Submission Mode', value: '1-Click Apply with Career Passport' }
        ])}

        ${renderButton('Submit Application Now', `${CANONICAL_URL}/jobs`)}
      `;

      plainText = `Your saved job ${role} at ${company} closes in ${deadline}. Apply here: ${CANONICAL_URL}/jobs`;
      break;
    }

    // ═════════════════════════════════════════════════════════════════════════
    // 6. SALARY INTELLIGENCE & BENCHMARKS (/salary) (22)
    // ═════════════════════════════════════════════════════════════════════════

    case 'salary_benchmark_digest': {
      category = 'engagement';
      const domain = escapeHtml(vars.domain || vars.techStack || 'Strategy, Product Operations & Commercial Leadership');
      const percentile = escapeHtml(vars.percentile || 'Top 15% (75th Percentile)');
      const medianBand = escapeHtml(vars.medianBand || '₹35L - ₹52L PA');
      subject = `Industry Salary Benchmark: Where Your Experience Ranks 📈`;
      preheader = `National median compensation benchmarks for ${domain} are updated.`;

      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 class="hero-title" style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">
            Professional Salary Benchmark Digest
          </h1>
          <p style="margin: 0; font-size: 15px; color: #6e6e73;">
            Based on verified platform data, here is the updated salary band for <strong>${domain}</strong>:
          </p>
        </div>

        ${renderActionTiles([
          {
            image: `${CANONICAL_URL}/assets/email/welcome-feature-5.png`,
            title: 'Real-Time Salary Insights & Percentile Simulator',
            description: 'Compare compensation percentiles, bonus structures, and market compensation corridors across industries.',
            url: `${CANONICAL_URL}/salary`
          }
        ])}

        ${renderDataCard([
          { label: 'Domain & Skill Focus', value: domain },
          { label: 'Your Estimated Bracket', value: percentile },
          { label: 'Market 75th Percentile', value: medianBand },
          { label: 'Highest Paying Corridor', value: 'Bengaluru / Mumbai / National Metros' }
        ])}

        ${renderButton('Explore Salary Analyzer & Simulator', `${CANONICAL_URL}/salary`)}
      `;

      plainText = `Salary Benchmark for ${domain}: 75th percentile is ${medianBand}. View analyzer: ${CANONICAL_URL}/salary`;
      break;
    }

    // ═════════════════════════════════════════════════════════════════════════
    // 7. COLLEGES & CAMPUS PLACEMENT DRIVES (/colleges) (23 - 24)
    // ═════════════════════════════════════════════════════════════════════════

    case 'college_placement_alert': {
      category = 'engagement';
      const driveRole = escapeHtml(vars.driveRole || 'Graduate Software Development Engineer');
      const hiringCompany = escapeHtml(vars.hiringCompany || 'Cisco Systems');
      const eligibility = escapeHtml(vars.eligibility || 'B.Tech / M.Tech 2026 Batch (CGPA 7.5+)');
      subject = `Campus Placement Drive Alert: ${driveRole} at ${hiringCompany} 🎓`;
      preheader = `Exclusive drive open for verified college candidates. Eligible: ${eligibility}.`;

      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 class="hero-title" style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">
            Campus Hiring Drive: ${hiringCompany}
          </h1>
          <p style="margin: 0; font-size: 15px; color: #6e6e73;">
            A direct campus recruitment drive is accepting applications through the TalentXcel College Network.
          </p>
        </div>

        ${renderDataCard([
          { label: 'Hiring Company', value: hiringCompany },
          { label: 'Role Offered', value: driveRole },
          { label: 'Eligible Batches', value: eligibility },
          { label: 'Compensation Package', value: '₹18L - ₹24L CTC' }
        ])}

        ${renderButton('View College Placement Drive', `${CANONICAL_URL}/colleges`)}
      `;

      plainText = `Campus Drive: ${driveRole} at ${hiringCompany}. Eligible: ${eligibility}. Apply: ${CANONICAL_URL}/colleges`;
      break;
    }

    case 'college_partnership_welcome': {
      category = 'transactional';
      const collegeName = escapeHtml(vars.collegeName || 'National Institute of Technology');
      subject = `Welcome to TalentXcel Campus Portal, ${collegeName} 🎓`;
      preheader = 'Your institutional placement cell workspace is ready to connect students with verified corporate hiring partners & recruiters.';

      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 class="hero-title" style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">
            Welcome, ${collegeName}
          </h1>
          <p style="margin: 0; font-size: 15px; color: #6e6e73;">
            Your college placement director portal is active on the TalentXcel Institutional Network.
          </p>
        </div>

        ${renderDataCard([
          { label: 'Institution', value: collegeName },
          { label: 'Verified Student Profiles', value: 'Ready for Onboarding' },
          { label: 'Corporate Sourcing Hub', value: 'Connected to 500+ Hiring Partners' }
        ])}

        ${renderButton('Open Placement Cell Portal', `${CANONICAL_URL}/colleges`)}
      `;

      plainText = `Welcome ${collegeName} to TalentXcel Campus Portal! Access: ${CANONICAL_URL}/colleges`;
      break;
    }

    // ═════════════════════════════════════════════════════════════════════════
    // 8. RECRUITER OS & TALENT DISCOVERY (/employer, /talent) (25 - 28)
    // ═════════════════════════════════════════════════════════════════════════

    case 'employer_welcome': {
      category = 'transactional';
      const companyName = escapeHtml(vars.companyName || 'FinTech Velocity');
      subject = `Welcome to TalentXcel Recruiter OS, ${companyName} 🚀`;
      preheader = 'Your company hiring workspace is active. Start sourcing verified professional talent.';

      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 class="hero-title" style="margin: 16px 0 10px 0; font-size: 24px; font-weight: 700; color: #111827;">
            Welcome to Recruiter OS, ${companyName}
          </h1>
          <p style="margin: 0; font-size: 15px; line-height: 24px; color: #4b5563;">
            Your employer workspace is configured. Post verified openings, search pre-vetted candidate profiles across industries, and receive qualified applicants.
          </p>
        </div>

        ${renderActionTiles([
          {
            image: `${CANONICAL_URL}/assets/email/welcome-feature-6.png`,
            title: 'Search Pre-Vetted Talent Pool',
            description: 'Filter verified candidates by domain expertise, performance percentile, and availability.',
            url: `${CANONICAL_URL}/talent`
          },
          {
            image: `${CANONICAL_URL}/assets/email/welcome-feature-3.png`,
            title: 'Post a Verified Opening',
            description: 'Publish open roles syndicated directly to 100,000+ verified professionals across sectors.',
            url: `${CANONICAL_URL}/employer/post-job`
          },
          {
            image: `${CANONICAL_URL}/assets/email/welcome-feature-5.png`,
            title: 'Launch Pipeline Intelligence',
            description: 'Track candidate flow, scorecards, and team reviews in your employer ATS dashboard.',
            url: `${CANONICAL_URL}/employer/dashboard`
          }
        ])}

        ${renderButton('Open Employer Workspace', `${CANONICAL_URL}/employer/dashboard`)}
      `;

      plainText = `Welcome ${companyName} to TalentXcel Recruiter OS! Access your dashboard: ${CANONICAL_URL}/employer/dashboard`;
      break;
    }

    case 'talent_discovery_alert': {
      category = 'engagement';
      const searchCriteria = escapeHtml(vars.searchCriteria || 'Senior Strategy & Operations Directors (Bengaluru / Hybrid)');
      const candidateCount = escapeHtml(vars.candidateCount || '14 Verified Profiles');
      subject = `Talent Discovery Alert: ${candidateCount} matching your sourcing filter 🎯`;
      preheader = `New verified professionals matching "${searchCriteria}" joined the network this week.`;

      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 class="hero-title" style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">
            New Candidates Matching Your Sourcing Filter
          </h1>
          <p style="margin: 0; font-size: 15px; color: #6e6e73;">
            Our automated talent discovery engine found candidates matching your saved recruiter search:
          </p>
        </div>

        ${renderDataCard([
          { label: 'Saved Filter', value: searchCriteria },
          { label: 'New Matching Candidates', value: candidateCount },
          { label: 'Average ATS TalentScore', value: '91/100' },
          { label: 'Notice Period', value: 'Immediate to 30 Days' }
        ])}

        ${renderButton('Discover Candidates in Recruiter OS', `${CANONICAL_URL}/talent`)}
      `;

      plainText = `Talent Discovery: ${candidateCount} matching "${searchCriteria}". View candidate pool: ${CANONICAL_URL}/talent`;
      break;
    }

    case 'new_candidate_applied':
    case 'new_applicant': {
      category = 'transactional';
      const candidate = escapeHtml(vars.candidateName || 'Arjun Mehta');
      const role = escapeHtml(vars.role || 'Senior Growth & Commercial Director');
      const talentScore = escapeHtml(vars.talentScore || '94/100');
      subject = `New Application: ${candidate} applied for ${role} 📥`;
      preheader = `TalentScore Match: ${talentScore}. View verified credentials, achievements and resume.`;

      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 class="hero-title" style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">
            New Applicant: ${candidate}
          </h1>
          <p style="margin: 0; font-size: 15px; color: #6e6e73;">
            A candidate submitted their verified application for your <strong>${role}</strong> opening.
          </p>
        </div>

        ${renderDataCard([
          { label: 'Applicant', value: candidate },
          { label: 'Role', value: role },
          { label: 'ATS TalentScore', value: talentScore },
          { label: 'Verified Experience', value: escapeHtml(vars.experience || '8+ Years (Domain Leadership)') }
        ])}

        ${renderButton('Review Candidate in Dashboard', `${CANONICAL_URL}/employer/jobs`)}
      `;

      plainText = `${candidate} applied for ${role} (TalentScore: ${talentScore}). Review: ${CANONICAL_URL}/employer/jobs`;
      break;
    }

    case 'job_post_live': {
      category = 'transactional';
      const jobTitle = escapeHtml(vars.jobTitle || 'Commercial Operations Director');
      const location = escapeHtml(vars.location || 'Bengaluru');
      subject = `Job Listing is Live: ${jobTitle} 🌐`;
      preheader = `Your listing is published across TalentXcel and matching candidates are being notified.`;

      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 class="hero-title" style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">
            ${jobTitle} is Live
          </h1>
          <p style="margin: 0; font-size: 15px; color: #6e6e73;">
            Your opening is syndicated and active across the TalentXcel talent network.
          </p>
        </div>

        ${renderDataCard([
          { label: 'Position', value: jobTitle },
          { label: 'Location', value: location },
          { label: 'Syndication', value: 'TalentXcel Hub & Google Jobs' },
          { label: 'Matching Candidates', value: 'Notification Batch Enqueued' }
        ])}

        ${renderButton('Manage Job Postings', `${CANONICAL_URL}/employer/jobs`)}
      `;

      plainText = `Your job listing "${jobTitle}" is live on TalentXcel. Manage: ${CANONICAL_URL}/employer/jobs`;
      break;
    }

    // ═════════════════════════════════════════════════════════════════════════
    // 9. LEARNING HUB & CREDENTIALS (/learning) (29 - 30)
    // ═════════════════════════════════════════════════════════════════════════

    case 'course_recommendation': {
      category = 'engagement';
      const course = escapeHtml(vars.courseTitle || 'Enterprise Leadership & High-Growth Strategy');
      const targetDelta = escapeHtml(vars.ctcDelta || '+₹8L PA Salary Potential');
      subject = `Recommended Skill Track: ${course} 📚`;
      preheader = `Bridge your strategic skill gap and unlock higher senior compensation bands.`;

      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 class="hero-title" style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">
            Recommended Skill Track
          </h1>
          <p style="margin: 0; font-size: 15px; color: #6e6e73;">
            Based on your career roadmap, mastering <strong>${course}</strong> bridges your next career milestone.
          </p>
        </div>

        ${renderDataCard([
          { label: 'Recommended Course', value: course },
          { label: 'Target Career Impact', value: targetDelta },
          { label: 'Curated Provider', value: 'TalentXcel Learning Hub' },
          { label: 'Format', value: 'Hands-on Lab & Capstone Project' }
        ])}

        ${renderButton('Explore Skill Course', `${CANONICAL_URL}/learning`)}
      `;

      plainText = `Recommended Course: ${course} (${targetDelta}). Explore: ${CANONICAL_URL}/learning`;
      break;
    }

    case 'certificate_ready': {
      category = 'transactional';
      const certTitle = escapeHtml(vars.certificateTitle || 'Strategic Leadership & Operations Management');
      const certId = escapeHtml(vars.certificateId || 'TXC-CERT-2026-8812');
      subject = `Verifiable Certificate Ready: ${certTitle} 🏅`;
      preheader = `Certificate ID: ${certId}. Add your verified credential to your Career Passport.`;

      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 class="hero-title" style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">
            Certificate of Completion Ready
          </h1>
          <p style="margin: 0; font-size: 15px; color: #6e6e73;">
            Congratulations on completing your assessment in <strong>${certTitle}</strong>!
          </p>
        </div>

        ${renderActionTiles([
          {
            image: `${CANONICAL_URL}/assets/email/welcome-feature-2.png`,
            title: 'Verifiable Digital Certificate',
            description: 'Authenticated completion credential added to your Career Passport and LinkedIn profile.',
            url: `${CANONICAL_URL}/learning/certificates`
          }
        ])}

        ${renderDataCard([
          { label: 'Credential Title', value: certTitle },
          { label: 'Verification ID', value: certId },
          { label: 'Issuing Authority', value: escapeHtml(vars.issuingAuthority || 'TalentXcel Executive Council') },
          { label: 'Passport Badge', value: 'Added to Public Profile' }
        ])}

        ${renderButton('View & Download Certificate', `${CANONICAL_URL}/learning/certificates`)}
      `;

      plainText = `Congratulations! Your certificate for ${certTitle} (${certId}) is ready: ${CANONICAL_URL}/learning/certificates`;
      break;
    }

    // ═════════════════════════════════════════════════════════════════════════
    // 10. MARKETING, REFER & EARN, CREATOR GROWTH (31 - 35)
    // ═════════════════════════════════════════════════════════════════════════

    case 'refer_and_earn':
    case 'referral_invite': {
      category = 'marketing';
      const inviteLink = `${CANONICAL_URL}/refer-and-earn`;
      subject = `Invite Colleagues & Friends to TalentXcel: Earn Free Pro & Executive Recruiter Access 🎁`;
      preheader = `Earn free Pro upgrades, unlock verified recruiter directories, and boost your Career Passport visibility.`;

      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 class="hero-title" style="margin: 16px 0 10px 0; font-size: 24px; font-weight: 700; color: #111827;">
            Invite Friends. Earn Pro Access.
          </h1>
          <p style="margin: 0; font-size: 15px; line-height: 24px; color: #4b5563;">
            Help your colleagues, peers and batchmates accelerate their careers on TalentXcel and earn exclusive rewards for every verified member who joins.
          </p>
        </div>

        ${renderActionTiles([
          {
            image: `${CANONICAL_URL}/assets/email/welcome-feature-6.png`,
            title: '3 Referrals: 500+ Verified Hiring Leaders Directory',
            description: 'Direct email access to hiring heads across India, US, and EU enterprise teams.',
            url: inviteLink
          },
          {
            image: `${CANONICAL_URL}/assets/email/welcome-feature-1.png`,
            title: '5 Referrals: Free Pro Upgrade & ATS Optimizer',
            description: '1-Month Pro tier with unlimited AI resume diagnostics and priority visibility.',
            url: inviteLink
          },
          {
            image: `${CANONICAL_URL}/assets/email/welcome-feature-2.png`,
            title: '10 Referrals: Campus & Industry Ambassador Badge',
            description: 'Verified ambassador credential with top recruiter spotlight on /network.',
            url: inviteLink
          }
        ])}

        ${renderButton('Get Your Referral Link & Start Earning', inviteLink)}
      `;

      plainText = `Invite friends to TalentXcel and earn free Pro access + 500+ HR contacts: ${inviteLink}`;
      break;
    }

    case 'referral_reward_unlocked': {
      category = 'engagement';
      const friendName = escapeHtml(vars.friendName || 'Rohan Verma');
      const rewardTier = escapeHtml(vars.rewardTier || 'Tier 2: 1-Month Pro Membership Upgrade');
      subject = `Reward Unlocked! ${friendName} joined TalentXcel via your invite 🎉`;
      preheader = `You unlocked ${rewardTier}. Your Pro superpowers are now active.`;

      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 class="hero-title" style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">
            Congratulations, ${name}!
          </h1>
          <p style="margin: 0; font-size: 15px; color: #6e6e73;">
            <strong>${friendName}</strong> just joined TalentXcel using your unique invite link. You've officially reached your next reward milestone!
          </p>
        </div>

        ${renderDataCard([
          { label: 'New Member Joined', value: friendName },
          { label: 'Milestone Unlocked', value: rewardTier },
          { label: 'Pro Benefits', value: 'Unlimited ATS Scans & Priority Search Rank' },
          { label: 'Status', value: 'Instantly Activated on Your Account' }
        ])}

        ${renderButton('View Rewards & Invite More Friends', `${CANONICAL_URL}/refer-and-earn`)}
      `;

      plainText = `Reward Unlocked! ${friendName} joined TalentXcel. You earned ${rewardTier}. View your rewards: ${CANONICAL_URL}/refer-and-earn`;
      break;
    }

    case 'campus_ambassador_invite': {
      category = 'marketing';
      subject = `Become a TalentXcel Campus Ambassador — Lead on Your Campus 🎓`;
      preheader = `Represent India's premier professional network, organize placement drives, and gain direct mentorship.`;

      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 class="hero-title" style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">
            TalentXcel Student Ambassador Program
          </h1>
          <p style="margin: 0; font-size: 15px; color: #6e6e73;">
            We are looking for student and emerging leaders to represent TalentXcel across 10,000+ colleges and universities.
          </p>
        </div>

        ${renderDataCard([
          { label: 'Leadership Role', value: 'Campus Ambassador & Community Lead' },
          { label: 'Perks & Rewards', value: 'Free Pro Membership + Executive Mentorship' },
          { label: 'Campus Impact', value: 'Lead Campus Placement Drives & Seminars' },
          { label: 'Recognition', value: 'Official Verified Ambassador Credential' }
        ])}

        ${renderButton('Apply for Campus Ambassador', `${CANONICAL_URL}/colleges`)}
      `;

      plainText = `Become a TalentXcel Campus Ambassador! Apply here: ${CANONICAL_URL}/colleges`;
      break;
    }

    case 'creator_studio_invitation': {
      category = 'marketing';
      subject = `Write on TalentXcel Creator Studio: Reach 100,000+ Industry Leaders & Peers ✍️`;
      preheader = `Publish your case studies, insights, and thought leadership to get discovered by founders and hiring leaders.`;

      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 class="hero-title" style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">
            Publish Your Industry Insights & Articles
          </h1>
          <p style="margin: 0; font-size: 15px; color: #6e6e73;">
            Turn your real-world professional experiences and case studies into authority. Publish on TalentXcel Articles and build your thought leadership.
          </p>
        </div>

        ${renderActionTiles([
          {
            image: `${CANONICAL_URL}/assets/email/welcome-feature-6.png`,
            title: 'Publish Across TalentXcel Professional Network',
            description: 'Distribute articles directly to 100,000+ industry leaders, founders, and peers.',
            url: `${CANONICAL_URL}/network/articles`
          }
        ])}

        ${renderDataCard([
          { label: 'Audience Reach', value: '100,000+ Verified Professionals & Hiring Teams' },
          { label: 'Featured Channels', value: 'Strategy, Leadership, Operations, Product & Tech' },
          { label: 'Author Visibility', value: 'Pinned to Career Passport & Network Feed' },
          { label: 'Creator Tools', value: 'Rich Article Editor, Analytics & Direct Distribution' }
        ])}

        ${renderButton('Start Writing on Creator Studio', `${CANONICAL_URL}/network/articles`)}
      `;

      plainText = `Publish your articles on TalentXcel Creator Studio. Start writing: ${CANONICAL_URL}/network/articles`;
      break;
    }

    case 'contact_auto_reply':
    default: {
      category = 'transactional';
      const inquiryTopic = escapeHtml(vars.topic || vars.subject || 'Platform Partnership & Sourcing');
      subject = `We received your message, ${name} - TalentXcel`;
      preheader = 'Thank you for contacting TalentXcel. Our team will review and reply within 12-24 business hours.';

      contentHtml = `
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 class="hero-title" style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">
            We received your message
          </h1>
          <p style="margin: 0; font-size: 15px; color: #6e6e73;">
            Thank you for reaching out to TalentXcel. A dedicated member of our team is reviewing your inquiry.
          </p>
        </div>

        ${renderDataCard([
          { label: 'Topic / Subject', value: inquiryTopic },
          { label: 'Submitted By', value: email || name },
          { label: 'Target Response Time', value: '12 - 24 Business Hours' },
          { label: 'Support Queue', value: 'General Operations & Partnerships' }
        ])}

        ${renderButton('Explore TalentXcel Platform', `${CANONICAL_URL}`)}
      `;

      plainText = `Hi ${name}, we received your message regarding "${inquiryTopic}". We will respond within 12-24 business hours.`;
      break;
    }
  }

  const unsubscribeUrl = category !== 'transactional'
    ? `${CANONICAL_URL}/unsubscribe?email=${encodeURIComponent(recipientEmail)}`
    : undefined;

  const html = wrapInMasterLayout({
    title: subject,
    preheader,
    contentHtml,
    category,
    recipientEmail,
    unsubscribeUrl
  });

  return { subject, html, plainText, category };
}


export const renderTemplate = renderEnterpriseTemplate;
export const baseEmailLayout = wrapInMasterLayout;


// ─────────────────────────────────────────────────────────────────────────────
// MAIN SERVERLESS HANDLER
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

  // Platform email templates and public lifecycle triggers allowed from application
  const isPlatformTemplate = typeof payload?.template === 'string' && payload.template.length > 0;
  const origin = ((req.headers.origin as string) || (req.headers.referer as string) || '').toLowerCase();
  const isSameOrigin = origin.includes('talentxcel.in') || origin.includes('localhost') || origin.includes('127.0.0.1');
  const isPublicContact = payload?.template === 'contact_enquiry' || payload?.template === 'contact_auto_reply';

  const isAuthorized =
    isVercelCron ||
    isPlatformTemplate ||
    isSameOrigin ||
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
