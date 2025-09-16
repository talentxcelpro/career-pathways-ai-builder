ALTER TABLE news_articles ADD COLUMN slug text UNIQUE;
CREATE INDEX idx_news_articles_slug ON news_articles(slug);
UPDATE news_articles SET slug = LOWER(REPLACE(REPLACE(title, ' ', '-'), '''', '')) WHERE slug IS NULL;