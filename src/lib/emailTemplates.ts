export interface TemplateData {
  [key: string]: any;
}

const getBaseTemplate = (content: string, year: number = new Date().getFullYear()) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>TalentXcel</title>
</head>
<body style="background-color:#f4f4f4;margin:0;padding:0;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; margin:40px auto; border-radius:12px; box-shadow:0 8px 32px rgba(0,0,0,0.12);">
          <tr>
            <td align="center" style="padding:40px 40px 30px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius:12px 12px 0 0;">
              <img src="https://16bdb5f0-0ce9-4c42-843e-b9e7c9fae575.lovableproject.com/lovable-uploads/854df183-7bfd-468f-a663-be6607202336.png" alt="TalentXcel" style="height:80px; width:auto; margin-bottom:15px;" />
              <h1 style="color:#ffffff; margin:0; font-size:28px; font-weight:700; text-shadow:0 2px 4px rgba(0,0,0,0.1);">TalentXcel</h1>
              <p style="color:#ffffff; margin:8px 0 0 0; font-size:16px; opacity:0.95;">Powering Global Career Growth</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="background-color:#f8f9fa; padding:30px; text-align:center; border-top:1px solid #e9ecef; border-radius:0 0 12px 12px;">
              <p style="margin:0; color:#6c757d; font-size:14px; line-height:1.6;">
                © ${year} <strong style="color:#495057;">TalentXcel</strong>. All rights reserved.<br>
                <a href="https://talentxcel.in/unsubscribe" style="color:#6c757d; text-decoration:none; font-size:13px;">Unsubscribe</a> | 
                <a href="https://talentxcel.in/privacy" style="color:#6c757d; text-decoration:none; font-size:13px;">Privacy Policy</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const templates = {
  welcome: (data: TemplateData) => getBaseTemplate(`
    <h1 style="color:#333;">Welcome to TalentXcel, ${data.name || '[First Name]'}</h1>
    <p style="color:#555; font-size:16px;">We're excited to have you onboard! Explore jobs, build your resume, and grow your network.</p>
    <div style="margin:24px 0;">
      <a href="https://talentxcel.in/dashboard" style="background:#007BFF;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;">Go to Dashboard</a>
    </div>
    
    <div style="background:#f1f8ff; padding:20px; margin-top:30px; border-left:4px solid #007BFF; border-radius:6px;">
      <h2 style="color:#007BFF; margin:0 0 10px;">Powering Global Career Growth</h2>
      <p style="color:#333; font-size:15px; margin:0;">
        Your all-in-one platform for networking, skill-building, and finding the perfect career opportunities tailored to your unique journey. 
        Join thousands of professionals accelerating their careers with TalentXcel.
      </p>
    </div>
  `),

  new_connection: (data: TemplateData) => getBaseTemplate(`
    <h1 style="color:#333; margin:0 0 20px 0; font-size:24px;">New Connection Request! 🤝</h1>
    <p style="color:#555; font-size:16px; line-height:1.6;">Hi ${data.recipient_name || '[Name]'},</p>
    <p style="color:#555; font-size:16px; line-height:1.6;"><strong>${data.requester_name || '[Requester Name]'}</strong> wants to connect with you on TalentXcel.</p>
    
    <div style="background:#f8f9ff; padding:25px; margin:25px 0; border-left:4px solid #667eea; border-radius:8px;">
      <h2 style="color:#667eea; margin:0 0 15px 0; font-size:18px;">About ${data.requester_name || '[Requester Name]'}</h2>
      <p style="color:#333; margin:0; font-size:15px;">${data.requester_title || 'Professional'} ${data.requester_company ? `at ${data.requester_company}` : ''}</p>
      ${data.requester_bio ? `<p style="color:#666; margin:10px 0 0 0; font-size:14px;">${data.requester_bio}</p>` : ''}
    </div>
    
    <p style="color:#555; font-size:16px; line-height:1.6;">Building professional connections opens doors to new opportunities and collaborations. Expand your network and grow your career!</p>
    <div style="text-align:center; margin:30px 0;">
      <a href="https://talentxcel.in/network/requests" style="background:#667eea;color:#fff;padding:15px 30px;text-decoration:none;border-radius:8px;font-weight:600;font-size:16px;display:inline-block;">View Connection Request</a>
    </div>
  `),

  job_opening: (data: TemplateData) => getBaseTemplate(`
    <h1 style="color:#333; margin:0 0 20px 0; font-size:24px;">Perfect Job Match Found! 💼</h1>
    <p style="color:#555; font-size:16px; line-height:1.6;">Hi ${data.name || '[Name]'},</p>
    <p style="color:#555; font-size:16px; line-height:1.6;">We found an exciting job opportunity that matches your profile and career preferences.</p>
    
    <div style="background:#f0f8ff; padding:30px; margin:25px 0; border-radius:12px; border:1px solid #e0f0ff;">
      <h2 style="margin:0 0 15px 0; color:#1a365d; font-size:22px;">${data.job_title || '[Job Title]'}</h2>
      <p style="margin:8px 0; color:#2d3748; font-size:16px; font-weight:600;">${data.company_name || '[Company Name]'} • ${data.location || '[Location]'}</p>
      <p style="margin:8px 0; color:#4a5568; font-size:15px;">${data.salary_range || 'Competitive salary package'}</p>
      ${data.job_type ? `<p style="margin:8px 0; color:#4a5568; font-size:15px;">Job Type: ${data.job_type}</p>` : ''}
    </div>
    
    <h3 style="color:#333; margin:25px 0 15px 0; font-size:18px;">Key Requirements:</h3>
    <ul style="color:#555; font-size:15px; line-height:1.8; padding-left:20px;">
      ${data.requirements ? data.requirements.map((req: string) => `<li style="margin:5px 0;">${req}</li>`).join('') : '<li>Experience in relevant field</li><li>Strong communication skills</li><li>Team collaboration abilities</li>'}
    </ul>
    
    <div style="text-align:center; margin:30px 0;">
      <a href="https://talentxcel.in/jobs/${data.job_id || ''}" style="background:#28a745;color:#fff;padding:15px 30px;text-decoration:none;border-radius:8px;font-weight:600;font-size:16px;display:inline-block;margin-right:15px;">View Job Details</a>
      <a href="https://talentxcel.in/jobs" style="background:#6c757d;color:#fff;padding:15px 30px;text-decoration:none;border-radius:8px;font-weight:600;font-size:16px;display:inline-block;">Browse More Jobs</a>
    </div>
    
    <p style="color:#6c757d; font-size:14px; text-align:center; margin-top:25px;">
      This job was recommended based on your profile, skills, and preferences.
    </p>
  `),

  application_confirmation: (data: TemplateData) => getBaseTemplate(`
    <h1 style="color:#333; margin:0 0 20px 0; font-size:24px;">Application Submitted Successfully! ✅</h1>
    <p style="color:#555; font-size:16px; line-height:1.6;">Hi ${data.name || '[Name]'},</p>
    <p style="color:#555; font-size:16px; line-height:1.6;">Your application for <strong>${data.job_title || '[Job Title]'}</strong> at <strong style="color:#667eea;">${data.company_name || '[Company Name]'}</strong> has been successfully submitted!</p>
    
    <div style="background:#f0f8f4; padding:25px; margin:25px 0; border-left:4px solid #28a745; border-radius:8px;">
      <h2 style="color:#28a745; margin:0 0 15px 0; font-size:18px;">Application Details</h2>
      <table style="width:100%; border-collapse:collapse;">
        <tr><td style="padding:8px 0; color:#333; font-weight:600;">Position:</td><td style="padding:8px 0; color:#555;">${data.job_title || '[Job Title]'}</td></tr>
        <tr><td style="padding:8px 0; color:#333; font-weight:600;">Company:</td><td style="padding:8px 0; color:#555;">${data.company_name || '[Company Name]'}</td></tr>
        <tr><td style="padding:8px 0; color:#333; font-weight:600;">Applied on:</td><td style="padding:8px 0; color:#555;">${new Date(data.applied_date || Date.now()).toLocaleDateString()}</td></tr>
        <tr><td style="padding:8px 0; color:#333; font-weight:600;">Application ID:</td><td style="padding:8px 0; color:#555;">${data.application_id || 'APP-' + Math.random().toString(36).substr(2, 9).toUpperCase()}</td></tr>
      </table>
    </div>
    
    <h3 style="color:#333; margin:25px 0 15px 0; font-size:18px;">What's Next?</h3>
    <ul style="color:#555; font-size:15px; line-height:1.8; padding-left:20px;">
      <li style="margin:8px 0;">The hiring team will review your application</li>
      <li style="margin:8px 0;">You'll receive updates on your application status</li>
      <li style="margin:8px 0;">If shortlisted, you'll be contacted for next steps</li>
    </ul>
    
    <div style="text-align:center; margin:30px 0;">
      <a href="https://talentxcel.in/jobs/my-applications" style="background:#667eea;color:#fff;padding:15px 30px;text-decoration:none;border-radius:8px;font-weight:600;font-size:16px;display:inline-block;">Track Application</a>
    </div>
    
    <p style="color:#6c757d; font-size:14px; text-align:center; margin-top:25px;">
      Good luck! We're rooting for you. 🚀
    </p>
  `),

  invite_member: (data: TemplateData) => getBaseTemplate(`
    <h1 style="color:#333; margin:0 0 20px 0; font-size:24px;">Team Invitation from ${data.company_name || '[Company Name]'}! 🎊</h1>
    <p style="color:#555; font-size:16px; line-height:1.6;">Hi ${data.invited_name || '[Name]'},</p>
    <p style="color:#555; font-size:16px; line-height:1.6;"><strong>${data.inviter_name || '[Inviter Name]'}</strong> has invited you to join the <strong style="color:#667eea;">${data.company_name || '[Company Name]'}</strong> team on TalentXcel.</p>
    
    <div style="background:#fff4e6; padding:25px; margin:25px 0; border-left:4px solid #f59e0b; border-radius:8px;">
      <h2 style="color:#f59e0b; margin:0 0 15px 0; font-size:18px;">Invitation Details</h2>
      <table style="width:100%; border-collapse:collapse;">
        <tr><td style="padding:8px 0; color:#333; font-weight:600;">Company:</td><td style="padding:8px 0; color:#555;">${data.company_name || '[Company Name]'}</td></tr>
        <tr><td style="padding:8px 0; color:#333; font-weight:600;">Role:</td><td style="padding:8px 0; color:#555;">${data.role || '[Role]'}</td></tr>
        <tr><td style="padding:8px 0; color:#333; font-weight:600;">Invited by:</td><td style="padding:8px 0; color:#555;">${data.inviter_name || '[Inviter Name]'}</td></tr>
      </table>
    </div>
    
    <h3 style="color:#333; margin:25px 0 15px 0; font-size:18px;">As a team member, you'll be able to:</h3>
    <ul style="color:#555; font-size:15px; line-height:1.8; padding-left:20px;">
      <li style="margin:8px 0;">Manage job postings and applications</li>
      <li style="margin:8px 0;">Access company analytics and insights</li>
      <li style="margin:8px 0;">Collaborate with your team members</li>
      <li style="margin:8px 0;">Build and enhance your employer brand</li>
      <li style="margin:8px 0;">Track recruitment performance</li>
    </ul>
    
    <div style="text-align:center; margin:30px 0;">
      <a href="https://talentxcel.in/employer/invite?token=${data.invite_token || ''}" style="background:#f59e0b;color:#fff;padding:15px 30px;text-decoration:none;border-radius:8px;font-weight:600;font-size:16px;display:inline-block;">Accept Invitation</a>
    </div>
    
    <p style="color:#dc2626; font-size:14px; text-align:center; margin-top:25px; font-weight:600;">
      ⏰ This invitation will expire in 7 days. If you have any questions, contact ${data.inviter_name || '[Inviter Name]'} directly.
    </p>
  `),

  password_reset: (data: TemplateData) => getBaseTemplate(`
    <h1 style="color:#333; margin:0 0 20px 0; font-size:24px;">Reset Your Password 🔐</h1>
    <p style="color:#555; font-size:16px; line-height:1.6;">Hi ${data.name || '[Name]'},</p>
    <p style="color:#555; font-size:16px; line-height:1.6;">We received a request to reset your password for your TalentXcel account.</p>
    
    <div style="background:#fef7f7; padding:25px; margin:25px 0; border-left:4px solid #dc2626; border-radius:8px;">
      <h2 style="color:#dc2626; margin:0 0 15px 0; font-size:18px;">Security Information</h2>
      <table style="width:100%; border-collapse:collapse;">
        <tr><td style="padding:8px 0; color:#333; font-weight:600;">Request time:</td><td style="padding:8px 0; color:#555;">${new Date().toLocaleString()}</td></tr>
        <tr><td style="padding:8px 0; color:#333; font-weight:600;">IP Address:</td><td style="padding:8px 0; color:#555;">${data.ip_address || 'Hidden for security'}</td></tr>
        <tr><td style="padding:8px 0; color:#333; font-weight:600;">Browser:</td><td style="padding:8px 0; color:#555;">${data.user_agent || 'Not available'}</td></tr>
      </table>
    </div>
    
    <p style="color:#555; font-size:16px; line-height:1.6;">Click the button below to create a new password. This link will expire in <strong>1 hour</strong> for security reasons.</p>
    
    <div style="text-align:center; margin:30px 0;">
      <a href="${data.reset_link || '#'}" style="background:#dc2626;color:#fff;padding:15px 30px;text-decoration:none;border-radius:8px;font-weight:600;font-size:16px;display:inline-block;">Reset Password</a>
    </div>
    
    <div style="background:#fef2f2; padding:20px; margin:25px 0; border-radius:8px; border:1px solid #fecaca;">
      <p style="color:#dc2626; font-weight:600; margin:0; font-size:15px;">
        ⚠️ <strong>Security Alert:</strong> If you didn't request this password reset, please ignore this email and consider securing your account immediately.
      </p>
    </div>
  `),

  interview_scheduled: (data: TemplateData) => getBaseTemplate(`
    <h1 style="color:#333; margin:0 0 20px 0; font-size:24px;">Interview Scheduled! 📅</h1>
    <p style="color:#555; font-size:16px; line-height:1.6;">Hi ${data.candidate_name || '[Name]'},</p>
    <p style="color:#555; font-size:16px; line-height:1.6;">Congratulations! <strong style="color:#667eea;">${data.company_name || '[Company Name]'}</strong> has scheduled an interview with you for the <strong>${data.job_title || '[Job Title]'}</strong> position.</p>
    
    <div style="background:#f0f9ff; padding:25px; margin:25px 0; border-left:4px solid #3b82f6; border-radius:8px;">
      <h2 style="color:#3b82f6; margin:0 0 15px 0; font-size:18px;">Interview Details</h2>
      <table style="width:100%; border-collapse:collapse;">
        <tr><td style="padding:8px 0; color:#333; font-weight:600;">Date:</td><td style="padding:8px 0; color:#555;">${data.interview_date ? new Date(data.interview_date).toLocaleDateString() : '[Date]'}</td></tr>
        <tr><td style="padding:8px 0; color:#333; font-weight:600;">Time:</td><td style="padding:8px 0; color:#555;">${data.interview_time || '[Time]'}</td></tr>
        <tr><td style="padding:8px 0; color:#333; font-weight:600;">Type:</td><td style="padding:8px 0; color:#555;">${data.interview_type || 'Virtual Interview'}</td></tr>
        <tr><td style="padding:8px 0; color:#333; font-weight:600;">Duration:</td><td style="padding:8px 0; color:#555;">${data.duration || '1 hour'}</td></tr>
        ${data.meeting_link ? `<tr><td style="padding:8px 0; color:#333; font-weight:600;">Meeting Link:</td><td style="padding:8px 0;"><a href="${data.meeting_link}" style="color:#3b82f6; text-decoration:none;">Join Interview</a></td></tr>` : ''}
      </table>
    </div>
    
    <h3 style="color:#333; margin:25px 0 15px 0; font-size:18px;">Interview Success Tips 💡</h3>
    <ul style="color:#555; font-size:15px; line-height:1.8; padding-left:20px;">
      <li style="margin:8px 0;">Research the company culture and recent news</li>
      <li style="margin:8px 0;">Prepare specific examples using the STAR method</li>
      <li style="margin:8px 0;">Test your technology 15 minutes before (for virtual interviews)</li>
      <li style="margin:8px 0;">Prepare thoughtful questions about the role and team</li>
      <li style="margin:8px 0;">Bring multiple copies of your resume</li>
      <li style="margin:8px 0;">Plan to arrive 10-15 minutes early</li>
    </ul>
    
    <div style="text-align:center; margin:30px 0;">
      <a href="https://talentxcel.in/jobs/interviews" style="background:#3b82f6;color:#fff;padding:15px 30px;text-decoration:none;border-radius:8px;font-weight:600;font-size:16px;display:inline-block;margin-right:15px;">View Interview Details</a>
      <a href="https://talentxcel.in/interview-prep" style="background:#10b981;color:#fff;padding:15px 30px;text-decoration:none;border-radius:8px;font-weight:600;font-size:16px;display:inline-block;">Interview Prep Guide</a>
    </div>
    
    <p style="color:#059669; font-size:16px; text-align:center; margin-top:25px; font-weight:600;">
      🎉 Good luck! Remember, you were selected because they believe you're a great fit for this role.
    </p>
  `),

  monthly_digest: (data: TemplateData) => getBaseTemplate(`
    <h1 style="color:#333; margin:0 0 20px 0; font-size:24px;">Your Monthly Career Digest 📊</h1>
    <p style="color:#555; font-size:16px; line-height:1.6;">Hi ${data.name || '[Name]'},</p>
    <p style="color:#555; font-size:16px; line-height:1.6;">Here's your personalized monthly career summary with insights and new opportunities!</p>
    
    <div style="background:#f8f9ff; padding:25px; margin:25px 0; border-left:4px solid #8b5cf6; border-radius:8px;">
      <h2 style="color:#8b5cf6; margin:0 0 20px 0; font-size:18px;">Your Career Stats This Month</h2>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px;">
        <div style="text-align:center; padding:15px; background:#fff; border-radius:8px;">
          <h3 style="color:#667eea; margin:0; font-size:24px; font-weight:700;">${data.profile_views || 0}</h3>
          <p style="color:#555; margin:5px 0 0 0; font-size:14px;">Profile Views</p>
        </div>
        <div style="text-align:center; padding:15px; background:#fff; border-radius:8px;">
          <h3 style="color:#10b981; margin:0; font-size:24px; font-weight:700;">${data.applications_sent || 0}</h3>
          <p style="color:#555; margin:5px 0 0 0; font-size:14px;">Applications Sent</p>
        </div>
        <div style="text-align:center; padding:15px; background:#fff; border-radius:8px;">
          <h3 style="color:#f59e0b; margin:0; font-size:24px; font-weight:700;">${data.new_connections || 0}</h3>
          <p style="color:#555; margin:5px 0 0 0; font-size:14px;">New Connections</p>
        </div>
        <div style="text-align:center; padding:15px; background:#fff; border-radius:8px;">
          <h3 style="color:#ef4444; margin:0; font-size:24px; font-weight:700;">${data.interviews || 0}</h3>
          <p style="color:#555; margin:5px 0 0 0; font-size:14px;">Interview Invites</p>
        </div>
      </div>
    </div>
    
    <h3 style="color:#333; margin:25px 0 15px 0; font-size:18px;">🔥 Trending Opportunities</h3>
    ${data.trending_jobs && data.trending_jobs.length > 0 ? data.trending_jobs.map((job: any) => `
      <div style="border:1px solid #e5e7eb; border-radius:8px; padding:20px; margin:15px 0; background:#fff;">
        <h4 style="margin:0 0 8px 0; color:#1f2937; font-size:16px;">${job.title}</h4>
        <p style="margin:0; color:#6b7280; font-size:14px;">${job.company} • ${job.location}</p>
        ${job.salary ? `<p style="margin:5px 0 0 0; color:#059669; font-size:14px; font-weight:600;">${job.salary}</p>` : ''}
      </div>
    `).join('') : '<div style="text-align:center; padding:40px; color:#6b7280;"><p>No trending jobs this month. Update your preferences to get better matches!</p></div>'}
    
    <div style="text-align:center; margin:30px 0;">
      <a href="https://talentxcel.in/jobs" style="background:#667eea;color:#fff;padding:15px 30px;text-decoration:none;border-radius:8px;font-weight:600;font-size:16px;display:inline-block;margin-right:15px;">Explore Jobs</a>
      <a href="https://talentxcel.in/network" style="background:#10b981;color:#fff;padding:15px 30px;text-decoration:none;border-radius:8px;font-weight:600;font-size:16px;display:inline-block;">Grow Network</a>
    </div>
    
    <div style="background:#f9fafb; padding:20px; margin:25px 0; border-radius:8px; border:1px solid #e5e7eb;">
      <p style="color:#6b7280; font-size:14px; margin:0; text-align:center;">
        Want to customize these updates? <a href="https://talentxcel.in/profile/settings" style="color:#667eea; text-decoration:none;">Update your email preferences</a>
      </p>
    </div>
  `)
};

export { templates };
export default templates;