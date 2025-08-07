-- Check what triggers are still active on the profiles table
SELECT 
    trigger_name, 
    event_manipulation, 
    action_statement,
    action_timing,
    event_object_table 
FROM information_schema.triggers 
WHERE event_object_table = 'profiles';

-- Drop ALL career passport related triggers
DROP TRIGGER IF EXISTS trigger_create_career_passport ON public.profiles;
DROP TRIGGER IF EXISTS create_career_passport_trigger ON public.profiles;
DROP TRIGGER IF EXISTS career_passport_trigger ON public.profiles;

-- Drop the function that creates career passport if it exists
DROP FUNCTION IF EXISTS public.create_career_passport() CASCADE;