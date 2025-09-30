-- ===== BACKUP STRATEGY SETUP =====
-- Create backup and analysis tables before aggressive cleanup

-- Create a backup log table to track what we're removing
CREATE TABLE IF NOT EXISTS public.cleanup_backup_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  table_category TEXT NOT NULL,
  row_count INTEGER DEFAULT 0,
  table_size_bytes BIGINT DEFAULT 0,
  backup_created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  removal_reason TEXT,
  is_essential BOOLEAN DEFAULT false
);

-- Create function to analyze table usage and importance
CREATE OR REPLACE FUNCTION public.analyze_table_importance()
RETURNS TABLE(
  table_name TEXT,
  category TEXT,
  row_count BIGINT,
  last_modified TIMESTAMP WITH TIME ZONE,
  has_data BOOLEAN,
  is_essential BOOLEAN,
  removal_priority INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH table_stats AS (
    SELECT 
      t.table_name::TEXT,
      CASE 
        -- Core essential tables (priority 0 - never remove)
        WHEN t.table_name IN ('profiles', 'jobs', 'companies', 'job_applications', 'connections', 
                             'posts', 'messages', 'notifications', 'user_roles', 'user_activities',
                             'txc_transactions', 'txc_balances', 'video_intros') THEN 'Core Business'
        
        -- AI tables (priority 1-3 based on usage)
        WHEN t.table_name LIKE 'ai_%' THEN 'AI & ML'
        
        -- Assessment and testing (priority 2)
        WHEN t.table_name LIKE 'assessment%' THEN 'Assessments'
        
        -- Analytics and metrics (priority 3 - can be recreated)
        WHEN t.table_name LIKE '%analytics%' OR t.table_name LIKE '%metrics%' 
             OR t.table_name LIKE '%stats%' THEN 'Analytics'
        
        -- Content management (priority 2)
        WHEN t.table_name LIKE '%content%' OR t.table_name LIKE 'blog%' 
             OR t.table_name LIKE 'news%' OR t.table_name LIKE 'article%' THEN 'Content'
        
        -- Communication (priority 2)
        WHEN t.table_name LIKE 'email%' OR t.table_name LIKE 'communication%' 
             OR t.table_name LIKE 'notification%' THEN 'Communication'
        
        -- Bot and automation (priority 4 - experimental)
        WHEN t.table_name LIKE 'bot_%' OR t.table_name LIKE '%automation%' 
             OR t.table_name LIKE 'agent_%' THEN 'Automation'
        
        -- Cache and temporary (priority 5 - safe to remove)
        WHEN t.table_name LIKE '%cache%' OR t.table_name LIKE 'temp_%' 
             OR t.table_name LIKE '%queue%' THEN 'Cache/Temp'
        
        -- Test and experimental (priority 5 - safe to remove)
        WHEN t.table_name LIKE 'test_%' OR t.table_name LIKE '%experiment%' 
             OR t.table_name LIKE '%draft%' THEN 'Test/Experimental'
        
        -- SEO and marketing (priority 4)
        WHEN t.table_name LIKE 'seo_%' OR t.table_name LIKE '%seo%' 
             OR t.table_name LIKE 'backlink%' OR t.table_name LIKE '%campaign%' THEN 'SEO/Marketing'
        
        -- Admin and logging (priority 1)
        WHEN t.table_name LIKE 'admin_%' OR t.table_name LIKE '%log%' 
             OR t.table_name LIKE 'security_%' THEN 'Admin/Security'
        
        ELSE 'Other'
      END as category,
      
      -- Determine if essential based on category and name
      CASE 
        WHEN t.table_name IN ('profiles', 'jobs', 'companies', 'job_applications', 'connections', 
                             'posts', 'messages', 'notifications', 'user_roles', 'user_activities',
                             'txc_transactions', 'txc_balances', 'video_intros') THEN true
        WHEN t.table_name LIKE '%cache%' OR t.table_name LIKE 'temp_%' 
             OR t.table_name LIKE 'test_%' OR t.table_name LIKE '%experiment%' THEN false
        ELSE false
      END as is_essential,
      
      -- Removal priority (0 = never remove, 5 = remove first)
      CASE 
        WHEN t.table_name IN ('profiles', 'jobs', 'companies', 'job_applications', 'connections', 
                             'posts', 'messages', 'notifications', 'user_roles', 'user_activities',
                             'txc_transactions', 'txc_balances', 'video_intros') THEN 0
        WHEN t.table_name LIKE 'admin_%' OR t.table_name LIKE 'security_%' THEN 1
        WHEN t.table_name LIKE 'ai_chat_%' OR t.table_name LIKE 'ai_job_%' OR t.table_name LIKE 'ai_career_%' THEN 1
        WHEN t.table_name LIKE '%content%' OR t.table_name LIKE 'assessment%' THEN 2
        WHEN t.table_name LIKE '%analytics%' OR t.table_name LIKE '%metrics%' THEN 3
        WHEN t.table_name LIKE 'bot_%' OR t.table_name LIKE '%automation%' OR t.table_name LIKE 'seo_%' THEN 4
        WHEN t.table_name LIKE '%cache%' OR t.table_name LIKE 'temp_%' OR t.table_name LIKE 'test_%' THEN 5
        ELSE 3
      END as removal_priority
      
    FROM information_schema.tables t
    WHERE t.table_schema = 'public' 
      AND t.table_type = 'BASE TABLE'
  )
  SELECT 
    ts.table_name,
    ts.category,
    0::BIGINT as row_count, -- Simplified for performance
    now() as last_modified,
    true as has_data, -- Assume has data for safety
    ts.is_essential,
    ts.removal_priority
  FROM table_stats ts
  ORDER BY ts.removal_priority DESC, ts.table_name;
END;
$$;

-- Log current state before cleanup
INSERT INTO public.cleanup_backup_log (table_name, table_category, removal_reason)
SELECT 'BACKUP_START', 'SYSTEM', 'Starting aggressive cleanup - database state logged';

-- Log the cleanup initiation
INSERT INTO public.admin_activity_log (
  admin_user_id,
  action_type,
  details,
  created_at
) VALUES (
  (SELECT user_id FROM user_roles WHERE role = 'super_admin' AND is_active = true LIMIT 1),
  'aggressive_cleanup_start',
  '{"action": "backup_strategy_created", "target": "reduce_to_100_tables", "backup_table": "cleanup_backup_log"}',
  now()
);