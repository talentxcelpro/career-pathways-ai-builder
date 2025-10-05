-- Step 1: Create the missing user_scores table
CREATE TABLE IF NOT EXISTS public.user_scores (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  career_readiness_score INTEGER DEFAULT 0,
  profile_completion_score INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_scores ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own scores" ON public.user_scores;
DROP POLICY IF EXISTS "Users can update their own scores" ON public.user_scores;
DROP POLICY IF EXISTS "System can insert scores" ON public.user_scores;

-- RLS policies for user_scores
CREATE POLICY "Users can view their own scores"
  ON public.user_scores FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own scores"
  ON public.user_scores FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert scores"
  ON public.user_scores FOR INSERT
  WITH CHECK (true);