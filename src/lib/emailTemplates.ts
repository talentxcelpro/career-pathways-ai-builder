interface TemplateData {
  [key: string]: any;
}

const getBaseTemplate = (content: string, year: number = new Date().getFullYear()) => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        line-height: 1.6;
        color: #333;
        margin: 0;
        padding: 0;
        background-color: #f5f5f5;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background-color: white;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
      .header {
        background: linear-gradient(135deg, #3b82f6, #6366f1);
        padding: 40px 30px;
        text-align: center;
      }
      .header img {
        height: 40px;
        width: auto;
      }
      .header h1 {
        color: white;
        margin: 15px 0 0 0;
        font-size: 24px;
        font-weight: 700;
      }
      .content {
        padding: 40px 30px;
      }
      .content h2 {
        color: #1f2937;
        margin: 0 0 20px 0;
        font-size: 20px;
        font-weight: 600;
      }
      .content p {
        margin: 0 0 15px 0;
        color: #4b5563;
      }
      .button {
        display: inline-block;
        background: linear-gradient(135deg, #3b82f6, #6366f1);
        color: white !important;
        padding: 12px 24px;
        text-decoration: none;
        border-radius: 6px;
        font-weight: 600;
        margin: 20px 0;
        transition: transform 0.2s;
      }
      .button:hover {
        transform: translateY(-1px);
      }
      .footer {
        background-color: #f9fafb;
        padding: 30px;
        text-align: center;
        color: #6b7280;
        font-size: 14px;
        border-top: 1px solid #e5e7eb;
      }
      .highlight {
        background-color: #eff6ff;
        border-left: 4px solid #3b82f6;
        padding: 15px;
        margin: 20px 0;
        border-radius: 0 6px 6px 0;
      }
      .company-name {
        color: #3b82f6;
        font-weight: 600;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <img src="https://talentxcel.in/lovable-uploads/6d89e12a-6a33-4059-acbe-49af3b255eb3.png" alt="TalentXcel Logo" />
        <h1>TalentXcel</h1>
      </div>
      <div class="content">
        ${content}
      </div>
      <div class="footer">
        <p>© ${year} <strong>TalentXcel</strong>. All rights reserved.</p>
        <p>Follow us on <a href="#" style="color: #3b82f6;">LinkedIn</a> | <a href="#" style="color: #3b82f6;">Twitter</a></p>
        <p><a href="https://talentxcel.in/unsubscribe" style="color: #6b7280; font-size: 12px;">Unsubscribe</a></p>
      </div>
    </div>
  </body>
</html>
`;

const templates = {
  welcome: (data: TemplateData) => getBaseTemplate(`
    <h2>Welcome to TalentXcel, ${data.name}! 🎉</h2>
    <p>We're thrilled to have you join our professional community. TalentXcel is designed to accelerate your career journey and connect you with amazing opportunities.</p>
    
    <div class="highlight">
      <strong>Get started in 3 simple steps:</strong>
      <ol>
        <li>Complete your profile</li>
        <li>Upload your resume</li>
        <li>Start exploring opportunities</li>
      </ol>
    </div>
    
    <p>Your professional journey starts here. Let's build something amazing together!</p>
    <a href="https://talentxcel.in/network" class="button">Go to Dashboard</a>
    
    <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
      Need help? Contact our support team at <a href="mailto:support@talentxcel.in">support@talentxcel.in</a>
    </p>
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

export default templates;