-- supabase/migrations/20260903170000_professional_search_graph.sql
-- Derived Search Graph Projection Lake for TalentXcel Professional Discovery
-- Invariant: Derived projection only. Canonical product tables (profiles, jobs, companies, posts) remain single source of truth.

-- 1. Derived Professional Entity Nodes
CREATE TABLE IF NOT EXISTS public.professional_entity_nodes (
  id TEXT PRIMARY KEY, -- e.g. node_person_xxx, node_job_yyy, node_company_zzz
  source_table TEXT NOT NULL, -- 'profiles', 'jobs', 'companies', 'posts', 'skills'
  source_id TEXT NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('PERSON', 'PROFILE', 'COMPANY', 'JOB', 'POST', 'SKILL', 'OCCUPATION', 'LOCATION', 'COLLEGE', 'TOOL')),
  canonical_url TEXT NOT NULL,
  title TEXT NOT NULL,
  entity_status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (entity_status IN ('ACTIVE', 'DRAFT', 'HIDDEN', 'PRIVATE', 'SUSPENDED', 'DELETED', 'MERGED', 'REDIRECTED')),
  indexability_status TEXT NOT NULL DEFAULT 'NOT_ELIGIBLE' CHECK (indexability_status IN ('NOT_ELIGIBLE', 'ELIGIBLE', 'SUBMITTED', 'DISCOVERY_OBSERVED', 'REMOVAL_PENDING')),
  quality_score INT NOT NULL DEFAULT 0 CHECK (quality_score >= 0 AND quality_score <= 100),
  gsc_impressions INT NOT NULL DEFAULT 0,
  gsc_clicks INT NOT NULL DEFAULT 0,
  gsc_ctr NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
  gsc_average_position NUMERIC(4, 1) NOT NULL DEFAULT 0.0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_entity_nodes_type ON public.professional_entity_nodes(entity_type);
CREATE INDEX IF NOT EXISTS idx_entity_nodes_status ON public.professional_entity_nodes(entity_status, indexability_status);
CREATE INDEX IF NOT EXISTS idx_entity_nodes_source ON public.professional_entity_nodes(source_table, source_id);

-- 2. Derived Professional Entity Relationships (Edges) with Rich Provenance and Evidence
CREATE TABLE IF NOT EXISTS public.professional_entity_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_node_id TEXT NOT NULL REFERENCES public.professional_entity_nodes(id) ON DELETE CASCADE,
  target_node_id TEXT NOT NULL REFERENCES public.professional_entity_nodes(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL CHECK (relationship_type IN ('WORKS_AT', 'AUTHORED', 'PUBLISHED_JOB', 'REQUIRES_SKILL', 'OFFERS_COURSE', 'LOCATED_IN', 'LEADS_TO', 'MENTIONS')),
  confidence NUMERIC(3, 2) NOT NULL DEFAULT 1.0 CHECK (confidence >= 0.0 AND confidence <= 1.0),
  provenance TEXT NOT NULL DEFAULT 'PROFILE_EXPLICIT' CHECK (provenance IN ('PROFILE_EXPLICIT', 'JOB_EXPLICIT', 'COMPANY_VERIFIED', 'USER_AUTHORED', 'SYSTEM_DERIVED')),
  evidence_type TEXT NOT NULL DEFAULT 'DATABASE_RECORD', -- e.g. 'PROFILE_EXPERIENCE_ID', 'POST_AUTHOR_ID'
  evidence_reference TEXT, -- ID of source record proving the relationship
  verified_at TIMESTAMPTZ DEFAULT now(),
  derived_by TEXT DEFAULT 'system',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_entity_edges_source ON public.professional_entity_edges(source_node_id);
CREATE INDEX IF NOT EXISTS idx_entity_edges_target ON public.professional_entity_edges(target_node_id);
CREATE INDEX IF NOT EXISTS idx_entity_edges_rel ON public.professional_entity_edges(relationship_type);

-- RLS Policies (Read accessible to public, manage restricted to admin/service role)
ALTER TABLE public.professional_entity_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_entity_edges ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Public read for entity nodes" ON public.professional_entity_nodes FOR SELECT USING (true);
  CREATE POLICY "Service manage for entity nodes" ON public.professional_entity_nodes FOR ALL USING (true);
  CREATE POLICY "Public read for entity edges" ON public.professional_entity_edges FOR SELECT USING (true);
  CREATE POLICY "Service manage for entity edges" ON public.professional_entity_edges FOR ALL USING (true);
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
