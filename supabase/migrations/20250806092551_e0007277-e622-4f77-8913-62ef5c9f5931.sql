-- Create email templates table
CREATE TABLE public.email_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_name text NOT NULL UNIQUE,
  template_type text NOT NULL DEFAULT 'notification',
  subject_template text NOT NULL,
  html_template text NOT NULL,
  variables jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage email templates"
ON public.email_templates
FOR ALL
USING (is_app_admin(auth.uid()));

CREATE POLICY "System can read active templates"
ON public.email_templates
FOR SELECT
USING (is_active = true);

-- Create trigger for updated_at
CREATE TRIGGER update_email_templates_updated_at
BEFORE UPDATE ON public.email_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert the main HTML template
INSERT INTO public.email_templates (template_name, template_type, subject_template, html_template, variables) VALUES 
('base_template', 'base', '{{subject}}', '<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>{{subject}}</title>
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
    .body ul { padding-left: 20px; margin-bottom: 24px; }
    .body ul li { margin-bottom: 10px; }
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
      {{#bullet_points}}
      <p><strong>Here''s what you can do:</strong></p>
      <ul>
        {{#each bullet_points}}
        <li>✅ {{this}}</li>
        {{/each}}
      </ul>
      {{/bullet_points}}
      {{#cta_url}}
      <div class="cta">
        <a href="{{cta_url}}">{{cta_text}}</a>
      </div>
      {{/cta_url}}
      <p style="font-size: 13px; color: #6b7280; text-align: center; margin-top: 40px;">
        {{footer_note}}
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
</html>', '[
  {"name": "candidate_name", "type": "string", "required": true},
  {"name": "title", "type": "string", "required": true},
  {"name": "subtitle", "type": "string", "required": true},
  {"name": "message", "type": "string", "required": true},
  {"name": "bullet_points", "type": "array", "required": false},
  {"name": "cta_url", "type": "string", "required": false},
  {"name": "cta_text", "type": "string", "required": false},
  {"name": "footer_note", "type": "string", "required": false}
]');

-- Insert the 14 pre-defined email templates
INSERT INTO public.email_templates (template_name, template_type, subject_template, html_template, variables) VALUES 
('career_map_ready', 'notification', '🧭 Your 5-Year Career Map is Ready', '{{base_template}}', '[
  {"name": "candidate_name", "type": "string", "required": true}
]'),
('resume_created', 'notification', '📄 Your Resume Is Ready!', '{{base_template}}', '[
  {"name": "candidate_name", "type": "string", "required": true}
]'),
('resume_updated', 'notification', '✨ Resume Updated Successfully', '{{base_template}}', '[
  {"name": "candidate_name", "type": "string", "required": true}
]'),
('job_recommendation', 'notification', '💼 Perfect Job Match Found!', '{{base_template}}', '[
  {"name": "candidate_name", "type": "string", "required": true},
  {"name": "job_title", "type": "string", "required": true},
  {"name": "company_name", "type": "string", "required": true},
  {"name": "location", "type": "string", "required": false}
]'),
('resume_viewed', 'notification', '👀 Your Resume Was Viewed!', '{{base_template}}', '[
  {"name": "candidate_name", "type": "string", "required": true},
  {"name": "viewer_company", "type": "string", "required": false}
]'),
('resume_feedback', 'notification', '✨ Your Resume Review Is Here', '{{base_template}}', '[
  {"name": "candidate_name", "type": "string", "required": true},
  {"name": "resume_score", "type": "number", "required": false},
  {"name": "feedback_summary", "type": "string", "required": false}
]'),
('application_confirmed', 'notification', '✅ Application Submitted Successfully', '{{base_template}}', '[
  {"name": "candidate_name", "type": "string", "required": true},
  {"name": "job_title", "type": "string", "required": true},
  {"name": "company_name", "type": "string", "required": true}
]'),
('interview_scheduled', 'notification', '🎉 Interview Scheduled!', '{{base_template}}', '[
  {"name": "candidate_name", "type": "string", "required": true},
  {"name": "job_title", "type": "string", "required": true},
  {"name": "company_name", "type": "string", "required": true},
  {"name": "interview_date", "type": "string", "required": true},
  {"name": "interview_time", "type": "string", "required": true},
  {"name": "meeting_link", "type": "string", "required": false}
]'),
('course_completion', 'notification', '🎓 Course Completed Successfully!', '{{base_template}}', '[
  {"name": "candidate_name", "type": "string", "required": true},
  {"name": "course_title", "type": "string", "required": true},
  {"name": "completion_date", "type": "string", "required": true}
]'),
('certificate_ready', 'notification', '🏆 Your Certificate is Ready!', '{{base_template}}', '[
  {"name": "candidate_name", "type": "string", "required": true},
  {"name": "course_title", "type": "string", "required": true}
]'),
('profile_completion_reminder', 'reminder', '⚡ Complete Your Profile to Get More Opportunities', '{{base_template}}', '[
  {"name": "candidate_name", "type": "string", "required": true},
  {"name": "profile_completion_percent", "type": "number", "required": true}
]'),
('saved_job_reminder', 'reminder', '⏰ Saved Job Expiring Soon!', '{{base_template}}', '[
  {"name": "candidate_name", "type": "string", "required": true},
  {"name": "job_title", "type": "string", "required": true},
  {"name": "company_name", "type": "string", "required": true},
  {"name": "job_expiry_date", "type": "string", "required": true}
]'),
('course_recommendation', 'recommendation', '📚 Perfect Course Recommendation for You', '{{base_template}}', '[
  {"name": "candidate_name", "type": "string", "required": true},
  {"name": "course_title", "type": "string", "required": true}
]'),
('weekly_activity_summary', 'summary', '📊 Your Weekly Activity Summary', '{{base_template}}', '[
  {"name": "candidate_name", "type": "string", "required": true},
  {"name": "connections_added", "type": "number", "required": false},
  {"name": "jobs_applied", "type": "number", "required": false},
  {"name": "profile_views", "type": "number", "required": false}
]');