-- supabase/migrations/20261117140000_master_50k_global_seo_engine.sql
-- Master 50,000-Keyword Global Programmatic SEO & PLG Engine Schema
-- Implements taxonomy registry, strict canonical & uniqueness guards, and indexing outbox integration

BEGIN;

CREATE TABLE IF NOT EXISTS public.seo_keyword_hubs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  vertical text NOT NULL CHECK (vertical IN (
    'salary', 
    'jobs_visa', 
    'resume_cv', 
    'ats_check', 
    'career_paths', 
    'network_topics', 
    'colleges', 
    'learning', 
    'talent_passport', 
    'communities_reels', 
    'ca_legal'
  )),
  target_url text NOT NULL UNIQUE,
  canonical_url text NOT NULL,
  role text,
  city text,
  country_code text NOT NULL DEFAULT 'IN',
  currency text NOT NULL DEFAULT 'INR',
  search_intent text NOT NULL,
  title text NOT NULL,
  meta_description text NOT NULL,
  plg_widget_type text NOT NULL CHECK (plg_widget_type IN (
    'salary_benchmark',
    'ats_scanner',
    'network_discussion',
    'compliance_checklist',
    'passport_preview'
  )),
  can_index boolean NOT NULL DEFAULT false,
  word_count int NOT NULL DEFAULT 0,
  live_entity_count int NOT NULL DEFAULT 0,
  similarity_hash text,
  hreflang_tags jsonb DEFAULT '[]'::jsonb,
  priority numeric(3,2) NOT NULL DEFAULT 0.80,
  is_dispatched boolean NOT NULL DEFAULT false,
  dispatched_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for ultra-fast sitemap generation, bot rendering, and wave dispatching
CREATE INDEX IF NOT EXISTS idx_seo_keyword_hubs_vertical ON public.seo_keyword_hubs (vertical);
CREATE INDEX IF NOT EXISTS idx_seo_keyword_hubs_can_index ON public.seo_keyword_hubs (can_index, priority DESC) WHERE can_index = true;
CREATE INDEX IF NOT EXISTS idx_seo_keyword_hubs_dispatch ON public.seo_keyword_hubs (is_dispatched, can_index, priority DESC);
CREATE INDEX IF NOT EXISTS idx_seo_keyword_hubs_slug ON public.seo_keyword_hubs (slug);

-- Enable RLS with public read access
ALTER TABLE public.seo_keyword_hubs ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'seo_keyword_hubs' AND policyname = 'Public read access for seo_keyword_hubs'
  ) THEN
    CREATE POLICY "Public read access for seo_keyword_hubs" 
      ON public.seo_keyword_hubs 
      FOR SELECT 
      USING (true);
  END IF;
END $$;

COMMIT;
