// src/services/email/emailTemplates.ts
/**
 * TalentXcel Centralized Email Templates
 * Responsive, clean, deterministic email designs with plain-text counterparts.
 * Variable escaping is strictly enforced to prevent HTML injection.
 */

import type { EmailCategory, RenderedEmail } from './emailTypes';
import { buildUnsubscribeUrl } from './emailUnsubscribe';

/**
 * Escapes HTML characters in user-provided strings
 */
export function escapeHtml(unsafe: any): string {
  if (unsafe === null || unsafe === undefined) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const CANONICAL_URL = 'https://talentxcel.in';

/**
 * Base Responsive HTML Container
 */
function wrapInBaseLayout(options: {
  title: string;
  preheader: string;
  contentHtml: string;
  category: EmailCategory;
  unsubscribeUrl?: string;
  recipientEmail?: string;
}): string {
  const currentYear = new Date().getFullYear();
  const showUnsubscribe = options.category !== 'transactional' && options.unsubscribeUrl;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(options.title)}</title>
  <!--[if mso]>
  <style type="text/css">
    table {border-collapse:collapse;border-spacing:0;margin:0;}
    div, td {padding:0;}
    div {margin:0 !important;}
  </style>
  <![endif]-->
  <style>
    body { margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
    table { border-collapse: separate; }
    a { color: #2563eb; text-decoration: none; }
    .btn-primary:hover { background-color: #1d4ed8 !important; }
    @media only screen and (max-width: 620px) {
      .wrapper { width: 100% !important; padding: 12px !important; }
      .content-box { padding: 24px 18px !important; }
      .header-title { font-size: 22px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; color: #1e293b;">
  <!-- Preheader text for inbox preview -->
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
            <td class="content-box" style="background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 36px 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);">
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
                &copy; ${currentYear} TalentXcel. All rights reserved.
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
                  <a href="${options.unsubscribeUrl}" style="color: #ef4444; font-weight: 600; text-decoration: underline;">Unsubscribe</a>
                  &bull;
                  <a href="${options.unsubscribeUrl}" style="color: #64748b; text-decoration: underline;">Preferences</a>
                ` : ''}
              </div>
              ${options.category === 'transactional' ? `
                <p style="margin: 12px 0 0 0; font-size: 11px; color: #94a3b8;">
                  This is an essential security or account transactional notification for ${escapeHtml(options.recipientEmail || 'your account')}.
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

/**
 * Standard Primary CTA Button
 */
function renderButton(label: string, url: string): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 28px auto; text-align: center;">
      <tr>
        <td align="center" style="border-radius: 8px; background: #2563eb;">
          <a href="${escapeHtml(url)}" target="_blank" class="btn-primary" style="font-size: 15px; font-weight: 600; color: #ffffff; text-decoration: none; padding: 13px 28px; border-radius: 8px; display: inline-block; background-color: #2563eb; letter-spacing: 0.2px;">
            ${escapeHtml(label)}
          </a>
        </td>
      </tr>
    </table>
  `;
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE REGISTRY
// ─────────────────────────────────────────────────────────────────────────────

export interface EmailTemplateDefinition {
  category: EmailCategory;
  render: (vars: Record<string, any>, unsubUrl?: string) => {
    subject: string;
    preheader: string;
    contentHtml: string;
    plainText: string;
  };
}

export const EMAIL_TEMPLATES: Record<string, EmailTemplateDefinition> = {
  // 1. WELCOME
  welcome: {
    category: 'transactional',
    render: (v) => {
      const name = escapeHtml(v.firstName || v.name || 'there');
      const subject = `Welcome to TalentXcel, ${v.firstName || 'there'}!`;
      const preheader = 'Your career journey starts here. Explore jobs and build your professional passport.';
      const ctaUrl = v.ctaUrl || `${CANONICAL_URL}/dashboard`;

      const contentHtml = `
        <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #0f172a;">
          Welcome to TalentXcel, ${name}! 🎉
        </h2>
        <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 24px; color: #334155;">
          We're thrilled to welcome you to India's fastest-growing professional talent network. Whether you are looking for your next breakthrough career opportunity, assessing your ATS resume alignment, or networking with top companies, TalentXcel is built for you.
        </p>
        <div style="background-color: #f1f5f9; border-radius: 8px; padding: 18px 20px; margin: 20px 0;">
          <div style="font-weight: 600; font-size: 14px; color: #0f172a; margin-bottom: 8px;">Next steps to accelerate your profile:</div>
          <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #475569; line-height: 22px;">
            <li>Complete your <strong>Career Passport</strong> to get noticed by recruiters</li>
            <li>Run a free <strong>ATS Resume Assessment</strong></li>
            <li>Set up intelligent <strong>Job Match Alerts</strong></li>
          </ul>
        </div>
        ${renderButton('Get Started on TalentXcel', ctaUrl)}
        <p style="margin: 24px 0 0 0; font-size: 14px; color: #64748b; line-height: 20px;">
          Best regards,<br>
          <strong>The TalentXcel Team</strong>
        </p>
      `;

      const plainText = `Welcome to TalentXcel, ${v.firstName || 'there'}!\n\nWe're thrilled to welcome you to India's fastest-growing professional talent network.\n\nNext steps:\n1. Complete your Career Passport\n2. Run a free ATS Resume Assessment\n3. Explore matching opportunities\n\nGet started: ${ctaUrl}\n\n© ${new Date().getFullYear()} TalentXcel. All rights reserved.`;

      return { subject, preheader, contentHtml, plainText };
    }
  },

  // 2. VERIFY EMAIL
  verify_email: {
    category: 'transactional',
    render: (v) => {
      const name = escapeHtml(v.firstName || v.name || 'there');
      const verifyUrl = v.verifyUrl || v.ctaUrl || `${CANONICAL_URL}/auth/verify`;
      const code = escapeHtml(v.code || '');
      const subject = `Verify your email address - TalentXcel`;
      const preheader = 'Please confirm your email address to secure your TalentXcel account.';

      const contentHtml = `
        <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #0f172a;">
          Verify Your Email Address
        </h2>
        <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 24px; color: #334155;">
          Hi ${name}, please click the button below to verify your email address and activate your full TalentXcel account features.
        </p>
        ${code ? `
          <div style="background-color: #eff6ff; border: 1px dashed #3b82f6; border-radius: 8px; padding: 16px; text-align: center; margin: 20px 0;">
            <div style="font-size: 12px; font-weight: 600; text-transform: uppercase; color: #1e40af; margin-bottom: 4px;">Verification Code</div>
            <div style="font-size: 28px; font-weight: 800; letter-spacing: 4px; color: #1d4ed8;">${code}</div>
          </div>
        ` : ''}
        ${renderButton('Verify Email Address', verifyUrl)}
        <p style="margin: 16px 0 0 0; font-size: 13px; color: #64748b; line-height: 20px;">
          If you did not sign up for TalentXcel, you can safely ignore this email.
        </p>
      `;

      const plainText = `Verify Your Email Address\n\nHi ${v.firstName || 'there'},\n\nPlease confirm your email: ${verifyUrl}\n${code ? `Verification Code: ${v.code}\n` : ''}\nIf you didn't create an account, you can safely ignore this message.`;

      return { subject, preheader, contentHtml, plainText };
    }
  },

  // 3. PASSWORD RESET
  password_reset: {
    category: 'transactional',
    render: (v) => {
      const name = escapeHtml(v.firstName || v.name || 'there');
      const resetUrl = v.resetUrl || v.ctaUrl || `${CANONICAL_URL}/auth/reset-password`;
      const expiresIn = v.expiresIn || '60 minutes';
      const subject = `Reset your TalentXcel password`;
      const preheader = 'We received a request to reset your password for your TalentXcel account.';

      const contentHtml = `
        <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #0f172a;">
          Password Reset Request
        </h2>
        <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 24px; color: #334155;">
          Hi ${name}, we received a request to reset the password for your TalentXcel account. Click the button below to choose a new password:
        </p>
        ${renderButton('Reset Password', resetUrl)}
        <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 4px; margin: 20px 0;">
          <p style="margin: 0; font-size: 13px; color: #92400e; line-height: 18px;">
            <strong>Security Notice:</strong> This link will expire in ${escapeHtml(expiresIn)}. If you did not request a password reset, please change your password immediately or contact support@talentxcel.in.
          </p>
        </div>
      `;

      const plainText = `Password Reset Request\n\nHi ${v.firstName || 'there'},\n\nReset your password here: ${resetUrl}\n\nThis link expires in ${expiresIn}. If you did not request this, please secure your account immediately.`;

      return { subject, preheader, contentHtml, plainText };
    }
  },

  // 4. APPLICATION CONFIRMATION
  application_confirmation: {
    category: 'transactional',
    render: (v) => {
      const name = escapeHtml(v.candidateName || v.firstName || 'there');
      const jobTitle = escapeHtml(v.jobTitle || 'Role');
      const companyName = escapeHtml(v.companyName || 'Company');
      const applicationId = escapeHtml(v.applicationId || '');
      const ctaUrl = v.ctaUrl || `${CANONICAL_URL}/jobs/applications`;
      const subject = `Application Received: ${v.jobTitle} at ${v.companyName}`;
      const preheader = `Your application for ${v.jobTitle} was submitted successfully.`;

      const contentHtml = `
        <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #0f172a;">
          Application Submitted Successfully ✅
        </h2>
        <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 24px; color: #334155;">
          Hi ${name}, your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been received and forwarded to the hiring team.
        </p>
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px 20px; margin: 20px 0;">
          <div style="font-size: 14px; color: #64748b; margin-bottom: 4px;">Application Details</div>
          <div style="font-size: 16px; font-weight: 700; color: #0f172a;">${jobTitle}</div>
          <div style="font-size: 14px; color: #334155; margin-top: 2px;">${companyName}</div>
          ${applicationId ? `<div style="font-size: 12px; color: #94a3b8; margin-top: 8px;">Reference ID: ${applicationId}</div>` : ''}
        </div>
        ${renderButton('Track Your Application', ctaUrl)}
        <p style="margin: 16px 0 0 0; font-size: 13px; color: #64748b; line-height: 20px;">
          You can track status updates and interview schedules directly in your candidate dashboard.
        </p>
      `;

      const plainText = `Application Submitted: ${v.jobTitle} at ${v.companyName}\n\nHi ${v.candidateName || 'there'},\nYour application has been received.\n\nTrack status: ${ctaUrl}`;

      return { subject, preheader, contentHtml, plainText };
    }
  },

  // 5. APPLICATION STATUS
  application_status: {
    category: 'transactional',
    render: (v) => {
      const name = escapeHtml(v.candidateName || v.firstName || 'there');
      const jobTitle = escapeHtml(v.jobTitle || 'Role');
      const companyName = escapeHtml(v.companyName || 'Company');
      const statusText = escapeHtml(v.status || 'Updated');
      const note = escapeHtml(v.message || v.note || '');
      const ctaUrl = v.ctaUrl || `${CANONICAL_URL}/jobs/applications`;
      const subject = `Update on your application: ${v.jobTitle} at ${v.companyName}`;
      const preheader = `Your application status has been updated to: ${v.status}.`;

      const contentHtml = `
        <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #0f172a;">
          Application Status Update
        </h2>
        <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 24px; color: #334155;">
          Hi ${name}, there is an update regarding your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong>:
        </p>
        <div style="background-color: #f1f5f9; border-radius: 8px; padding: 18px 20px; margin: 20px 0;">
          <div style="font-size: 12px; font-weight: 600; text-transform: uppercase; color: #64748b;">New Status</div>
          <div style="font-size: 18px; font-weight: 700; color: #2563eb; margin-top: 4px;">${statusText}</div>
          ${note ? `<p style="margin: 10px 0 0 0; font-size: 14px; color: #334155; line-height: 20px;">${note}</p>` : ''}
        </div>
        ${renderButton('View Application', ctaUrl)}
      `;

      const plainText = `Application Status Update: ${v.jobTitle} at ${v.companyName}\n\nHi ${v.candidateName || 'there'},\nStatus: ${v.status}\n\nView details: ${ctaUrl}`;

      return { subject, preheader, contentHtml, plainText };
    }
  },

  // 6. SINGLE JOB MATCH
  job_match: {
    category: 'product_notification',
    render: (v) => {
      const name = escapeHtml(v.firstName || v.name || 'there');
      const jobTitle = escapeHtml(v.jobTitle || 'Software Engineer');
      const companyName = escapeHtml(v.companyName || 'TalentXcel Partner');
      const location = escapeHtml(v.location || 'India / Remote');
      const salary = escapeHtml(v.salaryRange || 'Competitive');
      const matchScore = v.matchScore ? `${escapeHtml(v.matchScore)}% Match` : null;
      const ctaUrl = v.ctaUrl || `${CANONICAL_URL}/jobs`;
      const subject = `New Job Match: ${v.jobTitle} at ${v.companyName}`;
      const preheader = `We found an opportunity matching your skills on TalentXcel.`;

      const contentHtml = `
        <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #0f172a;">
          New Job Match for You 💼
        </h2>
        <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 24px; color: #334155;">
          Hi ${name}, our matching engine discovered a role that closely fits your background and career goals:
        </p>
        <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
          ${matchScore ? `
            <span style="background-color: #dcfce7; color: #15803d; font-size: 12px; font-weight: 700; padding: 3px 10px; border-radius: 999px; display: inline-block; margin-bottom: 8px;">
              ${matchScore}
            </span>
          ` : ''}
          <div style="font-size: 18px; font-weight: 700; color: #0f172a;">${jobTitle}</div>
          <div style="font-size: 15px; color: #475569; margin-top: 4px;">${companyName} &bull; ${location}</div>
          <div style="font-size: 14px; color: #059669; font-weight: 600; margin-top: 6px;">Compensation: ${salary}</div>
        </div>
        ${renderButton('View & Apply Now', ctaUrl)}
      `;

      const plainText = `New Job Match: ${v.jobTitle} at ${v.companyName}\n\nLocation: ${v.location}\nSalary: ${v.salaryRange}\n\nApply now: ${ctaUrl}`;

      return { subject, preheader, contentHtml, plainText };
    }
  },

  // 7. AGGREGATED JOB MATCH DIGEST (Requirement 7 & 28: Never 10 emails! ONE aggregated email)
  job_match_digest: {
    category: 'product_notification',
    render: (v) => {
      const name = escapeHtml(v.firstName || v.name || 'there');
      const jobs: Array<{ title: string; company: string; location?: string; salary?: string; url?: string }> = Array.isArray(v.jobs) ? v.jobs : [];
      const jobCount = Number(v.jobCount) || jobs.length || 5;
      const ctaUrl = v.ctaUrl || `${CANONICAL_URL}/jobs`;
      const subject = `You have ${jobCount} new job matches on TalentXcel`;
      const preheader = `Review your curated job matches from top hiring companies.`;

      const jobsListHtml = jobs.slice(0, 5).map(job => `
        <div style="border-bottom: 1px solid #f1f5f9; padding: 14px 0;">
          <div style="font-size: 15px; font-weight: 700; color: #0f172a;">${escapeHtml(job.title)}</div>
          <div style="font-size: 13px; color: #475569; margin-top: 2px;">
            ${escapeHtml(job.company)} &bull; ${escapeHtml(job.location || 'India')}
          </div>
          ${job.salary ? `<div style="font-size: 12px; color: #059669; font-weight: 600; margin-top: 2px;">${escapeHtml(job.salary)}</div>` : ''}
        </div>
      `).join('');

      const contentHtml = `
        <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #0f172a;">
          ${jobCount} New Matching Opportunities 🌟
        </h2>
        <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 24px; color: #334155;">
          Hi ${name}, we compiled your latest job matches into one curated list so you can easily review top opportunities:
        </p>
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px 20px; margin: 20px 0;">
          ${jobsListHtml || `<div style="font-size: 14px; color: #475569;">${jobCount} roles are actively seeking profiles like yours.</div>`}
        </div>
        ${renderButton('View All Matches →', ctaUrl)}
      `;

      const plainText = `You have ${jobCount} new job matches on TalentXcel\n\nHi ${v.firstName || 'there'},\nReview your top matches: ${ctaUrl}`;

      return { subject, preheader, contentHtml, plainText };
    }
  },

  // 8. CAREER RECOMMENDATION
  career_recommendation: {
    category: 'engagement',
    render: (v) => {
      const name = escapeHtml(v.firstName || v.name || 'there');
      const title = escapeHtml(v.recommendationTitle || 'Boost Your Career Velocity');
      const description = escapeHtml(v.description || 'Improve your profile to unlock 3x more recruiter inquiries.');
      const ctaUrl = v.ctaUrl || `${CANONICAL_URL}/passport`;
      const subject = `Career Insight: ${v.recommendationTitle || 'Opportunities to accelerate your career'}`;
      const preheader = 'Personalized career recommendations tailored to your skills.';

      const contentHtml = `
        <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #0f172a;">
          ${title}
        </h2>
        <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 24px; color: #334155;">
          Hi ${name}, our Career Pathway Intelligence engine analyzed hiring market trends in your domain:
        </p>
        <div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; border-radius: 6px; padding: 18px 20px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #166534; line-height: 22px;">
            ${description}
          </p>
        </div>
        ${renderButton('Explore Career Pathways', ctaUrl)}
      `;

      const plainText = `${title}\n\nHi ${v.firstName || 'there'},\n${v.description}\n\nExplore: ${ctaUrl}`;

      return { subject, preheader, contentHtml, plainText };
    }
  },

  // 9. WEEKLY DIGEST
  weekly_digest: {
    category: 'engagement',
    render: (v) => {
      const name = escapeHtml(v.firstName || v.name || 'there');
      const profileViews = escapeHtml(v.profileViews || '12');
      const matchCount = escapeHtml(v.matchCount || '8');
      const ctaUrl = v.ctaUrl || `${CANONICAL_URL}/dashboard`;
      const subject = `Your TalentXcel Weekly Digest`;
      const preheader = `Summary of your profile activity and top opportunities this week.`;

      const contentHtml = `
        <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #0f172a;">
          Your Weekly Career Summary 📊
        </h2>
        <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 24px; color: #334155;">
          Hi ${name}, here is how your profile performed on the TalentXcel Network this week:
        </p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
          <tr>
            <td width="50%" style="padding-right: 8px;">
              <div style="background-color: #eff6ff; border-radius: 8px; padding: 18px; text-align: center;">
                <div style="font-size: 28px; font-weight: 800; color: #2563eb;">${profileViews}</div>
                <div style="font-size: 12px; font-weight: 600; color: #64748b; margin-top: 4px;">Recruiter Profile Views</div>
              </div>
            </td>
            <td width="50%" style="padding-left: 8px;">
              <div style="background-color: #f0fdf4; border-radius: 8px; padding: 18px; text-align: center;">
                <div style="font-size: 28px; font-weight: 800; color: #16a34a;">${matchCount}</div>
                <div style="font-size: 12px; font-weight: 600; color: #64748b; margin-top: 4px;">New Job Matches</div>
              </div>
            </td>
          </tr>
        </table>
        ${renderButton('View Full Activity', ctaUrl)}
      `;

      const plainText = `Weekly Digest\n\nProfile views: ${profileViews}\nNew matches: ${matchCount}\n\nView dashboard: ${ctaUrl}`;

      return { subject, preheader, contentHtml, plainText };
    }
  },

  // 10. MARKETING / PLATFORM ANNOUNCEMENT
  marketing: {
    category: 'marketing',
    render: (v) => {
      const headline = escapeHtml(v.headline || v.title || 'Platform Announcement');
      const body = escapeHtml(v.message || v.content || 'Exciting updates on TalentXcel.');
      const ctaLabel = escapeHtml(v.ctaLabel || 'Learn More');
      const ctaUrl = v.ctaUrl || `${CANONICAL_URL}`;
      const subject = v.subject || `${v.headline || 'Announcement from TalentXcel'}`;
      const preheader = v.preheader || 'News and updates from the TalentXcel team.';

      const contentHtml = `
        <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #0f172a;">
          ${headline}
        </h2>
        <div style="font-size: 15px; line-height: 24px; color: #334155; margin: 16px 0;">
          ${body}
        </div>
        ${renderButton(ctaLabel, ctaUrl)}
      `;

      const plainText = `${headline}\n\n${v.message || v.content}\n\n${ctaUrl}`;

      return { subject, preheader, contentHtml, plainText };
    }
  }
};

/**
 * Main Template Renderer
 */
export async function renderEmailTemplate(
  templateKey: string,
  variables: Record<string, any>,
  recipientEmail: string,
  userId?: string
): Promise<RenderedEmail> {
  const definition = EMAIL_TEMPLATES[templateKey];
  if (!definition) {
    throw new Error(`Email template '${templateKey}' not found in registry`);
  }

  // Generate cryptographic unsubscribe URL
  const unsubscribeUrl = await buildUnsubscribeUrl(recipientEmail, userId);

  // Render raw template parts
  const { subject, preheader, contentHtml, plainText } = definition.render(variables, unsubscribeUrl);

  // Wrap in base layout
  const fullHtml = wrapInBaseLayout({
    title: subject,
    preheader,
    contentHtml,
    category: definition.category,
    unsubscribeUrl,
    recipientEmail
  });

  return {
    subject,
    html: fullHtml,
    plainText
  };
}
