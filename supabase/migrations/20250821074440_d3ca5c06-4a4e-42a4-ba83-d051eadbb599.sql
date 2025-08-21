-- Create function to get recent posts for debugging
CREATE OR REPLACE FUNCTION public.get_recent_posts(limit_count integer DEFAULT 10)
RETURNS TABLE (
  id uuid,
  content text,
  created_at timestamp with time zone,
  author_id uuid,
  updated_at timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    p.id,
    p.content,
    p.created_at,
    p.author_id,
    p.updated_at
  FROM public.posts p
  ORDER BY p.created_at DESC
  LIMIT limit_count;
$$;

-- Ensure posts table has proper created_at default
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'posts' AND column_name = 'created_at') THEN
    ALTER TABLE public.posts 
    ALTER COLUMN created_at SET DEFAULT now();
  END IF;
END $$;