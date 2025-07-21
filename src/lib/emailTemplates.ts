export interface TemplateData {
  first_name?: string;
  name?: string;
  recipient_name?: string;
  sender_name?: string;
  requester_name?: string;
  inviter_name?: string;
  company_name?: string;
  job_title?: string;
  job_title_1?: string;
  company_1?: string;
  job_title_2?: string;
  company_2?: string;
  job_title_3?: string;
  company_3?: string;
  invite_code?: string;
  invitation_token?: string;
  reset_link?: string;
  interview_datetime?: string;
  interview_mode?: string;
  meeting_link?: string;
  month?: string;
  connections_count?: number;
  jobs_applied?: number;
  certifications_count?: number;
  jobs_suggested?: number;
  requester_title?: string;
  requester_company?: string;
  email?: string;
  password?: string;
  loginUrl?: string;
  application_id?: string;
  applied_date?: string;
  interview_date?: string;
  interview_time?: string;
  interview_type?: string;
  candidate_name?: string;
}

const templates = {
  welcome: (data: TemplateData) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2563eb; margin-bottom: 10px;">Welcome to TalentXcel! 🎉</h1>
        <p style="color: #64748b; font-size: 16px;">Your journey to career excellence starts here</p>
      </div>
      
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
        <h2 style="margin: 0 0 15px 0;">Hi ${data.name || 'there'}! 👋</h2>
        <p style="margin: 0; font-size: 18px; opacity: 0.9;">We're excited to have you join our community of professionals!</p>
      </div>
      
      <div style="background: #f8fafc; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
        <h3 style="color: #1e293b; margin-top: 0;">🚀 Get Started:</h3>
        <ul style="color: #475569; line-height: 1.6;">
          <li>Complete your profile to attract opportunities</li>
          <li>Connect with professionals in your industry</li>
          <li>Explore job opportunities tailored for you</li>
          <li>Enhance your skills with our learning resources</li>
        </ul>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://talentxcel.in/profile" style="background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Complete Your Profile</a>
      </div>
      
      <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; color: #64748b; font-size: 14px;">
        <p>Need help? Reply to this email or visit our <a href="https://talentxcel.in/support" style="color: #2563eb;">support center</a></p>
        <p style="margin-top: 15px;"><strong>Powering Global Career Growth</strong></p>
      </div>
    </div>
  `,

  super_admin_welcome: (data: TemplateData) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #dc2626; margin-bottom: 10px;">🎉 Super Admin Access Granted!</h1>
        <p style="color: #64748b; font-size: 16px;">Welcome to TalentXcel's Elite Administrative Team</p>
      </div>
      
      <div style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
        <h2 style="margin: 0 0 15px 0;">Hi ${data.name || 'Administrator'}! 👑</h2>
        <p style="margin: 0; font-size: 18px; opacity: 0.9;">You've been granted Super Admin privileges with Pro Elite access!</p>
      </div>
      
      <div style="background: #fef3c7; border: 2px solid #fbbf24; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
        <h3 style="color: #92400e; margin-top: 0;">🔐 Your Login Credentials:</h3>
        <div style="background: white; padding: 15px; border-radius: 6px; font-family: monospace;">
          <p style="margin: 5px 0;"><strong>Email:</strong> ${data.email}</p>
          <p style="margin: 5px 0;"><strong>Password:</strong> ${data.password}</p>
          <p style="margin: 5px 0;"><strong>Login URL:</strong> <a href="${data.loginUrl}" style="color: #dc2626;">${data.loginUrl}</a></p>
        </div>
        <p style="color: #92400e; font-size: 14px; margin-bottom: 0; margin-top: 15px;">
          ⚠️ Please change your password after first login for security.
        </p>
      </div>
      
      <div style="background: #f8fafc; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
        <h3 style="color: #1e293b; margin-top: 0;">👑 Your Super Admin Powers:</h3>
        <ul style="color: #475569; line-height: 1.6; margin: 0;">
          <li><strong>Full Platform Access:</strong> Manage all users, content, and settings</li>
          <li><strong>Pro Elite Subscription:</strong> ₹1999/month value (1-year complimentary)</li>
          <li><strong>Advanced Analytics:</strong> Complete platform insights and reports</li>
          <li><strong>User Management:</strong> Create, modify, and manage user accounts</li>
          <li><strong>Content Moderation:</strong> Review and manage all platform content</li>
          <li><strong>System Configuration:</strong> Access to admin tools and settings</li>
        </ul>
      </div>
      
      <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
        <h3 style="color: #1e40af; margin-top: 0;">🚀 Quick Start Guide:</h3>
        <ol style="color: #1e40af; line-height: 1.6; margin: 0;">
          <li>Login with your credentials above</li>
          <li>Visit the Admin Dashboard: <code>/admin</code></li>
          <li>Complete your admin profile</li>
          <li>Explore the user management tools</li>
          <li>Familiarize yourself with content moderation features</li>
        </ol>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.loginUrl}" style="background: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; margin-right: 10px;">Login Now</a>
        <a href="https://talentxcel.in/admin" style="background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Admin Dashboard</a>
      </div>
      
      <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; color: #64748b; font-size: 14px;">
        <p>For admin support, contact: <a href="mailto:admin@talentxcel.in" style="color: #2563eb;">admin@talentxcel.in</a></p>
        <p style="margin-top: 15px;"><strong>TalentXcel - Powering Global Career Growth</strong></p>
      </div>
    </div>
  `,
  new_connection: (data: TemplateData) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #2563eb;">New Connection Request! 🤝</h2>
      <p>Hi ${data.first_name || data.recipient_name}!</p>
      <p><strong>${data.sender_name}</strong> wants to connect with you on TalentXcel.</p>
      <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0;">Building professional connections opens doors to new opportunities!</p>
      </div>
      <a href="https://talentxcel.in/network/requests" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Connection Request</a>
      <p style="color: #64748b; font-size: 14px; margin-top: 20px;">Sent via TalentXcel</p>
    </div>
  `,
  job_opening: (data: TemplateData) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #2563eb;">New Job Opportunities! 💼</h2>
      <p>Hi ${data.first_name || data.name}!</p>
      <p>We found some exciting job opportunities that match your profile:</p>
      
      <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #1e293b; margin-top: 0;">${data.job_title_1 || 'Software Engineer'}</h3>
        <p style="color: #2563eb; font-weight: bold;">${data.company_1 || 'TechCorp'}</p>
        
        <h3 style="color: #1e293b;">${data.job_title_2 || 'Product Manager'}</h3>
        <p style="color: #2563eb; font-weight: bold;">${data.company_2 || 'InnovaCorp'}</p>
        
        <h3 style="color: #1e293b;">${data.job_title_3 || 'Data Analyst'}</h3>
        <p style="color: #2563eb; font-weight: bold;">${data.company_3 || 'DataTech'}</p>
      </div>
      
      <a href="https://talentxcel.in/jobs" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View All Jobs</a>
      <p style="color: #64748b; font-size: 14px; margin-top: 20px;">Sent via TalentXcel</p>
    </div>
  `
};

export type TemplateName = keyof typeof templates;
export default templates;
