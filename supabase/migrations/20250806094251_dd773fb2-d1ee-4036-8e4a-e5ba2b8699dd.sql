-- Fix RLS policies for email_templates table
DROP POLICY IF EXISTS "Admins can manage templates" ON public.email_templates;
DROP POLICY IF EXISTS "Users can view templates" ON public.email_templates;

-- Create proper RLS policies for email templates
CREATE POLICY "Admins can manage email templates"
ON public.email_templates
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'admin') 
    AND is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'admin') 
    AND is_active = true
  )
);

CREATE POLICY "System can insert email templates"
ON public.email_templates
FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Anyone can view active email templates"
ON public.email_templates
FOR SELECT
TO authenticated
USING (is_active = true);

-- Also ensure the table has proper structure and some default templates
INSERT INTO public.email_templates (name, template_type, subject, content, is_active) VALUES
('base_template', 'base', '{{title}}', '<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>{{title}}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { margin: 0; padding: 0; background-color: #f3f4f6; font-family: ''Segoe UI'', ''Helvetica Neue'', sans-serif; color: #1a1a1a; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
    .header { background: linear-gradient(to right, #1e3a8a, #2563eb); padding: 24px; text-align: center; color: #ffffff; }
    .logo { font-size: 24px; font-weight: bold; text-decoration: none; display: block; color: #ffffff; }
    .logo span { color: #facc15; }
    .subheader { font-size: 14px; margin-top: 6px; color: #e0e7ff; }
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
      <h2 style="margin: 10px 0;">{{title}}</h2>
      <div class="subheader">{{subtitle}}</div>
    </div>
    <div class="body">
      <p>Hi {{candidate_name}},</p>
      <p>{{message}}</p>
      {{#if cta_url}}
      <div class="cta">
        <a href="{{cta_url}}">{{cta_text}}</a>
      </div>
      {{/if}}
      <p style="font-size: 13px; color: #6b7280; text-align: center; margin-top: 40px;">
        {{footer_note}}
      </p>
    </div>
    <div class="footer">
      © 2025 TalentXcel Services | <a href="https://talentxcel.in">talentxcel.in</a>
    </div>
  </div>
</body>
</html>', true),

('career_map_ready', 'notification', '🧭 Your 5-Year Career Map is Ready', '<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>{{title}}</title>
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
      <h2 style="margin: 10px 0;">🧭 Your 5-Year Career Map is Ready</h2>
      <div style="font-size: 14px; margin-top: 6px; color: #e0e7ff;">Explore your personalized roadmap</div>
    </div>
    <div class="body">
      <p>Hi {{candidate_name}},</p>
      <p>Based on your profile, we''ve mapped out a clear and achievable 5-year career growth plan. It''s time to unlock your future!</p>
      <div class="cta">
        <a href="https://talentxcel.in/career-map">View My Career Map</a>
      </div>
      <p style="font-size: 13px; color: #6b7280; text-align: center; margin-top: 40px;">
        This is an automated email from TalentXcel Career Guidance.
      </p>
    </div>
    <div class="footer">
      © 2025 TalentXcel Services | <a href="https://talentxcel.in">talentxcel.in</a>
    </div>
  </div>
</body>
</html>', true),

('resume_created', 'notification', '📄 Your Resume Is Ready!', '<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>{{title}}</title>
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
      <h2 style="margin: 10px 0;">📄 Your Resume Is Ready!</h2>
      <div style="font-size: 14px; margin-top: 6px; color: #e0e7ff;">Start applying to top jobs now</div>
    </div>
    <div class="body">
      <p>Hi {{candidate_name}},</p>
      <p>Congratulations! Your resume is ready and professionally structured. You can now start applying to curated job opportunities.</p>
      <div class="cta">
        <a href="https://talentxcel.in/resume">View Resume</a>
      </div>
      <p style="font-size: 13px; color: #6b7280; text-align: center; margin-top: 40px;">
        This email was auto-generated by TalentXcel Resume Builder.
      </p>
    </div>
    <div class="footer">
      © 2025 TalentXcel Services | <a href="https://talentxcel.in">talentxcel.in</a>
    </div>
  </div>
</body>
</html>', true)

ON CONFLICT (name) DO NOTHING;