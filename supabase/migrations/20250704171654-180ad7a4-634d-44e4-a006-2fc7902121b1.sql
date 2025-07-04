-- Add missing privacy column
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_viewing_private boolean DEFAULT false;