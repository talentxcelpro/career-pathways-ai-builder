-- ============================================================================
-- RLS EVALUATION SCRIPT: TEST ACCESS ACROSS ROLES
-- ============================================================================

WITH test_post_ids AS (
  SELECT unnest(ARRAY[
    'a1111111-0000-0000-0000-000000000001'::uuid, -- 1. Public + published (SHOULD BE VISIBLE TO ALL)
    'a1111111-0000-0000-0000-000000000002'::uuid, -- 2. Private + published (ONLY AUTHOR)
    'a1111111-0000-0000-0000-000000000003'::uuid, -- 3. Connections + published (AUTHOR & CONNECTION)
    'a1111111-0000-0000-0000-000000000004'::uuid, -- 4. Public + draft (ONLY AUTHOR)
    'a1111111-0000-0000-0000-000000000005'::uuid, -- 5. Deleted + public (ONLY AUTHOR)
    'a1111111-0000-0000-0000-000000000006'::uuid, -- 6. is_public=true + visibility=private (ONLY AUTHOR)
    'a1111111-0000-0000-0000-000000000007'::uuid, -- 7. is_public=false + visibility=public (ONLY AUTHOR)
    'a1111111-0000-0000-0000-000000000008'::uuid  -- 8. Legacy NULL visibility (SHOULD BE VISIBLE TO ALL)
  ]) AS id
)
SELECT 
  p.id,
  p.content,
  p.status,
  p.visibility,
  p.is_public,
  p.is_deleted
FROM public.posts p
JOIN test_post_ids t ON t.id = p.id
ORDER BY p.id;
