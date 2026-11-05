INSERT INTO public.posts (id, author_id, content, status) 
VALUES ('a1111111-0000-0000-0000-000000000099', 'ad20dfcb-bbbd-45d6-ac25-38b473e73eaf', 'Trigger Test', 'published');

SELECT author_id, user_id FROM public.posts WHERE id = 'a1111111-0000-0000-0000-000000000099';

DELETE FROM public.posts WHERE id = 'a1111111-0000-0000-0000-000000000099';
