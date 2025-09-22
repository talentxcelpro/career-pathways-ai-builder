-- Clean up corrupted email queue entries first  
DELETE FROM email_automation_queue 
WHERE trigger_type LIKE '<!DOCTYPE%' OR trigger_type LIKE '<html%' OR LENGTH(trigger_type) > 100;

-- Create comprehensive email automation triggers for TalentXcel Social Network
-- Insert all the missing email automation triggers for a complete professional social network

-- **1. SOCIAL NETWORK & FEED AUTOMATION**
INSERT INTO public.email_automation_triggers (trigger_key, trigger_name, trigger_category, template_key, conditions, frequency_limit, priority) VALUES 
('feed_digest_daily', 'Daily Feed Digest', 'social_engagement', 'job_alert', '{"posts_missed": {"gt": 3}}', 'daily', 8),
('post_low_engagement', 'Post Engagement Boost Tips', 'social_engagement', 'profile_reminder', '{"post_likes": {"lt": 5}, "hours_since_post": {"gt": 24}}', 'weekly', 6),
('trending_content_alert', 'Trending in Your Industry', 'social_engagement', 'job_alert', '{"trending_posts": {"gt": 0}}', 'daily', 7),
('connection_post_alert', 'Your Connection Posted Something', 'social_engagement', 'job_alert', '{"connection_new_post": true}', 'daily', 6),

-- **2. GAMIFICATION & TXC TOKEN SYSTEM**
('txc_earned', 'TXC Tokens Earned!', 'gamification', 'welcome_user', '{"tokens_earned": {"gt": 0}}', 'daily', 9),
('leaderboard_weekly', 'Weekly Leaderboard Update', 'gamification', 'job_alert', '{"leaderboard_position": {"lte": 10}}', 'weekly', 7),
('milestone_achievement', 'New Milestone Unlocked!', 'gamification', 'welcome_user', '{"milestone_reached": true}', 'none', 9),
('referral_reminder', 'Invite Friends & Earn TXC', 'gamification', 'profile_reminder', '{"referrals_sent": {"lt": 3}}', 'weekly', 6),
('streak_broken', 'Get Back Your Streak!', 'gamification', 'profile_reminder', '{"activity_streak": 0}', 'none', 8),

-- **3. NETWORKING & CONNECTIONS**
('connection_suggestion', 'AI Recommends New Connections', 'networking', 'job_alert', '{"suggested_connections": {"gt": 0}}', 'weekly', 7),
('connection_milestone', 'Connection Milestone Reached', 'networking', 'welcome_user', '{"total_connections": {"in": [50, 100, 250, 500, 1000]}}', 'none', 8),
('message_nudge', 'Unread Messages Waiting', 'networking', 'profile_reminder', '{"unread_messages": {"gt": 0}}', 'daily', 7),
('network_growth', 'Your Network is Growing!', 'networking', 'welcome_user', '{"weekly_connections": {"gt": 5}}', 'weekly', 6),
('mutual_connection', 'Mutual Connection Opportunity', 'networking', 'job_alert', '{"mutual_connections": {"gt": 0}}', 'weekly', 7),

-- **4. DISCOVERY & AI FEATURES**
('ai_career_insight', 'AI Career Insights Ready', 'ai_features', 'job_alert', '{"ai_insights_generated": true}', 'weekly', 8),
('skill_recommendation', 'AI Suggests Skills to Learn', 'ai_features', 'profile_reminder', '{"skill_gaps_identified": {"gt": 0}}', 'weekly', 7),
('ai_connect_suggestion', 'AI Found Perfect Mentors', 'ai_features', 'job_alert', '{"ai_mentor_matches": {"gt": 0}}', 'weekly', 8),
('profile_optimization', 'AI Profile Optimization Tips', 'ai_features', 'profile_reminder', '{"profile_score": {"lt": 80}}', 'weekly', 7),

-- **5. ANALYTICS & PERFORMANCE**
('weekly_stats', 'Your Weekly Performance Report', 'analytics', 'job_alert', '{"week_completed": true}', 'weekly', 7),
('profile_views_surge', 'Your Profile Views Increased!', 'analytics', 'welcome_user', '{"profile_views_increase": {"gt": 50}}', 'weekly', 8),
('engagement_report', 'Monthly Engagement Report', 'analytics', 'job_alert', '{"month_completed": true}', 'monthly', 6),
('skill_verification_due', 'Verify Your Skills for Better Visibility', 'analytics', 'profile_reminder', '{"unverified_skills": {"gt": 3}}', 'weekly', 7),

