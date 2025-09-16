-- Add slug column to news_articles table
ALTER TABLE news_articles ADD COLUMN slug text;

-- Update all articles with unique slugs
UPDATE news_articles 
SET slug = LOWER(REPLACE(REPLACE(title, ' ', '-'), '''', '')) || '-' || EXTRACT(epoch FROM created_at)::text 
WHERE slug IS NULL;

-- Add unique constraint
ALTER TABLE news_articles ADD CONSTRAINT news_articles_slug_unique UNIQUE (slug);

-- Create index for performance
CREATE INDEX idx_news_articles_slug ON news_articles(slug);