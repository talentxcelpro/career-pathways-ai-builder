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
        <table width="600" cellpadding="40" cellspacing="0" style="background-color:#ffffff; margin:40px auto; border-radius:8px; box-shadow:0 4px 10px rgba(0,0,0,0.05);">
          <tr>
            <td align="center" style="padding-bottom:20px;">
              <img src="https://16bdb5f0-0ce9-4c42-843e-b9e7c9fae575.lovableproject.com/lovable-uploads/854df183-7bfd-468f-a663-be6607202336.png" alt="TalentXcel" style="height:45px;" />
            </td>
          </tr>
          <tr>
            <td>
              ${content}
            </td>
          </tr>
          <tr>
            <td style="font-size:12px; color:#999999; text-align:center; padding-top:30px;">
              © ${year} TalentXcel. All rights reserved. • <a href="https://talentxcel.in/unsubscribe" style="color:#999;">Unsubscribe</a>
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
    <h2>You have a new connection! 🤝</h2>
    <p>Hi ${data.recipient_name},</p>
    <p><strong>${data.requester_name}</strong> wants to connect with you on TalentXcel.</p>
    
    <div class="highlight">
      <p><strong>About ${data.requester_name}:</strong></p>
      <p>${data.requester_title || 'Professional'} ${data.requester_company ? `at ${data.requester_company}` : ''}</p>
    </div>
    
    <p>Building professional connections can open doors to new opportunities and collaborations.</p>
    <a href="https://talentxcel.in/network/requests" class="button">View Connection Request</a>
  `),

  job_opening: (data: TemplateData) => getBaseTemplate(`
    <h2>New Job Match for You! 💼</h2>
    <p>Hi ${data.name},</p>
    <p>We found a job opportunity that matches your profile and interests.</p>
    
    <div class="highlight">
      <h3 style="margin: 0 0 10px 0; color: #1f2937;">${data.job_title}</h3>
      <p style="margin: 5px 0;"><span class="company-name">${data.company_name}</span> • ${data.location}</p>
      <p style="margin: 5px 0; font-size: 14px; color: #6b7280;">${data.salary_range || 'Competitive salary'}</p>
    </div>
    
    <p><strong>Key Requirements:</strong></p>
    <ul>
      ${data.requirements ? data.requirements.map((req: string) => `<li>${req}</li>`).join('') : '<li>Experience in relevant field</li>'}
    </ul>
    
    <a href="https://talentxcel.in/jobs/${data.job_id}" class="button">View Job Details</a>
    
    <p style="margin-top: 20px; font-size: 14px; color: #6b7280;">
      This job was recommended based on your profile and preferences.
    </p>
  `),

  application_confirmation: (data: TemplateData) => getBaseTemplate(`
    <h2>Application Submitted Successfully ✅</h2>
    <p>Hi ${data.name},</p>
    <p>Your application for <strong>${data.job_title}</strong> at <span class="company-name">${data.company_name}</span> has been successfully submitted.</p>
    
    <div class="highlight">
      <p><strong>Application Details:</strong></p>
      <p>Position: ${data.job_title}</p>
      <p>Company: ${data.company_name}</p>
      <p>Applied on: ${new Date(data.applied_date || Date.now()).toLocaleDateString()}</p>
      <p>Application ID: ${data.application_id}</p>
    </div>
    
    <p>The hiring team will review your application and get back to you soon. In the meantime, you can:</p>
    <ul>
      <li>Track your application status</li>
      <li>Explore similar opportunities</li>
      <li>Update your profile to attract more employers</li>
    </ul>
    
    <a href="https://talentxcel.in/jobs/my-applications" class="button">Track Application</a>
  `),

  invite_member: (data: TemplateData) => getBaseTemplate(`
    <h2>You've Been Invited to Join ${data.company_name}! 🎊</h2>
    <p>Hi ${data.invited_name},</p>
    <p><strong>${data.inviter_name}</strong> has invited you to join the <span class="company-name">${data.company_name}</span> team on TalentXcel.</p>
    
    <div class="highlight">
      <p><strong>Invitation Details:</strong></p>
      <p>Company: ${data.company_name}</p>
      <p>Role: ${data.role}</p>
      <p>Invited by: ${data.inviter_name}</p>
    </div>
    
    <p>As a team member, you'll be able to:</p>
    <ul>
      <li>Manage job postings and applications</li>
      <li>Access company analytics and insights</li>
      <li>Collaborate with your team</li>
      <li>Build your employer brand</li>
    </ul>
    
    <a href="https://talentxcel.in/employer/invite?token=${data.invite_token}" class="button">Accept Invitation</a>
    
    <p style="margin-top: 20px; font-size: 14px; color: #6b7280;">
      This invitation will expire in 7 days. If you have any questions, contact ${data.inviter_name} directly.
    </p>
  `),

  password_reset: (data: TemplateData) => getBaseTemplate(`
    <h2>Reset Your Password 🔐</h2>
    <p>Hi ${data.name},</p>
    <p>We received a request to reset your password for your TalentXcel account.</p>
    
    <div class="highlight">
      <p><strong>Security Information:</strong></p>
      <p>Request time: ${new Date().toLocaleString()}</p>
      <p>IP Address: ${data.ip_address || 'Hidden for security'}</p>
    </div>
    
    <p>Click the button below to create a new password. This link will expire in 1 hour for security reasons.</p>
    <a href="${data.reset_link}" class="button">Reset Password</a>
    
    <p style="margin-top: 30px; color: #dc2626; font-weight: 600;">
      ⚠️ If you didn't request this password reset, please ignore this email and consider securing your account.
    </p>
  `),

  interview_scheduled: (data: TemplateData) => getBaseTemplate(`
    <h2>Interview Scheduled! 📅</h2>
    <p>Hi ${data.candidate_name},</p>
    <p>Great news! <span class="company-name">${data.company_name}</span> has scheduled an interview with you for the <strong>${data.job_title}</strong> position.</p>
    
    <div class="highlight">
      <p><strong>Interview Details:</strong></p>
      <p>Date: ${new Date(data.interview_date).toLocaleDateString()}</p>
      <p>Time: ${data.interview_time}</p>
      <p>Type: ${data.interview_type || 'Virtual'}</p>
      <p>Duration: ${data.duration || '1 hour'}</p>
      ${data.meeting_link ? `<p>Meeting Link: <a href="${data.meeting_link}">Join Interview</a></p>` : ''}
    </div>
    
    <p><strong>Interview Tips:</strong></p>
    <ul>
      <li>Research the company and role thoroughly</li>
      <li>Prepare specific examples of your achievements</li>
      <li>Test your technology if it's a virtual interview</li>
      <li>Prepare thoughtful questions about the role</li>
    </ul>
    
    <a href="https://talentxcel.in/jobs/interviews" class="button">View Interview Details</a>
    
    <p style="margin-top: 20px; font-size: 14px; color: #6b7280;">
      Good luck! Remember, you were selected because they believe you're a great fit.
    </p>
  `),

  monthly_digest: (data: TemplateData) => getBaseTemplate(`
    <h2>Your Monthly Career Digest 📊</h2>
    <p>Hi ${data.name},</p>
    <p>Here's a summary of your activity and new opportunities this month.</p>
    
    <div class="highlight">
      <p><strong>Your Stats This Month:</strong></p>
      <p>Profile views: ${data.profile_views || 0}</p>
      <p>Job applications: ${data.applications_sent || 0}</p>
      <p>New connections: ${data.new_connections || 0}</p>
      <p>Interview invitations: ${data.interviews || 0}</p>
    </div>
    
    <h3 style="color: #1f2937; margin: 30px 0 15px 0;">🔥 Trending Opportunities</h3>
    ${data.trending_jobs ? data.trending_jobs.map((job: any) => `
      <div style="border: 1px solid #e5e7eb; border-radius: 6px; padding: 15px; margin: 10px 0;">
        <h4 style="margin: 0 0 5px 0; color: #1f2937;">${job.title}</h4>
        <p style="margin: 0; color: #6b7280; font-size: 14px;">${job.company} • ${job.location}</p>
      </div>
    `).join('') : '<p>No trending jobs this month.</p>'}
    
    <a href="https://talentxcel.in/network" class="button">Explore Opportunities</a>
    
    <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
      Want to change your email preferences? <a href="https://talentxcel.in/profile/settings">Update settings</a>
    </p>
  `)
};

export { templates };
export default templates;