-- **6. LEARNING & COURSES**
('course_recommendation', 'Courses to Boost Your Career', 'learning', 'job_alert', '{"recommended_courses": {"gt": 0}}', 'weekly', 7),
('course_completion_nudge', 'Complete Your Course & Earn TXC', 'learning', 'profile_reminder', '{"course_progress": {"between": [10, 90]}}', 'weekly', 6),
('skill_achievement', 'New Skill Verified!', 'learning', 'welcome_user', '{"skill_verified": true}', 'none', 8),
('learning_path_suggestion', 'AI Curated Learning Path', 'learning', 'job_alert', '{"learning_path_available": true}', 'weekly', 7),

-- **7. JOBS & CAREER**
('premium_job_alert', 'Exclusive Premium Job Matches', 'jobs', 'job_alert', '{"premium_jobs": {"gt": 0}}', 'daily', 9),
('application_followup', 'Your Application Status Update', 'jobs', 'welcome_user', '{"application_viewed": true}', 'none', 8),
('recruiter_interest', 'Recruiters Viewing Your Profile', 'jobs', 'job_alert', '{"recruiter_views": {"gt": 0}}', 'weekly', 9),
('career_map_update', 'Your Career Roadmap Updated', 'jobs', 'job_alert', '{"career_progress": {"gt": 0}}', 'weekly', 7),
('salary_insights', 'Industry Salary Insights', 'jobs', 'job_alert', '{"salary_data_available": true}', 'monthly', 6),

-- **8. PREMIUM & UPSELL**
('premium_trial_offer', 'Try Premium Features Free', 'premium', 'job_alert', '{"eligible_for_trial": true}', 'monthly', 8),
('feature_limit_reached', 'Upgrade to Continue', 'premium', 'profile_reminder', '{"feature_limit_hit": true}', 'weekly', 7),
('premium_benefits', 'See What Premium Users Get', 'premium', 'job_alert', '{"premium_showcase": true}', 'weekly', 6),
('exclusive_access', 'Premium-Only Event Invitation', 'premium', 'welcome_user', '{"premium_event": true}', 'none', 9),

-- **9. EVENTS & NEWS**
('webinar_invitation', 'Join Our Career Webinar', 'events', 'welcome_user', '{"webinar_available": true}', 'weekly', 7),
('industry_news', 'Weekly Industry Newsletter', 'events', 'job_alert', '{"newsletter_ready": true}', 'weekly', 6),
('event_reminder', 'Event Starting Soon', 'events', 'welcome_user', '{"event_in_24h": true}', 'none', 9),
('networking_event', 'Local Networking Event', 'events', 'job_alert', '{"local_events": {"gt": 0}}', 'weekly', 7),

-- **10. SECURITY & ACCOUNT**
('password_reset_reminder', 'Update Your Password', 'security', 'security_alert', '{"password_age": {"gt": 90}}', 'monthly', 8),
('suspicious_activity', 'Unusual Account Activity', 'security', 'security_alert', '{"suspicious_login": true}', 'none', 10),
('data_export_ready', 'Your Data Export is Ready', 'security', 'welcome_user', '{"data_export_complete": true}', 'none', 8),
('privacy_update', 'Privacy Settings Update', 'security', 'security_alert', '{"privacy_changes": true}', 'none', 7),

-- **11. RE-ENGAGEMENT & WIN-BACK**
('inactive_user_return', 'We Miss You! Come Back', 'engagement', 'welcome_user', '{"days_inactive": {"gt": 7}}', 'weekly', 8),
('feature_announcement', 'New Features Just for You', 'engagement', 'job_alert', '{"new_features": true}', 'monthly', 7),
('success_story', 'Career Success Stories', 'engagement', 'welcome_user', '{"success_stories": true}', 'weekly', 6),
('community_highlight', 'You\'re Featured in Community', 'engagement', 'welcome_user', '{"featured_content": true}', 'none', 9),

-- **12. SEASONAL & SPECIAL**
('holiday_greetings', 'Holiday Career Tips', 'seasonal', 'welcome_user', '{"holiday_season": true}', 'none', 5),
('year_end_review', 'Your Year in Review', 'seasonal', 'job_alert', '{"year_end": true}', 'none', 8),
('birthday_wishes', 'Happy Birthday from TalentXcel', 'seasonal', 'welcome_user', '{"user_birthday": true}', 'none', 7),
('anniversary_celebration', 'Your TalentXcel Anniversary', 'seasonal', 'welcome_user', '{"account_anniversary": true}', 'none', 8)

ON CONFLICT (trigger_key) DO UPDATE SET
  trigger_name = EXCLUDED.trigger_name,
  trigger_category = EXCLUDED.trigger_category,
  conditions = EXCLUDED.conditions,
  frequency_limit = EXCLUDED.frequency_limit,
  priority = EXCLUDED.priority,
  updated_at = now();