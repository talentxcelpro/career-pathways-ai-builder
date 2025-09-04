-- Create missing RPC function for unified analytics
CREATE OR REPLACE FUNCTION public.get_unified_analytics()
RETURNS TABLE(
  id uuid,
  title text,
  company_name text,
  job_status text,
  is_active boolean,
  expires_at timestamp with time zone,
  is_featured boolean,
  is_government_job boolean
) 
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    j.id,
    j.title,
    COALESCE(c.name, j.company_name) as company_name,
    j.job_status,
    j.is_active,
    j.expires_at,
    j.is_featured,
    COALESCE(j.is_government_job, false) as is_government_job
  FROM jobs j
  LEFT JOIN companies c ON j.company_id = c.id;
$$;

-- Create function to get user growth data
CREATE OR REPLACE FUNCTION public.get_user_growth_data()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT jsonb_build_object(
    'daily_growth', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'date', date_trunc('day', created_at)::date,
          'users', count(*)
        )
      )
      FROM profiles 
      WHERE created_at >= now() - interval '30 days'
      GROUP BY date_trunc('day', created_at)
      ORDER BY date_trunc('day', created_at)
    ),
    'total_users', (SELECT count(*) FROM profiles)
  );
$$;

-- Create function to get recent activity
CREATE OR REPLACE FUNCTION public.get_recent_activity()
RETURNS TABLE(
  id uuid,
  activity_type text,
  description text,
  created_at timestamp with time zone,
  user_name text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    gen_random_uuid() as id,
    'user_registration' as activity_type,
    'New user registered: ' || COALESCE(full_name, 'Unknown') as description,
    created_at,
    COALESCE(full_name, 'Unknown') as user_name
  FROM profiles 
  WHERE created_at >= now() - interval '7 days'
  ORDER BY created_at DESC
  LIMIT 50;
$$;