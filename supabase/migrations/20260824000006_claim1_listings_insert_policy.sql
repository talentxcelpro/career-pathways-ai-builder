-- Migration 6: Claim #1 Listings Insert Policy & Atomic Profile Claim Procedure
-- Fixes RLS insert block on claim1_listings and provides atomic claim1_claim_profile() procedure

-- 1. Add INSERT policy for claim1_listings so entity owners can create initial listings
DROP POLICY IF EXISTS "claim1_listings_auth_insert" ON claim1_listings;
CREATE POLICY "claim1_listings_auth_insert"
  ON claim1_listings FOR INSERT
  WITH CHECK (
    entity_id IN (
      SELECT id FROM claim1_entities WHERE owner_user_id = auth.uid()
    )
  );

-- 2. Add UPDATE policy for entity owners on claim1_listings
DROP POLICY IF EXISTS "claim1_listings_auth_update" ON claim1_listings;
CREATE POLICY "claim1_listings_auth_update"
  ON claim1_listings FOR UPDATE
  USING (
    entity_id IN (
      SELECT id FROM claim1_entities WHERE owner_user_id = auth.uid()
    )
  );

-- 3. Atomic Stored Procedure to Claim Profile & Create Listings with zero RLS hurdles
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
  p_scope_slugs       TEXT[] DEFAULT ARRAY['global']::TEXT[]
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
    is_founding_100, founding_fee_locked, founding_100_slot
  ) VALUES (
    p_user_id, p_entity_type, p_name, p_slug, p_website_url, p_logo_url, p_description, p_country_code, p_country_name,
    v_is_founding, v_is_founding, v_slot_assigned
  )
  ON CONFLICT (slug) DO UPDATE SET
    owner_user_id = CASE WHEN claim1_entities.owner_user_id IS NULL THEN p_user_id ELSE claim1_entities.owner_user_id END,
    name = EXCLUDED.name,
    website_url = COALESCE(EXCLUDED.website_url, claim1_entities.website_url),
    logo_url = COALESCE(EXCLUDED.logo_url, claim1_entities.logo_url),
    description = COALESCE(EXCLUDED.description, claim1_entities.description),
    country_code = COALESCE(EXCLUDED.country_code, claim1_entities.country_code),
    country_name = COALESCE(EXCLUDED.country_name, claim1_entities.country_name),
    updated_at = now()
  RETURNING id INTO v_entity_id;

  SELECT * INTO v_entity FROM claim1_entities WHERE id = v_entity_id;

  -- 4. Create or Ensure Listings for each requested scope
  FOREACH v_scope_slug IN ARRAY p_scope_slugs
  LOOP
    -- Resolve scope by slug or ID
    SELECT id INTO v_scope_id FROM claim1_scopes WHERE slug = v_scope_slug OR id::text = v_scope_slug;
    
    -- If scope does not exist yet, auto-create it
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

    -- Upsert Listing
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

  -- 5. Auto-repair any existing entity listings that had 0 listings
  INSERT INTO claim1_activity (scope_id, event_type, listing_id, entity_id, headline, metadata)
  SELECT
    l.scope_id, 'entered', l.id, v_entity_id,
    v_entity.name || ' entered the leaderboard',
    jsonb_build_object('entity_slug', v_entity.slug, 'is_founding_100', v_entity.is_founding_100)
  FROM claim1_listings l
  WHERE l.entity_id = v_entity_id
  ON CONFLICT DO NOTHING;

  RETURN jsonb_build_object(
    'success', true,
    'entity', row_to_json(v_entity),
    'listing_ids', v_listing_ids
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM, 'detail', SQLSTATE);
END;
$$;

GRANT EXECUTE ON FUNCTION claim1_claim_profile TO authenticated, anon;

-- 4. Auto-Repair any existing entities without listings (e.g. 'talentxcel')
DO $$
DECLARE
  v_ent RECORD;
  v_sc RECORD;
  v_ct INTEGER;
BEGIN
  FOR v_ent IN SELECT * FROM claim1_entities LOOP
    FOR v_sc IN SELECT * FROM claim1_scopes WHERE is_active = true LOOP
      SELECT COUNT(*) INTO v_ct FROM claim1_listings WHERE scope_id = v_sc.id AND status = 'active';
      INSERT INTO claim1_listings (entity_id, scope_id, status, current_bid_amount, currency, current_rank)
      VALUES (v_ent.id, v_sc.id, 'active', 0.00, 'INR', v_ct + 1)
      ON CONFLICT (entity_id, scope_id) DO NOTHING;
    END LOOP;
  END LOOP;
END;
$$;
