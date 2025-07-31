-- Create comprehensive view for all CVs (regular + scraped applications)
CREATE OR REPLACE VIEW public.employer_cv_database AS
SELECT DISTINCT
  p.id as profile_id,
  p.full_name,
  p.email,
  p.phone,
  p.title as current_title,
  p.current_company,
  p.location,
  p.linkedin_url,
  p.profile_picture_url,
  p.resume_url,
  p.skills,
  p.experience_years,
  ja.id as application_id,
  ja.job_id,
  j.title as applied_job_title,
  j.company_name as applied_company,
  j.external_url,
  ja.applied_at,
  ja.status as application_status
FROM profiles p
INNER JOIN job_applications ja ON p.id = ja.user_id
INNER JOIN jobs j ON ja.job_id = j.id
WHERE p.is_profile_public = true
ORDER BY ja.applied_at DESC;

-- Create outreach campaigns table
CREATE TABLE public.outreach_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_name text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'sending', 'sent', 'failed')),
  recipient_count integer DEFAULT 0,
  sent_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  sent_at timestamp with time zone,
  updated_at timestamp with time zone DEFAULT now()
);

-- Create outreach recipients table
CREATE TABLE public.outreach_recipients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES outreach_campaigns(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  email text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'bounced')),
  sent_at timestamp with time zone,
  opened_at timestamp with time zone,
  clicked_at timestamp with time zone,
  error_message text,
  created_at timestamp with time zone DEFAULT now()
);

-- Create outreach usage tracking for free/paid limits
CREATE TABLE public.outreach_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  month_year text NOT NULL, -- Format: 'YYYY-MM'
  emails_sent integer DEFAULT 0,
  is_premium boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(employer_id, month_year)
);

-- Enable RLS
ALTER TABLE outreach_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for outreach campaigns
CREATE POLICY "Employers can manage their own campaigns"
ON outreach_campaigns
FOR ALL
USING (employer_id = auth.uid())
WITH CHECK (employer_id = auth.uid());

-- RLS Policies for outreach recipients
CREATE POLICY "Employers can manage their campaign recipients"
ON outreach_recipients
FOR ALL
USING (
  campaign_id IN (
    SELECT id FROM outreach_campaigns WHERE employer_id = auth.uid()
  )
);

-- RLS Policies for outreach usage
CREATE POLICY "Employers can view their usage"
ON outreach_usage
FOR ALL
USING (employer_id = auth.uid())
WITH CHECK (employer_id = auth.uid());

-- RLS Policy for CV database view access (employers only)
CREATE POLICY "Employers can view CV database"
ON profiles
FOR SELECT
USING (
  is_profile_public = true AND
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('employer', 'admin', 'super_admin')
    AND ur.is_active = true
  )
);

-- Function to check outreach limits
CREATE OR REPLACE FUNCTION public.check_outreach_limit(employer_uuid uuid, recipient_count integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_month text;
  current_usage integer;
  is_premium boolean;
  monthly_limit integer;
BEGIN
  current_month := to_char(now(), 'YYYY-MM');
  
  -- Get current usage and premium status
  SELECT COALESCE(emails_sent, 0), COALESCE(ou.is_premium, false)
  INTO current_usage, is_premium
  FROM outreach_usage ou
  WHERE ou.employer_id = employer_uuid AND ou.month_year = current_month;
  
  -- Set limits: Free = 50/month, Premium = unlimited
  IF is_premium THEN
    monthly_limit := 999999; -- Unlimited for premium
  ELSE
    monthly_limit := 50; -- Free tier limit
  END IF;
  
  -- Check if adding recipient_count would exceed limit
  RETURN (current_usage + recipient_count) <= monthly_limit;
END;
$$;

-- Function to track outreach usage
CREATE OR REPLACE FUNCTION public.track_outreach_usage(employer_uuid uuid, email_count integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_month text;
BEGIN
  current_month := to_char(now(), 'YYYY-MM');
  
  INSERT INTO outreach_usage (employer_id, month_year, emails_sent)
  VALUES (employer_uuid, current_month, email_count)
  ON CONFLICT (employer_id, month_year)
  DO UPDATE SET 
    emails_sent = outreach_usage.emails_sent + email_count,
    updated_at = now();
END;
$$;

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_outreach_campaigns_updated_at
  BEFORE UPDATE ON outreach_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_outreach_usage_updated_at
  BEFORE UPDATE ON outreach_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();