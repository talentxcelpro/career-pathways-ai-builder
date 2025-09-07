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

-- Insert sample trending hashtags
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