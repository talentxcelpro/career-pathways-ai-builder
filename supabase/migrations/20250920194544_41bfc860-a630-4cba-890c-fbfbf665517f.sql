-- Create public_passport_views table to track QR code scans and profile views
CREATE TABLE IF NOT EXISTS public.public_passport_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  passport_owner_id UUID NOT NULL,
  viewer_ip INET,
  viewer_user_agent TEXT,
  view_source TEXT DEFAULT 'qr_scan', -- 'qr_scan', 'direct_link', 'shared_link'
  referrer_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_passport_views_owner ON public.public_passport_views(passport_owner_id);
CREATE INDEX IF NOT EXISTS idx_passport_views_created_at ON public.public_passport_views(created_at);

-- Enable RLS on the new table
ALTER TABLE public.public_passport_views ENABLE ROW LEVEL SECURITY;

-- Create policies for public passport views
CREATE POLICY "Users can view their own passport analytics" 
ON public.public_passport_views 
FOR SELECT 
USING (passport_owner_id = auth.uid());

-- Allow anyone to create view records (for tracking QR scans)
CREATE POLICY "Anyone can create passport view records" 
ON public.public_passport_views 
FOR INSERT 
WITH CHECK (true);

-- Create function to track passport views
CREATE OR REPLACE FUNCTION public.track_passport_view(
  p_passport_owner_id UUID,
  p_view_source TEXT DEFAULT 'qr_scan',
  p_referrer_url TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  view_id UUID;
BEGIN
  INSERT INTO public.public_passport_views (
    passport_owner_id,
    viewer_ip,
    viewer_user_agent,
    view_source,
    referrer_url
  ) VALUES (
    p_passport_owner_id,
    inet_client_addr(),
    current_setting('request.headers', true)::json->>'user-agent',
    p_view_source,
    p_referrer_url
  ) RETURNING id INTO view_id;
  
  RETURN view_id;
END;
$$;

-- Add QR code tracking columns to career_passport table if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'career_passport' AND column_name = 'qr_code_url') THEN
    ALTER TABLE public.career_passport ADD COLUMN qr_code_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'career_passport' AND column_name = 'qr_code_scans_count') THEN
    ALTER TABLE public.career_passport ADD COLUMN qr_code_scans_count INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'career_passport' AND column_name = 'profile_views_count') THEN
    ALTER TABLE public.career_passport ADD COLUMN profile_views_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- Create function to increment QR scan count
CREATE OR REPLACE FUNCTION public.increment_qr_scan_count(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.career_passport 
  SET qr_code_scans_count = COALESCE(qr_code_scans_count, 0) + 1,
      updated_at = now()
  WHERE user_id = p_user_id;
END;
$$;

-- Create function to increment profile view count
CREATE OR REPLACE FUNCTION public.increment_profile_view_count(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.career_passport 
  SET profile_views_count = COALESCE(profile_views_count, 0) + 1,
      updated_at = now()
  WHERE user_id = p_user_id;
END;
$$;

-- Create view for public passport analytics
CREATE OR REPLACE VIEW public.passport_analytics AS
SELECT 
  cp.user_id,
  cp.qr_code_scans_count,
  cp.profile_views_count,
  COUNT(ppv.id) as total_tracked_views,
  COUNT(CASE WHEN ppv.view_source = 'qr_scan' THEN 1 END) as qr_tracked_scans,
  COUNT(CASE WHEN ppv.view_source = 'direct_link' THEN 1 END) as direct_link_views,
  COUNT(CASE WHEN ppv.view_source = 'shared_link' THEN 1 END) as shared_link_views,
  COUNT(CASE WHEN ppv.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as views_last_30_days,
  COUNT(CASE WHEN ppv.created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as views_last_7_days
FROM public.career_passport cp
LEFT JOIN public.public_passport_views ppv ON cp.user_id = ppv.passport_owner_id
GROUP BY cp.user_id, cp.qr_code_scans_count, cp.profile_views_count;

-- Create RLS policy for passport analytics view
CREATE POLICY "Users can view their own passport analytics" 
ON public.passport_analytics 
FOR SELECT 
USING (user_id = auth.uid());