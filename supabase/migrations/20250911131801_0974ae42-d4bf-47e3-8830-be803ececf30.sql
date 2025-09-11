-- Create profile_views table for tracking profile visits
CREATE TABLE IF NOT EXISTS public.profile_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL,
  viewer_id UUID,
  view_type TEXT NOT NULL DEFAULT 'profile' CHECK (view_type IN ('profile', 'passport', 'network_card')),
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Profile views are readable by everyone" 
ON public.profile_views 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create profile views" 
ON public.profile_views 
FOR INSERT 
WITH CHECK (true);

-- Create index for performance
CREATE INDEX idx_profile_views_profile_id ON public.profile_views(profile_id);
CREATE INDEX idx_profile_views_viewer_id ON public.profile_views(viewer_id);
CREATE INDEX idx_profile_views_viewed_at ON public.profile_views(viewed_at);

-- Create posts table if it doesn't exist (for reshare functionality)
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  original_post_id UUID REFERENCES public.posts(id),
  post_type TEXT NOT NULL DEFAULT 'original' CHECK (post_type IN ('original', 'reshare')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for posts
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Create policies for posts
CREATE POLICY "Posts are readable by everyone" 
ON public.posts 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own posts" 
ON public.posts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" 
ON public.posts 
FOR UPDATE 
USING (auth.uid() = user_id);