-- Create user_credits table for TXC balance system
CREATE TABLE IF NOT EXISTS public.user_credits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0,
  total_earned INTEGER NOT NULL DEFAULT 0,
  total_spent INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user_credits
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

-- Create policies for user_credits
CREATE POLICY "Users can view their own credits" 
ON public.user_credits 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own credits" 
ON public.user_credits 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert credits" 
ON public.user_credits 
FOR INSERT 
WITH CHECK (true);

-- Create unique index
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_credits_user_id ON public.user_credits(user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_user_credits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_user_credits_updated_at
BEFORE UPDATE ON public.user_credits
FOR EACH ROW
EXECUTE FUNCTION public.update_user_credits_updated_at();

-- Fix UUID comparison issue in job redirect logic
CREATE OR REPLACE FUNCTION public.find_job_by_partial_id(partial_id text)
RETURNS TABLE(id uuid, title text, seo_slug text, company_name text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT j.id, j.title, j.seo_slug, j.company_name
  FROM public.jobs j
  WHERE j.id::text ILIKE partial_id || '%'
  AND j.is_active = true
  LIMIT 1;
END;
$$;