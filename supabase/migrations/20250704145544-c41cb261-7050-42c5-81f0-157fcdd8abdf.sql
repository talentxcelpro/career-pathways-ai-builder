-- Add career intent tags to posts table
ALTER TABLE public.posts ADD COLUMN intent_tags TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Create index for better performance on intent tags
CREATE INDEX idx_posts_intent_tags ON public.posts USING GIN(intent_tags);

-- Add career goals and interests to profiles table
ALTER TABLE public.profiles ADD COLUMN career_goals TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE public.profiles ADD COLUMN career_interests TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE public.profiles ADD COLUMN career_stage TEXT DEFAULT 'early_career';

-- Create index for better performance on career matching
CREATE INDEX idx_profiles_career_goals ON public.profiles USING GIN(career_goals);
CREATE INDEX idx_profiles_career_interests ON public.profiles USING GIN(career_interests);