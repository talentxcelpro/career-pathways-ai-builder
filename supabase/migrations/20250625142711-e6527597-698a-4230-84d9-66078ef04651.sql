
-- Create post_likes table for handling likes functionality
CREATE TABLE public.post_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Create post_shares table for handling shares functionality  
CREATE TABLE public.post_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create storage bucket for post media
INSERT INTO storage.buckets (id, name, public) 
VALUES ('post-media', 'post-media', true);

-- Enable RLS on post_likes table
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

-- Create policies for post_likes
CREATE POLICY "Users can view all post likes" 
  ON public.post_likes 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create their own post likes" 
  ON public.post_likes 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own post likes" 
  ON public.post_likes 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Enable RLS on post_shares table
ALTER TABLE public.post_shares ENABLE ROW LEVEL SECURITY;

-- Create policies for post_shares
CREATE POLICY "Users can view all post shares" 
  ON public.post_shares 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create their own post shares" 
  ON public.post_shares 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create storage policies for post-media bucket
CREATE POLICY "Users can upload their own media" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (bucket_id = 'post-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view post media" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'post-media');

CREATE POLICY "Users can update their own media" 
  ON storage.objects 
  FOR UPDATE 
  USING (bucket_id = 'post-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own media" 
  ON storage.objects 
  FOR DELETE 
  USING (bucket_id = 'post-media' AND auth.uid()::text = (storage.foldername(name))[1]);
