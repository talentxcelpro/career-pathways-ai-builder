
-- Create storage bucket for profile assets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('profile-assets', 'profile-assets', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']);

-- Create RLS policies for profile assets bucket
CREATE POLICY "Users can upload their own profile assets" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'profile-assets' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Anyone can view profile assets" ON storage.objects
FOR SELECT USING (bucket_id = 'profile-assets');

CREATE POLICY "Users can update their own profile assets" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'profile-assets' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own profile assets" ON storage.objects
FOR DELETE USING (
  bucket_id = 'profile-assets' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Add new columns to profiles table for enhanced features
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS profile_visibility TEXT DEFAULT 'public' CHECK (profile_visibility IN ('public', 'private', 'connections_only')),
ADD COLUMN IF NOT EXISTS allow_profile_sharing BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS custom_profile_url TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS profile_views_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_profile_view TIMESTAMP WITH TIME ZONE;

-- Create portfolio items table
CREATE TABLE IF NOT EXISTS public.portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'project' CHECK (type IN ('project', 'certification', 'award', 'publication')),
  url TEXT,
  image_url TEXT,
  tags TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on portfolio items
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for portfolio items
CREATE POLICY "Users can view portfolio items based on profile visibility" ON public.portfolio_items
FOR SELECT USING (
  user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = portfolio_items.user_id 
    AND (profile_visibility = 'public' OR 
         (profile_visibility = 'connections_only' AND 
          EXISTS (SELECT 1 FROM public.connections 
                  WHERE (requester_id = auth.uid() AND recipient_id = portfolio_items.user_id AND status = 'accepted') OR
                        (recipient_id = auth.uid() AND requester_id = portfolio_items.user_id AND status = 'accepted'))))
  )
);

CREATE POLICY "Users can manage their own portfolio items" ON public.portfolio_items
FOR ALL USING (auth.uid() = user_id);

-- Create profile views tracking table
CREATE TABLE IF NOT EXISTS public.profile_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  viewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ip_address INET,
  user_agent TEXT
);

-- Enable RLS on profile views
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profile views
CREATE POLICY "Users can view their own profile analytics" ON public.profile_views
FOR SELECT USING (profile_id IN (SELECT id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Anyone can log profile views" ON public.profile_views
FOR INSERT WITH CHECK (true);

-- Create function to increment profile views
CREATE OR REPLACE FUNCTION public.increment_profile_views(profile_user_id UUID, viewer_ip INET DEFAULT NULL, viewer_agent TEXT DEFAULT NULL)
RETURNS VOID
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_portfolio_items_user_id ON public.portfolio_items(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_featured ON public.portfolio_items(user_id, is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_profile_views_profile_id ON public.profile_views(profile_id);
CREATE INDEX IF NOT EXISTS idx_profiles_custom_url ON public.profiles(custom_profile_url) WHERE custom_profile_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_visibility ON public.profiles(profile_visibility);
