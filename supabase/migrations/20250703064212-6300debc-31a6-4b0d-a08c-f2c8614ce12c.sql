-- Add missing columns to posts table if they don't exist
DO $$ 
BEGIN
  -- Add media_urls column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'media_urls'
  ) THEN
    ALTER TABLE public.posts ADD COLUMN media_urls TEXT[];
  END IF;
  
  -- Add location column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'location'
  ) THEN
    ALTER TABLE public.posts ADD COLUMN location TEXT;
  END IF;
END $$;