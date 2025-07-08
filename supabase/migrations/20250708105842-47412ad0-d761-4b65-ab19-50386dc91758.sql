-- Fix notifications table constraint issue by updating the module constraint
-- Drop the existing constraint if it exists
ALTER TABLE public.notifications 
DROP CONSTRAINT IF EXISTS notifications_module_check;

-- Add the correct constraint with all valid modules
ALTER TABLE public.notifications 
ADD CONSTRAINT notifications_module_check 
CHECK (module IN ('network', 'jobs', 'resume', 'tools', 'companies', 'learning', 'career_map', 'employer', 'admin', 'system', 'profile'));

-- Update any notifications with invalid modules to have a valid module
UPDATE public.notifications 
SET module = 'system' 
WHERE module IS NOT NULL 
AND module NOT IN ('network', 'jobs', 'resume', 'tools', 'companies', 'learning', 'career_map', 'employer', 'admin', 'system', 'profile');