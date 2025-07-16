-- Add HTML template content field to email automation settings
ALTER TABLE public.email_automation_settings 
ADD COLUMN html_template TEXT;

-- Update existing records with default HTML templates
UPDATE public.email_automation_settings 
SET html_template = CASE 
  WHEN trigger_type = 'welcome_email' THEN '
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #2563eb; margin: 0;">Welcome to TalentXcel!</h1>
    <p style="color: #6b7280; margin: 5px 0;">Your professional journey starts here</p>
  </div>
  
  <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
    <h2 style="margin: 0 0 15px 0;">Hello {{name}}!</h2>
    <p style="margin: 0; font-size: 16px; opacity: 0.9;">Thank you for joining TalentXcel. We''re excited to help you discover amazing career opportunities!</p>
  </div>
  
  <div style="background: #f8fafc; padding: 25px; border-radius: 8px; margin-bottom: 30px;">
    <h3 style="color: #1e293b; margin: 0 0 15px 0;">🚀 Get Started</h3>
    <ul style="color: #64748b; line-height: 1.6; padding-left: 20px;">
      <li>Complete your profile to attract top employers</li>
      <li>Browse thousands of job opportunities</li>
      <li>Connect with industry professionals</li>
      <li>Get AI-powered career recommendations</li>
    </ul>
  </div>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="https://talentxcel.in/profile" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Complete Your Profile</a>
  </div>
  
  <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; color: #64748b; font-size: 14px;">
    <p style="margin: 0;">This email was sent automatically by TalentXcel.</p>
    <p style="margin: 5px 0 0 0;">Need help? Contact us at <a href="mailto:support@talentxcel.in" style="color: #3b82f6;">support@talentxcel.in</a></p>
  </div>
</div>'
  WHEN trigger_type = 'job_recommendation' THEN '
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #2563eb; margin: 0;">New Job Match! 💼</h1>
    <p style="color: #6b7280; margin: 5px 0;">We found opportunities that match your profile</p>
  </div>
  
  <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
    <h3 style="color: #166534; margin: 0 0 10px 0;">{{job_title}}</h3>
    <p style="color: #15803d; margin: 5px 0; font-weight: 600;">{{company_name}}</p>
    <p style="color: #166534; margin: 5px 0;">📍 {{location}}</p>
    <p style="color: #166534; margin: 5px 0;">💰 {{salary_range}}</p>
  </div>
  
  <div style="text-align: center; margin: 25px 0;">
    <a href="https://talentxcel.in/jobs/{{job_id}}" style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">View Job Details</a>
  </div>
  
  <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
    <h4 style="color: #1e293b; margin: 0 0 10px 0;">Why this matches you:</h4>
    <p style="color: #64748b; margin: 0; line-height: 1.6;">Based on your skills and experience, this role offers excellent growth opportunities in your field.</p>
  </div>
  
  <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; color: #64748b; font-size: 14px;">
    <p style="margin: 0;">This email was sent automatically by TalentXcel.</p>
  </div>
</div>'
  WHEN trigger_type = 'connection_request' THEN '
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #2563eb; margin: 0;">New Connection Request</h1>
    <p style="color: #6b7280; margin: 5px 0;">Someone wants to connect with you</p>
  </div>
  
  <div style="background: #f0f9ff; border: 1px solid #bae6fd; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
    <h3 style="color: #0c4a6e; margin: 0 0 15px 0;">{{requester_name}} wants to connect</h3>
    <p style="color: #0369a1; margin: 5px 0;">{{requester_title}}</p>
    <p style="color: #0369a1; margin: 5px 0;">{{requester_company}}</p>
  </div>
  
  <div style="text-align: center; margin: 25px 0;">
    <a href="https://talentxcel.in/network/requests" style="background: #0284c7; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; margin-right: 10px;">Accept Connection</a>
    <a href="https://talentxcel.in/network/requests" style="background: #6b7280; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">View Request</a>
  </div>
  
  <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; color: #64748b; font-size: 14px;">
    <p style="margin: 0;">This email was sent automatically by TalentXcel.</p>
  </div>
</div>'
  ELSE '
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #2563eb; margin: 0;">TalentXcel Notification</h1>
    <p style="color: #6b7280; margin: 5px 0;">Update from your professional network</p>
  </div>
  
  <div style="background: #f8fafc; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
    <p style="color: #1e293b; margin: 0; line-height: 1.6;">Hello {{name}}, you have a new notification from TalentXcel.</p>
  </div>
  
  <div style="text-align: center; margin: 25px 0;">
    <a href="https://talentxcel.in" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Visit TalentXcel</a>
  </div>
  
  <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; color: #64748b; font-size: 14px;">
    <p style="margin: 0;">This email was sent automatically by TalentXcel.</p>
  </div>
</div>'
END
WHERE html_template IS NULL;