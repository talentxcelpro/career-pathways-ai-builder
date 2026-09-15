-- Migration 7: Claim #1 Rich Entity Profiles (Logos, Social Links, Company Details)
-- Adds rich non-mandatory metadata to claim1_entities

ALTER TABLE claim1_entities
  ADD COLUMN IF NOT EXISTS tagline TEXT,
  ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS company_size TEXT,
  ADD COLUMN IF NOT EXISTS founded_year INTEGER,
  ADD COLUMN IF NOT EXISTS industry_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS city TEXT;

-- Update stored procedure claim1_claim_profile to accept rich profile metadata
CREATE OR REPLACE FUNCTION claim1_claim_profile(
  p_user_id           UUID,
  p_name              TEXT,
  p_slug              TEXT,
  p_entity_type       TEXT DEFAULT 'company',
  p_website_url       TEXT DEFAULT NULL,
  p_logo_url          TEXT DEFAULT NULL,
  p_description       TEXT DEFAULT NULL,
  p_country_code      TEXT DEFAULT NULL,
  p_country_name      TEXT DEFAULT NULL,
  p_scope_slugs       TEXT[] DEFAULT ARRAY['global']::TEXT[],
  p_tagline           TEXT DEFAULT NULL,
  p_social_links      JSONB DEFAULT '{}'::jsonb,
  p_company_size      TEXT DEFAULT NULL,
  p_founded_year      INTEGER DEFAULT NULL,
  p_industry_tags     TEXT[] DEFAULT ARRAY[]::TEXT[],
  p_city              TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_entity_id         UUID;
  v_entity            RECORD;
  v_founding_count    INTEGER;
  v_is_founding       BOOLEAN := false;
  v_slot_assigned     INTEGER := NULL;
  v_cat_id            UUID;
  v_scope_slug        TEXT;
  v_scope_id          UUID;
  v_listing_id        UUID;
  v_listing_ids       UUID[] := ARRAY[]::UUID[];
  v_listing_count     INTEGER;
BEGIN
  -- 1. Ensure AI Products category exists
  SELECT id INTO v_cat_id FROM claim1_categories WHERE slug = 'ai-products';
  IF NOT FOUND THEN
    INSERT INTO claim1_categories (name, slug, description, icon, starting_bid_amount, min_increment_amount, standard_platform_fee_pct, founding_platform_fee_pct, default_currency)
    VALUES ('AI Products', 'ai-products', 'Competitive leaderboard for AI products and companies.', 'Brain', 500.00, 100.00, 10.00, 5.00, 'INR')
    RETURNING id INTO v_cat_id;
  END IF;

  -- 2. Check Founding 100 availability
  SELECT COUNT(*) INTO v_founding_count FROM claim1_entities WHERE is_founding_100 = true;
  IF v_founding_count < 100 THEN
    v_is_founding := true;
    v_slot_assigned := v_founding_count + 1;
  END IF;

  -- 3. Upsert Entity
  INSERT INTO claim1_entities (
    owner_user_id, entity_type, name, slug, website_url, logo_url, description, country_code, country_name,
    is_founding_100, founding_fee_locked, founding_100_slot,
    tagline, social_links, company_size, founded_year, industry_tags, city
  ) VALUES (
    p_user_id, p_entity_type, p_name, p_slug, p_website_url, p_logo_url, p_description, p_country_code, p_country_name,
    v_is_founding, v_is_founding, v_slot_assigned,
    p_tagline, p_social_links, p_company_size, p_founded_year, p_industry_tags, p_city
  )
  ON CONFLICT (slug) DO UPDATE SET
    owner_user_id = CASE WHEN claim1_entities.owner_user_id IS NULL THEN p_user_id ELSE claim1_entities.owner_user_id END,
    name = EXCLUDED.name,
    website_url = COALESCE(EXCLUDED.website_url, claim1_entities.website_url),
    logo_url = COALESCE(EXCLUDED.logo_url, claim1_entities.logo_url),
    description = COALESCE(EXCLUDED.description, claim1_entities.description),
    country_code = COALESCE(EXCLUDED.country_code, claim1_entities.country_code),
    country_name = COALESCE(EXCLUDED.country_name, claim1_entities.country_name),
    tagline = COALESCE(EXCLUDED.tagline, claim1_entities.tagline),
    social_links = COALESCE(EXCLUDED.social_links, claim1_entities.social_links),
    company_size = COALESCE(EXCLUDED.company_size, claim1_entities.company_size),
    founded_year = COALESCE(EXCLUDED.founded_year, claim1_entities.founded_year),
    industry_tags = COALESCE(EXCLUDED.industry_tags, claim1_entities.industry_tags),
    city = COALESCE(EXCLUDED.city, claim1_entities.city),
    updated_at = now()
  RETURNING id INTO v_entity_id;

  SELECT * INTO v_entity FROM claim1_entities WHERE id = v_entity_id;

  -- 4. Create or Ensure Listings for each requested scope
  FOREACH v_scope_slug IN ARRAY p_scope_slugs
  LOOP
    SELECT id INTO v_scope_id FROM claim1_scopes WHERE slug = v_scope_slug OR id::text = v_scope_slug;
    
    IF NOT FOUND THEN
      INSERT INTO claim1_scopes (category_id, scope_type, slug, country_name, is_active)
      VALUES (
        v_cat_id,
        CASE WHEN v_scope_slug = 'global' THEN 'global' WHEN v_scope_slug = 'emerging' THEN 'emerging' ELSE 'country' END,
        v_scope_slug,
        CASE WHEN v_scope_slug = 'global' THEN NULL WHEN v_scope_slug = 'emerging' THEN NULL ELSE initcap(v_scope_slug) END,
        true
      )
      RETURNING id INTO v_scope_id;
    END IF;

    SELECT COUNT(*) INTO v_listing_count FROM claim1_listings WHERE scope_id = v_scope_id AND status = 'active';

    INSERT INTO claim1_listings (entity_id, scope_id, status, current_bid_amount, currency, current_rank)
    VALUES (v_entity_id, v_scope_id, 'active', 0.00, 'INR', v_listing_count + 1)
    ON CONFLICT (entity_id, scope_id) DO UPDATE SET
      status = 'active',
      current_rank = COALESCE(claim1_listings.current_rank, v_listing_count + 1),
      updated_at = now()
    RETURNING id INTO v_listing_id;

    v_listing_ids := array_append(v_listing_ids, v_listing_id);
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'entity', row_to_json(v_entity),
    'listing_ids', v_listing_ids
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM, 'detail', SQLSTATE);
END;
$$;
