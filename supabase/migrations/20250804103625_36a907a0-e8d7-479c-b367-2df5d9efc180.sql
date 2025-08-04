-- Create comprehensive email automation triggers
INSERT INTO public.email_automation_settings (trigger_type, is_enabled, template_name, subject_template, html_template, delay_minutes) VALUES
-- Network Module Triggers
('connection_accepted', true, 'connection_accepted', '✅ {{name}} accepted your connection request', '<h1>Connection Accepted!</h1><p>{{name}} has accepted your connection request. Start engaging with your new professional network!</p>', 0),
('message_notification', true, 'message_notification', '💬 New message from {{sender_name}}', '<h1>New Message</h1><p>{{sender_name}} sent you a message on TalentXcel. Reply to keep the conversation going!</p>', 0),
('mention_in_post', true, 'mention_notification', '📣 You were mentioned in a post', '<h1>You were mentioned!</h1><p>{{sender_name}} mentioned you in their post. Check it out to stay engaged!</p>', 0),

-- Jobs Module Triggers  
('job_status_update', true, 'job_status_update', '📢 Status update: {{job_title}}', '<h1>Application Status Update</h1><p>There''s an update on your application for {{job_title}} at {{company_name}}.</p>', 0),
('saved_job_reminder', true, 'saved_job_reminder', '🕒 Your saved job is closing soon!', '<h1>Don''t Miss Out!</h1><p>Your saved job "{{job_title}}" at {{company_name}} is closing soon. Apply now!</p>', 2880),
('daily_job_digest', true, 'daily_job_digest', '💼 New jobs for you: {{user_role}} in {{location}}', '<h1>Daily Job Digest</h1><p>Here are today''s personalized job recommendations based on your profile!</p>', 0),

-- Employer Module Triggers
('new_applicant_notification', true, 'new_applicant', '📥 New applicant for {{job_title}}', '<h1>New Application Received</h1><p>{{applicant_name}} applied for your {{job_title}} position. Review their profile!</p>', 0),
('employer_onboarding', true, 'employer_welcome', '🎉 Welcome to TalentXcel Employer', '<h1>Welcome to TalentXcel!</h1><p>Your employer account is ready. Start posting jobs and finding great candidates!</p>', 0),
('job_posting_expiry', true, 'job_expiry_reminder', '⏰ Your job post for {{job_title}} is expiring', '<h1>Job Post Expiring</h1><p>Your job posting expires in 3 days. Renew it to continue receiving applications!</p>', 0),

-- Companies Module Triggers
('company_follower', true, 'company_follower', '👀 {{user_name}} followed your company', '<h1>New Company Follower</h1><p>{{user_name}} is now following your company page. Build your employer brand!</p>', 0),
('company_review_alert', true, 'company_review', '📝 New review added for {{company_name}}', '<h1>New Company Review</h1><p>A new review has been added to your company page. Check it out!</p>', 0),
('employer_brand_score', true, 'brand_score_update', '📊 Your company brand score is ready', '<h1>Brand Score Update</h1><p>Your latest employer brand score and insights are available!</p>', 0),

-- Resume Builder Module Triggers
('resume_created', true, 'resume_created', '📄 Your resume is ready to use', '<h1>Resume Created Successfully!</h1><p>Your resume has been created and is ready to help you land your dream job!</p>', 0),
('resume_updated', true, 'resume_updated', '✏️ Resume updated successfully', '<h1>Resume Updated</h1><p>Your resume changes have been saved. Keep it updated for better opportunities!</p>', 0),
('incomplete_resume_reminder', true, 'resume_completion_reminder', '🛠️ Complete your resume to get more jobs', '<h1>Complete Your Resume</h1><p>Finish your resume to unlock better job matches and increase your visibility!</p>', 4320),
('resume_viewed_by_employer', true, 'resume_viewed', '👀 Your resume was viewed!', '<h1>Resume Activity</h1><p>An employer viewed your resume for {{job_title}}. Keep your profile active!</p>', 0),

