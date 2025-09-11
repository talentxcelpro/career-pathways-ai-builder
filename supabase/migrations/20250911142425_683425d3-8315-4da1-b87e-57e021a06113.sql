-- Fix news_articles table schema
ALTER TABLE news_articles 
ADD COLUMN IF NOT EXISTS summary text,
ADD COLUMN IF NOT EXISTS description text;

-- Update existing records with fallback content
UPDATE news_articles 
SET summary = COALESCE(summary, LEFT(content, 200) || '...')
WHERE summary IS NULL AND content IS NOT NULL;

-- Add missing indexes for performance
CREATE INDEX IF NOT EXISTS idx_news_articles_status_published ON news_articles(status, published_at) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_news_articles_category ON news_articles(category);

-- Ensure posts table has proper reshare support
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS original_post_id uuid REFERENCES posts(id),
ADD COLUMN IF NOT EXISTS post_type text DEFAULT 'original',
ADD COLUMN IF NOT EXISTS shares_count integer DEFAULT 0;

-- Create reshares view for better performance
CREATE OR REPLACE VIEW post_reshares AS
SELECT 
  p.*,
  op.content as original_content,
  op.author_id as original_author_id,
  profiles.full_name as original_author_name
FROM posts p
LEFT JOIN posts op ON p.original_post_id = op.id  
LEFT JOIN profiles ON op.author_id = profiles.id
WHERE p.post_type = 'reshare';