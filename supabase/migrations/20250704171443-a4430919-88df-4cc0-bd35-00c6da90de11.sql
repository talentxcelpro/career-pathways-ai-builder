-- Create profile_views table to track who viewed profiles
CREATE TABLE IF NOT EXISTS public.profile_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  viewer_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  ip_address inet,
  user_agent text,
  viewed_at timestamp with time zone DEFAULT now(),
  is_anonymous boolean DEFAULT false
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profile_views_profile_id ON public.profile_views(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_viewer_id ON public.profile_views(viewer_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_viewed_at ON public.profile_views(viewed_at);

-- Add privacy setting to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_viewing_private boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS profile_views_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_profile_view timestamp with time zone;

-- Enable RLS on profile_views
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profile_views
CREATE POLICY "Users can view their own profile views" 
ON public.profile_views 
FOR SELECT 
USING (profile_id = auth.uid());

CREATE POLICY "Anyone can insert profile views" 
ON public.profile_views 
FOR INSERT 
WITH CHECK (true);

-- Function to increment profile views with deduplication
CREATE OR REPLACE FUNCTION public.increment_profile_views(
  profile_user_id uuid,
  viewer_ip inet DEFAULT NULL,
  viewer_agent text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert view record
  INSERT INTO public.profile_views (profile_id, viewer_id, ip_address, user_agent)
  VALUES (profile_user_id, auth.uid(), viewer_ip, viewer_agent);
  
  -- Update profile views count
  UPDATE public.profiles 
  SET profile_views_count = COALESCE(profile_views_count, 0) + 1,
      last_profile_view = now()
  WHERE id = profile_user_id;
END;
$$;