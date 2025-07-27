-- Clean up duplicate connections and add constraints

-- First, let's clean up the duplicate connections
-- Keep the most recent connection for each pair
WITH duplicates AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (
      PARTITION BY LEAST(requester_id, recipient_id), GREATEST(requester_id, recipient_id)
      ORDER BY 
        CASE WHEN status = 'accepted' THEN 1 ELSE 2 END,  -- Prefer accepted connections
        created_at DESC  -- Then most recent
    ) as rn
  FROM public.connections 
  WHERE status IN ('pending', 'accepted')
)
DELETE FROM public.connections 
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Now add the unique constraint
CREATE UNIQUE INDEX unique_connection_pair 
ON public.connections (
  LEAST(requester_id, recipient_id), 
  GREATEST(requester_id, recipient_id)
) WHERE status IN ('pending', 'accepted');

-- Add check constraint to prevent self-connections
ALTER TABLE public.connections 
ADD CONSTRAINT check_no_self_connection 
CHECK (requester_id != recipient_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_connections_recipient_status 
ON public.connections (recipient_id, status);

CREATE INDEX IF NOT EXISTS idx_connections_requester_status 
ON public.connections (requester_id, status);