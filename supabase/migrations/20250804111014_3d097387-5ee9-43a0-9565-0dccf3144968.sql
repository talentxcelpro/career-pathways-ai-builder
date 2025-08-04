-- Step 1: Update email automation settings with professional HTML templates
UPDATE email_automation_settings 
SET 
  subject_template = 'Complete Your TalentXcel Profile to Unlock All Features',
  html_template = '<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Complete Your TalentXcel Profile to Unlock All Features</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f3f4f6;
      font-family: ''Segoe UI'', ''Helvetica Neue'', sans-serif;
      color: #1a1a1a;
    }

    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 10px rgba(0,0,0,0.05);
    }

    .header {
      background: linear-gradient(to right, #1e3a8a, #2563eb);
      padding: 24px;
      text-align: center;
      color: #ffffff;
    }

    .logo {
      font-size: 24px;
      font-weight: bold;
      text-decoration: none;
      display: block;
      color: #ffffff;
    }

    .logo span {
      color: #facc15;
    }

    .subheader {
      font-size: 14px;
      margin-top: 6px;
      color: #e0e7ff;
    }

    .body {
      padding: 32px 24px;
    }

    .body p {
      font-size: 15px;
      line-height: 1.6;
      margin-bottom: 16px;
    }

    .body ul {
      padding-left: 20px;
      margin-bottom: 24px;
    }

    .body ul li {
      margin-bottom: 10px;
    }

    .cta {
      text-align: center;
      margin-top: 20px;
    }

    .cta a {
      background-color: #1e40af;
      color: white;
      text-decoration: none;
      padding: 14px 28px;
      font-weight: bold;
      border-radius: 6px;
      display: inline-block;
    }

    .footer {
      padding: 20px;
      background-color: #f1f5f9;
      font-size: 12px;
      text-align: center;
      color: #6b7280;
    }

    .footer a {
      color: #2563eb;
      margin: 0 6px;
      text-decoration: none;
    }

    @media (prefers-color-scheme: dark) {
      body {
        background-color: #111827;
        color: #f3f4f6;
      }

      .container {
        background-color: #1f2937;
      }

      .header {
        background: #1e3a8a;
      }

      .footer {
        background-color: #111827;
        color: #9ca3af;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <a href="https://talentxcel.in" class="logo">Talent<span>Xcel</span></a>
      <h2 style="margin: 10px 0;">Complete Your Profile</h2>
      <div class="subheader">Unlock better job opportunities</div>
    </div>

    <div class="body">
      <p>Hi {{candidate_name}},</p>
      <p>Your profile is almost ready! Complete it now to get better job matches and stand out to employers.</p>

      <p><strong>Why complete your profile?</strong></p>
      <ul>
        <li>✅ Get 3x more job matches</li>
        <li>✅ Increase visibility to recruiters</li>
        <li>✅ Access exclusive opportunities</li>
        <li>✅ Show your professional skills</li>
      </ul>

      <div class="cta">
        <a href="https://talentxcel.in">✨ Complete My Profile</a>
      </div>

      <p style="font-size: 13px; color: #6b7280; text-align: center; margin-top: 40px;">
        This email was sent automatically by TalentXcel. Please do not reply.
      </p>
    </div>

    <div class="footer">
      © 2025 TalentXcel Services | <a href="https://talentxcel.in">talentxcel.in</a><br>
      <div style="margin-top: 10px;">
        <a href="https://talentxcel.in/network">Network</a>
        <a href="https://talentxcel.in/jobs">Jobs</a>
        <a href="https://talentxcel.in/employer">Employer</a>
        <a href="https://talentxcel.in/companies">Companies</a>
        <a href="https://talentxcel.in/resume">Resume Builder</a>
        <a href="https://talentxcel.in/tools">Tools</a>
        <a href="https://talentxcel.in/services">Services</a>
        <a href="https://talentxcel.in/learning">Learning</a>
        <a href="https://talentxcel.in/colleges">Colleges</a>
        <a href="https://talentxcel.in/career-map">Career Map</a>
      </div>
    </div>
  </div>
</body>
</html>',
  updated_at = now()
WHERE trigger_type = 'profile_incomplete_nudge';

-- Add welcome email template with professional design
INSERT INTO email_automation_settings (trigger_type, template_name, subject_template, html_template, is_enabled, delay_minutes, conditions)
VALUES (
  'welcome',
  'welcome_professional',
  'Welcome to TalentXcel - Your Career Journey Starts Here! 🎉',
  '<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Welcome to TalentXcel</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f3f4f6;
      font-family: ''Segoe UI'', ''Helvetica Neue'', sans-serif;
      color: #1a1a1a;
    }

    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 10px rgba(0,0,0,0.05);
    }

    .header {
      background: linear-gradient(to right, #1e3a8a, #2563eb);
      padding: 24px;
      text-align: center;
      color: #ffffff;
    }

    .logo {
      font-size: 24px;
      font-weight: bold;
      text-decoration: none;
      display: block;
      color: #ffffff;
    }

    .logo span {
      color: #facc15;
    }

    .body {
      padding: 32px 24px;
    }

    .body p {
      font-size: 15px;
      line-height: 1.6;
      margin-bottom: 16px;
    }

    .body ul {
      padding-left: 20px;
      margin-bottom: 24px;
    }

    .body ul li {
      margin-bottom: 10px;
    }

    .cta {
      text-align: center;
      margin-top: 20px;
    }

    .cta a {
      background-color: #1e40af;
      color: white;
      text-decoration: none;
      padding: 14px 28px;
      font-weight: bold;
      border-radius: 6px;
      display: inline-block;
    }

    .footer {
      padding: 20px;
      background-color: #f1f5f9;
      font-size: 12px;
      text-align: center;
      color: #6b7280;
    }

    .footer a {
      color: #2563eb;
      margin: 0 6px;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <a href="https://talentxcel.in" class="logo">Talent<span>Xcel</span></a>
      <h2 style="margin: 10px 0;">Welcome to Your Career Journey!</h2>
    </div>

    <div class="body">
      <p>Hi {{name}},</p>
      <p>Welcome to TalentXcel! We''re thrilled to have you join our community of ambitious professionals.</p>

      <p><strong>Get started with these features:</strong></p>
      <ul>
        <li>🚀 Complete your profile to get noticed</li>
        <li>💼 Browse thousands of job opportunities</li>
        <li>🤝 Connect with industry professionals</li>
        <li>📄 Use our AI-powered resume builder</li>
      </ul>

      <div class="cta">
        <a href="https://talentxcel.in/profile">Complete Your Profile Now</a>
      </div>

      <p style="font-size: 13px; color: #6b7280; text-align: center; margin-top: 40px;">
        Need help? Reply to this email and our team will assist you.
      </p>
    </div>

    <div class="footer">
      © 2025 TalentXcel Services | <a href="https://talentxcel.in">talentxcel.in</a><br>
      <div style="margin-top: 10px;">
        <a href="https://talentxcel.in/network">Network</a>
        <a href="https://talentxcel.in/jobs">Jobs</a>
        <a href="https://talentxcel.in/employer">Employer</a>
        <a href="https://talentxcel.in/companies">Companies</a>
        <a href="https://talentxcel.in/resume">Resume Builder</a>
        <a href="https://talentxcel.in/tools">Tools</a>
        <a href="https://talentxcel.in/services">Services</a>
        <a href="https://talentxcel.in/learning">Learning</a>
        <a href="https://talentxcel.in/colleges">Colleges</a>
        <a href="https://talentxcel.in/career-map">Career Map</a>
      </div>
    </div>
  </div>
</body>
</html>',
  true,
  0,
  '{}'::jsonb
) ON CONFLICT (trigger_type) DO UPDATE SET
  subject_template = EXCLUDED.subject_template,
  html_template = EXCLUDED.html_template,
  updated_at = now();

-- Clear old failed emails (older than 24 hours)
DELETE FROM email_automation_queue 
WHERE status IN ('failed', 'pending') 
AND created_at < NOW() - INTERVAL '24 hours';

-- Reset pending emails to restart processing
UPDATE email_automation_queue 
SET attempts = 0, error_message = NULL, updated_at = now()
WHERE status = 'pending';