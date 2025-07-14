-- Create job swipes table for tracking user swipe actions
CREATE TABLE IF NOT EXISTS public.job_swipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('like', 'pass', 'super_like')),
  match_score NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, job_id)
);

-- Enable RLS
ALTER TABLE public.job_swipes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own swipes" 
ON public.job_swipes 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_job_swipes_user_action ON public.job_swipes(user_id, action);
CREATE INDEX idx_job_swipes_job_id ON public.job_swipes(job_id);

-- Create job matches table for when both user and employer "like" each other
CREATE TABLE IF NOT EXISTS public.job_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL,
  employer_id UUID NOT NULL,
  match_score NUMERIC,
  user_swiped_at TIMESTAMP WITH TIME ZONE,
  employer_swiped_at TIMESTAMP WITH TIME ZONE,
  is_mutual BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, job_id)
);

-- Enable RLS
ALTER TABLE public.job_matches ENABLE ROW LEVEL SECURITY;

-- Create policies for job matches
CREATE POLICY "Users can view their own matches" 
ON public.job_matches 
FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() = employer_id);

CREATE POLICY "System can create matches" 
ON public.job_matches 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their matches" 
ON public.job_matches 
FOR UPDATE 
USING (auth.uid() = user_id OR auth.uid() = employer_id);

-- Create enhanced user preferences table
CREATE TABLE IF NOT EXISTS public.user_job_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  preferred_roles TEXT[],
  preferred_locations TEXT[],
  remote_work_preference TEXT CHECK (remote_work_preference IN ('required', 'preferred', 'no_preference', 'not_preferred')),
  salary_min NUMERIC,
  salary_max NUMERIC,
  preferred_company_sizes TEXT[],
  preferred_industries TEXT[],
  work_life_balance_importance INTEGER CHECK (work_life_balance_importance BETWEEN 1 AND 5),
  career_growth_importance INTEGER CHECK (career_growth_importance BETWEEN 1 AND 5),
  company_culture_importance INTEGER CHECK (company_culture_importance BETWEEN 1 AND 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_job_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own preferences" 
ON public.user_job_preferences 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_user_job_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_job_preferences_updated_at
  BEFORE UPDATE ON public.user_job_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_user_job_preferences_updated_at();