-- Fix nullable columns that should not be nullable for proper RLS security
ALTER TABLE public.posts 
ALTER COLUMN author_id SET NOT NULL;

ALTER TABLE public.connections 
ALTER COLUMN requester_id SET NOT NULL,
ALTER COLUMN recipient_id SET NOT NULL;