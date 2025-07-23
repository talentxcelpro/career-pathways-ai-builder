
-- Add unique constraint on user_id in subscribers table to support upsert operations
ALTER TABLE public.subscribers ADD CONSTRAINT subscribers_user_id_unique UNIQUE (user_id);

-- Create index for better performance on user_id lookups
CREATE INDEX IF NOT EXISTS idx_subscribers_user_id_unique ON public.subscribers(user_id);
