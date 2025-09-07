-- Fix the trigger function first
DROP TRIGGER IF EXISTS update_trending_hashtags_updated_at_trigger ON public.trending_hashtags;
DROP FUNCTION IF EXISTS public.update_trending_hashtags_updated_at();

-- Create updated function without updated_at reference
CREATE OR REPLACE FUNCTION public.update_trending_hashtags_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  -- The trigger will just return NEW since we don't have updated_at column
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update hashtags with realistic numbers
UPDATE public.trending_hashtags SET count = 150, date = CURRENT_DATE WHERE hashtag = 'ai';
UPDATE public.trending_hashtags SET count = 120, date = CURRENT_DATE WHERE hashtag = 'careergrowth';
UPDATE public.trending_hashtags SET count = 98, date = CURRENT_DATE WHERE hashtag = 'leadership';
UPDATE public.trending_hashtags SET count = 85, date = CURRENT_DATE WHERE hashtag = 'remotework';
UPDATE public.trending_hashtags SET count = 75, date = CURRENT_DATE WHERE hashtag = 'innovation';
UPDATE public.trending_hashtags SET count = 62, date = CURRENT_DATE WHERE hashtag = 'productivity';
UPDATE public.trending_hashtags SET count = 58, date = CURRENT_DATE WHERE hashtag = 'networking';
UPDATE public.trending_hashtags SET count = 45, date = CURRENT_DATE WHERE hashtag = 'technology';

-- Add more trending hashtags
INSERT INTO public.trending_hashtags (hashtag, count, date) VALUES
('startup', 42, CURRENT_DATE),
('dataScience', 38, CURRENT_DATE),
('marketing', 35, CURRENT_DATE),
('jobSearch', 32, CURRENT_DATE),
('programming', 30, CURRENT_DATE),
('design', 28, CURRENT_DATE),
('analytics', 25, CURRENT_DATE)
ON CONFLICT (hashtag) DO UPDATE SET 
  count = EXCLUDED.count,
  date = EXCLUDED.date;