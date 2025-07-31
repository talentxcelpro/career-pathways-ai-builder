-- Job Alerts & Notifications System
CREATE TABLE public.job_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  alert_name TEXT NOT NULL,
  keywords TEXT[],
  locations TEXT[],
  employment_types TEXT[],
  experience_levels TEXT[],
  salary_min INTEGER,
  salary_max INTEGER,
  companies TEXT[],
  is_active BOOLEAN NOT NULL DEFAULT true,
  frequency TEXT NOT NULL DEFAULT 'daily' CHECK (frequency IN ('immediate', 'daily', 'weekly')),
  last_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Job Alert Notifications
CREATE TABLE public.job_alert_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_id UUID NOT NULL REFERENCES public.job_alerts(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  notification_type TEXT NOT NULL DEFAULT 'email' CHECK (notification_type IN ('email', 'sms', 'push')),
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE
);

-- Job Applications Tracking
CREATE TABLE public.job_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  applicant_name TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  applicant_phone TEXT,
  resume_url TEXT,
  cover_letter TEXT,
  application_status TEXT NOT NULL DEFAULT 'submitted' CHECK (application_status IN ('submitted', 'reviewed', 'shortlisted', 'interviewed', 'hired', 'rejected')),
  applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  interview_scheduled_at TIMESTAMP WITH TIME ZONE,
  external_application_url TEXT
);

-- Job Analytics
CREATE TABLE public.job_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  views_count INTEGER NOT NULL DEFAULT 0,
  unique_views_count INTEGER NOT NULL DEFAULT 0,
  clicks_count INTEGER NOT NULL DEFAULT 0,
  applications_count INTEGER NOT NULL DEFAULT 0,
  saves_count INTEGER NOT NULL DEFAULT 0,
  shares_count INTEGER NOT NULL DEFAULT 0,
  avg_time_on_page INTEGER DEFAULT 0,
  bounce_rate DECIMAL(5,2) DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(job_id, date)
);

-- Company Analytics
CREATE TABLE public.company_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  profile_views INTEGER NOT NULL DEFAULT 0,
  job_views INTEGER NOT NULL DEFAULT 0,
  applications_received INTEGER NOT NULL DEFAULT 0,
  follower_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, date)
);

-- Job Saves/Bookmarks
CREATE TABLE public.job_saves (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  saved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  UNIQUE(job_id, user_id)
);

-- Company Follows
CREATE TABLE public.company_follows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  followed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, user_id)
);

-- Job Referrals
CREATE TABLE public.job_referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  referrer_user_id UUID NOT NULL,
  referred_user_id UUID,
  referred_email TEXT,
  referral_code TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'applied', 'hired')),
  reward_amount DECIMAL(10,2) DEFAULT 0,
  reward_paid BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User Job Preferences (enhanced)
