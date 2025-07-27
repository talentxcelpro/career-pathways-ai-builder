-- Add constraints and indexes to improve connection request functionality

-- Add unique constraint to prevent duplicate connection requests (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'connections' 
        AND indexname = 'unique_connection_pair'
    ) THEN
        CREATE UNIQUE INDEX unique_connection_pair 
        ON public.connections (
          LEAST(requester_id, recipient_id), 
          GREATEST(requester_id, recipient_id)
        ) WHERE status IN ('pending', 'accepted');
    END IF;
END $$;

-- Add check constraint to prevent self-connections (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'check_no_self_connection' 
        AND table_name = 'connections'
    ) THEN
        ALTER TABLE public.connections 
        ADD CONSTRAINT check_no_self_connection 
        CHECK (requester_id != recipient_id);
    END IF;
END $$;

-- Create indexes for better performance (if not exists)
CREATE INDEX IF NOT EXISTS idx_connections_recipient_status 
ON public.connections (recipient_id, status);

CREATE INDEX IF NOT EXISTS idx_connections_requester_status 
ON public.connections (requester_id, status);