-- First, ensure all articles have unique slugs before adding constraint
UPDATE news_articles 
SET slug = LOWER(REPLACE(REPLACE(title, ' ', '-'), '''', '')) || '-' || id::text 
WHERE slug IS NULL OR slug = '';

-- Add slug column if it doesn't exist (check first)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'news_articles' AND column_name = 'slug') THEN
    ALTER TABLE news_articles ADD COLUMN slug text;
  END IF;
END $$;

-- Update empty slugs with unique values
UPDATE news_articles 
SET slug = LOWER(REPLACE(REPLACE(title, ' ', '-'), '''', '')) || '-' || id::text 
WHERE slug IS NULL OR slug = '';

-- Now add unique constraint
ALTER TABLE news_articles ADD CONSTRAINT news_articles_slug_unique UNIQUE (slug);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_news_articles_slug ON news_articles(slug);