CREATE TABLE public.user_job_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  preferred_job_titles TEXT[],
  preferred_companies TEXT[],
  preferred_locations TEXT[],
  preferred_employment_types TEXT[],
  preferred_experience_levels TEXT[],
  preferred_salary_min INTEGER,
  preferred_salary_max INTEGER,
  preferred_industries TEXT[],
  skills TEXT[],
  availability TEXT DEFAULT 'immediately',
  remote_preference TEXT DEFAULT 'no_preference' CHECK (remote_preference IN ('remote_only', 'hybrid', 'onsite', 'no_preference')),
  notification_frequency TEXT DEFAULT 'daily' CHECK (notification_frequency IN ('immediate', 'daily', 'weekly')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.job_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_alert_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_job_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Job Alerts
CREATE POLICY "Users can manage their own job alerts" ON public.job_alerts
FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for Job Alert Notifications
CREATE POLICY "Users can view their own alert notifications" ON public.job_alert_notifications
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert alert notifications" ON public.job_alert_notifications
FOR INSERT WITH CHECK (true);

-- RLS Policies for Job Applications
CREATE POLICY "Users can view their own applications" ON public.job_applications
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create applications" ON public.job_applications
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Employers can view applications for their jobs" ON public.job_applications
FOR SELECT USING (
  job_id IN (
    SELECT j.id FROM jobs j 
    JOIN company_team_members ctm ON j.company_id = ctm.company_id 
    WHERE ctm.user_id = auth.uid() AND ctm.is_active = true
  )
);

CREATE POLICY "Employers can update applications for their jobs" ON public.job_applications
FOR UPDATE USING (
  job_id IN (
    SELECT j.id FROM jobs j 
    JOIN company_team_members ctm ON j.company_id = ctm.company_id 
    WHERE ctm.user_id = auth.uid() AND ctm.is_active = true
  )
);

-- RLS Policies for Job Analytics
CREATE POLICY "Employers can view analytics for their jobs" ON public.job_analytics
FOR SELECT USING (
  job_id IN (
    SELECT j.id FROM jobs j 
    JOIN company_team_members ctm ON j.company_id = ctm.company_id 
    WHERE ctm.user_id = auth.uid() AND ctm.is_active = true
  )
);

CREATE POLICY "System can manage job analytics" ON public.job_analytics
FOR ALL USING (true);

-- RLS Policies for Company Analytics
CREATE POLICY "Team members can view company analytics" ON public.company_analytics
FOR SELECT USING (
  company_id IN (
    SELECT company_id FROM company_team_members 
    WHERE user_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "System can manage company analytics" ON public.company_analytics
FOR ALL USING (true);

-- RLS Policies for Job Saves
CREATE POLICY "Users can manage their own job saves" ON public.job_saves
FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for Company Follows
CREATE POLICY "Users can manage their own company follows" ON public.company_follows
FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for Job Referrals
CREATE POLICY "Users can view their own referrals" ON public.job_referrals
FOR SELECT USING (auth.uid() = referrer_user_id OR auth.uid() = referred_user_id);

CREATE POLICY "Users can create referrals" ON public.job_referrals
FOR INSERT WITH CHECK (auth.uid() = referrer_user_id);

-- RLS Policies for User Job Preferences
CREATE POLICY "Users can manage their own job preferences" ON public.user_job_preferences
FOR ALL USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_job_alerts_user_id ON public.job_alerts(user_id);
CREATE INDEX idx_job_alerts_active ON public.job_alerts(is_active) WHERE is_active = true;
CREATE INDEX idx_job_alert_notifications_user_id ON public.job_alert_notifications(user_id);
CREATE INDEX idx_job_alert_notifications_sent_at ON public.job_alert_notifications(sent_at);
CREATE INDEX idx_job_applications_job_id ON public.job_applications(job_id);
CREATE INDEX idx_job_applications_user_id ON public.job_applications(user_id);
CREATE INDEX idx_job_applications_status ON public.job_applications(application_status);
CREATE INDEX idx_job_analytics_job_id ON public.job_analytics(job_id);
CREATE INDEX idx_job_analytics_date ON public.job_analytics(date);
CREATE INDEX idx_company_analytics_company_id ON public.company_analytics(company_id);
CREATE INDEX idx_company_analytics_date ON public.company_analytics(date);
CREATE INDEX idx_job_saves_user_id ON public.job_saves(user_id);
CREATE INDEX idx_job_saves_job_id ON public.job_saves(job_id);
CREATE INDEX idx_company_follows_user_id ON public.company_follows(user_id);
CREATE INDEX idx_company_follows_company_id ON public.company_follows(company_id);
CREATE INDEX idx_job_referrals_referrer ON public.job_referrals(referrer_user_id);
CREATE INDEX idx_job_referrals_code ON public.job_referrals(referral_code);

-- Create trigger to update updated_at columns
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_job_alerts_updated_at
  BEFORE UPDATE ON public.job_alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_job_applications_updated_at
  BEFORE UPDATE ON public.job_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_job_referrals_updated_at
  BEFORE UPDATE ON public.job_referrals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_job_preferences_updated_at
  BEFORE UPDATE ON public.user_job_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();