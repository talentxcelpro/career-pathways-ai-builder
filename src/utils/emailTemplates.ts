// Email Template Categories, Variables and Utilities for TalentXcel Admin Console

export const EMAIL_VARIABLES = {
  USER: [
    { key: 'name', label: 'Recipient Name', example: 'Aditi Sharma' },
    { key: 'email', label: 'Recipient Email', example: 'aditi@example.com' },
    { key: 'candidateName', label: 'Candidate Name', example: 'Arjun Mehta' },
    { key: 'recipient_name', label: 'Member Name', example: 'Vikram Rao' },
  ],
  NETWORK: [
    { key: 'inviter_name', label: 'Inviter Full Name', example: 'Vikram Rao' },
    { key: 'sender_name', label: 'Sender Full Name', example: 'Rahul Deshmukh' },
    { key: 'message_preview', label: 'Message Preview', example: 'Hey, I checked out your recent post on architecture...' },
  ],
  JOBS: [
    { key: 'jobTitle', label: 'Job Title', example: 'Lead Frontend Architect' },
    { key: 'companyName', label: 'Company Name', example: 'Razorpay' },
    { key: 'applicationId', label: 'Application ID', example: 'TX-APP-89421' },
    { key: 'ctaUrl', label: 'Action Deep Link', example: 'https://talentxcel.in/jobs/applications' },
  ],
  SYSTEM: [
    { key: 'link', label: 'Action URL', example: 'https://talentxcel.in' },
    { key: 'year', label: 'Current Year', example: '2026' },
    { key: 'logo_url', label: 'Brand Logo URL', example: 'https://talentxcel.in/assets/talentxcel-brand-logo.png' },
  ]
};

export const TEMPLATE_CATEGORIES = [
  { value: 'candidate_career_os', label: 'Candidate Career OS', icon: '👤' },
  { value: 'social_network', label: 'The Social Network (/network)', icon: '🤝' },
  { value: 'reels_video', label: 'Reels & Video Intros (/reels)', icon: '🎬' },
  { value: 'resume_ats', label: 'Resume Builder & ATS Diagnostics', icon: '📄' },
  { value: 'jobs_applications', label: 'Job Discovery & Applications', icon: '💼' },
  { value: 'salary_market', label: 'Salary Intelligence (/salary)', icon: '📈' },
  { value: 'colleges_campus', label: 'Colleges & Campus Network', icon: '🎓' },
  { value: 'recruiter_os', label: 'Recruiter OS & Sourcing', icon: '🏢' },
  { value: 'learning_credentials', label: 'Learning Hub & Credentials', icon: '📚' },
  { value: 'referral_growth', label: 'Refer & Earn Viral Engine', icon: '🎁' },
  { value: 'onboarding', label: 'Legacy Onboarding', icon: '👋' },
  { value: 'security', label: 'Security & Access', icon: '🔒' }
];

export function renderTemplate(template: string, data: Record<string, any>): string {
  if (!template) return '';
  let rendered = template;
  for (const [key, value] of Object.entries(data)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    rendered = rendered.replace(regex, String(value ?? ''));
  }
  return rendered;
}

export function extractVariables(template: string): string[] {
  if (!template) return [];
  const matches = template.match(/{{([^{}]+)}}/g);
  if (!matches) return [];
  return Array.from(new Set(matches.map((m) => m.replace(/[{}]/g, '').trim())));
}

export const BASE_EMAIL_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{title}}</title>
</head>
<body style="margin: 0; padding: 24px 0; background-color: #f5f5f7; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f7;">
    <tr>
      <td align="center" style="padding: 12px 16px 40px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e5e5ea; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);">
          <!-- Header -->
          <tr>
            <td style="padding: 24px 32px 18px 32px; border-bottom: 1px solid #f2f2f7;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <span style="font-size: 16px; font-weight: 700; color: #0071e3; letter-spacing: -0.3px;">TalentXcel</span>
                    <span style="font-size: 11px; color: #86868b; margin-left: 6px;">Super Intelligence &bull; Career OS</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Body Content -->
          <tr>
            <td style="padding: 32px 32px 28px 32px; color: #1d1d1f; font-size: 14.5px; line-height: 23px;">
              {{content}}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #fafafc; border-top: 1px solid #f2f2f7; text-align: center; color: #86868b; font-size: 12px; line-height: 18px;">
              TalentXcel Super Intelligence Platform &bull; Professional Network &bull; Career OS<br>
              <a href="https://talentxcel.in" style="color: #0071e3; text-decoration: none;">talentxcel.in</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

export const WELCOME_TEMPLATE = BASE_EMAIL_TEMPLATE.replace('{{content}}', `
  <div style="font-size: 15px; font-weight: 600; color: #64748b; margin-bottom: 8px;">Hi {{name}},</div>
  <h1 style="margin: 0 0 14px 0; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">Welcome to TalentXcel</h1>
  <p style="margin: 0 0 12px 0; font-size: 14.5px; line-height: 23px; color: #334155;">Your account is now active. Explore your connected professional ecosystem designed to help you build your identity, unlock opportunities and accelerate your career.</p>
  <div style="text-align: center; margin: 28px 0 10px 0;">
    <a href="https://talentxcel.in" style="background-color: #0071e3; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 980px; font-weight: 600; font-size: 14px; display: inline-block;">Get Started &rarr;</a>
  </div>
`);

export const JOB_NOTIFICATION_TEMPLATE = BASE_EMAIL_TEMPLATE.replace('{{content}}', `
  <div style="font-size: 15px; font-weight: 600; color: #64748b; margin-bottom: 8px;">Hi {{name}},</div>
  <h1 style="margin: 0 0 14px 0; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">New High-Priority Job Match</h1>
  <p style="margin: 0 0 12px 0; font-size: 14.5px; line-height: 23px; color: #334155;">A new role matching your skills and experience has opened on TalentXcel.</p>
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 20px 0;">
    <div style="font-size: 16px; font-weight: 700; color: #0f172a;">{{jobTitle}}</div>
    <div style="font-size: 13.5px; color: #64748b; margin-top: 4px;">{{companyName}}</div>
  </div>
  <div style="text-align: center; margin: 28px 0 10px 0;">
    <a href="https://talentxcel.in/jobs" style="background-color: #0071e3; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 980px; font-weight: 600; font-size: 14px; display: inline-block;">View Opportunity &rarr;</a>
  </div>
`);

export const SECURITY_ALERT_TEMPLATE = BASE_EMAIL_TEMPLATE.replace('{{content}}', `
  <div style="font-size: 15px; font-weight: 600; color: #64748b; margin-bottom: 8px;">Hi {{name}},</div>
  <h1 style="margin: 0 0 14px 0; font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">Security Alert: New Sign-in</h1>
  <p style="margin: 0 0 12px 0; font-size: 14.5px; line-height: 23px; color: #334155;">We detected a new sign-in to your TalentXcel account from a new device or browser.</p>
  <div style="background-color: #fff9f0; border: 1px solid #ffe6c3; border-radius: 12px; padding: 16px; margin: 20px 0; font-size: 13px; color: #b25e00;">
    If this was you, you can safely ignore this alert. If you did not initiate this sign-in, please reset your password immediately.
  </div>
  <div style="text-align: center; margin: 28px 0 10px 0;">
    <a href="https://talentxcel.in/settings/security" style="background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 980px; font-weight: 600; font-size: 14px; display: inline-block;">Review Account Security &rarr;</a>
  </div>
`);
