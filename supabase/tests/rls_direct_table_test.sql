-- Test direct table SELECT permissions under RLS
SELECT
  'Direct Table Query' AS check_name,
  count(*) as total_posts_in_test_range
FROM public.posts
WHERE id LIKE 'a1111111-0000-0000-0000-00000000000%';