-- Tools & Services Module Triggers  
('ai_career_map_ready', true, 'career_map_ready', '🧭 Your 5-Year Career Map is ready', '<h1>Career Map Generated</h1><p>Your personalized 5-year career roadmap is ready. Discover your path to success!</p>', 0),
('tool_access_alert', true, 'tool_unlocked', '✅ You''ve unlocked {{tool_name}}', '<h1>New Tool Unlocked!</h1><p>Congratulations! You now have access to {{tool_name}}. Start exploring!</p>', 0),
('new_service_alert', true, 'new_service', '🚀 New service added: {{service_name}}', '<h1>New Service Available</h1><p>We''ve added {{service_name}} to help accelerate your career growth!</p>', 0),
('resume_writing_feedback', true, 'resume_feedback', '✨ Your resume review is here', '<h1>Resume Feedback Ready</h1><p>Your professional resume review is complete. See how to improve your chances!</p>', 0),

-- Learning Module Triggers
('course_recommendation', true, 'course_recommendation', '📚 Recommended: {{course_title}}', '<h1>Course Recommendation</h1><p>Based on your career goals, we recommend {{course_title}} to boost your skills!</p>', 0),
('course_completion', true, 'course_completion', '🎓 Congrats on completing {{course_title}}!', '<h1>Course Completed!</h1><p>Amazing work completing {{course_title}}! Your new skills are valuable for your career.</p>', 0),
('learning_progress_reminder', true, 'learning_reminder', '⏳ Continue learning: {{course_title}}', '<h1>Continue Your Learning</h1><p>You''re {{progress}}% through {{course_title}}. Keep going to complete it!</p>', 0),
('certificate_ready', true, 'certificate_ready', '🏅 Your certificate for {{course_title}} is ready!', '<h1>Certificate Ready!</h1><p>Your certificate for {{course_title}} is ready for download. Add it to your profile!</p>', 0),

-- Colleges Module Triggers
('campus_job_opportunity', true, 'campus_job', '🎓 New job alert for your college', '<h1>Campus Job Opportunity</h1><p>A new job opportunity specifically for {{college_name}} students is available!</p>', 0),
('event_invite', true, 'event_invitation', '🗓️ You''re invited: {{event_name}}', '<h1>Event Invitation</h1><p>You''re invited to {{event_name}} at {{college_name}}. Don''t miss out!</p>', 0),
('college_resume_book', true, 'resume_book_notification', '📘 Your resume is in the {{college_name}} Resume Book', '<h1>Resume Book Featured</h1><p>Your resume is now featured in the {{college_name}} Resume Book for recruiters!</p>', 0),
('student_spotlight', true, 'student_spotlight', '🌟 You were featured in TalentXcel Student Spotlight', '<h1>Student Spotlight!</h1><p>Congratulations! You''ve been featured in our Student Spotlight section!</p>', 0),

-- Cross-Module Smart Triggers
('weekly_activity_summary', true, 'weekly_summary', '📈 Your weekly impact on TalentXcel', '<h1>Weekly Summary</h1><p>Here''s your activity summary and achievements from this week on TalentXcel!</p>', 0),
('milestone_achievement', true, 'milestone_achievement', '🏆 Congrats on hitting {{milestone}}!', '<h1>Milestone Achieved!</h1><p>Congratulations on reaching {{milestone}}! Keep up the great work!</p>', 0),
('inactive_user_nudge', true, 'reengagement', '👋 We miss you! Here''s what''s new on TalentXcel', '<h1>We Miss You!</h1><p>Come back and see the new opportunities and features waiting for you!</p>', 0),
('profile_incomplete_nudge', true, 'profile_incomplete', '✍️ Complete your TalentXcel profile to unlock all features', '<h1>Complete Your Profile</h1><p>Unlock premium features and better job matches by completing your profile!</p>', 0)

ON CONFLICT (trigger_type) DO UPDATE SET
  is_enabled = EXCLUDED.is_enabled,
  template_name = EXCLUDED.template_name,
  subject_template = EXCLUDED.subject_template,
  html_template = EXCLUDED.html_template,
  delay_minutes = EXCLUDED.delay_minutes,
  updated_at = now();