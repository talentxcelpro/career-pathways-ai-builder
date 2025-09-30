-- Create function to remove duplicate profile views
CREATE OR REPLACE FUNCTION remove_duplicate_profile_views()
RETURNS TABLE(removed_count INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  duplicate_count INTEGER;
BEGIN
  -- Remove duplicate profile views, keeping only the most recent one per user-profile pair per day
  WITH duplicates AS (
    SELECT id,
           ROW_NUMBER() OVER (
             PARTITION BY viewer_id, profile_id, DATE(viewed_at) 
             ORDER BY viewed_at DESC
           ) as rn
    FROM profile_views
  )
  DELETE FROM profile_views 
  WHERE id IN (
    SELECT id FROM duplicates WHERE rn > 1
  );
  
  GET DIAGNOSTICS duplicate_count = ROW_COUNT;
  
  RETURN QUERY SELECT duplicate_count;
END;
$$;

-- Create indexes for cost optimization queries (without CONCURRENTLY in transaction)
CREATE INDEX IF NOT EXISTS idx_notifications_created_at_priority 
ON notifications(created_at, priority);

CREATE INDEX IF NOT EXISTS idx_security_events_created_at_type 
ON security_events(created_at, event_type);

CREATE INDEX IF NOT EXISTS idx_email_queue_status_created 
ON email_automation_queue(status, created_at);

-- Create function to get database size statistics
CREATE OR REPLACE FUNCTION get_table_sizes()
RETURNS TABLE(
  table_name TEXT,
  row_count BIGINT,
  size_mb NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.table_name::TEXT,
    COALESCE(t.n_tup_ins - t.n_tup_del, 0) as row_count,
    ROUND((pg_total_relation_size(c.oid) / 1024 / 1024.0)::numeric, 2) as size_mb
  FROM pg_stat_user_tables t
  JOIN pg_class c ON t.relname = c.relname
  WHERE t.schemaname = 'public'
  ORDER BY pg_total_relation_size(c.oid) DESC;
END;
$$;