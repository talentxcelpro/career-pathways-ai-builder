-- Create missing tables only

-- Job Alert Notifications (missing)
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

-- Company Analytics (missing)
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

-- Job Saves/Bookmarks (missing)
CREATE TABLE public.job_saves (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  saved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  UNIQUE(job_id, user_id)
);

-- Job Referrals (missing)
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

-- Enable RLS on new tables
ALTER TABLE public.job_alert_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_referrals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Job Alert Notifications
CREATE POLICY "Users can view their own alert notifications" ON public.job_alert_notifications
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert alert notifications" ON public.job_alert_notifications
FOR INSERT WITH CHECK (true);

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

-- RLS Policies for Job Referrals
CREATE POLICY "Users can view their own referrals" ON public.job_referrals
FOR SELECT USING (auth.uid() = referrer_user_id OR auth.uid() = referred_user_id);

CREATE POLICY "Users can create referrals" ON public.job_referrals
FOR INSERT WITH CHECK (auth.uid() = referrer_user_id);

-- Create indexes for performance
CREATE INDEX idx_job_alert_notifications_user_id ON public.job_alert_notifications(user_id);
CREATE INDEX idx_job_alert_notifications_sent_at ON public.job_alert_notifications(sent_at);
CREATE INDEX idx_company_analytics_company_id ON public.company_analytics(company_id);
CREATE INDEX idx_company_analytics_date ON public.company_analytics(date);
CREATE INDEX idx_job_saves_user_id ON public.job_saves(user_id);
CREATE INDEX idx_job_saves_job_id ON public.job_saves(job_id);
CREATE INDEX idx_job_referrals_referrer ON public.job_referrals(referrer_user_id);
CREATE INDEX idx_job_referrals_code ON public.job_referrals(referral_code);

-- Create triggers for updated_at columns
CREATE TRIGGER update_job_referrals_updated_at
  BEFORE UPDATE ON public.job_referrals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();