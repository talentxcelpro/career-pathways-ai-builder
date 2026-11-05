-- ============================================================================
-- RLS POLICY LOGIC CHECK ON get_network_feed_v2
-- Tests which test posts each perspective receives:
-- 1. Anonymous User (p_user_id IS NULL)
-- 2. Unrelated Authenticated User ('1d3d21b8-cf66-4bd9-a47f-d28c480c63c0')
-- 3. Accepted Connection ('887f9eba-02e9-477d-98b4-481ce259762c')
-- 4. Post Author ('ad20dfcb-bbbd-45d6-ac25-38b473e73eaf')
-- ============================================================================

SELECT 
  'Anonymous User' AS perspective,
  jsonb_agg(item->>'content') AS visible_posts,
  count(*) AS total_visible
FROM jsonb_array_elements(public.get_network_feed_v2(NULL, 100, 0, 'all', 'Post ')) item
WHERE item->>'id' LIKE 'a1111111-0000-0000-0000-00000000000%'

UNION ALL

SELECT 
  'Unrelated User' AS perspective,
  jsonb_agg(item->>'content') AS visible_posts,
  count(*) AS total_visible
FROM jsonb_array_elements(public.get_network_feed_v2('1d3d21b8-cf66-4bd9-a47f-d28c480c63c0'::uuid, 100, 0, 'all', 'Post ')) item
WHERE item->>'id' LIKE 'a1111111-0000-0000-0000-00000000000%'

UNION ALL

SELECT 
  'Accepted Connection' AS perspective,
  jsonb_agg(item->>'content') AS visible_posts,
  count(*) AS total_visible
FROM jsonb_array_elements(public.get_network_feed_v2('887f9eba-02e9-477d-98b4-481ce259762c'::uuid, 100, 0, 'all', 'Post ')) item
WHERE item->>'id' LIKE 'a1111111-0000-0000-0000-00000000000%'

UNION ALL

SELECT 
  'Post Author' AS perspective,
  jsonb_agg(item->>'content') AS visible_posts,
  count(*) AS total_visible
FROM jsonb_array_elements(public.get_network_feed_v2('ad20dfcb-bbbd-45d6-ac25-38b473e73eaf'::uuid, 100, 0, 'all', 'Post ')) item
WHERE item->>'id' LIKE 'a1111111-0000-0000-0000-00000000000%';
