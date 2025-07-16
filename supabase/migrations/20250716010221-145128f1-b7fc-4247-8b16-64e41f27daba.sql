-- Fix the missing foreign key relationship between pro_service_profiles and profiles tables
-- This will allow proper joining of services with user profiles

-- First check if the foreign key already exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_pro_service_profiles_user_id' 
        AND table_name = 'pro_service_profiles'
    ) THEN
        -- Add the foreign key constraint
        ALTER TABLE public.pro_service_profiles 
        ADD CONSTRAINT fk_pro_service_profiles_user_id 
        FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END $$;