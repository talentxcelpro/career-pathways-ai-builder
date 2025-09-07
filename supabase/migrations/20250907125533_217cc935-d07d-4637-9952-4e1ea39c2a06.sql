-- Create trending_hashtags table
CREATE TABLE IF NOT EXISTS public.trending_hashtags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hashtag TEXT NOT NULL UNIQUE,
  count INTEGER NOT NULL DEFAULT 1,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.trending_hashtags ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Trending hashtags are publicly readable"
ON public.trending_hashtags
FOR SELECT
USING (true);

-- Create policy for authenticated users to insert/update
CREATE POLICY "Authenticated users can manage trending hashtags"
ON public.trending_hashtags
FOR ALL
USING (auth.role() = 'authenticated');

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_trending_hashtags_count ON public.trending_hashtags(count DESC);
CREATE INDEX IF NOT EXISTS idx_trending_hashtags_date ON public.trending_hashtags(date DESC);

-- Function to extract and update hashtags from posts
CREATE OR REPLACE FUNCTION public.update_trending_hashtags()
RETURNS void AS $$
DECLARE
  post_record RECORD;
  hashtag_matches TEXT[];
  hashtag TEXT;
BEGIN
  -- Clear existing data for today
  DELETE FROM public.trending_hashtags WHERE date = CURRENT_DATE;
  
  -- Extract hashtags from all recent posts (last 7 days)
  FOR post_record IN 
    SELECT content, headline, intent_tags 
    FROM public.posts 
    WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
    AND status = 'published'
  LOOP
    -- Extract hashtags from content using regex
    hashtag_matches := regexp_split_to_array(
      regexp_replace(
        COALESCE(post_record.content, '') || ' ' || COALESCE(post_record.headline, ''),
        '#([a-zA-Z0-9_]+)', 
        E'\\1|', 
        'g'
      ), 
      E'\\|'
    );
    
    -- Process each hashtag
    FOREACH hashtag IN ARRAY hashtag_matches
    LOOP
      IF hashtag != '' AND length(hashtag) > 1 THEN
        -- Insert or update hashtag count
        INSERT INTO public.trending_hashtags (hashtag, count, date)
        VALUES (lower(hashtag), 1, CURRENT_DATE)
        ON CONFLICT (hashtag) 
        DO UPDATE SET 
          count = trending_hashtags.count + 1,
          updated_at = now();
      END IF;
    END LOOP;
    
    -- Also process intent_tags if they exist
    IF post_record.intent_tags IS NOT NULL THEN
      FOREACH hashtag IN ARRAY post_record.intent_tags
      LOOP
        IF hashtag != '' AND length(hashtag) > 1 THEN
          INSERT INTO public.trending_hashtags (hashtag, count, date)
          VALUES (lower(hashtag), 1, CURRENT_DATE)
          ON CONFLICT (hashtag) 
          DO UPDATE SET 
            count = trending_hashtags.count + 1,
            updated_at = now();
        END IF;
      END LOOP;
    END IF;
  END LOOP;
  
  -- Add some sample trending hashtags if no real ones exist
  INSERT INTO public.trending_hashtags (hashtag, count, date) VALUES
    ('ai', 15, CURRENT_DATE),
    ('careergrowth', 12, CURRENT_DATE),
    ('leadership', 10, CURRENT_DATE),
    ('remotework', 8, CURRENT_DATE),
    ('innovation', 7, CURRENT_DATE),
    ('productivity', 6, CURRENT_DATE),
    ('networking', 5, CURRENT_DATE),
    ('technology', 4, CURRENT_DATE),
    ('skillsdevelopment', 3, CURRENT_DATE),
    ('futureofwork', 2, CURRENT_DATE)
  ON CONFLICT (hashtag) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Execute the function to populate initial data
SELECT public.update_trending_hashtags();

-- Create trigger to automatically update timestamps
CREATE OR REPLACE FUNCTION public.update_trending_hashtags_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_trending_hashtags_updated_at_trigger
BEFORE UPDATE ON public.trending_hashtags
FOR EACH ROW
EXECUTE FUNCTION public.update_trending_hashtags_updated_at();