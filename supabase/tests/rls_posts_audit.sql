-- ============================================================================
-- RLS POSTS AUDIT & VERIFICATION TEST HARNESS
-- Mission ID: TXC-NETWORK-ACCEPTANCE-002
-- Uses Real Registered Auth IDs:
-- Author: 'ad20dfcb-bbbd-45d6-ac25-38b473e73eaf'
-- Connected: '887f9eba-02e9-477d-98b4-481ce259762c'
-- Unrelated: '19c60fd7-f0a0-439a-8dc0-f0ee106aed5d'
-- ============================================================================

DO $$
DECLARE
  v_author_id UUID := 'ad20dfcb-bbbd-45d6-ac25-38b473e73eaf';
  v_connected_id UUID := '887f9eba-02e9-477d-98b4-481ce259762c';
  v_unrelated_id UUID := '19c60fd7-f0a0-439a-8dc0-f0ee106aed5d';

  v_post_1 UUID := 'a1111111-0000-0000-0000-000000000001'; -- 1. Public + published
  v_post_2 UUID := 'a1111111-0000-0000-0000-000000000002'; -- 2. Private + published
  v_post_3 UUID := 'a1111111-0000-0000-0000-000000000003'; -- 3. Connections-only + published
  v_post_4 UUID := 'a1111111-0000-0000-0000-000000000004'; -- 4. Public + draft
  v_post_5 UUID := 'a1111111-0000-0000-0000-000000000005'; -- 5. Deleted + public
  v_post_6 UUID := 'a1111111-0000-0000-0000-000000000006'; -- 6. is_public=true + visibility=private
  v_post_7 UUID := 'a1111111-0000-0000-0000-000000000007'; -- 7. is_public=false + visibility=public
  v_post_8 UUID := 'a1111111-0000-0000-0000-000000000008'; -- 8. Legacy NULL visibility + NULL is_public
BEGIN
  -- Cleanup any previous test posts
  DELETE FROM public.posts WHERE id IN (v_post_1, v_post_2, v_post_3, v_post_4, v_post_5, v_post_6, v_post_7, v_post_8);

  -- Ensure connection exists between author and connected user
  DELETE FROM public.connections WHERE (requester_id = v_author_id AND recipient_id = v_connected_id) OR (requester_id = v_connected_id AND recipient_id = v_author_id);
  INSERT INTO public.connections (id, requester_id, recipient_id, status, connected_at)
  VALUES (gen_random_uuid(), v_author_id, v_connected_id, 'accepted', now());

  -- 1. Public + published
  INSERT INTO public.posts (id, author_id, user_id, content, status, visibility, is_public, is_deleted)
  VALUES (v_post_1, v_author_id, v_author_id, 'Post 1: Public + Published', 'published', 'public', true, false);

  -- 2. Private + published
  INSERT INTO public.posts (id, author_id, user_id, content, status, visibility, is_public, is_deleted)
  VALUES (v_post_2, v_author_id, v_author_id, 'Post 2: Private + Published', 'published', 'private', false, false);

  -- 3. Connections-only + published
  INSERT INTO public.posts (id, author_id, user_id, content, status, visibility, is_public, is_deleted)
  VALUES (v_post_3, v_author_id, v_author_id, 'Post 3: Connections-only + Published', 'published', 'connections', false, false);

  -- 4. Public + draft
  INSERT INTO public.posts (id, author_id, user_id, content, status, visibility, is_public, is_deleted)
  VALUES (v_post_4, v_author_id, v_author_id, 'Post 4: Public + Draft', 'draft', 'public', true, false);

  -- 5. Deleted + public
  INSERT INTO public.posts (id, author_id, user_id, content, status, visibility, is_public, is_deleted)
  VALUES (v_post_5, v_author_id, v_author_id, 'Post 5: Deleted + Public', 'published', 'public', true, true);

  -- 6. is_public=true + visibility=private (CONFLICT SCENARIO: Must NOT leak!)
  INSERT INTO public.posts (id, author_id, user_id, content, status, visibility, is_public, is_deleted)
  VALUES (v_post_6, v_author_id, v_author_id, 'Post 6: is_public=true + visibility=private', 'published', 'private', true, false);

  -- 7. is_public=false + visibility=public (CONFLICT SCENARIO: Must NOT leak!)
  INSERT INTO public.posts (id, author_id, user_id, content, status, visibility, is_public, is_deleted)
  VALUES (v_post_7, v_author_id, v_author_id, 'Post 7: is_public=false + visibility=public', 'published', 'public', false, false);

  -- 8. Legacy NULL visibility + NULL is_public + published (Valid Legacy Public)
  INSERT INTO public.posts (id, author_id, user_id, content, status, visibility, is_public, is_deleted)
  VALUES (v_post_8, v_author_id, v_author_id, 'Post 8: Legacy NULL visibility', 'published', NULL, NULL, false);

END $$;
