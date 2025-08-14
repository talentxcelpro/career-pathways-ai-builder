-- Insert comprehensive email templates for all automation types
INSERT INTO email_templates (template_type, name, subject, content, is_active) VALUES

-- Application & Job Related Templates
('application_confirmation', 
'Application Confirmation Template',
'Application Confirmation - {{job_title}} at {{company_name}}',
'<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Application Confirmation</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { margin: 0; padding: 0; background-color: #f3f4f6; font-family: ''Segoe UI'', ''Helvetica Neue'', sans-serif; color: #1a1a1a; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
    .header { background: linear-gradient(to right, #1e3a8a, #2563eb); padding: 24px; text-align: center; color: #ffffff; }
    .logo { font-size: 24px; font-weight: bold; text-decoration: none; display: block; color: #ffffff; }
    .logo span { color: #facc15; }
    .body { padding: 32px 24px; }
    .body p { font-size: 15px; line-height: 1.6; margin-bottom: 16px; }
    .cta { text-align: center; margin-top: 20px; }
    .cta a { background-color: #1e40af; color: white; text-decoration: none; padding: 14px 28px; font-weight: bold; border-radius: 6px; display: inline-block; }
    .footer { padding: 20px; background-color: #f1f5f9; font-size: 12px; text-align: center; color: #6b7280; }
    .footer a { color: #2563eb; margin: 0 6px; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <a href="https://talentxcel.in" class="logo">Talent<span>Xcel</span></a>
      <h2 style="margin: 10px 0;">Application Confirmation</h2>
      <div style="font-size: 14px; margin-top: 6px; color: #e0e7ff;">Your application has been received successfully</div>
    </div>
    <div class="body">
      <p>Hi {{candidate_name}},</p>
      <p>We''re pleased to let you know that your application for <strong>{{job_title}}</strong> at <strong>{{company_name}}</strong> has been received.</p>
      <p>Our hiring team will review your application and reach out with the next steps if your profile matches the requirements.</p>
      <div class="cta">
        <a href="https://talentxcel.in/jobs">Browse More Jobs</a>
      </div>
    </div>
    <div class="footer">© 2025 TalentXcel Services | <a href="https://talentxcel.in">talentxcel.in</a></div>
  </div>
</body>
</html>', true),

('application_notification',
'Application Notification Template',
'New Application Received - {{job_title}}',
'<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>New Application Received</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { margin: 0; padding: 0; background-color: #f3f4f6; font-family: ''Segoe UI'', ''Helvetica Neue'', sans-serif; color: #1a1a1a; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
    .header { background: linear-gradient(to right, #1e3a8a, #2563eb); padding: 24px; text-align: center; color: #ffffff; }
    .logo { font-size: 24px; font-weight: bold; text-decoration: none; display: block; color: #ffffff; }
    .logo span { color: #facc15; }
    .body { padding: 32px 24px; }
    .body p { font-size: 15px; line-height: 1.6; margin-bottom: 16px; }
    .cta { text-align: center; margin-top: 20px; }
    .cta a { background-color: #1e40af; color: white; text-decoration: none; padding: 14px 28px; font-weight: bold; border-radius: 6px; display: inline-block; }
    .footer { padding: 20px; background-color: #f1f5f9; font-size: 12px; text-align: center; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <a href="https://talentxcel.in" class="logo">Talent<span>Xcel</span></a>
      <h2 style="margin: 10px 0;">New Application Received</h2>
    </div>
    <div class="body">
      <p>Hello {{employer_name}},</p>
      <p>You have received a new application for <strong>{{job_title}}</strong> from {{candidate_name}}.</p>
      <p><strong>Candidate Summary:</strong><br>{{candidate_summary}}</p>
      <div class="cta">
        <a href="https://talentxcel.in/employer/applications">Review Application</a>
      </div>
    </div>
    <div class="footer">© 2025 TalentXcel Services</div>
  </div>
</body>
</html>', true),

('job_recommendation',
'Job Recommendation Template',
'🎯 New Job Recommendations Just for You',
'<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Job Recommendations</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { margin: 0; padding: 0; background-color: #f3f4f6; font-family: ''Segoe UI'', ''Helvetica Neue'', sans-serif; color: #1a1a1a; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
    .header { background: linear-gradient(to right, #1e3a8a, #2563eb); padding: 24px; text-align: center; color: #ffffff; }
    .logo { font-size: 24px; font-weight: bold; text-decoration: none; display: block; color: #ffffff; }
    .logo span { color: #facc15; }
    .body { padding: 32px 24px; }
    .body p { font-size: 15px; line-height: 1.6; margin-bottom: 16px; }
    .body ul { padding-left: 20px; margin-bottom: 24px; }
    .body ul li { margin-bottom: 10px; }
    .cta { text-align: center; margin-top: 20px; }
    .cta a { background-color: #1e40af; color: white; text-decoration: none; padding: 14px 28px; font-weight: bold; border-radius: 6px; display: inline-block; }
    .footer { padding: 20px; background-color: #f1f5f9; font-size: 12px; text-align: center; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <a href="https://talentxcel.in" class="logo">Talent<span>Xcel</span></a>
      <h2 style="margin: 10px 0;">New Job Recommendations</h2>
      <div style="font-size: 14px; margin-top: 6px; color: #e0e7ff;">Curated just for you</div>
    </div>
    <div class="body">
      <p>Hi {{candidate_name}},</p>
      <p>We found {{job_count}} new job opportunities that match your profile:</p>
      <div class="cta">
        <a href="https://talentxcel.in/jobs/recommended">View All Recommendations</a>
      </div>
    </div>
    <div class="footer">© 2025 TalentXcel Services</div>
  </div>
</body>
</html>', true),

('career_map_ready',
'Career Map Ready Template',
'🧭 Your 5-Year Career Map is Ready',
'<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Career Map Ready</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { margin: 0; padding: 0; background-color: #f3f4f6; font-family: ''Segoe UI'', ''Helvetica Neue'', sans-serif; color: #1a1a1a; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
    .header { background: linear-gradient(to right, #1e3a8a, #2563eb); padding: 24px; text-align: center; color: #ffffff; }
    .logo { font-size: 24px; font-weight: bold; text-decoration: none; display: block; color: #ffffff; }
    .logo span { color: #facc15; }
    .body { padding: 32px 24px; }
    .body p { font-size: 15px; line-height: 1.6; margin-bottom: 16px; }
    .cta { text-align: center; margin-top: 20px; }
    .cta a { background-color: #1e40af; color: white; text-decoration: none; padding: 14px 28px; font-weight: bold; border-radius: 6px; display: inline-block; }
    .footer { padding: 20px; background-color: #f1f5f9; font-size: 12px; text-align: center; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <a href="https://talentxcel.in" class="logo">Talent<span>Xcel</span></a>
      <h2 style="margin: 10px 0;">Your 5-Year Career Map is Ready</h2>
      <div style="font-size: 14px; margin-top: 6px; color: #e0e7ff;">Plan your future with confidence</div>
    </div>
    <div class="body">
      <p>Hi {{candidate_name}},</p>
      <p>Your personalized 5-year career roadmap is ready! Discover your path to success and plan your next steps with confidence.</p>
      <div class="cta">
        <a href="https://talentxcel.in/career-map">View My Career Map</a>
      </div>
    </div>
    <div class="footer">© 2025 TalentXcel Services</div>
  </div>
</body>
</html>', true),

('profile_completion_reminder',
'Profile Completion Reminder Template',
'Complete Your TalentXcel Profile to Unlock All Features',
'<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Complete Your Profile</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { margin: 0; padding: 0; background-color: #f3f4f6; font-family: ''Segoe UI'', ''Helvetica Neue'', sans-serif; color: #1a1a1a; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
    .header { background: linear-gradient(to right, #1e3a8a, #2563eb); padding: 24px; text-align: center; color: #ffffff; }
    .logo { font-size: 24px; font-weight: bold; text-decoration: none; display: block; color: #ffffff; }
    .logo span { color: #facc15; }
    .body { padding: 32px 24px; }
    .body p { font-size: 15px; line-height: 1.6; margin-bottom: 16px; }
    .body ul { padding-left: 20px; margin-bottom: 24px; }
    .body ul li { margin-bottom: 10px; }
    .cta { text-align: center; margin-top: 20px; }
    .cta a { background-color: #1e40af; color: white; text-decoration: none; padding: 14px 28px; font-weight: bold; border-radius: 6px; display: inline-block; }
    .footer { padding: 20px; background-color: #f1f5f9; font-size: 12px; text-align: center; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <a href="https://talentxcel.in" class="logo">Talent<span>Xcel</span></a>
      <h2 style="margin: 10px 0;">Complete Your Profile</h2>
      <div style="font-size: 14px; margin-top: 6px; color: #e0e7ff;">Unlock better job opportunities</div>
    </div>
    <div class="body">
      <p>Hi {{candidate_name}},</p>
      <p>Your profile is {{completion_percentage}}% complete! Finish it now to get better job matches and stand out to employers.</p>
      <p><strong>Why complete your profile?</strong></p>
      <ul>
        <li>✅ Get 3x more job matches</li>
        <li>✅ Increase visibility to recruiters</li>
        <li>✅ Access exclusive opportunities</li>
        <li>✅ Show your professional skills</li>
      </ul>
      <div class="cta">
        <a href="https://talentxcel.in/profile">✨ Complete My Profile</a>
      </div>
    </div>
    <div class="footer">© 2025 TalentXcel Services</div>
  </div>
</body>
</html>', true),

('welcome',
'Welcome Email Template',
'Welcome to TalentXcel - Your Career Journey Starts Here!',
'<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Welcome to TalentXcel</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { margin: 0; padding: 0; background-color: #f3f4f6; font-family: ''Segoe UI'', ''Helvetica Neue'', sans-serif; color: #1a1a1a; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
    .header { background: linear-gradient(to right, #1e3a8a, #2563eb); padding: 24px; text-align: center; color: #ffffff; }
    .logo { font-size: 24px; font-weight: bold; text-decoration: none; display: block; color: #ffffff; }
    .logo span { color: #facc15; }
    .body { padding: 32px 24px; }
    .body p { font-size: 15px; line-height: 1.6; margin-bottom: 16px; }
    .body ul { padding-left: 20px; margin-bottom: 24px; }
    .body ul li { margin-bottom: 10px; }
    .cta { text-align: center; margin-top: 20px; }
    .cta a { background-color: #1e40af; color: white; text-decoration: none; padding: 14px 28px; font-weight: bold; border-radius: 6px; display: inline-block; }
    .footer { padding: 20px; background-color: #f1f5f9; font-size: 12px; text-align: center; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <a href="https://talentxcel.in" class="logo">Talent<span>Xcel</span></a>
      <h2 style="margin: 10px 0;">Welcome to TalentXcel!</h2>
      <div style="font-size: 14px; margin-top: 6px; color: #e0e7ff;">Your career journey starts here</div>
    </div>
    <div class="body">
      <p>Hi {{candidate_name}},</p>
      <p>Welcome to TalentXcel! We''re thrilled to have you join our community of ambitious professionals.</p>
      <p><strong>Here''s what you can do now:</strong></p>
      <ul>
        <li>🎯 Explore thousands of job opportunities</li>
        <li>📝 Build your professional resume</li>
        <li>🤝 Connect with industry professionals</li>
        <li>📚 Access career development resources</li>
        <li>🏆 Track your career progress</li>
      </ul>
      <div class="cta">
        <a href="https://talentxcel.in/onboarding">Get Started</a>
      </div>
    </div>
    <div class="footer">© 2025 TalentXcel Services</div>
  </div>
</body>
</html>', true),

('connection_request',
'Connection Request Template',
'New Connection Request from {{requester_name}}',
'<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Connection Request</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { margin: 0; padding: 0; background-color: #f3f4f6; font-family: ''Segoe UI'', ''Helvetica Neue'', sans-serif; color: #1a1a1a; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
    .header { background: linear-gradient(to right, #1e3a8a, #2563eb); padding: 24px; text-align: center; color: #ffffff; }
    .logo { font-size: 24px; font-weight: bold; text-decoration: none; display: block; color: #ffffff; }
    .logo span { color: #facc15; }
    .body { padding: 32px 24px; }
    .body p { font-size: 15px; line-height: 1.6; margin-bottom: 16px; }
    .cta { text-align: center; margin-top: 20px; }
    .cta a { background-color: #1e40af; color: white; text-decoration: none; padding: 14px 28px; font-weight: bold; border-radius: 6px; display: inline-block; margin: 0 10px; }
    .footer { padding: 20px; background-color: #f1f5f9; font-size: 12px; text-align: center; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <a href="https://talentxcel.in" class="logo">Talent<span>Xcel</span></a>
      <h2 style="margin: 10px 0;">New Connection Request</h2>
    </div>
    <div class="body">
      <p>Hi {{recipient_name}},</p>
      <p><strong>{{requester_name}}</strong> ({{requester_title}}) wants to connect with you on TalentXcel.</p>
      <p>{{connection_message}}</p>
      <div class="cta">
        <a href="https://talentxcel.in/network/requests">View Request</a>
      </div>
    </div>
    <div class="footer">© 2025 TalentXcel Services</div>
  </div>
</body>
</html>', true),

('connection_accepted',
'Connection Accepted Template',
'Connection Accepted - You''re now connected with {{accepter_name}}',
'<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Connection Accepted</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { margin: 0; padding: 0; background-color: #f3f4f6; font-family: ''Segoe UI'', ''Helvetica Neue'', sans-serif; color: #1a1a1a; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
    .header { background: linear-gradient(to right, #1e3a8a, #2563eb); padding: 24px; text-align: center; color: #ffffff; }
    .logo { font-size: 24px; font-weight: bold; text-decoration: none; display: block; color: #ffffff; }
    .logo span { color: #facc15; }
    .body { padding: 32px 24px; }
    .body p { font-size: 15px; line-height: 1.6; margin-bottom: 16px; }
    .cta { text-align: center; margin-top: 20px; }
    .cta a { background-color: #1e40af; color: white; text-decoration: none; padding: 14px 28px; font-weight: bold; border-radius: 6px; display: inline-block; }
    .footer { padding: 20px; background-color: #f1f5f9; font-size: 12px; text-align: center; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <a href="https://talentxcel.in" class="logo">Talent<span>Xcel</span></a>
      <h2 style="margin: 10px 0;">Connection Accepted!</h2>
    </div>
    <div class="body">
      <p>Hi {{requester_name}},</p>
      <p>Great news! <strong>{{accepter_name}}</strong> has accepted your connection request.</p>
      <p>You can now message each other and stay updated on professional activities.</p>
      <div class="cta">
        <a href="https://talentxcel.in/network/people">View Connections</a>
      </div>
    </div>
    <div class="footer">© 2025 TalentXcel Services</div>
  </div>
</body>
</html>', true),

('resume_created',
'Resume Created Template',
'Your Resume is Ready - {{resume_title}}',
'<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Resume Created</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { margin: 0; padding: 0; background-color: #f3f4f6; font-family: ''Segoe UI'', ''Helvetica Neue'', sans-serif; color: #1a1a1a; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
    .header { background: linear-gradient(to right, #1e3a8a, #2563eb); padding: 24px; text-align: center; color: #ffffff; }
    .logo { font-size: 24px; font-weight: bold; text-decoration: none; display: block; color: #ffffff; }
    .logo span { color: #facc15; }
    .body { padding: 32px 24px; }
    .body p { font-size: 15px; line-height: 1.6; margin-bottom: 16px; }
    .cta { text-align: center; margin-top: 20px; }
    .cta a { background-color: #1e40af; color: white; text-decoration: none; padding: 14px 28px; font-weight: bold; border-radius: 6px; display: inline-block; margin: 0 5px; }
    .footer { padding: 20px; background-color: #f1f5f9; font-size: 12px; text-align: center; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <a href="https://talentxcel.in" class="logo">Talent<span>Xcel</span></a>
      <h2 style="margin: 10px 0;">Your Resume is Ready!</h2>
    </div>
    <div class="body">
      <p>Hi {{candidate_name}},</p>
      <p>Congratulations! Your resume <strong>"{{resume_title}}"</strong> has been successfully created.</p>
      <p>Your ATS compatibility score: <strong>{{ats_score}}/100</strong></p>
      <div class="cta">
        <a href="https://talentxcel.in/resume/view/{{resume_id}}">View Resume</a>
        <a href="https://talentxcel.in/resume/download/{{resume_id}}">Download PDF</a>
      </div>
    </div>
    <div class="footer">© 2025 TalentXcel Services</div>
  </div>
</body>
</html>', true),

('password_reset',
'Password Reset Template',
'Reset Your TalentXcel Password',
'<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Password Reset</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { margin: 0; padding: 0; background-color: #f3f4f6; font-family: ''Segoe UI'', ''Helvetica Neue'', sans-serif; color: #1a1a1a; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
    .header { background: linear-gradient(to right, #1e3a8a, #2563eb); padding: 24px; text-align: center; color: #ffffff; }
    .logo { font-size: 24px; font-weight: bold; text-decoration: none; display: block; color: #ffffff; }
    .logo span { color: #facc15; }
    .body { padding: 32px 24px; }
    .body p { font-size: 15px; line-height: 1.6; margin-bottom: 16px; }
    .cta { text-align: center; margin-top: 20px; }
    .cta a { background-color: #1e40af; color: white; text-decoration: none; padding: 14px 28px; font-weight: bold; border-radius: 6px; display: inline-block; }
    .footer { padding: 20px; background-color: #f1f5f9; font-size: 12px; text-align: center; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <a href="https://talentxcel.in" class="logo">Talent<span>Xcel</span></a>
      <h2 style="margin: 10px 0;">Reset Your Password</h2>
    </div>
    <div class="body">
      <p>Hi {{candidate_name}},</p>
      <p>We received a request to reset your password for your TalentXcel account.</p>
      <p>Click the button below to create a new password. This link will expire in 24 hours.</p>
      <div class="cta">
        <a href="{{reset_url}}">Reset Password</a>
      </div>
      <p><small>If you didn''t request this password reset, please ignore this email.</small></p>
    </div>
    <div class="footer">© 2025 TalentXcel Services</div>
  </div>
</body>
</html>', true)

ON CONFLICT (template_type) DO UPDATE SET
name = EXCLUDED.name,
subject = EXCLUDED.subject,
content = EXCLUDED.content,
is_active = EXCLUDED.is_active,
updated_at = now();