-- Fix hashtag data without ON CONFLICT since there's no unique constraint
-- Update hashtags with realistic numbers using individual UPDATE statements
UPDATE public.trending_hashtags SET count = 150, date = CURRENT_DATE WHERE hashtag = 'ai';
UPDATE public.trending_hashtags SET count = 120, date = CURRENT_DATE WHERE hashtag = 'careergrowth';
UPDATE public.trending_hashtags SET count = 98, date = CURRENT_DATE WHERE hashtag = 'leadership';
UPDATE public.trending_hashtags SET count = 85, date = CURRENT_DATE WHERE hashtag = 'remotework';
UPDATE public.trending_hashtags SET count = 75, date = CURRENT_DATE WHERE hashtag = 'innovation';
UPDATE public.trending_hashtags SET count = 62, date = CURRENT_DATE WHERE hashtag = 'productivity';
UPDATE public.trending_hashtags SET count = 58, date = CURRENT_DATE WHERE hashtag = 'networking';
UPDATE public.trending_hashtags SET count = 45, date = CURRENT_DATE WHERE hashtag = 'technology';

-- Add more trending hashtags only if they don't exist
INSERT INTO public.trending_hashtags (hashtag, count, date) 
SELECT 'startup', 42, CURRENT_DATE WHERE NOT EXISTS (SELECT 1 FROM public.trending_hashtags WHERE hashtag = 'startup');

INSERT INTO public.trending_hashtags (hashtag, count, date) 
SELECT 'dataScience', 38, CURRENT_DATE WHERE NOT EXISTS (SELECT 1 FROM public.trending_hashtags WHERE hashtag = 'dataScience');

INSERT INTO public.trending_hashtags (hashtag, count, date) 
SELECT 'marketing', 35, CURRENT_DATE WHERE NOT EXISTS (SELECT 1 FROM public.trending_hashtags WHERE hashtag = 'marketing');

INSERT INTO public.trending_hashtags (hashtag, count, date) 
SELECT 'jobSearch', 32, CURRENT_DATE WHERE NOT EXISTS (SELECT 1 FROM public.trending_hashtags WHERE hashtag = 'jobSearch');

INSERT INTO public.trending_hashtags (hashtag, count, date) 
SELECT 'programming', 30, CURRENT_DATE WHERE NOT EXISTS (SELECT 1 FROM public.trending_hashtags WHERE hashtag = 'programming');

INSERT INTO public.trending_hashtags (hashtag, count, date) 
SELECT 'design', 28, CURRENT_DATE WHERE NOT EXISTS (SELECT 1 FROM public.trending_hashtags WHERE hashtag = 'design');

INSERT INTO public.trending_hashtags (hashtag, count, date) 
SELECT 'analytics', 25, CURRENT_DATE WHERE NOT EXISTS (SELECT 1 FROM public.trending_hashtags WHERE hashtag = 'analytics');