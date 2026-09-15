-- Migration: Claim #1 Seed Data
-- Creates the initial "AI Products" category with 9 geographic scopes

INSERT INTO claim1_categories (name, slug, description, icon, starting_bid_txc, min_increment_txc, platform_fee_pct, txc_to_usd_rate)
VALUES (
  'AI Products',
  'ai-products',
  'Compete to be the #1 AI Product globally, by country, and in the emerging category.',
  'Brain',
  100,   -- 100 TXC to enter
  10,    -- minimum 10 TXC raise
  10.00, -- 10% platform fee
  0.01   -- 1 TXC ≈ $0.01 USD (display only)
)
ON CONFLICT (slug) DO NOTHING;

-- Insert all scopes for AI Products
WITH cat AS (
  SELECT id FROM claim1_categories WHERE slug = 'ai-products'
)
INSERT INTO claim1_scopes (category_id, scope_type, country_code, country_name, slug)
SELECT cat.id, s.scope_type, s.cc, s.cn, s.slug
FROM cat,
(VALUES
  ('global',   NULL, NULL,             'global'),
  ('emerging', NULL, NULL,             'emerging'),
  ('country',  'IN', 'India',          'india'),
  ('country',  'US', 'United States',  'usa'),
  ('country',  'AE', 'UAE',            'uae'),
  ('country',  'GB', 'United Kingdom', 'uk'),
  ('country',  'SG', 'Singapore',      'singapore'),
  ('country',  'CA', 'Canada',         'canada'),
  ('country',  'AU', 'Australia',      'australia')
) AS s(scope_type, cc, cn, slug)
ON CONFLICT (category_id, slug) DO NOTHING;
