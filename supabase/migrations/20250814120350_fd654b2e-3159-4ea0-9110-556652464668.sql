UPDATE email_templates 
SET html_template = '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Job Application - {{job_title}}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 32px 24px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; }
        .content { padding: 32px 24px; }
        .highlight-box { background-color: #f0f9ff; border: 1px solid #e0f2fe; border-radius: 8px; padding: 24px; margin: 24px 0; }
        .job-title { color: #1e40af; font-size: 20px; font-weight: 600; margin: 0 0 8px 0; }
        .company-name { color: #64748b; font-size: 16px; margin: 0; }
        .applicant-info { margin: 24px 0; }
        .applicant-name { color: #0f172a; font-size: 18px; font-weight: 600; margin: 0 0 8px 0; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; margin: 24px 0; }
        .cta-button:hover { opacity: 0.9; }
        .footer { background-color: #f8fafc; padding: 24px; text-align: center; color: #64748b; font-size: 14px; }
        .footer a { color: #3b82f6; text-decoration: none; }
        @media (max-width: 600px) { .container { width: 100% !important; } .content { padding: 24px 16px !important; } }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 New Job Application Received</h1>
        </div>
        
        <div class="content">
            <p style="color: #374151; font-size: 16px; margin: 0 0 24px 0;">
                Hi <strong>{{user_name}}</strong>,
            </p>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Great news! You have received a new job application that requires your attention.
            </p>
            
            <div class="highlight-box">
                <div class="job-title">{{job_title}}</div>
                <div class="company-name">{{company}}</div>
                
                <div class="applicant-info">
                    <div class="applicant-name">👤 {{applicant_name}}</div>
                    <p style="color: #64748b; font-size: 14px; margin: 8px 0 0 0;">
                        Applied for the position on {{current_date}}
                    </p>
                </div>
            </div>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 24px 0;">
                Review the candidate''s profile, resume, and application details to make an informed decision about moving forward with the hiring process.
            </p>
            
            <div style="text-align: center; margin: 32px 0;">
                <a href="{{application_link}}" class="cta-button">
                    📋 Review Application
                </a>
            </div>
            
            <div style="background-color: #fef3c7; border: 1px solid #fbbf24; border-radius: 6px; padding: 16px; margin: 24px 0;">
                <p style="color: #92400e; font-size: 14px; margin: 0; font-weight: 500;">
                    💡 <strong>Quick Tip:</strong> Respond to applications promptly to maintain a positive candidate experience and strengthen your employer brand.
                </p>
            </div>
        </div>
        
        <div class="footer">
            <p style="margin: 0 0 16px 0;">
                This email was sent by <strong>{{platform_name}}</strong> - India''s Premier Talent Platform
            </p>
            <p style="margin: 0;">
                Need help? Contact us at <a href="mailto:{{support_email}}">{{support_email}}</a>
            </p>
            <p style="margin: 16px 0 0 0; font-size: 12px; color: #9ca3af;">
                © {{current_year}} TalentXcel. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>'
WHERE name = 'Application Notification Template';